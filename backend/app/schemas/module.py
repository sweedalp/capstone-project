"""
Module, Lesson & LessonContent Schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Module ──────────────────────────────────────────────────────────
class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class ModuleResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    order_index: int
    total_lessons: int = 0
    completed_lessons: int = 0          # populated for enrolled learners

    class Config:
        from_attributes = True


# ── Lesson ──────────────────────────────────────────────────────────
class LessonCreate(BaseModel):
    title: str
    lesson_type: str = "video"          # video | text | quiz
    order_index: int = 0
    duration_minutes: int = 0


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    lesson_type: Optional[str] = None
    order_index: Optional[int] = None
    duration_minutes: Optional[int] = None


class LessonContentCreate(BaseModel):
    content_type: str                   # video_url | text_body | quiz_json | file_url
    content: str


class LessonContentResponse(BaseModel):
    id: int
    lesson_id: int
    content_type: str
    content: str

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    module_id: int
    title: str
    lesson_type: str
    order_index: int
    duration_minutes: int
    is_completed: bool = False          # populated for enrolled learners
    score: Optional[float] = None       # populated for quizzes
    contents: List[LessonContentResponse] = []

    class Config:
        from_attributes = True


# ── Course Overview (nested) ───────────────────────────────────────
class ModuleWithLessons(BaseModel):
    """Full module detail for Course Overview page"""
    id: int
    title: str
    description: Optional[str]
    order_index: int
    lessons: List[LessonResponse] = []
    total_lessons: int = 0
    completed_lessons: int = 0

    class Config:
        from_attributes = True
