"""
Analytics Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
import traceback

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.crud import course as course_crud
from app.models.enrollment import Progress, Enrollment

router = APIRouter()


# ── OVERVIEW ────────────────────────────────────────────────────────
@router.get("/overview")
def get_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    try:
        enrollments = enrollment_crud.get_user_enrollments(db, user_id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load enrollments: {e}")

    total_enrolled = len(enrollments)
    completed_courses = 0
    in_progress = 0
    total_time_sec = 0
    scores = []

    for enr in enrollments:
        try:
            total_lessons = course_crud.count_course_lessons(db, enr.course_id) or 0
            completed_lessons = progress_crud.count_completed_lessons(db, enr.id) or 0

            if total_lessons > 0 and completed_lessons >= total_lessons:
                completed_courses += 1
            elif completed_lessons > 0:
                in_progress += 1

            for p in progress_crud.get_progress_for_enrollment(db, enr.id):
                total_time_sec += getattr(p, "time_spent_seconds", 0) or 0
                score = getattr(p, "score", None)
                if score is not None:
                    scores.append(score)
        except Exception as e:
            traceback.print_exc()
            print(f"[OVERVIEW] Skipping enrollment {enr.id}: {e}")
            continue

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    hours_learned = round(total_time_sec / 3600, 1)
    streak = _compute_streak(db, user_id)
    best_streak = _compute_best_streak(db, user_id)

    # Overall progress percent across all enrolled courses
    overall_pct = 0.0
    if enrollments:
        pcts = []
        for enr in enrollments:
            try:
                total = course_crud.count_course_lessons(db, enr.course_id) or 0
                completed = progress_crud.count_completed_lessons(db, enr.id) or 0
                pcts.append(round((completed / total) * 100, 1) if total > 0 else 0.0)
            except Exception as e:
                print(f"[OVERVIEW] Skipping pct for enrollment {enr.id}: {e}")
                continue
        overall_pct = round(sum(pcts) / len(pcts), 1) if pcts else 0.0

    # hours_today
    today = datetime.datetime.utcnow().date()
    today_secs = (
        db.query(func.sum(Progress.time_spent_seconds))
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed.is_(True),
            func.date(Progress.completed_at) == today,
        )
        .scalar() or 0
    )
    hours_today = round(today_secs / 3600, 2)

    # weekly_progress_delta: compare lessons completed this week vs prior week
    week_start = today - datetime.timedelta(days=6)
    prev_start = week_start - datetime.timedelta(days=7)
    this_week_lessons = (
        db.query(func.count(Progress.id))
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed.is_(True),
            func.date(Progress.completed_at) >= week_start,
        )
        .scalar() or 0
    )
    prev_week_lessons = (
        db.query(func.count(Progress.id))
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed.is_(True),
            func.date(Progress.completed_at) >= prev_start,
            func.date(Progress.completed_at) < week_start,
        )
        .scalar() or 0
    )
    if prev_week_lessons > 0:
        weekly_progress_delta = round(
            ((this_week_lessons - prev_week_lessons) / prev_week_lessons) * 100, 1
        )
    elif this_week_lessons > 0:
        weekly_progress_delta = 100.0
    else:
        weekly_progress_delta = 0.0

    return {
        "total_enrolled": total_enrolled,
        "completed_courses": completed_courses,
        "in_progress": in_progress,
        "average_score": avg_score,
        "hours_learned": hours_learned,
        "hours_today": hours_today,
        "current_streak_days": streak,
        "best_streak_days": best_streak,
        "overall_progress_percent": overall_pct,
        "weekly_progress_delta": weekly_progress_delta,
    }


# ── WEEKLY ──────────────────────────────────────────────────────────
@router.get("/weekly")
def get_weekly_stats(
    days: int = Query(7, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns hours studied per day for the last `days` days.
    Frontend expects: { daily_stats: [{date, day_label, hours, lessons_completed}] }
    """
    user_id = current_user.id
    today = datetime.datetime.utcnow().date()
    week_ago = today - datetime.timedelta(days=days - 1)

    try:
        time_rows = (
            db.query(
                func.date(Progress.completed_at).label("day"),
                func.sum(Progress.time_spent_seconds).label("total_seconds"),
                func.count(Progress.id).label("lessons_completed"),
            )
            .join(Enrollment, Enrollment.id == Progress.enrollment_id)
            .filter(
                Enrollment.user_id == user_id,
                Progress.is_completed == True,
                Progress.completed_at >= datetime.datetime.combine(week_ago, datetime.time.min),
            )
            .group_by(func.date(Progress.completed_at))
            .all()
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load weekly stats: {e}")

    # Build a dict for quick lookup
    data_by_day = {
        str(row.day): {
            "hours": round((row.total_seconds or 0) / 3600, 2),
            "lessons_completed": row.lessons_completed,
        }
        for row in time_rows
    }

    # Fill in all `days` days (including zeros)
    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_stats = []
    for i in range(days):
        day = week_ago + datetime.timedelta(days=i)
        day_str = str(day)
        entry = data_by_day.get(day_str, {"hours": 0.0, "lessons_completed": 0})
        daily_stats.append({
            "date": day_str,
            "day_label": day_labels[day.weekday()],
            "hours": entry["hours"],
            "lessons_completed": entry["lessons_completed"],
        })

    total_hours = round(sum(d["hours"] for d in daily_stats), 1)
    best_day = max(daily_stats, key=lambda d: d["hours"]) if daily_stats else None

    return {
        "daily_stats": daily_stats,
        "total_hours_this_week": total_hours,
        "best_day": best_day,
    }


# ── ACHIEVEMENTS ────────────────────────────────────────────────────
@router.get("/achievements")
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns earned and in-progress badges derived from real user data."""
    user_id = current_user.id

    try:
        enrollments = enrollment_crud.get_user_enrollments(db, user_id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load enrollments: {e}")

    streak = _compute_streak(db, user_id)

    # ── Compute real stats from enrollments ─────────────────────────
    total_completed_lessons = 0
    completed_courses = 0
    neural_net_progress = 0.0
    python_course_completed = False
    ai_course_completed = False
    first_course_date = None

    for enr in enrollments:
        try:
            c = course_crud.get_course_by_id(db, enr.course_id)
            if not c:
                continue

            total_lessons = course_crud.count_course_lessons(db, enr.course_id) or 0
            completed_lessons = progress_crud.count_completed_lessons(db, enr.id) or 0
            total_completed_lessons += completed_lessons

            pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0.0

            if pct >= 100:
                completed_courses += 1
                if enr.enrolled_at:
                    if first_course_date is None or enr.enrolled_at < first_course_date:
                        first_course_date = enr.enrolled_at

            # Match courses by title keyword
            # Replace with category/tag checks if your Course model supports them
            title_lower = c.title.lower()
            if "python" in title_lower and pct >= 100:
                python_course_completed = True
            if ("ai" in title_lower or "artificial intelligence" in title_lower or "machine learning" in title_lower) and pct >= 100:
                ai_course_completed = True
            if "neural" in title_lower:
                neural_net_progress = round(pct, 1)

        except Exception as e:
            traceback.print_exc()
            print(f"[ACHIEVEMENTS] Skipping enrollment {enr.id}: {e}")
            continue

    first_course_date_str = (
        first_course_date.strftime("%b %d") if first_course_date else None
    )

    # ── Badge definitions — all driven by real data ─────────────────
    badges = [
        {
            "id": "first_step",
            "name": "First Step",
            "description": "Complete your first lesson",
            "earned": total_completed_lessons >= 1,
            "earned_date": first_course_date_str,
            "icon": "⭐",
        },
        {
            "id": "python_basics",
            "name": "Python Basics Master",
            "description": "Complete a Python course",
            "earned": python_course_completed,
            "earned_date": first_course_date_str if python_course_completed else None,
            "icon": "🏆",
        },
        {
            "id": "ai_explorer",
            "name": "AI Explorer",
            "description": "Complete your first AI or ML course",
            "earned": ai_course_completed,
            "earned_date": first_course_date_str if ai_course_completed else None,
            "icon": "🚀",
        },
        {
            "id": "course_finisher",
            "name": "Course Finisher",
            "description": "Complete at least one full course",
            "earned": completed_courses >= 1,
            "earned_date": first_course_date_str,
            "icon": "🎓",
        },
        {
            "id": "neural_networker",
            "name": "Neural Networker",
            "description": "Complete 80% of a Neural Networks course",
            "earned": neural_net_progress >= 80,
            "earned_date": None,
            "progress": min(round(neural_net_progress), 100),
            "icon": "🧠",
        },
        {
            "id": "streak_master",
            "name": "Streak Master",
            "description": "Maintain a 30-day learning streak",
            "earned": streak >= 30,
            "earned_date": None,
            "progress": min(streak, 30),
            "icon": "🔥",
        },
    ]

    return {
        "badges": badges,
        "total_earned": sum(1 for b in badges if b["earned"]),
    }


# ── COURSES ─────────────────────────────────────────────────────────
@router.get("/courses")
def get_course_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-course breakdown for the analytics page."""
    user_id = current_user.id

    try:
        enrollments = enrollment_crud.get_user_enrollments(db, user_id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load enrollments: {e}")

    results = []
    for enr in enrollments:
        try:
            c = course_crud.get_course_by_id(db, enr.course_id)
            if not c:
                continue

            total = course_crud.count_course_lessons(db, c.id) or 0
            completed = progress_crud.count_completed_lessons(db, enr.id) or 0
            pct = round((completed / total) * 100, 1) if total > 0 else 0.0

            progress_records = progress_crud.get_progress_for_enrollment(db, enr.id) or []
            scores = [
                getattr(p, "score", None)
                for p in progress_records
                if getattr(p, "score", None) is not None
            ]
            avg_score = round(sum(scores) / len(scores), 1) if scores else None

            results.append({
                "course_id": c.id,
                "course_title": c.title,
                "thumbnail_url": c.thumbnail_url,
                "level": c.level.value if c.level else "beginner",
                "duration_minutes": c.duration_minutes or 0,
                "progress_percent": pct,
                "completed_lessons": completed,
                "total_lessons": total,
                "avg_quiz_score": avg_score,
                "last_active": enr.enrolled_at.strftime("%Y-%m-%d") if enr.enrolled_at else None,
            })

        except Exception as e:
            traceback.print_exc()
            print(f"[COURSES] Skipping enrollment {enr.id} (course {enr.course_id}): {e}")
            continue

    return {"courses": results}


# ── STREAK HELPERS ───────────────────────────────────────────────────
def _compute_best_streak(db: Session, user_id: int) -> int:
    """Return the longest consecutive learning streak in the past year."""
    year_ago = datetime.datetime.utcnow().date() - datetime.timedelta(days=365)
    rows = (
        db.query(func.date(Progress.completed_at))
        .join(Enrollment, Enrollment.id == Progress.enrollment_id)
        .filter(
            Enrollment.user_id == user_id,
            Progress.is_completed.is_(True),
            Progress.completed_at >= datetime.datetime.combine(
                year_ago, datetime.time.min
            ),
        )
        .distinct()
        .all()
    )
    if not rows:
        return 0
    dates = sorted(
        d for (d,) in rows
        if d is not None
    )
    if not dates:
        return 0
    best = current = 1
    for i in range(1, len(dates)):
        d1 = dates[i - 1] if isinstance(dates[i - 1], datetime.date) else datetime.date.fromisoformat(str(dates[i - 1]))
        d2 = dates[i] if isinstance(dates[i], datetime.date) else datetime.date.fromisoformat(str(dates[i]))
        if (d2 - d1).days == 1:
            current += 1
            if current > best:
                best = current
        else:
            current = 1
    return best


def _compute_streak(db: Session, user_id: int) -> int:
    today = datetime.datetime.utcnow().date()
    streak = 0
    for i in range(365):
        day = today - datetime.timedelta(days=i)
        try:
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
        except Exception as e:
            print(f"[STREAK] Error on day {day}: {e}")
            break
    return streak