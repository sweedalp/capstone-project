# UI/UX Design Specification
## LMS & Knowledge Intelligence Platform

---

## Table of Contents
1. [Design Principles](#design-principles)
2. [Information Architecture](#information-architecture)
3. [Common Components](#common-components)
4. [User Flows by Role](#user-flows-by-role)
5. [Page Specifications](#page-specifications)
6. [Navigation Patterns](#navigation-patterns)
7. [Responsive Design Guidelines](#responsive-design-guidelines)

---

## Design Principles

### Core Design Goals
- **Learner-Centric**: Prioritize ease of learning and content discovery
- **AI-First**: Showcase AI-generated enhancements prominently
- **Role-Based**: Adaptive UI based on user role
- **Progressive Disclosure**: Show complexity only when needed
- **Accessible**: WCAG 2.1 AA compliant

---

## Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI LMS PLATFORM                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │ LEARNER │          │ TRAINER │          │LEADERSHIP│
   │  VIEW   │          │  VIEW   │          │   VIEW   │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                     │                     │
   [Learning      [Content           [Analytics
    Interface]     Management]        & Insights]
```

---

## Common Components

### 1. **Global Navigation Bar**
**Components:**
- Logo (top-left)
- Search bar (global concept search)
- AI Assistant icon (quick access)
- Notifications bell
- User profile dropdown
- Role indicator badge

### 2. **Sidebar Navigation** (Collapsible)
**Sections:**
- Dashboard
- My Courses / All Courses (role-based)
- AI Learning Hub
- Progress / Analytics (role-based)
- Settings
- Help & Support

### 3. **AI Enhancement Indicators**
**Visual Tags:**
- 🎤 Audio Available
- 🎬 Video Available
- 🧭 Walkthrough Available
- 🤖 Personalized Content
- 🌍 Multi-language
- 📊 Level-based

### 4. **Footer**
- Quick links
- Documentation
- Support
- Privacy & Terms

---

## User Flows by Role

### LEARNER FLOW
```
Login → Dashboard → Course Selection → Course Content → 
AI Enhancements → Assessments → Progress Tracking → Logout

Alternative Flows:
- Dashboard → AI Learning Hub → Personalized Content
- Dashboard → Search → Concept Search → Related Content
- Dashboard → Revision Assistant → Customized Study
```

### TRAINER FLOW
```
Login → Dashboard → Course Management → Upload Materials → 
AI Content Generation → Review Generated Content → 
Publish → Monitor Student Progress → Logout

Alternative Flows:
- Dashboard → Content Library → Reuse Materials
- Dashboard → AI Studio → Generate Videos/Audio
- Dashboard → Analytics → Student Insights
```

### LEADERSHIP FLOW
```
Login → Dashboard → Program Overview → Course Analytics → 
Student Progress → Identify Issues → Generate Reports → Logout

Alternative Flows:
- Dashboard → Student Metrics → Readiness Assessment
- Dashboard → Content Performance → AI Enhancement Metrics
- Dashboard → Curriculum Insights → Misunderstood Areas
```

### LTC ADMIN FLOW
```
Login → System Dashboard → User Management → 
Course Administration → AI Configuration → 
Knowledge Base Management → System Reports → Logout

Alternative Flows:
- Dashboard → Content Processing → Bulk Upload
- Dashboard → AI Pipeline → Processing Status
- Dashboard → Platform Settings → Integration Config
```

---

## Page Specifications

---

## 🔐 AUTHENTICATION PAGES

### PAGE 1: Login Page
**Route:** `/login`
**User Stories:** LTC #6
**Layout:**
```
┌──────────────────────────────────────────────┐
│  [LOGO] AI LMS & Knowledge Intelligence     │
│                                              │
│         ┌────────────────────────┐          │
│         │   Welcome Back         │          │
│         │                        │          │
│         │  Email: [__________]  │          │
│         │  Password: [_______]  │          │
│         │                        │          │
│         │  [  Login  ]          │          │
│         │                        │          │
│         │  Forgot Password?      │          │
│         │  Don't have account?   │          │
│         └────────────────────────┘          │
│                                              │
│  "Transform knowledge into learning"         │
└──────────────────────────────────────────────┘
```
**Components:**
- Email input field
- Password input field (with show/hide)
- Login button (CTA)
- Forgot password link
- Registration link (if enabled)
- Remember me checkbox
- OAuth options (optional)

---

### PAGE 2: User Registration
**Route:** `/register`
**User Stories:** LTC #6
**Layout:**
```
┌──────────────────────────────────────────────┐
│  Create Your Account                         │
│                                              │
│  Full Name: [_________________]             │
│  Email: [_________________]                 │
│  Password: [_________________]              │
│  Confirm Password: [_________________]      │
│  Role: [Learner ▼]                          │
│                                              │
│  [ ] I agree to Terms & Conditions          │
│                                              │
│  [  Create Account  ]                       │
│                                              │
│  Already have an account? Login             │
└──────────────────────────────────────────────┘
```

---

### PAGE 3: Password Recovery
**Route:** `/forgot-password`
**Layout:**
```
┌──────────────────────────────────────────────┐
│  Reset Your Password                         │
│                                              │
│  Enter your email address and we'll send     │
│  you a link to reset your password.         │
│                                              │
│  Email: [_________________]                 │
│                                              │
│  [  Send Reset Link  ]                      │
│                                              │
│  Back to Login                              │
└──────────────────────────────────────────────┘
```

---

## 🎓 LEARNER PAGES (35 User Stories)

---

### PAGE 4: Learner Dashboard
**Route:** `/learner/dashboard`
**User Stories:** Learner #1, #4, #5
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] AI LMS            [Search...]  🔔 👤 John Learner   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Welcome back, John! 👋                                 │
│  Continue your learning journey                          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MY LEARNING PROGRESS             [View All →]  │   │
│  │                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │ Python 101   │  │ Data Science │           │   │
│  │  │ ████░░░ 60%  │  │ ██░░░░░ 30%  │           │   │
│  │  │ 🎤 🎬 🧭 🤖  │  │ 🎤 🎬       │           │   │
│  │  │ [Continue]    │  │ [Continue]    │           │   │
│  │  └──────────────┘  └──────────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🤖 PERSONALIZED FOR YOU                        │   │
│  │                                                  │   │
│  │  Based on your recent struggles:                 │   │
│  │  • "Python Functions" - Video Recap 🎬          │   │
│  │  • "Loops Explained" - Audio Summary 🎤         │   │
│  │  • "Data Types" - Interactive Quiz 🧭          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐     │
│  │ AI Learning  │  │ Quick Search │  │ Revision │     │
│  │ Hub 🤖       │  │ Concepts 🔍  │  │ Assistant│     │
│  └──────────────┘  └──────────────┘  └──────────┘     │
└──────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Hero Section:** Welcome message + Quick stats
2. **Continue Learning:** Current courses with progress bars
3. **Personalized Recommendations:** AI-curated content (US #22-26)
4. **Quick Access Cards:** AI Hub, Search, Revision Assistant
5. **Recent Activity:** Last accessed content
6. **Upcoming Deadlines:** Assignments/milestones

**Key Features:**
- Progress visualization
- AI enhancement badges (🎤 🎬 🧭 🤖)
- Quick action buttons
- Personalization indicators

---

### PAGE 5: Course Catalog
**Route:** `/learner/courses`
**User Stories:** Learner #1, #32
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Courses                                🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  All Courses                                            │
│                                                          │
│  [Search courses...]                    [Filters ▼]     │
│                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┐            │
│  │  All    │ In Prog │ Complet │ Wishlist│            │
│  └─────────┴─────────┴─────────┴─────────┘            │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📚 Introduction to Python                      │    │
│  │  Instructor: Dr. Smith  •  12 weeks            │    │
│  │  ████░░░░░░ 40% complete                       │    │
│  │  🎤 Audio  🎬 Videos  🧭 Walkthroughs  🤖 AI   │    │
│  │  [Continue Course →]                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📊 Data Science Fundamentals                   │    │
│  │  Instructor: Prof. Johnson  •  10 weeks        │    │
│  │  ██░░░░░░░░ 20% complete                       │    │
│  │  🎤 Audio  🎬 Videos  🌍 Multi-lang           │    │
│  │  [Continue Course →]                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🧮 Advanced Machine Learning (NEW!)           │    │
│  │  Instructor: Dr. Chen  •  16 weeks             │    │
│  │  Prerequisites: Python 101, Data Science       │    │
│  │  🎤 🎬 🧭 🤖 🌍 📊                             │    │
│  │  [Enroll Now]                                  │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- Search bar (filters by name, instructor, topic)
- Filter panel (Category, Level, Duration, AI Features)
- Course status tabs (All, In Progress, Completed, Wishlist)
- Course cards with:
  - Title, instructor, duration
  - Progress bar (enrolled courses)
  - AI enhancement badges
  - CTA button (Continue/Enroll/View)
  - Prerequisites indicator (US #9)

---

### PAGE 6: Course Overview
**Route:** `/learner/courses/:courseId`
**User Stories:** Learner #1, #32, #34, #35
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Introduction to Python                🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎓 Introduction to Python                        │   │
│  │ Master the fundamentals of Python programming    │   │
│  │                                                   │   │
│  │ Instructor: Dr. Smith  •  Updated: Jan 2026     │   │
│  │ ████████░░ 80% Complete  •  4 weeks remaining   │   │
│  │                                                   │   │
│  │ 🎤 Audio  🎬 Videos  🧭 Walkthroughs  🤖 AI     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────┬────────────┬────────────┬─────────┐    │
│  │  Overview  │  Content   │  AI Hub    │Resources│    │
│  └────────────┴────────────┴────────────┴─────────┘    │
│                                                          │
│  📚 Course Structure                                    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ Chapter 1: Getting Started (Completed)        │   │
│  │    • Introduction to Python  ✓                   │   │
│  │    • Setup Environment  ✓                        │   │
│  │    • First Program  ✓                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ▶ Chapter 2: Variables & Data Types (Current)   │   │
│  │    • Variables Explained  🎬 🎤 🧭              │   │
│  │    • Data Types Overview  🎬 🤖                  │   │
│  │    • Type Conversion  📝                         │   │
│  │    • Practice Exercises                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔒 Chapter 3: Control Flow (Locked)             │   │
│  │    Prerequisites: Complete Chapter 2             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Key Takeaways • 🎯 Learning Objectives             │
└──────────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview:** Course description, objectives, prerequisites
2. **Content:** Chapter/lesson structure with progress
3. **AI Hub:** All AI-generated enhancements
4. **Resources:** Downloads, links, supplementary materials

**Features:**
- Progress indicator
- Chapter accordion (expandable)
- Lesson status (completed, current, locked)
- AI enhancement icons per lesson
- Prerequisite mapping visualization (US #9)

---

### PAGE 7: Lesson Content View
**Route:** `/learner/courses/:courseId/lessons/:lessonId`
**User Stories:** Learner #2, #3, #6, #7, #8, #31-35
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Python Variables                      🔔 👤         │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│  COURSE     │  📚 Chapter 2: Variables & Data Types     │
│  CHAPTERS   │  Lesson 1: Variables Explained             │
│             │                                            │
│  ✅ Ch 1    │  ┌────────────────────────────────────┐   │
│  ▶ Ch 2     │  │  📹 Main Content Video             │   │
│    • Var    │  │                                    │   │
│    • Types  │  │  [▶ Play Video]                    │   │
│    • Conv   │  │  Duration: 15:30                   │   │
│  🔒 Ch 3    │  │                                    │   │
│             │  └────────────────────────────────────┘   │
│             │                                            │
│             │  ┌────────────────────────────────────┐   │
│             │  │  📝 TRANSCRIPT (Clean)             │   │
│             │  │                                    │   │
│             │  │  In Python, variables are          │   │
│             │  │  containers for storing data...    │   │
│             │  │                                    │   │
│             │  │  [Show Full Transcript]           │   │
│             │  └────────────────────────────────────┘   │
│             │                                            │
│             │  💡 KEY CONCEPTS                          │
│             │  • Variables store data                    │
│             │  • No type declaration needed             │
│             │  • Dynamic typing                         │
│             │                                            │
│             │  🎯 KEY TAKEAWAYS                         │
│             │  • Variables are fundamental              │
│             │  • Use meaningful names                   │
│             │                                            │
│  [Previous] │  🔗 RELATED CONCEPTS                      │
│  [Next]     │  → Data Types, Functions, Loops          │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🤖 AI LEARNING ENHANCEMENTS                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 🎤 Audio │  │ 🎬 Video │  │🧭 Walk   │  │🤖 AI Q&A││
│  │ Summary  │  │Explainer │  │through   │  │ Ask Me  ││
│  │          │  │          │  │          │  │         ││
│  │[Listen]  │  │[Watch]   │  │[Start]   │  │[Ask]    ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 📊 Level │  │ 🌍 Lang  │  │ 📝 Quiz  │            │
│  │Beginner▼ │  │ English▼ │  │ Test     │            │
│  │          │  │          │  │ Yourself │            │
│  │[Switch]  │  │[Change]  │  │[Start]   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└──────────────────────────────────────────────────────────┘
```

**Main Sections:**
1. **Left Sidebar:** Course navigation tree
2. **Main Content Area:**
   - Video/slides player
   - Clean transcript (US #31)
   - Concept summaries (US #33)
   - Key concepts (US #34)
   - Key takeaways (US #35)
   - Cross-references (US #8)

3. **AI Enhancement Panel:**
   - Audio Summary (US #10-13)
   - Video Explainer (US #14-18)
   - Interactive Walkthrough (US #19-21)
   - AI Q&A (US #2, #7)
   - Level Selector (US #28)
   - Language Selector (US #27)
   - Assessment (US #29)

**Navigation:**
- Previous/Next lesson buttons
- Progress auto-save
- Bookmark functionality

---

### PAGE 8: AI Learning Hub (Learner)
**Route:** `/learner/ai-hub`
**User Stories:** Learner #10-30
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] AI Learning Hub                       🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 AI-Powered Learning Enhancements                    │
│  Personalized content to accelerate your learning       │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐      │
│  │  🎤 AUDIO LEARNING                            │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                               │      │
│  │  📻 Latest Podcasts & Audio Summaries        │      │
│  │                                               │      │
│  │  ┌──────────────────────────────────────┐   │      │
│  │  │ 🔊 Python Functions Explained         │   │      │
│  │  │ 12:45 • Generated today              │   │      │
│  │  │ [▶ Play]  [Download]  [Transcript]   │   │      │
│  │  └──────────────────────────────────────┘   │      │
│  │                                               │      │
│  │  ┌──────────────────────────────────────┐   │      │
│  │  │ 🔊 Loop Concepts Recap                │   │      │
│  │  │ 08:30 • Based on your struggles      │   │      │
│  │  │ [▶ Play]  [Download]  [Transcript]   │   │      │
│  │  └──────────────────────────────────────┘   │      │
│  │                                               │      │
│  │  [View All Audio Content →]                  │      │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘      │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐      │
│  │  🎬 VIDEO EXPLAINERS                          │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                               │      │
│  │  🎥 AI-Generated Visual Explanations         │      │
│  │                                               │      │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │      │
│  │  │[▶️]  │  │[▶️]  │  │[▶️]  │  │[▶️]  │    │      │
│  │  │Data  │  │Loop │  │Func  │  │Class │    │      │
│  │  │Types │  │s    │  │tions │  │es    │    │      │
│  │  │5:20  │  │7:15 │  │10:40 │  │15:00 │    │      │
│  │  └──────┘  └──────┘  └──────┘  └──────┘    │      │
│  │                                               │      │
│  │  [View All Videos →]                         │      │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘      │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐      │
│  │  🧭 INTERACTIVE WALKTHROUGHS                  │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                               │      │
│  │  Step-by-step guided learning paths          │      │
│  │                                               │      │
│  │  • Python Setup Walkthrough          [Start] │      │
│  │  • Building Your First Program       [Start] │      │
│  │  • Debugging Techniques             [Start] │      │
│  │                                               │      │
│  │  [View All Walkthroughs →]                   │      │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘      │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐      │
│  │  🤖 PERSONALIZED REVISION ASSISTANT           │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                               │      │
│  │  💬 "What did I struggle with yesterday?"    │      │
│  │                                               │      │
│  │  Based on your recent activity:              │      │
│  │  • Python Functions (Quiz: 40% score)        │      │
│  │  • Loop Syntax Errors (Common mistakes)      │      │
│  │                                               │      │
│  │  📚 Recommended Review:                       │      │
│  │  → Function Parameters [Video 8min]          │      │
│  │  → Loop Syntax Guide [Audio 5min]            │      │
│  │  → Practice Quiz [15 questions]              │      │
│  │                                               │      │
│  │  [Start Personalized Session]                │      │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘      │
└──────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Audio Learning** (US #10-13)
   - Narrated summaries
   - Podcast library
   - Audio player with transcript

2. **Video Explainers** (US #14-18)
   - AI-generated videos
   - Micro-learning clips
   - Lesson recaps

3. **Interactive Walkthroughs** (US #19-21)
   - Step-by-step guides
   - Interactive tutorials
   - Gamified learning paths

4. **Personalized Revision Assistant** (US #22-26)
   - Struggle analysis
   - Custom recommendations
   - Adaptive content

---

### PAGE 9: Concept Search & Q&A
**Route:** `/learner/search`
**User Stories:** Learner #2, #6, #7
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Search & Ask                          🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 Search Concepts or Ask Questions                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ What is a Python function?            [Search] │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  💡 Suggested: "variables" "loops" "data types"        │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                          │
│  🤖 AI ANSWER                                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ A Python function is a reusable block of       │    │
│  │ code that performs a specific task...          │    │
│  │                                                 │    │
│  │ Key Points:                                     │    │
│  │ • Functions reduce code repetition             │    │
│  │ • Defined using 'def' keyword                  │    │
│  │ • Can take parameters and return values        │    │
│  │                                                 │    │
│  │ 🎬 Watch Video Explanation (5:30)              │    │
│  │ 🎤 Listen to Audio Summary (3:15)              │    │
│  │ 🧭 Start Interactive Tutorial                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  📚 RELATED CONTENT                                     │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Ch 3: Functions  │  │ Parameters Guide │           │
│  │ Python 101       │  │ Advanced Topics  │           │
│  │ [View Lesson]    │  │ [View Lesson]    │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                          │
│  🔗 CROSS-REFERENCES                                    │
│  • Variables (prerequisite)                             │
│  • Return statements                                    │
│  • Lambda functions (advanced)                          │
│                                                          │
│  📖 FOUND IN COURSES                                    │
│  • Python 101 - Chapter 3                              │
│  • Advanced Python - Chapter 1                          │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Smart search with autocomplete
- Natural language Q&A
- AI-powered answers
- Related content suggestions
- Cross-reference links (US #8)
- Multi-modal content (audio, video, text)
- Course context highlighting

---

### PAGE 10: Revision Assistant
**Route:** `/learner/revision`
**User Stories:** Learner #22-26
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Revision Assistant                    🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 Your Personal Learning Companion                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  💬 Ask me anything about your learning...     │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ "Explain what I struggled with yesterday"│ │    │
│  │  │                                  [Ask]   │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  Quick prompts:                                │    │
│  │  • What topics should I review?                │    │
│  │  • Create a study plan for this week          │    │
│  │  • Quiz me on my weak areas                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  📊 YOUR LEARNING INSIGHTS                              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ⚠️ AREAS NEEDING ATTENTION                    │    │
│  │                                                 │    │
│  │  1. Python Functions (40% quiz score)          │    │
│  │     Last attempted: Yesterday                   │    │
│  │     📚 Recommended actions:                     │    │
│  │     • Watch: Function Parameters [8min] 🎬     │    │
│  │     • Listen: Functions Explained [5min] 🎤    │    │
│  │     • Practice: 10 Exercises 📝                │    │
│  │     [Start Review Session]                      │    │
│  │                                                 │    │
│  │  2. Loop Syntax (Common errors detected)       │    │
│  │     Mistakes in: for loops, while loops        │    │
│  │     📚 Recommended actions:                     │    │
│  │     • Tutorial: Loop Syntax Guide 🧭           │    │
│  │     • Video: Common Loop Mistakes 🎬           │    │
│  │     • Quiz: Test Your Knowledge 📝             │    │
│  │     [Start Review Session]                      │    │
│  │                                                 │    │
│  │  3. Data Type Conversions (Beginner level)    │    │
│  │     📚 Level up content:                        │    │
│  │     • Watch: Advanced Type Casting 🎬          │    │
│  │     • Read: Type System Deep Dive 📖           │    │
│  │     [View Advanced Content]                     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📅 PERSONALIZED STUDY PLAN                     │    │
│  │                                                 │    │
│  │  Today (Feb 17, 2026)                          │    │
│  │  ☐ Review Functions (30 min) 🎬 🎤            │    │
│  │  ☐ Practice Loop Exercises (20 min)           │    │
│  │  ☐ Take Functions Quiz (15 min)               │    │
│  │                                                 │    │
│  │  This Week                                      │    │
│  │  • Master Functions & Loops                    │    │
│  │  • Complete Chapter 2 Quiz                     │    │
│  │  • Start Chapter 3: Control Flow              │    │
│  │                                                 │    │
│  │  [Customize Plan]                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🏆 COMMONLY MISUNDERSTOOD AREAS               │    │
│  │  (Across all learners in this course)          │    │
│  │                                                 │    │
│  │  1. Function Parameters vs Arguments            │    │
│  │     📊 70% of learners struggle here           │    │
│  │     [Watch Explainer 🎬]                        │    │
│  │                                                 │    │
│  │  2. Mutable vs Immutable Types                 │    │
│  │     📊 65% of learners struggle here           │    │
│  │     [Watch Explainer 🎬]                        │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Natural language chat interface
- Struggle analysis (US #23, #25)
- Personalized recommendations (US #24)
- Adaptive study plans (US #26)
- Commonly misunderstood areas (US #20, #25)
- Multi-modal revision options
- Progress tracking

---

### PAGE 11: Learning Progress & Analytics
**Route:** `/learner/progress`
**User Stories:** Learner #4, #5
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] My Progress                           🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Learning Analytics                                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OVERALL PROGRESS                                 │  │
│  │                                                   │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Courses Completed: 2 of 5                │  │  │
│  │  │  ████████░░░░░░░░░░ 40%                   │  │  │
│  │  │                                            │  │  │
│  │  │  Hours Learned: 45.5 hrs                  │  │  │
│  │  │  Certificates Earned: 2 🏆                │  │  │
│  │  │  Streak: 15 days 🔥                       │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CURRENT COURSES                                  │  │
│  │                                                   │  │
│  │  📚 Python 101                                   │  │
│  │  ████████░░ 80% • Ch 4 of 5                     │  │
│  │  Last activity: Today • 2 hrs this week         │  │
│  │  • 15 lessons completed ✓                       │  │
│  │  • 3 lessons remaining                          │  │
│  │  • Average quiz score: 85%                      │  │
│  │  [Continue Learning →]                          │  │
│  │                                                   │  │
│  │  📊 Data Science Fundamentals                    │  │
│  │  ████░░░░░░ 40% • Ch 2 of 5                     │  │
│  │  Last activity: 2 days ago • 1.5 hrs this week  │  │
│  │  • 8 lessons completed ✓                        │  │
│  │  • 12 lessons remaining                         │  │
│  │  • Average quiz score: 72%                      │  │
│  │  [Continue Learning →]                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📈 LEARNING STATS                                │  │
│  │                                                   │  │
│  │  [Week] [Month] [All Time]                       │  │
│  │                                                   │  │
│  │  This Week (Feb 10-17):                          │  │
│  │  • Learning time: 8.5 hours                      │  │
│  │  • Lessons completed: 12                         │  │
│  │  • AI content used:                              │  │
│  │    - Videos watched: 15 🎬                       │  │
│  │    - Audio listened: 8 🎤                        │  │
│  │    - Walkthroughs: 3 🧭                          │  │
│  │    - AI Q&A queries: 24 🤖                       │  │
│  │                                                   │  │
│  │  ┌──────────────────────────────────────┐       │  │
│  │  │      Learning Activity Chart          │       │  │
│  │  │  hrs                                  │       │  │
│  │  │  3 │     ▄                            │       │  │
│  │  │  2 │   ▄ █ ▄                          │       │  │
│  │  │  1 │ ▄ █ █ █ ▄ ▄ ▄                    │       │  │
│  │  │  0 ├─────────────────                 │       │  │
│  │  │    M T W T F S S                      │       │  │
│  │  └──────────────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🏆 ACHIEVEMENTS                                  │  │
│  │                                                   │  │
│  │  🥇 Python Basics Master                         │  │
│  │  🥈 7-Day Streak Achiever                        │  │
│  │  🥉 AI Explorer (Used all AI features)           │  │
│  │  🎯 Quiz Master (90%+ on 5 quizzes)              │  │
│  │                                                   │  │
│  │  [View All Achievements]                         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Sections:**
- Overall progress summary
- Course-by-course breakdown
- Learning time analytics
- Activity charts
- Quiz/assessment scores
- Achievement badges
- AI feature usage stats

---

### PAGE 12: Assessment & Quiz
**Route:** `/learner/courses/:courseId/assessments/:assessmentId`
**User Stories:** Learner #29
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Python Functions Quiz                 🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📝 Chapter 2 Assessment: Functions                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Questions: 10  •  Time: 20 minutes            │    │
│  │  Progress: [████░░░░░░] 4/10                   │    │
│  │  Time Remaining: 14:32                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                          │
│  Question 4 of 10                                       │
│                                                          │
│  What is the purpose of the 'return' statement          │
│  in a Python function?                                  │
│                                                          │
│  ○ To exit the program                                  │
│  ○ To send a value back to the caller                   │
│  ○ To print output to console                           │
│  ○ To restart the function                              │
│                                                          │
│  💡 Hint available (costs 5 points)   [Show Hint]      │
│  🤖 Need help? Ask AI                  [Ask Question]   │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                          │
│  [Previous]              [Skip]             [Next]      │
│                                                          │
│  Questions:                                             │
│  ✓ ✓ ✓ ● ○ ○ ○ ○ ○ ○                                │
└──────────────────────────────────────────────────────────┘
```

**Results Page:**
```
┌──────────────────────────────────────────────────────────┐
│  🎉 Quiz Completed!                                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  YOUR SCORE: 8/10 (80%)                        │    │
│  │  Time Taken: 15:22                             │    │
│  │  ⭐⭐⭐⭐ Great Job!                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  📊 Performance Breakdown:                              │
│  • Correct: 8 ✓                                         │
│  • Incorrect: 2 ✗                                       │
│  • Average: 75% (You're above average!)                │
│                                                          │
│  ⚠️ REVIEW NEEDED                                       │
│  Question 5: Function parameters                        │
│  Question 8: Return statements                          │
│                                                          │
│  🤖 PERSONALIZED RECOMMENDATIONS                        │
│  Based on your results:                                 │
│  • Watch: "Function Parameters Deep Dive" 🎬           │
│  • Listen: "Return Statements Explained" 🎤            │
│  • Practice: 5 exercises on parameters 📝              │
│                                                          │
│  [Start Review Session]  [Retake Quiz]  [Continue]     │
└──────────────────────────────────────────────────────────┘
```

---

## 👨‍🏫 TRAINER PAGES (17 User Stories)

---

### PAGE 13: Trainer Dashboard
**Route:** `/trainer/dashboard`
**User Stories:** Trainer #1, #2, #11
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Trainer Dashboard                     🔔 👤 Dr.Smith│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Welcome back, Dr. Smith! 👋                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📚 MY COURSES                      [+ New Course]│  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │ Python 101                               │    │  │
│  │  │ 45 students • 12 weeks • Active         │    │  │
│  │  │ Avg Progress: 65% • Completion: 40%     │    │  │
│  │  │                                          │    │  │
│  │  │ 🤖 AI Generated:                         │    │  │
│  │  │ • 15 Audio Summaries                    │    │  │
│  │  │ • 12 Video Explainers                   │    │  │
│  │  │ • 8 Interactive Walkthroughs            │    │  │
│  │  │                                          │    │  │
│  │  │ [Manage Course]  [View Analytics]       │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │ Data Science Fundamentals                │    │  │
│  │  │ 32 students • 10 weeks • Active         │    │  │
│  │  │ Avg Progress: 45% • Completion: 25%     │    │  │
│  │  │ [Manage Course]  [View Analytics]       │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📊 STUDENT INSIGHTS                              │  │
│  │                                                   │  │
│  │  ⚠️ Students Needing Attention: 8                │  │
│  │  📈 Above Average Performers: 12                 │  │
│  │  ⏰ Behind Schedule: 5                            │  │
│  │                                                   │  │
│  │  [View Detailed Analytics →]                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🤖 AI CONTENT STUDIO                             │  │
│  │                                                   │  │
│  │  Quick Actions:                                   │  │
│  │  • Generate Audio Summary                        │  │
│  │  • Create Video Explainer                        │  │
│  │  • Build Interactive Walkthrough                 │  │
│  │  • AI-Enhance Existing Content                   │  │
│  │                                                   │  │
│  │  [Open AI Studio →]                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📁 CONTENT LIBRARY                               │  │
│  │  Reuse materials from previous sessions           │  │
│  │                                                   │  │
│  │  Recent uploads: 5 • Total materials: 234        │  │
│  │  [Browse Library →]                              │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Key Sections:**
- Course overview cards
- Student progress summary
- Quick access to AI tools
- Content library access
- Recent activity feed

---

### PAGE 14: Course Management
**Route:** `/trainer/courses/:courseId`
**User Stories:** Trainer #3-10
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Python 101 - Course Management        🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📚 Python 101                               [Settings] │
│                                                          │
│  ┌───────────┬───────────┬───────────┬───────────┐     │
│  │  Content  │  Students │ Analytics │   AI Hub  │     │
│  └───────────┴───────────┴───────────┴───────────┘     │
│                                                          │
│  📖 COURSE CONTENT                       [+ Add Content]│
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ▼ Chapter 1: Getting Started                    │   │
│  │                                                  │   │
│  │   • Introduction to Python                      │   │
│  │     📹 Video, 📄 Slides, 📝 Transcript         │   │
│  │     🤖 AI: 🎤 Audio, 🎬 Video, 🧭 Guide       │   │
│  │     [Edit] [Preview] [Analytics]               │   │
│  │                                                  │   │
│  │   • Setup Environment                           │   │
│  │     📹 Video, 📄 Slides                        │   │
│  │     🤖 AI: 🎤 Audio (Generating...)            │   │
│  │     [Edit] [Preview]                           │   │
│  │                                                  │   │
│  │   + Add Lesson                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ▶ Chapter 2: Variables & Data Types (4 lessons)│   │
│  │   [Expand]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ▶ Chapter 3: Control Flow (5 lessons)          │   │
│  │   [Expand]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [+ Add Chapter]                                        │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 15: Upload & Content Creation
**Route:** `/trainer/courses/:courseId/upload`
**User Stories:** Trainer #3-8
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Upload Content                        🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📤 Add New Content to: Python 101 > Chapter 2          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  LESSON DETAILS                                 │    │
│  │                                                 │    │
│  │  Lesson Title:                                  │    │
│  │  [_______________________________________]      │    │
│  │                                                 │    │
│  │  Description:                                   │    │
│  │  [___________________________________          │    │
│  │   ___________________________________          │    │
│  │   ___________________________________ ]         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  UPLOAD MATERIALS                               │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 📹 Class Recording (Required)            │ │    │
│  │  │                                          │ │    │
│  │  │ Drag & drop video files here             │ │    │
│  │  │ or [Browse Files]                        │ │    │
│  │  │                                          │ │    │
│  │  │ Supported: MP4, MOV, AVI (max 2GB)      │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 📝 Transcript (Optional)                 │ │    │
│  │  │ [Browse TXT/PDF]                         │ │    │
│  │  │ or Auto-generate from video ✨          │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 📊 Slides/Presentation (Optional)        │ │    │
│  │  │ [Browse PDF/PPTX]                        │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 📄 Notes (Optional)                      │ │    │
│  │  │ [Browse TXT/PDF/DOCX]                    │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ ✏️ Exercises (Optional)                  │ │    │
│  │  │ [Browse or Create Exercise Set]          │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 💬 Q&A Discussions (Optional)            │ │    │
│  │  │ [Import Q&A session transcript]          │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🤖 AI ENHANCEMENT OPTIONS                      │    │
│  │                                                 │    │
│  │  Select what to auto-generate:                 │    │
│  │  ☑ Audio Summary (Narrated)                    │    │
│  │  ☑ Video Explainer (with avatars)              │    │
│  │  ☑ Interactive Walkthrough                     │    │
│  │  ☑ Clean Transcript                            │    │
│  │  ☑ Concept Summaries                           │    │
│  │  ☑ Key Takeaways                               │    │
│  │  ☑ Assessment Questions                        │    │
│  │                                                 │    │
│  │  Languages: [English ▼] [+ Add More]           │    │
│  │  Levels: ☑ Beginner  ☑ Advanced                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Cancel]                    [Save Draft]  [Upload]     │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Multi-file upload with drag-drop
- Auto-generation options for AI content
- Batch processing
- Content preview
- Version control

---

### PAGE 16: AI Content Studio (Trainer)
**Route:** `/trainer/ai-studio`
**User Stories:** Trainer #12-17
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] AI Content Studio                     🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 Transform Your Content with AI                      │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐        │
│  │  🎤 GENERATE AUDIO SUMMARY                │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │                                            │        │
│  │  Turn lessons into narrated explanations  │        │
│  │                                            │        │
│  │  Select source:                            │        │
│  │  • From video transcript                   │        │
│  │  • From lesson notes                       │        │
│  │  • From existing content                   │        │
│  │                                            │        │
│  │  Voice: [Professional ▼]                  │        │
│  │  Duration: [Short 5min / Full 15min]      │        │
│  │  Language: [English ▼]                    │        │
│  │  Style: [Conversational / Formal]         │        │
│  │                                            │        │
│  │  [Generate Audio Summary]                 │        │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘        │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐        │
│  │  🎬 CREATE VIDEO EXPLAINER                │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │                                            │        │
│  │  AI-generated video with avatars & slides │        │
│  │                                            │        │
│  │  Concept to explain:                       │        │
│  │  [_________________________________]       │        │
│  │                                            │        │
│  │  Video type:                               │        │
│  │  ○ Avatar presenter                       │        │
│  │  ○ Animated slides                        │        │
│  │  ○ Screen recording with voiceover       │        │
│  │  ○ Whiteboard animation                   │        │
│  │                                            │        │
│  │  Length: [Short / Medium / Full]          │        │
│  │  Style: [Beginner / Advanced]             │        │
│  │                                            │        │
│  │  [Generate Video]                         │        │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘        │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐        │
│  │  🧭 BUILD INTERACTIVE WALKTHROUGH         │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │                                            │        │
│  │  Create step-by-step guided tutorials     │        │
│  │                                            │        │
│  │  Topic: [_____________________________]   │        │
│  │  Steps: [5 / 10 / 15 / Custom]            │        │
│  │  Includes: ☑ Code samples                 │        │
│  │            ☑ Interactive exercises        │        │
│  │            ☑ Hints & tips                 │        │
│  │                                            │        │
│  │  [Generate Walkthrough]                   │        │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘        │
│                                                          │
│  ┌────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐        │
│  │  ✨ ENHANCE EXISTING CONTENT              │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │                                            │        │
│  │  Convert transcripts to instructor-style  │        │
│  │                                            │        │
│  │  Select content: [Browse...]              │        │
│  │  Enhancement:                              │        │
│  │  ☑ Generate summaries                     │        │
│  │  ☑ Extract key concepts                   │        │
│  │  ☑ Create assessments                     │        │
│  │  ☑ Multi-language versions                │        │
│  │                                            │        │
│  │  [Enhance Content]                        │        │
│  └────━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📊 GENERATION HISTORY                          │    │
│  │                                                 │    │
│  │  Recent:                                        │    │
│  │  • Audio: Python Functions [5min] - Today      │    │
│  │  • Video: Loops Explained [7min] - Today       │    │
│  │  • Guide: Setup Walkthrough - Yesterday        │    │
│  │                                                 │    │
│  │  [View All Generated Content →]                │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Multiple AI generation tools
- Customization options
- Batch processing
- Preview before publishing
- Generation history
- Quality controls

---

### PAGE 17: Student Analytics (Trainer)
**Route:** `/trainer/courses/:courseId/analytics`
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Student Analytics - Python 101        🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Student Performance Insights                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  CLASS OVERVIEW                                 │    │
│  │                                                 │    │
│  │  Total Students: 45                            │    │
│  │  Average Progress: 65%                         │    │
│  │  Average Score: 78%                            │    │
│  │  Completion Rate: 40%                          │    │
│  │  Active This Week: 38 (84%)                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ⚠️ STUDENTS NEEDING ATTENTION (8)             │    │
│  │                                                 │    │
│  │  • John Doe - 30% progress (Behind schedule)   │    │
│  │    Last active: 5 days ago                     │    │
│  │    [Contact Student] [View Profile]            │    │
│  │                                                 │    │
│  │  • Jane Smith - Multiple failed assessments    │    │
│  │    Struggling with: Functions, Loops           │    │
│  │    [Send Resources] [Schedule Check-in]        │    │
│  │                                                 │    │
│  │  [View All At-Risk Students →]                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🏆 TOP PERFORMERS (12)                         │    │
│  │                                                 │    │
│  │  • Alice Johnson - 95% progress, 92% avg score │    │
│  │  • Bob Wilson - 90% progress, 88% avg score    │    │
│  │  • Carol Brown - 85% progress, 91% avg score   │    │
│  │                                                 │    │
│  │  [View All Top Performers →]                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📉 COMMONLY MISUNDERSTOOD TOPICS              │    │
│  │                                                 │    │
│  │  1. Function Parameters (70% struggle rate)    │    │
│  │     • 32 students struggled                    │    │
│  │     • Avg quiz score: 45%                      │    │
│  │     [Generate Extra Content] [Send Review]     │    │
│  │                                                 │    │
│  │  2. Loop Syntax (65% struggle rate)            │    │
│  │     • 29 students struggled                    │    │
│  │     • Common errors: syntax, infinite loops    │    │
│  │     [Generate Extra Content] [Send Review]     │    │
│  │                                                 │    │
│  │  3. Type Conversion (55% struggle rate)        │    │
│  │     [Generate Extra Content] [Send Review]     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🤖 AI CONTENT ENGAGEMENT                       │    │
│  │                                                 │    │
│  │  • Videos watched: 450 times (avg 10/student)  │    │
│  │  • Audio summaries: 280 listens                │    │
│  │  • Walkthroughs completed: 120                 │    │
│  │  • AI Q&A queries: 890                         │    │
│  │                                                 │    │
│  │  Most popular:                                  │    │
│  │  🥇 "Functions Explained" video (42 views)     │    │
│  │  🥈 "Loops Audio Summary" (38 listens)         │    │
│  │  🥉 "Setup Walkthrough" (35 completions)       │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 18: Content Library (Trainer)
**Route:** `/trainer/library`
**User Stories:** Trainer #1, #2
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Content Library                       🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📚 My Content Library                                  │
│  Reuse and enhance materials from previous sessions     │
│                                                          │
│  [Search library...]                      [Filters ▼]   │
│                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┬────────┐   │
│  │   All   │ Videos  │  Audio  │  Docs   │  AI    │   │
│  └─────────┴─────────┴─────────┴─────────┴────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📹 Introduction to Python - Lecture Recording │    │
│  │  45:30 • Used in Python 101 (2025)            │    │
│  │  📊 View count: 145 • Avg rating: 4.5/5       │    │
│  │                                                 │    │
│  │  Associated AI content:                        │    │
│  │  🎤 Audio summary (12min)                     │    │
│  │  🎬 3 Video explainers                        │    │
│  │  🧭 Interactive walkthrough                   │    │
│  │                                                 │    │
│  │  [Reuse] [Edit] [Enhance with AI] [Preview]   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📄 Python Fundamentals - Lecture Notes       │    │
│  │  12 pages • Last used: Nov 2025               │    │
│  │  Tags: programming, basics, syntax            │    │
│  │                                                 │    │
│  │  [Reuse] [Edit] [Generate Audio] [Generate Video]│  │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎬 Functions Explained - AI Video Explainer   │    │
│  │  8:45 • Generated: Jan 2026                    │    │
│  │  📊 Student views: 67 • Feedback: 92% helpful │    │
│  │                                                 │    │
│  │  [Reuse] [Regenerate] [Edit] [Copy to Course] │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Load More...]                                         │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 LEADERSHIP PAGES (7 User Stories)

---

### PAGE 19: Leadership Dashboard
**Route:** `/leadership/dashboard`
**User Stories:** Leadership #1, #2
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Leadership Dashboard                  🔔 👤 Director│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🎓 Program Overview                                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  KEY METRICS                        Feb 2026     │  │
│  │                                                   │  │
│  │  Total Students: 450                             │  │
│  │  Active Courses: 12                              │  │
│  │  Completion Rate: 68% ▲ 5%                       │  │
│  │  Avg Student Progress: 72%                       │  │
│  │  Student Satisfaction: 4.6/5 ⭐                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📊 PROGRAM EFFECTIVENESS                         │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────┐        │  │
│  │  │  Completion Rates by Course         │        │  │
│  │  │                                      │        │  │
│  │  │  Python 101       ████████░ 85%     │        │  │
│  │  │  Data Science     ███████░░ 70%     │        │  │
│  │  │  Machine Learning █████████ 92%     │        │  │
│  │  │  Web Development  ███████░░ 75%     │        │  │
│  │  └─────────────────────────────────────┘        │  │
│  │                                                   │  │
│  │  🏆 Best Performing: Machine Learning            │  │
│  │  ⚠️ Needs Attention: Data Science                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  👥 STUDENT READINESS                             │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │  Advanced  │  │ On Track   │  │ At Risk   │ │  │
│  │  │    120     │  │    280     │  │    50     │ │  │
│  │  │   27%      │  │   62%      │  │   11%     │ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  │                                                   │  │
│  │  [View Detailed Readiness Report →]              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🤖 AI ENHANCEMENT IMPACT                         │  │
│  │                                                   │  │
│  │  Students using AI features: 98%                 │  │
│  │                                                   │  │
│  │  • Video Explainers: 15,450 views               │  │
│  │  • Audio Summaries: 8,920 listens               │  │
│  │  • Interactive Guides: 3,200 completions        │  │
│  │  • AI Q&A: 45,600 queries                       │  │
│  │                                                   │  │
│  │  Impact on outcomes:                             │  │
│  │  • 23% faster completion time                   │  │
│  │  • 15% higher quiz scores                       │  │
│  │  • 89% student satisfaction with AI features   │  │
│  │                                                   │  │
│  │  [View AI Analytics →]                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ⚠️ AREAS REQUIRING ATTENTION                     │  │
│  │                                                   │  │
│  │  • 50 students at risk of not completing         │  │
│  │  • Data Science course below target              │  │
│  │  • Function parameters: High struggle rate       │  │
│  │                                                   │  │
│  │  [View Action Items →]                           │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 20: Student Progress Tracking (Leadership)
**Route:** `/leadership/students`
**User Stories:** Leadership #4
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Student Progress                      🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👥 Student Progress Tracking                           │
│                                                          │
│  [Search students...]                     [Export CSV]  │
│                                                          │
│  Filters: [All Courses ▼] [All Status ▼] [Date Range ▼]│
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Name          │ Course        │ Progress │Status│    │
│  ├───────────────┼───────────────┼──────────┼──────┤    │
│  │ John Doe      │ Python 101    │ ████░ 80%│ ✓    │    │
│  │               │ Data Science  │ ███░░ 60%│ →    │    │
│  │               │ Enrolled: 2   │ Completed: 0     │    │
│  │               │ [View Details]                   │    │
│  ├───────────────┼───────────────┼──────────┼──────┤    │
│  │ Jane Smith    │ Python 101    │ ██░░░ 40%│ ⚠️   │    │
│  │               │ Last active: 5 days ago          │    │
│  │               │ Behind schedule by 2 weeks       │    │
│  │               │ [View Details] [Intervene]       │    │
│  ├───────────────┼───────────────┼──────────┼──────┤    │
│  │ Alice Johnson │ Machine Lrn   │ █████ 95%│ 🏆   │    │
│  │               │ Avg score: 92%│ Top performer    │    │
│  │               │ [View Details] [Recognize]       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Showing 1-25 of 450 students                [Next →]   │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 21: Curriculum Insights
**Route:** `/leadership/curriculum`
**User Stories:** Leadership #3
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Curriculum Insights                   🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📚 Curriculum Analysis & Improvement                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🔍 COMMONLY MISUNDERSTOOD AREAS                │    │
│  │  (Across all courses)                           │    │
│  │                                                 │    │
│  │  1. Python Function Parameters                  │    │
│  │     Course: Python 101                          │    │
│  │     Struggle Rate: 70% (315 students)           │    │
│  │     Avg Quiz Score: 45%                         │    │
│  │     Time to Master: 8.5 hours (above avg)      │    │
│  │                                                 │    │
│  │     📊 Analysis:                                │    │
│  │     • Most common error: parameter vs argument  │    │
│  │     • Students struggle with default values     │    │
│  │     • Confusion with *args and **kwargs        │    │
│  │                                                 │    │
│  │     💡 Recommendations:                         │    │
│  │     • Add more visual examples                  │    │
│  │     • Create additional practice exercises      │    │
│  │     • Generate more AI explainer videos         │    │
│  │                                                 │    │
│  │     [View Detailed Analysis] [Schedule Review]  │    │
│  │                                                 │    │
│  │  2. Data Type Conversions                       │    │
│  │     Struggle Rate: 65% (293 students)           │    │
│  │     [Expand]                                    │    │
│  │                                                 │    │
│  │  3. Object-Oriented Programming                 │    │
│  │     Struggle Rate: 58% (261 students)           │    │
│  │     [Expand]                                    │    │
│  │                                                 │    │
│  │  [View All Problem Areas →]                     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📈 CONTENT EFFECTIVENESS                       │    │
│  │                                                 │    │
│  │  Most Effective Content:                       │    │
│  │  🥇 "Functions with Avatars" video             │    │
│  │     92% students found helpful                  │    │
│  │     Avg score improvement: +25%                 │    │
│  │                                                 │    │
│  │  🥈 "Loops Interactive Walkthrough"            │    │
│  │     89% completion rate                         │    │
│  │     Avg score improvement: +20%                 │    │
│  │                                                 │    │
│  │  Least Effective:                              │    │
│  │  ⚠️ "OOP Basics" traditional lecture           │    │
│  │     45% students re-watched                     │    │
│  │     Recommendation: Convert to AI explainer     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎯 LEARNING PATH OPTIMIZATION                  │    │
│  │                                                 │    │
│  │  Prerequisite Issues Detected:                 │    │
│  │  • 35% students start Ch3 without mastering Ch2│    │
│  │  • Recommended: Add checkpoint quiz            │    │
│  │                                                 │    │
│  │  Pacing Issues:                                │    │
│  │  • Ch2 takes 2x expected time                  │    │
│  │  • Recommended: Split into 2 chapters          │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 22: Reports & Analytics (Leadership)
**Route:** `/leadership/reports`
**User Stories:** Leadership #5, #6, #7
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Reports & Analytics                   🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Program Reports                                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  GENERATE REPORT                                │    │
│  │                                                 │    │
│  │  Report Type:                                   │    │
│  │  ○ Student Progress Report                     │    │
│  │  ○ Course Performance Report                   │    │
│  │  ○ AI Enhancement Impact Report                │    │
│  │  ○ Curriculum Effectiveness Report             │    │
│  │  ○ Custom Report                               │    │
│  │                                                 │    │
│  │  Date Range: [Last Month ▼]                    │    │
│  │  Courses: [All Courses ▼]                      │    │
│  │  Format: [PDF ▼] [Excel ▼] [PowerPoint ▼]     │    │
│  │                                                 │    │
│  │  [Generate Report]                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📥 RECENT REPORTS                              │    │
│  │                                                 │    │
│  │  • Monthly Progress Report - Feb 2026.pdf      │    │
│  │    Generated: Today                            │    │
│  │    [Download] [Share] [Schedule]               │    │
│  │                                                 │    │
│  │  • Q1 2026 Performance Summary.xlsx            │    │
│  │    Generated: Jan 31, 2026                     │    │
│  │    [Download] [Share]                          │    │
│  │                                                 │    │
│  │  • AI Impact Analysis.pdf                      │    │
│  │    Generated: Jan 15, 2026                     │    │
│  │    [Download] [Share]                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📅 SCHEDULED REPORTS                           │    │
│  │                                                 │    │
│  │  • Weekly Progress Summary (Every Monday)      │    │
│  │  • Monthly Performance Report (1st of month)   │    │
│  │  • Quarterly Review (End of quarter)           │    │
│  │                                                 │    │
│  │  [Manage Schedule]                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎯 KEY INSIGHTS (This Month)                   │    │
│  │                                                 │    │
│  │  ✓ Student engagement up 12%                   │    │
│  │  ✓ AI video views increased 45%                │    │
│  │  ⚠️ 3 courses below completion target           │    │
│  │  ⚠️ 50 students at risk                         │    │
│  │  💡 "Functions" topic needs curriculum review   │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🏢 LTC ADMIN PAGES (12 User Stories)

---

### PAGE 23: System Dashboard (LTC Admin)
**Route:** `/admin/dashboard`
**User Stories:** LTC #1, #5, #6
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] System Administration                 🔔 👤 Admin   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🏢 LTC Platform Administration                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PLATFORM OVERVIEW                                │  │
│  │                                                   │  │
│  │  Total Users: 500 (450 learners, 35 trainers,    │  │
│  │                    10 leadership, 5 admins)       │  │
│  │  Active Courses: 12                              │  │
│  │  Total Content: 2,340 items                      │  │
│  │  Storage Used: 1.2 TB / 5 TB                     │  │
│  │  System Health: ✓ All systems operational        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🤖 AI PROCESSING PIPELINE                        │  │
│  │                                                   │  │
│  │  Queue Status:                                    │  │
│  │  • Pending: 15 items                             │  │
│  │  • Processing: 3 items                           │  │
│  │  • Completed Today: 47 items                     │  │
│  │  • Failed: 2 items (requires attention)          │  │
│  │                                                   │  │
│  │  Current Processing:                              │  │
│  │  🎬 Video: "Advanced Python" (45% complete)      │  │
│  │  🎤 Audio: "Data Structures" (80% complete)      │  │
│  │  🧭 Guide: "ML Setup" (30% complete)             │  │
│  │                                                   │  │
│  │  [View Full Pipeline] [Retry Failed]             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📊 KNOWLEDGE BASE STATUS                         │  │
│  │                                                   │  │
│  │  Total Items: 2,340                              │  │
│  │  • Recordings: 450                               │  │
│  │  • Transcripts: 450                              │  │
│  │  • Slides: 380                                   │  │
│  │  • Notes: 340                                    │  │
│  │  • Exercises: 420                                │  │
│  │  • Q&As: 300                                     │  │
│  │                                                   │  │
│  │  AI Generated:                                    │  │
│  │  • Audio Summaries: 380                          │  │
│  │  • Video Explainers: 320                         │  │
│  │  • Walkthroughs: 150                             │  │
│  │                                                   │  │
│  │  [Browse Knowledge Base →]                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ⚡ QUICK ACTIONS                                 │  │
│  │                                                   │  │
│  │  • User Management                               │  │
│  │  • Course Administration                         │  │
│  │  • System Settings                               │  │
│  │  • Bulk Content Upload                           │  │
│  │  • AI Configuration                              │  │
│  │  • Reports & Analytics                           │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 24: User Management (Admin)
**Route:** `/admin/users`
**User Stories:** LTC #6
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] User Management                       🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👥 User Management                       [+ Add User]  │
│                                                          │
│  [Search users...]                                      │
│                                                          │
│  Filters: [All Roles ▼] [All Status ▼] [Bulk Actions ▼]│
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ ☐ │ Name          │ Email        │ Role    │Status│  │
│  ├───┼───────────────┼──────────────┼─────────┼──────┤  │
│  │ ☐ │ John Doe      │ john@lms.com │ Learner │Active│  │
│  │   │ Joined: Jan 2025 │ Last login: Today          │  │
│  │   │ [Edit] [Disable] [Reset Password]             │  │
│  ├───┼───────────────┼──────────────┼─────────┼──────┤  │
│  │ ☐ │ Dr. Smith     │ smith@lms.com│ Trainer │Active│  │
│  │   │ Courses: 3 │ Students: 145                    │  │
│  │   │ [Edit] [View Courses] [Message]               │  │
│  ├───┼───────────────┼──────────────┼─────────┼──────┤  │
│  │ ☐ │ Jane Director │ jane@lms.com │Leadership│Active│ │
│  │   │ Access Level: Full Reports                    │  │
│  │   │ [Edit] [Permissions]                          │  │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Selected: 0        [Delete] [Bulk Edit] [Export CSV]  │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 25: Knowledge Base Management
**Route:** `/admin/knowledge-base`
**User Stories:** LTC #2, #3, #4, #7, #8
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Knowledge Base                        🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📚 Organization Knowledge Repository                   │
│                                                          │
│  [Search knowledge base...]               [Bulk Upload] │
│                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┬────────┐   │
│  │   All   │Recordings│Transcripts│ Slides│  AI   │   │
│  └─────────┴─────────┴─────────┴─────────┴────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  📹 Python Fundamentals - Cohort 2025          │    │
│  │  Recording: 45:30 • Uploaded: Jan 2025         │    │
│  │  Course: Python 101 • Chapter 2                │    │
│  │  Used by: 145 students                         │    │
│  │                                                 │    │
│  │  Associated Content:                            │    │
│  │  ✓ Transcript (cleaned)                        │    │
│  │  ✓ Slides (12 pages)                           │    │
│  │  ✓ Lecture notes                               │    │
│  │  ✓ Q&A session                                 │    │
│  │                                                 │    │
│  │  AI Generated:                                  │    │
│  │  ✓ Audio summary (12min)                       │    │
│  │  ✓ 3 Video explainers                          │    │
│  │  ✓ Interactive walkthrough                     │    │
│  │  ✓ 15 Assessment questions                     │    │
│  │                                                 │    │
│  │  Tags: python, functions, programming          │    │
│  │  [Edit] [Reprocess] [Generate More] [Delete]   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎤 Data Science Intro - Audio Summary         │    │
│  │  Duration: 8:30 • Generated: Feb 2026          │    │
│  │  Listens: 234 • Rating: 4.8/5                  │    │
│  │  [Edit] [Regenerate] [Delete]                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Showing 1-25 of 2,340 items             [Next →]      │
└──────────────────────────────────────────────────────────┘
```

---

### PAGE 26: AI Configuration (Admin)
**Route:** `/admin/ai-config`
**User Stories:** LTC #9-12
**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] AI Configuration                      🔔 👤         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 AI Services Configuration                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎤 AUDIO GENERATION SERVICE                    │    │
│  │                                                 │    │
│  │  Status: ✓ Active                              │    │
│  │  Provider: [Azure Neural TTS ▼]               │    │
│  │  Voice: [Professional ▼]                       │    │
│  │  Language Support: 50 languages                │    │
│  │  Quality: [High ▼]                             │    │
│  │  Auto-generate: ☑ Enabled                      │    │
│  │                                                 │    │
│  │  Settings:                                      │    │
│  │  • Default duration: [10 minutes]              │    │
│  │  • Speech rate: [Normal]                       │    │
│  │  • Background music: ☐ Enabled                 │    │
│  │                                                 │    │
│  │  [Test Service] [Save Settings]                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🎬 VIDEO GENERATION SERVICE                    │    │
│  │                                                 │    │
│  │  Status: ✓ Active                              │    │
│  │  Provider: [Synthesia AI ▼]                    │    │
│  │  Avatar: [Professional Presenter ▼]            │    │
│  │  Quality: [1080p ▼]                            │    │
│  │  Auto-generate: ☑ Enabled                      │    │
│  │                                                 │    │
│  │  Settings:                                      │    │
│  │  • Style: [Educational]                        │    │
│  │  • Max duration: [15 minutes]                  │    │
│  │  • Include subtitles: ☑ Yes                    │    │
│  │  • Brand logo: ☑ Include                       │    │
│  │                                                 │    │
│  │  [Test Service] [Save Settings]                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🧭 INTERACTIVE WALKTHROUGH SERVICE             │    │
│  │                                                 │    │
│  │  Status: ✓ Active                              │    │
│  │  Template: [Step-by-step Tutorial ▼]           │    │
│  │  Interactivity: [High ▼]                       │    │
│  │  Auto-generate: ☑ Enabled                      │    │
│  │                                                 │    │
│  │  [Test Service] [Save Settings]                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🤖 PERSONALIZATION ENGINE                      │    │
│  │                                                 │    │
│  │  Status: ✓ Active                              │    │
│  │  ML Model: [v2.5 - Production]                 │    │
│  │  Recommendation Accuracy: 87%                   │    │
│  │                                                 │    │
│  │  Features:                                      │    │
│  │  ☑ Struggle detection                          │    │
│  │  ☑ Adaptive content recommendations            │    │
│  │  ☑ Learning path optimization                  │    │
│  │  ☑ Personalized study plans                    │    │
│  │                                                 │    │
│  │  [Retrain Model] [View Performance]            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ⚙️ PROCESSING SETTINGS                         │    │
│  │                                                 │    │
│  │  Concurrent Jobs: [5]                          │    │
│  │  Priority Queue: ☑ Enabled                     │    │
│  │  Retry Failed: ☑ Auto-retry 3 times           │    │
│  │  Notifications: ☑ Email on completion          │    │
│  │                                                 │    │
│  │  [Save Settings]                               │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Navigation Patterns

### Role-Based Navigation

#### Learner Navigation:
```
Home → Dashboard
├── Courses
│   ├── Course Catalog
│   ├── My Courses
│   └── Course Content
│       ├── Lessons
│       ├── Assessments
│       └── Resources
├── AI Learning Hub
│   ├── Audio Library
│   ├── Video Explainers
│   ├── Walkthroughs
│   └── Revision Assistant
├── Search & Q&A
├── My Progress
└── Settings
```

#### Trainer Navigation:
```
Home → Dashboard
├── My Courses
│   ├── Course Management
│   ├── Content Upload
│   └── Student Analytics
├── AI Studio
│   ├── Generate Audio
│   ├── Generate Video
│   ├── Create Walkthrough
│   └── Enhance Content
├── Content Library
├── Student Progress
└── Settings
```

#### Leadership Navigation:
```
Home → Dashboard
├── Program Overview
├── Student Analytics
│   ├── Progress Tracking
│   ├── Readiness Assessment
│   └── Performance Metrics
├── Curriculum Insights
│   ├── Problem Areas
│   └── Content Effectiveness
├── Reports
│   ├── Generate Reports
│   └── Scheduled Reports
└── Settings
```

#### Admin Navigation:
```
Home → System Dashboard
├── User Management
├── Course Administration
├── Knowledge Base
│   ├── Content Repository
│   └── Bulk Upload
├── AI Configuration
│   ├── Service Settings
│   └── Processing Pipeline
├── System Settings
└── Platform Analytics
```

---

## Responsive Design Guidelines

### Breakpoints:
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** 1440px+

### Mobile Adaptations:
1. **Collapsible Sidebar:** Hamburger menu
2. **Stacked Cards:** Vertical layout for content cards
3. **Touch-Optimized:** Larger tap targets (min 44x44px)
4. **Bottom Navigation:** Key actions in bottom bar
5. **Simplified Tables:** Card view for data tables

### Tablet Adaptations:
1. **Hybrid Layout:** Sidebar + main content
2. **Multi-column:** 2-column layouts where appropriate
3. **Touch-Friendly:** Large buttons and controls

---

## Accessibility Features

### WCAG 2.1 AA Compliance:
1. **Keyboard Navigation:** Full keyboard accessibility
2. **Screen Reader Support:** ARIA labels and roles
3. **Color Contrast:** Minimum 4.5:1 ratio
4. **Focus Indicators:** Clear visual focus states
5. **Alt Text:** All images and icons
6. **Captions:** Video and audio transcripts
7. **Responsive Text:** Scalable up to 200%

---

## Design System

### Color Palette:
```
Primary: #2563EB (Blue)
Secondary: #10B981 (Green)
Accent: #F59E0B (Amber)
Success: #059669
Warning: #DC2626
Info: #3B82F6

Neutrals:
- Dark: #1F2937
- Medium: #6B7280
- Light: #F3F4F6
- White: #FFFFFF
```

### Typography:
```
Headings: Inter/Poppins (Bold)
Body: Inter/Roboto (Regular)
Code: Fira Code (Monospace)

Sizes:
- H1: 32px
- H2: 24px
- H3: 20px
- Body: 16px
- Small: 14px
```

### Spacing:
```
Base unit: 8px
Increments: 8, 16, 24, 32, 48, 64px
```

### Icons:
- Use Heroicons, FontAwesome, or Material Icons
- Consistent size: 20px, 24px
- AI feature badges always visible

---

## Implementation Priority

### Phase 1 (MVP):
1. Authentication pages
2. Learner Dashboard & Course View
3. Basic Lesson Content Page
4. Trainer Upload Interface
5. One AI feature (Audio Summary)

### Phase 2:
6. AI Learning Hub
7. Revision Assistant
8. Search & Q&A
9. Progress Tracking
10. Trainer AI Studio

### Phase 3:
11. Leadership Dashboard
12. Analytics & Reports
13. Admin Portal
14. All AI features (Video, Walkthrough)
15. Advanced personalization

---

## User Flow Examples

### Complete Learner Journey:
```
Login → Dashboard → Browse Courses → Select Course → 
View Lesson → Watch Video → Read Transcript → 
Use AI Explainer → Take Quiz → AI Revision → 
Check Progress → Logout
```

### Complete Trainer Journey:
```
Login → Dashboard → Select Course → Upload Recording →
Upload Materials → Configure AI Generation → 
Review Generated Content → Publish → 
View Student Analytics → Monitor Engagement → Logout
```

---

This comprehensive UI/UX design covers all 71 user stories across all 4 roles with proper flows, page structures, and navigation patterns. Each page is mapped to specific user stories and includes detailed layout descriptions.
