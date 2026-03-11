# Leadership Module — What Was Built & How It Works
### Presentation Reference Document

> This document covers everything implemented for the **Leadership Dashboard**, **Students Page**, and **Curriculum Page** — including backend endpoints, frontend wiring, data flow, and database logic.

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [How API Authentication Works](#2-how-api-authentication-works)
3. [PAGE 0 — Dashboard](#3-page-0--leadership-dashboard)
4. [PAGE 1 — Students](#4-page-1--students-page)
5. [PAGE 2 — Curriculum](#5-page-2--curriculum-page)
6. [Database — What Was Seeded](#6-database--what-was-seeded)
7. [Files Changed Summary](#7-files-changed-summary)
8. [How to Run the Project](#8-how-to-run-the-project)

---

## 1. System Architecture Overview

```
Browser (React + Vite)                Backend (FastAPI + PostgreSQL)
────────────────────────              ──────────────────────────────
localhost:3000                        localhost:8000

/leadership/dashboard   ──HTTP──▶   GET /api/v1/leadership/stats
/leadership/students    ──HTTP──▶   GET /api/v1/leadership/students
/leadership/curriculum  ──HTTP──▶   GET /api/v1/leadership/courses/{id}/health
                                    GET /api/v1/leadership/courses/{id}/problem-areas
                                    ... (7 curriculum endpoints)
```

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Zustand (state management) |
| Backend | Python 3.11, FastAPI, SQLAlchemy ORM |
| Database | PostgreSQL (Neon cloud) |
| Auth | JWT Bearer tokens |

---

## 2. How API Authentication Works

Every leadership endpoint requires the user to be logged in as `leadership` or `admin` role.

```python
# Every endpoint uses this guard:
_user: User = Depends(require_role(["admin", "leadership"]))
```

The frontend attaches the JWT token automatically in every request:

```js
// frontend/src/services/adminApi.js
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Login flow:**
1. User logs in at `/login` → receives JWT token
2. Token stored in `localStorage`
3. All API calls include `Authorization: Bearer <token>` header
4. Backend verifies role → returns data or 403

---

## 3. PAGE 0 — Leadership Dashboard

**URL:** `http://localhost:3000/leadership/dashboard`  
**Frontend file:** `frontend/src/pages/leadership/Dashboard.jsx`  
**Backend endpoints:** `backend/app/api/v1/endpoints/leadership.py`

### What the Dashboard Shows
- **4 Stat Cards** — Total Users, Active Learners, Content Items, Total Courses
- **Recent Activity Feed** — last 8 platform actions (logins, enrollments, completions)

### Endpoint 1 — `GET /api/v1/leadership/stats`
**Purpose:** Powers the 4 stat cards at the top of the dashboard.

**How it works:**
```
Database query                          Returns
──────────────                          ───────
COUNT(users)                     →      total_users: 6
COUNT(users where active=true)   →      active_learners: 2  
COUNT(lessons + modules)         →      content_items: 21
COUNT(courses published)         →      total_courses: 3
```

**Response example:**
```json
{
  "total_users": 6,
  "active_learners": 2,
  "content_items": 21,
  "total_courses": 3
}
```

**Frontend wiring** (`Dashboard.jsx`):
```jsx
useEffect(() => {
  leadershipApi.getStats().then(data => setStats(data));
}, []);
```

### Endpoint 2 — `GET /api/v1/leadership/activities`
**Purpose:** Powers the Recent Activity feed on the right side of the dashboard.

**How it works:**
- Reads from the `activity_logs` table
- Returns the last N actions with username, action type, description, and timestamp
- Supports `?limit=8` query parameter

**Response example:**
```json
[
  {
    "id": 5,
    "user": "Sweedal Pinto",
    "action": "completed",
    "description": "Completed: Advanced Python Module 2",
    "time_ago": "1 day ago"
  }
]
```

---

## 4. PAGE 1 — Students Page

**URL:** `http://localhost:3000/leadership/students`  
**Frontend file:** `frontend/src/pages/leadership/Students.jsx`  
**State store:** `frontend/src/pages/leadership/_store.js`

### What the Students Page Shows
- **3 Summary Cards** — Avg Progress %, At Risk count, Certifications earned
- **Filter Bar** — search by name/ID, filter by course, filter by status
- **Status Filter Tabs** — All / At Risk / Top Performers / On Track / Behind / Completed
- **Student Table** — paginated list (8 per page) with expandable rows
- **Actions** — Intervene button (at-risk/behind), Certificate download (completed), Details expand
- **Export CSV** button — downloads full student data

### How the Student List is Loaded (No Mock Data)

Previously the page was initialized with hardcoded fake students from `_mockData.js`. This was fixed:

```js
// _store.js — BEFORE (wrong):
students: STUDENTS,   // ← hardcoded mock array loaded immediately

// _store.js — AFTER (correct):
students: [],            // ← empty on load
studentsLoading: false,  // ← spinner shown while fetching
```

```js
// fetchStudents() now calls the real API:
fetchStudents: async () => {
  set({ studentsLoading: true });
  const data = await leadershipApi.getStudents();
  set({ students: data, studentsLoaded: true, studentsLoading: false });
}
```

**Loading flow:**  
`Page loads → spinner shown → API call made → real students replace spinner`

---

### Endpoint 1.1 — `GET /api/v1/leadership/students`
**Purpose:** Returns every learner and their progress across all enrolled courses.

**Key logic — Status Calculation:**

| Condition | Status Shown |
|---|---|
| `progress >= 100%` | ✅ Completed |
| `progress >= 80%` | 🌟 Top Performer |
| `progress >= 50%` and active recently | ✅ On Track |
| `progress < 50%` or inactive 7+ days | ⏰ Behind Schedule |
| `progress < 30%` or inactive 10+ days | 🔴 At Risk |

**How progress % is calculated:**
```
progress % = completed_lessons / total_lessons_in_course × 100

Example:
  Course 1 has 10 lessons
  Test User completed 4 lessons
  Progress = 4/10 × 100 = 40%
```

**Response example (one student row):**
```json
{
  "id": "AI-00001",
  "user_id": 1,
  "name": "Test User",
  "email": "test2@example.com",
  "course": "Advanced Python: AI & ML Integration",
  "course_id": 1,
  "progress": 40,
  "module": "4/10",
  "status": "behind",
  "lastActive": "2 days ago",
  "score": 40,
  "jobReady": false
}
```

**Database tables used:**
- `users` — name, email
- `enrollments` — which user is in which course
- `progress` — which lessons are completed, quiz scores
- `lessons` + `modules` — total lesson count per course

---

### Endpoint 1.2 — `GET /api/v1/leadership/student-stats`
**Purpose:** Powers the 3 summary cards at top of page.

**How it works:**
```
Avg Progress   = average of (completed/total) across all enrollments
At Risk Count  = enrollments where progress < 30%
Certifications = enrollments where progress = 100%
```

**Response:**
```json
{
  "avg_progress": 58.5,
  "at_risk_count": 3,
  "certifications": 2
}
```

---

### Endpoint 1.3 — `GET /api/v1/leadership/student-courses`
**Purpose:** Populates the "All Courses" dropdown filter.

**Returns:** List of published course names pulled live from the `courses` table.

---

### Endpoint 1.4 — `POST /api/v1/leadership/intervene`
**Purpose:** Sends an intervention for an at-risk student.

**What happens when "Intervene" is clicked:**
1. Leadership picks intervention type (Assign Mentor, Schedule 1-on-1, etc.)
2. Optionally writes a personal message
3. Clicks "Send Intervention"
4. Backend logs the action in `activity_logs`
5. Backend creates an in-app notification for the student
6. Student sees the notification the next time they log in

**Request body:**
```json
{
  "student_user_id": 1,
  "intervention_type": "Assign Mentor",
  "message": "We noticed you're falling behind. Let's schedule a session!"
}
```

---

### Endpoint 1.5 — `GET /api/v1/leadership/students/{user_id}/certificate`
**Purpose:** Downloads an HTML certificate for a student who completed a course.

**What it checks:**
- Student exists in DB
- Student has at least one enrollment where `completed_lessons == total_lessons`

**Returns:** An HTML file with certificate design, student name, course name, and today's date.

---

### Endpoint 1.6 — `GET /api/v1/leadership/students/export`
**Purpose:** Downloads all student progress as a CSV file.

**CSV columns:** ID, Name, Email, Course, Progress %, Status, Score %, Last Active

---

### Student Table — Expanded Row
When a row is clicked, it expands to show:
- **Score %** — average quiz score for that enrollment
- **Progress %** — lesson completion percentage
- **Job Ready** — Yes if `progress >= 80` and `avg_score >= 75`
- **Module** — current module position
- **Message button** — opens email compose modal
- **Curriculum button** — navigates to the curriculum page for that course

---

### Snehal User — Removed
Snehal (user_id=6) was a test account. It was cleanly removed from the system:
- Deleted 7 progress records
- Deleted 3 enrollment records
- Deleted the user account

**Only real learners remain:** Test User and Sweedal Pinto.

---

## 5. PAGE 2 — Curriculum Page

**URL:** `http://localhost:3000/leadership/curriculum`  
**Frontend file:** `frontend/src/pages/leadership/Curriculum.jsx`

### What the Curriculum Page Shows
The page has a **course selector dropdown** at the top and **4 tabs**:

| Tab | What it shows |
|---|---|
| Overview | Problem areas + Optimization flags preview + Health index |
| Content Effectiveness | Performance score per content type (videos, quizzes) |
| Optimization | Full list of curriculum improvement recommendations |
| Student Retention | Enrollment completion/dropout stats |

### How the Page Loads (Fully Live Data)

Previously `Curriculum.jsx` read everything from `_store.js` mock data. Now it uses 5 parallel API calls:

```jsx
// On mount: load course list, auto-select first course
useEffect(() => {
  leadershipApi.getCourses().then(data => {
    setCourses(data);
    setSelectedCourseId(data[0].id);   // auto-select first course
  });
}, []);

// When course changes: reload all 5 data panels in parallel
useEffect(() => {
  if (!selectedCourseId) return;
  Promise.all([
    leadershipApi.getCourseHealth(selectedCourseId),
    leadershipApi.getProblemAreas(selectedCourseId),
    leadershipApi.getCourseRetention(selectedCourseId),
    leadershipApi.getContentEffectiveness(selectedCourseId),
    leadershipApi.getOptimizationPlan(selectedCourseId),
  ]).then(([h, pa, ret, ce, op]) => {
    setHealth(h);
    setProblemAreas(pa);
    setRetention(ret);
    setContentEffectiveness(ce);
    setOptimizationPlan(op);
  });
}, [selectedCourseId]);
```

---

### Endpoint 2.1 — `GET /api/v1/leadership/courses`
**Purpose:** Populates the course dropdown at the top of the page.

**Returns:** All published courses from the `courses` table.
```json
[
  { "id": 1, "name": "Advanced Python: AI & ML Integration" },
  { "id": 2, "name": "Introduction to Machine Learning" },
  { "id": 3, "name": "Advanced Neural Networks" }
]
```

---

### Endpoint 2.2 — `GET /api/v1/leadership/courses/{id}/health`
**Purpose:** Powers the **Curriculum Health Index** widget on the Overview tab.

**4 metrics computed from real DB data:**

| Metric | Formula | What It Means |
|---|---|---|
| **Clarity** | `avg(quiz scores)` across all enrolled students | How well students understand the content |
| **Alignment** | `lessons_with_content / total_lessons × 100` | How much of the course has uploaded material |
| **Engagement** | `learners_with_1+_completed / total_enrolled × 100` | Are learners actually doing lessons |
| **ROI** | `avg(progress %) across all enrollments` | Overall course completion performance |
| **Overall Score** | `(Clarity + Alignment + Engagement + ROI) / 4` | Single health number |

**Response:**
```json
{
  "course_id": 1,
  "course_name": "Advanced Python: AI & ML Integration",
  "health": {
    "clarity":    42,
    "alignment":  0,
    "engagement": 100,
    "roi":        57
  },
  "overall_score": 50
}
```

---

### Endpoint 2.3 — `GET /api/v1/leadership/courses/{id}/problem-areas`
**Purpose:** Powers the **Misunderstood Areas** panel on the Overview tab.

**How it works:**
1. Finds all `quiz` type lessons in the selected course
2. For each quiz lesson, gets all student scores from the `progress` table
3. If `avg_score < 65` → flagged as a problem area
4. Calculates `struggle_rate` = % of students who scored below 60

**Severity:**
- `avg < 50` → **Critical** (red)
- `50 ≤ avg < 65` → **Warning** (amber)

**Response:**
```json
[
  {
    "topic": "Functions Quiz",
    "chapter": "Python Fundamentals",
    "avg_score": 42,
    "struggle_rate": 100,
    "severity": "critical",
    "analysis": "100% of students struggle with this topic.",
    "recommendation": "Review lesson content and consider adding supplementary resources."
  }
]
```

---

### Endpoint 2.4 — `GET /api/v1/leadership/courses/{id}/retention`
**Purpose:** Powers the **Student Retention** tab.

**How it works:**
- Loops through all enrollments for the course
- Anyone with `completed = total_lessons` → **Completed**
- Anyone with `done = 0` lessons → **Dropped**
- Everyone else → **In Progress**

**Response:**
```json
{
  "total_enrolled": 3,
  "completed": 1,
  "in_progress": 2,
  "dropped": 0,
  "completion_rate": 33,
  "dropout_rate": 0
}
```

---

### Endpoint 2.5 — `GET /api/v1/leadership/courses/{id}/content-effectiveness`
**Purpose:** Powers the **Content Effectiveness** tab.

**What was fixed:** Originally showed "Interactive Walkthroughs" at 100% — this was a **hardcoded fake row** (no such lesson type exists in the DB). It was removed.

**How it now works:**

| Content Type | Metric Used | Why |
|---|---|---|
| **AI Avatar Videos** | `completions / (enrolled × total_video_lessons) × 100` | Measures how many learners actually watch all videos |
| **Interactive Quizzes** | `avg(quiz score)` across all learners | Measures how well students perform |
| **Audio Lessons** | Same completion ratio as videos | Only shown if text-type lessons exist |

**Response:**
```json
[
  { "type": "AI Avatar Videos", "satisfaction": 24, "icon": "play_circle", "status": "Review" },
  { "type": "Interactive Quizzes", "satisfaction": 55, "icon": "quiz", "status": "Review" }
]
```

**Status labels:**
- `≥ 80%` → **Excellent** (green)
- `≥ 60%` → **Good** (blue)
- `< 60%` → **Review** (amber) — needs attention

---

### Endpoint 2.6 — `GET /api/v1/leadership/courses/{id}/optimization-plan`
**Purpose:** Powers the **Optimization** tab and the top 3 flags preview on Overview.

**How it detects issues:**

**Issue Type 1 — High Struggle Rate:**
- If quiz lesson has `struggle_rate > 50%` (more than half failed) → Priority: **High**
- Title: *"Restructure '[lesson]' in [module]"*

**Issue Type 2 — Medium Struggle Rate:**
- If quiz lesson has `struggle_rate > 35%` → Priority: **Medium**
- Title: *"Review assessment difficulty for '[lesson]'"*

**Issue Type 3 — Missing Prerequisites:**
- If `< 50%` of enrolled learners completed the very first lesson → Priority: **High**
- Title: *"Add prerequisite bridge content"*

**Response:**
```json
[
  {
    "priority": "High",
    "title": "Restructure 'Functions Quiz' in Python Fundamentals",
    "impact": "+0% completion estimate",
    "effort": "Medium",
    "status": "Pending",
    "lesson_id": 3
  },
  {
    "priority": "High",
    "title": "Add prerequisite bridge content",
    "impact": "-8% at-risk rate",
    "effort": "Low",
    "status": "Pending",
    "lesson_id": null
  }
]
```

---

### Endpoint 2.7 — `GET /api/v1/leadership/courses/{id}/report`
**Purpose:** Downloads a CSV report for the selected course. Triggered by the **Export Report** button.

**CSV columns:** Student, Email, Progress %, Avg Score, Status

---

## 6. Database — What Was Seeded

### Real Learners in the System

| User ID | Name | Email | Role | Enrolled In |
|---|---|---|---|---|
| 1 | Test User | test2@example.com | learner | Courses 1, 2, 3 |
| 2 | Sweedal Pinto | sweedalpinto97@gmail.com | learner | Courses 1, 2, 3 |

### Courses

| ID | Title | Modules | Total Lessons |
|---|---|---|---|
| 1 | Advanced Python: AI & ML Integration | Python Fundamentals, Data Handling, Neural Networks Basics | 10 |
| 2 | Introduction to Machine Learning | ML Basics, Supervised Learning | 7 |
| 3 | Advanced Neural Networks | CNN Architectures, Transformers | 5 |

### Quiz Lessons Added (for Curriculum Analytics)

Each module that lacked a quiz had one added so problem areas and optimization plans could be computed:

| Quiz Lesson ID | Title | Module | Avg Score (2 learners) |
|---|---|---|---|
| 3 | Functions Quiz | Python Fundamentals | 40% ← Critical |
| 16 | Data Handling Assessment | Data Handling | 55% ← Warning |
| 17 | Neural Networks Basics Assessment | Neural Networks Basics | 70% |
| 18 | ML Basics Assessment | ML Basics | 40% ← Critical |
| 19 | Supervised Learning Assessment | Supervised Learning | 56% ← Warning |
| 20 | CNN Architectures Assessment | CNN Architectures | 65% |
| 21 | Transformers Assessment | Transformers | 41% ← Critical |

### Progress Data Pattern

Sweedal Pinto has **higher scores** (shows as On Track/Completed for some courses).  
Test User has **lower scores** (shows as Behind Schedule / At Risk).

This creates realistic variation in the student list and curriculum analytics.

---

## 7. Files Changed Summary

### Backend

| File | What Was Changed |
|---|---|
| `backend/app/api/v1/endpoints/leadership.py` | Added **15 total endpoints** across Dashboard, Students, and Curriculum |

**All endpoints added:**

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | GET | `/leadership/stats` | Dashboard stat cards |
| 2 | GET | `/leadership/activities` | Dashboard activity feed |
| 3 | GET | `/leadership/students` | Student list with progress |
| 4 | GET | `/leadership/student-stats` | Student summary cards |
| 5 | GET | `/leadership/student-courses` | Course filter dropdown |
| 6 | POST | `/leadership/intervene` | Send student intervention |
| 7 | GET | `/leadership/students/{id}/certificate` | Certificate HTML download |
| 8 | GET | `/leadership/students/export` | CSV export of all students |
| 9 | GET | `/leadership/courses` | Course selector list |
| 10 | GET | `/leadership/courses/{id}/health` | 4-metric health index |
| 11 | GET | `/leadership/courses/{id}/problem-areas` | Low-scoring quiz topics |
| 12 | GET | `/leadership/courses/{id}/retention` | Completion/dropout stats |
| 13 | GET | `/leadership/courses/{id}/content-effectiveness` | Per-content-type performance |
| 14 | GET | `/leadership/courses/{id}/optimization-plan` | Prioritized fix recommendations |
| 15 | GET | `/leadership/courses/{id}/report` | Course CSV download |

### Frontend

| File | What Was Changed |
|---|---|
| `frontend/src/services/adminApi.js` | Added 13 `leadershipApi` methods to call all new endpoints |
| `frontend/src/pages/leadership/_store.js` | Removed `STUDENTS` mock initialization → `[]`, added `studentsLoading`, wired `fetchStudents()` to real API |
| `frontend/src/pages/leadership/Students.jsx` | Added loading spinner, reads `studentsLoading` state |
| `frontend/src/pages/leadership/Curriculum.jsx` | Completely rewired — removed all `_store`/mock data, added 5 `useState` hooks + 2 `useEffect` hooks for live API data |

---

## 8. How to Run the Project

### Start Backend
```powershell
cd "c:\Users\HP\capstone-project\backend"
python -m uvicorn main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`  
API docs (interactive): `http://localhost:8000/docs`

### Start Frontend
```powershell
cd "c:\Users\HP\capstone-project\frontend"
npm run dev
```
Frontend runs at: `http://localhost:3000`

### Test Login (Leadership Role)
| Field | Value |
|---|---|
| Email | `shalet@example.com` |
| Password | *(set during seed)* |
| Role | Leadership → redirected to `/leadership/dashboard` |

### Quick API Test (no login needed for docs)
Open `http://localhost:8000/docs` → click any `/leadership/` endpoint → click "Try it out" → Execute.

---

*Document generated: March 2026*  
*Backend: FastAPI + PostgreSQL (Neon) | Frontend: React + Vite + TailwindCSS*
