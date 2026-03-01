"""
Saved Resources endpoint — CRUD for learner bookmarks.
GET    /api/v1/saved-resources/          — list saved resources
POST   /api/v1/saved-resources/          — save a resource
DELETE /api/v1/saved-resources/{id}      — unsave a resource
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.saved_resource import SavedResource

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────
class SavedResourceOut(BaseModel):
    id: int
    title: str
    resource_type: str
    icon: str
    icon_color: str
    icon_bg: str
    url: Optional[str] = None
    lesson_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SaveResourceIn(BaseModel):
    title: str
    resource_type: str = "lesson"
    lesson_id: Optional[int] = None
    icon: str = "article"
    icon_color: str = "text-blue-600"
    icon_bg: str = "bg-blue-100"
    url: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────────────
@router.get("/", response_model=List[SavedResourceOut])
def list_saved_resources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(SavedResource)
        .filter(SavedResource.user_id == current_user.id)
        .order_by(desc(SavedResource.created_at))
        .all()
    )
    return [SavedResourceOut.model_validate(r) for r in rows]


@router.post("/", response_model=SavedResourceOut, status_code=201)
def save_resource(
    body: SaveResourceIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sr = SavedResource(
        user_id=current_user.id,
        title=body.title,
        resource_type=body.resource_type,
        lesson_id=body.lesson_id,
        icon=body.icon,
        icon_color=body.icon_color,
        icon_bg=body.icon_bg,
        url=body.url,
    )
    db.add(sr)
    db.commit()
    db.refresh(sr)
    return SavedResourceOut.model_validate(sr)


@router.delete("/{resource_id}", status_code=204)
def unsave_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sr = db.query(SavedResource).filter(
        SavedResource.id == resource_id,
        SavedResource.user_id == current_user.id,
    ).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Saved resource not found")
    db.delete(sr)
    db.commit()