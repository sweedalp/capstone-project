"""
Admin API Endpoints
Matches existing backend structure:
- Sync SQLAlchemy (not async)
- from app.core.database import get_db
- from app.models.* import ...
- Admin only access
"""

import os
import csv
import io
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.course import Course, Category, LevelEnum
from app.models.module import Module, Lesson, LessonContent, ContentTypeEnum
from app.models.enrollment import Enrollment
from app.models.activity import ActivityLog

import datetime

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(f"{UPLOAD_DIR}/videos", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/pdfs", exist_ok=True)


# ── Auth — admin only ─────────────────────────────────────
def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ── Pydantic schemas ──────────────────────────────────────
class CourseCreateAdmin(BaseModel):
    title: str
    description: Optional[str] = None
    level: Optional[str] = "beginner"
    category_id: Optional[int] = None

class CourseUpdateAdmin(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    is_published: Optional[bool] = None

class ModuleCreateAdmin(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0

class ResetPasswordAdmin(BaseModel):
    new_password: str

class ChangeRoleRequest(BaseModel):
    role: str  # "admin", "trainer", "learner"


# ━━━━━━━━━━━━━━━━━━━━ Dashboard Stats ━━━━━━━━━━━━━━━━━━━━
@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Full platform stats for admin dashboard"""
    total_users = db.query(func.count(User.id)).scalar()
    total_trainers = db.query(func.count(User.id)).filter(User.role == UserRole.trainer).scalar()
    total_learners = db.query(func.count(User.id)).filter(User.role == UserRole.learner).scalar()
    total_courses = db.query(func.count(Course.id)).scalar()
    published_courses = db.query(func.count(Course.id)).filter(Course.is_published == True).scalar()
    total_enrollments = db.query(func.count(Enrollment.id)).scalar()

    total_lessons = 0
    for mod in db.query(Module).all():
        total_lessons += len(mod.lessons)

    # Recent activity
    recent_activity = db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).limit(10).all()

    return {
        "total_users": total_users,
        "total_trainers": total_trainers,
        "total_learners": total_learners,
        "total_courses": total_courses,
        "published_courses": published_courses,
        "draft_courses": total_courses - published_courses,
        "total_enrollments": total_enrollments,
        "total_lessons": total_lessons,
        "recent_activity": [
            {
                "id": a.id,
                "action": a.action,
                "description": a.description,
                "user_id": a.user_id,
                "course_id": a.course_id,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent_activity
        ],
    }


# ━━━━━━━━━━━━━━━━━━━━ Users ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """List all users with pagination, role filter, and search"""
    query = db.query(User)

    if role and role != "all":
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass

    if search:
        query = query.filter(
            User.full_name.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%")
        )

    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
        "users": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
    }


@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Enable or disable a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    user.is_active = not user.is_active
    db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="user_toggled",
        description=f"{'Activated' if user.is_active else 'Deactivated'} user: {user.email}",
        icon="🔄",
    ))
    db.commit()

    return {"user_id": user_id, "is_active": user.is_active}


@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    payload: ResetPasswordAdmin,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Reset a user's password"""
    from app.core.security import get_password_hash
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="password_reset",
        description=f"Password reset for: {user.email}",
        icon="🔑",
    ))
    db.commit()

    return {"message": "Password reset successfully", "user_id": user_id}


@router.post("/users/{user_id}/change-role")
def change_user_role(
    user_id: int,
    payload: ChangeRoleRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Change a user's role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    try:
        new_role = UserRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}. Use: admin, trainer, learner")

    old_role = user.role
    user.role = new_role
    db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        action="role_changed",
        description=f"Changed {user.email} role: {old_role} → {payload.role}",
        icon="👤",
    ))
    db.commit()

    return {"user_id": user_id, "old_role": old_role, "new_role": payload.role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Delete a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.delete(user)
    db.commit()
    return {"message": "User deleted", "user_id": user_id}


# ━━━━━━━━━━━━━━━━━━━━ Courses ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses")
def list_all_courses(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """List all courses across all trainers"""
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        trainer = db.query(User).filter(User.id == c.trainer_id).first()
        total_lessons = sum(len(m.lessons) for m in c.modules)
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "level": c.level,
            "is_published": c.is_published,
            "trainer_id": c.trainer_id,
            "trainer_name": trainer.full_name if trainer else "Unknown",
            "trainer_email": trainer.email if trainer else "",
            "total_modules": len(c.modules),
            "total_lessons": total_lessons,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.post("/courses")
def create_course_admin(
    payload: CourseCreateAdmin,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin creates a course"""
    level_map = {
        "beginner": LevelEnum.beginner,
        "intermediate": LevelEnum.intermediate,
        "advanced": LevelEnum.advanced,
    }
    course = Course(
        title=payload.title,
        description=payload.description,
        level=level_map.get(payload.level or "beginner", LevelEnum.beginner),
        category_id=payload.category_id,
        trainer_id=admin.id,
        is_published=False,
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    db.add(ActivityLog(
        user_id=admin.id,
        course_id=course.id,
        action="course_created",
        description=f"Admin created course: {payload.title}",
        icon="📚",
    ))
    db.commit()

    return {"id": course.id, "title": course.title, "message": "Course created"}


@router.put("/courses/{course_id}")
def update_course_admin(
    course_id: int,
    payload: CourseUpdateAdmin,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin updates any course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
    if payload.is_published is not None:
        course.is_published = payload.is_published
    if payload.level is not None:
        level_map = {"beginner": LevelEnum.beginner, "intermediate": LevelEnum.intermediate, "advanced": LevelEnum.advanced}
        course.level = level_map.get(payload.level, LevelEnum.beginner)

    db.commit()
    return {"id": course.id, "title": course.title, "message": "Course updated"}


@router.delete("/courses/{course_id}")
def delete_course_admin(
    course_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin deletes any course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted", "course_id": course_id}


@router.post("/courses/{course_id}/publish")
def publish_course_admin(
    course_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin publishes a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.modules:
        raise HTTPException(status_code=400, detail="Course must have at least one module")

    course.is_published = True
    db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        course_id=course.id,
        action="course_published",
        description=f"Admin published: {course.title}",
        icon="🚀",
    ))
    db.commit()

    return {"message": "Course published", "course_id": course_id}


@router.post("/courses/{course_id}/unpublish")
def unpublish_course_admin(
    course_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_published = False
    db.commit()
    return {"message": "Course unpublished", "course_id": course_id}


# ━━━━━━━━━━━━━━━━━━━━ Modules ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/courses/{course_id}/modules")
def create_module_admin(
    course_id: int,
    payload: ModuleCreateAdmin,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    max_order = db.query(func.max(Module.order_index)).filter(
        Module.course_id == course_id
    ).scalar() or 0

    mod = Module(
        course_id=course_id,
        title=payload.title,
        description=payload.description,
        order_index=payload.order_index or (max_order + 1),
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return {"id": mod.id, "title": mod.title, "course_id": course_id}


@router.delete("/modules/{module_id}")
def delete_module_admin(
    module_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(mod)
    db.commit()
    return {"message": "Module deleted"}


# ━━━━━━━━━━━━━━━━━━━━ Video / PDF Upload ━━━━━━━━━━━━━━━━━
@router.post("/modules/{module_id}/upload-video")
def upload_module_video(
    module_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin uploads a video for a module lesson"""
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")

    allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only video files allowed")

    filename = f"{module_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/videos/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    video_url = f"/static/uploads/videos/{filename}"

    # Find or create lesson
    lesson = db.query(Lesson).filter(Lesson.module_id == module_id).first()
    if not lesson:
        from app.models.module import LessonTypeEnum
        lesson = Lesson(module_id=module_id, title=f"{mod.title} — Video", order_index=0, lesson_type=LessonTypeEnum.video)
        db.add(lesson)
        db.commit()
        db.refresh(lesson)

    # Save video URL as lesson content
    db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson.id,
        LessonContent.content_type == ContentTypeEnum.video_url,
    ).delete()
    db.add(LessonContent(lesson_id=lesson.id, content_type=ContentTypeEnum.video_url, content=video_url))
    db.commit()

    db.add(ActivityLog(
        user_id=admin.id,
        course_id=mod.course_id,
        action="video_uploaded",
        description=f"Admin uploaded video for module: {mod.title}",
        icon="🎥",
    ))
    db.commit()

    return {"status": "uploaded", "video_url": video_url, "lesson_id": lesson.id}


@router.post("/modules/{module_id}/upload-pdf")
def upload_module_pdf(
    module_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Admin uploads a PDF for a module"""
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    filename = f"{module_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/pdfs/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_url = f"/static/uploads/pdfs/{filename}"

    lesson = db.query(Lesson).filter(Lesson.module_id == module_id).first()
    if not lesson:
        from app.models.module import LessonTypeEnum
        lesson = Lesson(module_id=module_id, title=f"{mod.title} — Material", order_index=0, lesson_type=LessonTypeEnum.text)
        db.add(lesson)
        db.commit()
        db.refresh(lesson)

    db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson.id,
        LessonContent.content_type == ContentTypeEnum.file_url,
    ).delete()
    db.add(LessonContent(lesson_id=lesson.id, content_type=ContentTypeEnum.file_url, content=pdf_url))
    db.commit()

    return {"status": "uploaded", "pdf_url": pdf_url, "lesson_id": lesson.id}


# ━━━━━━━━━━━━━━━━━━━━ Activity Log ━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/activities")
def list_activities(
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Recent platform activity"""
    activities = db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": a.id,
            "action": a.action,
            "description": a.description,
            "icon": a.icon if hasattr(a, 'icon') else "📋",
            "user_id": a.user_id,
            "course_id": a.course_id,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]


# ━━━━━━━━━━━━━━━━━━━━ Analytics ━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/analytics/enrollment-trend")
def enrollment_trend(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Enrollment counts grouped by month"""
    enrollments = db.query(Enrollment).all()
    trend = {}
    for e in enrollments:
        if e.enrolled_at:
            key = e.enrolled_at.strftime("%Y-%m")
            trend[key] = trend.get(key, 0) + 1

    return [{"month": k, "count": v} for k, v in sorted(trend.items())]


@router.get("/analytics/completion")
def completion_rates(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Course completion rates"""
    courses = db.query(Course).filter(Course.is_published == True).all()
    result = []
    for c in courses:
        total_enrolled = db.query(func.count(Enrollment.id)).filter(
            Enrollment.course_id == c.id
        ).scalar()
        result.append({
            "course_id": c.id,
            "course_title": c.title,
            "total_enrolled": total_enrolled,
            "completion_rate": 0,  # extend with real Progress data if needed
        })
    return result


# ━━━━━━━━━━━━━━━━━━━━ Export CSV ━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/export/{export_type}")
def export_report(
    export_type: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Export CSV: users | courses | activities"""
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "users":
        writer.writerow(["ID", "Name", "Email", "Role", "Active", "Joined"])
        users = db.query(User).order_by(User.id).all()
        for u in users:
            writer.writerow([
                u.id, u.full_name, u.email, u.role,
                u.is_active,
                u.created_at.isoformat() if u.created_at else "",
            ])
    elif export_type == "courses":
        writer.writerow(["ID", "Title", "Description", "Published", "Level", "Created At"])
        courses = db.query(Course).order_by(Course.id).all()
        for c in courses:
            writer.writerow([
                c.id, c.title, c.description or "",
                c.is_published, c.level,
                c.created_at.isoformat() if c.created_at else "",
            ])
    elif export_type == "activities":
        writer.writerow(["ID", "Action", "Description", "User ID", "Course ID", "Timestamp"])
        activities = db.query(ActivityLog).order_by(
            ActivityLog.created_at.desc()
        ).limit(500).all()
        for a in activities:
            writer.writerow([
                a.id, a.action, a.description or "",
                a.user_id, a.course_id or "",
                a.created_at.isoformat() if a.created_at else "",
            ])
    else:
        raise HTTPException(status_code=400, detail="Invalid type. Use: users, courses, activities")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={export_type}_report.csv"},
    )


# ━━━━━━━━━━━━━━━━━━━━ Categories ━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/categories")
def get_categories(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]


@router.post("/categories")
def create_category(
    name: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name}