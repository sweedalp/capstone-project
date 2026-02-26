"""
Enrollment Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EnrollmentCreate(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    is_wishlisted: bool
    enrolled_at: datetime

    class Config:
        from_attributes = True


class WishlistToggle(BaseModel):
    course_id: int
