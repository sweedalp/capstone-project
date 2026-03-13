"""
Course & Category Endpoints
"""

from datetime import date
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import HTMLResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.crud import course as course_crud
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.models.enrollment import Enrollment, Progress
from app.models.module import Module, Lesson
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
            is_enrolled=enr.is_enrolled,
            current_module=cur_mod,
        ))
    return results


# ── CERTIFICATE ─────────────────────────────────────────────────────

@router.get("/{course_id}/certificate")
def download_certificate(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and download a completion certificate for a course."""
    c = course_crud.get_course_by_id(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")

    enr = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()
    if not enr:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course")

    total = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )
    done = (
        db.query(func.count(Progress.id))
        .filter(Progress.enrollment_id == enr.id, Progress.is_completed.is_(True))
        .scalar() or 0
    )
    if done < total:
        raise HTTPException(
            status_code=400,
            detail=f"Course not yet complete ({done}/{total} lessons done)"
        )

    student_name = current_user.full_name or current_user.username
    issued = date.today().strftime('%B %d, %Y')
    trainer_name = c.trainer.full_name if c.trainer else "AI LMS"

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate – {c.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; }}
  .cert {{ background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; width: 800px; padding: 64px 72px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.08); position: relative; }}
  .cert::before {{ content: ''; position: absolute; inset: 12px; border: 1px solid #dbeafe; border-radius: 10px; pointer-events: none; }}
  .badge {{ width: 72px; height: 72px; background: linear-gradient(135deg,#3b82f6,#6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }}
  .badge svg {{ width: 36px; height: 36px; fill: #fff; }}
  .subtitle {{ font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #64748b; margin-bottom: 20px; }}
  .declares {{ font-size: 15px; color: #64748b; margin-bottom: 8px; }}
  .name {{ font-family: 'Playfair Display', serif; font-size: 42px; color: #0f172a; margin: 8px 0 20px; }}
  .completed {{ font-size: 15px; color: #64748b; margin-bottom: 8px; }}
  .course {{ font-size: 26px; font-weight: 700; color: #1e40af; margin-bottom: 32px; }}
  .divider {{ width: 80px; height: 3px; background: linear-gradient(90deg,#3b82f6,#6366f1); margin: 0 auto 32px; border-radius: 2px; }}
  .meta {{ display: flex; justify-content: space-around; font-size: 13px; color: #475569; }}
  .meta div {{ text-align: center; }}
  .meta strong {{ display: block; font-size: 15px; color: #0f172a; margin-bottom: 2px; }}
  @media print {{ body {{ background: #fff; }} .cert {{ box-shadow: none; }} }}
</style></head>
<body><div class="cert">
  <div class="badge"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
  <p class="subtitle">Certificate of Completion</p>
  <p class="declares">This certifies that</p>
  <div class="name">{student_name}</div>
  <p class="completed">has successfully completed</p>
  <div class="course">{c.title}</div>
  <div class="divider"></div>
  <div class="meta">
    <div><strong>{issued}</strong>Date Issued</div>
    <div><strong>{trainer_name}</strong>Instructor</div>
    <div><strong>AI LMS Platform</strong>Issued By</div>
  </div>
</div></body></html>"""

    return HTMLResponse(
        content=html,
        headers={"Content-Disposition": f'attachment; filename="certificate_{c.title.replace(" ","_")}.html"'}
    )


# ── DEADLINES ────────────────────────────────────────────────────────

@router.post("/deadlines", response_model=DeadlineResponse, status_code=201)
def create_deadline(
    payload: DeadlineCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    return course_crud.create_deadline(db, **payload.model_dump())



