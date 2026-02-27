"""
LearnAI Pro - AI-Powered Knowledge Intelligence Platform
FastAPI Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.api import api_router

# ── Import all models so Base.metadata sees them ────────────────────
import app.models  # noqa: F401

# ── Create tables ───────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Create FastAPI application ──────────────────────────────────────
app = FastAPI(
    title="LearnAI Pro API",
    description="AI-Powered Knowledge Intelligence Platform for Learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── Serve uploaded videos ───────────────────────────────────────────
os.makedirs("static/videos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
os.makedirs("static/uploads/videos", exist_ok=True)
os.makedirs("static/uploads/pdfs", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")},
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )

# ── Configure CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include API routes ──────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "LearnAI Pro API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )