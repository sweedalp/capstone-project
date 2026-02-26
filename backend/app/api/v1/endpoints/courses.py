"""
Course & Category Endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.crud import course as course_crud
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.schemas.course import (
    CategoryCreate, CategoryResponse,
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse,
    DeadlineCreate, DeadlineResponse,
)

router = APIRouter()


# ── CATEGORIES ───────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return course_crud.get_categories(db)


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    return course_crud.create_category(db, payload.name, payload.description)


# ── COURSES ──────────────────────────────────────────────────────────

@router.get("/", response_model=List[CourseResponse])
def list_courses(
    category_id: Optional[int] = Query(None),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    published_only = True
    if current_user and current_user.role.value in ["admin", "trainer"]:
        published_only = False

    courses = course_crud.get_courses(
        db, category_id=category_id, level=level,
        search=search, skip=skip, limit=limit,
        published_only=published_only,
    )
    results = []
    for c in courses:
        results.append(CourseResponse(
            id=c.id, title=c.title, description=c.description,
            thumbnail_url=c.thumbnail_url, level=c.level.value,
            duration_minutes=c.duration_minutes, is_published=c.is_published,
            trainer_id=c.trainer_id,
            trainer_name=c.trainer.full_name if c.trainer else None,
            category_id=c.category_id,
            category_name=c.category.name if c.category else None,
            created_at=c.created_at,
            total_modules=len(c.modules) if c.modules else 0,
            total_lessons=course_crud.count_course_lessons(db, c.id),
        ))
    return results


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    c = course_crud.get_course_by_id(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    total_lessons = sum(len(m.lessons) for m in c.modules)
    return CourseResponse(
        id=c.id, title=c.title, description=c.description,
        thumbnail_url=c.thumbnail_url, level=c.level.value,
        duration_minutes=c.duration_minutes, is_published=c.is_published,
        trainer_id=c.trainer_id,
        trainer_name=c.trainer.full_name if c.trainer else None,
        category_id=c.category_id,
        category_name=c.category.name if c.category else None,
        created_at=c.created_at,
        total_modules=len(c.modules), total_lessons=total_lessons,
    )


@router.post("/", response_model=CourseResponse, status_code=201)
def create_course(
    payload: CourseCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    c = course_crud.create_course(
        db, trainer_id=current_user.id,
        title=payload.title, description=payload.description,
        thumbnail_url=payload.thumbnail_url, level=payload.level,
        category_id=payload.category_id,
    )
    return CourseResponse(
        id=c.id, title=c.title, description=c.description,
        thumbnail_url=c.thumbnail_url, level=c.level.value,
        duration_minutes=c.duration_minutes, is_published=c.is_published,
        trainer_id=c.trainer_id, trainer_name=None,
        category_id=c.category_id, category_name=None, created_at=c.created_at,
    )


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int, payload: CourseUpdate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    c = course_crud.get_course_by_id(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role.value != "admin" and c.trainer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")

    c = course_crud.update_course(db, c, **payload.model_dump(exclude_unset=True))
    c.duration_minutes = course_crud.compute_course_duration(db, c.id)
    db.commit()

    return CourseResponse(
        id=c.id, title=c.title, description=c.description,
        thumbnail_url=c.thumbnail_url, level=c.level.value,
        duration_minutes=c.duration_minutes, is_published=c.is_published,
        trainer_id=c.trainer_id,
        trainer_name=c.trainer.full_name if c.trainer else None,
        category_id=c.category_id,
        category_name=c.category.name if c.category else None,
        created_at=c.created_at,
    )


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    c = course_crud.get_course_by_id(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role.value != "admin" and c.trainer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    course_crud.delete_course(db, c)


# ── MY COURSES ───────────────────────────────────────────────────────

@router.get("/my/enrolled", response_model=List[CourseListResponse])
def my_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = enrollment_crud.get_user_enrollments(db, current_user.id)
    results = []
    for enr in enrollments:
        c = course_crud.get_course_by_id(db, enr.course_id)
        if not c:
            continue
        pct = progress_crud.get_course_progress_percent(db, enr.id, c.id)
        cur_mod = progress_crud.get_current_module_name(db, enr.id, c.id)
        results.append(CourseListResponse(
            id=c.id, title=c.title, description=c.description,
            thumbnail_url=c.thumbnail_url, level=c.level.value,
            duration_minutes=c.duration_minutes,
            trainer_name=c.trainer.full_name if c.trainer else None,
            category_name=c.category.name if c.category else None,
            progress_percent=pct, is_wishlisted=enr.is_wishlisted,
            current_module=cur_mod,
        ))
    return results


# ── DEADLINES ────────────────────────────────────────────────────────

@router.post("/deadlines", response_model=DeadlineResponse, status_code=201)
def create_deadline(
    payload: DeadlineCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    return course_crud.create_deadline(db, **payload.model_dump())
