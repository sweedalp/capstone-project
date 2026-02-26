"""
API Router — combines all endpoint routers
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    courses,
    modules,
    enrollments,
    progress,
    dashboard,
    analytics,
    learning,
    search,
    ai_hub,
    assessments,
    revision,
)

api_router = APIRouter()

# ── Core LMS ───────────────────────────────────────────────────────
api_router.include_router(auth.router,        prefix="/auth",        tags=["Authentication"])
api_router.include_router(courses.router,     prefix="/courses",     tags=["Courses"])
api_router.include_router(modules.router,     prefix="/content",     tags=["Modules & Lessons"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(progress.router,    prefix="/progress",    tags=["Progress"])
api_router.include_router(dashboard.router,   prefix="/dashboard",   tags=["Dashboard"])
api_router.include_router(search.router,      prefix="/search",      tags=["Search & QA"])
api_router.include_router(analytics.router,   prefix="/analytics",   tags=["Analytics"])
api_router.include_router(learning.router,    prefix="/learning",    tags=["Learning Progress"])
api_router.include_router(revision.router,    prefix="/revision",    tags=["Revision Assistant"])


# ── AI Features ────────────────────────────────────────────────────
api_router.include_router(ai_hub.router,      prefix="/ai-hub",      tags=["AI Learning Hub"])
api_router.include_router(assessments.router,  prefix="/assessments", tags=["Assessments"])


# ── Phase 4 — not yet built ────────────────────────────────────────
# api_router.include_router(videos.router,    prefix="/videos",    tags=["Videos"])
# api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Base"])
# api_router.include_router(voice.router,     prefix="/voice",     tags=["Voice Assistant"])
# api_router.include_router(avatar.router,    prefix="/avatar",    tags=["AI Avatar"])