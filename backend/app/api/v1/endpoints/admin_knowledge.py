"""
Knowledge Base Endpoints — upload, list, delete, storage stats
"""

import os
import uuid
import mimetypes
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.user import User
from app.models.knowledge_model import KnowledgeFile

router = APIRouter()

UPLOAD_DIR = "static/uploads/knowledge"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Max file size: 500MB
MAX_FILE_SIZE = 500 * 1024 * 1024

ALLOWED_TYPES = {
    "application/pdf":                                                     ("PDF",  "pdf"),
    "video/mp4":                                                           ("VIDEO","video"),
    "video/webm":                                                          ("VIDEO","video"),
    "video/avi":                                                           ("VIDEO","video"),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ("PPTX","pptx"),
    "application/vnd.ms-powerpoint":                                       ("PPTX", "pptx"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":   ("DOCX","docx"),
    "application/msword":                                                  ("DOCX","docx"),
    "application/zip":                                                     ("ZIP",  "zip"),
    "application/x-zip-compressed":                                        ("ZIP",  "zip"),
    "text/plain":                                                          ("TXT",  "txt"),
}


def _file_dict(f: KnowledgeFile) -> dict:
    return {
        "id":           f.id,
        "filename":     f.filename,
        "original_name":f.original_name,
        "file_type":    f.file_type,
        "file_size":    f.file_size,
        "file_size_mb": round(f.file_size / (1024 * 1024), 1),
        "status":       f.status,
        "uploader_id":  f.uploader_id,
        "uploader_name":f.uploader_name,
        "view_count":   f.view_count,
        "url":          f"/static/uploads/knowledge/{f.filename}",
        "created_at":   f.created_at.isoformat() if f.created_at else None,
    }


# ── List files ────────────────────────────────────────────────────
@router.get("")
def list_files(
    file_type: Optional[str] = Query(None),
    search:    Optional[str] = Query(None),
    page:      int           = Query(1, ge=1),
    page_size: int           = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "trainer"])),
):
    query = db.query(KnowledgeFile)
    if file_type and file_type.upper() not in ("ALL", ""):
        query = query.filter(KnowledgeFile.file_type == file_type.upper())
    if search:
        query = query.filter(KnowledgeFile.original_name.ilike(f"%{search}%"))

    total = query.count()
    files = query.order_by(KnowledgeFile.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    # Storage stats
    total_size = db.query(func.sum(KnowledgeFile.file_size)).scalar() or 0
    by_type    = db.query(KnowledgeFile.file_type, func.sum(KnowledgeFile.file_size)).group_by(KnowledgeFile.file_type).all()

    return {
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "files":       [_file_dict(f) for f in files],
        "storage": {
            "total_bytes": total_size,
            "total_gb":    round(total_size / (1024 ** 3), 2),
            "by_type":     {t: round(s / (1024 ** 3), 2) for t, s in by_type},
        },
    }


# ── Upload ────────────────────────────────────────────────────────
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db:   Session    = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "trainer"])),
):
    # Validate MIME type
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Supported: PDF, Video, PPTX, DOCX, ZIP, TXT"
        )

    file_type_label, ext = ALLOWED_TYPES[content_type]

    # Read and size-check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 500MB)")

    # Save to disk
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path   = os.path.join(UPLOAD_DIR, unique_name)
    with open(save_path, "wb") as f:
        f.write(contents)

    # Save to DB
    kf = KnowledgeFile(
        filename      = unique_name,
        original_name = file.filename,
        file_type     = file_type_label,
        file_size     = len(contents),
        status        = "complete",
        uploader_id   = current_user.id,
        uploader_name = current_user.full_name or current_user.username,
        view_count    = 0,
    )
    db.add(kf)
    db.commit()
    db.refresh(kf)
    return _file_dict(kf)


# ── Delete ────────────────────────────────────────────────────────
@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    kf = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    if not kf:
        raise HTTPException(status_code=404, detail="File not found")

    # Remove from disk
    path = os.path.join(UPLOAD_DIR, kf.filename)
    if os.path.exists(path):
        os.remove(path)

    db.delete(kf)
    db.commit()


# ── Increment view count ──────────────────────────────────────────
@router.post("/{file_id}/view")
def record_view(
    file_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    kf = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    if not kf:
        raise HTTPException(status_code=404, detail="File not found")
    kf.view_count = (kf.view_count or 0) + 1
    db.commit()
    return {"view_count": kf.view_count}