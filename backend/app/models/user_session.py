from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_jti    = Column(String, unique=True, nullable=False)
    device       = Column(String, default="Unknown Device")
    ip_address   = Column(String, default="Unknown")
    created_at   = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    is_active    = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions")