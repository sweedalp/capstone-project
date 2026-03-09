"""
Leadership Endpoints – stats, activity feed, and direct student email.
These endpoints mirror the admin equivalents but are accessible by
leadership (and admin) roles so the leadership dashboard can load real data.
"""

import re
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
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.module import Lesson
from app.models.activity import ActivityLog

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
