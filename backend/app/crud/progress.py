"""
Progress CRUD operations
Powers progress bars, "Based on your struggles", weekly goals, etc.
"""

import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.models.enrollment import Enrollment, Progress
from app.models.module import Module, Lesson
from app.models.course import Course


def mark_lesson_complete(
    db: Session,
    enrollment_id: int,
    lesson_id: int,
    score: Optional[float] = None,
    time_spent_seconds: int = 0,
) -> Progress:
    progress = (
        db.query(Progress)
        .filter(
            Progress.enrollment_id == enrollment_id,
            Progress.lesson_id == lesson_id,
        )
        .first()
    )
    if progress is None:
        progress = Progress(
            enrollment_id=enrollment_id,
            lesson_id=lesson_id,
        )
        db.add(progress)

    progress.is_completed = True
    progress.completed_at = datetime.datetime.utcnow()
    if score is not None:
        progress.score = score
    progress.time_spent_seconds = (progress.time_spent_seconds or 0) + time_spent_seconds  # 👈 fix
    db.commit()
    db.refresh(progress)
    return progress


def get_progress_for_enrollment(
    db: Session, enrollment_id: int
) -> List[Progress]:
    return (
        db.query(Progress)
        .filter(Progress.enrollment_id == enrollment_id)
        .all()
    )


def count_completed_lessons(db: Session, enrollment_id: int) -> int:
    return (
        db.query(func.count(Progress.id))
        .filter(
            Progress.enrollment_id == enrollment_id,
            Progress.is_completed == True,  # noqa: E712
        )
        .scalar()
    )


def get_course_progress_percent(
    db: Session, enrollment_id: int, course_id: int
) -> float:
    """Calculate progress percentage for a user in a given course."""
    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Module.id == Lesson.module_id)
        .filter(Module.course_id == course_id)
        .scalar()
    )
    if total_lessons == 0:
        return 0.0

    completed = count_completed_lessons(db, enrollment_id)
    return round((completed / total_lessons) * 100, 1)


def get_current_module_name(
    db: Session, enrollment_id: int, course_id: int
) -> Optional[str]:
    """
    Return the name of the first module that still has uncompleted lessons.
    Powers "Current Module: Neural Nets" on course cards.
    """
    completed_lesson_ids = (
        db.query(Progress.lesson_id)
        .filter(
            Progress.enrollment_id == enrollment_id,
            Progress.is_completed == True,  # noqa: E712
        )
        .subquery()
    )

    module = (
        db.query(Module)
        .join(Lesson, Lesson.module_id == Module.id)
        .filter(
            Module.course_id == course_id,
            ~Lesson.id.in_(completed_lesson_ids),
        )
        .order_by(Module.order_index)
        .first()
    )
    return module.title if module else None


def get_weekly_completed_count(db: Session, user_id: int) -> int:
    """Count lessons completed by this user in the last 7 days."""
    week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    return (
        db.query(func.count(Progress.id))
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed == True,  # noqa: E712
            Progress.completed_at >= week_ago,
        )
        .scalar()
    )


def get_struggles(db: Session, user_id: int, limit: int = 5) -> list:
    """
    Lessons where the user scored low or spent a long time.
    Powers "Based on your struggles" section on dashboard.
    Returns list of dicts with lesson info + reason.
    """
    rows = (
        db.query(Progress, Lesson)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed == True,  # noqa: E712
        )
        .filter(
            (Progress.score != None) & (Progress.score < 60)  # noqa: E711
            | (Progress.time_spent_seconds > 2700)             # >45 min
        )
        .order_by(Progress.completed_at.desc())
        .limit(limit)
        .all()
    )

    struggles = []
    for prog, lesson in rows:
        if prog.score is not None and prog.score < 60:
            reason = f"You scored {int(prog.score)}% on the {lesson.title} quiz"
        else:
            mins = prog.time_spent_seconds // 60
            reason = f"Spent {mins} min on this topic"
        struggles.append({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "lesson_type": lesson.lesson_type.value,
            "reason": reason,
        })
    return struggles
