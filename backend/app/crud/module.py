"""
Module & Lesson CRUD operations
"""

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum


# ── Module ──────────────────────────────────────────────────────────
def create_module(db: Session, course_id: int, **kwargs) -> Module:
    mod = Module(course_id=course_id, **kwargs)
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return mod


def get_modules_by_course(db: Session, course_id: int) -> List[Module]:
    return (
        db.query(Module)
        .options(joinedload(Module.lessons))
        .filter(Module.course_id == course_id)
        .order_by(Module.order_index)
        .all()
    )


def get_module_by_id(db: Session, module_id: int) -> Optional[Module]:
    return db.query(Module).filter(Module.id == module_id).first()


def update_module(db: Session, module: Module, **kwargs) -> Module:
    for key, value in kwargs.items():
        if value is not None and hasattr(module, key):
            setattr(module, key, value)
    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module: Module) -> None:
    db.delete(module)
    db.commit()


# ── Lesson ──────────────────────────────────────────────────────────
def create_lesson(db: Session, module_id: int, **kwargs) -> Lesson:
    lesson_type_str = kwargs.pop("lesson_type", "video")
    lesson = Lesson(
        module_id=module_id,
        lesson_type=LessonTypeEnum(lesson_type_str),
        **kwargs,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def get_lessons_by_module(db: Session, module_id: int) -> List[Lesson]:
    return (
        db.query(Lesson)
        .options(joinedload(Lesson.contents))
        .filter(Lesson.module_id == module_id)
        .order_by(Lesson.order_index)
        .all()
    )


def get_lesson_by_id(db: Session, lesson_id: int) -> Optional[Lesson]:
    return (
        db.query(Lesson)
        .options(joinedload(Lesson.contents))
        .filter(Lesson.id == lesson_id)
        .first()
    )


def update_lesson(db: Session, lesson: Lesson, **kwargs) -> Lesson:
    if "lesson_type" in kwargs and kwargs["lesson_type"] is not None:
        kwargs["lesson_type"] = LessonTypeEnum(kwargs["lesson_type"])
    for key, value in kwargs.items():
        if value is not None and hasattr(lesson, key):
            setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson: Lesson) -> None:
    db.delete(lesson)
    db.commit()


# ── LessonContent ───────────────────────────────────────────────────
def add_lesson_content(
    db: Session, lesson_id: int, content_type: str, content: str
) -> LessonContent:
    lc = LessonContent(
        lesson_id=lesson_id,
        content_type=ContentTypeEnum(content_type),
        content=content,
    )
    db.add(lc)
    db.commit()
    db.refresh(lc)
    return lc


def get_lesson_contents(db: Session, lesson_id: int) -> List[LessonContent]:
    return (
        db.query(LessonContent)
        .filter(LessonContent.lesson_id == lesson_id)
        .all()
    )


def delete_lesson_content(db: Session, content: LessonContent) -> None:
    db.delete(content)
    db.commit()
