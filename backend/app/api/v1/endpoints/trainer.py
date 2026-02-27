"""
Trainer API Endpoints
Matches existing backend structure:
- Sync SQLAlchemy (not async)
- from app.core.database import get_db
- from app.models.course import Course
- from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
"""

import os
import shutil
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User,  UserRole
from app.models.course import Course, Category, LevelEnum
from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
from app.models.activity import ActivityLog

import datetime

router = APIRouter()

# ── Upload directory ──────────────────────────────────────────────
UPLOAD_DIR = "static/uploads"
os.makedirs(f"{UPLOAD_DIR}/videos", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/pdfs", exist_ok=True)


# ── Auth dependency — trainer or admin only ───────────────────────
def get_trainer_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.trainer, RoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Trainer or Admin access required")
    return current_user


# ── Pydantic schemas ──────────────────────────────────────────────
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    level: Optional[str] = "beginner"
    category_id: Optional[int] = None
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    category_id: Optional[int] = None
    thumbnail_url: Optional[str] = None


class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None


class LessonCreate(BaseModel):
    title: str
    lesson_type: str = "video"
    duration_minutes: Optional[int] = 0
    content: Optional[str] = None        # video URL or text body
    content_type: Optional[str] = None   # video_url, text_body, file_url


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    content: Optional[str] = None
    content_type: Optional[str] = None


class QuizCreate(BaseModel):
    title: str
    questions: list  # list of question dicts


# ━━━━━━━━━━━━━━━━━━━━ Dashboard Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/stats")
def get_trainer_stats(
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Get trainer dashboard stats"""
    my_courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    course_ids = [c.id for c in my_courses]

    total_courses = len(my_courses)
    published_courses = sum(1 for c in my_courses if c.is_published)

    # Count total lessons across all courses
    total_lessons = 0
    for course in my_courses:
        for mod in course.modules:
            total_lessons += len(mod.lessons)

    # Count total enrolled students
    from app.models.enrollment import Enrollment
    total_students = db.query(func.count(Enrollment.id)).filter(
        Enrollment.course_id.in_(course_ids)
    ).scalar() if course_ids else 0

    return {
        "total_courses": total_courses,
        "published_courses": published_courses,
        "draft_courses": total_courses - published_courses,
        "total_lessons": total_lessons,
        "total_students": total_students,
    }


# ━━━━━━━━━━━━━━━━━━━━ Courses ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses")
def get_trainer_courses(
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Get all courses created by this trainer"""
    courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    result = []
    for c in courses:
        total_lessons = sum(len(m.lessons) for m in c.modules)
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "level": c.level,
            "is_published": c.is_published,
            "thumbnail_url": c.thumbnail_url,
            "total_modules": len(c.modules),
            "total_lessons": total_lessons,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.post("/courses")
def create_course(
    payload: CourseCreate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Create a new course"""
    level = LevelEnum.beginner
    if payload.level == "intermediate":
        level = LevelEnum.intermediate
    elif payload.level == "advanced":
        level = LevelEnum.advanced

    course = Course(
        title=payload.title,
        description=payload.description,
        level=level,
        category_id=payload.category_id,
        thumbnail_url=payload.thumbnail_url,
        trainer_id=user.id,
        is_published=False,
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    # Log activity
    db.add(ActivityLog(
        user_id=user.id,
        course_id=course.id,
        action="course_created",
        description=f"Created course: {payload.title}",
        icon="📚",
    ))
    db.commit()

    return {"id": course.id, "title": course.title, "message": "Course created successfully"}


@router.put("/courses/{course_id}")
def update_course(
    course_id: int,
    payload: CourseUpdate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Update course details"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
    if payload.thumbnail_url is not None:
        course.thumbnail_url = payload.thumbnail_url
    if payload.category_id is not None:
        course.category_id = payload.category_id
    if payload.level is not None:
        level_map = {"beginner": LevelEnum.beginner, "intermediate": LevelEnum.intermediate, "advanced": LevelEnum.advanced}
        course.level = level_map.get(payload.level, LevelEnum.beginner)

    db.commit()
    return {"id": course.id, "title": course.title, "message": "Course updated"}


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Delete a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}


@router.post("/courses/{course_id}/publish")
def publish_course(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Publish a course so learners can see it"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")
    if not course.modules:
        raise HTTPException(status_code=400, detail="Course must have at least one module")

    course.is_published = True
    db.commit()

    db.add(ActivityLog(
        user_id=user.id,
        course_id=course.id,
        action="course_published",
        description=f"Published: {course.title}",
        icon="🚀",
    ))
    db.commit()

    return {"message": "Course published", "course_id": course_id}


@router.post("/courses/{course_id}/unpublish")
def unpublish_course(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Unpublish a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    course.is_published = False
    db.commit()
    return {"message": "Course unpublished", "course_id": course_id}


# ━━━━━━━━━━━━━━━━━━━━ Modules ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses/{course_id}/modules")
def get_modules(
    course_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Get all modules for a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    result = []
    for mod in course.modules:
        result.append({
            "id": mod.id,
            "title": mod.title,
            "description": mod.description,
            "order_index": mod.order_index,
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "lesson_type": l.lesson_type,
                    "duration_minutes": l.duration_minutes,
                    "order_index": l.order_index,
                }
                for l in mod.lessons
            ]
        })
    return result


@router.post("/courses/{course_id}/modules")
def create_module(
    course_id: int,
    payload: ModuleCreate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Create a new module inside a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    # Auto order index
    max_order = db.query(func.max(Module.order_index)).filter(
        Module.course_id == course_id
    ).scalar() or 0

    mod = Module(
        course_id=course_id,
        title=payload.title,
        description=payload.description,
        order_index=max_order + 1,
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)

    return {"id": mod.id, "title": mod.title, "course_id": course_id, "order_index": mod.order_index}


@router.delete("/modules/{module_id}")
def delete_module(
    module_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Delete a module"""
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    db.delete(mod)
    db.commit()
    return {"message": "Module deleted"}


# ━━━━━━━━━━━━━━━━━━━━ Lessons ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/modules/{module_id}/lessons")
def create_lesson(
    module_id: int,
    payload: LessonCreate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Create a lesson inside a module — with optional content (URL or text)"""
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    # Map lesson type
    type_map = {
        "video": LessonTypeEnum.video,
        "text": LessonTypeEnum.text,
        "quiz": LessonTypeEnum.quiz,
    }
    lesson_type = type_map.get(payload.lesson_type, LessonTypeEnum.video)

    # Auto order index
    max_order = db.query(func.max(Lesson.order_index)).filter(
        Lesson.module_id == module_id
    ).scalar() or 0

    lesson = Lesson(
        module_id=module_id,
        title=payload.title,
        lesson_type=lesson_type,
        duration_minutes=payload.duration_minutes or 0,
        order_index=max_order + 1,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    # Add content if provided
    if payload.content and payload.content_type:
        content_type_map = {
            "video_url": ContentTypeEnum.video_url,
            "text_body": ContentTypeEnum.text_body,
            "file_url": ContentTypeEnum.file_url,
            "quiz_json": ContentTypeEnum.quiz_json,
        }
        ct = content_type_map.get(payload.content_type)
        if ct:
            db.add(LessonContent(
                lesson_id=lesson.id,
                content_type=ct,
                content=payload.content,
            ))
            db.commit()

    return {
        "id": lesson.id,
        "title": lesson.title,
        "lesson_type": payload.lesson_type,
        "module_id": module_id,
        "message": "Lesson created"
    }


@router.put("/lessons/{lesson_id}")
def update_lesson(
    lesson_id: int,
    payload: LessonUpdate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Update lesson title, duration or content"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    if payload.title is not None:
        lesson.title = payload.title
    if payload.duration_minutes is not None:
        lesson.duration_minutes = payload.duration_minutes
    db.commit()

    # Update content if provided
    if payload.content and payload.content_type:
        content_type_map = {
            "video_url": ContentTypeEnum.video_url,
            "text_body": ContentTypeEnum.text_body,
            "file_url": ContentTypeEnum.file_url,
            "quiz_json": ContentTypeEnum.quiz_json,
        }
        ct = content_type_map.get(payload.content_type)
        if ct:
            # Remove old content of same type and replace
            db.query(LessonContent).filter(
                LessonContent.lesson_id == lesson_id,
                LessonContent.content_type == ct,
            ).delete()
            db.add(LessonContent(
                lesson_id=lesson_id,
                content_type=ct,
                content=payload.content,
            ))
            db.commit()

    return {"id": lesson.id, "title": lesson.title, "message": "Lesson updated"}


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Delete a lesson"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted"}


# ━━━━━━━━━━━━━━━━━━━━ Video Upload (Local) ━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/upload-video")
def upload_video(
    lesson_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """
    Upload a video file locally.
    Saved to: static/uploads/videos/
    URL stored in DB as: /static/uploads/videos/filename.mp4
    Learner plays from: http://localhost:8000/static/uploads/videos/filename.mp4
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    # Validate file type
    allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only video files allowed (mp4, webm, ogg, mov)")

    # Save file
    filename = f"{lesson_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/videos/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # URL that learner will use to play
    video_url = f"/static/uploads/videos/{filename}"

    # Remove old video content and add new
    db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson_id,
        LessonContent.content_type == ContentTypeEnum.video_url,
    ).delete()
    db.add(LessonContent(
        lesson_id=lesson_id,
        content_type=ContentTypeEnum.video_url,
        content=video_url,
    ))
    db.commit()

    return {
        "message": "Video uploaded successfully",
        "video_url": video_url,
        "lesson_id": lesson_id,
        "filename": filename,
    }


# ━━━━━━━━━━━━━━━━━━━━ PDF Upload (Local) ━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/upload-pdf")
def upload_pdf(
    lesson_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF file locally.
    Saved to: static/uploads/pdfs/
    URL stored in DB as: /static/uploads/pdfs/filename.pdf
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    filename = f"{lesson_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/pdfs/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_url = f"/static/uploads/pdfs/{filename}"

    db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson_id,
        LessonContent.content_type == ContentTypeEnum.file_url,
    ).delete()
    db.add(LessonContent(
        lesson_id=lesson_id,
        content_type=ContentTypeEnum.file_url,
        content=pdf_url,
    ))
    db.commit()

    return {
        "message": "PDF uploaded successfully",
        "pdf_url": pdf_url,
        "lesson_id": lesson_id,
    }


# ━━━━━━━━━━━━━━━━━━━━ Quiz Builder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/quiz")
def save_quiz(
    lesson_id: int,
    payload: QuizCreate,
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Save quiz questions for a lesson"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not your course")

    quiz_data = {
        "questions": payload.questions,
        "quick_tip": f"Review the lesson material before attempting this quiz!",
        "ai_tutor_prompt": "Need help? Ask me to explain any concept!",
    }

    # Remove old quiz and save new
    db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson_id,
        LessonContent.content_type == ContentTypeEnum.quiz_json,
    ).delete()
    db.add(LessonContent(
        lesson_id=lesson_id,
        content_type=ContentTypeEnum.quiz_json,
        content=json.dumps(quiz_data),
    ))
    db.commit()

    return {"message": "Quiz saved", "lesson_id": lesson_id, "question_count": len(payload.questions)}


# ━━━━━━━━━━━━━━━━━━━━ Students ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/students")
def get_students(
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Get all students enrolled in trainer's courses"""
    from app.models.enrollment import Enrollment

    my_courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    course_ids = [c.id for c in my_courses]

    if not course_ids:
        return []

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id.in_(course_ids)
    ).all()

    result = []
    seen_users = set()
    for enr in enrollments:
        if enr.user_id not in seen_users:
            seen_users.add(enr.user_id)
            result.append({
                "user_id": enr.user_id,
                "user_name": enr.user.full_name if enr.user else "Unknown",
                "user_email": enr.user.email if enr.user else "",
                "enrolled_courses": len([e for e in enrollments if e.user_id == enr.user_id]),
                "enrolled_at": enr.enrolled_at.isoformat() if enr.enrolled_at else None,
            })

    return result


# ━━━━━━━━━━━━━━━━━━━━ Categories ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/categories")
def get_categories(
    user: User = Depends(get_trainer_user),
    db: Session = Depends(get_db),
):
    """Get all categories for course creation dropdown"""
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]