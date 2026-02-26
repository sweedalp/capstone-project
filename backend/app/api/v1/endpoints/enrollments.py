"""
Enrollment Endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import enrollment as enrollment_crud
from app.crud import course as course_crud
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse, WishlistToggle

router = APIRouter()


@router.post("/", response_model=EnrollmentResponse, status_code=201)
def enroll(
    payload: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = course_crud.get_course_by_id(db, payload.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = enrollment_crud.get_enrollment(db, current_user.id, payload.course_id)
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = enrollment_crud.enroll_user(db, current_user.id, payload.course_id)
    return EnrollmentResponse.model_validate(enrollment)


@router.get("/my", response_model=List[EnrollmentResponse])
def my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = enrollment_crud.get_user_enrollments(db, current_user.id)
    return [EnrollmentResponse.model_validate(e) for e in enrollments]


# ── WISHLIST ──────────────────────────────────────────────────────────
# POST /api/v1/enrollments/wishlist  — toggle by course_id (body)
@router.post("/wishlist", response_model=EnrollmentResponse)
def toggle_wishlist_by_course(
    payload: WishlistToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollment = enrollment_crud.toggle_wishlist(db, current_user.id, payload.course_id)
    return EnrollmentResponse.model_validate(enrollment)


# PATCH /api/v1/enrollments/{id}/wishlist  — toggle by enrollment id (URL)
# This matches the frontend call: PATCH /api/v1/enrollments/{id}/wishlist
@router.patch("/{enrollment_id}/wishlist", response_model=EnrollmentResponse)
def toggle_wishlist_by_id(
    enrollment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollment = enrollment_crud.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your enrollment")

    enrollment.is_wishlisted = not enrollment.is_wishlisted
    db.commit()
    db.refresh(enrollment)
    return EnrollmentResponse.model_validate(enrollment)


@router.delete("/{enrollment_id}", status_code=204)
def unenroll(
    enrollment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollment = enrollment_crud.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your enrollment")
    enrollment_crud.unenroll_user(db, enrollment)