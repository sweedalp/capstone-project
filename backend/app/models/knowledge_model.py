"""
KnowledgeFile model
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from app.core.database import Base


class KnowledgeFile(Base):
    __tablename__ = "knowledge_files"

    id            = Column(Integer, primary_key=True, index=True)
    filename      = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_type     = Column(String, nullable=False)
    file_size     = Column(BigInteger, default=0)
    status        = Column(String, default="complete")
    uploader_id   = Column(Integer, nullable=True)
    uploader_name = Column(String, nullable=True)
    view_count    = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)