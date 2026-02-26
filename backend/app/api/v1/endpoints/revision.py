"""
Revision Assistant Endpoints
GET  /api/v1/revision/                          - full revision page data
GET  /api/v1/revision/areas                     - areas needing attention (low quiz scores)
GET  /api/v1/revision/study-plan                - today's study plan
PATCH /api/v1/revision/study-plan/{task_id}     - toggle task complete
POST /api/v1/revision/chat                      - AI chat (wires to AI team service)
GET  /api/v1/revision/misunderstood             - commonly misunderstood areas
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.enrollment import Enrollment, Progress
from app.models.module import Lesson, Module, LessonTypeEnum
from app.models.course import Course
from app.models.ai_cache import AICache
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.crud import course as course_crud

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _enrolled_course_ids(db: Session, user_id: int) -> list[int]:
    return [e.course_id for e in enrollment_crud.get_user_enrollments(db, user_id)]


def _get_enrollment(db: Session, user_id: int, course_id: int) -> Enrollment | None:
    return (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )


def _lesson_dict(lesson: Lesson, module: Module, course: Course) -> dict:
    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "lesson_type": lesson.lesson_type.value,
        "duration_minutes": lesson.duration_minutes,
        "course_id": course.id,
        "course_title": course.title,
        "module_title": module.title,
        "url": f"/learner/courses/{course.id}/lessons/{lesson.id}",
    }


# ─────────────────────────────────────────────────────────────────────────────
# AREAS NEEDING ATTENTION
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/areas")
def get_areas_needing_attention(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns quiz lessons where the user scored below 70%, sorted by score asc.
    For each weak area, also returns related video/text/quiz lessons in the same module.
    This powers the "Areas Needing Attention" section.
    """
    user_id = current_user.id

    weak_quizzes = (
        db.query(Progress, Lesson, Module, Course)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.score != None,
            Progress.score < 70,
            Lesson.lesson_type == LessonTypeEnum.quiz,
        )
        .order_by(Progress.score.asc())
        .limit(5)
        .all()
    )

    areas = []
    for prog, quiz_lesson, module, course in weak_quizzes:
        # Find video lesson in same module
        video = (
            db.query(Lesson)
            .filter(
                Lesson.module_id == module.id,
                Lesson.lesson_type == LessonTypeEnum.video,
            )
            .order_by(Lesson.order_index)
            .first()
        )
        # Find text lesson in same module
        text = (
            db.query(Lesson)
            .filter(
                Lesson.module_id == module.id,
                Lesson.lesson_type == LessonTypeEnum.text,
            )
            .order_by(Lesson.order_index)
            .first()
        )
        # Count other quiz lessons as practice exercises
        quiz_count = (
            db.query(func.count(Lesson.id))
            .filter(
                Lesson.module_id == module.id,
                Lesson.lesson_type == LessonTypeEnum.quiz,
                Lesson.id != quiz_lesson.id,
            )
            .scalar()
        )

        areas.append({
            "id": quiz_lesson.id,
            "topic": quiz_lesson.title,
            "quiz_score": prog.score,
            "course_id": course.id,
            "lesson_id": quiz_lesson.id,
            "module_title": module.title,
            "resources": {
                "video": {
                    "lesson_id": video.id,
                    "title": video.title,
                    "duration_minutes": video.duration_minutes,
                    "url": f"/learner/courses/{course.id}/lessons/{video.id}",
                } if video else None,
                "text": {
                    "lesson_id": text.id,
                    "title": text.title,
                    "duration_minutes": text.duration_minutes,
                    "url": f"/learner/courses/{course.id}/lessons/{text.id}",
                } if text else None,
                "practice_count": quiz_count,
                "practice_url": f"/learner/courses/{course.id}/assessments/{quiz_lesson.id}",
            },
        })

    return {"areas": areas, "total": len(areas)}


# ─────────────────────────────────────────────────────────────────────────────
# STUDY PLAN
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/study-plan")
def get_study_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Builds today's study plan from:
    - Incomplete lessons from weakest modules (quiz score < 70%)
    - Prioritises: video first, then text, then quiz
    Max 5 tasks per day.
    """
    user_id = current_user.id

    weak_quizzes = (
        db.query(Progress, Lesson, Module, Course)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.score != None,
            Progress.score < 70,
            Lesson.lesson_type == LessonTypeEnum.quiz,
        )
        .order_by(Progress.score.asc())
        .limit(3)
        .all()
    )

    tasks = []
    seen_lesson_ids = set()

    for prog, quiz_lesson, module, course in weak_quizzes:
        enr = _get_enrollment(db, user_id, course.id)

        # Get completed lesson IDs for this enrollment
        completed_ids = set()
        if enr:
            completed_ids = {
                p.lesson_id
                for p in progress_crud.get_progress_for_enrollment(db, enr.id)
                if p.is_completed
            }

        # Get all lessons in the module
        module_lessons = (
            db.query(Lesson)
            .filter(Lesson.module_id == module.id)
            .order_by(Lesson.order_index)
            .all()
        )

        for lesson in module_lessons:
            if lesson.id in seen_lesson_ids or len(tasks) >= 5:
                break
            seen_lesson_ids.add(lesson.id)

            task_type = lesson.lesson_type.value
            label = {
                "video": f"Watch: {lesson.title}",
                "text": f"Read: {lesson.title}",
                "quiz": f"Complete: {lesson.title}",
            }.get(task_type, lesson.title)

            tasks.append({
                "id": lesson.id,
                "title": label,
                "duration_minutes": lesson.duration_minutes or 15,
                "type": task_type,
                "completed": lesson.id in completed_ids,
                "lesson_id": lesson.id,
                "course_id": course.id,
                "url": f"/learner/courses/{course.id}/lessons/{lesson.id}",
                "resources": [task_type],
            })

    completed_count = sum(1 for t in tasks if t["completed"])

    return {
        "tasks": tasks,
        "total": len(tasks),
        "completed": completed_count,
        "progress_percent": round((completed_count / len(tasks)) * 100, 1) if tasks else 0,
    }


@router.patch("/study-plan/{lesson_id}/toggle")
def toggle_study_plan_task(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggles a lesson as complete/incomplete in Progress.
    Called when user checks/unchecks a task in study plan.
    """
    user_id = current_user.id
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    enr = _get_enrollment(db, user_id, module.course_id) if module else None
    if not enr:
        raise HTTPException(status_code=400, detail="Not enrolled in this course")

    prog = (
        db.query(Progress)
        .filter(
            Progress.enrollment_id == enr.id,
            Progress.lesson_id == lesson_id,
        )
        .first()
    )

    if prog:
        prog.is_completed = not prog.is_completed
        prog.completed_at = datetime.datetime.utcnow() if prog.is_completed else None
    else:
        prog = Progress(
            enrollment_id=enr.id,
            lesson_id=lesson_id,
            is_completed=True,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(prog)

    db.commit()
    return {"lesson_id": lesson_id, "is_completed": prog.is_completed}


# ─────────────────────────────────────────────────────────────────────────────
# COMMONLY MISUNDERSTOOD AREAS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/misunderstood")
def get_misunderstood_areas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns lessons from enrolled courses where:
    - Multiple users scored low (future: community data)
    - For now: lessons from same modules as user's weak areas
    AI team can enhance this with quiz_suggestions from AICache.
    """
    user_id = current_user.id

    weak_module_ids = (
        db.query(Module.id)
        .join(Lesson, Lesson.module_id == Module.id)
        .join(Progress, Progress.lesson_id == Lesson.id)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.score != None,
            Progress.score < 70,
            Lesson.lesson_type == LessonTypeEnum.quiz,
        )
        .distinct()
        .limit(3)
        .all()
    )
    weak_module_ids = [m.id for m in weak_module_ids]

    if not weak_module_ids:
        return {"areas": []}

    # Get video/text lessons from those modules as explainers
    lessons = (
        db.query(Lesson, Module, Course)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Lesson.module_id.in_(weak_module_ids),
            Lesson.lesson_type.in_([LessonTypeEnum.video, LessonTypeEnum.text]),
        )
        .order_by(Lesson.order_index)
        .limit(4)
        .all()
    )

    areas = []
    for lesson, module, course in lessons:
        # Check for AI-generated misunderstood topic explanation
        ai_cache = (
            db.query(AICache)
            .filter(
                AICache.lesson_id == lesson.id,
                AICache.service_type == "summary",
            )
            .first()
        )
        ai_data = json.loads(ai_cache.result_json) if ai_cache else {}

        areas.append({
            "lesson_id": lesson.id,
            "title": ai_data.get("topic_title") or lesson.title,
            "description": ai_data.get("description") or f"Review this {lesson.lesson_type.value} lesson",
            "lesson_type": lesson.lesson_type.value,
            "duration_minutes": lesson.duration_minutes,
            "course_id": course.id,
            "url": f"/learner/courses/{course.id}/lessons/{lesson.id}",
        })

    return {"areas": areas}


# ─────────────────────────────────────────────────────────────────────────────
# AI CHAT — AI TEAM INTEGRATION POINT
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/chat")
def revision_chat(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI chat for the revision assistant.
    payload: {
        "message": "Explain what I struggled with in simple terms",
        "context": {           // optional — sent by frontend from navigation state
            "topic": "Python Functions",
            "quiz_score": 40,
            "lesson_id": 3
        }
    }

    ── AI TEAM INTEGRATION ──────────────────────────────────────────────────
    Replace the TODO block below with a call to your AI service.
    Expected input:  message (str) + context (dict)
    Expected output: { "reply": "AI response text" }

    Example when AI service is ready:
        response = ai_service.chat(
            user_message=message,
            context=context,
            user_id=current_user.id,
        )
        return { "reply": response.text }
    ─────────────────────────────────────────────────────────────────────────
    """
    message = payload.get("message", "").strip()
    context = payload.get("context", {})

    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    # TODO: Replace this block with AI team's service call
    # ─────────────────────────────────────────────────────
    # For now: return a structured placeholder so frontend works
    topic = context.get("topic", "this topic")
    score = context.get("quiz_score")

    if score and score < 50:
        fallback = (
            f"I can see you're struggling with {topic} — you scored {score}%. "
            f"Let's break it down step by step. What specific part is confusing you?"
        )
    elif score:
        fallback = (
            f"You scored {score}% on {topic}. You're close! "
            f"Let's focus on the gaps. What would you like to clarify?"
        )
    else:
        fallback = (
            "I'm your AI revision assistant. I'm ready to help you understand "
            "any topic you're struggling with. What would you like to review?"
        )
    # ─────────────────────────────────────────────────────

    return {
        "reply": fallback,
        "ai_powered": False,  # becomes True when AI team wires in their service
    }


# ─────────────────────────────────────────────────────────────────────────────
# FULL PAGE DATA (single call)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/")
def get_revision_page(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Single endpoint to load the entire Revision Assistant page."""
    areas = get_areas_needing_attention(current_user, db)
    plan = get_study_plan(current_user, db)
    misunderstood = get_misunderstood_areas(current_user, db)

    return {
        "areas_needing_attention": areas["areas"],
        "study_plan": plan,
        "misunderstood_areas": misunderstood["areas"],
    }