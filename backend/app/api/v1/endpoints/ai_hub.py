"""
AI Learning Hub Endpoints
GET  /api/v1/ai-hub/                        - full hub page (single call)
GET  /api/v1/ai-hub/daily-brief             - daily learning brief card
GET  /api/v1/ai-hub/revision                - personalized revision assistant
GET  /api/v1/ai-hub/videos                  - video lessons from enrolled courses
GET  /api/v1/ai-hub/quizzes                 - quiz lessons with last scores
GET  /api/v1/ai-hub/lesson/{id}/ai          - AI-generated content for a lesson
POST /api/v1/ai-hub/lesson/{id}/ai          - AI team writes generated content here
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


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _enrolled_course_ids(db: Session, user_id: int) -> list[int]:
    return [e.course_id for e in enrollment_crud.get_user_enrollments(db, user_id)]


def _streak(db: Session, user_id: int) -> int:
    today = datetime.datetime.utcnow().date()
    streak = 0
    for i in range(365):
        day = today - datetime.timedelta(days=i)
        count = (
            db.query(func.count(Progress.id))
            .join(Enrollment, Enrollment.id == Progress.enrollment_id)
            .filter(
                Enrollment.user_id == user_id,
                Progress.is_completed == True,
                func.date(Progress.completed_at) == day,
            )
            .scalar()
        )
        if count and count > 0:
            streak += 1
        else:
            break
    return streak


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


# ── DAILY BRIEF ───────────────────────────────────────────────────────────────

@router.get("/daily-brief")
def get_daily_brief(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Finds the lesson with most time_spent_seconds in last 24h.
    AI summary read from AICache (service_type='summary') — written by AI team.
    """
    yesterday = datetime.datetime.utcnow() - datetime.timedelta(days=1)

    recent = (
        db.query(Progress, Lesson, Module, Course)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Enrollment.user_id == current_user.id,
            Progress.created_at >= yesterday,
        )
        .order_by(Progress.time_spent_seconds.desc())
        .first()
    )

    if not recent:
        return {
            "available": False,
            "message": "Complete some lessons to get your daily brief.",
        }

    prog, lesson, module, course = recent

    ai_cache = (
        db.query(AICache)
        .filter(AICache.lesson_id == lesson.id, AICache.service_type == "summary")
        .first()
    )

    return {
        "available": True,
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "course_title": course.title,
        "module_title": module.title,
        "time_spent_minutes": (prog.time_spent_seconds or 0) // 60,
        # None until AI team delivers via POST /ai-hub/lesson/{id}/ai
        "ai_summary": json.loads(ai_cache.result_json) if ai_cache else None,
        "has_ai_content": ai_cache is not None,
    }


# ── REVISION ASSISTANT ────────────────────────────────────────────────────────

@router.get("/revision")
def get_revision_assistant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Finds user's lowest-scored quiz lesson across all enrolled courses.
    Recommends other lessons from the same module.
    AI gap analysis read from AICache (service_type='quiz_suggestions').
    """
    user_id = current_user.id
    enrolled_ids = _enrolled_course_ids(db, user_id)

    if not enrolled_ids:
        return {"has_data": False, "message": "Enroll in a course to get recommendations."}

    worst = (
        db.query(Progress, Lesson, Module, Course)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.score != None,
            Lesson.lesson_type == LessonTypeEnum.quiz,
        )
        .order_by(Progress.score.asc())
        .first()
    )

    if not worst:
        return {
            "has_data": False,
            "message": "Complete a quiz to get personalized recommendations.",
        }

    prog, weak_lesson, weak_module, weak_course = worst

    related = (
        db.query(Lesson, Module, Course)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Module.id == weak_module.id,
            Lesson.id != weak_lesson.id,
            Lesson.lesson_type != LessonTypeEnum.quiz,
        )
        .order_by(Lesson.order_index)
        .limit(4)
        .all()
    )

    ai_cache = (
        db.query(AICache)
        .filter(
            AICache.lesson_id == weak_lesson.id,
            AICache.service_type == "quiz_suggestions",
        )
        .first()
    )

    return {
        "has_data": True,
        "topic": weak_lesson.title,
        "score": prog.score,
        "focus_lesson": _lesson_dict(weak_lesson, weak_module, weak_course),
        "recommended_lessons": [_lesson_dict(l, m, c) for l, m, c in related],
        # None until AI team delivers
        "ai_gap_analysis": json.loads(ai_cache.result_json) if ai_cache else None,
    }


# ── VIDEO LESSONS ─────────────────────────────────────────────────────────────

@router.get("/videos")
def get_video_lessons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Video-type lessons from enrolled courses only."""
    enrolled_ids = _enrolled_course_ids(db, current_user.id)
    if not enrolled_ids:
        return {"videos": [], "total": 0}

    rows = (
        db.query(Lesson, Module, Course)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Course.id.in_(enrolled_ids),
            Lesson.lesson_type == LessonTypeEnum.video,
        )
        .order_by(Course.id, Module.order_index, Lesson.order_index)
        .all()
    )

    return {"videos": [_lesson_dict(l, m, c) for l, m, c in rows], "total": len(rows)}


# ── QUIZ LESSONS ──────────────────────────────────────────────────────────────

@router.get("/quizzes")
def get_quiz_lessons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quiz lessons with last attempt score."""
    user_id = current_user.id
    enrolled_ids = _enrolled_course_ids(db, user_id)
    if not enrolled_ids:
        return {"quizzes": [], "total": 0}

    enrollments = enrollment_crud.get_user_enrollments(db, user_id)
    enr_map = {e.course_id: e.id for e in enrollments}

    rows = (
        db.query(Lesson, Module, Course)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Course.id.in_(enrolled_ids),
            Lesson.lesson_type == LessonTypeEnum.quiz,
        )
        .order_by(Course.id, Module.order_index, Lesson.order_index)
        .all()
    )

    quizzes = []
    for lesson, module, course in rows:
        enr_id = enr_map.get(course.id)
        last_score = None
        if enr_id:
            prog = (
                db.query(Progress)
                .filter(
                    Progress.enrollment_id == enr_id,
                    Progress.lesson_id == lesson.id,
                    Progress.score != None,
                )
                .first()
            )
            last_score = prog.score if prog else None
        item = _lesson_dict(lesson, module, course)
        item["last_score"] = last_score
        quizzes.append(item)

    return {"quizzes": quizzes, "total": len(quizzes)}


# ── LESSON AI CONTENT (AI team integration point) ─────────────────────────────

@router.get("/lesson/{lesson_id}/ai")
def get_lesson_ai_content(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all AI-generated content for a lesson from AICache.
    AI team writes to ai_cache table; this just reads it.
    service_type: 'transcript' | 'summary' | 'quiz_suggestions'
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    rows = db.query(AICache).filter(AICache.lesson_id == lesson_id).all()

    result = {
        "lesson_id": lesson_id,
        "lesson_title": lesson.title,
        "transcript": None,
        "summary": None,
        "quiz_suggestions": None,
    }

    for row in rows:
        try:
            data = json.loads(row.result_json)
        except (json.JSONDecodeError, TypeError):
            data = row.result_json
        if row.service_type in result:
            result[row.service_type] = data

    result["has_transcript"] = result["transcript"] is not None
    result["has_summary"] = result["summary"] is not None
    result["has_quiz_suggestions"] = result["quiz_suggestions"] is not None
    return result


@router.post("/lesson/{lesson_id}/ai")
def save_lesson_ai_content(
    lesson_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI team calls this to store generated content into AICache.
    payload: { "service_type": "transcript|summary|quiz_suggestions", "result_json": "..." }
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    service_type = payload.get("service_type")
    result_json = payload.get("result_json")

    allowed = {"transcript", "summary", "quiz_suggestions"}
    if not service_type or service_type not in allowed:
        raise HTTPException(status_code=400, detail=f"service_type must be one of {allowed}")
    if not result_json:
        raise HTTPException(status_code=400, detail="result_json is required")

    existing = (
        db.query(AICache)
        .filter(AICache.lesson_id == lesson_id, AICache.service_type == service_type)
        .first()
    )
    if existing:
        existing.result_json = result_json
    else:
        db.add(AICache(
            lesson_id=lesson_id,
            service_type=service_type,
            result_json=result_json,
        ))
    db.commit()

    return {"lesson_id": lesson_id, "service_type": service_type, "status": "saved"}


# ── FULL HUB PAGE (single call) ───────────────────────────────────────────────

@router.get("/")
def get_ai_hub(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Single endpoint to load the entire AI Learning Hub page."""
    return {
        "daily_streak": _streak(db, current_user.id),
        "daily_brief": get_daily_brief(current_user, db),
        "revision_assistant": get_revision_assistant(current_user, db),
        "video_lessons": get_video_lessons(current_user, db)["videos"][:3],
        "quizzes": get_quiz_lessons(current_user, db)["quizzes"][:3],
    }