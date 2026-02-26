# Python __init__ files for package structure
"""
Models package — import everything so Base.metadata sees all tables
"""

from app.models.user import User, UserRole
from app.models.course import Course, Category, Deadline, LevelEnum
from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
from app.models.enrollment import Enrollment, Progress
from app.models.activity import ActivityLog
from app.models.ai_cache import AICache

__all__ = [
    "User", "UserRole",
    "Course", "Category", "Deadline", "LevelEnum",
    "Module", "Lesson", "LessonContent", "LessonTypeEnum", "ContentTypeEnum",
    "Enrollment", "Progress",
    "ActivityLog",
    "AICache",
]
