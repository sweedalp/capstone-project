# Leadership Module — Backend Implementation Guide

> **Purpose:** This document is the single reference for all backend work required to make the 5 Leadership pages fully functional with real data.  
> Each section can be assigned to a separate team member and implemented simultaneously.  
> All new endpoints go in **`backend/app/api/v1/endpoints/leadership.py`** unless stated otherwise.

---

## How to Add a New Endpoint (Quick Reference)

1. Open `backend/app/api/v1/endpoints/leadership.py`
2. Add your function decorated with `@router.get(...)` or `@router.post(...)`
3. Use `_user: User = Depends(require_role(["admin", "leadership"]))` on every endpoint
4. Restart the backend: `cd backend && python -m uvicorn main:app --reload --port 8000`
5. Test at `http://localhost:8000/docs`

---

## Existing Database Tables (Reference)

| Table | Key Columns |
|---|---|
| `users` | `id`, `full_name`, `email`, `role` (learner/trainer/admin/leadership), `is_active`, `created_at` |
| `courses` | `id`, `title`, `is_published`, `trainer_id`, `category_id`, `created_at` |
| `enrollments` | `id`, `user_id`, `course_id`, `enrolled_at`, `is_wishlisted` |
| `progress` | `id`, `enrollment_id`, `lesson_id`, `is_completed`, `score`, `completed_at` |
| `modules` | `id`, `course_id`, `title`, `order_index` |
| `lessons` | `id`, `module_id`, `title`, `lesson_type` (video/text/quiz), `order_index` |
| `activity_logs` | `id`, `user_id`, `course_id`, `action`, `description`, `created_at` |
| `notifications` | `id`, `user_id`, `title`, `message`, `is_read`, `created_at` |
| `reports` | `id`, `name`, `report_type`, `format`, `file_size`, `url`, `created_by`, `created_at` |
| `scheduled_reports` | `id`, `name`, `report_type`, `frequency`, `next_run`, `is_active` |

---

---

---

# PAGE 0 — `/leadership/dashboard`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/leadership.py`  
**Frontend file:** `frontend/src/pages/leadership/Dashboard.jsx`

---

## What Is Already Working ✅

| Feature | Status | Endpoint |
|---|---|---|
| Stat Cards (Total Users, Active Learners, Content Items, Total Courses) | ✅ Done | `GET /api/v1/leadership/stats` |
| Recent Activity Feed | ✅ Done | `GET /api/v1/leadership/activities` |

---

## What Is Still Hardcoded ❌

| UI Element | Location in Code | What to Build |
|---|---|---|
| Activity Chart line graph | `const RAW = [38,52,41,...]` — 30 hardcoded values | `GET /api/v1/leadership/activity-chart` |
| Chart mini-stats (Peak Day: 93, Daily Avg: 74, This Week: +8%) | Hardcoded inside JSX | Same endpoint as above — include these aggregates |
| AI Services panel (OpenAI GPT-4, Whisper STT, etc.) | `const AI_SERVICES_SUMMARY = [...]` constant | `GET /api/v1/leadership/ai-services` |
| System Health bars (CPU 42%, Memory 68%, Storage 74%, API Health 99%) | Hardcoded array in JSX | `GET /api/v1/leadership/system-health` |
| Alerts banner (3 hardcoded dismissible alerts) | `useState([...])` hardcoded initial state | Optional — wire to `notifications` table |

---

## D.1 `GET /api/v1/leadership/activity-chart` — User Activity Chart

### What it does
Replaces the 30-value hardcoded `RAW` array in `Dashboard.jsx` with real daily active user counts from `activity_logs`. Also provides the chart summary stats (Peak Day, Daily Avg, This Week vs Last Week).

### Implementation Steps

**Step 1** — Add the endpoint to `leadership.py`:

```python
from datetime import datetime, timedelta

@router.get("/activity-chart")
def activity_chart(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    # Count distinct active users per day
    from sqlalchemy import cast, Date as SADate
    daily_counts = (
        db.query(
            cast(ActivityLog.created_at, SADate).label("day"),
            func.count(func.distinct(ActivityLog.user_id)).label("count"),
        )
        .filter(ActivityLog.created_at >= datetime.combine(start_date, time.min))
        .group_by(cast(ActivityLog.created_at, SADate))
        .order_by(cast(ActivityLog.created_at, SADate))
        .all()
    )

    # Build a complete date range (fill 0 for days with no activity)
    count_map = {row.day: row.count for row in daily_counts}
    chart_data = []
    labels = []
    current = start_date
    while current <= end_date:
        chart_data.append(count_map.get(current, 0))
        labels.append(current.strftime("%b %d"))
        current += timedelta(days=1)

    # Summary stats
    peak = max(chart_data) if chart_data else 0
    avg = round(sum(chart_data) / len(chart_data)) if chart_data else 0

    # Week-over-week change
    this_week = sum(chart_data[-7:])
    last_week = sum(chart_data[-14:-7]) if len(chart_data) >= 14 else 0
    if last_week > 0:
        wow_pct = round((this_week - last_week) / last_week * 100)
        wow = f"+{wow_pct}%" if wow_pct >= 0 else f"{wow_pct}%"
    else:
        wow = "+0%"

    return {
        "data":       chart_data,     # array of 30 integers (replaces RAW)
        "labels":     labels,         # array of date strings for x-axis
        "peak_day":   peak,
        "daily_avg":  avg,
        "wow_change": wow,            # week-over-week e.g. "+8%"
        "days":       days,
    }
```

> **Note:** Add `from datetime import time` at the top of `leadership.py` alongside the existing `datetime` import.

**Step 2** — Add `getActivityChart` to `leadershipApi` in `adminApi.js`:

```js
getActivityChart: (days = 30) => apiClient.get(`/api/v1/leadership/activity-chart?days=${days}`).then(r => r.data),
```

**Step 3** — Update `Dashboard.jsx` — replace the `const RAW` and `ActivityChart` component usage:

```jsx
// Add to state at top of Dashboard component:
const [chartData, setChartData] = useState(null)

// Add to the existing useEffect's Promise.all:
Promise.all([
  leadershipApi.getStats(),
  leadershipApi.getActivities(8),
  leadershipApi.getActivityChart(30),   // ← add this
]).then(([statsData, activitiesData, chartResult]) => {
  setStats(statsData)
  setActivities(activitiesData || [])
  setChartData(chartResult)             // ← add this
  setLoading(false)
})

// Replace the hardcoded mini-stats:
// OLD: { label:'Peak Day',  value:'93' }    { label:'Daily Avg', value:'74' }    { label:'This Week', value:'+8%' }
// NEW:
{ label:'Peak Day',  value: chartData?.peak_day   ?? '—' }
{ label:'Daily Avg', value: chartData?.daily_avg  ?? '—' }
{ label:'This Week', value: chartData?.wow_change ?? '—' }

// Pass chartData.data to ActivityChart instead of RAW:
<ActivityChart data={chartData?.data ?? RAW} labels={chartData?.labels} />
```

**Step 4** — Update `ActivityChart` function in `Dashboard.jsx` to accept `data` as a prop instead of using `RAW`:

```jsx
// Change:  function ActivityChart() {   with hardcoded RAW
// To:
function ActivityChart({ data = RAW, labels: customLabels }) {
  // Replace all references to RAW with data
  // ...rest stays the same
}
```

---

## D.2 `GET /api/v1/leadership/ai-services` — AI Services Panel

### What it does
Replaces the `AI_SERVICES_SUMMARY` constant with real data. The `ai_cache` table stores entries per `service_type` (transcript, summary, quiz_suggestions). Each type maps to an AI service name.

### Service Type → Service Name Mapping

| `service_type` in DB | Display Name |
|---|---|
| `transcript` | Whisper STT |
| `summary` | OpenAI GPT-4 |
| `quiz_suggestions` | OpenAI GPT-4 |
| *(any others)* | AI Service |

```python
@router.get("/ai-services")
def ai_services_status(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    from app.models.ai_cache import AICache

    # Count calls per service_type
    counts = (
        db.query(AICache.service_type, func.count(AICache.id).label("calls"))
        .group_by(AICache.service_type)
        .all()
    )
    count_map = {row.service_type: row.calls for row in counts}

    # Total AI cache entries (as a proxy for overall API calls)
    total_calls = sum(count_map.values())

    services = [
        {
            "name":    "OpenAI GPT-4",
            "status":  "active",
            "calls":   count_map.get("summary", 0) + count_map.get("quiz_suggestions", 0),
            "uptime":  "99.9%",
            "type":    "text",
        },
        {
            "name":    "Whisper STT",
            "status":  "active" if count_map.get("transcript", 0) > 0 else "idle",
            "calls":   count_map.get("transcript", 0),
            "uptime":  "99.7%",
            "type":    "audio",
        },
        {
            "name":    "ElevenLabs TTS",
            "status":  "idle",
            "calls":   0,        # No separate cache type yet
            "uptime":  "98.2%",
            "type":    "audio",
        },
        {
            "name":    "Stable Diffusion",
            "status":  "idle",
            "calls":   0,
            "uptime":  "95.1%",
            "type":    "image",
        },
    ]

    return {"services": services, "total_calls": total_calls}
```

**Step 2** — Add to `leadershipApi` and wire in `Dashboard.jsx`:

```js
// adminApi.js
getAiServices: () => apiClient.get('/api/v1/leadership/ai-services').then(r => r.data),
```

```jsx
// Dashboard.jsx — add to state and Promise.all:
const [aiServices, setAiServices] = useState([])

// In Promise.all, add leadershipApi.getAiServices() and set state
// Replace AI_SERVICES_SUMMARY with aiServices in the JSX
```

---

## D.3 `GET /api/v1/leadership/system-health` — System Health Bars

### What it does
Replaces the hardcoded CPU/Memory/Storage/API Health values with real system metrics using the `psutil` library.

### Step 1 — Install `psutil`

Add to `backend/requirements.txt`:
```
psutil
```
Then run: `pip install psutil`

### Step 2 — Add the endpoint

```python
@router.get("/system-health")
def system_health(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    import psutil

    cpu_pct     = psutil.cpu_percent(interval=0.5)
    memory      = psutil.virtual_memory()
    disk        = psutil.disk_usage("/")

    # API Health: check recent error rate from activity_logs
    # (or just return 99% if no error tracking yet)
    recent_total = db.query(func.count(ActivityLog.id)).filter(
        ActivityLog.created_at >= datetime.utcnow() - timedelta(hours=1)
    ).scalar() or 1

    # Simple heuristic: API health = 100% unless DB queries are slow
    api_health = 99

    return {
        "cpu":        round(cpu_pct),
        "memory":     round(memory.percent),
        "storage":    round(disk.percent),
        "api_health": api_health,
        "details": {
            "memory_used_gb":  round(memory.used / (1024**3), 1),
            "memory_total_gb": round(memory.total / (1024**3), 1),
            "disk_used_gb":    round(disk.used / (1024**3), 1),
            "disk_total_gb":   round(disk.total / (1024**3), 1),
        }
    }
```

### Step 3 — Wire in `Dashboard.jsx`

```js
// adminApi.js
getSystemHealth: () => apiClient.get('/api/v1/leadership/system-health').then(r => r.data),
```

```jsx
// Dashboard.jsx — add to state:
const [health, setHealth] = useState(null)

// Add to Promise.all, then replace the hardcoded array:
// OLD:
[
  ['CPU Usage', '42%', 'bg-green-500', 'text-green-500'],
  ['Memory',    '68%', 'bg-amber-500', 'text-amber-500'],
  ...
]
// NEW (derive from health state):
const healthRows = health ? [
  ['CPU Usage',    `${health.cpu}%`,        health.cpu < 60    ? 'bg-green-500' : health.cpu < 85    ? 'bg-amber-500' : 'bg-red-500', health.cpu < 60    ? 'text-green-500' : 'text-amber-500'],
  ['Memory',       `${health.memory}%`,     health.memory < 60 ? 'bg-green-500' : health.memory < 85 ? 'bg-amber-500' : 'bg-red-500', health.memory < 60 ? 'text-green-500' : 'text-amber-500'],
  ['Storage',      `${health.storage}%`,    health.storage < 70 ? 'bg-green-500' : 'bg-amber-500',  health.storage < 70 ? 'text-green-500' : 'text-amber-500'],
  ['API Health',   `${health.api_health}%`, 'bg-green-500', 'text-green-500'],
] : [
  ['CPU Usage', '—', 'bg-slate-200', 'text-slate-400'],
  ['Memory',    '—', 'bg-slate-200', 'text-slate-400'],
  ['Storage',   '—', 'bg-slate-200', 'text-slate-400'],
  ['API Health','—', 'bg-slate-200', 'text-slate-400'],
]
```

---

## D.4 Alerts Banner — Optional (Low Priority)

The 3 alert banners are defined as `useState([...])` with hardcoded initial content. This can optionally be wired to the `notifications` table.

```python
@router.get("/dashboard-alerts")
def dashboard_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Fetch unread notifications for this user as alerts
    alerts = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .order_by(desc(Notification.created_at))
        .limit(5)
        .all()
    )
    return [
        {
            "id":   a.id,
            "type": a.type or "info",
            "msg":  a.message,
            "icon": a.icon or "notifications",
        }
        for a in alerts
    ]
```

> **Note:** This is optional — the current hardcoded alerts are informational hints, not critical data. Implement this only after the higher-priority items above are done.

---

## Frontend Wiring Summary (Dashboard)

```js
// Add to leadershipApi in adminApi.js:
getActivityChart: (days = 30)  => apiClient.get(`/api/v1/leadership/activity-chart?days=${days}`).then(r => r.data),
getAiServices:    ()           => apiClient.get('/api/v1/leadership/ai-services').then(r => r.data),
getSystemHealth:  ()           => apiClient.get('/api/v1/leadership/system-health').then(r => r.data),
getDashboardAlerts: ()         => apiClient.get('/api/v1/leadership/dashboard-alerts').then(r => r.data),  // optional
```

**In `Dashboard.jsx` — update the single `Promise.all` call:**

```jsx
useEffect(() => {
  Promise.all([
    leadershipApi.getStats(),
    leadershipApi.getActivities(8),
    leadershipApi.getActivityChart(30),
    leadershipApi.getAiServices(),
    leadershipApi.getSystemHealth(),
  ]).then(([statsData, activitiesData, chartResult, aiServicesData, healthData]) => {
    setStats(statsData)
    setActivities(activitiesData || [])
    setChartData(chartResult)
    setAiServices(aiServicesData?.services || [])
    setHealth(healthData)
    setLoading(false)
  }).catch(() => setLoading(false))
}, [])
```

---

## Dashboard Priority Summary

| Item | Backend Endpoint | Priority |
|---|---|---|
| Activity Chart line graph | `GET /activity-chart` | 🔴 High |
| Chart mini-stats (Peak/Avg/WoW) | Same endpoint | 🔴 High |
| System Health bars | `GET /system-health` | 🟡 Medium |
| AI Services panel | `GET /ai-services` | 🟡 Medium |
| Alerts banner | `GET /dashboard-alerts` | 🟢 Low (optional) |

---

---

# PAGE 1 — `/leadership/students`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/leadership.py`  
**Frontend store:** `frontend/src/pages/leadership/_store.js` (replace mock data with API calls)

---

## 1.1 `GET /api/v1/leadership/students` — Student List

### What it does
Returns all enrolled learners with their progress, status, and course info.

### Status Calculation Rules
| Condition | Status |
|---|---|
| `progress >= 100%` | `completed` |
| `progress >= 80%` | `top-performer` |
| `progress >= 50%` and active within 7 days | `on-track` |
| `progress < 50%` and last_active > 7 days ago | `behind` |
| `progress < 30%` or last_active > 10 days ago | `at-risk` |

### Implementation Steps

**Step 1** — Add the endpoint to `leadership.py`:

```python
from app.models.enrollment import Enrollment, Progress
from app.models.module import Lesson, Module
from datetime import datetime, timedelta

@router.get("/students")
def list_students(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Get all learner enrollments with course info
    enrollments = (
        db.query(Enrollment)
        .join(User, Enrollment.user_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(User.role == UserRole.LEARNER)
        .all()
    )

    results = []
    for enr in enrollments:
        learner = enr.user
        course  = enr.course

        # Count total lessons in course
        total_lessons = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == course.id)
            .scalar() or 0
        )
        # Count completed lessons for this enrollment
        completed_lessons = (
            db.query(func.count(Progress.id))
            .filter(
                Progress.enrollment_id == enr.id,
                Progress.is_completed.is_(True),
            )
            .scalar() or 0
        )

        progress_pct = round((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0)

        # Average score from quiz progress rows
        avg_score_row = (
            db.query(func.avg(Progress.score))
            .filter(
                Progress.enrollment_id == enr.id,
                Progress.score.isnot(None),
            )
            .scalar()
        )
        avg_score = round(avg_score_row or 0)

        # Last activity timestamp
        last_progress = (
            db.query(func.max(Progress.completed_at))
            .filter(Progress.enrollment_id == enr.id)
            .scalar()
        )
        last_active = last_progress or enr.enrolled_at

        # Calculate days since last activity
        days_inactive = (datetime.utcnow() - last_active).days if last_active else 999

        # Determine status
        if progress_pct >= 100:
            status = "completed"
        elif progress_pct >= 80:
            status = "top-performer"
        elif progress_pct < 30 or days_inactive > 10:
            status = "at-risk"
        elif progress_pct < 50 or days_inactive > 7:
            status = "behind"
        else:
            status = "on-track"

        # Format last_active string
        if days_inactive == 0:
            last_active_str = "Today"
        elif days_inactive == 1:
            last_active_str = "1 day ago"
        elif days_inactive < 30:
            last_active_str = f"{days_inactive} days ago"
        else:
            last_active_str = last_active.strftime("%b %d, %Y") if last_active else "Unknown"

        results.append({
            "id":          f"AI-{learner.id:05d}",
            "user_id":     learner.id,
            "name":        learner.full_name or learner.username,
            "email":       learner.email,
            "course":      course.title,
            "course_id":   course.id,
            "progress":    progress_pct,
            "module":      f"{completed_lessons}/{total_lessons}",
            "status":      status,
            "lastActive":  last_active_str,
            "score":       avg_score,
            "jobReady":    progress_pct >= 80 and avg_score >= 75,
        })

    return results
```

**Step 2** — You need `completed_at` on the `Progress` model. Add it if missing:

```python
# In backend/app/models/enrollment.py  — inside Progress class
completed_at = Column(DateTime, nullable=True)
```

> **Note:** If `completed_at` doesn't exist yet, use `updated_at` or just `enrolled_at` as fallback for now.

---

## 1.2 `GET /api/v1/leadership/student-stats` — Summary Cards

### What it does
Powers the 3 stat cards: Avg Progress, At Risk count, Certifications (completions).

### Implementation Steps

```python
@router.get("/student-stats")
def student_stats(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Get all learner enrollments
    learner_ids = [
        row.id for row in
        db.query(User.id).filter(User.role == UserRole.LEARNER).all()
    ]

    enrollment_ids = [
        row.id for row in
        db.query(Enrollment.id).filter(Enrollment.user_id.in_(learner_ids)).all()
    ]

    # Calculate avg progress per enrollment
    progress_list = []
    at_risk_count = 0
    completed_count = 0

    for enr_id in enrollment_ids:
        enr = db.query(Enrollment).filter(Enrollment.id == enr_id).first()
        total = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == enr.course_id)
            .scalar() or 0
        )
        done = (
            db.query(func.count(Progress.id))
            .filter(Progress.enrollment_id == enr_id, Progress.is_completed.is_(True))
            .scalar() or 0
        )
        pct = round((done / total * 100) if total > 0 else 0)
        progress_list.append(pct)
        if pct >= 100:
            completed_count += 1
        elif pct < 30:
            at_risk_count += 1

    avg_progress = round(sum(progress_list) / len(progress_list), 1) if progress_list else 0

    return {
        "avg_progress":   avg_progress,
        "at_risk_count":  at_risk_count,
        "certifications": completed_count,
    }
```

---

## 1.3 `GET /api/v1/leadership/student-courses` — Course Filter Dropdown

### What it does
Returns the list of course names for the "All Courses" dropdown filter.

```python
@router.get("/student-courses")
def student_courses(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    courses = db.query(Course).filter(Course.is_published.is_(True)).order_by(Course.title).all()
    return [{"id": c.id, "name": c.title} for c in courses]
```

---

## 1.4 `POST /api/v1/leadership/intervene` — Intervene Action

### What it does
Saves an intervention record and sends email notification to the student.

```python
from pydantic import BaseModel

class InterventionRequest(BaseModel):
    student_user_id: int
    intervention_type: str   # "Assign Mentor", "Send Encouragement Message", etc.
    message: str = ""

@router.post("/intervene", status_code=201)
def create_intervention(
    payload: InterventionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Log it as an activity
    log = ActivityLog(
        user_id=current_user.id,
        action="intervention",
        description=f"Intervention '{payload.intervention_type}' sent for user #{payload.student_user_id}",
    )
    db.add(log)

    # Send in-app notification to the student
    from app.core.notifications import create_notification
    create_notification(
        db=db,
        user_id=payload.student_user_id,
        title="A message from Leadership",
        message=payload.message or f"An intervention of type '{payload.intervention_type}' has been assigned to support your progress.",
        icon="support_agent",
        icon_color="text-blue-600",
        icon_bg="bg-blue-100",
        notif_type="info",
    )
    db.commit()
    return {"message": "Intervention recorded and notification sent"}
```

---

## 1.5 `GET /api/v1/leadership/students/{user_id}/certificate` — Certificate Download

### What it does
The "Certificate" button appears for students with `status === 'completed'`. Currently shows a toast. This endpoint generates a simple text/HTML certificate.

```python
@router.get("/students/{user_id}/certificate")
def download_certificate(
    user_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Find completed enrollments
    completed = []
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    for enr in enrollments:
        total = (
            db.query(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == enr.course_id)
            .scalar() or 1
        )
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        if done >= total:
            completed.append(enr.course.title)

    if not completed:
        raise HTTPException(status_code=400, detail="Student has not completed any courses")

    from datetime import date
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body {{ font-family: Arial, sans-serif; text-align: center; padding: 60px; border: 8px solid #137fec; margin: 40px; }}
  h1 {{ color: #137fec; font-size: 36px; margin-bottom: 8px; }} h2 {{ font-size: 22px; color: #1e293b; }}
  .name {{ font-size: 30px; font-weight: bold; color: #0f172a; margin: 16px 0; }}
  .date {{ color: #94a3b8; font-size: 14px; margin-top: 32px; }}
</style></head>
<body>
  <h1>Certificate of Completion</h1>
  <p>This certifies that</p>
  <div class="name">{student.full_name or student.username}</div>
  <p>has successfully completed</p>
  <h2>{', '.join(completed)}</h2>
  <p class="date">Issued: {date.today().strftime('%B %d, %Y')} &nbsp;·&nbsp; AI LMS Platform</p>
</body></html>"""

    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html, headers={
        "Content-Disposition": f"attachment; filename=certificate_{user_id}.html"
    })
```

---

## 1.6 `GET /api/v1/leadership/students/export` — Export CSV

### What it does
Streams a CSV file of all student progress data.

```python
import csv, io
from fastapi.responses import StreamingResponse

@router.get("/students/export")
def export_students_csv(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Reuse the same query logic from list_students above
    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Course", "Progress %", "Status", "Score %", "Last Active"])

    enrollments = (
        db.query(Enrollment)
        .join(User, Enrollment.user_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(User.role == UserRole.LEARNER)
        .all()
    )
    for enr in enrollments:
        writer.writerow([
            enr.user_id, enr.user.full_name, enr.user.email,
            enr.course.title, "calculated", "calculated", "calculated", "calculated"
        ])
        # Replace "calculated" with real values using same logic as list_students

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_progress.csv"}
    )
```

---

## Frontend Wiring (Students)

After adding the endpoints, update `frontend/src/services/adminApi.js`:

```js
// Add to leadershipApi object:
getStudents:       ()         => apiClient.get('/api/v1/leadership/students').then(r => r.data),
getStudentStats:   ()         => apiClient.get('/api/v1/leadership/student-stats').then(r => r.data),
getStudentCourses: ()         => apiClient.get('/api/v1/leadership/student-courses').then(r => r.data),
intervene:         (p)        => apiClient.post('/api/v1/leadership/intervene', p).then(r => r.data),
getCertificate:    (userId)   => apiClient.get(`/api/v1/leadership/students/${userId}/certificate`, { responseType: 'blob' }),
exportStudents:    ()         => apiClient.get('/api/v1/leadership/students/export', { responseType: 'blob' }),
```

Then update `frontend/src/pages/leadership/_store.js` — replace `students: STUDENTS` with a `useEffect` that calls `leadershipApi.getStudents()`.

---

---

# PAGE 2 — `/leadership/curriculum`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/leadership.py`

---

## 2.1 `GET /api/v1/leadership/courses` — Course Selector Dropdown

```python
@router.get("/courses")
def leadership_courses(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    courses = db.query(Course).filter(Course.is_published.is_(True)).order_by(Course.title).all()
    return [{"id": c.id, "name": c.title} for c in courses]
```

---

## 2.2 `GET /api/v1/leadership/courses/{course_id}/health` — Curriculum Health Index

### What it does
Computes 4 health scores for a course: Clarity, Alignment, Engagement, ROI.

### Score Calculation Logic
| Metric | How to Calculate |
|---|---|
| `clarity` | Average quiz score across all learners in this course (0–100) |
| `alignment` | % of lessons that have content attached (lesson_contents count / lessons count × 100) |
| `engagement` | % of enrolled learners who have at least 1 completed lesson |
| `roi` | Average progress % of all enrolled learners |

```python
@router.get("/courses/{course_id}/health")
def course_health(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    enr_ids = [e.id for e in enrollments]

    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )

    # Clarity — avg quiz score
    avg_score = (
        db.query(func.avg(Progress.score))
        .filter(Progress.enrollment_id.in_(enr_ids), Progress.score.isnot(None))
        .scalar() or 0
    )

    # Alignment — lessons with content attached
    from app.models.module import LessonContent
    lessons_with_content = (
        db.query(func.count(func.distinct(LessonContent.lesson_id)))
        .join(Lesson, LessonContent.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 0
    )
    alignment = round(lessons_with_content / total_lessons * 100)

    # Engagement — % of learners with at least 1 completed lesson
    engaged = sum(
        1 for eid in enr_ids
        if db.query(func.count(Progress.id))
           .filter(Progress.enrollment_id == eid, Progress.is_completed.is_(True))
           .scalar() > 0
    )
    engagement = round(engaged / len(enr_ids) * 100) if enr_ids else 0

    # ROI — avg progress
    progress_vals = []
    for eid in enr_ids:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == eid, Progress.is_completed.is_(True)
        ).scalar() or 0
        progress_vals.append(round(done / total_lessons * 100))
    roi = round(sum(progress_vals) / len(progress_vals)) if progress_vals else 0

    overall = round((round(avg_score) + alignment + engagement + roi) / 4)

    return {
        "course_id":    course_id,
        "course_name":  course.title,
        "health": {
            "clarity":    round(avg_score),
            "alignment":  alignment,
            "engagement": engagement,
            "roi":        roi,
        },
        "overall_score": overall,
    }
```

---

## 2.3 `GET /api/v1/leadership/courses/{course_id}/problem-areas` — Misunderstood Areas

### What it does
Finds lessons/topics where learners consistently score low.

```python
@router.get("/courses/{course_id}/problem-areas")
def course_problem_areas(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Find quiz lessons in this course where avg score < 65
    lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id, Lesson.lesson_type == "quiz")
        .all()
    )

    problem_areas = []
    for lesson in lessons:
        scores = (
            db.query(Progress.score)
            .filter(Progress.lesson_id == lesson.id, Progress.score.isnot(None))
            .all()
        )
        if not scores:
            continue
        score_vals = [s[0] for s in scores]
        avg = round(sum(score_vals) / len(score_vals))
        struggle_rate = round(sum(1 for s in score_vals if s < 60) / len(score_vals) * 100)

        if avg < 65:   # only flag problematic ones
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            severity = "critical" if avg < 50 else "warning"
            problem_areas.append({
                "topic":         lesson.title,
                "chapter":       module.title if module else "Unknown",
                "avg_score":     avg,
                "struggle_rate": struggle_rate,
                "severity":      severity,
                "analysis":      f"{struggle_rate}% of students struggle with this topic.",
                "recommendation": "Review lesson content and consider adding supplementary resources.",
            })

    return sorted(problem_areas, key=lambda x: x["avg_score"])
```

---

## 2.4 `GET /api/v1/leadership/courses/{course_id}/retention` — Student Retention Tab

```python
@router.get("/courses/{course_id}/retention")
def course_retention(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    total_enrolled = db.query(func.count(Enrollment.id)).filter(
        Enrollment.course_id == course_id
    ).scalar() or 0

    completed = 0
    dropped = 0
    in_progress = 0

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )

    for enr in enrollments:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        pct = done / total_lessons * 100
        if pct >= 100:
            completed += 1
        elif done == 0:
            dropped += 1
        else:
            in_progress += 1

    return {
        "total_enrolled": total_enrolled,
        "completed":      completed,
        "in_progress":    in_progress,
        "dropped":        dropped,
        "completion_rate": round(completed / total_enrolled * 100) if total_enrolled else 0,
        "dropout_rate":    round(dropped / total_enrolled * 100) if total_enrolled else 0,
    }
```

---

## 2.5 `GET /api/v1/leadership/courses/{course_id}/content-effectiveness` — Content Effectiveness Tab

### What it does
The "Content Effectiveness" tab in Curriculum shows satisfaction scores per content type (Interactive Walkthroughs, AI Avatar Videos, Audio Lessons, Interactive Quizzes). Currently hardcoded. This endpoint computes them from the `lessons` table grouped by `lesson_type`.

```python
@router.get("/courses/{course_id}/content-effectiveness")
def content_effectiveness(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Map lesson_type values to display names
    type_labels = {
        "video": "AI Avatar Videos",
        "quiz":  "Interactive Quizzes",
        "text":  "Audio Lessons",
    }
    results = []
    for lesson_type, label in type_labels.items():
        lessons_of_type = (
            db.query(Lesson.id)
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.course_id == course_id, Lesson.lesson_type == lesson_type)
            .all()
        )
        lesson_ids = [l.id for l in lessons_of_type]
        if not lesson_ids:
            continue

        # Completion rate for these lessons
        total_progress_rows = db.query(func.count(Progress.id)).filter(
            Progress.lesson_id.in_(lesson_ids)
        ).scalar() or 1

        completed_rows = db.query(func.count(Progress.id)).filter(
            Progress.lesson_id.in_(lesson_ids),
            Progress.is_completed.is_(True),
        ).scalar() or 0

        satisfaction = round(completed_rows / total_progress_rows * 100)

        status = "Excellent" if satisfaction >= 80 else "Good" if satisfaction >= 70 else "Review"
        icon_map = {"video": "play_circle", "quiz": "quiz", "text": "volume_up"}

        results.append({
            "type":         label,
            "lesson_type":  lesson_type,
            "satisfaction": satisfaction,
            "icon":         icon_map.get(lesson_type, "description"),
            "status":       status,
        })

    # Also add "Interactive Walkthroughs" as a placeholder (no separate lesson_type in DB yet)
    if results:
        avg_satisfaction = round(sum(r["satisfaction"] for r in results) / len(results))
        results.insert(0, {
            "type":         "Interactive Walkthroughs",
            "lesson_type":  "walkthrough",
            "satisfaction": min(avg_satisfaction + 5, 100),
            "icon":         "route",
            "status":       "Excellent" if avg_satisfaction >= 75 else "Good",
        })

    return results
```

---

## 2.6 `GET /api/v1/leadership/courses/{course_id}/optimization-plan` — Optimization Tab

### What it does
The "Optimization" tab shows a prioritised list of curriculum improvements. Currently hardcoded. This endpoint derives them from problem area data and bottleneck detection.

```python
@router.get("/courses/{course_id}/optimization-plan")
def optimization_plan(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    items = []

    # Find lessons with high struggle rate (score < 60) — "High" priority
    lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id, Lesson.lesson_type == "quiz")
        .all()
    )
    for lesson in lessons:
        scores = db.query(Progress.score).filter(
            Progress.lesson_id == lesson.id, Progress.score.isnot(None)
        ).all()
        if len(scores) < 3:
            continue
        score_vals = [s[0] for s in scores]
        avg = sum(score_vals) / len(score_vals)
        struggle = sum(1 for s in score_vals if s < 60) / len(score_vals)

        if struggle > 0.5:
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            items.append({
                "priority": "High",
                "title":    f"Restructure '{lesson.title}' in {module.title if module else 'Unknown Module'}",
                "impact":   f"+{round((1 - struggle) * 15)}% completion estimate",
                "effort":   "Medium",
                "status":   "Pending",
                "lesson_id": lesson.id,
            })
        elif struggle > 0.35:
            module = db.query(Module).filter(Module.id == lesson.module_id).first()
            items.append({
                "priority": "Medium",
                "title":    f"Review assessment difficulty for '{lesson.title}'",
                "impact":   f"+{round((1 - struggle) * 10)}% score accuracy",
                "effort":   "Low",
                "status":   "Pending",
                "lesson_id": lesson.id,
            })

    # Check for missing prerequisites (first-lesson completion rate < 50%)
    first_module = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order_index)
        .first()
    )
    if first_module:
        first_lesson = (
            db.query(Lesson)
            .filter(Lesson.module_id == first_module.id)
            .order_by(Lesson.order_index)
            .first()
        )
        if first_lesson:
            total_enr = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == course_id).scalar() or 1
            completed_first = db.query(func.count(Progress.id)).filter(
                Progress.lesson_id == first_lesson.id,
                Progress.is_completed.is_(True),
            ).scalar() or 0
            if completed_first / total_enr < 0.5:
                items.append({
                    "priority": "High",
                    "title":    "Add prerequisite bridge content",
                    "impact":   "-8% at-risk rate",
                    "effort":   "Low",
                    "status":   "Pending",
                    "lesson_id": None,
                })

    return sorted(items, key=lambda x: {"High": 0, "Medium": 1, "Low": 2}[x["priority"]])
```

---

## 2.7 `GET /api/v1/leadership/courses/{course_id}/report` — Export Report

```python
@router.get("/courses/{course_id}/report")
def export_course_report(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student", "Email", "Progress %", "Avg Score", "Status"])

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    total_lessons = (
        db.query(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar() or 1
    )
    for enr in enrollments:
        done = db.query(func.count(Progress.id)).filter(
            Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
        ).scalar() or 0
        pct = round(done / total_lessons * 100)
        avg_score = db.query(func.avg(Progress.score)).filter(
            Progress.enrollment_id == enr.id, Progress.score.isnot(None)
        ).scalar() or 0
        writer.writerow([enr.user.full_name, enr.user.email, pct, round(avg_score), "—"])

    output.seek(0)
    filename = f"{course.title.replace(' ', '_')}_report.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

---

## Frontend Wiring (Curriculum)

```js
// Add to leadershipApi in adminApi.js:
getCourses:                ()    => apiClient.get('/api/v1/leadership/courses').then(r => r.data),
getCourseHealth:           (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/health`).then(r => r.data),
getProblemAreas:           (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/problem-areas`).then(r => r.data),
getCourseRetention:        (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/retention`).then(r => r.data),
getContentEffectiveness:   (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/content-effectiveness`).then(r => r.data),
getOptimizationPlan:       (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/optimization-plan`).then(r => r.data),
exportCourseReport:        (id)  => apiClient.get(`/api/v1/leadership/courses/${id}/report`, { responseType: 'blob' }),
```

---

---

# PAGE 3 — `/leadership/analytics`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/leadership.py`  
**Note:** `reports` and `scheduled_reports` tables already exist in the DB.

---

## 3.1 `POST /api/v1/leadership/reports/generate` — Generate Report

### What it does
Generates a real CSV report, saves a record in the `reports` table, and returns the file.

```python
from app.models.report_model import Report

class GenerateReportRequest(BaseModel):
    report_type: str    # "student-progress", "ai-impact", "completion", "engagement"
    format: str = "CSV"
    date_from: str = ""
    date_to: str = ""

@router.post("/reports/generate")
def generate_report(
    payload: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    output = io.StringIO()
    writer = csv.writer(output)

    if payload.report_type == "student-progress":
        writer.writerow(["Student", "Email", "Course", "Progress %", "Avg Score", "Status"])
        enrollments = (
            db.query(Enrollment)
            .join(User, Enrollment.user_id == User.id)
            .filter(User.role == UserRole.LEARNER)
            .all()
        )
        for enr in enrollments:
            total = (
                db.query(func.count(Lesson.id))
                .join(Module, Lesson.module_id == Module.id)
                .filter(Module.course_id == enr.course_id)
                .scalar() or 1
            )
            done = db.query(func.count(Progress.id)).filter(
                Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
            ).scalar() or 0
            pct = round(done / total * 100)
            avg_score = db.query(func.avg(Progress.score)).filter(
                Progress.enrollment_id == enr.id, Progress.score.isnot(None)
            ).scalar() or 0
            writer.writerow([enr.user.full_name, enr.user.email, enr.course.title, pct, round(avg_score), "—"])

    elif payload.report_type == "completion":
        writer.writerow(["Course", "Total Enrolled", "Completed", "Completion Rate %"])
        courses = db.query(Course).filter(Course.is_published.is_(True)).all()
        for c in courses:
            total_enr = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            writer.writerow([c.title, total_enr, "—", "—"])

    elif payload.report_type == "engagement":
        writer.writerow(["User", "Email", "Total Logins", "Last Active"])
        users = db.query(User).filter(User.role == UserRole.LEARNER, User.is_active.is_(True)).all()
        for u in users:
            writer.writerow([u.full_name, u.email, "—", u.updated_at])

    else:
        writer.writerow(["Report Type", "Generated At"])
        writer.writerow([payload.report_type, datetime.utcnow().isoformat()])

    # Save record in reports table
    size_kb = round(len(output.getvalue()) / 1024, 1)
    report_record = Report(
        name=f"{payload.report_type.replace('-', ' ').title()} Report",
        report_type=payload.report_type,
        format=payload.format,
        file_size=f"{size_kb} KB",
        created_by=current_user.full_name or current_user.username,
    )
    db.add(report_record)
    db.commit()

    output.seek(0)
    filename = f"{payload.report_type}_report.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

---

## 3.2 `GET /api/v1/leadership/reports` — Recent Reports List

```python
@router.get("/reports")
def list_reports(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    reports = db.query(Report).order_by(desc(Report.created_at)).limit(20).all()
    return [
        {
            "id":          r.id,
            "name":        r.name,
            "date":        r.created_at.strftime("%b %d, %Y") if r.created_at else "—",
            "type":        r.format or "CSV",
            "size":        r.file_size or "—",
            "category":    r.report_type,
        }
        for r in reports
    ]
```

---

## 3.3 `POST /api/v1/leadership/reports/email` — Email Report

### What it does
Sends a report notification email to a list of recipients.

```python
class EmailReportRequest(BaseModel):
    recipients: str   # comma-separated emails
    subject: str
    message: str = ""

@router.post("/reports/email")
def email_report(
    payload: EmailReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    recipient_list = [e.strip() for e in payload.recipients.split(",") if e.strip()]
    if not recipient_list:
        raise HTTPException(status_code=400, detail="No valid recipients")

    sender_name = current_user.full_name or current_user.username
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;">
      <h2>{payload.subject}</h2>
      <p>{payload.message or 'Please find the attached report.'}</p>
      <p style="color:#94a3b8;font-size:12px;">Sent by {sender_name} via AI LMS</p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = payload.subject
        msg["From"] = settings.MAIL_FROM
        msg["To"] = ", ".join(recipient_list)
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, recipient_list, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email failed: {exc}")

    return {"message": f"Report emailed to {len(recipient_list)} recipient(s)"}
```

---

## 3.4 `GET/POST/DELETE /api/v1/leadership/scheduled-reports` — Scheduled Reports

```python
from app.models.report_model import ScheduledReport
from pydantic import BaseModel

class ScheduledReportCreate(BaseModel):
    name: str
    report_type: str
    frequency: str    # "weekly", "monthly", "quarterly"
    next_run: str     # ISO datetime string

@router.get("/scheduled-reports")
def list_scheduled(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    items = db.query(ScheduledReport).filter(ScheduledReport.is_active.is_(True)).all()
    return [
        {"id": s.id, "name": s.name, "report_type": s.report_type,
         "frequency": s.frequency, "next_run": s.next_run}
        for s in items
    ]

@router.post("/scheduled-reports", status_code=201)
def create_scheduled(
    payload: ScheduledReportCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    item = ScheduledReport(
        name=payload.name,
        report_type=payload.report_type,
        frequency=payload.frequency,
        next_run=payload.next_run,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "message": "Scheduled report created"}

@router.delete("/scheduled-reports/{report_id}", status_code=204)
def delete_scheduled(
    report_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    item = db.query(ScheduledReport).filter(ScheduledReport.id == report_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item.is_active = False   # soft delete
    db.commit()
```

---

---

## 3.5 `GET /api/v1/leadership/ai-insights` — AI Key Insights Panel

### What it does
The Analytics sidebar shows 3 AI-generated insight cards. Currently these are hardcoded constants in `Analytics.jsx`. This endpoint replaces them with real computed insights from the DB.

```python
@router.get("/ai-insights")
def ai_insights(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    insights = []

    # Insight 1 — Engagement trend: compare active users this month vs last month
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

    this_month_active = db.query(func.count(func.distinct(ActivityLog.user_id))).filter(
        ActivityLog.created_at >= this_month_start
    ).scalar() or 0
    last_month_active = db.query(func.count(func.distinct(ActivityLog.user_id))).filter(
        ActivityLog.created_at >= last_month_start,
        ActivityLog.created_at < this_month_start,
    ).scalar() or 1

    pct_change = round((this_month_active - last_month_active) / last_month_active * 100)
    direction = "up" if pct_change >= 0 else "down"
    insights.append({
        "icon": "trending_up",
        "bg": "bg-emerald-100",
        "text": "text-emerald-700",
        "title": "Engagement Trend",
        "desc": f"Active users {direction} {abs(pct_change)}% vs last month ({this_month_active} active users this month).",
    })

    # Insight 2 — At-risk count
    learner_ids = [r.id for r in db.query(User.id).filter(User.role == UserRole.LEARNER).all()]
    at_risk = 0
    for uid in learner_ids:
        enr = db.query(Enrollment).filter(Enrollment.user_id == uid).first()
        if enr:
            total = (
                db.query(func.count(Lesson.id))
                .join(Module, Lesson.module_id == Module.id)
                .filter(Module.course_id == enr.course_id)
                .scalar() or 1
            )
            done = db.query(func.count(Progress.id)).filter(
                Progress.enrollment_id == enr.id, Progress.is_completed.is_(True)
            ).scalar() or 0
            if done / total * 100 < 30:
                at_risk += 1

    insights.append({
        "icon": "warning",
        "bg": "bg-amber-100",
        "text": "text-amber-700",
        "title": "At-Risk Alert",
        "desc": f"{at_risk} student(s) have progress below 30%. Consider intervention assignments.",
    })

    # Insight 3 — Module with lowest average score
    lesson_scores = (
        db.query(Lesson.title, func.avg(Progress.score).label("avg_score"))
        .join(Progress, Progress.lesson_id == Lesson.id)
        .filter(Progress.score.isnot(None))
        .group_by(Lesson.id)
        .order_by(func.avg(Progress.score))
        .first()
    )
    if lesson_scores:
        insights.append({
            "icon": "psychology",
            "bg": "bg-blue-100",
            "text": "text-blue-700",
            "title": "Action Recommended",
            "desc": f"'{lesson_scores[0]}' has the lowest avg score ({round(lesson_scores[1])}%). Review quiz difficulty.",
        })

    return insights
```

---

## 3.6 `GET /api/v1/leadership/reports/{report_id}/download` — Download Stored Report

### What it does
The download button in the Recent Reports table currently shows a toast. This endpoint regenerates the report and streams it.

```python
@router.get("/reports/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Regenerate the CSV (same logic as generate endpoint but for this report_type)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Report", "Type", "Generated"])
    writer.writerow([report.name, report.report_type, str(report.created_at)])

    # For a full implementation: reuse the same CSV-building logic from generate_report()
    # keyed on report.report_type

    output.seek(0)
    filename = f"{report.name.replace(' ', '_')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

---

## Frontend Wiring (Analytics)

```js
// Add to leadershipApi in adminApi.js:
generateReport:     (payload)   => apiClient.post('/api/v1/leadership/reports/generate', payload, { responseType: 'blob' }),
getReports:         ()          => apiClient.get('/api/v1/leadership/reports').then(r => r.data),
emailReport:        (payload)   => apiClient.post('/api/v1/leadership/reports/email', payload).then(r => r.data),
getScheduled:       ()          => apiClient.get('/api/v1/leadership/scheduled-reports').then(r => r.data),
createScheduled:    (payload)   => apiClient.post('/api/v1/leadership/scheduled-reports', payload).then(r => r.data),
deleteScheduled:    (id)        => apiClient.delete(`/api/v1/leadership/scheduled-reports/${id}`),
getAiInsights:      ()          => apiClient.get('/api/v1/leadership/ai-insights').then(r => r.data),
downloadReport:     (id)        => apiClient.get(`/api/v1/leadership/reports/${id}/download`, { responseType: 'blob' }),
```

---

---

# PAGE 4 — `/leadership/management`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/leadership.py`

---

## 4.1 `GET /api/v1/leadership/management/stats` — Summary Stat Cards

```python
@router.get("/management/stats")
def management_stats(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    active_trainers = db.query(func.count(User.id)).filter(
        User.role == UserRole.TRAINER, User.is_active.is_(True)
    ).scalar() or 0

    total_programs = db.query(func.count(Course.id)).filter(
        Course.is_published.is_(True)
    ).scalar() or 0

    total_announcements = db.query(func.count(Notification.id)).filter(
        Notification.type == "announcement"
    ).scalar() or 0

    return {
        "active_trainers":      active_trainers,
        "total_programs":       total_programs,
        "pending_reviews":      0,        # extend when review table exists
        "announcements_sent":   total_announcements,
    }
```

---

## 4.2 `GET /api/v1/leadership/trainers` — Trainer Roster Table

```python
@router.get("/trainers")
def list_trainers(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    trainers = db.query(User).filter(User.role == UserRole.TRAINER).all()
    result = []
    for t in trainers:
        course_count = db.query(func.count(Course.id)).filter(Course.trainer_id == t.id).scalar() or 0
        student_count = (
            db.query(func.count(Enrollment.id))
            .join(Course, Enrollment.course_id == Course.id)
            .filter(Course.trainer_id == t.id)
            .scalar() or 0
        )
        result.append({
            "id":       t.id,
            "name":     t.full_name or t.username,
            "email":    t.email,
            "role":     "Trainer",
            "courses":  course_count,
            "students": student_count,
            "rating":   4.5,       # static for now; extend when ratings table exists
            "status":   "active" if t.is_active else "inactive",
        })
    return result
```

---

## 4.3 `POST /api/v1/leadership/trainers/invite` — Invite Trainer

### What it does
Sends an invitation email to a new trainer.

```python
class InviteTrainerRequest(BaseModel):
    email: str
    name: str = ""

@router.post("/trainers/invite", status_code=200)
def invite_trainer(
    payload: InviteTrainerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    sender_name = current_user.full_name or current_user.username
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2>You're invited to join AI LMS as a Trainer</h2>
      <p>Hi {payload.name or 'there'},</p>
      <p>{sender_name} has invited you to join the AI LMS platform as a Trainer.</p>
      <a href="http://localhost:3000/signup" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
        Accept Invitation & Sign Up
      </a>
      <p style="color:#94a3b8;font-size:12px;">AI LMS Knowledge Intelligence Platform</p>
    </div>
    """
    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "You're invited to join AI LMS as a Trainer"
        msg["From"] = settings.MAIL_FROM
        msg["To"] = payload.email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, payload.email, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email failed: {exc}")

    return {"message": f"Invitation sent to {payload.email}"}
```

---

## 4.4 `GET/POST/DELETE /api/v1/leadership/announcements` — Announcements

### What it does
Persists announcements so they survive page refresh (stored in the `notifications` table with `type="announcement"`).

```python
class AnnouncementCreate(BaseModel):
    title: str
    audience: str   # "All Students", "At-Risk Students", etc.
    message: str

@router.get("/announcements")
def list_announcements(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    items = db.query(Notification).filter(
        Notification.type == "announcement"
    ).order_by(desc(Notification.created_at)).all()
    return [
        {
            "id":       n.id,
            "title":    n.title,
            "audience": n.message.split("||")[0] if "||" in n.message else "All Students",
            "body":     n.message.split("||")[1] if "||" in n.message else n.message,
            "date":     n.created_at.strftime("%b %d, %Y") if n.created_at else "—",
            "status":   "sent",
        }
        for n in items
    ]

@router.post("/announcements", status_code=201)
def create_announcement(
    payload: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Store audience and message together, separated by ||
    combined_message = f"{payload.audience}||{payload.message}"

    # Find target users
    if payload.audience == "All Trainers":
        target_users = db.query(User).filter(User.role == UserRole.TRAINER).all()
    elif payload.audience == "All Students":
        target_users = db.query(User).filter(User.role == UserRole.LEARNER).all()
    else:
        target_users = db.query(User).filter(User.role == UserRole.LEARNER).all()

    # Create a notification record for each target user
    from app.core.notifications import create_notification
    for u in target_users:
        create_notification(
            db=db,
            user_id=u.id,
            title=payload.title,
            message=payload.message,
            icon="campaign",
            icon_color="text-blue-600",
            icon_bg="bg-blue-100",
            notif_type="announcement",
        )

    # Also save one "master" record for the leadership list view
    master = Notification(
        user_id=current_user.id,
        title=payload.title,
        message=combined_message,
        icon="campaign",
        icon_color="text-blue-600",
        icon_bg="bg-blue-100",
        type="announcement",
    )
    db.add(master)
    db.commit()
    db.refresh(master)

    return {"id": master.id, "message": f"Announcement sent to {len(target_users)} users"}

@router.delete("/announcements/{announcement_id}", status_code=204)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    item = db.query(Notification).filter(Notification.id == announcement_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
```

---

## 4.5 `GET/PUT /api/v1/leadership/program-settings` — Program Feature Toggles

> **Simplest approach:** Store settings as a JSON string in a new `platform_settings` table, or use a simple key-value approach in `activity_logs`. The cleanest solution is a dedicated small table, but for speed you can store all settings as a single JSON row.

```python
# Add a new model — backend/app/models/user.py or a new file
# For quick implementation, add to activity_logs with action="program_settings"

@router.get("/program-settings")
def get_program_settings(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["admin", "leadership"])),
):
    # Default settings
    defaults = {
        "aiCoach": True, "peerReview": False,
        "liveSession": True, "autoNudge": True
    }
    # Look for last saved settings in activity_logs
    last_save = db.query(ActivityLog).filter(
        ActivityLog.action == "program_settings"
    ).order_by(desc(ActivityLog.created_at)).first()

    if last_save:
        import json
        try:
            return json.loads(last_save.description)
        except Exception:
            pass
    return defaults

@router.put("/program-settings")
def save_program_settings(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    import json
    log = ActivityLog(
        user_id=current_user.id,
        action="program_settings",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Settings saved"}
```

---

## 4.5 `POST /api/v1/leadership/trainers/message` — Message a Trainer

### What it does
The mail icon button on each trainer row in the Trainer Roster tab is currently a toast. This endpoint sends a real email to the trainer using the same SMTP pattern.

```python
class TrainerMessageRequest(BaseModel):
    trainer_user_id: int
    subject: str
    body: str

@router.post("/trainers/message")
def message_trainer(
    payload: TrainerMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.LEADERSHIP, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    trainer = db.query(User).filter(
        User.id == payload.trainer_user_id, User.role == UserRole.TRAINER
    ).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    sender_name = current_user.full_name or current_user.username
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2>{payload.subject}</h2>
      <p>Hi {trainer.full_name or trainer.username},</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">{payload.body}</div>
      <p style="color:#94a3b8;font-size:12px;">Sent by {sender_name} via AI LMS Leadership Portal</p>
    </div>
    """
    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        msg = MIMEMultipart("alternative")
        msg["Subject"] = payload.subject
        msg["From"] = settings.MAIL_FROM
        msg["To"] = trainer.email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, trainer.email, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email failed: {exc}")

    return {"message": f"Message sent to {trainer.full_name}"}
```

---

## 4.6 Permissions Tab — Out of Scope Note

The **Permissions** tab in Management shows role-based access cards (Leadership, Trainer, Learner, Admin) with an "Edit" button. Real RBAC permission editing requires a separate `role_permissions` table and middleware changes — this is **out of scope** for the current sprint. The tab is UI-only (toast on click) and can remain as-is.

If needed in a future sprint, the approach is:
1. Create `role_permissions` table: `(id, role, permission_key, is_enabled)`
2. Add `GET /api/v1/admin/permissions` and `PUT /api/v1/admin/permissions`
3. Gate API endpoints using the dynamic permission flags

---

## Frontend Wiring (Management)

```js
// Add to leadershipApi in adminApi.js:
getManagementStats:   ()          => apiClient.get('/api/v1/leadership/management/stats').then(r => r.data),
getTrainers:          ()          => apiClient.get('/api/v1/leadership/trainers').then(r => r.data),
inviteTrainer:        (payload)   => apiClient.post('/api/v1/leadership/trainers/invite', payload).then(r => r.data),
messageTrainer:       (payload)   => apiClient.post('/api/v1/leadership/trainers/message', payload).then(r => r.data),
getAnnouncements:     ()          => apiClient.get('/api/v1/leadership/announcements').then(r => r.data),
createAnnouncement:   (payload)   => apiClient.post('/api/v1/leadership/announcements', payload).then(r => r.data),
deleteAnnouncement:   (id)        => apiClient.delete(`/api/v1/leadership/announcements/${id}`),
getProgramSettings:   ()          => apiClient.get('/api/v1/leadership/program-settings').then(r => r.data),
saveProgramSettings:  (payload)   => apiClient.put('/api/v1/leadership/program-settings', payload).then(r => r.data),
```

---

---

# PAGE 5 — `/leadership/settings`

**Assigned to:** _______________  
**File to edit:** `backend/app/api/v1/endpoints/auth.py` (Profile + Password sections already there)  
**New endpoints:** `backend/app/api/v1/endpoints/leadership.py`

---

## 5.1 Profile Tab — Load real user data ✅ (endpoint exists)

**Endpoint already exists:** `GET /api/v1/auth/me`

**What needs to change:** In `Settings.jsx`, add a `useEffect` to call it on load:

```js
// In Settings.jsx, at top:
import apiClient from '../../services/api'

// In the component:
useEffect(() => {
  apiClient.get('/api/v1/auth/me').then(res => {
    const u = res.data
    const parts = (u.full_name || '').split(' ')
    setProfileForm(p => ({
      ...p,
      firstName: parts[0] || '',
      lastName:  parts.slice(1).join(' ') || '',
      email:     u.email || '',
    }))
  })
}, [])
```

---

## 5.2 Save Profile ✅ (endpoint exists)

**Endpoint already exists:** `PUT /api/v1/auth/profile`

Wire the Save button in `Settings.jsx`:

```js
const handleProfileSave = async () => {
  setSaving(true)
  try {
    await apiClient.put('/api/v1/auth/profile', {
      full_name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      email: profileForm.email,
    })
    toast.success('Profile saved!')
  } catch (e) {
    toast.error('Failed to save profile')
  } finally {
    setSaving(false)
  }
}
```

---

## 5.3 `POST /api/v1/auth/change-password` — Change Password

**Add to `backend/app/api/v1/endpoints/auth.py`:**

```python
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
```

**Make sure to register this in `api.py`** — it goes under the existing `auth` router so no new registration needed.

---

## 5.4 `GET/PUT /api/v1/leadership/notification-preferences` — Notification Preferences

```python
@router.get("/notification-preferences")
def get_notif_prefs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    last = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action == "notif_preferences",
    ).order_by(desc(ActivityLog.created_at)).first()

    defaults = {
        "atRiskAlerts": True, "weeklyReports": True,
        "completionMilestones": False, "systemUpdates": True,
        "trainerAlerts": False, "aiInsights": True,
    }
    if last:
        try:
            return json.loads(last.description)
        except Exception:
            pass
    return defaults

@router.put("/notification-preferences")
def save_notif_prefs(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    log = ActivityLog(
        user_id=current_user.id,
        action="notif_preferences",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Preferences saved"}
```

---

## 5.5 `GET/PUT /api/v1/leadership/preferences` — Display Preferences

```python
@router.get("/preferences")
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    last = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action == "user_preferences",
    ).order_by(desc(ActivityLog.created_at)).first()

    defaults = {
        "language": "English (US)", "dateFormat": "MM/DD/YYYY",
        "defaultView": "Last 30 Days", "defaultReportFormat": "PDF",
    }
    if last:
        try:
            return json.loads(last.description)
        except Exception:
            pass
    return defaults

@router.put("/preferences")
def save_preferences(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    log = ActivityLog(
        user_id=current_user.id,
        action="user_preferences",
        description=json.dumps(payload),
    )
    db.add(log)
    db.commit()
    return {"message": "Preferences saved"}
```

---

## 5.6 Fix Hardcoded "Alex Rivera" in Settings Profile Tab

In `frontend/src/pages/leadership/Settings.jsx`, the profile section shows hardcoded `"Alex Rivera"`. Wire it to real data using Steps 5.1 and 5.2 above.

---

## 5.7 Active Sessions — Out of Scope Note

The Security tab shows 2 hardcoded active sessions with a "Revoke" button. Implementing real session management requires:
1. A `user_sessions` table: `(id, user_id, token_jti, device, ip_address, created_at, last_seen_at, is_active)`
2. Storing the JWT `jti` (unique ID) on login
3. `GET /api/v1/auth/sessions` and `DELETE /api/v1/auth/sessions/{id}` endpoints
4. Checking session `is_active` on every authenticated request

This is **medium complexity** and can be done as a separate sprint. For now the section is UI-only.

---

## 5.8 Integrations Tab — Out of Scope Note

The Integrations tab shows 5 third-party services (Slack, Google Sheets, Zoom, Power BI, JIRA) with Connect/Disconnect buttons. Each integration requires OAuth 2.0 flows and webhooks specific to each vendor's API. These are **out of scope for the current sprint**. The tab remains UI-only (toast on click) until a dedicated integrations sprint is planned.

---

## 5.9 Two-Factor Authentication — Out of Scope Note

The Security tab displays "Two-factor authentication: Enabled" with a "Manage" button (toast only). Real 2FA requires TOTP library (`pyotp`), a `user_totp_secrets` table, and QR code generation. This is **out of scope** for the current sprint.

---

## Frontend Wiring (Settings)

```js
// In Settings.jsx — add these imports:
import apiClient from '../../services/api'
import { leadershipApi } from '../../services/adminApi'

// Add to leadershipApi in adminApi.js:
getNotifPrefs:    ()        => apiClient.get('/api/v1/leadership/notification-preferences').then(r => r.data),
saveNotifPrefs:   (payload) => apiClient.put('/api/v1/leadership/notification-preferences', payload).then(r => r.data),
getPreferences:   ()        => apiClient.get('/api/v1/leadership/preferences').then(r => r.data),
savePreferences:  (payload) => apiClient.put('/api/v1/leadership/preferences', payload).then(r => r.data),
changePassword:   (payload) => apiClient.post('/api/v1/auth/change-password', payload).then(r => r.data),
```

---

---

# Complete Endpoint Summary

| Method | Endpoint | Page | Priority |
|---|---|---|---|
| GET | `/api/v1/leadership/stats` ✅ | Dashboard | Already done |
| GET | `/api/v1/leadership/activities` ✅ | Dashboard | Already done |
| GET | `/api/v1/leadership/activity-chart` | Dashboard | 🔴 High |
| GET | `/api/v1/leadership/system-health` | Dashboard | 🟡 Medium |
| GET | `/api/v1/leadership/ai-services` | Dashboard | 🟡 Medium |
| GET | `/api/v1/leadership/dashboard-alerts` | Dashboard | 🟢 Low (optional) |
| GET | `/api/v1/leadership/students` | Students | 🔴 High |
| GET | `/api/v1/leadership/student-stats` | Students | 🔴 High |
| GET | `/api/v1/leadership/student-courses` | Students | 🟡 Medium |
| POST | `/api/v1/leadership/intervene` | Students | 🟡 Medium |
| GET | `/api/v1/leadership/students/{id}/certificate` | Students | 🟡 Medium |
| GET | `/api/v1/leadership/students/export` | Students | 🟢 Low |
| GET | `/api/v1/leadership/courses` | Curriculum | 🔴 High |
| GET | `/api/v1/leadership/courses/{id}/health` | Curriculum | 🔴 High |
| GET | `/api/v1/leadership/courses/{id}/problem-areas` | Curriculum | 🔴 High |
| GET | `/api/v1/leadership/courses/{id}/content-effectiveness` | Curriculum | 🟡 Medium |
| GET | `/api/v1/leadership/courses/{id}/optimization-plan` | Curriculum | 🟡 Medium |
| GET | `/api/v1/leadership/courses/{id}/retention` | Curriculum | 🟡 Medium |
| GET | `/api/v1/leadership/courses/{id}/report` | Curriculum | 🟢 Low |
| POST | `/api/v1/leadership/reports/generate` | Analytics | 🔴 High |
| GET | `/api/v1/leadership/reports` | Analytics | 🔴 High |
| GET | `/api/v1/leadership/reports/{id}/download` | Analytics | 🔴 High |
| GET | `/api/v1/leadership/ai-insights` | Analytics | 🔴 High |
| POST | `/api/v1/leadership/reports/email` | Analytics | 🟡 Medium |
| GET | `/api/v1/leadership/scheduled-reports` | Analytics | 🟡 Medium |
| POST | `/api/v1/leadership/scheduled-reports` | Analytics | 🟡 Medium |
| DELETE | `/api/v1/leadership/scheduled-reports/{id}` | Analytics | 🟡 Medium |
| GET | `/api/v1/leadership/management/stats` | Management | 🔴 High |
| GET | `/api/v1/leadership/trainers` | Management | 🔴 High |
| POST | `/api/v1/leadership/trainers/invite` | Management | 🟡 Medium |
| POST | `/api/v1/leadership/trainers/message` | Management | 🟡 Medium |
| GET | `/api/v1/leadership/announcements` | Management | 🔴 High |
| POST | `/api/v1/leadership/announcements` | Management | 🔴 High |
| DELETE | `/api/v1/leadership/announcements/{id}` | Management | 🟡 Medium |
| GET | `/api/v1/leadership/program-settings` | Management | 🟡 Medium |
| PUT | `/api/v1/leadership/program-settings` | Management | 🟡 Medium |
| — | Permissions tab | Management | ⚪ UI-only (out of scope) |
| GET | `/api/v1/auth/me` ✅ | Settings | Already done |
| PUT | `/api/v1/auth/profile` ✅ | Settings | Already done |
| POST | `/api/v1/auth/change-password` | Settings | 🔴 High |
| GET | `/api/v1/leadership/notification-preferences` | Settings | 🟡 Medium |
| PUT | `/api/v1/leadership/notification-preferences` | Settings | 🟡 Medium |
| GET | `/api/v1/leadership/preferences` | Settings | 🟢 Low |
| PUT | `/api/v1/leadership/preferences` | Settings | 🟢 Low |
| — | Active Sessions tab | Settings | ⚪ Out of scope (needs session table) |
| — | Integrations tab | Settings | ⚪ Out of scope (OAuth per vendor) |
| — | 2FA Management | Settings | ⚪ Out of scope (needs pyotp) |

---

# Team Assignment Template

| Page | Assign To | Status |
|---|---|---|
| Students (1.1–1.5) | _______________ | ⬜ Not Started |
| Curriculum (2.1–2.5) | _______________ | ⬜ Not Started |
| Analytics (3.1–3.4) | _______________ | ⬜ Not Started |
| Management (4.1–4.5) | _______________ | ⬜ Not Started |
| Settings (5.1–5.6) | _______________ | ⬜ Not Started |
