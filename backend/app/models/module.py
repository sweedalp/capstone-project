"""
Module, Lesson & LessonContent Models
A Course → has many Modules → each has many Lessons → each has LessonContent
"""

import enum
import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Enum, Text, ForeignKey,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class LessonTypeEnum(str, enum.Enum):
    video = "video"
    text = "text"
    quiz = "quiz"


class ContentTypeEnum(str, enum.Enum):
    video_url = "video_url"
    text_body = "text_body"
    quiz_json = "quiz_json"
    file_url = "file_url"


class Module(Base):
    """Logical grouping inside a course — e.g. "Module 3: Neural Networks" """
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )

    def __repr__(self) -> str:
        return f"<Module {self.title}>"


class Lesson(Base):
    """Individual learning unit — a video lecture, reading, or quiz"""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    lesson_type = Column(Enum(LessonTypeEnum), default=LessonTypeEnum.video)
    order_index = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="lessons")
    contents = relationship(
        "LessonContent",
        back_populates="lesson",
        cascade="all, delete-orphan",
    )
    progress_entries = relationship(
        "Progress", back_populates="lesson", cascade="all, delete-orphan"
    )
    ai_cache_entries = relationship(
        "AICache", back_populates="lesson", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Lesson {self.title}>"


class LessonContent(Base):
    """Actual content attached to a lesson — video URL, markdown, quiz JSON, …"""
    __tablename__ = "lesson_contents"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    content_type = Column(Enum(ContentTypeEnum), nullable=False)
    content = Column(Text, nullable=False)                  # URL / HTML / JSON string

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lesson = relationship("Lesson", back_populates="contents")

    def __repr__(self) -> str:
        return f"<LessonContent {self.content_type.value} for lesson {self.lesson_id}>"
