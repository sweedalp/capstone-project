# Trainer Navigation Flow
## Complete Click-by-Click Journey: Dashboard → Logout

---

## Overview: Trainer Pages & Navigation

```
LOGIN (Page 1)
    ↓
TRAINER DASHBOARD (Page 13) ←─────────────┐ [Home/Logo click from anywhere]
    ↓                                      │
[Multiple paths available]                 │
    ↓                                      │
[Various pages]                            │
    ↓                                      │
LOGOUT ─────────────────────────────────────┘
```

---

## 🏠 PAGE 13: Trainer Dashboard (Entry Point)
**Route:** `/trainer/dashboard`

### Clickable Elements → Destinations:

#### 1️⃣ **My Courses Section**
```
┌─────────────────────────────────────────┐
│ Python 101                               │
│ 45 students • 12 weeks • Active         │
│ [Manage Course] [View Analytics] ←─────┐│
└─────────────────────────────────────────┘│
                    │              │       │
                    ↓              ↓       │
              Page 14          Page 17    │
         (Course Mgmt)    (Analytics)     │
                                           │
       Clicks [Manage Course] ─────────────┘
                ↓
    Goes to: COURSE MANAGEMENT (Page 14)
```

**Navigation from Course Cards:**

**Click "[Manage Course]":**
- **→ Course Management (Page 14)** for that specific course
- Shows content organization, chapters, lessons

**Click "[View Analytics]":**
- **→ Student Analytics (Page 17)** for that course
- Shows student performance data

**Click course title "Python 101":**
- **→ Course Management (Page 14)** (same as Manage Course)

**Click progress/stats numbers:**
- **→ Student Analytics (Page 17)** with relevant filter

**Click "🤖 AI Generated" section:**
- **→ AI Content Studio (Page 16)** filtered for this course
- Shows generated content for review

#### 2️⃣ **Top Action: Create New Course**
```
┌──────────────────────────────────────┐
│ 📚 MY COURSES         [+ New Course]│
└──────────────────────────────────────┘
                              │
       Clicks [+ New Course] ─┘
                ↓
    Opens: Course Creation Wizard
    Then goes to: COURSE MANAGEMENT (Page 14) with new course
```

**Navigation:**
- **Click "[+ New Course]"** → Course creation modal/wizard
  - After creation → Course Management (Page 14) for new course

#### 3️⃣ **Student Insights Section**
```
┌──────────────────────────────────────┐
│ 📊 STUDENT INSIGHTS                  │
│ ⚠️ Students Needing Attention: 8    │
│ [View Detailed Analytics →] ←──────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: STUDENT ANALYTICS (Page 17)
```

**Navigation:**
- **Click "[View Detailed Analytics →]"** → Student Analytics (Page 17)
- **Click individual stat** → Student Analytics (Page 17) with that filter
- **Click "Students Needing Attention"** → Student Analytics (Page 17) showing at-risk students

#### 4️⃣ **AI Content Studio Section**
```
┌──────────────────────────────────────┐
│ 🤖 AI CONTENT STUDIO                 │
│ • Generate Audio Summary             │
│ • Create Video Explainer             │
│ • Build Interactive Walkthrough      │
│ [Open AI Studio →] ←───────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
```

**Navigation:**
- **Click "[Open AI Studio →]"** → AI Content Studio (Page 16)
- **Click any quick action** → AI Content Studio (Page 16) with that tool pre-selected
- **Click "Generate Audio Summary"** → AI Studio (Page 16) with Audio Generator open
- **Click "Create Video Explainer"** → AI Studio (Page 16) with Video Generator open

#### 5️⃣ **Content Library Section**
```
┌──────────────────────────────────────┐
│ 📁 CONTENT LIBRARY                   │
│ Recent uploads: 5 • Total: 234       │
│ [Browse Library →] ←───────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: CONTENT LIBRARY (Page 18)
```

**Navigation:**
- **Click "[Browse Library →]"** → Content Library (Page 18)
- **Click "Recent uploads"** → Content Library (Page 18) with recent filter

#### 6️⃣ **Global Navigation (Always Available)**
- **Click logo** → Trainer Dashboard (Page 13)
- **Click "Dashboard" in sidebar** → Trainer Dashboard (Page 13)
- **Click "My Courses" in sidebar** → Dashboard (Page 13) courses section
- **Click "AI Studio" in sidebar** → AI Content Studio (Page 16)
- **Click "Content Library" in sidebar** → Content Library (Page 18)
- **Click search bar** → Search interface (stays on current page or goes to search)
- **Click notifications 🔔** → Notifications panel
- **Click profile 👤** → Profile dropdown menu

---

## 📚 PAGE 14: Course Management
**Route:** `/trainer/courses/:courseId`
**How you got here:** Clicked "[Manage Course]" from Dashboard OR "My Courses" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **Top Tabs Navigation**
```
┌───────────┬───────────┬───────────┬───────────┐
│  Content  │  Students │ Analytics │   AI Hub  │
└───────────┴───────────┴───────────┴───────────┘
     │            │            │            │
     ↓            ↓            ↓            ↓
  Page 14      Page 14      Page 17      Page 16
(this tab)   (tab view)  (Analytics) (AI Studio)
```

**Navigation:**
- **Click "Content" tab** → Stays on Page 14, shows content organization
- **Click "Students" tab** → Stays on Page 14, shows enrolled students list
- **Click "Analytics" tab** → Student Analytics (Page 17) for this course
- **Click "AI Hub" tab** → Stays on Page 14, shows AI content OR goes to AI Studio (Page 16)

#### 2️⃣ **Add Content Actions**
```
┌──────────────────────────────────────┐
│ 📖 COURSE CONTENT    [+ Add Content]│
└──────────────────────────────────────┘
                              │
       Clicks [+ Add Content] ─┘
                ↓
    Goes to: UPLOAD CONTENT (Page 15)
```

**Navigation:**
- **Click "[+ Add Content]"** → Upload Content (Page 15)
- **Click "[+ Add Chapter]"** → Chapter creation modal (stays on Page 14)
  - After creating chapter → Stays on Page 14 with new chapter added

#### 3️⃣ **Lesson Management - Individual Lesson Actions**
```
┌─────────────────────────────────────────┐
│ • Introduction to Python                │
│   📹 Video, 📄 Slides, 📝 Transcript   │
│   [Edit] [Preview] [Analytics] ←──────┐│
└─────────────────────────────────────────┘│
         │       │           │             │
         ↓       ↓           ↓             │
      Page 15  Modal     Page 17          │
     (Upload) (Preview) (Analytics)       │
                                           │
       Clicks [Edit] ──────────────────────┘
                ↓
    Goes to: UPLOAD CONTENT (Page 15) in edit mode
```

**Navigation from Lesson Items:**

**Click "[Edit]":**
- **→ Upload Content (Page 15)** in edit mode for that lesson
- Pre-filled with existing content

**Click "[Preview]":**
- Opens preview modal (stays on Page 14)
- Shows student view of lesson
- Can click "View as Student" → Opens in new tab or modal

**Click "[Analytics]":**
- **→ Student Analytics (Page 17)** filtered for this lesson
- Shows performance on this specific lesson

**Click lesson title:**
- Toggles expand/collapse (stays on Page 14)

**Click "AI: 🎤 Audio, 🎬 Video, 🧭 Guide":**
- **→ AI Content Studio (Page 16)** showing generated content for this lesson
- Can review, edit, or regenerate

#### 4️⃣ **AI Generation Status**
```
│   • Setup Environment                   │
│     📹 Video, 📄 Slides                │
│     🤖 AI: 🎤 Audio (Generating...) ←─┐│
└─────────────────────────────────────────┘│
                                            │
       Clicks "Generating..." ──────────────┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
    Shows generation progress and queue
```

**Navigation:**
- **Click AI generation status** → AI Content Studio (Page 16) with generation details
- **Click "Generating..."** → AI Studio (Page 16) showing progress
- **Click completed AI badge** → Preview modal OR AI Studio (Page 16)

#### 5️⃣ **Chapter Management**
```
┌─────────────────────────────────────────┐
│ ▶ Chapter 2: Variables (4 lessons) ←──┐│
│   [Expand] [Edit] [Reorder] [Delete]  ││
└─────────────────────────────────────────┘│
                                            │
       Clicks [Edit] ───────────────────────┘
                ↓
    Opens: Chapter editor modal (stays on Page 14)
```

**Navigation:**
- **Click "[Expand]"** → Expands to show lessons (stays on Page 14)
- **Click "[Edit]"** → Chapter settings modal (stays on Page 14)
- **Click "[Reorder]"** → Reorder mode (stays on Page 14)
- **Click "[Delete]"** → Confirmation modal (stays on Page 14)

#### 6️⃣ **"+ Add Lesson" within Chapter**
```
│   + Add Lesson ←────────────────┐
                                   │
       Clicks link ────────────────┘
                ↓
    Goes to: UPLOAD CONTENT (Page 15)
    With chapter pre-selected
```

**Navigation:**
- **Click "+ Add Lesson"** → Upload Content (Page 15) with chapter context

#### 7️⃣ **Students Tab Actions** (when on Students tab)
```
When viewing Students tab on Page 14:
│ Alice Johnson - 95% progress [View Profile]│
                                      │
       Clicks [View Profile] ─────────┘
                ↓
    Goes to: Student profile view
    OR STUDENT ANALYTICS (Page 17) for this student
```

**Navigation:**
- **Click student name** → Student profile detail (modal or Page 17)
- **Click "[View Profile]"** → Student Analytics (Page 17) for that student
- **Click "[Message]"** → Messaging interface

#### 8️⃣ **Back Navigation**
- **Click breadcrumb "My Courses"** → Dashboard (Page 13)
- **Click "Dashboard" in sidebar** → Dashboard (Page 13)
- **Click course name in header** → Stays on Page 14

---

## 📤 PAGE 15: Upload Content
**Route:** `/trainer/courses/:courseId/upload`
**How you got here:** Clicked "[+ Add Content]" from Course Management OR "[Edit]" on existing lesson

### Clickable Elements → Destinations:

#### 1️⃣ **File Upload Areas**
```
┌──────────────────────────────────────┐
│ 📹 Class Recording (Required)        │
│ Drag & drop or [Browse Files] ←────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Browse Files] ───────────┘
                ↓
    Opens: File picker dialog (stays on Page 15)
    After upload: File appears on Page 15
```

**Navigation for Each Upload Section:**

**📹 Video Upload:**
- **Click "[Browse Files]"** → File picker (stays on Page 15)
- **Drag & drop** → File uploads (stays on Page 15)
- After upload → Shows preview (stays on Page 15)

**📝 Transcript Upload:**
- **Click "[Browse TXT/PDF]"** → File picker (stays on Page 15)
- **Click "Auto-generate from video ✨"** → Triggers AI processing
  - Processing happens in background
  - Can continue on Page 15 OR goes to AI Studio (Page 16) to monitor

**📊 Slides Upload:**
- **Click "[Browse PDF/PPTX]"** → File picker (stays on Page 15)

**📄 Notes, ✏️ Exercises, 💬 Q&A:**
- Similar file picker flows (stays on Page 15)

#### 2️⃣ **AI Enhancement Options**
```
┌──────────────────────────────────────┐
│ 🤖 AI ENHANCEMENT OPTIONS            │
│ ☑ Audio Summary (Narrated)           │
│ ☑ Video Explainer (with avatars)     │
│ ☑ Interactive Walkthrough            │
│ [Configure AI Settings] ←──────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
    OR opens AI configuration modal (stays on Page 15)
```

**Navigation:**

**Checkboxes (☑):**
- **Click checkbox** → Toggles option (stays on Page 15)
- Options are remembered for generation

**Click "[Configure AI Settings]":**
- **→ AI Content Studio (Page 16)** for advanced configuration
- OR opens settings modal (stays on Page 15)

**Language/Level Selectors:**
- **Click "[English ▼]"** → Dropdown (stays on Page 15)
- **Click "[+ Add More]"** → Language selector (stays on Page 15)

#### 3️⃣ **Bottom Action Buttons**
```
[Cancel]    [Save Draft]    [Upload] ←────┐
    │            │               │          │
    ↓            ↓               ↓          │
 Page 14      Page 14      AI Studio       │
(Cancel)   (Saved draft)   (Page 16)       │
                                            │
       Clicks [Upload] ─────────────────────┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
    Shows AI generation progress
```

**Navigation:**

**Click "[Cancel]":**
- **→ Course Management (Page 14)** 
- Returns to course without saving

**Click "[Save Draft]":**
- Saves content (stays on Page 15)
- Shows success message
- Can click "Continue Editing" (stays on Page 15)
- OR "Back to Course" → Course Management (Page 14)

**Click "[Upload]":**
- Uploads content and starts AI processing
- **→ AI Content Studio (Page 16)** to monitor generation
- OR **→ Course Management (Page 14)** with success message
- Background AI processing continues

#### 4️⃣ **Special Actions**

**"Auto-generate transcript":**
```
│ ○ Auto-generate from video ✨ ←───┐│
                                     ││
       Clicks option ────────────────┘│
                ↓
    Starts AI processing
    Modal: "Processing will take 5-10 minutes"
    [Stay Here] [Go to AI Studio]
            │           │
            ↓           ↓
        Page 15     Page 16
```

**Navigation:**
- **Select auto-generate** → Shows processing modal
- **Click "[Stay Here]"** → Stays on Page 15, processes in background
- **Click "[Go to AI Studio]"** → AI Content Studio (Page 16) to monitor

**"Create Exercise Set":**
```
│ [Browse or Create Exercise Set] ←──┐│
                                      ││
       Clicks "Create" ───────────────┘│
                ↓
    Opens: Exercise builder
    OR goes to exercise creation tool (separate page/modal)
```

**Navigation:**
- **Click "Browse"** → File picker (stays on Page 15)
- **Click "Create"** → Exercise builder modal OR dedicated page

#### 5️⃣ **Preview Options**
- **Click "Preview" on uploaded file** → Preview modal (stays on Page 15)
- **Click "Edit" on uploaded file** → Edit inline (stays on Page 15)
- **Click "Remove" on uploaded file** → Removes file (stays on Page 15)

#### 6️⃣ **Back Navigation**
- **Click breadcrumb** → Course Management (Page 14)
- **Click "Back"** → Course Management (Page 14)
- **Click course name** → Course Management (Page 14)

---

## 🤖 PAGE 16: AI Content Studio
**Route:** `/trainer/ai-studio`
**How you got here:** Clicked "[Open AI Studio]" from Dashboard OR uploaded content OR clicked AI status

### Clickable Elements → Destinations:

#### 1️⃣ **Audio Summary Generator**
```
┌──────────────────────────────────────┐
│ 🎤 GENERATE AUDIO SUMMARY            │
│ Select source: [From video ▼] ←───┐│
│ [Generate Audio Summary]           ││
└──────────────────────────────────────┘│
                        │               │
       Clicks [Generate] ───────────────┘
                ↓
    Starts generation (stays on Page 16)
    Shows progress bar and queue
    When done: Shows preview player
```

**Navigation:**

**Click "[Generate Audio Summary]":**
- Starts AI generation (stays on Page 16)
- Shows progress: "Generating... 0%... 50%... 100%"
- When complete: Shows audio player (stays on Page 16)

**After Generation Complete:**
- **Click "▶ Preview"** → Plays audio (stays on Page 16)
- **Click "Download"** → Downloads audio file
- **Click "Add to Lesson"** → Adds to lesson
  - Modal: "Select lesson" → Choose lesson → Stays on Page 16 or back to Course Management (Page 14)
- **Click "Regenerate"** → Starts new generation (stays on Page 16)

#### 2️⃣ **Video Explainer Generator**
```
┌──────────────────────────────────────┐
│ 🎬 CREATE VIDEO EXPLAINER            │
│ Concept: [________________]          │
│ Video type: ○ Avatar presenter       │
│ [Generate Video] ←─────────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Generate Video] ─────────┘
                ↓
    Starts generation (stays on Page 16)
    Processing: "This may take 10-15 minutes"
    Can navigate away, processing continues
```

**Navigation:**

**Click "[Generate Video]":**
- Starts AI video generation (stays on Page 16)
- Shows "Processing: 0%... Creating avatar... Rendering..."
- **Can navigate away** - processing continues in background

**During Processing:**
- **Click "View Queue"** → Shows all processing jobs (stays on Page 16)
- **Click "Cancel Generation"** → Cancels job (stays on Page 16)

**After Complete:**
- Notification: "Video ready!"
- **Click notification** → Returns to AI Studio (Page 16) with video preview
- **Click "▶ Watch"** → Plays video (stays on Page 16)
- **Click "Add to Lesson"** → Lesson selector → Course Management (Page 14)
- **Click "Edit Video"** → Video editor (advanced, may be separate tool)

#### 3️⃣ **Interactive Walkthrough Builder**
```
┌──────────────────────────────────────┐
│ 🧭 BUILD INTERACTIVE WALKTHROUGH     │
│ Topic: [_____________________________]│
│ Steps: [10 / Custom ▼]               │
│ [Generate Walkthrough] ←───────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Generates walkthrough (stays on Page 16)
    Opens editor for customization
```

**Navigation:**

**Click "[Generate Walkthrough]":**
- AI generates step-by-step guide (stays on Page 16)
- Opens walkthrough editor (stays on Page 16 or modal)

**In Walkthrough Editor:**
- **Edit steps** → Inline editing (stays on Page 16)
- **Click "Preview"** → Interactive preview (modal on Page 16)
- **Click "Save"** → Saves walkthrough (stays on Page 16)
- **Click "Add to Lesson"** → Lesson selector → Course Management (Page 14)

#### 4️⃣ **Enhance Existing Content**
```
┌──────────────────────────────────────┐
│ ✨ ENHANCE EXISTING CONTENT          │
│ Select content: [Browse...] ←──────┐│
│ [Enhance Content]                   ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Browse...] ──────────────┘
                ↓
    Opens: Content Library (Page 18)
    Select content and return to Page 16
```

**Navigation:**

**Click "[Browse...]":**
- **→ Content Library (Page 18)** to select content
- After selection → Returns to AI Studio (Page 16) with content selected

**Click "[Enhance Content]":**
- Starts enhancement process (stays on Page 16)
- Shows options: summaries, key concepts, assessments
- Generates enhanced versions

**After Enhancement:**
- **Click "Preview"** → Preview modal (stays on Page 16)
- **Click "Apply to Lesson"** → Updates lesson → Course Management (Page 14)
- **Click "Save Separately"** → Saves as new version (stays on Page 16)

#### 5️⃣ **Generation History**
```
┌──────────────────────────────────────┐
│ 📊 GENERATION HISTORY                │
│ • Audio: Python Functions - Today    │
│ • Video: Loops Explained - Today     │
│ [View All Generated Content →] ←───┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: CONTENT LIBRARY (Page 18)
    Filtered to show AI-generated content
```

**Navigation:**

**Click individual history item:**
- Opens preview (modal on Page 16)
- Shows details: generation settings, duration, quality

**Click "[View All Generated Content →]":**
- **→ Content Library (Page 18)** with "AI Generated" filter

**Click history item actions:**
- **"Reuse"** → Copies settings for new generation (stays on Page 16)
- **"Edit"** → Opens editor (stays on Page 16)
- **"Delete"** → Confirmation → Deletes (stays on Page 16)

#### 6️⃣ **Processing Queue & Status**
```
┌──────────────────────────────────────┐
│ ⚙️ PROCESSING QUEUE (3 items)       │
│ 1. Video: Data Types [Progress: 45%]│
│ 2. Audio: Functions [Queued]        │
│ 3. Walkthrough: Setup [Queued]      │
│ [View Queue Details] ←─────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Expands queue view (stays on Page 16)
    Shows detailed progress for each item
```

**Navigation:**
- **Click "[View Queue Details]"** → Expands queue section (stays on Page 16)
- **Click individual queue item** → Shows details (stays on Page 16)
- **Click "Pause"** → Pauses job (stays on Page 16)
- **Click "Cancel"** → Cancels job (stays on Page 16)

#### 7️⃣ **Navigation to Analytics**
```
After generating content, action buttons:
[Add to Lesson] [View Performance] ←──┐
                        │               │
                        ↓               │
       Clicks [View Performance] ───────┘
                ↓
    Goes to: STUDENT ANALYTICS (Page 17)
    Shows how students engage with AI content
```

**Navigation:**
- **Click "[View Performance]"** (if content is published) → Student Analytics (Page 17)
  - Shows engagement metrics for AI content

#### 8️⃣ **Back Navigation**
- **Click "Dashboard"** → Trainer Dashboard (Page 13)
- **Click "Back to Course"** → Course Management (Page 14)
- **Click breadcrumb** → Previous page
- **Can navigate away while processing** - jobs continue in background

---

## 📊 PAGE 17: Student Analytics
**Route:** `/trainer/courses/:courseId/analytics`
**How you got here:** Clicked "[View Analytics]" from Dashboard OR Analytics tab from Course Management

### Clickable Elements → Destinations:

#### 1️⃣ **Class Overview Section**
```
┌──────────────────────────────────────┐
│ CLASS OVERVIEW                       │
│ Total Students: 45                   │
│ Average Progress: 65%                │
│ [Export Report] [Filter View] ←────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Export Report] ──────────┘
                ↓
    Generates PDF/CSV report (stays on Page 17)
    Downloads file
```

**Navigation:**
- **Click "[Export Report]"** → Downloads report (stays on Page 17)
- **Click "[Filter View]"** → Opens filter panel (stays on Page 17)
- **Click stats/numbers** → Filters view (stays on Page 17)

#### 2️⃣ **Students Needing Attention**
```
┌──────────────────────────────────────┐
│ ⚠️ STUDENTS NEEDING ATTENTION (8)   │
│ • John Doe - 30% progress            │
│   [Contact] [View Profile] ←───────┐│
│ • Jane Smith - Failed assessments   ││
│   [Send Resources] [Schedule]      ││
└──────────────────────────────────────┘│
                   │              │     │
                   ↓              ↓     │
              Messaging    Student     │
              (modal)      Detail      │
                                        │
       Clicks [View Profile] ───────────┘
                ↓
    Opens: Student detail view (modal on Page 17)
    OR separate student profile page
```

**Navigation:**

**Click "[Contact Student]":**
- Opens messaging interface (modal on Page 17)
- Can send email/notification

**Click "[View Profile]":**
- Opens detailed student view (modal on Page 17 OR separate page)
- Shows complete student history, progress, scores

**Click "[Send Resources]":**
- Opens resource selector (modal on Page 17)
- Select content to recommend
- **Can link to Content Library (Page 18)** to browse
- After selection → Sends to student (stays on Page 17)

**Click "[Schedule Check-in]":**
- Opens calendar/scheduling tool (modal or separate feature)

**Click student name:**
- Opens student detail (same as View Profile)

**Click "[View All At-Risk Students →]":**
- Filters view to show only at-risk students (stays on Page 17)

#### 3️⃣ **Top Performers Section**
```
┌──────────────────────────────────────┐
│ 🏆 TOP PERFORMERS (12)               │
│ • Alice: 95% progress, 92% avg       │
│ [View All Top Performers →] ←──────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks link ─────────────────────┘
                ↓
    Filters view to top performers (stays on Page 17)
```

**Navigation:**
- **Click "[View All Top Performers →]"** → Filtered view (stays on Page 17)
- **Click student name** → Student detail modal/page

#### 4️⃣ **Commonly Misunderstood Topics**
```
┌──────────────────────────────────────┐
│ 📉 COMMONLY MISUNDERSTOOD TOPICS     │
│ 1. Function Parameters (70% struggle)│
│    [Generate Extra Content] ←──────┐│
│    [Send Review]                    ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Generate Extra Content] ─┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
    Pre-filled with this topic for generation
```

**Navigation:**

**Click "[Generate Extra Content]":**
- **→ AI Content Studio (Page 16)** 
- Pre-filled: Topic = "Function Parameters"
- Ready to generate targeted content

**Click "[Send Review]":**
- Opens action modal (stays on Page 17)
- Options:
  - "Send existing resources" → Content Library (Page 18) to select
  - "Generate new content" → AI Studio (Page 16)
  - "Schedule review session" → Scheduling tool

**Click topic name:**
- Shows detailed analytics for that topic (stays on Page 17, expanded view)
- Drills down: which students struggle, common errors, quiz performance

#### 5️⃣ **Lesson-by-Lesson Performance**
```
┌──────────────────────────────────────┐
│ 📚 LESSON PERFORMANCE                │
│ Ch 2, Lesson 3: Functions            │
│ Completion: 78% | Avg Score: 72%     │
│ [View Lesson Analytics] ←──────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Shows detailed lesson analytics (stays on Page 17)
    OR goes to that lesson in Course Management (Page 14)
```

**Navigation:**

**Click "[View Lesson Analytics]":**
- Expands lesson details (stays on Page 17)
- Shows:
  - Completion rate over time
  - Average time spent
  - Quiz scores
  - AI content engagement

**Click lesson name:**
- **→ Course Management (Page 14)** for that lesson
- Shows lesson in context of course

**Click "AI content engagement":**
- Shows AI metrics: audio plays, video views, etc.
- Can filter by AI type

#### 6️⃣ **AI Content Performance**
```
┌──────────────────────────────────────┐
│ 🤖 AI CONTENT ENGAGEMENT             │
│ Audio Summaries: 245 plays           │
│ Video Explainers: 189 views          │
│ Walkthroughs: 124 completions        │
│ [View AI Analytics] ←──────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Shows detailed AI analytics (stays on Page 17)
    Which AI content is most effective
```

**Navigation:**
- **Click "[View AI Analytics]"** → Expanded AI metrics (stays on Page 17)
- **Click individual AI stat** → Filtered view showing that content type
- **Click "See which content performs best"** → Ranked list (stays on Page 17)

#### 7️⃣ **Charts and Graphs**
```
Interactive charts showing:
- Progress over time
- Score distribution
- Engagement rates

Click on chart elements:
- Data points → Detailed view (modal)
- Legend items → Filters view
- Export button → Downloads chart
```

**Navigation:**
- **Click chart data point** → Drill-down details (modal on Page 17)
- **Click "[Export Chart]"** → Downloads image/data
- **Click time period selector** → Changes date range (stays on Page 17)

#### 8️⃣ **Action Buttons Based on Insights**
```
Based on analytics, suggested actions:
[Create Targeted Content] → AI Studio (Page 16)
[Send Group Message] → Messaging tool
[Adjust Course Pace] → Course Management (Page 14)
[Generate Report] → Downloads PDF
```

**Navigation:**
- **Click "[Create Targeted Content]"** → AI Content Studio (Page 16) with insights
- **Click "[Adjust Course Pace]"** → Course Management (Page 14) with editing mode

#### 9️⃣ **Back Navigation**
- **Click breadcrumb "Course"** → Course Management (Page 14)
- **Click "Dashboard"** → Trainer Dashboard (Page 13)
- **Click "Back to Course"** → Course Management (Page 14)

---

## 📁 PAGE 18: Content Library
**Route:** `/trainer/content-library`
**How you got here:** Clicked "[Browse Library]" from Dashboard OR during content selection

### Clickable Elements → Destinations:

#### 1️⃣ **Filter and Search**
```
┌──────────────────────────────────────┐
│ 📁 Content Library                   │
│ [Search...] [Filters ▼] [Sort ▼]    │
│   All | Videos | Audio | Docs | AI   │
└──────────────────────────────────────┘
```

**Navigation:**
- **Type in search** → Filters results (stays on Page 18)
- **Click filter tabs** → Shows filtered content (stays on Page 18)
- **Click "[Filters ▼]"** → Advanced filter panel (stays on Page 18)

#### 2️⃣ **Content Items**
```
┌──────────────────────────────────────┐
│ 📹 Python Functions Lecture          │
│ Used in: Python 101 - Ch 3           │
│ [Preview] [Reuse] [Edit] ←─────────┐│
└──────────────────────────────────────┘│
           │       │       │            │
           ↓       ↓       ↓            │
        Modal   Page 14  Page 15        │
      (Preview) (Course) (Upload)       │
                                         │
       Clicks [Reuse] ───────────────────┘
                ↓
    Opens: Course/Lesson selector modal
    Select destination → Goes to Course Management (Page 14)
```

**Navigation from Content Items:**

**Click "[Preview]":**
- Opens preview modal (stays on Page 18)
- Shows content in student view
- Can play video/audio

**Click "[Reuse]":**
- Opens lesson selector modal (stays on Page 18)
- Select target: "Add to which lesson?"
- After selection:
  - **→ Course Management (Page 14)** with content added
  - OR stays on Page 18 with success message

**Click "[Edit]":**
- **→ Upload Content (Page 15)** in edit mode
- Pre-filled with existing content

**Click "[Delete]":**
- Shows confirmation modal (stays on Page 18)
- "This content is used in 3 lessons. Are you sure?"
- After confirmation → Deletes (stays on Page 18)

**Click content title/thumbnail:**
- Opens detailed view (modal on Page 18)
- Shows metadata, usage statistics, AI enhancements

#### 3️⃣ **AI Generated Content Filter**
```
When viewing "AI Generated" tab:
┌──────────────────────────────────────┐
│ 🤖 AI-Generated Content              │
│ • Audio: Python Functions (Today)    │
│ • Video: Loops Explained (Today)     │
│   [View in AI Studio] ←────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks link ─────────────────────┘
                ↓
    Goes to: AI CONTENT STUDIO (Page 16)
    Shows this content in generation history
```

**Navigation:**
- **Click "[View in AI Studio]"** → AI Content Studio (Page 16)
- **Click "Regenerate"** → AI Studio (Page 16) with regeneration settings

#### 4️⃣ **Bulk Actions**
```
Select multiple items with checkboxes:
☑ Item 1
☑ Item 2
☐ Item 3

[Add to Course] [Download] [Delete] ←──┐
                                        │
       Clicks [Add to Course] ──────────┘
                ↓
    Opens: Course selector modal
    Select course → Goes to Course Management (Page 14)
```

**Navigation:**
- **Select items + click "[Add to Course]"** 
  - Selector modal → Choose course/lessons
  - **→ Course Management (Page 14)** with items added
- **Click "[Download]"** → Downloads selected files (stays on Page 18)
- **Click "[Delete]"** → Bulk delete confirmation (stays on Page 18)

#### 5️⃣ **Upload New Content from Library**
```
[+ Upload New Content] ←────────────┐
                                    │
       Clicks button ───────────────┘
                ↓
    Goes to: UPLOAD CONTENT (Page 15)
    Without course context (standalone upload)
```

**Navigation:**
- **Click "[+ Upload New Content]"** → Upload Content (Page 15)
- Upload creates library item, can assign to courses later

#### 6️⃣ **Content Statistics**
```
Click on usage statistics:
"Used in 3 courses" →  Shows which courses (modal)
"Viewed 145 times" → Shows engagement data (modal)
"75% completion rate" → Shows analytics
```

**Navigation:**
- **Click usage stats** → Detailed modal (stays on Page 18)
- **Click "View in courses"** → Lists courses → Click course → Course Management (Page 14)

#### 7️⃣ **Collections/Folders**
```
Left sidebar showing collections:
📁 Python Course Materials
📁 Data Science Resources
📁 AI Generated Content
[+ New Collection] ←───────────────┐
                                    │
       Clicks [+ New Collection] ───┘
                ↓
    Creates new folder (stays on Page 18)
```

**Navigation:**
- **Click folder/collection** → Filters to show that collection (stays on Page 18)
- **Click "[+ New Collection]"** → Create folder (stays on Page 18)
- **Drag content to folder** → Organizes content (stays on Page 18)

#### 8️⃣ **Back Navigation**
- **Click "Dashboard"** → Trainer Dashboard (Page 13)
- **Click "Back" (if came from another page)** → Returns to previous page
  - If from Course Management → Course Management (Page 14)
  - If from AI Studio → AI Studio (Page 16)

---

## 🚪 LOGOUT Flow

### From Any Trainer Page → Logout

```
Any Trainer Page
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
    "Any ongoing AI generations will continue in background"
    [Cancel] [Logout]
            │
            ↓
    Logs out, clears session
            │
            ↓
    Goes to: LOGIN PAGE (Page 1)
```

**Logout Notes:**
- **Active AI generations** continue in background
- **Draft uploads** are auto-saved
- **Can resume** where left off after re-login

---

## 🗺️ COMPLETE TRAINER JOURNEY MAPS

### **Journey 1: Trainer Uploading New Content with AI Generation**

```
1. Login (Page 1)
       ↓
2. Trainer Dashboard (Page 13)
   - Reviews active courses
   - Sees "Python 101" needs new content
   - Clicks "[Manage Course]"
       ↓
3. Course Management (Page 14)
   - Views course structure
   - Chapter 3 needs content
   - Clicks "[+ Add Content]"
       ↓
4. Upload Content (Page 15)
   - Fills in lesson title: "Advanced Functions"
   - Uploads video file (drag & drop)
   - Uploads slides PDF
   - Checks AI options:
     ☑ Audio Summary
     ☑ Video Explainer
     ☑ Interactive Walkthrough
   - Clicks "[Upload]"
       ↓
5. AI Content Studio (Page 16)
   - Redirected to monitor AI generation
   - Shows processing queue:
     • Audio: Generating... 45%
     • Video: Queued
     • Walkthrough: Queued
   - Can navigate away; processing continues
   - Clicks "Dashboard" while processing
       ↓
6. Trainer Dashboard (Page 13)
   - Sees notification: "Audio ready!"
   - Clicks notification
       ↓
7. AI Content Studio (Page 16)
   - Audio complete, shows preview
   - Clicks "▶ Preview" - listens to audio
   - Satisfied with quality
   - Clicks "[Add to Lesson]"
   - Modal: Select lesson → "Advanced Functions" → Confirm
   - Audio added successfully
   - Video still processing (10 minutes remaining)
   - Clicks "Dashboard"
       ↓
8. Trainer Dashboard (Page 13)
   - Checks on students
   - Clicks "[View Detailed Analytics]"
       ↓
9. Student Analytics (Page 17)
   - Reviews student performance
   - Sees "8 students struggling with Chapter 2"
   - Clicks "[Generate Extra Content]"
       ↓
10. AI Content Studio (Page 16)
    - Pre-filled with "Chapter 2 Functions" topic
    - Generates targeted review video
    - Clicks "[Generate Video]"
    - Processing starts
    - Clicks "Profile" → "Logout"
        ↓
11. Login (Page 1) - Session ended
    - AI generation continues in background
    - Will be ready when trainer logs back in
```

---

### **Journey 2: Trainer Managing Course and Monitoring Students**

```
1. Login (Page 1)
       ↓
2. Trainer Dashboard (Page 13)
   - Sees "Python 101" course card
   - Notices "⚠️ Students Needing Attention: 8"
   - Clicks "[View Analytics]"
       ↓
3. Student Analytics (Page 17)
   - Reviews at-risk students
   - John Doe: 30% progress, behind schedule
   - Clicks "[View Profile]"
   - Modal opens showing John's full history
   - Sees he's struggling with "Functions" topic
   - Closes modal
   - Clicks "[Send Resources]"
       ↓
4. Modal on Page 17:
   - "Send resources to John Doe"
   - Options:
     - Send existing content
     - Generate personalized content
   - Clicks "Browse existing content"
       ↓
5. Content Library (Page 18)
   - Opens in modal OR full page
   - Filters to "Functions" topic
   - Finds: "Functions Explained - Audio Summary"
   - Checks box, clicks "[Send to Student]"
   - Returns to Analytics
       ↓
6. Student Analytics (Page 17)
   - Scrolls to "Commonly Misunderstood Topics"
   - Sees "Function Parameters - 70% struggle rate"
   - This needs new content
   - Clicks "[Generate Extra Content]"
       ↓
7. AI Content Studio (Page 16)
   - Pre-filled: "Function Parameters"
   - Selects: "Video Explainer with Avatar"
   - Sets style: "Beginner friendly"
   - Clicks "[Generate Video]"
   - Starts generating
   - Clicks "Back to Course"
       ↓
8. Course Management (Page 14)
   - Views course content structure
   - Wants to check Chapter 2 lessons
   - Expands Chapter 2
   - Sees lesson "Function Parameters"
   - Clicks lesson name
   - Clicks "[Analytics]"
       ↓
9. Student Analytics (Page 17)
   - Filtered to this specific lesson
   - Detailed performance metrics
   - 32 students attempted
   - Average score: 45%
   - AI video will help here
   - Clicks "Dashboard"
       ↓
10. Trainer Dashboard (Page 13)
    - Summary view
    - Logout when done
```

---

### **Journey 3: Trainer Reusing Content from Library**

```
1. Login (Page 1)
       ↓
2. Trainer Dashboard (Page 13)
   - Starting new course: "Advanced Python"
   - Clicks "[+ New Course]"
   - Creates course in wizard
   - Redirected after creation
       ↓
3. Course Management (Page 14)
   - New empty course structure
   - Needs to add content
   - Has existing content from "Python 101"
   - Clicks "Content Library" in sidebar
       ↓
4. Content Library (Page 18)
   - Browses available content
   - Filters by "Python" topic
   - Finds relevant lessons:
     ☑ "Python Functions Intro"
     ☑ "Advanced Function Concepts"
     ☑ "Lambda Functions"
   - Selects 3 items
   - Clicks "[Add to Course]"
       ↓
5. Modal on Page 18:
   - "Add to which course and chapter?"
   - Selects: "Advanced Python - Chapter 1"
   - Clicks "Add"
   - Success: "3 lessons added"
   - Modal closes
       ↓
6. Content Library (Page 18)
   - Can continue browsing OR
   - Clicks "Back to Advanced Python"
       ↓
7. Course Management (Page 14)
   - Shows "Advanced Python" course
   - Chapter 1 now has 3 lessons
   - Expands Chapter 1 to view
   - Lessons appear with all content:
     • Videos
     • Transcripts
     • AI enhancements already included!
   - Clicks on first lesson
   - Clicks "[Preview]"
       ↓
8. Preview Modal (Page 14):
   - Shows student view
   - Everything looks good
   - Closes preview
   - Course ready for students!
   - Clicks "Dashboard"
       ↓
9. Trainer Dashboard (Page 13)
   - New course "Advanced Python" appears
   - Efficient reuse saved hours of work
```

---

### **Journey 4: Trainer Editing and Improving Content**

```
1. Login (Page 1)
       ↓
2. Trainer Dashboard (Page 13)
   - Notification: "AI Video ready for review"
   - Clicks notification
       ↓
3. AI Content Studio (Page 16)
   - Shows recently generated video
   - "Data Types Explained" video
   - Clicks "▶ Watch" preview
   - Watches video... notices small error
   - Clicks "[Edit]" (if available) OR "[Regenerate]"
   - Adjusts parameters: more detail on dictionaries
   - Clicks "[Regenerate]"
   - New generation starts
   - Meanwhile, checks other content
   - Clicks "Content Library" in sidebar
       ↓
4. Content Library (Page 18)
   - Reviews existing materials
   - Finds old lesson: "Variables Basics"
   - Clicks "[Edit]"
       ↓
5. Upload Content (Page 15)
   - Lesson details loaded
   - Updates description
   - Replaces old slides with new version
   - Adds new AI enhancement:
     ☑ Interactive Walkthrough (wasn't available before)
   - Clicks "[Upload]"
       ↓
6. AI Content Studio (Page 16)
   - Shows both jobs:
     • Video regeneration: 80% complete
     • New walkthrough: Queued
   - Video finishes first
   - Clicks "▶ Preview" - perfect now!
   - Clicks "[Add to Lesson]"
   - Adds to "Data Types" lesson
   - Walkthrough completes
   - Reviews walkthrough
   - Clicks "[Add to Lesson]"
   - Adds to "Variables Basics" lesson
   - Both lessons now improved!
   - Clicks "Back to Course"
       ↓
7. Course Management (Page 14)
   - Views updated lessons
   - Both show new AI badges
   - Publishes updates
   - Students will see improvements
   - Clicks "[View Analytics]"
       ↓
8. Student Analytics (Page 17)
   - Will monitor if new content helps
   - Can compare before/after metrics
   - Logout when done
```

---

## 🎯 Navigation Summary by Page

### Quick Reference: "Click X → Go to Y"

| From Page | Click Element | Go To Page |
|-----------|---------------|------------|
| **Trainer Dashboard (13)** | Manage Course | Course Management (14) |
| **Trainer Dashboard (13)** | View Analytics | Student Analytics (17) |
| **Trainer Dashboard (13)** | Open AI Studio | AI Content Studio (16) |
| **Trainer Dashboard (13)** | Browse Library | Content Library (18) |
| **Trainer Dashboard (13)** | + New Course | Course Management (14, new) |
| | |
| **Course Management (14)** | + Add Content | Upload Content (15) |
| **Course Management (14)** | Edit lesson | Upload Content (15, edit mode) |
| **Course Management (14)** | Analytics tab | Student Analytics (17) |
| **Course Management (14)** | AI Hub tab / AI badges | AI Content Studio (16) |
| **Course Management (14)** | Preview lesson | Modal (stays on 14) |
| **Course Management (14)** | Lesson Analytics | Student Analytics (17, filtered) |
| | |
| **Upload Content (15)** | Browse Files | File picker (stays on 15) |
| **Upload Content (15)** | Auto-generate | AI Studio (16) or modal |
| **Upload Content (15)** | Upload button | AI Studio (16) or Course Mgmt (14) |
| **Upload Content (15)** | Cancel | Course Management (14) |
| **Upload Content (15)** | Save Draft | Stays on 15 or returns to 14 |
| | |
| **AI Studio (16)** | Generate (any type) | Stays on 16, shows progress |
| **AI Studio (16)** | Add to Lesson | Lesson selector → Course Mgmt (14) |
| **AI Studio (16)** | Browse content | Content Library (18) |
| **AI Studio (16)** | View history | Content Library (18, AI filter) |
| **AI Studio (16)** | View Performance | Student Analytics (17) |
| | |
| **Student Analytics (17)** | Generate Extra Content | AI Content Studio (16) |
| **Student Analytics (17)** | Send Resources | Content Library (18) or modal |
| **Student Analytics (17)** | View Profile | Student detail (modal or page) |
| **Student Analytics (17)** | Lesson name | Course Management (14) |
| **Student Analytics (17)** | Back to Course | Course Management (14) |
| | |
| **Content Library (18)** | Preview | Modal (stays on 18) |
| **Content Library (18)** | Reuse | Course selector → Course Mgmt (14) |
| **Content Library (18)** | Edit | Upload Content (15) |
| **Content Library (18)** | View in AI Studio | AI Content Studio (16) |
| **Content Library (18)** | + Upload New | Upload Content (15) |
| | |
| **Any Page** | Logo | Trainer Dashboard (13) |
| **Any Page** | Dashboard sidebar | Trainer Dashboard (13) |
| **Any Page** | AI Studio sidebar | AI Content Studio (16) |
| **Any Page** | Content Library sidebar | Content Library (18) |
| **Any Page** | Profile → Logout | Login (1) |

---

## 💡 Key Navigation Patterns

### 1. **The Content Creation Loop**
```
Dashboard → Course Management → Upload Content → 
AI Studio (generation) → Back to Course Management → 
View Analytics
```

### 2. **The Student Support Pattern**
```
Dashboard → Analytics → Identify Issue → 
Generate Targeted Content (AI Studio) → 
Send to Students → Monitor Improvement
```

### 3. **The Content Reuse Pattern**
```
Dashboard → Content Library → Select existing → 
Add to Course → Course Management → Publish
```

### 4. **The Quality Improvement Loop**
```
Course Management → Analytics → Identify weak areas → 
AI Studio (generate supplemental) → Add to Lesson → 
Monitor Impact (Analytics)
```

---

## 🔄 Always Available Navigation

No matter which trainer page you're on, you can always:

1. **Go Home:** Click logo or "Dashboard" → Trainer Dashboard (Page 13)
2. **Manage Courses:** Sidebar navigation to specific courses
3. **Access AI Tools:** Click "AI Studio" → AI Content Studio (Page 16)
4. **Browse Content:** Click "Content Library" → Content Library (Page 18)
5. **Check Notifications:** Notification icon for AI generation completion, student issues
6. **Logout:** Profile → Logout → Login (Page 1)

---

## 🎯 Trainer-Specific Features

### Background Processing
- **AI generations continue** even when navigating away
- **Notifications alert** when content is ready
- **Can resume** work from any page

### Multi-Course Management
- **Switch between courses** from sidebar
- **Consistent navigation** across all courses
- **Content reuse** across multiple courses

### Analytics-Driven Actions
- **Direct links** from analytics to AI Studio
- **Generate content** based on student struggles
- **Send resources** directly from analytics page

---

This complete navigation guide shows every clickable element and where it takes trainers throughout their entire journey from login to logout!
