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
# ── Settings: Notification Preferences ───────────────────────────────────────

_NOTIF_DEFAULTS = {
    "atRiskAlerts": True,
    "weeklyReports": True,
    "completionMilestones": False,
    "systemUpdates": True,
    "trainerAlerts": False,
    "aiInsights": True,
}


@router.get("/notification-preferences")
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's saved notification preferences,
    or sensible defaults if none have been saved yet."""
    import json

    last = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action == "notif_preferences",
        )
        .order_by(desc(ActivityLog.created_at))
        .first()
    )
    if last:
        try:
            return json.loads(last.description)
        except Exception:
            pass
    return _NOTIF_DEFAULTS


@router.put("/notification-preferences")
def save_notification_preferences(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Persist the user's notification preference toggles to ActivityLog."""
    import json

    log = ActivityLog(
        user_id=current_user.id,
        action="notif_preferences",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Notification preferences saved"}


# ── Settings: Display Preferences ────────────────────────────────────────────

_DISPLAY_DEFAULTS = {
    "language": "English (US)",
    "dateFormat": "MM/DD/YYYY",
    "defaultView": "Last 30 Days",
    "defaultReportFormat": "PDF",
}


@router.get("/preferences")
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's saved display preferences,
    or sensible defaults if none have been saved yet."""
    import json

    last = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action == "user_preferences",
        )
        .order_by(desc(ActivityLog.created_at))
        .first()
    )
    if last:
        try:
            return json.loads(last.description)
        except Exception:
            pass
    return _DISPLAY_DEFAULTS


@router.put("/preferences")
def save_preferences(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Persist the user's display preferences to ActivityLog."""
    import json

    log = ActivityLog(
        user_id=current_user.id,
        action="user_preferences",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Display preferences saved"}

# ── Active Sessions ───────────────────────────────────────────────────────────

@router.get("/sessions")
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all active sessions for the current user."""
    from app.models.user_session import UserSession
    sessions = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.is_active.is_(True),
        )
        .order_by(desc(UserSession.created_at))
        .all()
    )
    return [
        {
            "id":           s.id,
            "device":       s.device,
            "ip_address":   s.ip_address,
            "created_at":   s.created_at.isoformat() if s.created_at else None,
            "last_seen_at": s.last_seen_at.isoformat() if s.last_seen_at else None,
            "is_current":   False,
        }
        for s in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=200)
def revoke_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke (deactivate) a specific session."""
    from app.models.user_session import UserSession
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    db.commit()
    return {"message": "Session revoked successfully"}


@router.delete("/sessions", status_code=200)
def revoke_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke all sessions except current."""
    from app.models.user_session import UserSession
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active.is_(True),
    ).update({"is_active": False})
    db.commit()
    return {"message": "All sessions revoked"}

# ── Integrations ──────────────────────────────────────────────────────────────

_INTEGRATIONS_DEFAULTS = {
    "Slack":         False,
    "Google Sheets": False,
    "Zoom":          False,
    "Power BI":      False,
    "JIRA":          False,
}

@router.get("/integrations")
def get_integrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    last = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action == "integrations",
        )
        .order_by(desc(ActivityLog.created_at))
        .first()
    )
    if last:
        try:
            return json.loads(last.description)
        except:
            pass
    return _INTEGRATIONS_DEFAULTS


@router.put("/integrations")
def save_integrations(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    db.add(ActivityLog(
        user_id=current_user.id,
        action="integrations",
        description=json.dumps(payload),
    ))
    db.commit()
    return {"message": "Integrations saved"}