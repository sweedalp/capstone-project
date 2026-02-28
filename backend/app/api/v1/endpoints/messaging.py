"""
Messaging Endpoints — send, list, mark read
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.message import Message

router = APIRouter()


class MessageCreate(BaseModel):
    recipient_id: int
    subject: str = ""
    body: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str = ""
    recipient_id: int
    recipient_name: str = ""
    subject: str
    body: str
    is_read: bool
    created_at: str


# ── List messages (inbox + sent) ─────────────────────────────────
@router.get("")
def list_messages(
    folder: str = Query("inbox"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if folder == "sent":
        msgs = db.query(Message).filter(Message.sender_id == current_user.id)\
            .order_by(desc(Message.created_at)).limit(50).all()
    else:
        msgs = db.query(Message).filter(Message.recipient_id == current_user.id)\
            .order_by(desc(Message.created_at)).limit(50).all()

    user_ids = set()
    for m in msgs:
        user_ids.add(m.sender_id)
        user_ids.add(m.recipient_id)
    users = {u.id: u.full_name or u.username for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": users.get(m.sender_id, "Unknown"),
            "recipient_id": m.recipient_id,
            "recipient_name": users.get(m.recipient_id, "Unknown"),
            "subject": m.subject or "",
            "body": m.body,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat() if m.created_at else "",
        }
        for m in msgs
    ]


# ── Send message ─────────────────────────────────────────────────
@router.post("", status_code=201)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipient = db.query(User).filter(User.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    msg = Message(
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        subject=payload.subject,
        body=payload.body,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "message": "Message sent",
        "recipient_name": recipient.full_name or recipient.username,
    }


# ── Mark as read ─────────────────────────────────────────────────
@router.post("/{message_id}/read")
def mark_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = db.query(Message).filter(
        Message.id == message_id,
        Message.recipient_id == current_user.id,
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return {"message": "Marked as read"}


# ── Unread count ─────────────────────────────────────────────────
@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read.is_(False),
    ).count()
    return {"count": count}


# ── Send announcement to all learners ────────────────────────────
class AnnouncementCreate(BaseModel):
    subject: str = ""
    body: str


@router.post("/announce", status_code=201)
def send_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send message to all active learners."""
    learners = db.query(User).filter(
        User.role == UserRole.LEARNER,
        User.is_active.is_(True),
    ).all()
    if not learners:
        return {"message": "No learners found", "sent_to": 0}
    count = 0
    for learner in learners:
        msg = Message(
            sender_id=current_user.id,
            recipient_id=learner.id,
            subject=payload.subject,
            body=payload.body,
        )
        db.add(msg)
        count += 1
    db.commit()
    return {"message": f"Announcement sent to {count} learners", "sent_to": count}


# ── Get recipients list (students for trainer, trainers for students) ──
@router.get("/recipients")
def list_recipients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).filter(User.id != current_user.id, User.is_active.is_(True)).all()
    return [
        {"id": u.id, "name": u.full_name or u.username, "email": u.email, "role": u.role.value}
        for u in users
    ]
