"""
Course & Category Schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

# ── Category ────────────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Course ──────────────────────────────────────────────────────────
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: str = "beginner"            # beginner | intermediate | advanced
    category_id: Optional[int] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: Optional[str] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    level: str
    duration_minutes: int
    is_published: bool
    trainer_id: int
    trainer_name: Optional[str] = None
    category_id: Optional[int]
    category_name: Optional[str] = None
    created_at: datetime
    total_modules: int = 0
    total_lessons: int = 0

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    """Used on My Courses page — includes learner's progress"""
    id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    level: str
    duration_minutes: int
    trainer_name: Optional[str] = None
    category_name: Optional[str] = None
    progress_percent: float = 0.0
    is_wishlisted: bool = False
    current_module: Optional[str] = None

    class Config:
        from_attributes = True


# ── Deadline ────────────────────────────────────────────────────────
class DeadlineCreate(BaseModel):
    course_id: int
    title: str
    due_date: datetime
    weight_percent: Optional[float] = None


class DeadlineResponse(BaseModel):
    id: int
    course_id: int
    title: str
    due_date: datetime
    weight_percent: Optional[float] = None

    class Config:
        from_attributes = True


def get_upcoming_deadlines(db: Session, course_ids: list, limit: int = 5) -> list:
    """
    Returns upcoming deadlines.
    Extend this when you add an Assessment/Quiz model with due_date.
    Returns empty list safely for now.
    """
    return []