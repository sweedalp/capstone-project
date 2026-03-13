"""
Enrollment & Progress Models
Track which users are enrolled in which courses and their lesson-by-lesson progress
"""

import datetime
from sqlalchemy import (
    Column, Integer, Boolean, DateTime, Float, ForeignKey, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Enrollment(Base):
    """
    Links a learner to a course.
    Also stores wishlist status (powers the "Wishlist" tab on My Courses).
    """
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    is_wishlisted = Column(Boolean, default=False)
    is_enrolled = Column(Boolean, default=True)  # False for wishlist-only entries

    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    progress_entries = relationship(
        "Progress", back_populates="enrollment", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Enrollment user={self.user_id} course={self.course_id}>"


class Progress(Base):
    """
    Per-lesson progress record.
    is_completed flags mark a lesson as done; score stores quiz results.
    Powers progress bars ("65% Completed") and "Based on your struggles".
    """
    __tablename__ = "progress"
    __table_args__ = (
        UniqueConstraint(
            "enrollment_id", "lesson_id", name="uq_enrollment_lesson"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    score = Column(Float, nullable=True)                    # for quizzes (0–100)
    time_spent_seconds = Column(Integer, default=0)         # for analytics

    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    enrollment = relationship("Enrollment", back_populates="progress_entries")
    lesson = relationship("Lesson", back_populates="progress_entries")

    def __repr__(self) -> str:
        return f"<Progress enrollment={self.enrollment_id} lesson={self.lesson_id}>"
