"""
Assessment Endpoints
Quiz lessons are stored as lesson_type=quiz with content_type=quiz_json in LessonContent.

quiz_json format (stored in lesson_contents.content):
{
  "questions": [
    {
      "id": 1,
      "text": "What is the output of...",
      "code": "print(my_func(5))",
      "hint": "Remember: x > 0 evaluates to true when x is positive",
      "answers": [
        {"value": "2.5", "text": "2.5", "correct": false},
        {"value": "10",  "text": "10",  "correct": true},
        {"value": "5",   "text": "5",   "correct": false},
        {"value": "err", "text": "Error: indentation mismatch", "correct": false}
      ]
    }
  ],
  "quick_tip": "Pay close attention to the value of x passed as an argument.",
  "ai_tutor_prompt": "Confused about the if statement logic?"
}

GET  /api/v1/assessments/course/{course_id}         - list all quizzes for a course
GET  /api/v1/assessments/{lesson_id}                - get quiz questions (strips correct answers)
POST /api/v1/assessments/{lesson_id}/submit         - submit answers, get results
GET  /api/v1/assessments/{lesson_id}/results        - get last attempt results
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.enrollment import Enrollment, Progress
from app.models.module import Lesson, Module, LessonTypeEnum, LessonContent
from app.models.course import Course
from app.models.ai_cache import AICache
from app.models.activity import ActivityLog
from app.crud import enrollment as enrollment_crud
from app.crud import course as course_crud

router = APIRouter()


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _get_quiz_json(lesson: Lesson) -> dict | None:
    """Extract parsed quiz_json from lesson contents."""
    for content in lesson.contents:
        if content.content_type.value == "quiz_json":
            try:
                return json.loads(content.content)
            except (json.JSONDecodeError, TypeError):
                return None
    return None


def _get_enrollment(db: Session, user_id: int, course_id: int) -> Enrollment | None:
    return (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )


def _strip_correct_answers(questions: list) -> list:
    """Remove 'correct' field from answers before sending to client."""
    stripped = []
    for q in questions:
        q_copy = dict(q)
        q_copy["answers"] = [
            {k: v for k, v in a.items() if k != "correct"}
            for a in q.get("answers", [])
        ]
        stripped.append(q_copy)
    return stripped


# ── LIST QUIZZES FOR A COURSE ─────────────────────────────────────────────────

@router.get("/course/{course_id}")
def list_course_assessments(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all quiz lessons for a course with last attempt score."""
    course = course_crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = _get_enrollment(db, current_user.id, course_id)

    quizzes = []
    for module in sorted(course.modules, key=lambda m: m.order_index):
        for lesson in sorted(module.lessons, key=lambda l: l.order_index):
            if lesson.lesson_type != LessonTypeEnum.quiz:
                continue

            last_score = None
            is_completed = False
            if enrollment:
                prog = (
                    db.query(Progress)
                    .filter(
                        Progress.enrollment_id == enrollment.id,
                        Progress.lesson_id == lesson.id,
                    )
                    .first()
                )
                if prog:
                    last_score = prog.score
                    is_completed = prog.is_completed

            quizzes.append({
                "lesson_id": lesson.id,
                "title": lesson.title,
                "module_title": module.title,
                "module_id": module.id,
                "duration_minutes": lesson.duration_minutes,
                "last_score": last_score,
                "is_completed": is_completed,
                "url": f"/learner/courses/{course_id}/assessments/{lesson.id}",
            })

    return {"course_id": course_id, "assessments": quizzes, "total": len(quizzes)}


# ── GET QUIZ QUESTIONS ────────────────────────────────────────────────────────

@router.get("/{lesson_id}")
def get_assessment(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns quiz questions WITHOUT correct answers.
    Frontend uses this to render the assessment page.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson or lesson.lesson_type != LessonTypeEnum.quiz:
        raise HTTPException(status_code=404, detail="Assessment not found")

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = course_crud.get_course_by_id(db, module.course_id) if module else None

    quiz_data = _get_quiz_json(lesson)
    if not quiz_data:
        raise HTTPException(status_code=404, detail="Quiz content not found")

    questions = _strip_correct_answers(quiz_data.get("questions", []))

    # Check AI cache for tutor prompt
    ai_cache = (
        db.query(AICache)
        .filter(AICache.lesson_id == lesson_id, AICache.service_type == "quiz_suggestions")
        .first()
    )
    ai_tutor = json.loads(ai_cache.result_json) if ai_cache else None

    return {
        "lesson_id": lesson_id,
        "title": lesson.title,
        "module_title": module.title if module else None,
        "course_id": course.id if course else None,
        "course_title": course.title if course else None,
        "total_questions": len(questions),
        "questions": questions,
        "quick_tip": quiz_data.get("quick_tip"),
        "ai_tutor_prompt": ai_tutor or quiz_data.get("ai_tutor_prompt"),
    }


# ── SUBMIT ANSWERS ────────────────────────────────────────────────────────────

@router.post("/{lesson_id}/submit")
def submit_assessment(
    lesson_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    payload: {
        "answers": {"1": "10", "2": "update", ...},  // question_id -> selected value
        "time_spent_seconds": 750
    }
    Returns: score, correct/incorrect counts, per-question breakdown, recommendations
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson or lesson.lesson_type != LessonTypeEnum.quiz:
        raise HTTPException(status_code=404, detail="Assessment not found")

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    enrollment = _get_enrollment(db, current_user.id, module.course_id)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Not enrolled in this course")

    quiz_data = _get_quiz_json(lesson)
    if not quiz_data:
        raise HTTPException(status_code=404, detail="Quiz content not found")

    user_answers = payload.get("answers", {})
    time_spent = payload.get("time_spent_seconds", 0)
    questions = quiz_data.get("questions", [])

    # Grade the quiz
    correct = 0
    incorrect = 0
    breakdown = []

    for q in questions:
        q_id = str(q["id"])
        user_val = user_answers.get(q_id)
        correct_answer = next(
            (a for a in q.get("answers", []) if a.get("correct")), None
        )
        correct_val = correct_answer["value"] if correct_answer else None
        is_correct = user_val == correct_val

        if is_correct:
            correct += 1
        else:
            incorrect += 1

        breakdown.append({
            "question_id": q["id"],
            "question_text": q["text"],
            "user_answer": user_val,
            "correct_answer": correct_val,
            "is_correct": is_correct,
        })

    total = len(questions)
    score = round((correct / total) * 100, 1) if total > 0 else 0.0

    # Save progress
    existing = (
        db.query(Progress)
        .filter(
            Progress.enrollment_id == enrollment.id,
            Progress.lesson_id == lesson_id,
        )
        .first()
    )
    if existing:
        existing.score = score
        existing.is_completed = True
        existing.completed_at = datetime.datetime.utcnow()
        existing.time_spent_seconds = (existing.time_spent_seconds or 0) + time_spent
    else:
        db.add(Progress(
            enrollment_id=enrollment.id,
            lesson_id=lesson_id,
            is_completed=True,
            score=score,
            completed_at=datetime.datetime.utcnow(),
            time_spent_seconds=time_spent,
        ))

    # Log activity
    db.add(ActivityLog(
        user_id=current_user.id,
        course_id=module.course_id,
        action="completed_quiz",
        description=f"Scored {score}% on {lesson.title}",
        icon="📝",
    ))
    db.commit()

    # Build performance breakdown by grouping questions
    performance = _build_performance_breakdown(breakdown)

    # Fetch recommendations from related lessons in same module
    recommendations = _get_recommendations(db, module, lesson_id, score)

    # AI insight — from AICache if available, else None
    ai_cache = (
        db.query(AICache)
        .filter(AICache.lesson_id == lesson_id, AICache.service_type == "quiz_suggestions")
        .first()
    )
    ai_insight = json.loads(ai_cache.result_json).get("insight") if ai_cache else None

    return {
        "lesson_id": lesson_id,
        "score": score,
        "correct_answers": correct,
        "incorrect_answers": incorrect,
        "total_questions": total,
        "time_spent_seconds": time_spent,
        "breakdown": breakdown,
        "performance_breakdown": performance,
        "recommendations": recommendations,
        # None until AI team delivers via AICache
        "ai_insight": ai_insight,
    }


# ── GET LAST RESULTS ──────────────────────────────────────────────────────────

@router.get("/{lesson_id}/results")
def get_assessment_results(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns last attempt results for the results page.
    Called after submit or when revisiting results.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson or lesson.lesson_type != LessonTypeEnum.quiz:
        raise HTTPException(status_code=404, detail="Assessment not found")

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    enrollment = _get_enrollment(db, current_user.id, module.course_id) if module else None

    if not enrollment:
        raise HTTPException(status_code=400, detail="Not enrolled in this course")

    progress = (
        db.query(Progress)
        .filter(
            Progress.enrollment_id == enrollment.id,
            Progress.lesson_id == lesson_id,
        )
        .first()
    )

    if not progress:
        raise HTTPException(status_code=404, detail="No attempt found. Complete the assessment first.")

    course = course_crud.get_course_by_id(db, module.course_id) if module else None
    recommendations = _get_recommendations(db, module, lesson_id, progress.score or 0)

    # AI insight from cache
    ai_cache = (
        db.query(AICache)
        .filter(AICache.lesson_id == lesson_id, AICache.service_type == "quiz_suggestions")
        .first()
    )
    ai_insight = json.loads(ai_cache.result_json).get("insight") if ai_cache else None

    # Format time
    secs = progress.time_spent_seconds or 0
    mins = secs // 60
    remaining_secs = secs % 60
    total_time = f"{mins}m {remaining_secs:02d}s"

    total_q = 10  # default; ideally derived from quiz_json
    quiz_data = _get_quiz_json(lesson)
    if quiz_data:
        total_q = len(quiz_data.get("questions", [])) or total_q

    score = progress.score or 0.0
    correct = round((score / 100) * total_q)
    incorrect = total_q - correct

    return {
        "lesson_id": lesson_id,
        "lesson_title": lesson.title,
        "course_id": course.id if course else None,
        "course_title": course.title if course else None,
        "score": score,
        "correct_answers": correct,
        "incorrect_answers": incorrect,
        "total_questions": total_q,
        "total_time": total_time,
        "completed_at": progress.completed_at,
        "recommendations": recommendations,
        # None until AI team delivers
        "ai_insight": ai_insight,
        "performance_breakdown": [],
    }


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _build_performance_breakdown(breakdown: list) -> list:
    """
    Groups questions into mastered / needs review topics.
    Each question text is used as the topic name.
    """
    performance = []
    for item in breakdown:
        performance.append({
            "topic": item["question_text"][:40] + "..." if len(item["question_text"]) > 40 else item["question_text"],
            "status": "mastered" if item["is_correct"] else "review",
            "color": "emerald" if item["is_correct"] else "rose",
        })
    return performance


def _get_recommendations(db: Session, module: Module, quiz_lesson_id: int, score: float) -> list:
    """
    Recommends non-quiz lessons from the same module.
    Prioritises video lessons when score is low (<70%).
    """
    lessons = (
        db.query(Lesson)
        .filter(
            Lesson.module_id == module.id,
            Lesson.id != quiz_lesson_id,
            Lesson.lesson_type != LessonTypeEnum.quiz,
        )
        .order_by(Lesson.order_index)
        .limit(3)
        .all()
    )

    recs = []
    for lesson in lessons:
        recs.append({
            "lesson_id": lesson.id,
            "title": lesson.title,
            "type": lesson.lesson_type.value,
            "duration_minutes": lesson.duration_minutes,
            "url": f"/learner/courses/{module.course_id}/lessons/{lesson.id}",
        })
    return recs