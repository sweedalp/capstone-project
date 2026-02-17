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
