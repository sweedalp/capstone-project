"""
api.py
Central API router — includes all v1 endpoint routers.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import voice_context
from app.api.v1.endpoints import (
    auth,
    courses,
    modules,
    enrollments,
    progress,
    dashboard,
    trainer,
    admin,
    search,
    ai_hub,
    analytics,
    assessments,
    revision,
    saved_resources,
    learning,
    meetings,
    messaging,
    notifications,
    leadership,
    admin_knowledge,
    admin_reports,
    ai_content,
)

api_router = APIRouter()

api_router.include_router(
    voice_context.router,
    tags=["Voice Context"],
)

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(modules.router, prefix="/content", tags=["Content"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(trainer.router, prefix="/trainer", tags=["Trainer"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(ai_hub.router, prefix="/ai-hub", tags=["AI Hub"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(revision.router, prefix="/revision", tags=["Revision"])
api_router.include_router(saved_resources.router, prefix="/saved-resources", tags=["Saved Resources"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(messaging.router, prefix="/messaging", tags=["Messaging"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin_knowledge.router, prefix="/admin/knowledge", tags=["Admin Knowledge"])
api_router.include_router(admin_reports.router, prefix="/admin/reports", tags=["Admin Reports"])
api_router.include_router(leadership.router, prefix="/leadership", tags=["Leadership"])
api_router.include_router(ai_content.router, tags=["AI Content"])