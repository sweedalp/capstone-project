"""
Meetings Endpoints — create, list, delete scheduled meetings
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.meeting import Meeting

router = APIRouter()


class MeetingCreate(BaseModel):
    title: str
    meeting_url: str = ""
    description: str = ""
    scheduled_at: str          # ISO datetime string
    duration_minutes: int = 30


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_url: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[str] = None
    duration_minutes: Optional[int] = None


def _meeting_dict(m: Meeting, host_name: str = "") -> dict:
    return {
        "id": m.id,
        "title": m.title,
        "host_id": m.host_id,
        "host_name": host_name,
        "meeting_url": m.meeting_url or "",
        "description": m.description or "",
        "scheduled_at": m.scheduled_at.isoformat() if m.scheduled_at else "",
        "duration_minutes": m.duration_minutes,
        "created_at": m.created_at.isoformat() if m.created_at else "",
    }


def _enrich_meetings(db: Session, meetings):
    host_ids = {m.host_id for m in meetings}
    hosts = (
        {u.id: u.full_name or u.username for u in db.query(User).filter(User.id.in_(host_ids)).all()}
        if host_ids else {}
    )
    return [_meeting_dict(m, hosts.get(m.host_id, "Trainer")) for m in meetings]


# ── List my meetings (trainer / host view) ───────────────────────
@router.get("")
def list_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meetings = db.query(Meeting).filter(Meeting.host_id == current_user.id)\
        .order_by(desc(Meeting.scheduled_at)).limit(50).all()
    return _enrich_meetings(db, meetings)


# ── List ALL upcoming meetings (for learners) ───────────────────
@router.get("/upcoming")
def list_upcoming_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    meetings = db.query(Meeting).filter(Meeting.scheduled_at >= now)\
        .order_by(Meeting.scheduled_at).limit(50).all()
    return _enrich_meetings(db, meetings)


# ── List ALL meetings (for learners — upcoming + past) ──────────
@router.get("/all")
def list_all_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meetings = db.query(Meeting)\
        .order_by(desc(Meeting.scheduled_at)).limit(50).all()
    return _enrich_meetings(db, meetings)


# ── Create meeting ───────────────────────────────────────────────
@router.post("", status_code=201)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        scheduled = datetime.fromisoformat(payload.scheduled_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601.")

    meeting = Meeting(
        title=payload.title,
        host_id=current_user.id,
        meeting_url=payload.meeting_url,
        description=payload.description,
        scheduled_at=scheduled,
        duration_minutes=payload.duration_minutes,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    name = current_user.full_name or current_user.username
    return _meeting_dict(meeting, name)


# ── Delete meeting ───────────────────────────────────────────────
@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.host_id == current_user.id,
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
