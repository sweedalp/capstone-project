"""
Admin Endpoints — Stats, Users, Categories, Courses, Activities, Export
"""

import csv
import io
import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role, hash_password as get_password_hash
from app.models.user import User, UserRole
from app.models.course import Course, Category, LevelEnum
from app.models.enrollment import Enrollment
from app.models.activity import ActivityLog

router = APIRouter()


def _to_admin_user_dict(u: User) -> dict:
    role_map = {
        "admin":      "Admin",
        "trainer":    "Trainer",
        "learner":    "Learner",
        "leadership": "Leadership",
    }
    return {
        "id":         u.id,
        "full_name":  u.full_name or getattr(u, "username", ""),
        "email":      u.email,
        "role":       role_map.get(u.role.value, u.role.value.title()),
        "is_active":  u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


# ── Stats ─────────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    total_users       = db.query(func.count(User.id)).scalar() or 0
    total_courses     = db.query(func.count(Course.id)).scalar() or 0
    published_courses = db.query(func.count(Course.id)).filter(Course.is_published.is_(True)).scalar() or 0
    total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0
    total_trainers    = db.query(func.count(User.id)).filter(User.role == UserRole("trainer")).scalar() or 0
    total_learners    = db.query(func.count(User.id)).filter(User.role == UserRole("learner")).scalar() or 0

    # Active learners = role is learner AND account is active
    active_learners = db.query(func.count(User.id)).filter(
        User.role == UserRole("learner"),
        User.is_active.is_(True),
    ).scalar() or 0

    return {
        "total_users":       total_users,
        "active_learners":   active_learners,
        "total_courses":     total_courses,
        "published_courses": published_courses,
        "draft_courses":     total_courses - published_courses,
        "total_enrollments": total_enrollments,
        "total_trainers":    total_trainers,
        "total_learners":    total_learners,
    }


# ── Users ─────────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    page:      int           = Query(1,  ge=1),
    page_size: int           = Query(20, ge=1, le=100),
    role:      Optional[str] = Query(None),
    search:    Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    query = db.query(User)
    if role and role not in ("all", ""):
        try:
            query = query.filter(User.role == UserRole(role))
        except ValueError:
            pass
    if search:
        query = query.filter(
            User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        )
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total":     total,
        "page":      page,
        "page_size": page_size,
        "users":     [_to_admin_user_dict(u) for u in users],
    }


@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return _to_admin_user_dict(user)


@router.post("/users/{user_id}/change-role")
def change_role(
    user_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.role = UserRole(payload["role"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    db.commit()
    return _to_admin_user_dict(user)


@router.post("/users/{user_id}/reset-password")
def reset_password(
    user_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(payload["new_password"])
    db.commit()
    return {"message": "Password reset"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


# ── Categories ────────────────────────────────────────────────────
@router.get("/categories")
def list_categories(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    categories = db.query(Category).order_by(Category.name).all()
    return [
        {
            "id":           c.id,
            "name":         c.name,
            "description":  getattr(c, "description", None),
            "course_count": db.query(func.count(Course.id)).filter(Course.category_id == c.id).scalar() or 0,
        }
        for c in categories
    ]


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    name = payload.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")
    existing = db.query(Category).filter(Category.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")
    category = Category(name=name, description=payload.get("description", ""))
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"id": category.id, "name": category.name, "description": getattr(category, "description", None), "course_count": 0}


@router.put("/categories/{category_id}")
def update_category(
    category_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    name = payload.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")
    dup = db.query(Category).filter(Category.name.ilike(name), Category.id != category_id).first()
    if dup:
        raise HTTPException(status_code=409, detail="Category name already in use")
    category.name = name
    if "description" in payload:
        category.description = payload["description"]
    db.commit()
    db.refresh(category)
    return {"id": category.id, "name": category.name, "description": getattr(category, "description", None)}


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.query(Course).filter(Course.category_id == category_id).update({"category_id": None})
    db.delete(category)
    db.commit()


# ── Courses ───────────────────────────────────────────────────────
@router.get("/courses")
def list_courses(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        trainer  = db.query(User).filter(User.id == c.trainer_id).first()
        category = db.query(Category).filter(Category.id == c.category_id).first() if getattr(c, "category_id", None) else None
        total_lessons = sum(len(m.lessons) for m in c.modules)
        enrollment_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
        result.append({
            "id":               c.id,
            "title":            c.title,
            "description":      c.description,
            "level":            c.level.value if hasattr(c.level, "value") else c.level,
            "is_published":     c.is_published,
            "trainer_name":     trainer.full_name if trainer else "Unknown",
            "trainer_id":       c.trainer_id,
            "category":         category.name if category else None,
            "category_id":      getattr(c, "category_id", None),
            "total_modules":    len(c.modules),
            "total_lessons":    total_lessons,
            "enrollment_count": enrollment_count,
            "created_at":       c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.get("/courses/{course_id}")
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    trainer  = db.query(User).filter(User.id == c.trainer_id).first()
    category = db.query(Category).filter(Category.id == c.category_id).first() if getattr(c, "category_id", None) else None
    modules  = []
    for m in c.modules:
        modules.append({
            "id":    m.id,
            "title": m.title,
            "order": getattr(m, "order", 0),
            "lessons": [
                {
                    "id":       l.id,
                    "title":    l.title,
                    "type":     l.lesson_type.value if hasattr(l.lesson_type, "value") else l.lesson_type,
                    "duration": getattr(l, "duration_minutes", None),
                }
                for l in m.lessons
            ],
        })
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    return {
        "id":               c.id,
        "title":            c.title,
        "description":      c.description,
        "level":            c.level.value if hasattr(c.level, "value") else c.level,
        "is_published":     c.is_published,
        "trainer_name":     trainer.full_name if trainer else "Unknown",
        "trainer_email":    trainer.email if trainer else None,
        "category":         category.name if category else None,
        "category_id":      getattr(c, "category_id", None),
        "modules":          modules,
        "total_modules":    len(modules),
        "total_lessons":    sum(len(m["lessons"]) for m in modules),
        "enrollment_count": len(enrollments),
        "created_at":       c.created_at.isoformat() if c.created_at else None,
    }


@router.post("/courses")
def create_course(
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    level_map = {
        "beginner":     LevelEnum.beginner,
        "intermediate": LevelEnum.intermediate,
        "advanced":     LevelEnum.advanced,
    }
    category_id = payload.get("category_id")
    if category_id:
        if not db.query(Category).filter(Category.id == category_id).first():
            raise HTTPException(status_code=404, detail="Category not found")
    course = Course(
        title=payload["title"],
        description=payload.get("description"),
        level=level_map.get(payload.get("level", "beginner"), LevelEnum.beginner),
        trainer_id=_admin.id,
        category_id=category_id,
        is_published=False,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "title": course.title}


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Deleted"}


@router.post("/courses/{course_id}/publish")
def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_published = True
    db.commit()
    return {"message": "Published"}


@router.post("/courses/{course_id}/unpublish")
def unpublish_course(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_published = False
    db.commit()
    return {"message": "Unpublished"}


# ── Activities ────────────────────────────────────────────────────
@router.get("/activities")
def list_activities(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    activities = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id":          a.id,
            "action":      a.action,
            "description": a.description,
            "icon":        getattr(a, "icon", "📋"),
            "user_id":     a.user_id,
            "course_id":   a.course_id,
            "created_at":  a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]


# ── CSV Export ────────────────────────────────────────────────────
@router.get("/export/{export_type}")
def export_csv(
    export_type: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    output = io.StringIO()
    writer = csv.writer(output)
    if export_type == "users":
        writer.writerow(["ID", "Name", "Email", "Role", "Active", "Joined"])
        for u in db.query(User).all():
            writer.writerow([u.id, u.full_name, u.email, u.role.value, u.is_active, u.created_at])
    elif export_type == "courses":
        writer.writerow(["ID", "Title", "Published", "Level", "Category", "Enrollments", "Created"])
        for c in db.query(Course).all():
            cat = db.query(Category).filter(Category.id == c.category_id).first() if getattr(c, "category_id", None) else None
            enr = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            writer.writerow([c.id, c.title, c.is_published, c.level, cat.name if cat else "", enr, c.created_at])
    elif export_type == "activities":
        writer.writerow(["ID", "Action", "Description", "Created At"])
        for a in db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(500).all():
            writer.writerow([a.id, a.action, a.description, a.created_at])
    else:
        raise HTTPException(status_code=400, detail="Invalid type. Use: users, courses, activities")
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={export_type}_report.csv"},
    )


# ── Thumbnail Upload ─────────────────────────────────────────────
THUMB_DIR = "static/uploads/thumbnails"
os.makedirs(THUMB_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/upload-thumbnail")
async def upload_thumbnail(
    file: UploadFile = File(...),
    _admin: User = Depends(require_role(["admin", "trainer"])),
):
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WebP, GIF) are allowed")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")
    save_path = os.path.join(THUMB_DIR, unique_name)
    with open(save_path, "wb") as f:
        f.write(contents)
    url = f"/static/uploads/thumbnails/{unique_name}"
    return {"url": url, "filename": unique_name}


@router.post("/courses/{course_id}/upload-thumbnail")
async def upload_course_thumbnail(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin", "trainer"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WebP, GIF) are allowed")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")
    save_path = os.path.join(THUMB_DIR, unique_name)
    with open(save_path, "wb") as f:
        f.write(contents)
    url = f"/static/uploads/thumbnails/{unique_name}"
    course.thumbnail_url = url
    db.commit()
    return {"url": url, "filename": unique_name, "course_id": course_id}