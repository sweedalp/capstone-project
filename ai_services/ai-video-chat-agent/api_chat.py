"""
api_chat.py
FastAPI WebSocket server for the AI Video Chat Agent
Supports: chat, interactive clicks, difficulty changes, practice mode
"""

import os
import uuid
import json
import asyncio
import threading
from typing import Dict
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from config.settings import STATIC_DIR, VIDEOS_DIR

app = FastAPI(
    title="AI Video Chat Agent",
    description="Chat-based AI tutor that generates animated explainer videos",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

sessions: Dict[str, dict] = {}


@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the main chat UI."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return HTMLResponse(content=index_path.read_text(encoding="utf-8"))
    return HTMLResponse(
        "<h1>AI Video Chat Agent</h1>"
        "<p>Place index.html in the static/ folder.</p>"
    )


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "sessions": len(sessions),
        "service": "ai-video-chat-agent",
    }


@app.get("/api/download/{sid}/{jid}")
async def download_video(sid: str, jid: str):
    """Download the compiled video."""
    if sid not in sessions:
        return JSONResponse({"error": "Session not found"}, status_code=404)

    video_path = sessions[sid].get("last_video")
    if not video_path or not os.path.exists(str(video_path)):
        return JSONResponse({"error": "Video not ready"}, status_code=404)

    return FileResponse(
        str(video_path),
        media_type="video/mp4",
        filename="explainer.mp4",
    )


@app.get("/api/video/{sid}/{jid}")
async def stream_video(sid: str, jid: str):
    """Stream the compiled video inline for browser player."""
    if sid not in sessions:
        return JSONResponse({"error": "Session not found"}, status_code=404)

    video_path = sessions[sid].get("last_video")
    if not video_path or not os.path.exists(str(video_path)):
        return JSONResponse({"error": "Video not ready"}, status_code=404)

    return FileResponse(
        str(video_path),
        media_type="video/mp4",
    )


@app.get("/api/progress/{sid}")
async def get_progress(sid: str):
    """Get learning progress for a session."""
    if sid not in sessions:
        return JSONResponse({"error": "Session not found"}, status_code=404)

    orch = sessions[sid].get("orchestrator")
    if orch:
        return JSONResponse(orch.get_progress(sid))
    return JSONResponse({"error": "No orchestrator"}, status_code=404)


@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    """Main WebSocket endpoint for chat interaction."""
    await ws.accept()
    sid = uuid.uuid4().hex[:8]
    sessions[sid] = {"last_video": None, "orchestrator": None}

    await ws.send_text(json.dumps({
        "type": "connected",
        "session_id": sid,
        "message": "Connected to AI Video Agent",
    }))

    from agents.orchestrator_chat import ChatOrchestrator

    quality = "low"
    orch = ChatOrchestrator(quality=quality)
    sessions[sid]["orchestrator"] = orch

    try:
        while True:
            raw = await ws.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON",
                }))
                continue

            action = data.get("action", "")

            if action == "message":
                text = data.get("text", "").strip()
                lang = data.get("language", "en")
                difficulty = data.get("difficulty", None)

                if not text:
                    await ws.send_text(json.dumps({
                        "type": "error",
                        "message": "Empty message",
                    }))
                    continue

                loop = asyncio.get_event_loop()
                queue = asyncio.Queue()

                def on_text_response(t):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({
                            "type": "text",
                            "content": t,
                        }),
                        loop,
                    )

                def on_scene_ready(d):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({
                            "type": "scene",
                            "scene_number": d["scene_number"],
                            "total_scenes": d.get("total_scenes", 1),
                            "title": d.get("title", ""),
                            "narration": d.get("narration", ""),
                            "duration": d["duration"],
                            "size_kb": d["size_kb"],
                            "scene_type": d.get("scene_type", ""),
                            "animation_type": d.get("animation_type", ""),
                            "video_base64": d["video_base64"],
                        }),
                        loop,
                    )

                def on_status(d):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({
                            "type": "status",
                            "stage": d.get("stage", ""),
                            "message": d.get("message", ""),
                        }),
                        loop,
                    )

                def worker():
                    try:
                        result = orch.handle_message(
                            sid,
                            text,
                            lang,
                            difficulty=difficulty,
                            on_scene_ready=on_scene_ready,
                            on_status=on_status,
                            on_text_response=on_text_response,
                        )
                        sessions[sid]["last_video"] = result["video_path"]

                        asyncio.run_coroutine_threadsafe(
                            queue.put({
                                "type": "complete",
                                "total_scenes": result["total_scenes"],
                                "total_duration": result["total_duration"],
                                "processing_time": result["processing_time"],
                                "download_url": f"/api/download/{sid}/latest",
                                "video_url": f"/api/video/{sid}/latest",
                                "intent": result.get("intent", ""),
                                "response_type": result.get("response_type", ""),
                                "difficulty": result.get("difficulty", ""),
                                "practice": result.get("practice"),
                                "interactive_elements": result.get("interactive_elements", []),
                            }),
                            loop,
                        )
                    except Exception as e:
                        asyncio.run_coroutine_threadsafe(
                            queue.put({
                                "type": "error",
                                "message": str(e),
                            }),
                            loop,
                        )
                        import traceback
                        traceback.print_exc()
                    finally:
                        asyncio.run_coroutine_threadsafe(queue.put(None), loop)

                threading.Thread(target=worker, daemon=True).start()

                while True:
                    try:
                        msg = await asyncio.wait_for(queue.get(), timeout=300)
                        if msg is None:
                            break
                        await ws.send_text(json.dumps(msg))
                    except asyncio.TimeoutError:
                        await ws.send_text(json.dumps({"type": "heartbeat"}))
                    except WebSocketDisconnect:
                        return

            elif action == "interactive_click":
                scene_num = data.get("scene_number", 1)
                element_id = data.get("element_id", "")
                lang = data.get("language", "en")

                loop = asyncio.get_event_loop()
                queue = asyncio.Queue()

                def on_text_ic(t):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({"type": "text", "content": t}),
                        loop,
                    )

                def on_scene_ic(d):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({
                            "type": "scene",
                            "scene_number": d["scene_number"],
                            "total_scenes": d.get("total_scenes", 1),
                            "title": d.get("title", ""),
                            "narration": d.get("narration", ""),
                            "duration": d["duration"],
                            "size_kb": d["size_kb"],
                            "video_base64": d["video_base64"],
                        }),
                        loop,
                    )

                def on_status_ic(d):
                    asyncio.run_coroutine_threadsafe(
                        queue.put({
                            "type": "status",
                            "message": d.get("message", ""),
                        }),
                        loop,
                    )

                def ic_worker():
                    try:
                        result = orch.handle_interactive_click(
                            sid,
                            scene_num,
                            element_id,
                            lang,
                            on_scene_ready=on_scene_ic,
                            on_status=on_status_ic,
                            on_text_response=on_text_ic,
                        )
                        sessions[sid]["last_video"] = result.get("video_path")
                        asyncio.run_coroutine_threadsafe(
                            queue.put({
                                "type": "complete",
                                "total_scenes": result.get("total_scenes", 0),
                                "total_duration": result.get("total_duration", 0),
                                "processing_time": result.get("processing_time", 0),
                                "download_url": f"/api/download/{sid}/latest",
                                "video_url": f"/api/video/{sid}/latest",
                            }),
                            loop,
                        )
                    except Exception as e:
                        asyncio.run_coroutine_threadsafe(
                            queue.put({"type": "error", "message": str(e)}),
                            loop,
                        )
                    finally:
                        asyncio.run_coroutine_threadsafe(queue.put(None), loop)

                threading.Thread(target=ic_worker, daemon=True).start()

                while True:
                    try:
                        msg = await asyncio.wait_for(queue.get(), timeout=300)
                        if msg is None:
                            break
                        await ws.send_text(json.dumps(msg))
                    except asyncio.TimeoutError:
                        await ws.send_text(json.dumps({"type": "heartbeat"}))
                    except WebSocketDisconnect:
                        return

            elif action == "set_difficulty":
                level = data.get("level", "intermediate")
                result = orch.set_difficulty(sid, level)
                await ws.send_text(json.dumps({
                    "type": "difficulty_changed",
                    "difficulty": result["difficulty"],
                    "message": f"Difficulty set to {level}",
                }))

            elif action == "clear":
                orch.clear_session(sid)
                await ws.send_text(json.dumps({
                    "type": "cleared",
                    "message": "Chat cleared! Start fresh.",
                }))

            elif action == "get_progress":
                progress = orch.get_progress(sid)
                await ws.send_text(json.dumps({
                    "type": "progress",
                    "data": progress,
                }))

            elif action == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))

            else:
                await ws.send_text(json.dumps({
                    "type": "error",
                    "message": f"Unknown action: {action}",
                }))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        sessions.pop(sid, None)