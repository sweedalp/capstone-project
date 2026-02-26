"""
Learning Progress Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.crud import course as course_crud
from app.schemas.progress import CourseProgressResponse

router = APIRouter()


@router.get("/progress", response_model=List[CourseProgressResponse])
def get_all_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = enrollment_crud.get_user_enrollments(db, current_user.id)
    results = []
    for enr in enrollments:
        c = course_crud.get_course_by_id(db, enr.course_id)
        if not c:
            continue
        total = course_crud.count_course_lessons(db, c.id)
        completed = progress_crud.count_completed_lessons(db, enr.id)
        pct = round((completed / total) * 100, 1) if total > 0 else 0.0
        cur_mod = progress_crud.get_current_module_name(db, enr.id, c.id)
        results.append(CourseProgressResponse(
            course_id=c.id, course_title=c.title,
            total_lessons=total, completed_lessons=completed,
            progress_percent=pct, current_module=cur_mod,
        ))
    return results
