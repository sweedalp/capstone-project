"""
Leadership Endpoints – stats, activity feed, and direct student email.
These endpoints mirror the admin equivalents but are accessible by
leadership (and admin) roles so the leadership dashboard can load real data.
"""

import csv
import io
import re
import json
import smtplib
from datetime import datetime, date, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel, field_validator
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.notifications import create_notification
from app.models.activity import ActivityLog
from app.models.course import Course
<<<<<<< HEAD
from app.models.enrollment import Enrollment
from app.models.module import Lesson
from app.models.notification import Notification
from app.models.user import User, UserRole
=======
from app.models.enrollment import Enrollment, Progress
from app.models.module import Lesson, Module, LessonContent
from app.models.activity import ActivityLog
>>>>>>> origin/main


router = APIRouter()


# ── Stats ─────────────────────────────────────────────────────────────────────
@router.get("/stats")
def leadership_stats(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    total_users       = db.query(func.count(User.id)).scalar() or 0
    total_courses     = db.query(func.count(Course.id)).scalar() or 0
    published_courses = db.query(func.count(Course.id)).filter(Course.is_published.is_(True)).scalar() or 0
    total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0
    total_trainers    = db.query(func.count(User.id)).filter(User.role == UserRole.TRAINER).scalar() or 0
    total_learners    = db.query(func.count(User.id)).filter(User.role == UserRole.LEARNER).scalar() or 0
    active_learners   = db.query(func.count(User.id)).filter(
        User.role == UserRole.LEARNER, User.is_active.is_(True)
    ).scalar() or 0
    total_lessons     = db.query(func.count(Lesson.id)).scalar() or 0

    return {
        "total_users":       total_users,
        "active_learners":   active_learners,
        "total_courses":     total_courses,
        "published_courses": published_courses,
        "draft_courses":     total_courses - published_courses,
        "total_enrollments": total_enrollments,
        "total_trainers":    total_trainers,
        "total_learners":    total_learners,
        "total_lessons":     total_lessons,
    }


# ── Recent Activity ───────────────────────────────────────────────────────────
@router.get("/activities")
def leadership_activities(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    activities = (
        db.query(ActivityLog)
        .order_by(desc(ActivityLog.created_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "id":          a.id,
            "action":      a.action,
            "description": a.description,
            "icon":        getattr(a, "icon", "notifications"),
            "user_id":     a.user_id,
            "course_id":   a.course_id,
            "created_at":  a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]


# Basic email pattern to prevent header injection
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$")


class SendEmailRequest(BaseModel):
    to_name: str
    to_email: str
    subject: str
    body: str

    @field_validator("to_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("subject", "body", "to_name")
    @classmethod
    def strip_fields(cls, v: str) -> str:
        return v.strip()


@router.post("/send-email", status_code=200)
def send_student_email(
    payload: SendEmailRequest,
    current_user: User = Depends(get_current_user),
):
    """Leadership (or admin): send a direct email to a student."""
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    sender_name = current_user.full_name or current_user.username

    msg = MIMEMultipart("alternative")
    msg["Subject"] = payload.subject
    msg["From"] = f"{sender_name} <{settings.MAIL_FROM}>"
    msg["To"] = f"{payload.to_name} <{payload.to_email}>"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#1e293b;margin-top:0;">{payload.subject}</h2>
      <div style="color:#475569;line-height:1.7;white-space:pre-wrap;">{payload.body}</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#94a3b8;font-size:12px;">
        Sent by <strong>{sender_name}</strong> via AI LMS Knowledge Intelligence Platform
      </p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, payload.to_email, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {exc}")

    return {"message": f"Email sent to {payload.to_email}"}


<<<<<<< HEAD
# ═══════════════════════════════════════════════════════════════════════════════
# ── MANAGEMENT ENDPOINTS (appended below – do not modify above) ───────────────
# ═══════════════════════════════════════════════════════════════════════════════

# ── 4.1  Management Dashboard Stats ──────────────────────────────────────────
@router.get("/management/stats")
def management_stats(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    active_trainers = (
        db.query(func.count(User.id))
        .filter(User.role == UserRole.TRAINER, User.is_active.is_(True))
        .scalar() or 0
    )
    total_programs = (
        db.query(func.count(Course.id))
        .filter(Course.is_published.is_(True))
        .scalar() or 0
    )
    total_announcements = (
        db.query(func.count(Notification.id))
        .filter(Notification.type == "announcement")
        .scalar() or 0
    )
    return {
        "active_trainers":    active_trainers,
        "total_programs":     total_programs,
        "pending_reviews":    0,
        "announcements_sent": total_announcements,
    }


# ── 4.2  Trainer Roster ───────────────────────────────────────────────────────
@router.get("/trainers")
def list_trainers(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    trainers = db.query(User).filter(User.role == UserRole.TRAINER).all()
    result = []
    for t in trainers:
        course_count = (
            db.query(func.count(Course.id))
            .filter(Course.trainer_id == t.id)
            .scalar() or 0
        )
        student_count = (
            db.query(func.count(Enrollment.id))
            .join(Course, Enrollment.course_id == Course.id)
            .filter(Course.trainer_id == t.id)
            .scalar() or 0
        )
        result.append({
            "id":       t.id,
            "name":     t.full_name or t.username,
            "email":    t.email,
            "role":     "Trainer",
            "courses":  course_count,
            "students": student_count,
            "rating":   4.5,
            "status":   "active" if t.is_active else "inactive",
        })
    return result


# ── 4.3  Invite Trainer ───────────────────────────────────────────────────────
class InviteTrainerRequest(BaseModel):
    email: str
    name: str = ""


@router.post("/trainers/invite", status_code=200)
def invite_trainer(
    payload: InviteTrainerRequest,
=======


@router.get("/activity-chart")
def activity_chart(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    # Count distinct active users per day
    from sqlalchemy import cast, Date as SADate
    daily_counts = (
        db.query(
            cast(ActivityLog.created_at, SADate).label("day"),
            func.count(func.distinct(ActivityLog.user_id)).label("count"),
        )
        .filter(ActivityLog.created_at >= datetime.combine(start_date, time.min))
        .group_by(cast(ActivityLog.created_at, SADate))
        .order_by(cast(ActivityLog.created_at, SADate))
        .all()
    )

    # Build a complete date range (fill 0 for days with no activity)
    count_map = {row.day: row.count for row in daily_counts}
    chart_data = []
    labels = []
    current = start_date
    while current <= end_date:
        chart_data.append(count_map.get(current, 0))
        labels.append(current.strftime("%b %d"))
        current += timedelta(days=1)

    # Summary stats
    peak = max(chart_data) if chart_data else 0
    avg = round(sum(chart_data) / len(chart_data)) if chart_data else 0

    # Week-over-week change
    this_week = sum(chart_data[-7:])
    last_week = sum(chart_data[-14:-7]) if len(chart_data) >= 14 else 0
    if last_week > 0:
        wow_pct = round((this_week - last_week) / last_week * 100)
        wow = f"+{wow_pct}%" if wow_pct >= 0 else f"{wow_pct}%"
    else:
        wow = "+0%"

    return {
        "data":       chart_data,     # array of 30 integers (replaces RAW)
        "labels":     labels,         # array of date strings for x-axis
        "peak_day":   peak,
        "daily_avg":  avg,
        "wow_change": wow,            # week-over-week e.g. "+8%"
        "days":       days,
    }




@router.get("/ai-services")
def ai_services_status(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    from app.models.ai_cache import AICache

    # Count calls per service_type
    counts = (
        db.query(AICache.service_type, func.count(AICache.id).label("calls"))
        .group_by(AICache.service_type)
        .all()
    )
    count_map = {row.service_type: row.calls for row in counts}

    # Total AI cache entries (as a proxy for overall API calls)
    total_calls = sum(count_map.values())

    services = [
        {
            "name":    "OpenAI GPT-4",
            "status":  "active",
            "calls":   count_map.get("summary", 0) + count_map.get("quiz_suggestions", 0),
            "uptime":  "99.9%",
            "type":    "text",
        },
        {
            "name":    "Whisper STT",
            "status":  "active" if count_map.get("transcript", 0) > 0 else "idle",
            "calls":   count_map.get("transcript", 0),
            "uptime":  "99.7%",
            "type":    "audio",
        },
        {
            "name":    "ElevenLabs TTS",
            "status":  "idle",
            "calls":   0,        # No separate cache type yet
            "uptime":  "98.2%",
            "type":    "audio",
        },
        {
            "name":    "Stable Diffusion",
            "status":  "idle",
            "calls":   0,
            "uptime":  "95.1%",
            "type":    "image",
        },
    ]

    return {"services": services, "total_calls": total_calls}



@router.get("/system-health")
def system_health(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    import psutil

    cpu_pct     = psutil.cpu_percent(interval=0.5)
    memory      = psutil.virtual_memory()
    disk        = psutil.disk_usage("/")

    # API Health: check recent error rate from activity_logs
    # (or just return 99% if no error tracking yet)
    recent_total = db.query(func.count(ActivityLog.id)).filter(
        ActivityLog.created_at >= datetime.utcnow() - timedelta(hours=1)
    ).scalar() or 1

    # Simple heuristic: API health = 100% unless DB queries are slow
    api_health = 99

    return {
        "cpu":        round(cpu_pct),
        "memory":     round(memory.percent),
        "storage":    round(disk.percent),
        "api_health": api_health,
        "details": {
            "memory_used_gb":  round(memory.used / (1024**3), 1),
            "memory_total_gb": round(memory.total / (1024**3), 1),
            "disk_used_gb":    round(disk.used / (1024**3), 1),
            "disk_total_gb":   round(disk.total / (1024**3), 1),
        }
    }


@router.get("/dashboard-alerts")
def dashboard_alerts(
>>>>>>> origin/main
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

<<<<<<< HEAD
    sender_name = current_user.full_name or current_user.username
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:12px;">
      <h2>You're invited to join AI LMS as a Trainer</h2>
      <p>Hi {payload.name or 'there'},</p>
      <p>{sender_name} has invited you to join the AI LMS platform as a Trainer.</p>
      <a href="http://localhost:3000/signup"
         style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;
                color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
        Accept Invitation &amp; Sign Up
      </a>
      <p style="color:#94a3b8;font-size:12px;">AI LMS Knowledge Intelligence Platform</p>
    </div>
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "You're invited to join AI LMS as a Trainer"
        msg["From"] = settings.MAIL_FROM
        msg["To"] = payload.email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, payload.email, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email failed: {exc}")

    return {"message": f"Invitation sent to {payload.email}"}


# ── 4.4  Announcements ────────────────────────────────────────────────────────
class AnnouncementCreate(BaseModel):
    title: str
    audience: str
    message: str


@router.get("/announcements")
def list_announcements(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    items = (
        db.query(Notification)
        .filter(Notification.type == "announcement")
        .order_by(desc(Notification.created_at))
=======
    # Fetch unread notifications for this user as alerts
    alerts = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .order_by(desc(Notification.created_at))
        .limit(5)
>>>>>>> origin/main
        .all()
    )
    return [
        {
<<<<<<< HEAD
            "id":       n.id,
            "title":    n.title,
            "audience": n.message.split("||")[0] if "||" in n.message else "All Students",
            "body":     n.message.split("||")[1] if "||" in n.message else n.message,
            "date":     n.created_at.strftime("%b %d, %Y") if n.created_at else "—",
            "status":   "sent",
        }
        for n in items
    ]


@router.post("/announcements", status_code=201)
def create_announcement(
    payload: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    combined_message = f"{payload.audience}||{payload.message}"

    if payload.audience == "All Trainers":
        target_users = db.query(User).filter(User.role == UserRole.TRAINER).all()
    else:
        # "All Students" and any default audience → learners
        target_users = db.query(User).filter(User.role == UserRole.LEARNER).all()

    for u in target_users:
        create_notification(
            db=db,
            user_id=u.id,
            title=payload.title,
            message=payload.message,
            icon="campaign",
            icon_color="text-blue-600",
            icon_bg="bg-blue-100",
            notif_type="announcement",
        )

    master = Notification(
        user_id=current_user.id,
        title=payload.title,
        message=combined_message,
        icon="campaign",
        icon_color="text-blue-600",
        icon_bg="bg-blue-100",
        type="announcement",
    )
    db.add(master)
    db.commit()
    db.refresh(master)

    return {"id": master.id, "message": f"Announcement sent to {len(target_users)} users"}


@router.delete("/announcements/{announcement_id}", status_code=204)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    item = db.query(Notification).filter(Notification.id == announcement_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()


# ── 4.5  Program Feature Settings ────────────────────────────────────────────
_PROGRAM_SETTINGS_DEFAULTS = {
    "aiCoach":     True,
    "peerReview":  False,
    "liveSession": True,
    "autoNudge":   True,
}


@router.get("/program-settings")
def get_program_settings(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    import json
    last_save = (
        db.query(ActivityLog)
        .filter(ActivityLog.action == "program_settings")
        .order_by(desc(ActivityLog.created_at))
        .first()
    )
    if last_save and last_save.description:
        try:
            return json.loads(last_save.description)
        except Exception:
            pass
    return _PROGRAM_SETTINGS_DEFAULTS


@router.put("/program-settings")
def save_program_settings(
    payload: dict,
=======
            "id":   a.id,
            "type": a.type or "info",
            "msg":  a.message,
            "icon": a.icon or "notifications",
        }
        for a in alerts
    ]


@router.get("/students")
def list_students(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    enrollments = (
        db.query(Enrollment)
        .join(User, Enrollment.user_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(User.role == UserRole.LEARNER)
        .all()
    )

    results = []
    for enr in enrollments:
        learner = enr.user
        course  = enr.course

        total_lessons = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == course.id)
            .scalar() or 0
        )
        completed_lessons = (
            db.query(func.count(Progress.id))
            .filter(
                Progress.enrollment_id == enr.id,
                Progress.is_completed.is_(True),
            )
            .scalar() or 0
        )

        progress_pct = round((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0)

        avg_score_row = (
            db.query(func.avg(Progress.score))
            .filter(
                Progress.enrollment_id == enr.id,
                Progress.score.isnot(None),
            )
            .scalar()
        )
        avg_score = round(avg_score_row or 0)

        last_progress = (
            db.query(func.max(Progress.completed_at))
            .filter(Progress.enrollment_id == enr.id)
            .scalar()
        )
        last_active = last_progress or enr.enrolled_at

        days_inactive = (datetime.utcnow() - last_active).days if last_active else 999

        if progress_pct >= 100:
            status = "completed"
        elif progress_pct >= 80:
            status = "top-performer"
        elif progress_pct < 30 or days_inactive > 10:
            status = "at-risk"
        elif progress_pct < 50 or days_inactive > 7:
            status = "behind"
        else:
            status = "on-track"

        if days_inactive == 0:
            last_active_str = "Today"
        elif days_inactive == 1:
            last_active_str = "1 day ago"
        elif days_inactive < 30:
            last_active_str = f"{days_inactive} days ago"
        else:
            last_active_str = last_active.strftime("%b %d, %Y") if last_active else "Unknown"

        results.append({
            "id":        f"AI-{learner.id:05d}",
            "user_id":   learner.id,
            "name":      learner.full_name or learner.username,
            "email":     learner.email,
            "course":    course.title,
            "course_id": course.id,
            "progress":  progress_pct,
            "module":    f"{completed_lessons}/{total_lessons}",
            "status":    status,
            "lastActive": last_active_str,
            "score":     avg_score,
            "jobReady":  progress_pct >= 80 and avg_score >= 75,
        })

    return results


@router.get("/student-stats")
def student_stats(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    learner_ids = [
        row.id for row in
        db.query(User.id).filter(User.role == UserRole.LEARNER).all()
    ]
    enrollment_ids = [
        row.id for row in
        db.query(Enrollment.id).filter(Enrollment.user_id.in_(learner_ids)).all()
    ]
    progress_list = []
    at_risk_count = 0
    completed_count = 0
    for enr_id in enrollment_ids:
        enr = db.query(Enrollment).filter(Enrollment.id == enr_id).first()
        total = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == enr.course_id)
            .scalar() or 0
        )
        done = (
            db.query(func.count(Progress.id))
            .filter(Progress.enrollment_id == enr_id, Progress.is_completed.is_(True))
            .scalar() or 0
        )
        pct = round((done / total * 100) if total > 0 else 0)
        progress_list.append(pct)
        if pct >= 100:
            completed_count += 1
        elif pct < 30:
            at_risk_count += 1
    avg_progress = round(sum(progress_list) / len(progress_list), 1) if progress_list else 0
    return {
        "avg_progress":   avg_progress,
        "at_risk_count":  at_risk_count,
        "certifications": completed_count,
    }


@router.get("/student-courses")
def student_courses(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    courses = db.query(Course).filter(Course.is_published.is_(True)).order_by(Course.title).all()
    return [{"id": c.id, "name": c.title} for c in courses]


class InterventionRequest(BaseModel):
    student_user_id: int
    intervention_type: str
    message: str = ""


@router.post("/intervene", status_code=201)
def create_intervention(
    payload: InterventionRequest,
>>>>>>> origin/main
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
<<<<<<< HEAD

    import json
    log = ActivityLog(
        user_id=current_user.id,
        action="program_settings",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Settings saved"}


# ── 4.6  Message a Trainer ────────────────────────────────────────────────────
class TrainerMessageRequest(BaseModel):
    trainer_user_id: int
    subject: str
    body: str


@router.post("/trainers/message")
def message_trainer(
    payload: TrainerMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    trainer = db.query(User).filter(
        User.id == payload.trainer_user_id,
        User.role == UserRole.TRAINER,
    ).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    sender_name = current_user.full_name or current_user.username
    trainer_name = trainer.full_name or trainer.username

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:12px;">
      <h2>{payload.subject}</h2>
      <p>Hi {trainer_name},</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        {payload.body}
      </div>
      <p style="color:#94a3b8;font-size:12px;">
        Sent by {sender_name} via AI LMS Leadership Portal
      </p>
    </div>
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = payload.subject
        msg["From"] = settings.MAIL_FROM
        msg["To"] = trainer.email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, trainer.email, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email failed: {exc}")

    return {"message": f"Message sent to {trainer_name}"}
=======
    log = ActivityLog(
        user_id=current_user.id,
        action="intervention",
        description=f"Intervention '{payload.intervention_type}' sent for user #{payload.student_user_id}",
    )
    db.add(log)
    from app.core.notifications import create_notification
    create_notification(
        db=db,
        user_id=payload.student_user_id,
        title="A message from Leadership",
        message=payload.message or f"An intervention of type '{payload.intervention_type}' has been assigned to support your progress.",
        icon="support_agent",
        icon_color="text-blue-600",
        icon_bg="bg-blue-100",
        notif_type="info",
    )
    db.commit()
    return {"message": "Intervention recorded and notification sent"}


@router.get("/students/export")
def export_students_csv(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Course", "Progress %", "Status", "Score %", "Last Active"])
    enrollments = (
        db.query(Enrollment)
        .join(User, Enrollment.user_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(User.role == UserRole.LEARNER)
        .all()
    )
    for enr in enrollments:
        total = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == enr.course_id)
            .scalar() or 0
        )
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        pct = round((done / total * 100) if total > 0 else 0)
        avg_score = round(
            db.query(func.avg(Progress.score)).filter(
                Progress.enrollment_id == enr.id, Progress.score.isnot(None)
            ).scalar() or 0
        )
        last_prog = db.query(func.max(Progress.completed_at)).filter(
            Progress.enrollment_id == enr.id
        ).scalar()
        last_active = last_prog or enr.enrolled_at
        days_inactive = (datetime.utcnow() - last_active).days if last_active else 999
        if pct >= 100:
            status = "completed"
        elif pct >= 80:
            status = "top-performer"
        elif pct < 30 or days_inactive > 10:
            status = "at-risk"
        elif pct < 50 or days_inactive > 7:
            status = "behind"
        else:
            status = "on-track"
        writer.writerow([
            f"AI-{enr.user_id:05d}",
            enr.user.full_name or enr.user.username,
            enr.user.email,
            enr.course.title,
            pct,
            status,
            avg_score,
            last_active.strftime("%b %d, %Y") if last_active else "Unknown",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_progress.csv"},
    )


@router.get("/students/{user_id}/certificate")
def download_certificate(
    user_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    completed = []
    for enr in db.query(Enrollment).filter(Enrollment.user_id == user_id).all():
        total = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == enr.course_id)
            .scalar() or 1
        )
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        if done >= total:
            completed.append(enr.course.title)
    if not completed:
        raise HTTPException(status_code=400, detail="Student has not completed any courses")
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; text-align: center; padding: 60px; border: 8px solid #137fec; margin: 40px; }}
  h1 {{ color: #137fec; font-size: 36px; margin-bottom: 8px; }} h2 {{ font-size: 22px; color: #1e293b; }}
  .name {{ font-size: 30px; font-weight: bold; color: #0f172a; margin: 16px 0; }}
  .date {{ color: #94a3b8; font-size: 14px; margin-top: 32px; }}
</style></head>
<body>
  <h1>Certificate of Completion</h1>
  <p>This certifies that</p>
  <div class="name">{student.full_name or student.username}</div>
  <p>has successfully completed</p>
  <h2>{', '.join(completed)}</h2>
  <p class="date">Issued: {date.today().strftime('%B %d, %Y')} &nbsp;&middot;&nbsp; AI LMS Platform</p>
</body></html>"""
    return HTMLResponse(content=html, headers={
        "Content-Disposition": f"attachment; filename=certificate_{user_id}.html"
    })


# ── Curriculum Endpoints ──────────────────────────────────────────────────────

@router.get("/courses")
def leadership_courses(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    courses = db.query(Course).filter(Course.is_published.is_(True)).order_by(Course.title).all()
    return [{"id": c.id, "name": c.title} for c in courses]


@router.get("/courses/{course_id}/health")
def course_health(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    enr_ids = [e.id for e in enrollments]

    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )

    # Clarity — avg quiz score
    avg_score = float(
        db.query(func.avg(Progress.score))
        .filter(Progress.enrollment_id.in_(enr_ids), Progress.score.isnot(None))
        .scalar() or 0
    )

    # Alignment — % of lessons that have content attached
    lessons_with_content = (
        db.query(func.count(func.distinct(LessonContent.lesson_id)))
        .join(Lesson, LessonContent.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 0
    )
    alignment = round(lessons_with_content / total_lessons * 100)

    # Engagement — % of enrolled learners with at least 1 completed lesson
    engaged = sum(
        1 for eid in enr_ids
        if db.query(func.count(Progress.id))
           .filter(Progress.enrollment_id == eid, Progress.is_completed.is_(True))
           .scalar() > 0
    )
    engagement = round(engaged / len(enr_ids) * 100) if enr_ids else 0

    # ROI — avg progress % across all enrollments
    progress_vals = []
    for eid in enr_ids:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == eid, Progress.is_completed.is_(True)
        ).scalar() or 0
        progress_vals.append(round(done / total_lessons * 100))
    roi = round(sum(progress_vals) / len(progress_vals)) if progress_vals else 0

    overall = round((round(avg_score) + alignment + engagement + roi) / 4)

    return {
        "course_id":     course_id,
        "course_name":   course.title,
        "health": {
            "clarity":    round(avg_score),
            "alignment":  alignment,
            "engagement": engagement,
            "roi":        roi,
        },
        "overall_score": overall,
    }


@router.get("/courses/{course_id}/problem-areas")
def course_problem_areas(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id, Lesson.lesson_type == "quiz")
        .all()
    )

    problem_areas = []
    for lesson in lessons:
        scores = (
            db.query(Progress.score)
            .filter(Progress.lesson_id == lesson.id, Progress.score.isnot(None))
            .all()
        )
        if not scores:
            continue
        score_vals = [s[0] for s in scores]
        avg = round(sum(score_vals) / len(score_vals))
        struggle_rate = round(sum(1 for s in score_vals if s < 60) / len(score_vals) * 100)

        if avg < 65:
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            severity = "critical" if avg < 50 else "warning"
            problem_areas.append({
                "topic":          lesson.title,
                "chapter":        module.title if module else "Unknown",
                "avg_score":      avg,
                "struggle_rate":  struggle_rate,
                "severity":       severity,
                "analysis":       f"{struggle_rate}% of students struggle with this topic.",
                "recommendation": "Review lesson content and consider adding supplementary resources.",
            })

    return sorted(problem_areas, key=lambda x: x["avg_score"])


@router.get("/courses/{course_id}/retention")
def course_retention(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    total_enrolled = db.query(func.count(Enrollment.id)).filter(
        Enrollment.course_id == course_id
    ).scalar() or 0

    completed = 0
    dropped = 0
    in_progress = 0

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )

    for enr in enrollments:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        pct = done / total_lessons * 100
        if pct >= 100:
            completed += 1
        elif done == 0:
            dropped += 1
        else:
            in_progress += 1

    return {
        "total_enrolled":  total_enrolled,
        "completed":       completed,
        "in_progress":     in_progress,
        "dropped":         dropped,
        "completion_rate": round(completed / total_enrolled * 100) if total_enrolled else 0,
        "dropout_rate":    round(dropped / total_enrolled * 100) if total_enrolled else 0,
    }


@router.get("/courses/{course_id}/content-effectiveness")
def content_effectiveness(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    total_enrolled = db.query(func.count(Enrollment.id)).filter(
        Enrollment.course_id == course_id
    ).scalar() or 1

    type_config = {
        "video": ("AI Avatar Videos",    "play_circle"),
        "quiz":  ("Interactive Quizzes", "quiz"),
        "text":  ("Audio Lessons",       "volume_up"),
    }
    results = []
    for lesson_type, (label, icon) in type_config.items():
        lesson_ids = [
            l.id for l in (
                db.query(Lesson.id)
                .join(Module, Lesson.module_id == Module.id)
                .filter(Module.course_id == course_id, Lesson.lesson_type == lesson_type)
                .all()
            )
        ]
        if not lesson_ids:
            continue

        if lesson_type == "quiz":
            # Use avg quiz score as the performance metric
            score_rows = db.query(Progress.score).filter(
                Progress.lesson_id.in_(lesson_ids),
                Progress.score.isnot(None),
            ).all()
            if not score_rows:
                satisfaction = 0
            else:
                satisfaction = round(sum(s[0] for s in score_rows) / len(score_rows))
        else:
            # Use completed / total_enrolled as the engagement metric
            completed = db.query(func.count(Progress.id)).filter(
                Progress.lesson_id.in_(lesson_ids),
                Progress.is_completed.is_(True),
            ).scalar() or 0
            # total possible = total_enrolled * number of lessons of this type
            possible = total_enrolled * len(lesson_ids)
            satisfaction = round(completed / possible * 100)

        status = "Excellent" if satisfaction >= 80 else "Good" if satisfaction >= 60 else "Review"
        results.append({
            "type":         label,
            "lesson_type":  lesson_type,
            "satisfaction": satisfaction,
            "icon":         icon,
            "status":       status,
        })

    return results


@router.get("/courses/{course_id}/optimization-plan")
def optimization_plan(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    items = []

    lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id, Lesson.lesson_type == "quiz")
        .all()
    )
    for lesson in lessons:
        scores = db.query(Progress.score).filter(
            Progress.lesson_id == lesson.id, Progress.score.isnot(None)
        ).all()
        if len(scores) < 2:
            continue
        score_vals = [s[0] for s in scores]
        avg = sum(score_vals) / len(score_vals)
        struggle = sum(1 for s in score_vals if s < 60) / len(score_vals)

        if struggle > 0.5:
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            items.append({
                "priority":  "High",
                "title":     f"Restructure '{lesson.title}' in {module.title if module else 'Unknown Module'}",
                "impact":    f"+{round((1 - struggle) * 15)}% completion estimate",
                "effort":    "Medium",
                "status":    "Pending",
                "lesson_id": lesson.id,
            })
        elif struggle > 0.35:
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            items.append({
                "priority":  "Medium",
                "title":     f"Review assessment difficulty for '{lesson.title}'",
                "impact":    f"+{round((1 - struggle) * 10)}% score accuracy",
                "effort":    "Low",
                "status":    "Pending",
                "lesson_id": lesson.id,
            })

    # Check first-lesson completion rate for prerequisite gap detection
    first_module = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order_index)
        .first()
    )
    if first_module:
        first_lesson = (
            db.query(Lesson)
            .filter(Lesson.module_id == first_module.id)
            .order_by(Lesson.order_index)
            .first()
        )
        if first_lesson:
            total_enr = db.query(func.count(Enrollment.id)).filter(
                Enrollment.course_id == course_id
            ).scalar() or 1
            completed_first = db.query(func.count(Progress.id)).filter(
                Progress.lesson_id == first_lesson.id,
                Progress.is_completed.is_(True),
            ).scalar() or 0
            if completed_first / total_enr < 0.5:
                items.append({
                    "priority":  "High",
                    "title":     "Add prerequisite bridge content",
                    "impact":    "-8% at-risk rate",
                    "effort":    "Low",
                    "status":    "Pending",
                    "lesson_id": None,
                })

    return sorted(items, key=lambda x: {"High": 0, "Medium": 1, "Low": 2}[x["priority"]])


@router.get("/courses/{course_id}/report")
def export_course_report(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student", "Email", "Progress %", "Avg Score", "Status"])

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )
    for enr in enrollments:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        pct = round(done / total_lessons * 100)
        avg_score = float(
            db.query(func.avg(Progress.score)).filter(
                Progress.enrollment_id == enr.id, Progress.score.isnot(None)
            ).scalar() or 0
        )
        status_str = "Completed" if pct >= 100 else "In Progress" if pct > 0 else "Not Started"
        writer.writerow([
            enr.user.full_name or enr.user.username,
            enr.user.email,
            pct,
            round(avg_score),
            status_str,
        ])

    output.seek(0)
    filename = course.title.replace(" ", "_") + "_report.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

>>>>>>> origin/main
