"""
Meeting model — schedule video call links
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.core.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id               = Column(Integer, primary_key=True, index=True)
    title            = Column(String(255), nullable=False)
    host_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    meeting_url      = Column(String(500), default="")
    description      = Column(Text, default="")
    scheduled_at     = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    created_at       = Column(DateTime, default=datetime.utcnow)
