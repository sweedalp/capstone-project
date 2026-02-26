"""
Enrollment CRUD operations
"""

from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.enrollment import Enrollment


def enroll_user(db: Session, user_id: int, course_id: int) -> Enrollment:
    enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def get_enrollment(
    db: Session, user_id: int, course_id: int
) -> Optional[Enrollment]:
    return (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id,
        )
        .first()
    )


def get_enrollment_by_id(db: Session, enrollment_id: int) -> Optional[Enrollment]:
    return db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()


def get_user_enrollments(db: Session, user_id: int) -> List[Enrollment]:
    return (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )


def get_user_enrolled_course_ids(db: Session, user_id: int) -> List[int]:
    rows = (
        db.query(Enrollment.course_id)
        .filter(Enrollment.user_id == user_id)
        .all()
    )
    return [r[0] for r in rows]


def toggle_wishlist(db: Session, user_id: int, course_id: int) -> Enrollment:
    enrollment = get_enrollment(db, user_id, course_id)
    if enrollment is None:
        # create a wishlist-only entry (not a full enrollment)
        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id,
            is_wishlisted=True,
        )
        db.add(enrollment)
    else:
        enrollment.is_wishlisted = not enrollment.is_wishlisted
    db.commit()
    db.refresh(enrollment)
    return enrollment


def unenroll_user(db: Session, enrollment: Enrollment) -> None:
    db.delete(enrollment)
    db.commit()
