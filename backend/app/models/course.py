"""
Course & Category Models
Courses belong to a category and are created by trainers
"""

import enum
import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, Float,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class LevelEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Category(Base):
    """Course categories — Programming, Data Science, UI/UX Design, …"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    courses = relationship("Course", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category {self.name}>"


class Course(Base):
    """A single course — e.g. "Advanced Python: AI & ML Integration" """
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    level = Column(Enum(LevelEnum), default=LevelEnum.beginner)
    duration_minutes = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)

    # Foreign keys
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # ── Relationships ──────────────────────────────────
    trainer = relationship("User", back_populates="courses_created")
    category = relationship("Category", back_populates="courses")
    modules = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Module.order_index",
    )
    enrollments = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )
    deadlines = relationship(
        "Deadline", back_populates="course", cascade="all, delete-orphan"
    )
    activity_logs = relationship("ActivityLog", back_populates="course")

    def __repr__(self) -> str:
        return f"<Course {self.title}>"


class Deadline(Base):
    """Upcoming deadlines shown on the learner dashboard sidebar"""
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=False)
    weight_percent = Column(Float, nullable=True)          # "Grade Weight 15%"

    course = relationship("Course", back_populates="deadlines")

    def __repr__(self) -> str:
        return f"<Deadline {self.title}>"
