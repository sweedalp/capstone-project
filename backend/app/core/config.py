from pathlib import Path
from typing import List, Optional
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[BASE_DIR / ".env", PROJECT_ROOT / ".env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "AI Learning LMS"
    API_V1_STR: str = "/api/v1"

    # Security / JWT
    SECRET_KEY: str = "change-this-secret-key"
    JWT_SECRET: Optional[str] = None
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = None
    JWT_EXPIRATION: Optional[int] = None

    # Database
    DATABASE_URL: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: str = "5432"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(default_factory=list)

    # AI / Azure envs
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_VERSION: Optional[str] = None
    AZURE_OPENAI_CHAT_DEPLOYMENT: Optional[str] = None
    AZURE_OPENAI_DEPLOYMENT: Optional[str] = None
    AZURE_VOICE_LIVE_ENDPOINT: Optional[str] = None
    AZURE_VOICE_LIVE_MODEL: Optional[str] = None
    AZURE_VOICE_LIVE_API_KEY: Optional[str] = None
    VOICE_CONTEXT_API_URL: Optional[str] = None
    WHISPER_AGENT_URL: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_input(cls, values):
        if not isinstance(values, dict):
            return values
        cors = values.get("BACKEND_CORS_ORIGINS")
        if isinstance(cors, str):
            values["BACKEND_CORS_ORIGINS"] = [
                item.strip() for item in cors.split(",") if item.strip()
            ]
        return values

    @model_validator(mode="after")
    def build_derived_values(self):
        # JWT compatibility
        if not self.JWT_SECRET:
            self.JWT_SECRET = self.SECRET_KEY
        if not self.SECRET_KEY:
            self.SECRET_KEY = self.JWT_SECRET or "change-this-secret-key"
        if not self.JWT_ALGORITHM:
            self.JWT_ALGORITHM = self.ALGORITHM
        if not self.ALGORITHM:
            self.ALGORITHM = self.JWT_ALGORITHM or "HS256"
        if self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES is None:
            self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = self.ACCESS_TOKEN_EXPIRE_MINUTES
        if self.ACCESS_TOKEN_EXPIRE_MINUTES is None:
            self.ACCESS_TOKEN_EXPIRE_MINUTES = self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES or 10080
        if self.JWT_EXPIRATION is None:
            self.JWT_EXPIRATION = int(self.ACCESS_TOKEN_EXPIRE_MINUTES) * 60

        # Database compatibility
        if not self.SQLALCHEMY_DATABASE_URI and self.DATABASE_URL:
            self.SQLALCHEMY_DATABASE_URI = self.DATABASE_URL
        if not self.DATABASE_URL and self.SQLALCHEMY_DATABASE_URI:
            self.DATABASE_URL = self.SQLALCHEMY_DATABASE_URI
        if not self.DATABASE_URL and all([
            self.POSTGRES_SERVER,
            self.POSTGRES_USER,
            self.POSTGRES_PASSWORD,
            self.POSTGRES_DB,
        ]):
            postgres_url = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
            self.DATABASE_URL = postgres_url
            self.SQLALCHEMY_DATABASE_URI = postgres_url
        if not self.DATABASE_URL and not self.SQLALCHEMY_DATABASE_URI:
            fallback = "sqlite:///./app.db"
            self.DATABASE_URL = fallback
            self.SQLALCHEMY_DATABASE_URI = fallback
        return self

settings = Settings()