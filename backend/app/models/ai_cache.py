"""
AICache Model
Caches expensive AI-generated results (transcripts, summaries) so they're only computed once
"""

import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class AICache(Base):
    """
    Stores results from AI services so we don't re-process the same video/lesson.
    service_type examples: "transcript", "summary", "quiz_suggestions"
    """
    __tablename__ = "ai_cache"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    service_type = Column(String(50), nullable=False)       # "transcript" | "summary"
    result_json = Column(Text, nullable=False)              # JSON string of AI output

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lesson = relationship("Lesson", back_populates="ai_cache_entries")

    def __repr__(self) -> str:
        return f"<AICache {self.service_type} for lesson {self.lesson_id}>"
