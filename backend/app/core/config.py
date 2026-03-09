from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os
from pathlib import Path

# Always resolve .env relative to this file (backend/.env), regardless of where uvicorn is launched from
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), env_file_encoding="utf-8", case_sensitive=True)
    
    # Application
    APP_NAME: str = "LMS & Knowledge Intelligence Platform"
    APP_ENV: str = "development"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    FRONTEND_URL: str = "http://localhost:3000"
    # Database
    DATABASE_URL: str =  "postgresql://username:password@localhost:5432/sample_db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    JWT_SECRET: str = "your-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 3600  # 1 hour
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # File Upload
    UPLOAD_MAX_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "uploads"
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "AI LMS Platform"

settings = Settings()


