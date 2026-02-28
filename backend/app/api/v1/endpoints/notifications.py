"""
Notifications endpoint — CRUD for in-app notifications.
GET  /api/v1/notifications/         — list for current user
PATCH /api/v1/notifications/{id}/read — mark one as read
POST  /api/v1/notifications/read-all  — mark all as read
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    icon: str
    icon_color: str
    icon_bg: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationSummary(BaseModel):
    notifications: List[NotificationOut]
    unread_count: int


# ── Endpoints ────────────────────────────────────────────────────────────
@router.get("/", response_model=NotificationSummary)
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(50)
        .all()
    )
    unread = sum(1 for r in rows if not r.is_read)
    return NotificationSummary(
        notifications=[NotificationOut.model_validate(r) for r in rows],
        unread_count=unread,
    )


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"ok": True}


@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}
