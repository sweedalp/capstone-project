from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="LMS & Knowledge Intelligence Platform API",
    description="AI-powered Learning Management System with Knowledge Intelligence",
    version="1.0.0"
)

# CORS middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to LMS & Knowledge Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Import routers (to be implemented)
# from app.api import auth, courses, content, knowledge, ai_services, progress, analytics
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
# app.include_router(content.router, prefix="/api/content", tags=["Content"])
# app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge"])
# app.include_router(ai_services.router, prefix="/api/ai", tags=["AI Services"])
# app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
