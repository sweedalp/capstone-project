"""
Models package — import everything so Base.metadata sees all tables
"""

from app.models.user import User, UserRole
from app.models.course import Course, Category, Deadline, LevelEnum
from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
from app.models.enrollment import Enrollment, Progress
from app.models.activity import ActivityLog
from app.models.ai_cache import AICache
from app.models.knowledge_model import KnowledgeFile
from app.models.report_model import Report, ScheduledReport

__all__ = [
    "User", "UserRole",
    "Course", "Category", "Deadline", "LevelEnum",
    "Module", "Lesson", "LessonContent", "LessonTypeEnum", "ContentTypeEnum",
    "Enrollment", "Progress",
    "ActivityLog",
    "AICache",
    "KnowledgeFile",
    "Report", "ScheduledReport",
]