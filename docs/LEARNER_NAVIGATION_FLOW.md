# Learner Navigation Flow
## Complete Click-by-Click Journey: Dashboard → Logout

---

## Overview: Learner Pages & Navigation

```
LOGIN (Page 1)
    ↓
DASHBOARD (Page 4) ←──────────────────┐ [Home/Logo click from anywhere]
    ↓                                  │
[Multiple paths available]             │
    ↓                                  │
[Various pages]                        │
    ↓                                  │
LOGOUT ─────────────────────────────────┘
```

---

## 🏠 PAGE 4: Learner Dashboard (Entry Point)
**Route:** `/learner/dashboard`

### Clickable Elements → Destinations:

#### 1️⃣ **Course Cards Section**
```
┌──────────────────────────────────┐
│ Python 101                       │
│ ████░░░ 60%                      │
│ [Continue] ←─────────────────┐  │
└──────────────────────────────────┘  │
                                       │
       Clicks "Continue" ──────────────┘
                ↓
    Goes to: COURSE OVERVIEW (Page 6)
    (If last activity was in middle of lesson → LESSON CONTENT Page 7)
```

**Navigation:**
- **Click "Continue"** → Course Overview (Page 6) **OR** Lesson Content (Page 7) if resuming mid-lesson
- **Click "[View All →]"** → Course Catalog (Page 5)
- **Click course name** → Course Overview (Page 6)

#### 2️⃣ **Personalized Recommendations Section**
```
┌──────────────────────────────────────┐
│ Based on your recent struggles:      │
│ • "Python Functions" - Video 🎬 ←──┐ │
│ • "Loops Explained" - Audio 🎤      │ │
└──────────────────────────────────────┘ │
                                          │
       Clicks recommendation ─────────────┘
                ↓
    Goes to: LESSON CONTENT (Page 7) with AI enhancement activated
    or AI LEARNING HUB (Page 8) with specific content opened
```

**Navigation:**
- **Click any recommendation** → Lesson Content (Page 7) with specific AI enhancement ready
- **Click video/audio icon** → AI Learning Hub (Page 8) with that content opened

#### 3️⃣ **Quick Access Cards**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ AI Hub 🤖│  │ Search 🔍│  │ Revision │
│          │  │          │  │ Assistant│
└──────────┘  └──────────┘  └──────────┘
     │              │              │
     ↓              ↓              ↓
   Page 8         Page 9         Page 10
```

**Navigation:**
- **Click "AI Learning Hub"** → AI Learning Hub (Page 8)
- **Click "Quick Search"** → Search & Q&A (Page 9)
- **Click "Revision Assistant"** → Revision Assistant (Page 10)

#### 4️⃣ **Global Navigation (Available from Dashboard)**
- **Click "Courses" in sidebar** → Course Catalog (Page 5)
- **Click "My Progress" in sidebar** → Progress Tracking (Page 11)
- **Click search bar in header** → Search & Q&A (Page 9)
- **Click profile icon** → Settings/Profile dropdown
- **Click notifications** → Notifications panel

---

## 📚 PAGE 5: Course Catalog
**Route:** `/learner/courses`
**How you got here:** Clicked "View All" from Dashboard OR "Courses" from sidebar

### Clickable Elements → Destinations:

```
┌────────────────────────────────────────┐
│ 📚 Introduction to Python              │
│ ████░░░░░░ 40% complete                │
│ [Continue Course →] ←────────────────┐ │
└────────────────────────────────────────┘ │
                                            │
       Clicks "Continue Course" ────────────┘
                ↓
    Goes to: COURSE OVERVIEW (Page 6)
```

**Navigation:**

#### From In-Progress Courses:
- **Click "Continue Course →"** → Course Overview (Page 6)
- **Click course title** → Course Overview (Page 6)
- **Click progress bar** → Course Overview (Page 6)
- **Click AI badges (🎤 🎬 🧭 🤖)** → Course Overview (Page 6) with AI Hub tab active

#### From New Courses:
- **Click "Enroll Now"** → Course Overview (Page 6) with enrollment modal
- **Click course title** → Course Overview (Page 6) in preview mode

#### Top Actions:
- **Use search bar** → Filtered results (stays on Page 5)
- **Click filters** → Filtered results (stays on Page 5)
- **Click tab (All/In Progress/Completed)** → Filtered view (stays on Page 5)
- **Click sidebar "Dashboard"** → Dashboard (Page 4)
- **Click logo** → Dashboard (Page 4)

---

## 📖 PAGE 6: Course Overview
**Route:** `/learner/courses/:courseId`
**How you got here:** Clicked course from Catalog OR clicked "Continue" from Dashboard

### Clickable Elements → Destinations:

#### 1️⃣ **Chapter Content - Lesson Items**
```
┌─────────────────────────────────────────┐
│ ▶ Chapter 2: Variables & Data Types     │
│    • Variables Explained 🎬 🎤 🧭 ←───┐ │
│    • Data Types Overview 🎬 🤖         │ │
└─────────────────────────────────────────┘ │
                                             │
       Clicks lesson name ───────────────────┘
                ↓
    Goes to: LESSON CONTENT (Page 7)
```

**Navigation:**
- **Click lesson name** → Lesson Content (Page 7) for that lesson
- **Click AI badge on lesson** → Lesson Content (Page 7) with that AI feature pre-selected
- **Click chapter title** → Expands/collapses chapter (stays on Page 6)
- **Click ✅ completed lesson** → Lesson Content (Page 7) to review
- **Click 🔒 locked lesson** → Shows prerequisite modal (stays on Page 6)

#### 2️⃣ **Top Navigation Tabs**
```
┌────────┬────────┬────────┬─────────┐
│Overview│Content │AI Hub  │Resources│
└────────┴────────┴────────┴─────────┘
```

**Navigation:**
- **Click "Overview" tab** → Same page, shows course description
- **Click "Content" tab** → Same page, shows lesson structure
- **Click "AI Hub" tab** → Same page, shows all AI enhancements for course
- **Click "Resources" tab** → Same page, shows downloadable materials

#### 3️⃣ **From AI Hub Tab (within Page 6)**
```
When on "AI Hub" tab:
│ 🎤 Audio Summaries (12 available) [View All] │
│ 🎬 Video Explainers (8 available) [View All] │
```

**Navigation:**
- **Click individual AI item** → Opens player/viewer (stays on Page 6 with modal)
- **Click "[View All]"** → AI Learning Hub (Page 8) filtered for this course
- **Click "Start AI Enhancement"** → Lesson Content (Page 7) with AI active

#### 4️⃣ **Quick Actions**
- **Click "Continue Where You Left Off"** → Lesson Content (Page 7) at last position
- **Click "Take Assessment"** → Assessment & Quiz (Page 12)
- **Back button or breadcrumb** → Course Catalog (Page 5)

---

## 📝 PAGE 7: Lesson Content (Main Learning Interface)
**Route:** `/learner/courses/:courseId/lessons/:lessonId`
**How you got here:** Clicked lesson from Course Overview

### Clickable Elements → Destinations:

#### 1️⃣ **Main Content Area**
```
┌────────────────────────────────────┐
│ 📹 Main Content Video              │
│ [▶ Play Video] ←─────────────────┐ │
└────────────────────────────────────┘ │
                                        │
       Clicks Play ────────────────────┘
                ↓
    Video plays (stays on Page 7)
```

**Navigation:**
- **Click video player** → Plays video (stays on Page 7)
- **Click "[Show Full Transcript]"** → Expands transcript (stays on Page 7)
- **Click related concept link** → Navigates to that concept's Lesson Content (Page 7)

#### 2️⃣ **AI Enhancement Panel**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐
│ 🎤 Audio │  │ 🎬 Video │  │🧭 Walk   │  │🤖 AI Q&A│
│[Listen]  │  │[Watch]   │  │[Start]   │  │[Ask]    │
└──────────┘  └──────────┘  └──────────┘  └────────┘
     │              │              │              │
     ↓              ↓              ↓              ↓
```

**Navigation:**

**🎤 Click "[Listen]" - Audio Summary:**
- Opens audio player (stays on Page 7)
- Player appears inline or as floating bar
- Can download transcript

**🎬 Click "[Watch]" - Video Explainer:**
- Opens video player modal (stays on Page 7)
- OR navigates to AI Learning Hub (Page 8) with video playing

**🧭 Click "[Start]" - Interactive Walkthrough:**
- Starts walkthrough overlay (stays on Page 7)
- OR navigates to dedicated walkthrough page
- Step-by-step guided experience

**🤖 Click "[Ask]" - AI Q&A:**
- Opens Q&A chat interface (stays on Page 7)
- OR navigates to Search & Q&A (Page 9) with context

**📊 Click Level Selector "[Switch]":**
- Changes content difficulty (stays on Page 7, content refreshes)

**🌍 Click Language "[Change]":**
- Changes content language (stays on Page 7, content refreshes)

**📝 Click "[Start]" Quiz:**
- Navigates to Assessment & Quiz (Page 12)

#### 3️⃣ **Lesson Navigation**
```
[Previous] ────────────── [Next]
     │                        │
     ↓                        ↓
Previous Lesson         Next Lesson
(Page 7, new lessonId)  (Page 7, new lessonId)
```

**Navigation:**
- **Click "[Previous]"** → Previous Lesson Content (Page 7, different lesson)
- **Click "[Next]"** → Next Lesson Content (Page 7, different lesson)
- **Click chapter navigation in sidebar** → Different Lesson Content (Page 7)

#### 4️⃣ **Cross-References Section**
```
🔗 RELATED CONCEPTS
→ Data Types, Functions, Loops ←──────┐
                                       │
       Clicks "Functions" ─────────────┘
                ↓
    Goes to: LESSON CONTENT (Page 7) for Functions lesson
    OR Search & Q&A (Page 9) with Functions search
```

**Navigation:**
- **Click any related concept** → Lesson Content (Page 7) for that topic
- **Click prerequisite link** → Lesson Content (Page 7) for prerequisite

#### 5️⃣ **Top Navigation**
- **Click course name in breadcrumb** → Course Overview (Page 6)
- **Click "Courses" in sidebar** → Course Catalog (Page 5)
- **Click "Dashboard"** → Dashboard (Page 4)

---

## 🤖 PAGE 8: AI Learning Hub
**Route:** `/learner/ai-hub`
**How you got here:** Clicked "AI Learning Hub" from Dashboard OR AI button from Lesson Content

### Clickable Elements → Destinations:

#### 1️⃣ **Audio Learning Section**
```
┌──────────────────────────────────────┐
│ 🔊 Python Functions Explained        │
│ [▶ Play]  [Download]  [Transcript]  │
└──────────────────────────────────────┘
     │          │            │
     ↓          ↓            ↓
  Plays     Downloads   Shows transcript
  (Page 8)  file        (Page 8, modal)
```

**Navigation:**
- **Click "[▶ Play]"** → Plays audio (stays on Page 8, player activates)
- **Click "[Download]"** → Downloads audio file
- **Click "[Transcript]"** → Shows transcript modal (stays on Page 8)
- **Click "[View All Audio Content →]"** → Filtered view showing all audio (stays on Page 8)

#### 2️⃣ **Video Explainers Section**
```
┌──────┐  ┌──────┐  ┌──────┐
│[▶️]  │  │[▶️]  │  │[▶️]  │
│Data  │  │Loops │  │Funcs │
└──────┘  └──────┘  └──────┘
    │         │         │
    ↓         ↓         ↓
  Opens   Opens    Opens
  video   video    video
```

**Navigation:**
- **Click any video thumbnail** → Plays video (stays on Page 8, video modal)
- **Click "[View All Videos →]"** → Shows all videos (stays on Page 8, filtered)
- **Click video title** → Goes to related Lesson Content (Page 7)

#### 3️⃣ **Interactive Walkthroughs Section**
```
• Python Setup Walkthrough          [Start] ←───┐
• Building Your First Program       [Start]     │
                                                 │
       Clicks [Start] ───────────────────────────┘
                ↓
    Opens walkthrough (stays on Page 8 with overlay)
    OR goes to dedicated walkthrough interface
```

**Navigation:**
- **Click "[Start]"** → Launches walkthrough (interactive overlay on Page 8)
- **Click walkthrough title** → Preview/description (stays on Page 8)
- **Click "[View All Walkthroughs →]"** → Shows all (stays on Page 8, filtered)

#### 4️⃣ **Personalized Revision Assistant Section**
```
┌──────────────────────────────────────┐
│ 💬 "What did I struggle with..."     │
│ [Start Personalized Session] ←─────┐ │
└──────────────────────────────────────┘ │
                                          │
       Clicks button ─────────────────────┘
                ↓
    Goes to: REVISION ASSISTANT (Page 10)
```

**Navigation:**
- **Click "[Start Personalized Session]"** → Revision Assistant (Page 10)
- **Click recommended video** → Plays video (stays on Page 8)
- **Click recommended audio** → Plays audio (stays on Page 8)
- **Click recommended quiz** → Assessment & Quiz (Page 12)

#### 5️⃣ **Navigation Away**
- **Click "Dashboard" in sidebar** → Dashboard (Page 4)
- **Click "Back"** → Previous page (where you came from)

---

## 🔍 PAGE 9: Search & Q&A
**Route:** `/learner/search`
**How you got here:** Clicked search bar OR "Quick Search" from Dashboard

### Clickable Elements → Destinations:

#### 1️⃣ **Search Bar**
```
┌────────────────────────────────────────┐
│ What is a Python function?   [Search] │
└────────────────────────────────────────┘
                                    │
       User types and clicks ────────┘
                ↓
    Shows AI Answer + Results (stays on Page 9)
```

**Navigation:**
- **Type and press Enter/Click Search** → Shows results (stays on Page 9)
- **Click suggested search** → Auto-fills and searches (stays on Page 9)

#### 2️⃣ **AI Answer Section**
```
┌────────────────────────────────────────┐
│ 🎬 Watch Video Explanation (5:30) ←──┐ │
│ 🎤 Listen to Audio Summary (3:15)    │ │
│ 🧭 Start Interactive Tutorial        │ │
└────────────────────────────────────────┘ │
                                            │
       Clicks "Watch Video" ────────────────┘
                ↓
    Goes to: AI LEARNING HUB (Page 8) with video playing
    OR opens video modal (stays on Page 9)
```

**Navigation:**
- **Click "🎬 Watch Video"** → AI Learning Hub (Page 8) OR video modal
- **Click "🎤 Listen to Audio"** → Plays audio (stays on Page 9)
- **Click "🧭 Start Tutorial"** → Starts walkthrough
- **Click AI answer text** → Expands answer (stays on Page 9)

#### 3️⃣ **Related Content Section**
```
┌──────────────────┐  ┌──────────────────┐
│ Ch 3: Functions  │  │ Parameters Guide │
│ [View Lesson]    │  │ [View Lesson]    │
└──────────────────┘  └──────────────────┘
         │                      │
         ↓                      ↓
    LESSON CONTENT          LESSON CONTENT
    (Page 7)                (Page 7)
```

**Navigation:**
- **Click "[View Lesson]"** → Lesson Content (Page 7) for that topic
- **Click lesson title** → Lesson Content (Page 7)

#### 4️⃣ **Cross-References Section**
```
🔗 CROSS-REFERENCES
• Variables (prerequisite) ←──────────────┐
• Return statements                       │
• Lambda functions (advanced)             │
                                           │
       Clicks "Variables" ─────────────────┘
                ↓
    Goes to: LESSON CONTENT (Page 7) for Variables
    OR does new search for "Variables" (Page 9)
```

**Navigation:**
- **Click any cross-reference** → Lesson Content (Page 7) OR new search
- **Click "prerequisite" tag** → Shows prerequisite path

#### 5️⃣ **Found in Courses Section**
- **Click course name** → Course Overview (Page 6) for that course
- **Click chapter reference** → Course Overview (Page 6), specific chapter

---

## 🤖 PAGE 10: Revision Assistant
**Route:** `/learner/revision`
**How you got here:** Clicked "Revision Assistant" from Dashboard OR AI Learning Hub

### Clickable Elements → Destinations:

#### 1️⃣ **Chat Interface**
```
┌──────────────────────────────────────┐
│ "Explain what I struggled with..."  │
│                          [Ask] ←────┐│
└──────────────────────────────────────┘│
                                         │
       User types and clicks Ask ────────┘
                ↓
    Shows personalized response (stays on Page 10)
```

**Navigation:**
- **Click "[Ask]"** → Shows AI response (stays on Page 10)
- **Click quick prompt** → Auto-fills and submits (stays on Page 10)

#### 2️⃣ **Areas Needing Attention**
```
┌──────────────────────────────────────┐
│ 1. Python Functions (40% quiz score) │
│    • Watch: Function Parameters 🎬   │
│    • Listen: Functions Explained 🎤  │
│    • Practice: 10 Exercises 📝       │
│    [Start Review Session] ←────────┐ │
└──────────────────────────────────────┘ │
                                          │
       Clicks button ─────────────────────┘
                ↓
    Goes to: LESSON CONTENT (Page 7) with review mode
    OR AI LEARNING HUB (Page 8) with curated content
```

**Navigation:**
- **Click "[Start Review Session]"** → Lesson Content (Page 7) in review mode
  - OR AI Learning Hub (Page 8) with curated playlist
  - OR creates custom review session (stays on Page 10, new view)

- **Click "🎬 Watch"** → AI Learning Hub (Page 8) with video
- **Click "🎤 Listen"** → AI Learning Hub (Page 8) with audio
- **Click "📝 Practice"** → Assessment & Quiz (Page 12) practice mode

#### 3️⃣ **Personalized Study Plan**
```
┌──────────────────────────────────────┐
│ Today:                               │
│ ☐ Review Functions (30 min) 🎬 🎤 ←┐│
│ ☐ Practice Loop Exercises (20 min)  ││
└──────────────────────────────────────┘│
                                         │
       Clicks task ──────────────────────┘
                ↓
    Goes to: Related content (Page 7, 8, or 12)
```

**Navigation:**
- **Click task checkbox** → Marks complete, updates plan (stays on Page 10)
- **Click task text** → Opens that content:
  - "Review Functions" → Lesson Content (Page 7)
  - "Practice Exercises" → Assessment & Quiz (Page 12)
- **Click "[Customize Plan]"** → Study plan editor (stays on Page 10)

#### 4️⃣ **Commonly Misunderstood Areas**
```
│ 1. Function Parameters vs Arguments   │
│    [Watch Explainer 🎬] ←────────────┐│
│ 2. Mutable vs Immutable Types        ││
│    [Watch Explainer 🎬]              ││
└──────────────────────────────────────┘│
                                         │
       Clicks [Watch Explainer] ─────────┘
                ↓
    Goes to: AI LEARNING HUB (Page 8) with that explainer
    OR opens video modal (stays on Page 10)
```

**Navigation:**
- **Click "[Watch Explainer]"** → AI Learning Hub (Page 8) with video
- **Click topic title** → Search & Q&A (Page 9) with that topic

#### 5️⃣ **Navigation Away**
- **Click "Dashboard"** → Dashboard (Page 4)
- **Click any course in recommendations** → Course Overview (Page 6)

---

## 📊 PAGE 11: Progress Tracking
**Route:** `/learner/progress`
**How you got here:** Clicked "My Progress" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **Current Courses Section**
```
┌──────────────────────────────────────┐
│ 📚 Python 101                        │
│ ████████░░ 80% • Ch 4 of 5          │
│ [Continue Learning →] ←────────────┐ │
└──────────────────────────────────────┘ │
                                          │
       Clicks button ─────────────────────┘
                ↓
    Goes to: COURSE OVERVIEW (Page 6)
    OR LESSON CONTENT (Page 7) if resuming mid-lesson
```

**Navigation:**
- **Click "[Continue Learning →]"** → Course Overview (Page 6) OR Lesson Content (Page 7)
- **Click course title** → Course Overview (Page 6)
- **Click progress bar** → Course Overview (Page 6) with progress details

#### 2️⃣ **Learning Stats**
```
│ AI content used:                     │
│   - Videos watched: 15 🎬 ←─────────┐│
│   - Audio listened: 8 🎤             ││
└──────────────────────────────────────┘│
                                         │
       Clicks "Videos watched" ──────────┘
                ↓
    Goes to: AI LEARNING HUB (Page 8) showing watched videos
```

**Navigation:**
- **Click stats (videos, audio, etc.)** → AI Learning Hub (Page 8) filtered view
- **Click chart/graph** → Detailed stats (stays on Page 11, expanded view)
- **Click time period tabs** → Changes view (stays on Page 11)

#### 3️⃣ **Achievements Section**
```
┌──────────────────────────────────────┐
│ 🥇 Python Basics Master ←───────────┐│
│ 🥈 7-Day Streak Achiever            ││
└──────────────────────────────────────┘│
                                         │
       Clicks achievement ────────────────┘
                ↓
    Shows achievement details modal (stays on Page 11)
```

**Navigation:**
- **Click achievement badge** → Shows details modal (stays on Page 11)
- **Click "[View All Achievements]"** → All achievements page (stays on Page 11, expanded)

#### 4️⃣ **Navigation Away**
- **Click "Dashboard"** → Dashboard (Page 4)
- **Click any course** → Course Overview (Page 6)

---

## 📝 PAGE 12: Assessment & Quiz
**Route:** `/learner/courses/:courseId/assessments/:assessmentId`
**How you got here:** Clicked quiz button from Lesson Content OR Course Overview

### Clickable Elements → Destinations:

#### 1️⃣ **During Quiz - Question Navigation**
```
[Previous]    [Skip]    [Next] ←──────┐
                             │         │
                             ↓         │
       Clicks [Next] ─────────────────┘
                ↓
    Goes to: Next question (stays on Page 12)
```

**Navigation:**
- **Click "[Next]"** → Next question (stays on Page 12)
- **Click "[Previous]"** → Previous question (stays on Page 12)
- **Click "[Skip]"** → Skips question, goes to next (stays on Page 12)
- **Click question indicator (✓ ✓ ✓ ● ○ ○)** → Jumps to that question (stays on Page 12)

#### 2️⃣ **During Quiz - Help Options**
```
│ 💡 Hint available    [Show Hint] ←──┐│
│ 🤖 Need help?        [Ask Question] ││
└──────────────────────────────────────┘│
                              │          │
       Clicks [Show Hint] ─────┘        │
                ↓                        │
    Shows hint (stays on Page 12)       │
                                         │
       Clicks [Ask Question] ────────────┘
                ↓
    Opens AI Q&A modal (stays on Page 12)
    OR goes to Search & Q&A (Page 9)
```

**Navigation:**
- **Click "[Show Hint]"** → Shows hint (stays on Page 12, hint appears)
- **Click "[Ask Question]"** → Opens AI Q&A chat (modal on Page 12)

#### 3️⃣ **Quiz Complete - Results Page**
```
┌──────────────────────────────────────┐
│ 🎉 Quiz Completed!                   │
│ YOUR SCORE: 8/10 (80%)              │
│                                      │
│ [Start Review Session] ←───────────┐│
│ [Retake Quiz]                      ││
│ [Continue]                         ││
└──────────────────────────────────────┘│
              │                         │
              ↓                         │
       3 different paths ───────────────┘
```

**Navigation:**

**Click "[Start Review Session]":**
- **→ Revision Assistant (Page 10)** with personalized content based on quiz results
- **OR → AI Learning Hub (Page 8)** with review materials
- **OR → Lesson Content (Page 7)** in review mode for missed topics

**Click "[Retake Quiz]":**
- **→ Assessment & Quiz (Page 12)** restarted from beginning

**Click "[Continue]":**
- **→ Course Overview (Page 6)** to progress to next topic
- **OR → Lesson Content (Page 7)** for next lesson
- **OR → Dashboard (Page 4)** if course/chapter complete

#### 4️⃣ **Personalized Recommendations on Results**
```
│ 🤖 PERSONALIZED RECOMMENDATIONS      │
│ • Watch: "Function Parameters" 🎬 ←─┐│
│ • Listen: "Return Statements" 🎤    ││
│ • Practice: 5 exercises 📝          ││
└──────────────────────────────────────┘│
                                         │
       Clicks recommendation ──────────────┘
                ↓
    Goes to: AI LEARNING HUB (Page 8)
    OR LESSON CONTENT (Page 7)
```

**Navigation:**
- **Click "🎬 Watch"** → AI Learning Hub (Page 8) with video
- **Click "🎤 Listen"** → AI Learning Hub (Page 8) with audio
- **Click "📝 Practice"** → New practice assessment (Page 12)

---

## 🚪 LOGOUT Flow

### From Any Page → Logout

```
Any Page
    │
    ↓
Click Profile Icon (top right) 👤
    │
    ↓
Dropdown Menu Opens
    │
    ├─ Profile/Settings
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

**Logout destinations:**
- **Click "[Logout]"** → Login Page (Page 1)
- **Session expires** → Login Page (Page 1)

---

## 🗺️ COMPLETE LEARNER JOURNEY MAP

### **Journey 1: New Learner Starting a Course**

```
1. Login (Page 1)
       ↓
2. Dashboard (Page 4)
   - Sees enrolled courses
   - Clicks "Continue" on Python 101
       ↓
3. Course Overview (Page 6)
   - Reviews course structure
   - Clicks "Chapter 1: Introduction to Python"
       ↓
4. Lesson Content (Page 7)
   - Watches main video
   - Clicks "🎤 Listen" for audio summary
   - Audio plays on same page
   - Clicks "[Next]"
       ↓
5. Lesson Content (Page 7) - Lesson 2
   - Completes lesson
   - Clicks "📝 Start Quiz"
       ↓
6. Assessment & Quiz (Page 12)
   - Takes quiz, scores 70%
   - Clicks "[Start Review Session]"
       ↓
7. Revision Assistant (Page 10)
   - Reviews struggle areas
   - Clicks "Watch: Function Parameters 🎬"
       ↓
8. AI Learning Hub (Page 8)
   - Watches explainer video
   - Clicks "Dashboard" in sidebar
       ↓
9. Dashboard (Page 4)
   - Reviews progress
   - Clicks profile → Logout
       ↓
10. Login (Page 1) - Session ended
```

---

### **Journey 2: Struggling Learner Using AI Help**

```
1. Login (Page 1)
       ↓
2. Dashboard (Page 4)
   - Sees personalized recommendations
   - Clicks "Revision Assistant" card
       ↓
3. Revision Assistant (Page 10)
   - Sees "Python Functions (40% quiz score)"
   - Types: "Explain functions in simple terms"
   - Clicks [Ask]
   - Gets AI explanation
   - Clicks "[Start Review Session]"
       ↓
4. AI Learning Hub (Page 8)
   - Curated review content appears
   - Plays audio summary
   - Watches video explainer
   - Clicks "[Start]" on walkthrough
   - Completes interactive tutorial
   - Clicks "Dashboard"
       ↓
5. Dashboard (Page 4)
   - Clicks "Python 101" to continue
       ↓
6. Course Overview (Page 6)
   - Clicks "Take Assessment" for Chapter 2
       ↓
7. Assessment & Quiz (Page 12)
   - Better prepared, scores 85%
   - Clicks "[Continue]"
       ↓
8. Course Overview (Page 6)
   - Progress updated
   - Clicks next chapter lesson
       ↓
9. Lesson Content (Page 7)
   - Continues learning
```

---

### **Journey 3: Quick Question Resolution**

```
1. Login (Page 1)
       ↓
2. Dashboard (Page 4)
   - Currently studying, has quick question
   - Clicks search bar in header
       ↓
3. Search & Q&A (Page 9)
   - Types: "What is the difference between list and tuple?"
   - Clicks [Search]
   - Gets AI answer immediately
   - Clicks "🎬 Watch Video Explanation"
       ↓
4. AI Learning Hub (Page 8) OR video modal opens
   - Watches 3-minute explainer
   - Question answered
   - Clicks "Back" or course name
       ↓
5. Lesson Content (Page 7)
   - Returns to where they were studying
   - Continues lesson
```

---

### **Journey 4: Progress Checking & Achievement Review**

```
1. Login (Page 1)
       ↓
2. Dashboard (Page 4)
   - Wants to review progress
   - Clicks "My Progress" in sidebar
       ↓
3. Progress Tracking (Page 11)
   - Reviews overall stats: 45.5 hours, 2 certificates
   - Clicks on "Videos watched: 15 🎬"
       ↓
4. AI Learning Hub (Page 8)
   - Shows history of watched videos
   - Clicks achievement badge
       ↓
5. Progress Tracking (Page 11)
   - Achievement details modal opens
   - Closes modal
   - Clicks "Continue Learning" on Python 101
       ↓
6. Course Overview (Page 6)
   - Sees they're on Chapter 4 of 5
   - Clicks current lesson
       ↓
7. Lesson Content (Page 7)
   - Continues learning
```

---

## 🎯 Navigation Summary by Page

### Quick Reference: "Click X → Go to Y"

| From Page | Click Element | Go To Page |
|-----------|---------------|------------|
| **Dashboard (4)** | Continue on course | Course Overview (6) or Lesson Content (7) |
| **Dashboard (4)** | View All | Course Catalog (5) |
| **Dashboard (4)** | AI Hub card | AI Learning Hub (8) |
| **Dashboard (4)** | Search card | Search & Q&A (9) |
| **Dashboard (4)** | Revision Assistant | Revision Assistant (10) |
| **Dashboard (4)** | Personalized content | Lesson Content (7) or AI Hub (8) |
| | |
| **Course Catalog (5)** | Continue Course | Course Overview (6) |
| **Course Catalog (5)** | Enroll Now | Course Overview (6) |
| | |
| **Course Overview (6)** | Lesson name | Lesson Content (7) |
| **Course Overview (6)** | AI Hub tab item | AI Learning Hub (8) or modal |
| **Course Overview (6)** | Take Assessment | Assessment & Quiz (12) |
| | |
| **Lesson Content (7)** | Next/Previous | Lesson Content (7, different lesson) |
| **Lesson Content (7)** | Audio button | Plays audio (stays on 7) |
| **Lesson Content (7)** | Video button | AI Learning Hub (8) or modal |
| **Lesson Content (7)** | Walkthrough | Walkthrough overlay or page |
| **Lesson Content (7)** | Quiz button | Assessment & Quiz (12) |
| **Lesson Content (7)** | Related concept | Lesson Content (7) or Search (9) |
| | |
| **AI Learning Hub (8)** | Play audio | Plays on page (stays on 8) |
| **AI Learning Hub (8)** | Watch video | Video plays (stays on 8) |
| **AI Learning Hub (8)** | Start walkthrough | Walkthrough (stays on 8) |
| **AI Learning Hub (8)** | Start Personalized | Revision Assistant (10) |
| | |
| **Search & Q&A (9)** | View Lesson | Lesson Content (7) |
| **Search & Q&A (9)** | Watch Video | AI Learning Hub (8) or modal |
| **Search & Q&A (9)** | Cross-reference | Lesson Content (7) or new search |
| | |
| **Revision Assistant (10)** | Start Review | Lesson Content (7) or AI Hub (8) |
| **Revision Assistant (10)** | Watch/Listen | AI Learning Hub (8) |
| **Revision Assistant (10)** | Practice | Assessment & Quiz (12) |
| **Revision Assistant (10)** | Task in plan | Related content (7, 8, or 12) |
| | |
| **Progress (11)** | Continue Learning | Course Overview (6) or Lesson (7) |
| **Progress (11)** | AI stats | AI Learning Hub (8) filtered |
| **Progress (11)** | Achievement | Details modal (stays on 11) |
| | |
| **Assessment (12)** | Next/Previous | Next/prev question (stays on 12) |
| **Assessment (12)** | Ask Question | AI Q&A modal or Search (9) |
| **Assessment (12)** | Start Review | Revision Assistant (10) or AI Hub (8) |
| **Assessment (12)** | Retake Quiz | Assessment (12) restart |
| **Assessment (12)** | Continue | Course Overview (6) or Lesson (7) |
| | |
| **Any Page** | Logo | Dashboard (4) |
| **Any Page** | Dashboard sidebar | Dashboard (4) |
| **Any Page** | Courses sidebar | Course Catalog (5) |
| **Any Page** | Search bar | Search & Q&A (9) |
| **Any Page** | Profile → Logout | Login (1) |

---

## 💡 Key Navigation Patterns

### 1. **The Learning Loop**
```
Dashboard → Course Overview → Lesson Content → 
Assessment → Revision Assistant → AI Learning Hub → 
Back to Lesson Content → Next Lesson
```

### 2. **The Help Pattern**
```
Any Learning Page → Search/Ask Question → 
Get AI Answer → Watch Video/Audio → 
Return to Learning
```

### 3. **The Progress Review**
```
Dashboard → Progress Tracking → 
View Achievement/Stats → Continue Learning
```

### 4. **The Struggle Recovery**
```
Complete Quiz (low score) → Revision Assistant → 
Review Recommendations → AI Learning Hub → 
Practice → Retake Assessment
```

---

## 🔄 Always Available Navigation

No matter which learner page you're on, you can always:

1. **Go Home:** Click logo or "Dashboard" → Dashboard (Page 4)
2. **Search:** Click search bar → Search & Q&A (Page 9)
3. **Browse Courses:** Click "Courses" → Course Catalog (Page 5)
4. **Check Progress:** Click "My Progress" → Progress Tracking (Page 11)
5. **Get AI Help:** Click "AI Hub" → AI Learning Hub (Page 8)
6. **Logout:** Profile → Logout → Login (Page 1)

---

This complete navigation guide shows every clickable element and where it takes learners throughout their entire journey from login to logout!





Logout Process
From any page in the learner interface:

Click Profile Icon (top right corner) 👤

Dropdown Menu Opens with options:

Profile/Settings
Help & Support
[Logout] ← Click this
Optional Confirmation Modal may appear:

"Are you sure you want to logout?"
[Cancel] or [Logout]
Session Cleared - User credentials and session data are cleared

Redirected to Login Page (Page 1)

Two Ways to Trigger Logout:
Manual Logout: User clicks Profile → Logout
Session Expiration: Automatic logout when session expires → redirects to Login Page
The logout is globally available from any learner page (Dashboard, Course Catalog, Lesson Content, AI Hub, etc.) through the profile icon in the header, ensuring users can always securely end their session regardless of where they are in the application.

---

## 📋 COMPLETE LEARNER NAVIGATION FLOW SUMMARY
### From Login to Logout - All Pages & Routes

---

## 🎯 Quick Navigation Overview

### **All Learner Pages (12 Total)**

| Page # | Page Name | Route | Description |
|--------|-----------|-------|-------------|
| **1** | Login | `/login` | Entry point for authentication |
| **4** | Dashboard | `/learner/dashboard` | Main hub with course progress and recommendations |
| **5** | Course Catalog | `/learner/courses` | Browse and enroll in available courses |
| **6** | Course Overview | `/learner/courses/:courseId` | View course structure and lessons |
| **7** | Lesson Content | `/learner/courses/:courseId/lessons/:lessonId` | Main learning interface with AI enhancements |
| **8** | AI Learning Hub | `/learner/ai-hub` | Access AI-generated learning materials |
| **9** | Search & Q&A | `/learner/search` | Search and ask AI questions |
| **10** | Revision Assistant | `/learner/revision` | Personalized study help based on struggles |
| **11** | Progress Tracking | `/learner/progress` or `/learner/analytics` | View learning analytics and achievements |
| **12** | Assessment & Quiz | `/learner/courses/:courseId/assessments/:assessmentId` | Take quizzes and assessments |
| **12b** | Assessment Results | `/learner/courses/:courseId/assessments/:assessmentId/results` | View quiz results and recommendations |

---

## 🔐 AUTHENTICATION FLOW

### **PAGE 1: Login → Entry to System**

```
┌─────────────────────────────────────────┐
│            LOGIN PAGE                    │
│                                          │
│  Email: [________________]              │
│  Password: [____________]               │
│                                          │
│  [ ] Remember Me                        │
│                                          │
│  [Login Button]                         │
│                                          │
│  • Forgot Password?                     │
│  • Don't have account? Sign Up          │
└─────────────────────────────────────────┘
         │
         │ Successful Login
         ↓
    DASHBOARD (Page 4)
```

**After Login:**
- User credentials stored in localStorage
- Session established
- Redirected to Dashboard (Page 4)
- Profile data loaded (userName, userEmail, userRole)

---

## 🏠 LEARNER DASHBOARD (Page 4) - Central Hub

### **Main Sections & Navigation**

#### **1. Learning Progress Courses**
```
Current Courses You're Taking:
┌────────────────────────────────┐
│ Python 101 - 60% Complete      │
│ [Continue Learning] ──────────┐│
└────────────────────────────────┘│
                                  │
    Click → Course Overview OR    │
            Lesson Content        │
```
- **Continue Learning** → Goes to Course Overview (Page 6) OR resumes at Lesson Content (Page 7) if mid-lesson
- **Course Title** → Course Overview (Page 6)
- **Progress Bar** → Course Overview (Page 6)

#### **2. Personalized Recommendations**
```
Based on your struggles:
• Python Functions - Video 🎬
• Loops Explained - Audio 🎤
      │
      ↓
AI Learning Hub (Page 8)
OR Lesson Content (Page 7)
```

#### **3. Quick Access Cards**
```
┌─────────┐  ┌─────────┐  ┌──────────┐
│AI Hub 🤖│  │Search 🔍│  │Revision 📚│
└─────────┘  └─────────┘  └──────────┘
    │             │             │
    ↓             ↓             ↓
  Page 8        Page 9       Page 10
```

#### **4. Recent Activities**
- Shows latest completions, AI interactions
- Click activity → Navigate to relevant page

#### **5. Upcoming Deadlines**
- Shows quiz/assignment due dates
- Click deadline → Assessment (Page 12)

#### **6. Global Header Navigation**
```
[Logo] [Search Bar] [Dashboard] [Courses] [Community] [Notifications] [Settings] [Profile 👤]
  │                      │          │                                                    │
  ↓                      ↓          ↓                                                    ↓
Page 4              Page 4      Page 5                                            Dropdown Menu
                                                                                   with Logout
```

---

## 📚 COURSE CATALOG (Page 5)

### **Navigation Options**

```
COURSE CATALOG
┌─────────────────────────────────────────┐
│ Filters:                                │
│ [All] [In Progress] [Completed]        │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ Python 101 - 40% ████░░░         │   │
│ │ [Continue Course →]               │   │
│ └──────────────────────────────────┘   │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ Data Science Fundamentals        │   │
│ │ [Enroll Now]                      │   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**From Course Card:**
- **Continue Course** → Course Overview (Page 6)
- **Enroll Now** → Course Overview (Page 6) with enrollment
- **Course Title** → Course Overview (Page 6)
- **AI Badges (🎬 🎤 🧭 🤖)** → Course Overview (Page 6) with AI Hub tab

**Filters & Search:**
- All interactions stay on Page 5
- Real-time filtering

---

## 📖 COURSE OVERVIEW (Page 6)

### **Tab Navigation**

```
[Overview] [Content] [AI Hub] [Resources]
    │         │          │          │
    ↓         ↓          ↓          ↓
Course     Lesson    AI Content  Downloads
Details    Structure  Library    & Files
```

### **Content Tab - Lesson Structure**

```
▶ Chapter 1: Introduction
  • Lesson 1: Getting Started ✅
  • Lesson 2: Basic Concepts 🔵 (current)
  • Lesson 3: Practice 🔒 (locked)

▶ Chapter 2: Advanced Topics
  • Lesson 4: Functions 🎬🎤🧭🤖
    │
    ↓
Click Lesson → Lesson Content (Page 7)
Click AI Badge → Lesson Content with AI feature active
```

### **Quick Actions**
```
[Continue Where You Left Off] → Page 7
[Take Assessment] → Page 12
```

---

## 📝 LESSON CONTENT (Page 7) - Main Learning Interface

### **Primary Components**

#### **1. Video/Content Player**
```
┌─────────────────────────────┐
│     Main Video Player        │
│     [▶ Play]                │
└─────────────────────────────┘
│
├─ [Show Transcript] → Expands on same page
├─ [Related Concepts] → Other lessons (Page 7)
└─ [Download] → File download
```

#### **2. AI Enhancement Panel**
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│🎤 Audio│ │🎬 Video│ │🧭 Walk │ │🤖 Q&A  │
│[Listen]│ │[Watch] │ │[Start] │ │[Ask]   │
└────────┘ └────────┘ └────────┘ └────────┘
    │          │          │          │
    ↓          ↓          ↓          ↓
 Plays on  Opens    Walkthrough   Chat
 Page 7    Modal    Overlay       Modal
           OR                      OR
         Page 8                  Page 9
```

#### **3. Knowledge Level Selector**
```
[Beginner] [Intermediate] [Advanced]
         │
         ↓
Content refreshes (stays on Page 7)
```

#### **4. Language Selector**
```
[English] [Spanish] [French] [Hindi]
         │
         ↓
Content translates (stays on Page 7)
```

#### **5. Lesson Navigation**
```
[← Previous]  Lesson 4: Functions  [Next →]
      │                                │
      ↓                                ↓
  Lesson 3                         Lesson 5
  (Page 7)                         (Page 7)
```

#### **6. Related Concepts & Cross-References**
```
🔗 Related:
• Data Types → Lesson Content (Page 7)
• Loops → Lesson Content (Page 7)
• Variables → Lesson Content (Page 7)
```

#### **7. Quiz Access**
```
[Start Quiz] → Assessment (Page 12)
```

---

## 🤖 AI LEARNING HUB (Page 8)

### **Content Sections**

#### **1. Audio Summaries**
```
┌──────────────────────────────────┐
│ 🔊 Python Functions - 12:45      │
│ [▶ Play] [Download] [Transcript]│
└──────────────────────────────────┘
     │         │            │
     ↓         ↓            ↓
  Plays on  Downloads   Shows Modal
  Page 8    File       (Page 8)
```

#### **2. Video Explainers**
```
┌─────┐ ┌─────┐ ┌─────┐
│[▶️] │ │[▶️] │ │[▶️] │
│Data │ │Loops│ │Funcs│
└─────┘ └─────┘ └─────┘
   │
   ↓
Video Modal Opens (Page 8)
OR
Lesson Content (Page 7)
```

#### **3. Interactive Walkthroughs**
```
• Python Setup Walkthrough [Start]
• First Program [Start]
       │
       ↓
Overlay Interface (Page 8)
Step-by-step guidance
```

#### **4. Personalized Revision**
```
┌─────────────────────────────────┐
│ Based on your struggles:         │
│ [Start Personalized Session]    │
└─────────────────────────────────┘
              │
              ↓
    Revision Assistant (Page 10)
```

#### **5. Filters & Search**
```
[All] [Videos] [Audio] [Walkthroughs] [Q&A]
         │
         ↓
Content filtered (stays on Page 8)
```

---

## 🔍 SEARCH & Q&A (Page 9)

### **Search Flow**

```
┌─────────────────────────────────────┐
│ What is a Python function? [Search] │
└─────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│ 🤖 AI ANSWER:                       │
│ A function is a reusable block...  │
│                                      │
│ Learn More:                         │
│ 🎬 Watch Video (5:30)               │
│ 🎤 Listen Audio (3:15)              │
│ 🧭 Interactive Tutorial             │
└─────────────────────────────────────┘
         │         │         │
         ↓         ↓         ↓
    Opens     Plays    Starts
    Modal     Audio    Tutorial
    (Page 8)  (Page 9) (Overlay)
```

### **Related Content**
```
Found in Courses:
┌──────────────────────┐
│ Ch 3: Functions      │
│ [View Lesson] ───────┼───→ Lesson Content (Page 7)
└──────────────────────┘
```

### **Cross-References**
```
🔗 Related Topics:
• Variables (prerequisite)
• Return Statements
• Lambda Functions
      │
      ↓
Click → Lesson Content (Page 7)
     OR New Search (Page 9)
```

---

## 🎓 REVISION ASSISTANT (Page 10)

### **Main Interface**

#### **1. AI Chat Box**
```
┌─────────────────────────────────────┐
│ 💬 Ask me anything...               │
│ [Type your question] [Ask]          │
└─────────────────────────────────────┘
              │
              ↓
AI Response appears (stays on Page 10)
```

#### **2. Areas Needing Attention**
```
┌─────────────────────────────────────┐
│ 1. Python Functions (40% score)     │
│    • 🎬 Watch: Parameters (12:45)   │
│    • 🎤 Listen: Explained (5:00)    │
│    • 📝 Practice: 10 Exercises      │
│    [Start Review Session]           │
└─────────────────────────────────────┘
              │
              ↓
        ┌─────┴─────┐
        │           │
        ↓           ↓
    Lesson     AI Hub
  Content      (Page 8)
  (Page 7)
```

**Individual Actions:**
- **🎬 Watch** → AI Learning Hub (Page 8) with video
- **🎤 Listen** → AI Learning Hub (Page 8) with audio
- **📝 Practice** → Assessment (Page 12)

#### **3. Personalized Study Plan**
```
Today's Tasks:
☐ Review Functions (30 min) 🎬🎤
☐ Practice Loops (20 min)
     │
     ↓
Click task → Opens related content
             (Page 7, 8, or 12)
```

#### **4. Commonly Misunderstood Topics**
```
1. Function Parameters vs Arguments
   [Watch Explainer 🎬]
        │
        ↓
   AI Hub (Page 8)
   OR Modal (Page 10)
```

---

## 📊 PROGRESS TRACKING (Page 11 / Analytics)

### **Dashboard Sections**

#### **1. KPI Cards**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Overall       │ │Total Hours   │ │Current Streak│
│Progress 40%  │ │45.5 hours    │ │15 days 🔥    │
└──────────────┘ └──────────────┘ └──────────────┘
```

#### **2. Weekly Activity Chart**
```
[Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun]
  ││    │││   │     ││││   │││   │     │
  ││    │││   │     ││││   │││   │     │
Hover → Shows exact hours tooltip
```

#### **3. AI Content Usage**
```
┌────────────────────────────────┐
│ Videos: 12.4h 🎬 ←─────────┐  │
│ Audio: 8.1h 🎤             │  │
│ Walkthroughs: 15.0h 🧭     │  │
│ AI Q&A: 10.0h 🤖           │  │
└────────────────────────────────┘
              │
              ↓
        AI Hub (Page 8)
        with filter applied
```

#### **4. Current Courses**
```
┌────────────────────────────────┐
│ Python 101 - 65% ████████░░    │
│ [Continue Learning →]          │
└────────────────────────────────┘
              │
              ↓
    Course Overview (Page 6)
    OR Lesson Content (Page 7)
```

#### **5. Achievements**
```
┌─────┐ ┌─────┐ ┌─────┐
│🥇   │ │🥈   │ │🔒   │
│Earned│ │Earned│ │Locked│
└─────┘ └─────┘ └─────┘
   │
   ↓
Click → Badge Details Modal
        (stays on Page 11)
```

---

## 📝 ASSESSMENT & QUIZ (Page 12)

### **Quiz Interface**

#### **Header**
```
┌──────────────────────────────────────────┐
│ Python Basics Assessment                 │
│ Progress: 4/10 Questions | ⏱️ 14:32     │
│ [Save & Exit] [Profile 👤]              │
└──────────────────────────────────────────┘
```

#### **Question Display**
```
┌──────────────────────────────────────────┐
│ Question 4 of 10:                        │
│ What is the output of print(10 % 3)?    │
│                                          │
│ ○ 0                                      │
│ ○ 1                                      │
│ ● 10                                     │
│ ○ 3                                      │
│                                          │
│ 💡 [Show Hint]                          │
│ 🤖 [Ask AI Assistant]                   │
└──────────────────────────────────────────┘
```

#### **Navigation**
```
[← Previous]   [Skip]   [Next →]
      │          │         │
      ↓          ↓         ↓
   Prev Q    Current Q   Next Q
   (Page 12)  (Page 12)  (Page 12)
```

#### **Question Indicators**
```
✓ ✓ ✓ ● ○ ○ ○ ○ ○ ○
│ │ │ │ │ │ │ │ │ │
1 2 3 4 5 6 7 8 9 10
    │
    ↓
Click number → Jump to that question
```

#### **Help Options**
```
[Show Hint] → Hint appears (Page 12)
[Ask AI] → Modal opens (Page 12)
        OR Search & Q&A (Page 9)
```

---

## 🎉 ASSESSMENT RESULTS (Page 12b)

### **Results Display**

```
┌─────────────────────────────────────────┐
│      🎉 Quiz Completed!                 │
│                                          │
│      YOUR SCORE: 8/10 (80%)            │
│      ★ ★ ★ ★ ☆                         │
│                                          │
│  [Start Review Session]                 │
│  [Retake Quiz]                         │
│  [Continue]                            │
└─────────────────────────────────────────┘
         │          │          │
         ↓          ↓          ↓
    Page 10    Page 12    Page 6/7
   Revision   New Quiz   Next Topic
```

### **Performance Breakdown**
```
✅ Variables - Mastered
✅ Loops - Mastered
⚠️ Functions - Needs Review
❌ Return Statements - Needs Work
```

### **Personalized Recommendations**
```
Based on your results:
┌────────────────────────────────┐
│ 🎬 Function Parameters (12:45) │
│ 🎤 Return Statements (5:00)    │
│ 📝 Practice Exercises (15x)    │
└────────────────────────────────┘
       │          │          │
       ↓          ↓          ↓
    Page 8    Page 8    Page 12
    Video     Audio    Practice
```

---

## 🚪 LOGOUT FLOW (From Any Page)

### **Logout Process**

```
ANY LEARNER PAGE
      │
      ↓
Click Profile Icon (👤)
      │
      ↓
┌─────────────────────────┐
│ Dropdown Menu:          │
│ • Profile & Settings    │
│ • Help & Support        │
│ • [Logout] ←───────┐   │
└─────────────────────────┘   │
                         │
                         ↓
              ┌──────────────────┐
              │ Confirmation:    │
              │ "Are you sure?"  │
              │ [Cancel][Logout] │
              └──────────────────┘
                         │
                         ↓
              Session Cleared:
              • localStorage cleared
              • sessionStorage cleared
                         │
                         ↓
              LOGIN PAGE (Page 1)
```

**Logout is available from:**
- ✅ Dashboard (Page 4)
- ✅ Course Catalog (Page 5)
- ✅ Course Overview (Page 6)
- ✅ Lesson Content (Page 7)
- ✅ AI Learning Hub (Page 8)
- ✅ Search & Q&A (Page 9)
- ✅ Revision Assistant (Page 10)
- ✅ Progress Tracking (Page 11)
- ✅ Assessment & Quiz (Page 12)
- ✅ Assessment Results (Page 12b)

---

## 🗺️ COMPLETE USER JOURNEY EXAMPLES

### **Journey 1: New Learner - First Course**

```
1. LOGIN (Page 1) → Enter credentials
   ↓
2. DASHBOARD (Page 4) → See enrolled courses
   ↓
3. Click "Continue" on Python 101
   ↓
4. COURSE OVERVIEW (Page 6) → Review structure
   ↓
5. Click "Chapter 1: Introduction"
   ↓
6. LESSON CONTENT (Page 7) → Watch video
   ↓
7. Click 🎤 "Listen" for audio summary
   ↓ (audio plays on same page)
8. Click [Next →] button
   ↓
9. LESSON CONTENT (Page 7) → Lesson 2
   ↓
10. Click "Start Quiz"
    ↓
11. ASSESSMENT (Page 12) → Take quiz
    ↓
12. RESULTS (Page 12b) → Score: 70%
    ↓
13. Click "Start Review Session"
    ↓
14. REVISION ASSISTANT (Page 10) → Review struggles
    ↓
15. Click Profile → Logout
    ↓
16. LOGIN (Page 1) → Session ended
```

### **Journey 2: Struggling Learner - Getting Help**

```
1. LOGIN (Page 1)
   ↓
2. DASHBOARD (Page 4) → See low quiz scores
   ↓
3. Click "Revision Assistant" card
   ↓
4. REVISION ASSISTANT (Page 10)
   ↓
5. Type: "Explain Python functions"
   ↓ (AI response appears on Page 10)
6. Click "🎬 Watch" recommendation
   ↓
7. AI LEARNING HUB (Page 8) → Watch video
   ↓
8. Click "Start Walkthrough"
   ↓ (walkthrough overlay on Page 8)
9. Complete interactive tutorial
   ↓
10. Click "Dashboard"
    ↓
11. DASHBOARD (Page 4)
    ↓
12. Click "Python 101" to continue
    ↓
13. COURSE OVERVIEW (Page 6)
    ↓
14. Click "Take Assessment"
    ↓
15. ASSESSMENT (Page 12) → Better score: 85%
    ↓
16. RESULTS (Page 12b) → Click "Continue"
    ↓
17. COURSE OVERVIEW (Page 6) → Next chapter
```

### **Journey 3: Quick Question - In & Out**

```
1. LOGIN (Page 1)
   ↓
2. DASHBOARD (Page 4) → Currently studying
   ↓
3. Click search bar in header
   ↓
4. SEARCH & Q&A (Page 9)
   ↓
5. Type: "list vs tuple difference"
   ↓ (AI answer appears immediately)
6. Read answer
   ↓
7. Click "🎬 Watch Video Explanation"
   ↓ (video modal opens on Page 9)
8. Watch 3-minute video
   ↓
9. Click course name in breadcrumb
   ↓
10. LESSON CONTENT (Page 7) → Resume learning
```

### **Journey 4: Progress Review & Achievement**

```
1. LOGIN (Page 1)
   ↓
2. DASHBOARD (Page 4)
   ↓
3. Click "My Progress" in sidebar
   ↓
4. PROGRESS TRACKING (Page 11)
   ↓
5. View stats: 45.5 hours, 15-day streak
   ↓
6. Click "Videos watched: 12.4h 🎬"
   ↓
7. AI LEARNING HUB (Page 8) → Filtered to videos
   ↓
8. Browse video history
   ↓
9. Click earned badge 🥇
   ↓ (badge details modal opens on Page 11)
10. View achievement: "Python Basics Master"
    ↓
11. Close modal
    ↓
12. Click "Continue Learning" on Python 101
    ↓
13. COURSE OVERVIEW (Page 6) → Chapter 4 of 5
    ↓
14. Click current lesson
    ↓
15. LESSON CONTENT (Page 7) → Continue learning
```

---

## ⚡ QUICK REFERENCE: Global Navigation

### **Always Available (From ANY Page)**

```
┌────────────────────────────────────────────────────┐
│ [Logo] → Dashboard (Page 4)                       │
│ [Search Bar] → Search & Q&A (Page 9)              │
│ [Dashboard] → Dashboard (Page 4)                   │
│ [Courses] → Course Catalog (Page 5)               │
│ [Community] → Community Page                       │
│ [Notifications] → Notifications Panel              │
│ [Settings] → Settings Page                        │
│ [Profile 👤] → Dropdown Menu with Logout          │
└────────────────────────────────────────────────────┘
```

### **Common Navigation Patterns**

#### **Pattern 1: Learning Loop**
```
Dashboard → Course Overview → Lesson Content →
Assessment → Revision Assistant → AI Learning Hub →
Back to Lesson Content → Next Lesson → Repeat
```

#### **Pattern 2: Help Pattern**
```
Any Page → Search/Ask Question →
Get AI Answer → Watch Video/Audio →
Return to Learning Page
```

#### **Pattern 3: Progress Review**
```
Dashboard → Progress Tracking →
View Achievements/Stats → Continue Learning →
Course Overview OR Lesson Content
```

#### **Pattern 4: Struggle Recovery**
```
Complete Quiz (Low Score) → Assessment Results →
Revision Assistant → Review Recommendations →
AI Learning Hub → Practice →
Retake Assessment → Improved Score
```

---

## 📌 KEY NAVIGATION PRINCIPLES

1. **Breadcrumb Navigation**: Always available to go back
2. **Global Header**: Persistent across all pages
3. **Profile Dropdown**: Logout available from everywhere
4. **Smart Resume**: Continue buttons remember your position
5. **AI Integration**: AI help accessible from every learning page
6. **Quick Access**: Important pages reachable in 1-2 clicks
7. **Search Everywhere**: Global search bar in header
8. **Clear Paths**: Multiple ways to reach important destinations
9. **No Dead Ends**: Every page has clear next steps
10. **Session Persistence**: Progress saved automatically

---

## 🎯 SUMMARY: Complete Flow

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  LOGIN ──→ DASHBOARD ──→ COURSES ──→ LEARNING     │
│   (1)        (4)          (5,6)       (7,8,9)      │
│                              │           │          │
│                              ↓           ↓          │
│                         ASSESSMENTS  AI HELP       │
│                            (12)      (8,9,10)      │
│                              │           │          │
│                              ↓           ↓          │
│                         PROGRESS ←─── REVISION     │
│                           (11)        (10)         │
│                              │                      │
│                              ↓                      │
│                          LOGOUT ──→ LOGIN          │
│                                        (1)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**TOTAL PAGES**: 12 learner pages (including variants)
**TOTAL ROUTES**: 11 unique routes
**AVERAGE CLICKS TO ANY PAGE**: 2-3 clicks
**GLOBAL FEATURES**: Search, Profile, Logout (available everywhere)

---

**END OF LEARNER NAVIGATION FLOW DOCUMENTATION**