"""
Report models
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    report_type = Column(String, nullable=False)
    format      = Column(String, default="CSV")
    file_size   = Column(String, nullable=True)
    url         = Column(String, nullable=True)
    created_by  = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    report_type = Column(String, nullable=False)
    frequency   = Column(String, default="weekly")
    next_run    = Column(String, nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)