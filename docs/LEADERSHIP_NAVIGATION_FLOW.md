# Leadership Navigation Flow
## Complete Click-by-Click Journey: Dashboard → Logout

---

## Overview: Leadership Pages & Navigation

```
LOGIN (Page 1)
    ↓
LEADERSHIP DASHBOARD (Page 19) ←──────────┐ [Home/Logo click from anywhere]
    ↓                                      │
[Multiple paths available]                 │
    ↓                                      │
[Various pages]                            │
    ↓                                      │
LOGOUT ─────────────────────────────────────┘
```

---

## 🏠 PAGE 19: Leadership Dashboard (Entry Point)
**Route:** `/leadership/dashboard`
**User Stories:** Leadership #1-7

### Clickable Elements → Destinations:

#### 1️⃣ **Program Overview Cards**
```
┌──────────────────────────────────────┐
│ 📊 PROGRAM OVERVIEW                  │
│                                      │
│ Total Students: 450                  │
│ Active Courses: 24                   │
│ Avg Progress: 68%                    │
│ Completion Rate: 72%                 │
│                                      │
│ [View Detailed Metrics →] ←────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: STUDENT PROGRESS (Page 20)
    Shows all students across all programs
```

**Navigation:**
- **Click "[View Detailed Metrics →]"** → Student Progress (Page 20)
- **Click "Total Students: 450"** → Student Progress (Page 20) showing student list
- **Click "Active Courses: 24"** → Course list view (modal or Page 20 filtered)
- **Click "Avg Progress: 68%"** → Student Progress (Page 20) with progress distribution
- **Click "Completion Rate: 72%"** → Student Progress (Page 20) filtered to completed students

#### 2️⃣ **Key Metrics Section**
```
┌──────────────────────────────────────┐
│ 🎯 KEY METRICS                       │
│                                      │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ At Risk     │ │ High        │    │
│ │ Students    │ │ Performers  │    │
│ │    45       │ │    123      │    │
│ │ [View] ←──┐ │ │ [View]      │    │
│ └─────────────┘ └─────────────┘    │
│                                      │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ Behind      │ │ Job Ready   │    │
│ │ Schedule    │ │ Status      │    │
│ │    67       │ │    89%      │    │
│ │ [View]      │ │ [View]      │    │
│ └─────────────┘ └─────────────┘    │
└──────────────────────────────────────┘
              │
       Clicks [View] on "At Risk Students"
              ↓
    Goes to: STUDENT PROGRESS (Page 20)
    Pre-filtered to show at-risk students
```

**Navigation from Key Metrics:**

**Click "[View]" on "At Risk Students":**
- **→ Student Progress (Page 20)** with filter: at-risk students only
- Shows students with <60% progress, low scores, inactivity

**Click "[View]" on "High Performers":**
- **→ Student Progress (Page 20)** with filter: top 25% performers
- Shows high achievers for recognition/showcase

**Click "[View]" on "Behind Schedule":**
- **→ Student Progress (Page 20)** with filter: students behind deadline
- Shows who needs intervention

**Click "[View]" on "Job Ready Status":**
- **→ Student Progress (Page 20)** with readiness assessment view
- Shows employability metrics (US #5)

#### 3️⃣ **Course Performance Overview**
```
┌──────────────────────────────────────┐
│ 📚 COURSE PERFORMANCE                │
│                                      │
│ Python 101                           │
│ Students: 120 | Avg: 78% | ⚠️ 12    │
│ [View Details] ←───────────────────┐│
│                                     ││
│ Data Science                        ││
│ Students: 85 | Avg: 82% | ⚠️ 5     ││
│ [View Details]                     ││
│                                     ││
│ [View All Courses →]               ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Details] ────────────┘
                ↓
    Goes to: CURRICULUM INSIGHTS (Page 21)
    Filtered for that specific course
```

**Navigation from Course Performance:**

**Click "[View Details]" on specific course:**
- **→ Curriculum Insights (Page 21)** for that course
- Shows problem areas, completion rates, common struggles

**Click course name (e.g., "Python 101"):**
- **→ Curriculum Insights (Page 21)** for that course

**Click "⚠️ 12" (at-risk indicator):**
- **→ Student Progress (Page 20)** filtered to at-risk students in that course

**Click average score "Avg: 78%":**
- **→ Curriculum Insights (Page 21)** showing score distribution

**Click "[View All Courses →]":**
- **→ Curriculum Insights (Page 21)** showing all courses overview

#### 4️⃣ **Problem Areas Alert**
```
┌──────────────────────────────────────┐
│ ⚠️ AREAS REQUIRING ATTENTION         │
│                                      │
│ • Python Functions - 45% struggle    │
│   (Python 101, Ch 3)                │
│   [Investigate →]                   │
│                                      │
│ • Data Visualization - 38% struggle  │
│   (Data Science, Ch 5)              │
│   [Investigate →]                   │
│                                      │
│ [View All Problem Areas →] ←───────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Investigate →] ──────────┘
                ↓
    Goes to: CURRICULUM INSIGHTS (Page 21)
    Deep dive into that specific problem area
```

**Navigation:**

**Click "[Investigate →]" on specific problem:**
- **→ Curriculum Insights (Page 21)** focused on that topic
- Shows detailed analysis: which students, common errors, content gaps

**Click problem area title (e.g., "Python Functions"):**
- **→ Curriculum Insights (Page 21)** for that topic

**Click "[View All Problem Areas →]":**
- **→ Curriculum Insights (Page 21)** with full problem analysis

#### 5️⃣ **Recent Reports Section**
```
┌──────────────────────────────────────┐
│ 📊 RECENT REPORTS                    │
│                                      │
│ • Q1 2026 Progress Report            │
│   Generated: Feb 10, 2026            │
│   [View] [Download]                 │
│                                      │
│ • Python 101 Completion Analysis     │
│   Generated: Feb 8, 2026            │
│   [View] [Download]                 │
│                                      │
│ [Generate New Report →] ←──────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: REPORTS & ANALYTICS (Page 22)
    Opens report generation wizard
```

**Navigation:**

**Click "[View]" on report:**
- Opens report viewer (modal on Page 19 OR new tab)
- Can also **→ Reports & Analytics (Page 22)** showing that report

**Click "[Download]":**
- Downloads PDF/Excel file (stays on Page 19)

**Click "[Generate New Report →]":**
- **→ Reports & Analytics (Page 22)** with report builder

**Click report title:**
- **→ Reports & Analytics (Page 22)** showing that report's details

#### 6️⃣ **AI Enhancement Metrics**
```
┌──────────────────────────────────────┐
│ 🤖 AI CONTENT PERFORMANCE            │
│                                      │
│ Audio Usage: 2,345 plays             │
│ Video Usage: 1,876 views             │
│ Walkthrough Completions: 1,234       │
│ AI Q&A Queries: 5,678                │
│                                      │
│ Impact: +15% engagement              │
│                                      │
│ [View AI Analytics →] ←────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: CURRICULUM INSIGHTS (Page 21)
    Shows AI content effectiveness analysis
```

**Navigation:**

**Click "[View AI Analytics →]":**
- **→ Curriculum Insights (Page 21)** with AI metrics tab
- Shows which AI content drives best outcomes

**Click any metric (e.g., "Audio Usage: 2,345"):**
- **→ Curriculum Insights (Page 21)** filtered to that AI type

#### 7️⃣ **Quick Actions Panel**
```
┌──────────────────────────────────────┐
│ 🚀 QUICK ACTIONS                     │
│                                      │
│ [View All Students]                  │
│ [Analyze Curriculum]                 │
│ [Generate Report]                    │
│ [Export Data]                        │
└──────────────────────────────────────┘
     │          │           │        │
     ↓          ↓           ↓        ↓
  Page 20    Page 21     Page 22   Export
```

**Navigation:**
- **Click "[View All Students]"** → Student Progress (Page 20)
- **Click "[Analyze Curriculum]"** → Curriculum Insights (Page 21)
- **Click "[Generate Report]"** → Reports & Analytics (Page 22)
- **Click "[Export Data]"** → Export wizard (modal) or direct download

#### 8️⃣ **Global Navigation (Always Available)**
- **Click logo** → Leadership Dashboard (Page 19)
- **Click "Dashboard" in sidebar** → Leadership Dashboard (Page 19)
- **Click "Students" in sidebar** → Student Progress (Page 20)
- **Click "Curriculum" in sidebar** → Curriculum Insights (Page 21)
- **Click "Reports" in sidebar** → Reports & Analytics (Page 22)
- **Click search bar** → Search interface (filters students/courses/topics)
- **Click notifications 🔔** → Notifications panel (alerts about at-risk students)
- **Click profile 👤** → Profile dropdown menu

---

## 👥 PAGE 20: Student Progress (Track All Learners)
**Route:** `/leadership/students`
**User Stories:** Leadership #2, #3, #5
**How you got here:** Clicked metric/link from Dashboard OR "Students" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **Filter and Search Bar**
```
┌──────────────────────────────────────┐
│ 👥 Student Progress Tracking         │
│                                      │
│ [Search students...] [Filters ▼]    │
│                                      │
│ [All] [At Risk] [On Track] [Ahead]  │
│ [Behind Schedule] [Completed]        │
└──────────────────────────────────────┘
```

**Navigation:**
- **Type in search** → Filters results (stays on Page 20)
- **Click filter tabs** → Shows filtered students (stays on Page 20)
- **Click "[Filters ▼]"** → Advanced filters panel (dropdown on Page 20)
  - Filter by: Course, Progress %, Date range, Job readiness

#### 2️⃣ **Summary Statistics**
```
┌──────────────────────────────────────┐
│ 📊 OVERALL STATISTICS                │
│                                      │
│ Total Students: 450                  │
│ At Risk: 45 (10%) [View] ←─────────┐│
│ High Performers: 123 (27%) [View]   ││
│ Job Ready: 89% [View Details]       ││
│                                      ││
│ [Download Student List]             ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View] on "At Risk" ───────┘
                ↓
    Filters view to at-risk students (stays on Page 20)
```

**Navigation:**
- **Click "[View]" on any stat** → Filters current view (stays on Page 20)
- **Click "[View Details]" on Job Ready** → Shows readiness breakdown (modal or expanded view)
- **Click "[Download Student List]"** → Downloads CSV/Excel (stays on Page 20)

#### 3️⃣ **Student List with Individual Cards**
```
┌──────────────────────────────────────┐
│ John Doe                    ID: 1001 │
│ Python 101 | Progress: 45% | ⚠️     │
│ Last Active: 5 days ago              │
│ Behind Schedule by 2 weeks           │
│                                      │
│ [View Profile] [View Progress] ←───┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View Progress] ──────────┘
                ↓
    Opens detailed progress view
    Can show modal OR stays on Page 20 with expanded view
```

**Navigation from Student Cards:**

**Click "[View Profile]":**
- Opens student profile detail (modal on Page 20)
- Shows: full progress, all courses, assessment scores, AI usage

**Click "[View Progress]":**
- Opens detailed progress modal/panel (stays on Page 20)
- Shows: course-by-course breakdown, timeline, milestones

**Click student name "John Doe":**
- Opens full student profile (modal or dedicated page)

**Click course name "Python 101":**
- **→ Curriculum Insights (Page 21)** for Python 101
- Can show this student's performance highlighted

**Click "⚠️" at-risk indicator:**
- Opens intervention options modal (stays on Page 20)
- Actions: Contact student, Send resources, Flag for review

**Click "Behind Schedule by 2 weeks":**
- Shows schedule details and recommended actions (modal)

#### 4️⃣ **Bulk Actions**
```
When students are selected:
☑ John Doe
☑ Jane Smith
☐ Bob Wilson

[Send Message] [Export Selected] [Flag for Review]
                                            │
       Clicks [Flag for Review] ────────────┘
                ↓
    Flags students and can trigger notifications
    Stays on Page 20 with confirmation
```

**Navigation:**
- **Select + click "[Send Message]"** → Messaging interface (modal)
- **Select + click "[Export Selected]"** → Downloads data (stays on Page 20)
- **Select + click "[Flag for Review]"** → Adds tags (stays on Page 20)

#### 5️⃣ **Progress Distribution Chart**
```
┌──────────────────────────────────────┐
│ 📈 PROGRESS DISTRIBUTION             │
│                                      │
│  [Interactive Chart/Graph]           │
│   Shows: # of students at each %     │
│                                      │
│  0-25%: 23 students                  │
│  26-50%: 67 students ←──────────────┐│
│  51-75%: 145 students                ││
│  76-100%: 215 students               ││
└──────────────────────────────────────┘│
                                        │
       Clicks on "26-50%" bar ──────────┘
                ↓
    Filters to show students in that range (Page 20)
```

**Navigation:**
- **Click chart segments** → Filters view (stays on Page 20)
- **Hover over bars** → Shows tooltip with details

#### 6️⃣ **Job Readiness Assessment**
```
┌──────────────────────────────────────┐
│ 💼 JOB READINESS ASSESSMENT          │
│                                      │
│ Ready: 400 students (89%)            │
│ Not Ready: 50 students (11%)         │
│                                      │
│ Readiness Criteria:                  │
│ • Completed core courses: 95%        │
│ • Assessment scores >80%: 88%        │
│ • Project completion: 92%            │
│                                      │
│ [View Detailed Analysis →] ←───────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Opens readiness details (expanded view on Page 20)
    OR can go to Reports & Analytics (Page 22)
```

**Navigation:**

**Click "[View Detailed Analysis →]":**
- Expands readiness breakdown (stays on Page 20)
- OR **→ Reports & Analytics (Page 22)** with readiness report

**Click "Ready: 400" or "Not Ready: 50":**
- Filters to show those students (stays on Page 20)

**Click readiness criteria:**
- Shows which students don't meet that criterion (stays on Page 20)

#### 7️⃣ **Course Enrollment Overview**
```
┌──────────────────────────────────────┐
│ 📚 ENROLLMENT BY COURSE              │
│                                      │
│ Python 101: 120 students             │
│   Avg Progress: 68% [Details] ←────┐│
│                                     ││
│ Data Science: 85 students           ││
│   Avg Progress: 72% [Details]      ││
│                                     ││
│ [View All Courses →]               ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Details] ─────────────────┘
                ↓
    Goes to: CURRICULUM INSIGHTS (Page 21)
    Filtered for that course
```

**Navigation:**

**Click "[Details]" on course:**
- **→ Curriculum Insights (Page 21)** for that course

**Click course name:**
- **→ Curriculum Insights (Page 21)** for that course

**Click "[View All Courses →]":**
- **→ Curriculum Insights (Page 21)** showing all courses

#### 8️⃣ **Timeline and Milestones**
```
┌──────────────────────────────────────┐
│ 📅 UPCOMING MILESTONES               │
│                                      │
│ • Feb 28: Python 101 Deadline        │
│   45 students at risk of missing     │
│   [View Students] ←────────────────┐│
│                                     ││
│ • Mar 15: Data Science Final        ││
│   85 students enrolled              ││
│   [View Students]                   ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Students] ──────────┘
                ↓
    Filters to show students for that milestone
    Stays on Page 20 with filtered view
```

**Navigation:**
- **Click "[View Students]"** → Filters to those students (stays on Page 20)
- **Click milestone title** → Shows milestone details (modal)

#### 9️⃣ **Export and Report Actions**
```
┌──────────────────────────────────────┐
│ 📊 EXPORT & REPORTING                │
│                                      │
│ [Export Current View]                │
│ [Generate Progress Report] ←───────┐│
│ [Custom Report Builder]            ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Generate Progress Report] ┘
                ↓
    Goes to: REPORTS & ANALYTICS (Page 22)
    Pre-configured with student progress report
```

**Navigation:**

**Click "[Export Current View]":**
- Downloads current filtered view as CSV/Excel (stays on Page 20)

**Click "[Generate Progress Report]":**
- **→ Reports & Analytics (Page 22)** with student progress report template

**Click "[Custom Report Builder]":**
- **→ Reports & Analytics (Page 22)** with custom report wizard

#### 🔟 **Navigation to Curriculum Analysis**
```
From any student's performance issues:
"John is struggling with Python Functions" ←──┐
[Analyze Curriculum for this Topic]           │
                                               │
       Clicks button ──────────────────────────┘
                ↓
    Goes to: CURRICULUM INSIGHTS (Page 21)
    Focused on "Python Functions" problem area
```

**Navigation:**
- **Click problem area link** → Curriculum Insights (Page 21) for that topic
- **Click "Analyze why students struggle"** → Curriculum Insights (Page 21)

#### ⓫ **Back Navigation**
- **Click "Dashboard" in sidebar** → Leadership Dashboard (Page 19)
- **Click logo** → Leadership Dashboard (Page 19)
- **Click breadcrumb** → Leadership Dashboard (Page 19)

---

## 📚 PAGE 21: Curriculum Insights (Problem Areas)
**Route:** `/leadership/curriculum`
**User Stories:** Leadership #4, #6, #7
**How you got here:** Clicked course/problem from Dashboard or Student Progress

### Clickable Elements → Destinations:

#### 1️⃣ **Course Selection & Overview**
```
┌──────────────────────────────────────┐
│ 📚 Curriculum Analysis               │
│                                      │
│ Select Course: [Python 101 ▼]       │
│                                      │
│ Students Enrolled: 120               │
│ Avg Completion: 68%                  │
│ Problem Areas Identified: 8          │
│                                      │
│ [View All Courses] [Compare Courses] │
└──────────────────────────────────────┘
```

**Navigation:**
- **Click dropdown** → Select different course (stays on Page 21, updates view)
- **Click "[View All Courses]"** → Shows multi-course overview (stays on Page 21)
- **Click "[Compare Courses]"** → Comparison view (stays on Page 21 or opens modal)

#### 2️⃣ **Problem Areas Ranked**
```
┌──────────────────────────────────────┐
│ ⚠️ PROBLEM AREAS (BY STRUGGLE RATE) │
│                                      │
│ 1. Function Parameters - 70% ⚠️⚠️⚠️ │
│    • 84 students affected            │
│    • Avg score: 45%                  │
│    • Common errors: syntax, scope    │
│    [Deep Dive] [View Students] ←───┐│
│                                     ││
│ 2. Loop Syntax - 65% ⚠️⚠️          ││
│    • 78 students affected           ││
│    • Avg score: 52%                 ││
│    [Deep Dive] [View Students]     ││
│                                     ││
│ [View All Problem Areas →]         ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Deep Dive] ──────────────┘
                ↓
    Expands detailed analysis (stays on Page 21)
    OR opens in expanded modal view
```

**Navigation from Problem Areas:**

**Click "[Deep Dive]":**
- Expands to show detailed analysis (stays on Page 21)
- Shows:
  - Which lessons have this problem
  - Common student errors
  - Quiz failure patterns
  - AI content effectiveness for this topic
  - Recommended interventions

**Click "[View Students]":**
- **→ Student Progress (Page 20)** filtered to students struggling with this topic
- Shows list of affected students for intervention

**Click problem area title (e.g., "Function Parameters"):**
- Expands detail view (stays on Page 21)

**Click "⚠️⚠️⚠️" severity indicator:**
- Shows severity explanation (tooltip or modal)

**Click "[View All Problem Areas →]":**
- Shows complete ranked list (stays on Page 21, scrolls or expands)

#### 3️⃣ **Detailed Analysis - Expanded View**
```
When [Deep Dive] is clicked, shows:

┌──────────────────────────────────────┐
│ 🔍 DETAILED ANALYSIS: Function Params│
│                                      │
│ 📊 PERFORMANCE BREAKDOWN             │
│ • Lecture completion: 95%            │
│ • Quiz attempts: 120                 │
│ • Quiz pass rate: 30% ⚠️            │
│ • AI content usage: 45%              │
│                                      │
│ 🎯 COMMON MISTAKES                   │
│ 1. Confusing arguments vs parameters │
│    (45 students - 38%)               │
│ 2. Default parameter syntax          │
│    (38 students - 32%)               │
│ 3. Keyword argument order            │
│    (28 students - 23%)               │
│                                      │
│ 🤖 AI CONTENT EFFECTIVENESS          │
│ • Audio summaries: 65% helpful       │
│ • Video explainers: 78% helpful      │
│ • Walkthroughs: 82% helpful ✅       │
│                                      │
│ 💡 RECOMMENDED ACTIONS               │
│ • Add more walkthrough content       │
│ • Create targeted exercises          │
│ • Consider live Q&A session          │
│                                      │
│ [Generate Report] [View Content] ←─┐│
│ [Export Data] [Flag for Trainers]  ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Generate Report] ─────────┘
                ↓
    Goes to: REPORTS & ANALYTICS (Page 22)
    Pre-configured with this problem area report
```

**Navigation from Detailed Analysis:**

**Click "[Generate Report]":**
- **→ Reports & Analytics (Page 22)** with problem area report template
- Pre-filled with this topic's data

**Click "[View Content]":**
- Shows current lesson content (modal or link to content management)
- Can navigate to trainer view of lessons

**Click "[Export Data]":**
- Downloads detailed data CSV (stays on Page 21)

**Click "[Flag for Trainers]":**
- Sends notification to course trainers (stays on Page 21)
- Modal: "Alert sent to Dr. Smith (Trainer)"

**Click "View" next to common mistakes:**
- Shows which students made that specific mistake
- Can drill down further

#### 4️⃣ **Chapter/Lesson Performance Breakdown**
```
┌──────────────────────────────────────┐
│ 📖 LESSON-BY-LESSON ANALYSIS         │
│                                      │
│ Chapter 1: Introduction - 92% ✅     │
│   No issues detected                 │
│                                      │
│ Chapter 2: Variables - 85% ✅        │
│   Minor issues in Lesson 3           │
│   [Details] ←──────────────────────┐│
│                                     ││
│ Chapter 3: Functions - 45% ⚠️⚠️    ││
│   Major issues in Lessons 2,3,4     ││
│   [Details] [View Students]        ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Details] ─────────────────┘
                ↓
    Expands chapter details (stays on Page 21)
    Shows lesson-level breakdown
```

**Navigation:**

**Click "[Details]" on chapter:**
- Expands to show lesson-level data (stays on Page 21)
- Shows each lesson's performance, completion, quiz scores

**Click "[View Students]":**
- **→ Student Progress (Page 20)** filtered to students struggling with that chapter

**Click lesson name:**
- Shows lesson-specific metrics (expanded on Page 21)

**Click chapter name:**
- Toggles expand/collapse (stays on Page 21)

#### 5️⃣ **Comparison and Trends**
```
┌──────────────────────────────────────┐
│ 📈 TRENDS OVER TIME                  │
│                                      │
│ [Last 30 days] [Last 90 days] [All] │
│                                      │
│ [Chart: Problem Area Severity]       │
│ Shows if problems are getting worse  │
│ or improving over time               │
│                                      │
│ Insight: "Function Parameters"       │
│ struggle rate: 65% → 70% (↑5%) ⚠️   │
│ "Problem is worsening"               │
│                                      │
│ [View Detailed Trends →] ←─────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Opens detailed trend analysis
    Can stay on Page 21 OR go to Reports (Page 22)
```

**Navigation:**

**Click time period buttons:**
- Changes chart view (stays on Page 21)

**Click chart elements:**
- Shows data point details (tooltip or modal)

**Click "[View Detailed Trends →]":**
- Expands trend analysis (stays on Page 21)
- OR **→ Reports & Analytics (Page 22)** with trend report

**Click trend insight:**
- Shows what changed and why (expanded view)

#### 6️⃣ **Cross-Course Comparison**
```
┌──────────────────────────────────────┐
│ 🔄 CROSS-COURSE INSIGHTS             │
│                                      │
│ Common struggle topics across courses:│
│                                      │
│ 1. Data Structures (3 courses) ⚠️   │
│    Python 101, Data Science, Advanced│
│    [Compare] ←─────────────────────┐│
│                                     ││
│ 2. Error Handling (2 courses)       ││
│    Python 101, Software Engineering ││
│    [Compare]                        ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Compare] ─────────────────┘
                ↓
    Opens comparison view (stays on Page 21)
    Shows side-by-side analysis of same topic across courses
```

**Navigation:**

**Click "[Compare]":**
- Shows comparison view (stays on Page 21)
- Side-by-side metrics for same topic in different courses

**Click topic name:**
- Shows which courses have this issue (expanded view)

#### 7️⃣ **AI Content Performance Analysis**
```
┌──────────────────────────────────────┐
│ 🤖 AI CONTENT EFFECTIVENESS          │
│                                      │
│ For "Function Parameters" topic:     │
│                                      │
│ Audio Summaries:                     │
│ • Used by: 54 students (45%)         │
│ • Avg improvement: +12% quiz score   │
│ • Rating: 3.8/5                      │
│                                      │
│ Video Explainers:                    │
│ • Used by: 67 students (56%)         │
│ • Avg improvement: +18% quiz score ✅│
│ • Rating: 4.2/5                      │
│                                      │
│ Interactive Walkthroughs:            │
│ • Used by: 48 students (40%)         │
│ • Avg improvement: +22% quiz score ✅│
│ • Rating: 4.5/5                      │
│                                      │
│ 💡 Insight: Walkthroughs most       │
│            effective for this topic  │
│                                      │
│ [View AI Analytics →] ←────────────┐│
│ [Recommend More AI Content]        ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View AI Analytics →] ─────┘
                ↓
    Opens detailed AI metrics (stays on Page 21)
    OR can go to dedicated AI analytics section
```

**Navigation:**

**Click "[View AI Analytics →]":**
- Expands AI metrics (stays on Page 21)
- Shows detailed usage patterns, before/after scores

**Click "[Recommend More AI Content]":**
- Flags to trainers (notification sent)
- Suggests generating more of effective AI type
- Stays on Page 21 with confirmation

**Click AI content type (e.g., "Video Explainers"):**
- Shows list of videos and their individual performance

#### 8️⃣ **Action Recommendations**
```
┌──────────────────────────────────────┐
│ 💡 RECOMMENDED INTERVENTIONS         │
│                                      │
│ Based on analysis of "Function Params"│
│                                      │
│ Priority 1: HIGH ⚠️                  │
│ • Generate additional walkthrough    │
│   content (most effective AI type)   │
│   [Notify Trainer] ←───────────────┐│
│                                     ││
│ Priority 2: MEDIUM                  ││
│ • Schedule review session for       ││
│   struggling students (84 affected) ││
│   [View Students]                   ││
│                                     ││
│ Priority 3: LOW                     ││
│ • Update quiz questions for clarity ││
│   [Review Quizzes]                  ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Notify Trainer] ──────────┘
                ↓
    Sends notification to trainer (stays on Page 21)
    Modal: "Notification sent to Dr. Smith"
    "Suggested: Create walkthrough for Function Parameters"
```

**Navigation:**

**Click "[Notify Trainer]":**
- Sends alert to course trainer (stays on Page 21)
- Shows confirmation modal

**Click "[View Students]":**
- **→ Student Progress (Page 20)** with filtered list

**Click "[Review Quizzes]":**
- Opens quiz analysis (stays on Page 21 or separate view)
- Shows quiz questions and student responses

**Click priority level:**
- Filters recommendations by priority (stays on Page 21)

#### 9️⃣ **Reports and Export**
```
┌──────────────────────────────────────┐
│ 📊 GENERATE REPORTS                  │
│                                      │
│ [Problem Areas Summary Report] ←───┐│
│ [Course Performance Report]        ││
│ [AI Effectiveness Report]          ││
│ [Custom Curriculum Report]         ││
│                                     ││
│ [Export All Data]                  ││
└──────────────────────────────────────┘│
                                        │
       Clicks any report button ─────────┘
                ↓
    Goes to: REPORTS & ANALYTICS (Page 22)
    Opens that specific report template
```

**Navigation:**

**Click any "[...Report]" button:**
- **→ Reports & Analytics (Page 22)** with that report template loaded
- Can customize and generate

**Click "[Export All Data]":**
- Downloads comprehensive data export (stays on Page 21)

#### 🔟 **Course Actions**
```
Based on insights, can take actions:

[Flag Course for Review] ←──────────┐
[Recommend Content Updates]         │
[Suggest Additional Resources]      │
                                    │
       Clicks [Flag Course for Review] ┘
                ↓
    Flags course in system (stays on Page 21)
    Notification sent to trainers/administrators
```

**Navigation:**
- **Click actions** → Stays on Page 21, shows confirmation
- **May send notifications** to relevant staff

#### ⓫ **Back Navigation**
- **Click "Dashboard"** → Leadership Dashboard (Page 19)
- **Click "Students"** → Student Progress (Page 20)
- **Click breadcrumb** → Previous page
- **Click logo** → Leadership Dashboard (Page 19)

---

## 📊 PAGE 22: Reports & Analytics (Generate Reports)
**Route:** `/leadership/reports`
**User Stories:** Leadership #3, #4, #7
**How you got here:** Clicked report button from any other Leadership page

### Clickable Elements → Destinations:

#### 1️⃣ **Report Templates**
```
┌──────────────────────────────────────┐
│ 📊 Report Generator                  │
│                                      │
│ Select Report Type:                  │
│                                      │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ 📈 Student   │ │ 📚 Curriculum│  │
│ │   Progress   │ │   Analysis   │  │
│ │              │ │              │  │
│ │ [Select] ←─┐ │ │ [Select]     │  │
│ └──────────────┘ └──────────────┘  │
│                                      │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ 💼 Job       │ │ 🤖 AI Content│  │
│ │   Readiness  │ │   Performance│  │
│ │              │ │              │  │
│ │ [Select]     │ │ [Select]     │  │
│ └──────────────┘ └──────────────┘  │
│                                      │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ ⚠️ Problem   │ │ 📋 Custom    │  │
│ │   Areas      │ │   Report     │  │
│ │              │ │              │  │
│ │ [Select]     │ │ [Select]     │  │
│ └──────────────┘ └──────────────┘  │
└──────────────────────────────────────┘
              │
       Clicks [Select] on "Student Progress"
              ↓
    Opens report configuration (stays on Page 22)
    Shows customization options
```

**Navigation:**

**Click "[Select]" on any template:**
- Opens configuration panel (stays on Page 22)
- Shows options for that report type

**Report Types:**
1. **Student Progress Report** - Overall or individual student metrics
2. **Curriculum Analysis Report** - Course performance and problem areas
3. **Job Readiness Report** - Employability assessment
4. **AI Content Performance Report** - AI effectiveness metrics
5. **Problem Areas Report** - Detailed issue analysis
6. **Custom Report** - Build from scratch

#### 2️⃣ **Report Configuration Panel**
```
After selecting a template:

┌──────────────────────────────────────┐
│ 📈 Student Progress Report Config    │
│                                      │
│ Time Period:                         │
│ ○ Last 30 days                       │
│ ○ Last 90 days                       │
│ ● Custom: [From: __] [To: __]       │
│                                      │
│ Include:                             │
│ ☑ Overall statistics                 │
│ ☑ Individual student details         │
│ ☑ Course breakdown                   │
│ ☑ At-risk student list               │
│ ☑ Job readiness assessment           │
│ ☑ Charts and graphs                  │
│                                      │
│ Courses:                             │
│ ☑ All Courses                        │
│ ☐ Python 101 only                    │
│ ☐ Data Science only                  │
│                                      │
│ Students:                            │
│ ● All Students                       │
│ ○ At-Risk only                       │
│ ○ High Performers only               │
│ ○ Custom selection [Browse] ←──────┐│
│                                     ││
│ Format:                             ││
│ ● PDF  ○ Excel  ○ PowerPoint       ││
│                                     ││
│ [Preview Report] [Generate] ←──────┤│
└──────────────────────────────────────┘│
                    │              │    │
                    ↓              ↓    │
                 Preview       Generate │
                (modal)      (download) │
                                         │
       Clicks [Browse] for Custom selection
                ↓
    Opens: Student selector
    Can link to Student Progress (Page 20) to select
```

**Navigation from Configuration:**

**Click "[Browse]" for custom selection:**
- Opens student/course selector (modal on Page 22)
- Can filter and select specific items

**Click "[Preview Report]":**
- Generates preview (modal on Page 22)
- Shows what final report will look like
- Can edit configuration from preview

**Click "[Generate]":**
- Generates full report
- Downloads file (PDF/Excel/PowerPoint)
- Saves to report history (stays on Page 22)
- Shows success message with download link

**Change checkboxes/radio buttons:**
- Updates configuration (stays on Page 22)
- Preview updates dynamically

#### 3️⃣ **Report Preview Modal**
```
When [Preview Report] is clicked:

┌──────────────────────────────────────┐
│ 📄 Report Preview                    │
│                                      │
│ [Report content preview displayed]   │
│ [Shows first few pages]              │
│                                      │
│ Pages: 1 2 3 4 5... [View All]      │
│                                      │
│ [Close] [Edit Config] [Generate] ←─┐│
└──────────────────────────────────────┘│
              │           │        │    │
              ↓           ↓        ↓    │
           Closes    Back to    Downloads│
           modal     config     report  │
                                         │
       Clicks [Generate] ────────────────┘
                ↓
    Downloads final report (PDF/Excel/PPT)
    Stays on Page 22 with success message
```

**Navigation:**
- **Click "[Close]"** → Closes preview (back to Page 22 config)
- **Click "[Edit Config]"** → Back to configuration (stays on Page 22)
- **Click "[Generate]"** → Downloads report (stays on Page 22)
- **Click "[View All]"** → Full preview in new tab or expanded modal

#### 4️⃣ **Saved Reports / Report History**
```
┌──────────────────────────────────────┐
│ 📁 SAVED REPORTS                     │
│                                      │
│ Q1 2026 Student Progress Report      │
│ Generated: Feb 10, 2026              │
│ Format: PDF | Size: 2.5 MB           │
│ [View] [Download] [Regenerate] ←───┐│
│                                     ││
│ Python 101 - Problem Analysis       ││
│ Generated: Feb 8, 2026              ││
│ Format: Excel | Size: 890 KB        ││
│ [View] [Download] [Regenerate]     ││
│                                     ││
│ [View All Reports →]               ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View] ───────────────────┘
                ↓
    Opens report viewer (modal or new tab)
    Can view full report content
```

**Navigation:**

**Click "[View]":**
- Opens report viewer (modal on Page 22 or new tab)
- Shows full report content

**Click "[Download]":**
- Downloads report file (stays on Page 22)

**Click "[Regenerate]":**
- Opens configuration with saved settings (stays on Page 22)
- Can modify and generate updated version

**Click report title:**
- Opens report viewer (same as [View])

**Click "[View All Reports →]":**
- Shows complete report history (stays on Page 22, expanded list)
- Can filter by date, type, format

#### 5️⃣ **Advanced/Custom Report Builder**
```
When "Custom Report" template is selected:

┌──────────────────────────────────────┐
│ 📋 Custom Report Builder             │
│                                      │
│ Report Name: [___________________]   │
│                                      │
│ Select Data Sources:                 │
│ ☑ Student Progress Data              │
│ ☑ Course Completion Rates            │
│ ☐ Assessment Scores                  │
│ ☐ AI Content Usage                   │
│ ☐ Job Readiness Metrics              │
│                                      │
│ Select Visualizations:               │
│ ☑ Progress Charts                    │
│ ☑ Comparison Tables                  │
│ ☐ Trend Graphs                       │
│                                      │
│ Filters:                             │
│ Date Range: [____] to [____]         │
│ Courses: [All ▼]                     │
│ Student Groups: [All ▼]              │
│                                      │
│ [Add Section] [Preview] [Generate] ←┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Add Section] ─────────────┘
                ↓
    Adds new data section to report (stays on Page 22)
    Can build multi-section custom reports
```

**Navigation:**
- **Build report** → Stays on Page 22, configuring
- **Click "[Preview]"** → Preview modal
- **Click "[Generate]"** → Downloads report

#### 6️⃣ **Scheduled Reports**
```
┌──────────────────────────────────────┐
│ ⏰ SCHEDULED REPORTS                 │
│                                      │
│ Monthly Student Progress Report      │
│ Frequency: 1st of each month         │
│ Recipients: leadership@company.com   │
│ [Edit] [Pause] [Details] ←─────────┐│
│                                     ││
│ Weekly At-Risk Student Alert        ││
│ Frequency: Every Monday              ││
│ Recipients: John Doe, Jane Smith    ││
│ [Edit] [Pause] [Details]           ││
│                                     ││
│ [+ Create Scheduled Report]        ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Edit] ───────────────────┘
                ↓
    Opens schedule editor (modal on Page 22)
    Can modify frequency, recipients, content
```

**Navigation:**

**Click "[Edit]":**
- Opens schedule editor (modal on Page 22)
- Modify settings

**Click "[Pause]":**
- Pauses scheduled report (stays on Page 22)
- Can resume later

**Click "[Details]":**
- Shows report history and settings (modal)

**Click "[+ Create Scheduled Report]":**
- Opens scheduling wizard (stays on Page 22)
- Configure new automated report

#### 7️⃣ **Data Export Options**
```
┌──────────────────────────────────────┐
│ 💾 RAW DATA EXPORT                   │
│                                      │
│ Export raw data for external analysis│
│                                      │
│ Data Sets:                           │
│ ☐ All Student Data                   │
│ ☐ Course Data                        │
│ ☐ Assessment Data                    │
│ ☐ AI Usage Data                      │
│                                      │
│ Format: [CSV ▼] [Excel ▼] [JSON ▼]  │
│                                      │
│ [Export Selected Data] ←───────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Downloads data file (stays on Page 22)
    Shows download progress and success
```

**Navigation:**
- **Select data + click "[Export]"** → Downloads file (stays on Page 22)
- **Choose format** → Dropdown selection (stays on Page 22)

#### 8️⃣ **Dashboard and Quick Links**
```
While on Reports page, quick navigation:

┌──────────────────────────────────────┐
│ 🔗 QUICK LINKS                       │
│                                      │
│ [View Student Progress] ←──────────┐│
│ [View Curriculum Insights]         ││
│ [Back to Dashboard]                ││
└──────────────────────────────────────┘│
              │           │        │    │
              ↓           ↓        ↓    │
          Page 20     Page 21   Page 19 │
                                         │
       Clicks link ──────────────────────┘
                ↓
    Navigates to that page
```

**Navigation:**
- **Click "[View Student Progress]"** → Student Progress (Page 20)
- **Click "[View Curriculum Insights]"** → Curriculum Insights (Page 21)
- **Click "[Back to Dashboard]"** → Leadership Dashboard (Page 19)

#### 9️⃣ **Share and Collaborate**
```
After generating a report:

┌──────────────────────────────────────┐
│ Report Generated Successfully! ✅    │
│                                      │
│ Q1 2026 Student Progress Report.pdf  │
│ Size: 2.5 MB | 12 pages             │
│                                      │
│ [Download] [Email] [Share Link] ←──┐│
└──────────────────────────────────────┘│
                           │        │   │
                           ↓        ↓   │
                       Email    Generate│
                       modal    link    │
                                         │
       Clicks [Share Link] ──────────────┘
                ↓
    Generates shareable link (modal on Page 22)
    Shows link with copy button
```

**Navigation:**

**Click "[Download]":**
- Downloads report (stays on Page 22)

**Click "[Email]":**
- Opens email composer (modal on Page 22)
- Enter recipients, add message, send

**Click "[Share Link]":**
- Generates secure link (modal on Page 22)
- Can copy link for sharing

#### 🔟 **Report Analytics**
```
┌──────────────────────────────────────┐
│ 📊 REPORT USAGE ANALYTICS            │
│                                      │
│ Most Generated Reports:              │
│ 1. Student Progress (45 times)       │
│ 2. Problem Areas (32 times)          │
│ 3. Job Readiness (28 times)          │
│                                      │
│ Most Downloaded: Q1 Progress (156×) │
│ Most Shared: Problem Analysis (89×) │
│                                      │
│ [View Detailed Analytics] ←────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Shows detailed usage metrics (stays on Page 22)
```

**Navigation:**
- **Click stats** → Shows breakdown (stays on Page 22)
- **Click report name** → Opens that report template

#### ⓫ **Back Navigation**
- **Click "Dashboard"** → Leadership Dashboard (Page 19)
- **Click "Students"** → Student Progress (Page 20)
- **Click "Curriculum"** → Curriculum Insights (Page 21)
- **Click logo** → Leadership Dashboard (Page 19)
- **Click breadcrumb** → Previous page

---

## 🚪 LOGOUT Flow

### From Any Leadership Page → Logout

```
Any Leadership Page
    │
    ↓
Click Profile Icon (top right) 👤
    │
    ↓
Dropdown Menu Opens
    │
    ├─ My Profile
    ├─ Account Settings
    ├─ Help & Support
    ├─ [Logout] ←────────┐
    │                     │
    └─────────────────────┘
            │
            ↓
    Confirmation Modal (optional)
    "Are you sure you want to logout?"
    [Cancel] [Logout]
            │
            ↓
    Logs out, clears session
            │
            ↓
    Goes to: LOGIN PAGE (Page 1)
```

**Logout Notes:**
- **Unsaved report configurations** are auto-saved as drafts
- **Generated reports** remain in history
- **Scheduled reports** continue to run
- **Can resume** where left off after re-login

---

## 🗺️ COMPLETE LEADERSHIP JOURNEY MAPS

### **Journey 1: Identifying and Addressing At-Risk Students**

```
1. Login (Page 1)
       ↓
2. Leadership Dashboard (Page 19)
   - Reviews key metrics
   - Sees "At Risk Students: 45 (10%)"
   - Troubling number, needs investigation
   - Clicks "[View]" on At Risk metric
       ↓
3. Student Progress (Page 20)
   - Pre-filtered to show 45 at-risk students
   - Reviews list: John Doe (30% progress), Jane Smith (failed assessments)
   - Notices pattern: many struggling with "Python Functions"
   - Clicks student "John Doe"
   - Reviews his profile in modal
   - Sees he's behind in Python 101, Chapter 3
   - Closes modal
   - Wants to understand if this is a broader problem
   - Clicks "Python 101" course name
       ↓
4. Curriculum Insights (Page 21)
   - Automatically filtered for Python 101
   - Sees Problem Areas list
   - Top problem: "Function Parameters - 70% struggle rate"
   - 84 students affected (includes at-risk students)
   - Clicks "[Deep Dive]"
       ↓
5. Detailed Analysis (expanded on Page 21)
   - Reviews breakdown:
     • Quiz pass rate: 30% (very low)
     • AI walkthrough: 82% helpful (most effective)
   - Sees recommendation: "Add more walkthrough content"
   - Clicks "[Generate Report]" to document findings
       ↓
6. Reports & Analytics (Page 22)
   - Opens with "Problem Areas Report" template
   - Pre-filled with "Function Parameters" data
   - Configures report:
     ☑ Include common mistakes
     ☑ Include student list
     ☑ Include AI effectiveness
     ☑ Include recommendations
   - Clicks "[Generate]"
   - Report downloads successfully
       ↓
7. Reports & Analytics (Page 22)
   - Success message with share options
   - Clicks "[Email]"
   - Sends report to:
     • Dr. Smith (Course Trainer)
     • Training Department Head
   - Message: "Urgent: 84 students struggling with Function Parameters. 
              Recommend creating additional walkthrough content (82% effective).
              At-risk students need immediate intervention."
   - Clicks "[Send]"
   - Email sent successfully
   - Clicks "Dashboard" to return
       ↓
8. Leadership Dashboard (Page 19)
   - Reviews other metrics
   - Will monitor if intervention helps
   - Clicks Profile → Logout
       ↓
9. Login (Page 1) - Session ended
   - Problem identified and escalated
   - Actions recommended based on data
```

---

### **Journey 2: Monitoring Program Health and Job Readiness**

```
1. Login (Page 1)
       ↓
2. Leadership Dashboard (Page 19)
   - Monthly review of program health
   - Sees "Job Ready: 89%"
   - Good, but wants details
   - Clicks "[View]" on Job Ready metric
       ↓
3. Student Progress (Page 20)
   - Views job readiness section
   - 400 ready (89%), 50 not ready (11%)
   - Clicks "[View Detailed Analysis]"
   - Expanded view shows readiness criteria:
     • Completed core courses: 95% ✅
     • Assessment scores >80%: 88% ⚠️
     • Project completion: 92% ✅
   - Assessment scores slightly low
   - Clicks "Assessment scores >80%: 88%"
   - Shows 54 students below threshold
   - Wants to see which courses have low scores
   - Clicks "Curriculum" in sidebar
       ↓
4. Curriculum Insights (Page 21)
   - Views all courses overview
   - Notices Data Science course: Avg 72%
   - Lower than others
   - Selects "Data Science" from dropdown
   - Reviews problem areas
   - Chapter 5: Data Visualization - 38% struggle
   - Major issue affecting job readiness
   - Clicks "[Deep Dive]"
       ↓
5. Detailed Analysis (expanded on Page 21)
   - Reviews metrics
   - AI video content: 78% helpful
   - Recommends more video content
   - Clicks "[Flag for Trainers]"
   - Notification sent to Data Science trainer
   - Now wants comprehensive report for stakeholders
   - Clicks "Reports" in sidebar
       ↓
6. Reports & Analytics (Page 22)
   - Needs to create quarterly report
   - Selects "Job Readiness Report" template
   - Configures:
     • Time: Last 90 days
     • Include: All courses, readiness metrics, problem areas
     • Format: PowerPoint (for presentation)
   - Clicks "[Preview Report]"
       ↓
7. Preview Modal (Page 22)
   - Reviews slides: looks good
   - 15 slides covering all key metrics
   - Clicks "[Generate]"
   - PowerPoint downloads
       ↓
8. Reports & Analytics (Page 22)
   - Also wants raw data for deeper analysis
   - Scrolls to "Raw Data Export"
   - Selects:
     ☑ All Student Data
     ☑ Assessment Data
     ☑ Job Readiness Metrics
   - Format: Excel
   - Clicks "[Export Selected Data]"
   - Excel file downloads
       ↓
9. Reports & Analytics (Page 22)
   - Both files ready for board meeting
   - Clicks "[Email]" on PowerPoint report
   - Sends to: Board members, Training leadership
   - Clicks "Dashboard"
       ↓
10. Leadership Dashboard (Page 19)
    - Comprehensive review complete
    - Problem areas flagged
    - Reports distributed
    - Logout when done
```

---

### **Journey 3: Investigating Curriculum Effectiveness**

```
1. Login (Page 1)
       ↓
2. Leadership Dashboard (Page 19)
   - Received feedback: students love AI content
   - Wants to validate with data
   - Sees "AI Content Performance" section
   - Audio: 2,345 plays
   - Video: 1,876 views
   - Impact: +15% engagement
   - Clicks "[View AI Analytics]"
       ↓
3. Curriculum Insights (Page 21)
   - Shows AI content effectiveness
   - Filters to show AI metrics
   - Reviews which AI types work best:
     • Walkthroughs: 82% satisfaction ✅
     • Videos: 78% satisfaction ✅
     • Audio: 65% satisfaction ⚠️
   - Interesting: walkthroughs most effective
   - Wants to see this by course
   - Selects "Python 101" from dropdown
       ↓
4. Curriculum Insights - Python 101 (Page 21)
   - Reviews AI content for this course
   - Sees "Function Parameters" topic
   - Walkthrough: 82% helpful
   - Audio: 65% helpful
   - This matches overall pattern
   - Wants to compare with Data Science course
   - Selects "Data Science" from dropdown
       ↓
5. Curriculum Insights - Data Science (Page 21)
   - AI content pattern different here:
     • Videos: 85% satisfaction ✅✅
     • Walkthroughs: 72% satisfaction
     • Audio: 68% satisfaction
   - Videos work better for Data Science
   - Hypothesis: Visual topics need visual content
   - Wants to document this insight
   - Clicks "[Generate Report]"
       ↓
6. Reports & Analytics (Page 22)
   - Selects "AI Content Performance" template
   - Configures:
     • All courses comparison
     • By AI content type
     • Include student feedback
     • Include effectiveness metrics
   - Clicks "[Generate]"
   - PDF report downloads
   - Findings:
     • Programming topics → Walkthroughs best
     • Visual topics → Videos best
     • Theory topics → Audio acceptable
   - Recommendation: Match AI type to content type
   - Clicks "[Email]"
   - Sends to: Training team, Content creators
   - Message: "Data shows different AI types work for different subjects.
              Recommend: walkthroughs for code, videos for visual concepts."
   - Clicks "Students" to check impact on learners
       ↓
7. Student Progress (Page 20)
   - Filters to "High Performers"
   - Reviews their AI usage
   - High performers use AI content 2x more
   - Strong correlation between AI use and performance
   - Validates investment in AI content
   - Clicks "Dashboard"
       ↓
8. Leadership Dashboard (Page 19)
   - Data-driven insights gained
   - Recommendations made
   - Logout
```

---

### **Journey 4: Quick Daily Review and Monitoring**

```
1. Login (Page 1)
       ↓
2. Leadership Dashboard (Page 19)
   - Daily morning check-in
   - Quick scan of key metrics:
     • Total students: 450 (unchanged)
     • At risk: 45 → 42 (improved! ↓3)
     • Completion rate: 72% → 73% (↑1%)
   - Overall trending positive
   - Checks "Problem Areas" section
   - Sees previous issue "Function Parameters" 
   - Was 70% struggle, now 65% (↓5%)
   - Intervention worked!
   - Clicks "Function Parameters" to verify
       ↓
3. Curriculum Insights (Page 21)
   - Shows Python 101, Function Parameters
   - Struggle rate: 70% → 65% ✅
   - Trainer added walkthrough content (as recommended)
   - Student performance improved
   - Clicks "[View Students]" 
       ↓
4. Student Progress (Page 20)
   - Filtered to students who struggled with Functions
   - Sees improvement:
     • John Doe: 30% → 45% progress (↑15%)
     • Jane Smith: Retook quiz, now passed
   - Intervention successful
   - Clicks "Dashboard"
       ↓
5. Leadership Dashboard (Page 19)
   - No urgent issues today
   - Programs running smoothly
   - Quick check complete (5 minutes)
   - Logout
       ↓
6. Login (Page 1) - Session ended
   - Efficient daily monitoring
   - Can focus on other work
```

---

## 🎯 Navigation Summary by Page

### Quick Reference: "Click X → Go to Y"

| From Page | Click Element | Go To Page |
|-----------|---------------|------------|
| **Leadership Dashboard (19)** | View Detailed Metrics | Student Progress (20) |
| **Leadership Dashboard (19)** | At Risk Students [View] | Student Progress (20, filtered) |
| **Leadership Dashboard (19)** | Course [View Details] | Curriculum Insights (21) |
| **Leadership Dashboard (19)** | Problem Area [Investigate] | Curriculum Insights (21) |
| **Leadership Dashboard (19)** | Generate New Report | Reports & Analytics (22) |
| **Leadership Dashboard (19)** | View AI Analytics | Curriculum Insights (21) |
| | |
| **Student Progress (20)** | Course name | Curriculum Insights (21) |
| **Student Progress (20)** | Generate Progress Report | Reports & Analytics (22) |
| **Student Progress (20)** | Job Ready Details | Expands on 20 or Reports (22) |
| **Student Progress (20)** | Custom Report Builder | Reports & Analytics (22) |
| | |
| **Curriculum Insights (21)** | View Students | Student Progress (20, filtered) |
| **Curriculum Insights (21)** | Generate Report | Reports & Analytics (22) |
| **Curriculum Insights (21)** | Any report button | Reports & Analytics (22) |
| **Curriculum Insights (21)** | Export Data | Download (stays on 21) |
| | |
| **Reports & Analytics (22)** | View Student Progress | Student Progress (20) |
| **Reports & Analytics (22)** | View Curriculum | Curriculum Insights (21) |
| **Reports & Analytics (22)** | Back to Dashboard | Leadership Dashboard (19) |
| **Reports & Analytics (22)** | Generate | Downloads report (stays on 22) |
| | |
| **Any Page** | Logo | Leadership Dashboard (19) |
| **Any Page** | Dashboard sidebar | Leadership Dashboard (19) |
| **Any Page** | Students sidebar | Student Progress (20) |
| **Any Page** | Curriculum sidebar | Curriculum Insights (21) |
| **Any Page** | Reports sidebar | Reports & Analytics (22) |
| **Any Page** | Profile → Logout | Login (1) |

---

## 💡 Key Navigation Patterns

### 1. **The Investigation Loop**
```
Dashboard (see alert) → Student Progress (identify affected) → 
Curriculum Insights (root cause) → Reports (document) → 
Action (notify trainers)
```

### 2. **The Monitoring Pattern**
```
Dashboard (daily check) → Key metrics → 
Drill down if issues → Back to Dashboard
```

### 3. **The Reporting Flow**
```
Any Page (identify insight) → Reports & Analytics → 
Configure → Preview → Generate → Share/Email
```

### 4. **The Problem Resolution**
```
Dashboard (alert) → Curriculum Insights (analyze) → 
Student Progress (identify affected) → Reports (document) → 
Action taken → Monitor improvement
```

---

## 🔄 Always Available Navigation

No matter which Leadership page you're on, you can always:

1. **Go Home:** Click logo or "Dashboard" → Leadership Dashboard (Page 19)
2. **View Students:** Click "Students" → Student Progress (Page 20)
3. **Analyze Curriculum:** Click "Curriculum" → Curriculum Insights (21)
4. **Generate Reports:** Click "Reports" → Reports & Analytics (Page 22)
5. **Search:** Use search bar to find students/courses/topics
6. **Notifications:** Check alerts for urgent issues
7. **Logout:** Profile → Logout → Login (Page 1)

---

## 🎯 Leadership-Specific Features

### High-Level Overview
- **Dashboard-first design** - All key metrics at a glance
- **Drill-down capability** - Click any metric to investigate
- **Cross-page context** - Filters and selections carry between pages

### Data-Driven Decisions
- **Every metric is clickable** - Leads to detailed view
- **Reports generated on demand** - Any insight can become a report
- **AI effectiveness tracking** - Validate AI content investment

### Action-Oriented
- **Problem identification** - Automatic alerts for issues
- **Recommended actions** - System suggests interventions
- **Direct communication** - Flag issues, notify trainers

### Time-Efficient
- **Quick daily check** - Dashboard shows what matters
- **Saved reports** - Don't rebuild common reports
- **Scheduled reports** - Automated delivery

---

This complete navigation guide shows every clickable element and where it takes leadership throughout their entire journey from login to logout!
