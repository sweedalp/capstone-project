import os
import httpx
import traceback
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.module import Lesson, Module

router = APIRouter(prefix="/ai-content", tags=["AI Content"])

WHISPER_AGENT_URL = os.getenv("WHISPER_AGENT_URL", "http://localhost:8001")

ai_content_cache: Dict[int, dict] = {}
task_mapping: Dict[int, str] = {}


class ProcessRequest(BaseModel):
    video_url: str
    lesson_title: Optional[str] = ""


def _get_lesson_video_url(lesson: Lesson) -> Optional[str]:
    if hasattr(lesson, "video_url") and lesson.video_url:
        return lesson.video_url
    if hasattr(lesson, "contents"):
        for content in lesson.contents:
            if (
                hasattr(content, "content_type")
                and content.content_type == "video_url"
                and content.content
            ):
                return content.content
    return None


async def _check_whisper_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{WHISPER_AGENT_URL}/health")
            return resp.status_code == 200
    except Exception:
        return False


async def _start_whisper_processing(video_url: str, lesson_id: int, lesson_title: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{WHISPER_AGENT_URL}/process-url",
            json={
                "video_url": video_url,
                "lesson_id": lesson_id,
                "lesson_title": lesson_title,
            },
        )
        resp.raise_for_status()
        return resp.json()["task_id"]


async def _poll_whisper_task(task_id: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{WHISPER_AGENT_URL}/task/{task_id}")
        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Whisper task not found")
        resp.raise_for_status()
        return resp.json()


async def _delete_whisper_task(task_id: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.delete(f"{WHISPER_AGENT_URL}/task/{task_id}")
    except Exception:
        pass


@router.post("/process/{lesson_id}")
async def process_lesson_content(
    lesson_id: int,
    req: ProcessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    video_url = req.video_url or _get_lesson_video_url(lesson)
    if not video_url:
        raise HTTPException(status_code=400, detail="No video URL found for this lesson")

    existing = ai_content_cache.get(lesson_id)
    if existing and existing.get("status") == "completed":
        return {
            "lesson_id": lesson_id,
            "status": "completed",
            "message": "AI content already generated.",
        }

    if lesson_id in task_mapping:
        existing_task_id = task_mapping[lesson_id]
        try:
            task_data = await _poll_whisper_task(existing_task_id)
            if task_data.get("status") == "processing":
                return {
                    "lesson_id": lesson_id,
                    "status": "processing",
                    "progress": task_data.get("progress", "Processing..."),
                    "message": "Already processing.",
                }
        except Exception:
            task_mapping.pop(lesson_id, None)

    if not await _check_whisper_health():
        raise HTTPException(
            status_code=503,
            detail=f"AI content service is not available at {WHISPER_AGENT_URL}"
        )

    try:
        task_id = await _start_whisper_processing(
            video_url=video_url,
            lesson_id=lesson_id,
            lesson_title=req.lesson_title or lesson.title or "",
        )
        task_mapping[lesson_id] = task_id
        ai_content_cache[lesson_id] = {
            "status": "processing",
            "progress": "Queued...",
            "task_id": task_id,
            "transcript": None,
            "summary_notes": None,
            "quiz": None,
            "flashcards": None,
            "error": None,
        }
        return {
            "lesson_id": lesson_id,
            "status": "processing",
            "message": "Processing started.",
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to start processing: {str(e)}")


@router.get("/{lesson_id}")
async def get_lesson_ai_content(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
):
    cached = ai_content_cache.get(lesson_id)
    if not cached:
        return {
            "lesson_id": lesson_id,
            "status": "not_processed",
            "progress": "",
            "transcript": None,
            "summary_notes": None,
            "quiz": None,
            "flashcards": None,
            "error": None,
        }

    if cached.get("status") in ("completed", "failed"):
        return {
            "lesson_id": lesson_id,
            "status": cached["status"],
            "progress": cached.get("progress", ""),
            "transcript": cached.get("transcript"),
            "summary_notes": cached.get("summary_notes"),
            "quiz": cached.get("quiz"),
            "flashcards": cached.get("flashcards"),
            "error": cached.get("error"),
        }

    task_id = cached.get("task_id") or task_mapping.get(lesson_id)
    if not task_id:
        return {
            "lesson_id": lesson_id,
            "status": "failed",
            "progress": "",
            "transcript": None,
            "summary_notes": None,
            "quiz": None,
            "flashcards": None,
            "error": "Missing task id",
        }

    try:
        task_data = await _poll_whisper_task(task_id)
        new_status = task_data.get("status", "processing")
        ai_content_cache[lesson_id].update({
            "status": new_status,
            "progress": task_data.get("progress", ""),
            "transcript": task_data.get("transcript"),
            "summary_notes": task_data.get("summary_notes"),
            "quiz": task_data.get("quiz"),
            "flashcards": task_data.get("flashcards"),
            "error": task_data.get("error"),
        })
        if new_status == "completed":
            await _delete_whisper_task(task_id)
            task_mapping.pop(lesson_id, None)
        return {
            "lesson_id": lesson_id,
            "status": new_status,
            "progress": task_data.get("progress", ""),
            "transcript": task_data.get("transcript"),
            "summary_notes": task_data.get("summary_notes"),
            "quiz": task_data.get("quiz"),
            "flashcards": task_data.get("flashcards"),
            "error": task_data.get("error"),
        }
    except HTTPException as e:
        if e.status_code == 404:
            task_mapping.pop(lesson_id, None)
            ai_content_cache[lesson_id].update({
                "status": "failed",
                "progress": "",
                "error": "Whisper task lost after service restart. Please regenerate.",
            })
            return {
                "lesson_id": lesson_id,
                "status": "failed",
                "progress": "",
                "transcript": cached.get("transcript"),
                "summary_notes": cached.get("summary_notes"),
                "quiz": cached.get("quiz"),
                "flashcards": cached.get("flashcards"),
                "error": "Whisper task lost after service restart. Please regenerate.",
            }
        raise
    except Exception as e:
        return {
            "lesson_id": lesson_id,
            "status": cached.get("status", "processing"),
            "progress": cached.get("progress", f"Agent unreachable: {str(e)}"),
            "transcript": cached.get("transcript"),
            "summary_notes": cached.get("summary_notes"),
            "quiz": cached.get("quiz"),
            "flashcards": cached.get("flashcards"),
            "error": cached.get("error"),
        }


@router.get("/course/{course_id}")
async def get_course_ai_content(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    modules = db.query(Module).filter(Module.course_id == course_id).all()
    lesson_ids = []
    lesson_map = {}
    for module in modules:
        if hasattr(module, "lessons"):
            for lesson in module.lessons:
                lesson_ids.append(lesson.id)
                lesson_map[lesson.id] = {
                    "title": lesson.title,
                    "lesson_type": getattr(lesson, "lesson_type", "text"),
                    "module_title": module.title,
                }

    lessons_with_content = []
    for lid in lesson_ids:
        cached = ai_content_cache.get(lid)
        if cached and cached.get("status") in ("completed", "processing"):
            info = lesson_map.get(lid, {})
            lessons_with_content.append({
                "lesson_id": lid,
                "status": cached.get("status"),
                "title": info.get("title", f"Lesson {lid}"),
                "lesson_type": info.get("lesson_type", "text"),
                "module_title": info.get("module_title", ""),
                "has_summary": bool(cached.get("summary_notes")),
                "has_quiz": bool(cached.get("quiz")),
                "has_flashcards": bool(cached.get("flashcards")),
                "has_transcript": bool(cached.get("transcript")),
                "summary_preview": (
                    cached.get("summary_notes", "")[:200] + "..."
                    if cached.get("summary_notes")
                    else None
                ),
                "quiz_count": len(cached.get("quiz") or []) if isinstance(cached.get("quiz"), list) else 0,
                "flashcard_count": len(cached.get("flashcards") or []) if isinstance(cached.get("flashcards"), list) else 0,
                "progress": cached.get("progress", ""),
            })

    return {
        "course_id": course_id,
        "total_lessons": len(lesson_ids),
        "processed_count": len([l for l in lessons_with_content if l["status"] == "completed"]),
        "lessons": lessons_with_content,
    }


@router.delete("/{lesson_id}")
async def delete_lesson_ai_content(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
):
    task_id = task_mapping.pop(lesson_id, None)
    if task_id:
        await _delete_whisper_task(task_id)
    if lesson_id in ai_content_cache:
        del ai_content_cache[lesson_id]
    return {
        "message": "AI content deleted",
        "lesson_id": lesson_id,
    }


@router.get("/health")
async def ai_content_health():
    whisper_ok = await _check_whisper_health()
    return {
        "status": "ok",
        "whisper_agent": {
            "url": WHISPER_AGENT_URL,
            "status": "ok" if whisper_ok else "unreachable",
        },
        "cached_lessons": len(ai_content_cache),
        "active_tasks": len(task_mapping),
    }