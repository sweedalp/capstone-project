import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.module import Lesson, Module
from app.api.v1.endpoints.ai_content import ai_content_cache

router = APIRouter(prefix="/voice-context", tags=["Voice Context"])

VOICE_CONTEXT_API_URL = os.getenv("VOICE_CONTEXT_API_URL", "http://localhost:8003")


@router.get("/health")
async def voice_context_health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(f"{VOICE_CONTEXT_API_URL}/health")
            res.raise_for_status()
            return {
                "status": "ok",
                "voice_context_api": res.json(),
            }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Voice context API unavailable: {str(e)}"
        )


@router.post("/lesson/{lesson_id}/load")
async def load_lesson_into_voice_context(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    ai_data = ai_content_cache.get(lesson_id)
    if not ai_data or ai_data.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail="AI content not ready for this lesson. Generate transcript and summary first."
        )

    transcript = ai_data.get("transcript")
    summary_notes = ai_data.get("summary_notes")

    if not transcript and not summary_notes:
        raise HTTPException(
            status_code=400,
            detail="No transcript or summary available for this lesson"
        )

    course_title = None
    try:
        module = db.query(Module).filter(Module.id == lesson.module_id).first()
        if module and hasattr(module, "course") and module.course:
            course_title = module.course.title
    except Exception:
        course_title = None

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            # Clear existing context first
            await client.delete(f"{VOICE_CONTEXT_API_URL}/context")

            # Load transcript
            if transcript:
                await client.post(
                    f"{VOICE_CONTEXT_API_URL}/context/text",
                    json={"text": transcript, "label": "transcript"},
                )

            # Load summary
            if summary_notes:
                await client.post(
                    f"{VOICE_CONTEXT_API_URL}/context/text",
                    json={"text": summary_notes, "label": "summary"},
                )

            load_res = await client.get(f"{VOICE_CONTEXT_API_URL}/context")
            load_res.raise_for_status()

            instructions_res = await client.get(
                f"{VOICE_CONTEXT_API_URL}/instructions"
            )
            instructions_res.raise_for_status()

            context_info_res = await client.get(
                f"{VOICE_CONTEXT_API_URL}/context"
            )
            context_info_res.raise_for_status()

            return {
                "status": "loaded",
                "lesson_id": lesson.id,
                "message": "Lesson AI content loaded into voice knowledge base",
                "voice_context": load_res.json(),
                "instructions": instructions_res.json(),
                "context_info": context_info_res.json(),
            }
    except httpx.HTTPStatusError as e:
        detail = e.response.text if e.response is not None else str(e)
        raise HTTPException(
            status_code=502,
            detail=f"Voice context API error: {detail}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load voice context: {str(e)}"
        )


@router.delete("/clear")
async def clear_voice_context(
    current_user: User = Depends(get_current_user),
):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.delete(f"{VOICE_CONTEXT_API_URL}/context")
            res.raise_for_status()
            return {
                "status": "cleared",
                "message": "Voice knowledge base cleared",
                "voice_context": res.json(),
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear voice context: {str(e)}"
        )