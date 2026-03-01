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
from app.models.user import User, UserRole
from app.models.course import Course, Category, LevelEnum
from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
from app.models.activity import ActivityLog

import datetime

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(f"{UPLOAD_DIR}/videos", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/pdfs", exist_ok=True)


def get_trainer_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.TRAINER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Trainer or Admin access required")
    return current_user


# ── Helper: serialize lesson WITH its content ─────────────────────
def _lesson_dict(l: Lesson, db: Session) -> dict:
    """Return lesson data including all content (video_url, pdf, text, quiz)."""
    contents = db.query(LessonContent).filter(LessonContent.lesson_id == l.id).all()
    content_map = {}
    for c in contents:
        ct = c.content_type.value if hasattr(c.content_type, "value") else str(c.content_type)
        content_map[ct] = c.content

    return {
        "id":               l.id,
        "title":            l.title,
        "lesson_type":      l.lesson_type.value if hasattr(l.lesson_type, "value") else str(l.lesson_type),
        "duration_minutes": l.duration_minutes,
        "order_index":      l.order_index,
        # ✅ Content fields — whichever exists
        "video_url":  content_map.get("video_url"),
        "pdf_url":    content_map.get("file_url"),
        "text_body":  content_map.get("text_body"),
        "quiz_json":  content_map.get("quiz_json"),
    }


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
    content: Optional[str] = None
    content_type: Optional[str] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    content: Optional[str] = None
    content_type: Optional[str] = None


class QuizCreate(BaseModel):
    title: str
    questions: list


# ━━━━━━━━━━━━━━━━━━━━ Dashboard Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/stats")
def get_trainer_stats(user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    my_courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    course_ids = [c.id for c in my_courses]
    total_courses = len(my_courses)
    published_courses = sum(1 for c in my_courses if c.is_published)
    total_lessons = sum(len(mod.lessons) for course in my_courses for mod in course.modules)
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
def get_trainer_courses(user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    from app.models.enrollment import Enrollment
    courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    result = []
    for c in courses:
        total_lessons = sum(len(m.lessons) for m in c.modules)
        enrolled_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
        result.append({
            "id": c.id, "title": c.title, "description": c.description,
            "level": c.level.value if hasattr(c.level, "value") else c.level,
            "is_published": c.is_published, "thumbnail_url": c.thumbnail_url,
            "total_modules": len(c.modules), "total_lessons": total_lessons,
            "enrolled_count": enrolled_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.post("/courses")
def create_course(payload: CourseCreate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    level = LevelEnum.beginner
    if payload.level == "intermediate": level = LevelEnum.intermediate
    elif payload.level == "advanced":   level = LevelEnum.advanced
    course = Course(title=payload.title, description=payload.description, level=level,
                    category_id=payload.category_id, thumbnail_url=payload.thumbnail_url,
                    trainer_id=user.id, is_published=False)
    db.add(course)
    db.commit()
    db.refresh(course)
    db.add(ActivityLog(user_id=user.id, course_id=course.id, action="course_created",
                       description=f"Created course: {payload.title}", icon="📚"))
    db.commit()
    return {"id": course.id, "title": course.title, "message": "Course created successfully"}


@router.put("/courses/{course_id}")
def update_course(course_id: int, payload: CourseUpdate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if payload.title is not None:        course.title = payload.title
    if payload.description is not None:  course.description = payload.description
    if payload.thumbnail_url is not None: course.thumbnail_url = payload.thumbnail_url
    if payload.category_id is not None:  course.category_id = payload.category_id
    if payload.level is not None:
        level_map = {"beginner": LevelEnum.beginner, "intermediate": LevelEnum.intermediate, "advanced": LevelEnum.advanced}
        course.level = level_map.get(payload.level, LevelEnum.beginner)
    db.commit()
    return {"id": course.id, "title": course.title, "message": "Course updated"}


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    db.delete(course); db.commit()
    return {"message": "Course deleted"}


@router.patch("/courses/{course_id}/publish")
@router.post("/courses/{course_id}/publish")
def publish_course(course_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if not course.modules:
        raise HTTPException(status_code=400, detail="Course must have at least one module")
    course.is_published = True; db.commit()
    db.add(ActivityLog(user_id=user.id, course_id=course.id, action="course_published",
                       description=f"Published: {course.title}", icon="🚀"))
    db.commit()
    return {"message": "Course published", "course_id": course_id}


@router.patch("/courses/{course_id}/unpublish")
@router.post("/courses/{course_id}/unpublish")
def unpublish_course(course_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    course.is_published = False; db.commit()
    return {"message": "Course unpublished", "course_id": course_id}


# ━━━━━━━━━━━━━━━━━━━━ Modules ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/courses/{course_id}/modules")
def get_modules(course_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    return [
        {
            "id": mod.id, "title": mod.title,
            "description": mod.description, "order_index": mod.order_index,
            # ✅ FIXED: each lesson now includes video_url, pdf_url, text_body
            "lessons": [_lesson_dict(l, db) for l in mod.lessons],
        }
        for mod in course.modules
    ]


@router.post("/courses/{course_id}/modules")
def create_module(course_id: int, payload: ModuleCreate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    max_order = db.query(func.max(Module.order_index)).filter(Module.course_id == course_id).scalar() or 0
    mod = Module(course_id=course_id, title=payload.title, description=payload.description, order_index=max_order + 1)
    db.add(mod); db.commit(); db.refresh(mod)
    return {"id": mod.id, "title": mod.title, "course_id": course_id, "order_index": mod.order_index}


@router.delete("/modules/{module_id}")
def delete_module(module_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod: raise HTTPException(status_code=404, detail="Module not found")
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    db.delete(mod); db.commit()
    return {"message": "Module deleted"}


# ━━━━━━━━━━━━━━━━━━━━ Lessons ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/modules/{module_id}/lessons")
def create_lesson(module_id: int, payload: LessonCreate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod: raise HTTPException(status_code=404, detail="Module not found")
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    type_map = {"video": LessonTypeEnum.video, "text": LessonTypeEnum.text, "quiz": LessonTypeEnum.quiz}
    lesson_type = type_map.get(payload.lesson_type, LessonTypeEnum.video)
    max_order = db.query(func.max(Lesson.order_index)).filter(Lesson.module_id == module_id).scalar() or 0
    lesson = Lesson(module_id=module_id, title=payload.title, lesson_type=lesson_type,
                    duration_minutes=payload.duration_minutes or 0, order_index=max_order + 1)
    db.add(lesson); db.commit(); db.refresh(lesson)
    if payload.content and payload.content_type:
        content_type_map = {"video_url": ContentTypeEnum.video_url, "text_body": ContentTypeEnum.text_body,
                            "file_url": ContentTypeEnum.file_url, "quiz_json": ContentTypeEnum.quiz_json}
        ct = content_type_map.get(payload.content_type)
        if ct:
            db.add(LessonContent(lesson_id=lesson.id, content_type=ct, content=payload.content))
            db.commit()
    return {"id": lesson.id, "title": lesson.title, "lesson_type": payload.lesson_type,
            "module_id": module_id, "message": "Lesson created"}


@router.put("/lessons/{lesson_id}")
def update_lesson(lesson_id: int, payload: LessonUpdate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson: raise HTTPException(status_code=404, detail="Lesson not found")
    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if payload.title is not None:            lesson.title = payload.title
    if payload.duration_minutes is not None: lesson.duration_minutes = payload.duration_minutes
    db.commit()
    if payload.content and payload.content_type:
        content_type_map = {"video_url": ContentTypeEnum.video_url, "text_body": ContentTypeEnum.text_body,
                            "file_url": ContentTypeEnum.file_url, "quiz_json": ContentTypeEnum.quiz_json}
        ct = content_type_map.get(payload.content_type)
        if ct:
            db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id,
                                           LessonContent.content_type == ct).delete()
            db.add(LessonContent(lesson_id=lesson_id, content_type=ct, content=payload.content))
            db.commit()
    return {"id": lesson.id, "title": lesson.title, "message": "Lesson updated"}


@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson: raise HTTPException(status_code=404, detail="Lesson not found")
    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    db.delete(lesson); db.commit()
    return {"message": "Lesson deleted"}


# ━━━━━━━━━━━━━━━━━━━━ Video Upload ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/upload-video")
def upload_video(lesson_id: int, file: UploadFile = File(...),
                 user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson: raise HTTPException(status_code=404, detail="Lesson not found")
    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only video files allowed (mp4, webm, ogg, mov)")
    filename = f"{lesson_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/videos/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    video_url = f"/static/uploads/videos/{filename}"
    db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id,
                                   LessonContent.content_type == ContentTypeEnum.video_url).delete()
    db.add(LessonContent(lesson_id=lesson_id, content_type=ContentTypeEnum.video_url, content=video_url))
    db.commit()
    return {"message": "Video uploaded successfully", "video_url": video_url,
            "lesson_id": lesson_id, "filename": filename}


# ━━━━━━━━━━━━━━━━━━━━ PDF Upload ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/upload-pdf")
def upload_pdf(lesson_id: int, file: UploadFile = File(...),
               user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson: raise HTTPException(status_code=404, detail="Lesson not found")
    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    filename = f"{lesson_id}_{file.filename.replace(' ', '_')}"
    file_path = f"{UPLOAD_DIR}/pdfs/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    pdf_url = f"/static/uploads/pdfs/{filename}"
    db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id,
                                   LessonContent.content_type == ContentTypeEnum.file_url).delete()
    db.add(LessonContent(lesson_id=lesson_id, content_type=ContentTypeEnum.file_url, content=pdf_url))
    db.commit()
    return {"message": "PDF uploaded successfully", "pdf_url": pdf_url, "lesson_id": lesson_id}


# ━━━━━━━━━━━━━━━━━━━━ Quiz Builder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.post("/lessons/{lesson_id}/quiz")
def save_quiz(lesson_id: int, payload: QuizCreate, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson: raise HTTPException(status_code=404, detail="Lesson not found")
    mod = db.query(Module).filter(Module.id == lesson.module_id).first()
    course = db.query(Course).filter(Course.id == mod.course_id).first()
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    quiz_data = {"questions": payload.questions, "quick_tip": "Review lesson material before attempting!",
                 "ai_tutor_prompt": "Need help? Ask me to explain any concept!"}
    db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id,
                                   LessonContent.content_type == ContentTypeEnum.quiz_json).delete()
    db.add(LessonContent(lesson_id=lesson_id, content_type=ContentTypeEnum.quiz_json, content=json.dumps(quiz_data)))
    db.commit()
    return {"message": "Quiz saved", "lesson_id": lesson_id, "question_count": len(payload.questions)}


# ━━━━━━━━━━━━━━━━━━━━ Students ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/students")
def get_students(user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    from app.models.enrollment import Enrollment
    my_courses = db.query(Course).filter(Course.trainer_id == user.id).all()
    course_ids = [c.id for c in my_courses]
    if not course_ids: return []
    enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
    result = []; seen = set()
    for enr in enrollments:
        if enr.user_id not in seen:
            seen.add(enr.user_id)
            result.append({"user_id": enr.user_id,
                           "user_name": enr.user.full_name if enr.user else "Unknown",
                           "user_email": enr.user.email if enr.user else "",
                           "enrolled_courses": len([e for e in enrollments if e.user_id == enr.user_id]),
                           "enrolled_at": enr.enrolled_at.isoformat() if enr.enrolled_at else None})
    return result


@router.get("/courses/{course_id}/students")
def get_course_students(course_id: int, user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    from app.models.enrollment import Enrollment, Progress
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    total_lessons = sum(len(m.lessons) for m in course.modules)
    result = []
    for enr in enrollments:
        completed = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed == True).scalar() or 0
        progress_pct = round((completed / total_lessons * 100), 1) if total_lessons > 0 else 0
        result.append({"user_id": enr.user_id,
                       "user_name": enr.user.full_name if enr.user else "Unknown",
                       "user_email": enr.user.email if enr.user else "",
                       "enrolled_at": enr.enrolled_at.isoformat() if enr.enrolled_at else None,
                       "completed_lessons": completed, "total_lessons": total_lessons,
                       "progress_percent": progress_pct})
    return result


@router.post("/courses/{course_id}/message")
def message_course_students(course_id: int, subject: str = "", body: str = "",
                             user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    from app.models.enrollment import Enrollment
    from app.models.message import Message
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if not body.strip(): raise HTTPException(status_code=400, detail="Message body is required")
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    sent_count = 0
    for enr in enrollments:
        db.add(Message(sender_id=user.id, recipient_id=enr.user_id,
                       subject=subject or f"[{course.title}] Message from trainer", body=body))
        sent_count += 1
    db.commit()
    return {"message": f"Message sent to {sent_count} student(s)", "sent_count": sent_count}


@router.post("/courses/{course_id}/meeting")
def create_course_meeting(course_id: int, title: str = "", meeting_url: str = "",
                           description: str = "", scheduled_at: str = "",
                           duration_minutes: int = 30,
                           user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    from app.models.meeting import Meeting
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    if course.trainer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your course")
    if not title.strip(): title = f"{course.title} — Live Session"
    parsed_time = None
    if scheduled_at:
        try: parsed_time = datetime.datetime.fromisoformat(scheduled_at)
        except ValueError: raise HTTPException(status_code=400, detail="Invalid date format")
    meeting = Meeting(host_id=user.id, title=title, meeting_url=meeting_url,
                      description=description or f"Meeting for {course.title}",
                      scheduled_at=parsed_time, duration_minutes=duration_minutes)
    db.add(meeting); db.commit(); db.refresh(meeting)
    return {"id": meeting.id, "title": meeting.title, "meeting_url": meeting.meeting_url,
            "scheduled_at": meeting.scheduled_at.isoformat() if meeting.scheduled_at else None,
            "duration_minutes": meeting.duration_minutes, "course_id": course_id}


@router.get("/categories")
def get_categories(user: User = Depends(get_trainer_user), db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]