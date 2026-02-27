"""
Admin Endpoints

Simple, real admin APIs (no AI):
- Stats overview
- User management (list, toggle active, delete)
"""

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter()


def _to_admin_user_dict(u: User) -> dict:
  """Shape data for admin Users UI."""
  role_map = {
      "admin": "Admin",
      "trainer": "Trainer",
      "learner": "Learner",
      "leadership": "Leadership",
  }
  return {
      "id": u.id,
      "name": u.full_name or u.username,
      "email": u.email,
      "role": role_map.get(u.role.value, u.role.value.title()),
      "is_active": u.is_active,
      "joined": u.created_at.isoformat() if u.created_at else None,
  }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
  """Basic platform stats for admin dashboard."""
  total_users = db.query(func.count(User.id)).scalar() or 0
  active_users = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0

  total_courses = db.query(func.count(Course.id)).scalar() or 0
  published_courses = (
      db.query(func.count(Course.id)).filter(Course.is_published.is_(True)).scalar() or 0
  )

  total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0

  return {
      "total_users": total_users,
      "active_users": active_users,
      "total_courses": total_courses,
      "published_courses": published_courses,
      "total_enrollments": total_enrollments,
  }


@router.get("/users")
def list_users(
    status: Optional[str] = Query(None, description="Filter by status: active|inactive"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
  """
  Return all users for admin panel.
  `status` filter uses User.is_active.
  """
  query = db.query(User)
  if status == "active":
    query = query.filter(User.is_active.is_(True))
  elif status == "inactive":
    query = query.filter(User.is_active.is_(False))

  users: List[User] = query.order_by(User.created_at.desc()).all()
  return [_to_admin_user_dict(u) for u in users]


@router.post("/users/{user_id}/toggle-active", status_code=status.HTTP_200_OK)
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

