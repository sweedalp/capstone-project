"""
Dashboard Endpoint — single API call for the Learner Dashboard
GET /api/v1/dashboard/
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.activity import ActivityLog
from app.models.enrollment import Enrollment, Progress
from app.models.module import Lesson, Module
from app.models.ai_cache import AICache
from app.crud import enrollment as enrollment_crud
from app.crud import course as course_crud
from app.crud import progress as progress_crud
from app.schemas.dashboard import (
    DashboardResponse, DashboardCourse, ActivityItem,
    DeadlineItem, StruggleItem, DailyBriefItem,
)

router = APIRouter()

WEEKLY_LESSON_TARGET = 10


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    # ── Enrolled courses + progress ───────────────────────────────────
    enrollments = enrollment_crud.get_user_enrollments(db, user_id)
    courses_in_progress = []
    enrolled_course_ids = []
    total_remaining_modules = 0

    for enr in enrollments:
        c = course_crud.get_course_by_id(db, enr.course_id)
        if not c:
            continue
        enrolled_course_ids.append(c.id)

        pct = progress_crud.get_course_progress_percent(db, enr.id, c.id)
        if pct >= 100:
            continue

        cur_mod = progress_crud.get_current_module_name(db, enr.id, c.id)

        completed_ids = {
            p.lesson_id
            for p in progress_crud.get_progress_for_enrollment(db, enr.id)
            if p.is_completed
        }
        for mod in c.modules:
            if any(les.id not in completed_ids for les in mod.lessons):
                total_remaining_modules += 1

        courses_in_progress.append(DashboardCourse(
            id=c.id,
            title=c.title,
            thumbnail_url=c.thumbnail_url,
            level=c.level.value,
            category_name=c.category.name if c.category else None,
            progress_percent=pct,
            current_module=cur_mod,
        ))

    # ── Weekly goal ───────────────────────────────────────────────────
    weekly_done = progress_crud.get_weekly_completed_count(db, user_id)
    weekly_pct = round(min((weekly_done / WEEKLY_LESSON_TARGET) * 100, 100), 1)

    # ── Recent activity ───────────────────────────────────────────────
    activity_rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    recent_activity = [ActivityItem.model_validate(a) for a in activity_rows]

    # ── Upcoming deadlines ────────────────────────────────────────────
    deadlines = course_crud.get_upcoming_deadlines(db, enrolled_course_ids)
    upcoming_deadlines = [DeadlineItem.model_validate(d) for d in deadlines]

    # ── Struggles ─────────────────────────────────────────────────────
    struggle_dicts = progress_crud.get_struggles(db, user_id)
    struggles = [StruggleItem(**s) for s in struggle_dicts]

    # ── Daily brief ───────────────────────────────────────────────────
    # Find lesson with most time spent in last 24h
    yesterday = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    recent_progress = (
        db.query(Progress, Lesson, Module)
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .join(Lesson, Lesson.id == Progress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.created_at >= yesterday,
        )
        .order_by(Progress.time_spent_seconds.desc())
        .first()
    )

    if recent_progress:
        prog, lesson, module = recent_progress
        c = course_crud.get_course_by_id(db, module.course_id)
        ai_cache = (
            db.query(AICache)
            .filter(
                AICache.lesson_id == lesson.id,
                AICache.service_type == "summary",
            )
            .first()
        )
        daily_brief = DailyBriefItem(
            available=True,
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            course_title=c.title if c else None,
            module_title=module.title,
            time_spent_minutes=(prog.time_spent_seconds or 0) // 60,
            has_ai_content=ai_cache is not None,
        )
    else:
        daily_brief = DailyBriefItem(
            available=False,
            message="Complete some lessons to get your daily brief.",
        )

    return DashboardResponse(
        welcome_name=current_user.full_name or current_user.username,
        weekly_goal_percent=weekly_pct,
        modules_remaining=total_remaining_modules,
        courses_in_progress=courses_in_progress,
        recent_activity=recent_activity,
        upcoming_deadlines=upcoming_deadlines,
        struggles=struggles,
        daily_brief=daily_brief,
    )