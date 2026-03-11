import os
import uuid
import shutil
import tempfile
import traceback
from pathlib import Path
from typing import Optional, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Load env first ─────────────────────────────────────────────
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
LOCAL_ENV = CURRENT_DIR / ".env"
ROOT_ENV = PROJECT_ROOT / ".env"

load_dotenv(LOCAL_ENV, override=True)
load_dotenv(ROOT_ENV, override=True)
load_dotenv(override=True)

print(f"Trying to load local env: {LOCAL_ENV}")
print(f"Trying to load root env:  {ROOT_ENV}")
print("AZURE_OPENAI_API_KEY loaded:", bool(os.getenv("AZURE_OPENAI_API_KEY")))
print("AZURE_OPENAI_ENDPOINT loaded:", bool(os.getenv("AZURE_OPENAI_ENDPOINT")))
print("AZURE_OPENAI_DEPLOYMENT loaded:", bool(os.getenv("AZURE_OPENAI_DEPLOYMENT")))

from services.whisper_service import transcribe_video
from services.openai_service import (
    generate_summary,
    generate_quiz,
    generate_flashcards,
)

app = FastAPI(
    title="Video Learning Whisper Agent",
    description="Transcribe videos and generate learning content",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8080",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
tasks: Dict[str, dict] = {}


class ProcessUrlRequest(BaseModel):
    video_url: str
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = ""


class ProcessUrlResponse(BaseModel):
    task_id: str
    status: str


@app.get("/health")
async def health():
    def clean(v):
        return (v or "").strip().strip('"').strip("'")

    azure_ready = bool(
        clean(os.getenv("AZURE_OPENAI_API_KEY"))
        and clean(os.getenv("AZURE_OPENAI_ENDPOINT"))
        and clean(os.getenv("AZURE_OPENAI_DEPLOYMENT"))
    )

    openai_ready = bool(clean(os.getenv("OPENAI_API_KEY")))

    return {
        "status": "ok",
        "service": "video-learning-whisper",
        "azure_openai_ready": azure_ready,
        "openai_ready": openai_ready,
        "active_tasks": len([t for t in tasks.values() if t.get("status") == "processing"]),
    }


@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    video_path = f"uploads/{file.filename}"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        transcript = transcribe_video(video_path)
        summary = generate_summary(transcript)
        quiz = generate_quiz(transcript)
        flashcards = generate_flashcards(transcript)

        return {
            "transcript": transcript,
            "summary_notes": summary,
            "quiz": quiz,
            "flashcards": flashcards,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
            except OSError:
                pass


def _resolve_local_video_path(url: str) -> Optional[str]:
    """
    Resolve local LMS static paths directly from disk instead of downloading over HTTP.
    """
    if not url:
        return None

    # /static/xyz.mp4
    if url.startswith("/static/"):
        rel = url.replace("/static/", "", 1)
        candidate = PROJECT_ROOT / "backend" / "static" / rel
        if candidate.exists():
            return str(candidate)

    # http://localhost:8000/static/xyz.mp4
    prefixes = [
        "http://localhost:8000/static/",
        "http://127.0.0.1:8000/static/",
        "https://localhost:8000/static/",
        "https://127.0.0.1:8000/static/",
    ]
    for prefix in prefixes:
        if url.startswith(prefix):
            rel = url.replace(prefix, "", 1)
            candidate = PROJECT_ROOT / "backend" / "static" / rel
            if candidate.exists():
                return str(candidate)

    # direct filesystem path
    if os.path.exists(url):
        return url

    # file://path
    if url.startswith("file://"):
        local_file = url.replace("file://", "", 1)
        if os.path.exists(local_file):
            return local_file

    return None


def _download_video(url: str, dest_dir: str) -> str:
    """
    Download or resolve video path.
    Optimized so local LMS files are read directly from disk.
    """
    local_path = _resolve_local_video_path(url)
    if local_path:
        print(f"Using local file directly: {local_path}")
        return local_path

    import requests as req_lib

    if "youtube.com" in url or "youtu.be" in url:
        try:
            import yt_dlp

            output_path = os.path.join(dest_dir, f"{uuid.uuid4().hex}.mp4")
            ydl_opts = {
                "format": "worst[ext=mp4]",
                "outtmpl": output_path,
                "quiet": True,
                "no_warnings": True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            return output_path
        except ImportError:
            raise RuntimeError("yt-dlp not installed. Run: pip install yt-dlp")

    if "drive.google.com" in url:
        import re
        match = re.search(r"/d/([^/]+)", url)
        if match:
            file_id = match.group(1)
            url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = req_lib.get(url, stream=True, timeout=120)
    response.raise_for_status()

    ext = ".mp4"
    content_type = response.headers.get("content-type", "")
    if "webm" in content_type:
        ext = ".webm"
    elif "mpeg" in content_type:
        ext = ".mpeg"
    elif "wav" in content_type:
        ext = ".wav"

    output_path = os.path.join(dest_dir, f"{uuid.uuid4().hex}{ext}")
    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    return output_path


def _process_url_task(task_id: str, video_url: str, lesson_title: str):
    temp_dir = None
    try:
        tasks[task_id]["status"] = "processing"
        tasks[task_id]["progress"] = "Resolving video source..."

        temp_dir = tempfile.mkdtemp(prefix="whisper_")
        video_path = _download_video(video_url, temp_dir)

        tasks[task_id]["progress"] = "Transcribing with Whisper..."
        transcript = transcribe_video(video_path)

        if not transcript or len(transcript.strip()) < 20:
            raise ValueError("Transcript too short or empty. Video may have no speech content.")

        tasks[task_id]["transcript"] = transcript

        tasks[task_id]["progress"] = "Generating summary..."
        summary = generate_summary(transcript)
        tasks[task_id]["summary_notes"] = summary

        tasks[task_id]["progress"] = "Generating quiz..."
        quiz = generate_quiz(transcript)
        tasks[task_id]["quiz"] = quiz if isinstance(quiz, list) else []

        tasks[task_id]["progress"] = "Generating flashcards..."
        flashcards = generate_flashcards(transcript)
        tasks[task_id]["flashcards"] = flashcards if isinstance(flashcards, list) else []

        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = "Done"

    except Exception as e:
        traceback.print_exc()
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["progress"] = f"Failed: {str(e)}"
    finally:
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)


@app.post("/process-url", response_model=ProcessUrlResponse)
async def process_url(req: ProcessUrlRequest, background_tasks: BackgroundTasks):
    task_id = uuid.uuid4().hex[:12]

    for tid, tdata in tasks.items():
        if tdata.get("lesson_id") == req.lesson_id and tdata.get("status") == "processing":
            return ProcessUrlResponse(task_id=tid, status="processing")

    tasks[task_id] = {
        "status": "queued",
        "progress": "Queued...",
        "lesson_id": req.lesson_id,
        "lesson_title": req.lesson_title,
        "transcript": None,
        "summary_notes": None,
        "quiz": None,
        "flashcards": None,
        "error": None,
    }

    background_tasks.add_task(
        _process_url_task,
        task_id,
        req.video_url,
        req.lesson_title or "",
    )

    return ProcessUrlResponse(task_id=task_id, status="processing")


@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    data = tasks[task_id]
    return {
        "task_id": task_id,
        "status": data.get("status", "unknown"),
        "progress": data.get("progress", ""),
        "lesson_id": data.get("lesson_id"),
        "transcript": data.get("transcript"),
        "summary_notes": data.get("summary_notes"),
        "quiz": data.get("quiz"),
        "flashcards": data.get("flashcards"),
        "error": data.get("error"),
    }


@app.delete("/task/{task_id}")
async def delete_task(task_id: str):
    if task_id in tasks:
        del tasks[task_id]
        return {"message": "Deleted", "task_id": task_id}
    raise HTTPException(status_code=404, detail="Task not found")