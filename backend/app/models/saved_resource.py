"""
SavedResource model — bookmarked lessons / resources for a learner.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class SavedResource(Base):
    __tablename__ = "saved_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(50), nullable=False, default="lesson")  # lesson, video, document, quiz
    icon = Column(String(50), nullable=False, default="article")
    icon_color = Column(String(50), nullable=False, default="text-blue-600")
    icon_bg = Column(String(50), nullable=False, default="bg-blue-100")
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
