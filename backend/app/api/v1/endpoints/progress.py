"""
Progress Endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.crud import module as module_crud
from app.crud import course as course_crud
from app.schemas.progress import ProgressCreate, ProgressResponse, CourseProgressResponse
from app.models.activity import ActivityLog

router = APIRouter()


@router.post("/complete", response_model=ProgressResponse, status_code=201)
def complete_lesson(
    payload: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = module_crud.get_lesson_by_id(db, payload.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    mod = module_crud.get_module_by_id(db, lesson.module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    enrollment = enrollment_crud.get_enrollment(db, current_user.id, mod.course_id)
    if not enrollment:
        raise HTTPException(status_code=400, detail="You are not enrolled in this course")

    progress = progress_crud.mark_lesson_complete(
        db, enrollment_id=enrollment.id, lesson_id=payload.lesson_id,
        score=payload.score, time_spent_seconds=payload.time_spent_seconds,
    )

    activity = ActivityLog(
        user_id=current_user.id, course_id=mod.course_id,
        action="completed_lesson", description=f"Completed: {lesson.title}", icon="✅",
    )
    db.add(activity)
    db.commit()
    return ProgressResponse.model_validate(progress)


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
def course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = course_crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = enrollment_crud.get_enrollment(db, current_user.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Not enrolled")

    total = course_crud.count_course_lessons(db, course_id)
    completed = progress_crud.count_completed_lessons(db, enrollment.id)
    pct = round((completed / total) * 100, 1) if total > 0 else 0.0
    cur_mod = progress_crud.get_current_module_name(db, enrollment.id, course_id)

    return CourseProgressResponse(
        course_id=course_id, course_title=course.title,
        total_lessons=total, completed_lessons=completed,
        progress_percent=pct, current_module=cur_mod,
    )
