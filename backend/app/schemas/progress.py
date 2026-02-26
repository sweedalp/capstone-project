"""
Progress Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProgressCreate(BaseModel):
    lesson_id: int
    score: Optional[float] = None       # for quizzes
    time_spent_seconds: int = 0


class ProgressResponse(BaseModel):
    id: int
    enrollment_id: int
    lesson_id: int
    is_completed: bool
    score: Optional[float]
    time_spent_seconds: int
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class CourseProgressResponse(BaseModel):
    """Aggregated progress for a single course"""
    course_id: int
    course_title: str
    total_lessons: int
    completed_lessons: int
    progress_percent: float
    current_module: Optional[str] = None
