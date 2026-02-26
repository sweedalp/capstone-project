"""
Course & Category CRUD operations
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from fastapi import HTTPException

from app.models.course import Course, Category, Deadline, LevelEnum
from app.models.module import Module, Lesson


# ── Category ────────────────────────────────────────────────────────
def create_category(db: Session, name: str, description: str = None) -> Category:
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    cat = Category(name=name, description=description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def get_categories(db: Session) -> List[Category]:
    return db.query(Category).order_by(Category.name).all()


def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()


# ── Course ──────────────────────────────────────────────────────────
def create_course(db: Session, trainer_id: int, **kwargs) -> Course:
    level_str = kwargs.pop("level", "beginner")
    course = Course(
        trainer_id=trainer_id,
        level=LevelEnum(level_str),
        **kwargs,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_courses(
    db: Session,
    *,
    category_id: Optional[int] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    trainer_id: Optional[int] = None,
    published_only: bool =True,
    skip: int = 0,
    limit: int = 20,
) -> List[Course]:
    q = db.query(Course).options(
        joinedload(Course.trainer),
        joinedload(Course.category),
    )
    if published_only:
        q = q.filter(Course.is_published == True)  # noqa: E712
    if category_id:
        q = q.filter(Course.category_id == category_id)
    if level:
        q = q.filter(Course.level == LevelEnum(level))
    if search:
        q = q.filter(Course.title.ilike(f"%{search}%"))
    if trainer_id:
        q = q.filter(Course.trainer_id == trainer_id)
    return q.order_by(Course.created_at.desc()).offset(skip).limit(limit).all()


def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    return (
        db.query(Course)
        .options(
            joinedload(Course.trainer),
            joinedload(Course.category),
            joinedload(Course.modules).joinedload(Module.lessons),
        )
        .filter(Course.id == course_id)
        .first()
    )


def update_course(db: Session, course: Course, **kwargs) -> Course:
    if "level" in kwargs and kwargs["level"] is not None:
        kwargs["level"] = LevelEnum(kwargs["level"])
    for key, value in kwargs.items():
        if value is not None and hasattr(course, key):
            setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course: Course) -> None:
    db.delete(course)
    db.commit()


def compute_course_duration(db: Session, course_id: int) -> int:
    """Sum of all lesson durations in the course (minutes)"""
    result = (
        db.query(func.coalesce(func.sum(Lesson.duration_minutes), 0))
        .join(Module, Module.id == Lesson.module_id)
        .filter(Module.course_id == course_id)
        .scalar()
    )
    return int(result)


def count_course_lessons(db: Session, course_id: int) -> int:
    return (
        db.query(func.count(Lesson.id))
        .join(Module, Module.id == Lesson.module_id)
        .filter(Module.course_id == course_id)
        .scalar()
    )


# ── Deadline ────────────────────────────────────────────────────────
def create_deadline(db: Session, **kwargs) -> Deadline:
    d = Deadline(**kwargs)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


def get_upcoming_deadlines(db: Session, user_enrolled_course_ids: List[int], limit: int = 5):
    from datetime import datetime
    return (
        db.query(Deadline)
        .filter(
            Deadline.course_id.in_(user_enrolled_course_ids),
            Deadline.due_date >= datetime.utcnow(),
        )
        .order_by(Deadline.due_date)
        .limit(limit)
        .all()
    )
