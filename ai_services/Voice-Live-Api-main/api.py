#!/usr/bin/env python3
import io
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

_context: list[str] = []


def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text_parts = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_parts.append(extracted.strip())
        return "\n\n".join(text_parts) if text_parts else ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")


def build_instructions() -> str:
    base = (
        "You are a helpful AI assistant. "
        "Respond briefly and naturally. "
        "IMPORTANT: Detect the user's language and answer in the SAME language. "
        "Use only the knowledge base content when it exists. "
        "If the user asks outside the knowledge base, clearly say you can answer only from the uploaded lesson content. "
        "If audio input is gibberish or unrelated noise, politely ask the user to repeat. "
    )

    if not _context:
        return base + "No lesson context is loaded. Answer general questions briefly."

    full_text = "\n\n".join(_context)

    # keep it short enough for Azure Voice Live
    if len(full_text) > 18000:
        full_text = full_text[:18000] + "\n... (truncated)"

    return (
        base
        + "\n\n--- KNOWLEDGE BASE START ---\n"
        + full_text
        + "\n--- KNOWLEDGE BASE END ---\n"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    _context.clear()


app = FastAPI(
    title="Voice Live Context API",
    description="Add text, PDF, transcript, and summary context for voice AI",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str
    label: Optional[str] = None


class LessonAIContextInput(BaseModel):
    lesson_id: int
    lesson_title: Optional[str] = None
    course_title: Optional[str] = None
    transcript: Optional[str] = None
    summary_notes: Optional[str] = None
    clear_existing: bool = True


class InstructionsResponse(BaseModel):
    instructions: str
    context_summary: str


@app.get("/")
async def root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs", status_code=302)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "chunks": len(_context),
        "service": "voice-live-context-api",
    }


@app.post("/context/text")
async def add_text(input: TextInput):
    if not input.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    entry = f"[Text{f': {input.label}' if input.label else ''}]\n{input.text.strip()}"
    _context.append(entry)
    return {"status": "added", "total_chunks": len(_context)}


@app.post("/context/pdf")
async def add_pdf(file: UploadFile = File(...), label: Optional[str] = None):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    content = await file.read()
    text = extract_text_from_pdf(content)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")

    entry = f"[PDF{f': {label}' if label else f': {file.filename}'}]\n{text.strip()}"
    _context.append(entry)
    return {"status": "added", "filename": file.filename, "total_chunks": len(_context)}


@app.post("/context/lesson-ai")
async def add_lesson_ai_context(payload: LessonAIContextInput):
    if payload.clear_existing:
        _context.clear()

    added = 0

    header = f"[Lesson]\nLesson ID: {payload.lesson_id}"
    if payload.lesson_title:
        header += f"\nLesson Title: {payload.lesson_title}"
    if payload.course_title:
        header += f"\nCourse Title: {payload.course_title}"
    _context.append(header)
    added += 1

    if payload.summary_notes and payload.summary_notes.strip():
        summary = payload.summary_notes.strip()
        if len(summary) > 8000:
            summary = summary[:8000] + "\n... (truncated)"
        _context.append(f"[Lesson Summary]\n{summary}")
        added += 1

    if payload.transcript and payload.transcript.strip():
        transcript = payload.transcript.strip()
        if len(transcript) > 10000:
            transcript = transcript[:10000] + "\n... (truncated)"
        _context.append(f"[Lesson Transcript]\n{transcript}")
        added += 1

    if added == 1:
        raise HTTPException(status_code=400, detail="No transcript or summary provided")

    return {
        "status": "added",
        "added_chunks": added,
        "total_chunks": len(_context),
        "message": "Lesson AI context loaded successfully",
    }


@app.get("/context")
async def get_context_info():
    total_chars = sum(len(c) for c in _context)
    return {
        "chunks": len(_context),
        "total_characters": total_chars,
        "has_context": len(_context) > 0,
    }


@app.get("/instructions", response_model=InstructionsResponse)
async def get_instructions():
    instructions = build_instructions()
    summary = f"{len(_context)} chunk(s), {sum(len(c) for c in _context)} chars" if _context else "No context"
    return InstructionsResponse(
        instructions=instructions,
        context_summary=summary,
    )


@app.delete("/context")
async def clear_context():
    _context.clear()
    return {"status": "cleared"}


try:
    from voice_query_router import router as query_router
    app.include_router(query_router)
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)