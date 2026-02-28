"""
Notification model — stores in-app notifications for users.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False, default="notifications")
    icon_color = Column(String(50), nullable=False, default="text-blue-600")
    icon_bg = Column(String(50), nullable=False, default="bg-blue-100")
    type = Column(String(50), nullable=False, default="info")  # info, deadline, achievement, course, ai
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
