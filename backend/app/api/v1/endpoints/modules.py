"""
Module & Lesson Endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
from fastapi import UploadFile, File
import shutil, os
from app.models.module import LessonContent, ContentTypeEnum

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.crud import module as module_crud
from app.crud import course as course_crud
from app.crud import enrollment as enrollment_crud
from app.crud import progress as progress_crud
from app.schemas.module import (
    ModuleCreate, ModuleUpdate, ModuleResponse,
    LessonCreate, LessonUpdate, LessonResponse,
    LessonContentCreate, LessonContentResponse,
    ModuleWithLessons,
)

router = APIRouter()


# ── MODULES ──────────────────────────────────────────────────────────

@router.get("/courses/{course_id}/modules", response_model=List[ModuleWithLessons])
def list_modules(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = course_crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = enrollment_crud.get_enrollment(db, current_user.id, course_id)
    completed_lesson_ids: set = set()
    score_map: dict = {}
    if enrollment:
        for p in progress_crud.get_progress_for_enrollment(db, enrollment.id):
            if p.is_completed:
                completed_lesson_ids.add(p.lesson_id)
            if p.score is not None:
                score_map[p.lesson_id] = p.score

    modules = module_crud.get_modules_by_course(db, course_id)
    result = []
    for mod in modules:
        lessons_out = []
        for les in mod.lessons:
            lessons_out.append(LessonResponse(
                id=les.id, module_id=les.module_id, title=les.title,
                lesson_type=les.lesson_type.value, order_index=les.order_index,
                duration_minutes=les.duration_minutes,
                is_completed=les.id in completed_lesson_ids,
                score=score_map.get(les.id),
                contents=[LessonContentResponse.model_validate(lc) for lc in les.contents],
            ))
        completed_count = sum(1 for l in mod.lessons if l.id in completed_lesson_ids)
        result.append(ModuleWithLessons(
            id=mod.id, title=mod.title, description=mod.description,
            order_index=mod.order_index, lessons=lessons_out,
            total_lessons=len(mod.lessons), completed_lessons=completed_count,
        ))
    return result


@router.post("/courses/{course_id}/modules", response_model=ModuleResponse, status_code=201)
def create_module(
    course_id: int, payload: ModuleCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    course = course_crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role.value != "admin" and course.trainer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    mod = module_crud.create_module(db, course_id, **payload.model_dump())
    return ModuleResponse(id=mod.id, course_id=mod.course_id, title=mod.title,
                          description=mod.description, order_index=mod.order_index)


@router.put("/modules/{module_id}", response_model=ModuleResponse)
def update_module(
    module_id: int, payload: ModuleUpdate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    mod = module_crud.get_module_by_id(db, module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    mod = module_crud.update_module(db, mod, **payload.model_dump(exclude_unset=True))
    return ModuleResponse(id=mod.id, course_id=mod.course_id, title=mod.title,
                          description=mod.description, order_index=mod.order_index)


@router.delete("/modules/{module_id}", status_code=204)
def delete_module(
    module_id: int,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    mod = module_crud.get_module_by_id(db, module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    module_crud.delete_module(db, mod)


# ── LESSONS ──────────────────────────────────────────────────────────

@router.post("/modules/{module_id}/lessons", response_model=LessonResponse, status_code=201)
def create_lesson(
    module_id: int, payload: LessonCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    mod = module_crud.get_module_by_id(db, module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    les = module_crud.create_lesson(db, module_id, **payload.model_dump())
    return LessonResponse(id=les.id, module_id=les.module_id, title=les.title,
                          lesson_type=les.lesson_type.value, order_index=les.order_index,
                          duration_minutes=les.duration_minutes)


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    les = module_crud.get_lesson_by_id(db, lesson_id)
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    is_completed = False
    score = None
    mod = module_crud.get_module_by_id(db, les.module_id)
    if mod:
        enrollment = enrollment_crud.get_enrollment(db, current_user.id, mod.course_id)
        if enrollment:
            for p in progress_crud.get_progress_for_enrollment(db, enrollment.id):
                if p.lesson_id == les.id:
                    is_completed = p.is_completed
                    score = p.score
                    break
    return LessonResponse(
        id=les.id, module_id=les.module_id, title=les.title,
        lesson_type=les.lesson_type.value, order_index=les.order_index,
        duration_minutes=les.duration_minutes, is_completed=is_completed, score=score,
        contents=[LessonContentResponse.model_validate(lc) for lc in les.contents],
    )


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: int, payload: LessonUpdate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    les = module_crud.get_lesson_by_id(db, lesson_id)
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    les = module_crud.update_lesson(db, les, **payload.model_dump(exclude_unset=True))
    return LessonResponse(id=les.id, module_id=les.module_id, title=les.title,
                          lesson_type=les.lesson_type.value, order_index=les.order_index,
                          duration_minutes=les.duration_minutes)


@router.delete("/lessons/{lesson_id}", status_code=204)
def delete_lesson(
    lesson_id: int,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    les = module_crud.get_lesson_by_id(db, lesson_id)
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module_crud.delete_lesson(db, les)


# ── LESSON CONTENT ───────────────────────────────────────────────────

@router.post("/lessons/{lesson_id}/content", response_model=LessonContentResponse, status_code=201)
def add_content(
    lesson_id: int, payload: LessonContentCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    les = module_crud.get_lesson_by_id(db, lesson_id)
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    lc = module_crud.add_lesson_content(db, lesson_id, payload.content_type, payload.content)
    return LessonContentResponse.model_validate(lc)

@router.post("/lessons/{lesson_id}/upload-video")
async def upload_video(
    lesson_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db),
):
    les = module_crud.get_lesson_by_id(db, lesson_id)
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")

    os.makedirs("static/uploads/videos", exist_ok=True)
    filename = f"{lesson_id}_{file.filename.replace(' ', '_')}"  # ← was missing!
    file_path = f"static/uploads/videos/{filename}"
    video_url = f"/static/uploads/videos/{filename}"             # ← one correct URL

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save or update LessonContent
    existing = db.query(LessonContent).filter(
        LessonContent.lesson_id == lesson_id,
        LessonContent.content_type == ContentTypeEnum.video_url
    ).first()

    if existing:
        existing.content = video_url
    else:
        db.add(LessonContent(
            lesson_id=lesson_id,
            content_type=ContentTypeEnum.video_url,
            content=video_url
        ))
    db.commit()

    return {"video_url": video_url, "lesson_id": lesson_id}