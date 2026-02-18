from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

#  MUST be first — before any app imports
# Goes one level up from backend/ to find .env in project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.core.database import Base, engine
from app.models import user
from app.api import auth

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LMS & Knowledge Intelligence Platform API",
    description="AI-powered Learning Management System with Knowledge Intelligence",
    version="1.0.0"
)

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

# Include authentication router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)