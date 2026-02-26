"""
Activity Log Model
Tracks user actions — powers "Recent Activity" sidebar on dashboard
"""

import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ActivityLog(Base):
    """
    One row per user action.
    action examples : "completed_lesson", "started_course", "generated_notes"
    icon  examples  : "✅", "🚀", "📄", "💬"
    """
    __tablename__ = "activity_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=True)
    action      = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon        = Column(String(10), default="📌")
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user   = relationship("User",   back_populates="activity_logs")
    course = relationship("Course", back_populates="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog {self.action} user={self.user_id}>"