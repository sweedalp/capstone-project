"""
Dashboard Schemas — aggregated data for the Learner Dashboard page
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardCourse(BaseModel):
    """Single course card on the dashboard"""
    id: int
    title: str
    thumbnail_url: Optional[str]
    level: str
    category_name: Optional[str]
    progress_percent: float
    current_module: Optional[str] = None


class ActivityItem(BaseModel):
    """One row in the Recent Activity sidebar"""
    id: int
    action: str
    description: str
    icon: str
    created_at: datetime

    class Config:
        from_attributes = True


class DeadlineItem(BaseModel):
    """One row in the Upcoming Deadlines sidebar"""
    id: int
    course_id: int
    title: str
    due_date: datetime
    weight_percent: Optional[float]

    class Config:
        from_attributes = True


class StruggleItem(BaseModel):
    """One item in the 'Based on your struggles' section"""
    lesson_id: int
    lesson_title: str
    lesson_type: str
    reason: str  # "You scored 40% on the Functions quiz"


class DailyBriefItem(BaseModel):
    """Daily learning brief card — AI summary of yesterday's session"""
    available: bool
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = None
    course_title: Optional[str] = None
    module_title: Optional[str] = None
    time_spent_minutes: Optional[int] = None
    has_ai_content: bool = False
    message: Optional[str] = None


class UpcomingLessonItem(BaseModel):
    """One lesson card in the 'Up Next' sidebar panel"""
    lesson_id: int
    lesson_title: str
    lesson_type: str
    course_id: int
    course_title: str


class DashboardResponse(BaseModel):
    """Full payload for GET /api/v1/dashboard"""
    welcome_name: str
    weekly_goal_percent: float
    modules_remaining: int
    courses_in_progress: List[DashboardCourse]
    recent_activity: List[ActivityItem]
    upcoming_deadlines: List[DeadlineItem]
    struggles: List[StruggleItem]
    daily_brief: DailyBriefItem
    # ── Stats cards ───────────────────────────────────────────────
    total_enrolled: int = 0
    lessons_completed: int = 0
    lessons_this_week: int = 0
    average_quiz_score: float = 0.0
    quiz_trend: str = 'No change'
    study_streak: int = 0
    # ── Up Next panel ─────────────────────────────────────────────
    upcoming_lessons: List[UpcomingLessonItem] = []