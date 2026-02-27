"""
Reports Endpoints — generate, list, schedule reports
"""

import csv
import io
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.enrollment import Enrollment, Progress
from app.models.activity import ActivityLog
from app.models.report_model import Report, ScheduledReport

router = APIRouter()


def _report_dict(r: Report) -> dict:
    return {
        "id":          r.id,
        "name":        r.name,
        "report_type": r.report_type,
        "format":      r.format,
        "file_size":   r.file_size,
        "url":         r.url,
        "created_by":  r.created_by,
        "created_at":  r.created_at.isoformat() if r.created_at else None,
    }


def _schedule_dict(s: ScheduledReport) -> dict:
    return {
        "id":          s.id,
        "name":        s.name,
        "report_type": s.report_type,
        "frequency":   s.frequency,
        "next_run":    s.next_run,
        "is_active":   s.is_active,
        "created_at":  s.created_at.isoformat() if s.created_at else None,
    }


# ── List recent reports ───────────────────────────────────────────
@router.get("")
def list_reports(
    page:      int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin", "leadership"])),
):
    total   = db.query(func.count(Report.id)).scalar() or 0
    reports = db.query(Report).order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "reports": [_report_dict(r) for r in reports]}


# ── Generate a report ─────────────────────────────────────────────
@router.post("/generate")
def generate_report(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "leadership"])),
):
    report_type = payload.get("report_type", "completion_rates")
    fmt         = payload.get("format", "csv").lower()
    date_from   = payload.get("date_from")
    date_to     = payload.get("date_to")

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "student_progress":
        writer.writerow(["User ID", "Name", "Email", "Course", "Progress %", "Enrolled At"])
        enrollments = db.query(Enrollment).all()
        for e in enrollments:
            user   = db.query(User).filter(User.id == e.user_id).first()
            course = db.query(Course).filter(Course.id == e.course_id).first()
            progress = db.query(Progress).filter(
                Progress.enrollment_id == e.id
            ).all() if hasattr(Progress, "enrollment_id") else []
            pct = round(len([p for p in progress if getattr(p, "is_completed", False)]) / max(len(progress), 1) * 100)
            writer.writerow([
                user.id if user else "",
                user.full_name if user else "",
                user.email if user else "",
                course.title if course else "",
                pct,
                e.enrolled_at.isoformat() if hasattr(e, "enrolled_at") and e.enrolled_at else "",
            ])

    elif report_type == "completion_rates":
        writer.writerow(["Course ID", "Title", "Level", "Enrolled", "Published", "Trainer"])
        for c in db.query(Course).order_by(Course.created_at.desc()).all():
            trainer = db.query(User).filter(User.id == c.trainer_id).first()
            enrolled = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            writer.writerow([
                c.id, c.title,
                c.level.value if hasattr(c.level, "value") else c.level,
                enrolled,
                c.is_published,
                trainer.full_name if trainer else "",
            ])

    elif report_type == "engagement_metrics":
        writer.writerow(["Date", "Action", "Description", "User ID"])
        for a in db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(1000).all():
            writer.writerow([
                a.created_at.isoformat() if a.created_at else "",
                a.action, a.description, a.user_id,
            ])

    elif report_type == "user_summary":
        writer.writerow(["Role", "Total", "Active"])
        for role in UserRole:
            total  = db.query(func.count(User.id)).filter(User.role == role).scalar() or 0
            active = db.query(func.count(User.id)).filter(User.role == role, User.is_active.is_(True)).scalar() or 0
            writer.writerow([role.value, total, active])
    else:
        raise HTTPException(status_code=400, detail="Invalid report_type")

    output.seek(0)
    csv_bytes  = output.getvalue().encode()
    name       = f"{report_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    file_size  = f"{round(len(csv_bytes) / 1024, 1)} KB"

    # Save record
    report = Report(
        name        = name,
        report_type = report_type,
        format      = "CSV",
        file_size   = file_size,
        url         = f"/api/v1/reports/download/{name}",
        created_by  = current_user.full_name or current_user.username,
    )
    db.add(report)
    db.commit()

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={name}"},
    )


# ── Scheduled reports ─────────────────────────────────────────────
@router.get("/scheduled")
def list_scheduled(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    schedules = db.query(ScheduledReport).order_by(ScheduledReport.created_at.desc()).all()
    return [_schedule_dict(s) for s in schedules]


@router.post("/scheduled", status_code=201)
def create_schedule(
    payload: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    s = ScheduledReport(
        name        = payload["name"],
        report_type = payload.get("report_type", "completion_rates"),
        frequency   = payload.get("frequency", "weekly"),
        next_run    = payload.get("next_run", "Monday 08:00 AM"),
        is_active   = True,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _schedule_dict(s)


@router.delete("/scheduled/{schedule_id}", status_code=204)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["admin"])),
):
    s = db.query(ScheduledReport).filter(ScheduledReport.id == schedule_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(s)
    db.commit()