import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from app.api.api import api_router
from app.api.voice_ws import voice_chat_ws

@asynccontextmanager
async def lifespan(application: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="AI Learning LMS Backend",
    description="Main backend for the AI-powered Learning Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(api_router, prefix="/api/v1")

# Explicit websocket route registration
app.add_api_websocket_route("/api/voice", voice_chat_ws)

@app.get("/")
async def root():
    return {
        "message": "AI Learning LMS Backend",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "main-backend",
    }

@app.get("/api/voice/health")
async def voice_health():
    return {
        "status": "ok",
        "service": "voice-ws",
    }