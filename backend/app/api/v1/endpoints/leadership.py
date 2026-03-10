"""
Leadership Endpoints – stats, activity feed, and direct student email.
These endpoints mirror the admin equivalents but are accessible by
leadership (and admin) roles so the leadership dashboard can load real data.
"""

import re
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.notifications import create_notification
from app.models.activity import ActivityLog
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.module import Lesson
from app.models.notification import Notification
from app.models.user import User, UserRole

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

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
        .all()
    )
    return [
        {
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

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
