# Admin (LTC) Navigation Flow
## Complete Click-by-Click Journey: Dashboard → Logout

---

## Overview: Admin Pages & Navigation

```
LOGIN (Page 1)
    ↓
ADMIN DASHBOARD (Page 23) ←────────────────┐ [Home/Logo click from anywhere]
    ↓                                       │
[Multiple paths available]                  │
    ↓                                       │
[Various pages]                             │
    ↓                                       │
LOGOUT ──────────────────────────────────────┘
```

---

## 🏠 PAGE 23: System Dashboard (Platform Overview - Entry Point)
**Route:** `/admin/dashboard`
**User Stories:** LTC #1-12

### Clickable Elements → Destinations:

#### 1️⃣ **Platform Statistics Overview**
```
┌──────────────────────────────────────┐
│ 📊 PLATFORM STATISTICS               │
│                                      │
│ Total Users: 500                     │
│ • Learners: 450                      │
│ • Trainers: 45                       │
│ • Leadership: 5                      │
│                                      │
│ Active Courses: 24                   │
│ Content Items: 3,456                 │
│ AI Generations: 12,345               │
│                                      │
│ [View Details →] ←─────────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View Details →] ─────────┘
                ↓
    Goes to: USER MANAGEMENT (Page 24)
    Shows user breakdown and management interface
```

**Navigation:**

**Click "[View Details →]":**
- **→ User Management (Page 24)** with user statistics

**Click "Total Users: 500":**
- **→ User Management (Page 24)** showing all users

**Click individual role counts (e.g., "Learners: 450"):**
- **→ User Management (Page 24)** filtered to that role

**Click "Active Courses: 24":**
- Shows course management interface (modal or separate page)

**Click "Content Items: 3,456":**
- **→ Knowledge Base (Page 25)** showing all content

**Click "AI Generations: 12,345":**
- **→ AI Configuration (Page 26)** with usage statistics

#### 2️⃣ **System Health Status**
```
┌──────────────────────────────────────┐
│ 🟢 SYSTEM HEALTH                     │
│                                      │
│ • Backend API: 🟢 Operational        │
│ • Database: 🟢 Healthy              │
│ • AI Services: 🟢 Running           │
│ • Storage: 78% used (142 GB free)   │
│                                      │
│ Last Backup: Feb 17, 2026 2:00 AM   │
│ [View System Logs] [Run Backup] ←──┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View System Logs] ────────┘
                ↓
    Opens system log viewer (modal or separate page)
    Shows API calls, errors, performance metrics
```

**Navigation:**

**Click "[View System Logs]":**
- Opens log viewer (modal on Page 23 or separate admin page)
- Shows error logs, API logs, user activity

**Click "[Run Backup]":**
- Triggers manual backup (stays on Page 23)
- Shows progress modal, then confirmation

**Click service status (e.g., "AI Services: 🟢"):**
- Shows detailed service metrics (modal)
- Uptime, response times, error rates

**Click storage indicator:**
- Shows storage breakdown (modal)
- By content type: videos, documents, AI content

#### 3️⃣ **User Activity Overview**
```
┌──────────────────────────────────────┐
│ 👥 USER ACTIVITY (Last 24 Hours)    │
│                                      │
│ New Registrations: 12                │
│ Active Users: 234                    │
│ Courses Completed: 8                 │
│ Content Uploaded: 15 items           │
│                                      │
│ [View User Management →] ←─────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: USER MANAGEMENT (Page 24)
    Shows user activity and management
```

**Navigation:**

**Click "[View User Management →]":**
- **→ User Management (Page 24)** 

**Click "New Registrations: 12":**
- **→ User Management (Page 24)** filtered to new users (last 24h)

**Click "Active Users: 234":**
- **→ User Management (Page 24)** showing currently active users

**Click "Content Uploaded: 15":**
- **→ Knowledge Base (Page 25)** filtered to recent uploads

#### 4️⃣ **AI Processing Status**
```
┌──────────────────────────────────────┐
│ 🤖 AI PROCESSING STATUS              │
│                                      │
│ Queue Status:                        │
│ • Queued: 5 jobs                     │
│ • Processing: 3 jobs                 │
│ • Completed (24h): 45 jobs           │
│ • Failed: 0 ✅                       │
│                                      │
│ Avg Processing Time: 8.5 minutes     │
│ Success Rate: 100% ✅                │
│                                      │
│ [View AI Configuration →] ←────────┐│
│ [View Processing Queue]            ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View AI Configuration] ───┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Shows AI service settings and controls
```

**Navigation:**

**Click "[View AI Configuration →]":**
- **→ AI Configuration (Page 26)** 

**Click "[View Processing Queue]":**
- **→ AI Configuration (Page 26)** with queue details tab active

**Click job counts (e.g., "Queued: 5 jobs"):**
- **→ AI Configuration (Page 26)** filtered to show those jobs

**Click "Failed: 0":**
- **→ AI Configuration (Page 26)** with error log (if any failures)

**Click "Success Rate: 100%":**
- **→ AI Configuration (Page 26)** showing processing statistics

#### 5️⃣ **Content Statistics**
```
┌──────────────────────────────────────┐
│ 📚 CONTENT OVERVIEW                  │
│                                      │
│ Knowledge Base Items:                │
│ • Videos: 245                        │
│ • Documents: 567                     │
│ • Transcripts: 234                   │
│ • AI Generated: 1,245                │
│                                      │
│ Total Storage: 284 GB                │
│                                      │
│ [Manage Content →] ←───────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Manage Content →] ────────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    Content repository management interface
```

**Navigation:**

**Click "[Manage Content →]":**
- **→ Knowledge Base (Page 25)**

**Click content type counts (e.g., "Videos: 245"):**
- **→ Knowledge Base (Page 25)** filtered to that content type

**Click "AI Generated: 1,245":**
- **→ Knowledge Base (Page 25)** filtered to AI-generated content

**Click "Total Storage: 284 GB":**
- **→ Knowledge Base (Page 25)** with storage management view

#### 6️⃣ **Recent System Events**
```
┌──────────────────────────────────────┐
│ 📋 RECENT ACTIVITY LOG               │
│                                      │
│ 2:15 PM - New user registered ←────┐│
│           (John Smith - Learner)    ││
│                                     ││
│ 2:10 PM - AI video generation       ││
│           completed (Python Intro)  ││
│                                     ││
│ 2:05 PM - Course "Data Science"     ││
│           updated by Dr. Chen       ││
│                                     ││
│ [View Full Activity Log →]         ││
└──────────────────────────────────────┘│
                                        │
       Clicks event ────────────────────┘
                ↓
    Opens event details (modal)
    Shows full context, user info, action taken
```

**Navigation:**

**Click individual event:**
- Opens event details (modal on Page 23)
- Shows: timestamp, user, action, details

**Click username in event:**
- **→ User Management (Page 24)** showing that user's profile

**Click "[View Full Activity Log →]":**
- Opens comprehensive audit log (separate page or expanded view)
- Filter by user, action type, date range

**Click content name in event:**
- **→ Knowledge Base (Page 25)** showing that content item

#### 7️⃣ **Quick Actions Panel**
```
┌──────────────────────────────────────┐
│ ⚡ QUICK ACTIONS                     │
│                                      │
│ [Manage Users] ─────────────────────┐│
│ [Manage Content]                    ││
│ [Configure AI Services]             ││
│ [View Reports]                      ││
│ [System Settings]                   ││
└──────────────────────────────────────┘│
     │          │            │           │
     ↓          ↓            ↓           │
  Page 24    Page 25      Page 26       │
   (Users)  (Content)    (AI Config)    │
                                         │
       Clicks [Manage Users] ────────────┘
                ↓
    Goes to: USER MANAGEMENT (Page 24)
```

**Navigation:**
- **Click "[Manage Users]"** → User Management (Page 24)
- **Click "[Manage Content]"** → Knowledge Base (Page 25)
- **Click "[Configure AI Services]"** → AI Configuration (Page 26)
- **Click "[View Reports]"** → Reports interface (admin reports page)
- **Click "[System Settings]"** → System configuration page

#### 8️⃣ **Alerts and Notifications**
```
┌──────────────────────────────────────┐
│ 🔔 SYSTEM ALERTS                     │
│                                      │
│ ⚠️ Storage at 78% - Consider cleanup │
│    [View Storage Details] ←────────┐│
│                                     ││
│ ℹ️ 5 user registration requests     ││
│    pending approval                 ││
│    [Review Requests]               ││
│                                     ││
│ ✅ All AI services healthy          ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Storage Details] ────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    Shows storage management and cleanup tools
```

**Navigation:**

**Click "[View Storage Details]":**
- **→ Knowledge Base (Page 25)** with storage view

**Click "[Review Requests]":**
- **→ User Management (Page 24)** with pending approvals tab

**Click alert message:**
- Opens relevant management page with context

#### 9️⃣ **Global Navigation (Always Available)**
- **Click logo** → Admin Dashboard (Page 23)
- **Click "Dashboard" in sidebar** → Admin Dashboard (Page 23)
- **Click "Users" in sidebar** → User Management (Page 24)
- **Click "Content" in sidebar** → Knowledge Base (Page 25)
- **Click "AI Config" in sidebar** → AI Configuration (Page 26)
- **Click "Settings" in sidebar** → System settings page
- **Click search bar** → Global search (users, content, courses)
- **Click notifications 🔔** → All system notifications
- **Click profile 👤** → Admin profile dropdown

---

## 👥 PAGE 24: User Management (User Administration)
**Route:** `/admin/users`
**User Stories:** LTC #6, #7
**How you got here:** Clicked user metric from Dashboard OR "Users" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **User Overview Statistics**
```
┌──────────────────────────────────────┐
│ 👥 User Management                   │
│                                      │
│ Total Users: 500                     │
│ Active: 234 | Inactive: 266          │
│                                      │
│ By Role:                             │
│ • Learners: 450 [Manage] ←─────────┐│
│ • Trainers: 45 [Manage]            ││
│ • Leadership: 5 [Manage]           ││
│                                     ││
│ Pending Approvals: 5 [Review]      ││
│                                     ││
│ [+ Add New User] [Import Users]    ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Manage] on Learners ──────┘
                ↓
    Filters view to show Learners only (stays on Page 24)
```

**Navigation:**

**Click "[Manage]" on role:**
- Filters user list to that role (stays on Page 24)

**Click "Active: 234":**
- Filters to active users (stays on Page 24)

**Click "Inactive: 266":**
- Filters to inactive users (stays on Page 24)

**Click "[Review]" on Pending Approvals:**
- Shows pending registration requests (stays on Page 24, filtered view)

**Click "[+ Add New User]":**
- Opens user creation form (modal on Page 24)

**Click "[Import Users]":**
- Opens bulk import wizard (modal on Page 24)
- Upload CSV, map fields, validate, import

#### 2️⃣ **Search and Filter Bar**
```
┌──────────────────────────────────────┐
│ [Search users...] [Filters ▼]       │
│                                      │
│ [All] [Learners] [Trainers]         │
│ [Leadership] [Active] [Inactive]     │
└──────────────────────────────────────┘
```

**Navigation:**
- **Type search query** → Filters results (stays on Page 24)
- **Click filter tabs** → Shows filtered users (stays on Page 24)
- **Click "[Filters ▼]"** → Advanced filters (dropdown)
  - By registration date, activity level, course enrollment, etc.

#### 3️⃣ **User List with Individual Cards**
```
┌──────────────────────────────────────┐
│ John Doe                    ID: 1001 │
│ Role: Learner | Active               │
│ Email: john@example.com              │
│ Last Login: Today at 9:30 AM         │
│ Courses: 3 | Progress: 68%           │
│                                      │
│ [Edit] [Deactivate] [View Details] ←┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View Details] ────────────┘
                ↓
    Opens detailed user profile (modal or expanded view)
    Shows full activity history, permissions, settings
```

**Navigation from User Cards:**

**Click "[Edit]":**
- Opens user editor (modal on Page 24)
- Can change: name, email, role, status, permissions

**Click "[Deactivate]" (or "[Activate]" if inactive):**
- Confirmation modal (stays on Page 24)
- Changes user status

**Click "[View Details]":**
- Opens detailed profile (modal on Page 24)
- Shows:
  - Full user information
  - Activity history
  - Course enrollments
  - Content uploads (if trainer)
  - Permissions and settings

**Click user name "John Doe":**
- Opens detailed profile (same as View Details)

**Click email address:**
- Opens email composer (mailto: link or modal)

**Click "Courses: 3":**
- Shows enrolled courses list (modal)

**Click role badge "Learner":**
- Filters to show all users with that role (stays on Page 24)

#### 4️⃣ **User Details Modal/Expanded View**
```
When [View Details] is clicked:

┌──────────────────────────────────────┐
│ 👤 USER PROFILE: John Doe            │
│                                      │
│ 📋 BASIC INFORMATION                 │
│ Name: John Doe                       │
│ Email: john@example.com              │
│ Role: Learner                        │
│ Status: Active                       │
│ Member Since: Jan 15, 2026           │
│                                      │
│ 📚 ENROLLMENT & PROGRESS             │
│ Enrolled Courses: 3                  │
│ • Python 101 - 80% complete          │
│ • Data Science - 45% complete        │
│ • ML Basics - 20% complete           │
│                                      │
│ 📊 ACTIVITY METRICS                  │
│ Last Login: Today at 9:30 AM         │
│ Total Learning Time: 45.5 hours      │
│ AI Content Used: 234 items           │
│ Assessments Taken: 12                │
│                                      │
│ ⚙️ PERMISSIONS                       │
│ [View Uploaded Content] ←──────────┐│
│ [View Activity Log]                ││
│ [Edit User] [Reset Password]       ││
│ [Delete User] [Send Message]       ││
│                                     ││
│ [Close]                            ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Uploaded Content] ────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    Filtered to show content uploaded by this user
```

**Navigation from User Details:**

**Click "[View Uploaded Content]":**
- **→ Knowledge Base (Page 25)** filtered to this user's uploads
- Useful for trainers who upload content

**Click "[View Activity Log]":**
- Opens detailed activity log (modal or separate view)
- All actions: logins, course access, uploads, etc.

**Click "[Edit User]":**
- Opens edit form (stays in modal or Page 24)
- Can update user information

**Click "[Reset Password]":**
- Sends password reset email (stays on Page 24)
- Confirmation modal

**Click "[Delete User]":**
- Confirmation modal with warning (stays on Page 24)
- "This will remove all user data. Are you sure?"

**Click "[Send Message]":**
- Opens messaging interface (modal)

**Click course name in enrollment list:**
- Shows course details (modal)

**Click "[Close]":**
- Closes modal (back to Page 24 user list)

#### 5️⃣ **Bulk User Actions**
```
When users are selected:
☑ John Doe
☑ Jane Smith
☐ Bob Wilson

[Change Role] [Activate/Deactivate] [Export] [Delete]
                                                  │
       Clicks [Export] ────────────────────────────┘
                ↓
    Downloads CSV with selected users' data
    Stays on Page 24 with confirmation
```

**Navigation:**
- **Select + click "[Change Role]"** → Role selector (modal)
- **Select + click "[Activate/Deactivate]"** → Bulk status change (confirmation)
- **Select + click "[Export]"** → Downloads CSV (stays on Page 24)
- **Select + click "[Delete]"** → Bulk delete (strong confirmation required)

#### 6️⃣ **User Creation/Import**
```
When [+ Add New User] is clicked:

┌──────────────────────────────────────┐
│ ➕ Create New User                   │
│                                      │
│ Full Name: [___________________]     │
│ Email: [___________________]         │
│ Role: [Learner ▼]                   │
│ Password: [Auto-generate ●] [Manual]│
│                                      │
│ Assign Courses: (Optional)           │
│ [Browse Courses...] ←──────────────┐│
│                                     ││
│ Send Welcome Email: [☑]            ││
│                                     ││
│ [Cancel] [Create User]             ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Browse Courses...] ────────┘
                ↓
    Opens course selector (modal)
    Can select courses for initial enrollment
```

**Navigation:**

**Click "[Browse Courses...]":**
- Opens course selector (modal on Page 24)
- Select courses to auto-enroll new user

**Click "[Create User]":**
- Creates user (stays on Page 24)
- User appears in list with success message

**Click "[Cancel]":**
- Closes form (back to Page 24)

#### 7️⃣ **Pending Registration Approvals**
```
When approval is required:

┌──────────────────────────────────────┐
│ ⏳ PENDING APPROVALS (5)             │
│                                      │
│ Alice Brown                          │
│ Email: alice@company.com             │
│ Requested Role: Learner              │
│ Date: Feb 16, 2026                   │
│ [Approve] [Reject] [View Details] ←┐│
│                                     ││
│ Bob Wilson                          ││
│ Email: bob@company.com              ││
│ [Approve] [Reject] [View Details]  ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Approve] ─────────────────┘
                ↓
    Approves user registration (stays on Page 24)
    User moves to active users list
    Welcome email sent automatically
```

**Navigation:**

**Click "[Approve]":**
- Approves registration (stays on Page 24)
- User activated and welcome email sent

**Click "[Reject]":**
- Opens rejection form (modal)
- Can add reason, sends notification

**Click "[View Details]":**
- Shows registration request details (modal)

#### 8️⃣ **Activity and Audit Log**
```
┌──────────────────────────────────────┐
│ 📊 USER ACTIVITY OVERVIEW            │
│                                      │
│ Last 24 Hours:                       │
│ • New users: 12                      │
│ • Active sessions: 234               │
│ • Password resets: 3                 │
│                                      │
│ [View Detailed Activity Log →] ←───┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Opens comprehensive activity log
    Shows all user actions system-wide
```

**Navigation:**
- **Click "[View Detailed Activity Log →]"** → Opens audit log interface

#### 9️⃣ **Navigation to Content**
```
From user profile showing trainer's uploads:

"Dr. Smith has uploaded 45 content items"
[View Content in Knowledge Base →] ←────┐
                                         │
       Clicks link ──────────────────────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    Filtered to show Dr. Smith's uploads
```

**Navigation:**
- **Click content-related links** → Knowledge Base (Page 25) with context

#### 🔟 **Back Navigation**
- **Click "Dashboard"** → Admin Dashboard (Page 23)
- **Click logo** → Admin Dashboard (Page 23)
- **Click breadcrumb** → Admin Dashboard (Page 23)

---

## 📚 PAGE 25: Knowledge Base (Content Repository)
**Route:** `/admin/content`
**User Stories:** LTC #2-5, #8-9
**How you got here:** Clicked content metric from Dashboard OR user content link OR "Content" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **Content Overview Statistics**
```
┌──────────────────────────────────────┐
│ 📚 Knowledge Base Overview           │
│                                      │
│ Total Content Items: 3,456           │
│ • Videos: 245                        │
│ • Documents: 567                     │
│ • Transcripts: 234                   │
│ • Slides: 345                        │
│ • AI Generated: 1,245                │
│                                      │
│ Storage Used: 284 GB / 500 GB (57%) │
│                                      │
│ [View Storage Details] [Cleanup] ←─┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View Storage Details] ────┘
                ↓
    Expands storage breakdown (stays on Page 25)
    Shows storage by type, size, usage trends
```

**Navigation:**

**Click content type (e.g., "Videos: 245"):**
- Filters content list to that type (stays on Page 25)

**Click "AI Generated: 1,245":**
- Filters to AI-generated content (stays on Page 25)

**Click "[View Storage Details]":**
- Expands storage management panel (stays on Page 25)
- Shows: largest files, unused content, cleanup recommendations

**Click "[Cleanup]":**
- Opens cleanup wizard (modal on Page 25)
- Identify and remove: duplicates, unused, orphaned content

#### 2️⃣ **Search and Filter Interface**
```
┌──────────────────────────────────────┐
│ [Search content...] [Filters ▼]     │
│                                      │
│ [All] [Videos] [Documents] [Audio]  │
│ [AI Generated] [Transcripts]         │
│                                      │
│ Sort by: [Date ▼] [Size ▼] [Type ▼] │
└──────────────────────────────────────┘
```

**Navigation:**
- **Type search** → Filters results (stays on Page 25)
- **Click filter tabs** → Shows filtered content (stays on Page 25)
- **Click "[Filters ▼]"** → Advanced filters:
  - By uploader, course, date range, size, usage, AI status

#### 3️⃣ **Content List with Items**
```
┌──────────────────────────────────────┐
│ 📹 Python Functions Lecture          │
│ Type: Video | Size: 245 MB           │
│ Uploaded: Feb 10, 2026               │
│ By: Dr. Smith (Trainer)              │
│ Used in: Python 101 - Ch 3           │
│ Views: 120 | AI Enhanced: ✅         │
│                                      │
│ [Preview] [Edit] [Download] [Delete]│
│ [View AI Processing] ←─────────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View AI Processing] ───────┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Shows AI processing details for this content
```

**Navigation from Content Items:**

**Click "[Preview]":**
- Opens preview modal (stays on Page 25)
- Plays video, shows document, etc.

**Click "[Edit]":**
- Opens content editor (modal on Page 25)
- Can update: title, description, metadata, course assignment

**Click "[Download]":**
- Downloads file (stays on Page 25)

**Click "[Delete]":**
- Confirmation modal (stays on Page 25)
- "This content is used in 3 courses. Are you sure?"
- Shows impact before deletion

**Click "[View AI Processing]":**
- **→ AI Configuration (Page 26)** showing this item's AI processing history
- What was generated, when, success/failures

**Click content title:**
- Opens detailed view (modal on Page 25)
- Shows full metadata, usage, statistics

**Click uploader name "Dr. Smith":**
- **→ User Management (Page 24)** showing Dr. Smith's profile

**Click "Used in: Python 101":**
- Shows course details (modal)
- Or links to course management interface

#### 4️⃣ **Content Details Modal**
```
When content title is clicked:

┌──────────────────────────────────────┐
│ 📹 CONTENT DETAILS                   │
│                                      │
│ Title: Python Functions Lecture      │
│ Type: Video (MP4)                    │
│ Size: 245 MB                         │
│ Duration: 45:30                      │
│                                      │
│ 📊 USAGE STATISTICS                  │
│ Total Views: 120                     │
│ Used in Courses: 2                   │
│ • Python 101 - Chapter 3             │
│ • Advanced Python - Chapter 1        │
│                                      │
│ 🤖 AI ENHANCEMENTS                   │
│ • Transcript: ✅ Generated          │
│ • Audio Summary: ✅ Generated       │
│ • Video Explainer: ✅ Generated     │
│ [View AI Details →] ←──────────────┐│
│                                     ││
│ 👤 UPLOADED BY                      ││
│ Dr. Smith (Trainer)                 ││
│ Date: Feb 10, 2026 at 2:30 PM       ││
│ [View User Profile →]              ││
│                                     ││
│ [Edit Metadata] [Reprocess AI]     ││
│ [Delete Content] [Close]           ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View AI Details →] ─────────┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Shows AI processing for this content
```

**Navigation from Content Details:**

**Click "[View AI Details →]":**
- **→ AI Configuration (Page 26)** with this content's AI history

**Click "[View User Profile →]":**
- **→ User Management (Page 24)** showing uploader's profile

**Click course name in "Used in Courses":**
- Shows course details (modal)

**Click "[Edit Metadata]":**
- Opens editor (stays in modal)

**Click "[Reprocess AI]":**
- **→ AI Configuration (Page 26)** to trigger reprocessing
- OR triggers processing and stays on Page 25

**Click "[Delete Content]":**
- Confirmation with impact warning (stays on Page 25)

**Click "[Close]":**
- Closes modal (back to Page 25 content list)

#### 5️⃣ **Bulk Content Actions**
```
When content items are selected:
☑ Python Functions Lecture
☑ Variables Explained
☐ Loop Syntax Guide

[Download Selected] [Delete Selected] [Reprocess AI]
[Move to Course] [Export Metadata] ←─────────────┐
                                                  │
       Clicks [Reprocess AI] ─────────────────────┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Queues selected items for AI reprocessing
```

**Navigation:**
- **Select + click "[Download Selected]"** → Downloads zip (stays on Page 25)
- **Select + click "[Delete Selected]"** → Bulk delete confirmation
- **Select + click "[Reprocess AI]"** → AI Configuration (Page 26) with bulk job
- **Select + click "[Move to Course]"** → Course selector (modal)
- **Select + click "[Export Metadata]"** → Downloads metadata CSV

#### 6️⃣ **Upload New Content**
```
┌──────────────────────────────────────┐
│ [+ Upload New Content]               │
│ [+ Bulk Upload] [+ Import from URL]  │
└──────────────────────────────────────┘
         │            │            │
         ↓            ↓            ↓
    Single upload  Multi-file   URL import
      (modal)       (modal)      (modal)
```

**Navigation:**

**Click "[+ Upload New Content]":**
- Opens upload form (modal on Page 25)
- Single file upload with metadata

**Click "[+ Bulk Upload]":**
- Opens bulk upload wizard (modal on Page 25)
- Multi-file drag & drop, batch metadata

**Click "[+ Import from URL]":**
- Opens URL import form (modal on Page 25)
- Import from YouTube, Vimeo, cloud storage

#### 7️⃣ **Storage Management**
```
When [View Storage Details] is expanded:

┌──────────────────────────────────────┐
│ 💾 STORAGE MANAGEMENT                │
│                                      │
│ Total: 284 GB / 500 GB (57%)         │
│ [Progress bar]                       │
│                                      │
│ BY TYPE:                             │
│ • Videos: 198 GB (70%)               │
│ • Documents: 45 GB (16%)             │
│ • Audio: 28 GB (10%)                 │
│ • Other: 13 GB (4%)                  │
│                                      │
│ RECOMMENDATIONS:                     │
│ • 12 unused files (8 GB) [Delete]    │
│ • 5 duplicates found (3 GB) [Clean] │
│ • 45 files not in any course [Review]│
│                                      │
│ [Run Full Cleanup Wizard] ←────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Run Full Cleanup Wizard] ─┘
                ↓
    Opens cleanup wizard (modal on Page 25)
    Step-by-step: identify, review, delete
```

**Navigation:**
- **Click "[Delete]" or "[Clean]"** → Cleanup action (stays on Page 25)
- **Click "[Review]"** → Shows orphaned files (stays on Page 25)
- **Click "[Run Full Cleanup Wizard]"** → Guided cleanup process (modal)

#### 8️⃣ **Content Processing Queue**
```
┌──────────────────────────────────────┐
│ ⚙️ PROCESSING QUEUE                  │
│                                      │
│ Items awaiting AI processing: 5      │
│ • Python Intro - Transcript pending  │
│ • Data Types - Audio generating...   │
│ • Loops Video - Queued               │
│                                      │
│ [View AI Processing Queue →] ←─────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks button ───────────────────┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Shows full processing queue and status
```

**Navigation:**
- **Click "[View AI Processing Queue →]"** → AI Configuration (Page 26)
- **Click individual item** → Shows processing details

#### 9️⃣ **Content Analytics**
```
┌──────────────────────────────────────┐
│ 📊 CONTENT ANALYTICS                 │
│                                      │
│ Most Viewed (Last 30 days):          │
│ 1. Python Functions (245 views)      │
│ 2. Data Types Intro (198 views)      │
│ 3. Loop Syntax (167 views)           │
│                                      │
│ Least Used: 45 items (0 views)       │
│ [View Unused Content →]              │
│                                      │
│ AI Content Performance:              │
│ • Success Rate: 98%                  │
│ • Avg Generation Time: 8.5 min       │
│ [View AI Statistics →] ←───────────┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [View AI Statistics →] ─────┘
                ↓
    Goes to: AI CONFIGURATION (Page 26)
    Shows comprehensive AI performance metrics
```

**Navigation:**
- **Click content name** → Shows that content's details (modal)
- **Click "[View Unused Content →]"** → Filters to show unused (stays on Page 25)
- **Click "[View AI Statistics →]"** → AI Configuration (Page 26)

#### 🔟 **Back Navigation**
- **Click "Dashboard"** → Admin Dashboard (Page 23)
- **Click "Users"** → User Management (Page 24)
- **Click logo** → Admin Dashboard (Page 23)

---

## 🤖 PAGE 26: AI Configuration (AI Settings)
**Route:** `/admin/ai-config`
**User Stories:** LTC #10-12
**How you got here:** Clicked AI status from Dashboard OR AI processing link from Knowledge Base OR "AI Config" from sidebar

### Clickable Elements → Destinations:

#### 1️⃣ **AI Services Overview**
```
┌──────────────────────────────────────┐
│ 🤖 AI Services Configuration         │
│                                      │
│ SERVICE STATUS:                      │
│ • Azure Neural TTS: 🟢 Active        │
│ • Synthesia Video: 🟢 Active         │
│ • NLP Processing: 🟢 Active          │
│ • OpenAI GPT: 🟢 Active              │
│                                      │
│ API Credits Remaining:               │
│ • TTS: 4,567 minutes                 │
│ • Video: 234 minutes                 │
│ • GPT: 12,345 tokens                 │
│                                      │
│ [Configure Services] [View Logs] ←─┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Configure Services] ───────┘
                ↓
    Opens service configuration panel
    Stays on Page 26, shows settings for each service
```

**Navigation:**

**Click service name or status:**
- Expands service details (stays on Page 26)
- Shows: API keys (masked), endpoints, configuration

**Click "[Configure Services]":**
- Opens configuration panel (stays on Page 26)
- Can update: API keys, settings, preferences

**Click "[View Logs]":**
- Shows API logs (expands on Page 26 or modal)
- Success/failure rates, errors, response times

**Click credit amounts:**
- Shows usage history and trends (expands on Page 26)

#### 2️⃣ **Processing Queue**
```
┌──────────────────────────────────────┐
│ ⚙️ PROCESSING QUEUE                  │
│                                      │
│ Queued: 5 jobs                       │
│ • Python Intro - Transcript [Pending]│
│ • Data Types - Audio [Processing 45%]│
│ • Loops - Video [Queued]             │
│ • Functions - Walkthrough [Queued]   │
│ • Variables - Summary [Queued]       │
│                                      │
│ Processing: 3 jobs                   │
│ • Advanced Functions - Video [78%]   │
│ • ML Intro - Audio [22%]             │
│ • Data Viz - Transcript [91%]        │
│                                      │
│ [View Queue Details] [Pause All] ←─┐│
│ [Clear Completed]                   ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Queue Details] ────────┘
                ↓
    Expands detailed queue view (stays on Page 26)
    Shows: time estimates, priorities, settings
```

**Navigation:**

**Click job item:**
- Shows job details (expands on Page 26 or modal)
- Settings used, progress, logs, estimated completion

**Click "[View Queue Details]":**
- Expands full queue view (stays on Page 26)

**Click "[Pause All]":**
- Pauses all processing (stays on Page 26)
- Confirmation modal

**Click "[Clear Completed]":**
- Removes completed jobs from view (stays on Page 26)

**Click job content name (e.g., "Python Intro"):**
- **→ Knowledge Base (Page 25)** showing that content item

#### 3️⃣ **Job Details - Expanded View**
```
When job is clicked:

┌──────────────────────────────────────┐
│ 📋 JOB DETAILS                       │
│                                      │
│ Content: Python Functions Lecture    │
│ Job Type: Video Explainer Generation │
│ Status: Processing (78%)             │
│ Started: 2:15 PM                     │
│ Est. Completion: 2:28 PM (13 min left)│
│                                      │
│ SETTINGS:                            │
│ • Voice: Professional                │
│ • Duration: Medium (10 minutes)      │
│ • Avatar: Female instructor          │
│ • Style: Beginner-friendly           │
│                                      │
│ LOGS:                                │
│ 2:15 PM - Job queued                 │
│ 2:16 PM - Analysis complete          │
│ 2:18 PM - Script generated           │
│ 2:22 PM - Video rendering (current)  │
│                                      │
│ [Pause Job] [Cancel Job]             │
│ [View Source Content] ←────────────┐│
│ [Close]                            ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Source Content] ───────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    Shows the source content for this AI job
```

**Navigation from Job Details:**

**Click "[Pause Job]":**
- Pauses this job (stays on Page 26)

**Click "[Cancel Job]":**
- Cancels job with confirmation (stays on Page 26)

**Click "[View Source Content]":**
- **→ Knowledge Base (Page 25)** showing original content

**Click "[Close]":**
- Closes details view (back to Page 26 queue list)

#### 4️⃣ **Processing History**
```
┌──────────────────────────────────────┐
│ 📊 PROCESSING HISTORY (Last 30 days) │
│                                      │
│ Total Jobs: 1,245                    │
│ • Completed: 1,220 (98%) ✅          │
│ • Failed: 25 (2%) ⚠️                │
│                                      │
│ By Type:                             │
│ • Audio: 456 jobs                    │
│ • Video: 389 jobs                    │
│ • Transcripts: 234 jobs              │
│ • Walkthroughs: 166 jobs             │
│                                      │
│ [View Failed Jobs] [View All] ←────┐│
│ [Export Report]                    ││
└──────────────────────────────────────┘│
                                        │
       Clicks [View Failed Jobs] ──────────┘
                ↓
    Filters to show failed jobs (stays on Page 26)
    For troubleshooting and retry
```

**Navigation:**

**Click "[View Failed Jobs]":**
- Shows failed jobs list (stays on Page 26)
- Can retry, view errors, investigate

**Click "[View All]":**
- Shows complete history (stays on Page 26)
- Can filter by type, date, status

**Click "[Export Report]":**
- Downloads processing report (CSV/PDF) (stays on Page 26)

**Click job type count (e.g., "Audio: 456 jobs"):**
- Filters history to that type (stays on Page 26)

#### 5️⃣ **AI Service Configuration**
```
When [Configure Services] is clicked:

┌──────────────────────────────────────┐
│ ⚙️ SERVICE CONFIGURATION             │
│                                      │
│ ▼ Azure Neural TTS                   │
│   API Key: **********************xyz │
│   Region: East US                    │
│   Voice Library: 24 voices           │
│   [Test Connection] [Update]         │
│                                      │
│ ▼ Synthesia Video API                │
│   API Key: **********************abc │
│   Avatar Library: 12 avatars         │
│   [Test Connection] [Update]         │
│                                      │
│ ▼ OpenAI GPT API                     │
│   API Key: **********************gpt │
│   Model: GPT-4                       │
│   [Test Connection] [Update]         │
│                                      │
│ ▼ NLP Processing                     │
│   Engine: SpaCy + Transformers       │
│   [Configure] [Update]               │
│                                      │
│ [Save All Changes]                   │
└──────────────────────────────────────┘
```

**Navigation:**

**Click "[Test Connection]":**
- Tests API connection (stays on Page 26)
- Shows success/failure message

**Click "[Update]":**
- Opens API key update form (modal)
- Security confirmation required

**Click "[Configure]":**
- Opens detailed configuration (expands on Page 26)
- Advanced settings for that service

**Click "[Save All Changes]":**
- Saves configuration (stays on Page 26)
- Restarts affected services

**Click section header to expand/collapse:**
- Toggles section (stays on Page 26)

#### 6️⃣ **AI Generation Settings**
```
┌──────────────────────────────────────┐
│ 🎛️ GENERATION SETTINGS               │
│                                      │
│ DEFAULT SETTINGS FOR NEW JOBS:       │
│                                      │
│ Audio Generation:                    │
│ • Default Voice: [Professional ▼]   │
│ • Default Length: [Medium ▼]        │
│ • Auto-generate transcripts: [☑]    │
│                                      │
│ Video Generation:                    │
│ • Default Avatar: [Male instructor ▼]│
│ • Default Style: [Beginner ▼]       │
│ • Include captions: [☑]             │
│                                      │
│ Walkthrough Generation:              │
│ • Default Steps: [10 ▼]             │
│ • Include code samples: [☑]         │
│ • Interactive mode: [☑]             │
│                                      │
│ Processing Priority:                 │
│ ● Transcripts first                  │
│ ○ Audio first                        │
│ ○ Videos first                       │
│ ○ Equal priority                     │
│                                      │
│ [Save Settings]                      │
└──────────────────────────────────────┘
```

**Navigation:**
- **Change settings** → Updates defaults (stays on Page 26)
- **Click "[Save Settings]"** → Saves configuration (stays on Page 26)
- Settings apply to all new AI generation jobs

#### 7️⃣ **Usage Statistics and Analytics**
```
┌──────────────────────────────────────┐
│ 📊 AI USAGE ANALYTICS                │
│                                      │
│ THIS MONTH:                          │
│ • API Calls: 12,345                  │
│ • Processing Time: 1,234 hours       │
│ • Cost: $4,567 / $10,000 budget      │
│ • Average Job Time: 8.5 minutes      │
│                                      │
│ [View Detailed Analytics]            │
│ [View Cost Breakdown]                │
│ [Set Budget Alerts]                  │
│                                      │
│ PERFORMANCE METRICS:                 │
│ • Success Rate: 98% ✅               │
│ • Avg Quality Score: 4.5/5 ⭐        │
│ • User Satisfaction: 92%             │
│                                      │
│ [View Quality Reports] [Export] ←──┐│
└──────────────────────────────────────┘│
                                        │
       Clicks [Export] ──────────────────┘
                ↓
    Downloads analytics report (stays on Page 26)
    PDF with charts, metrics, trends
```

**Navigation:**
- **Click "[View Detailed Analytics]"** → Expands analytics (stays on Page 26)
- **Click "[View Cost Breakdown]"** → Shows cost by service type (stays on Page 26)
- **Click "[Set Budget Alerts]"** → Configure spending alerts (modal)
- **Click "[View Quality Reports]"** → Shows quality metrics (stays on Page 26)
- **Click "[Export]"** → Downloads report (stays on Page 26)

#### 8️⃣ **Error Log and Troubleshooting**
```
┌──────────────────────────────────────┐
│ ⚠️ ERROR LOG (25 failures, 2%)      │
│                                      │
│ Recent Errors:                       │
│ • Feb 17, 2:30 PM - Video generation │
│   failed: API timeout               │
│   [Retry] [Details] ←──────────────┐│
│                                     ││
│ • Feb 17, 1:15 PM - Audio generation ││
│   failed: Invalid input format      ││
│   [Retry] [Details]                ││
│                                     ││
│ • Feb 16, 11:45 PM - Transcript     ││
│   failed: API quota exceeded        ││
│   [Details]                        ││
│                                     ││
│ [View All Errors] [Clear Log]      ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Details] ─────────────────┘
                ↓
    Shows error details (modal on Page 26)
    Full error message, stack trace, troubleshooting
```

**Navigation:**

**Click "[Retry]":**
- Retries failed job (stays on Page 26)
- Adds to queue with same settings

**Click "[Details]":**
- Shows error details (modal on Page 26)
- Error message, content info, troubleshooting steps

**Click "[View All Errors]":**
- Shows complete error history (stays on Page 26)

**Click "[Clear Log]":**
- Clears error log (confirmation modal)

#### 9️⃣ **Manual Job Creation**
```
┌──────────────────────────────────────┐
│ ➕ MANUAL JOB CREATION               │
│                                      │
│ Create new AI generation job:        │
│                                      │
│ Select Content: [Browse...] ←──────┐│
│ Generation Type: [Audio ▼]         ││
│ Settings: [Use defaults / Custom]   ││
│ Priority: [Normal ▼]               ││
│                                     ││
│ [Create Job]                       ││
└──────────────────────────────────────┘│
                                        │
       Clicks [Browse...] ───────────────┘
                ↓
    Goes to: KNOWLEDGE BASE (Page 25)
    To select source content for AI processing
```

**Navigation:**

**Click "[Browse...]":**
- **→ Knowledge Base (Page 25)** to select content
- After selection → Returns to Page 26 with content selected

**Click "[Create Job]":**
- Creates and queues job (stays on Page 26)
- Appears in processing queue

#### 🔟 **Integration and Webhooks**
```
┌──────────────────────────────────────┐
│ 🔗 INTEGRATIONS                      │
│                                      │
│ Webhooks:                            │
│ • Job completion notifications       │
│ • Error alerts                       │
│ [Configure Webhooks]                 │
│                                      │
│ External Integrations:               │
│ • Microsoft Teams: Connected ✅      │
│ • Slack: Not connected              │
│ • Email: Configured ✅              │
│ [Manage Integrations]                │
└──────────────────────────────────────┘
```

**Navigation:**
- **Click "[Configure Webhooks]"** → Webhook settings (modal or expands)
- **Click "[Manage Integrations]"** → Integration management (expands on Page 26)

#### ⓫ **Back Navigation**
- **Click "Dashboard"** → Admin Dashboard (Page 23)
- **Click "Content"** → Knowledge Base (Page 25)
- **Click "Users"** → User Management (Page 24)
- **Click logo** → Admin Dashboard (Page 23)

---

## 🚪 LOGOUT Flow

### From Any Admin Page → Logout

```
Any Admin Page
    │
    ↓
Click Profile Icon (top right) 👤
    │
    ↓
Dropdown Menu Opens
    │
    ├─ Admin Profile
    ├─ System Settings
    ├─ Help & Documentation
    ├─ [Logout] ←────────┐
    │                     │
    └─────────────────────┘
            │
            ↓
    Confirmation Modal (optional)
    "Are you sure you want to logout?"
    "Active AI jobs will continue processing"
    [Cancel] [Logout]
            │
            ↓
    Logs out, clears session
    Audit log records logout
            │
            ↓
    Goes to: LOGIN PAGE (Page 1)
```

**Logout Notes:**
- **AI processing continues** in background after logout
- **System monitoring is uninterrupted**
- **Audit log tracks** admin logout for security
- **Can resume** administrative tasks after re-login

---

## 🗺️ COMPLETE ADMIN JOURNEY MAPS

### **Journey 1: Routine System Check and User Management**

```
1. Login (Page 1)
       ↓
2. Admin Dashboard (Page 23)
   - Morning system check
   - Reviews platform statistics
   - Total Users: 500 (up from 495 yesterday ✅)
   - AI Generations: 12,345 (normal levels)
   - System Health: All green ✅
   - Sees "5 user registration requests pending"
   - Clicks "[View User Management →]"
       ↓
3. User Management (Page 24)
   - Shows all 500 users
   - Clicks "[Review]" on Pending Approvals
   - Filters to show 5 pending requests
   - Reviews first request:
     • Alice Brown, requesting Learner role
     • Email: alice@company.com
     • Date: Feb 16, 2026
   - Clicks "[View Details]"
   - Modal shows full registration info
   - Looks legitimate
   - Clicks "[Approve]"
   - User approved, welcome email sent ✅
   - Reviews remaining 4 requests
   - Approves 3, rejects 1 (suspicious email)
   - All pending requests handled
   - Notices some inactive users
   - Filters to "Inactive: 266"
   - Sorts by "Last Login" (oldest first)
   - Sees 12 users inactive for 6+ months
   - Selects them (bulk selection)
   - Clicks "[Deactivate]"
   - Confirmation: "This will free up 12 licenses"
   - Confirms deactivation
   - Clicks "Dashboard" to return
       ↓
4. Admin Dashboard (Page 23)
   - User management complete
   - Now checks AI processing status
   - Sees "Queued: 5 jobs, Processing: 3 jobs"
   - All normal, no errors
   - Quick check complete
   - Logout
       ↓
5. Login (Page 1) - Session ended
```

---

### **Journey 2: Content Management and AI Processing Issue**

```
1. Login (Page 1)
       ↓
2. Admin Dashboard (Page 23)
   - Reviews system status
   - Notices alert: "⚠️ Storage at 78%"
   - Approaching limit, needs attention
   - Clicks "[Manage Content →]"
       ↓
3. Knowledge Base (Page 25)
   - Shows 3,456 content items
   - Storage: 284 GB / 500 GB (57%)
   - Wait, dashboard said 78%? Checks details
   - Clicks "[View Storage Details]"
   - Expands storage breakdown:
     • Videos: 198 GB (70%)
     • Actually at 284 GB = 57% (dashboard was projecting)
   - Still, should clean up old content
   - Sees recommendation: "12 unused files (8 GB)"
   - Clicks "[Delete]" on unused files
   - Removes 12 unused files
   - Sees: "5 duplicates found (3 GB)"
   - Clicks "[Clean]"
   - Removes duplicate files
   - Freed 11 GB total ✅
   - Now reviews AI-generated content
   - Filters to "AI Generated: 1,245"
   - Sorts by date
   - Sees old AI content from last year
   - Clicks one: "Python Basics Audio"
   - Created: Jan 2025 (over 1 year old)
   - Last viewed: March 2025 (10 months ago)
   - Unused, outdated
   - Clicks "[View AI Processing]"
       ↓
4. AI Configuration (Page 26)
   - Shows processing history for that content
   - Generated successfully Jan 2025
   - Never reprocessed
   - Content quality may be outdated (AI improved since then)
   - Returns to Knowledge Base
   - Clicks "Back"
       ↓
5. Knowledge Base (Page 25)
   - Decides to bulk-reprocess old AI content
   - Filters to: AI Generated + Created before March 2025
   - Finds 234 old AI content items
   - Selects top 20 most-used items
   - Clicks "[Reprocess AI]"
       ↓
6. AI Configuration (Page 26)
   - 20 jobs added to queue
   - Shows: "Queued: 25 jobs (20 new)"
   - Will regenerate with improved AI models
   - Monitors queue briefly
   - Processing looks healthy
   - Clicks "Dashboard"
       ↓
7. Admin Dashboard (Page 23)
   - Storage cleaned up ✅
   - AI reprocessing underway ✅
   - Will check back later
   - Logout
```

---

### **Journey 3: Investigating and Resolving AI Processing Failure**

```
1. Login (Page 1)
       ↓
2. Admin Dashboard (Page 23)
   - Reviews system health
   - Sees alert: "⚠️ AI Processing: 5 failed jobs"
   - Unusual, normally 100% success rate
   - Needs investigation
   - Clicks "View AI Configuration →"
       ↓
3. AI Configuration (Page 26)
   - Shows AI Services status
   - All services: 🟢 Active (good)
   - Scrolls to Processing History
   - Failed: 25 (2%) - hmm, more than alert showed
   - Clicks "[View Failed Jobs]"
   - Filters to show 25 failed jobs
   - Most recent: 5 failures in last 2 hours
   - Older failures from days ago
   - Focuses on recent ones
   - Clicks first failed job: "[Details]"
       ↓
4. Error Details Modal (Page 26)
   - Job: Video generation for "Data Structures"
   - Error: "API timeout - Synthesia service unavailable"
   - Timestamp: 2:30 PM today
   - Clicks "[Close]"
   - Checks next failure: same error, same time
   - All 5 failures: Synthesia API timeout
   - Issue with video API service
   - Clicks "Azure Neural TTS" status to compare
   - Shows: 🟢 Active, no errors
   - So only Synthesia having issues
   - Clicks "[View Logs]"
       ↓
5. API Logs View (expanded on Page 26)
   - Shows Synthesia API calls:
     • 2:25 PM - Success (200 OK)
     • 2:28 PM - Success (200 OK)
     • 2:30 PM - Timeout (504 Gateway Timeout)
     • 2:32 PM - Timeout (504)
     • 2:35 PM - Timeout (504)
     • 2:40 PM - Success (200 OK)
   - Pattern: 3 timeouts between 2:30-2:35 PM
   - Temporary API issue, now resolved
   - Clicks back to failed jobs list
   - Selects all 5 video generation failures
   - Clicks "[Retry]"
   - Jobs re-added to queue
   - Queue now shows: "Queued: 10 jobs"
   - 5 retried jobs + 5 normal jobs
   - Monitors for a few minutes
   - All processing successfully ✅
   - Resolved!
   - Clicks "Dashboard"
       ↓
6. Admin Dashboard (Page 23)
   - Alert cleared
   - AI services healthy
   - Issue resolved by retrying ✅
   - Logout
```

---

### **Journey 4: Complete Platform Maintenance Workflow**

```
1. Login (Page 1)
       ↓
2. Admin Dashboard (Page 23)
   - Weekly comprehensive review
   - Checks all metrics systematically
   - Platform Statistics:
     • Total Users: 500 ✅
     • Active Courses: 24 ✅
     • Content Items: 3,456
     • AI Generations: 12,345
   - System Health: All green ✅
   - Clicks "[View Details →]" on users
       ↓
3. User Management (Page 24)
   - Reviews user statistics:
     • Learners: 450
     • Trainers: 45
     • Leadership: 5
   - Downloads user list for records
   - Clicks "[Export]"
   - CSV downloaded
   - Checks for pending approvals: 0 ✅
   - Good, all processed
   - Reviews recent activity
   - Last 24 hours: 12 new users (healthy growth)
   - Clicks "Content" in sidebar
       ↓
4. Knowledge Base (Page 25)
   - Reviews content repository
   - 3,456 items (growing steadily)
   - Checks storage: 284 GB / 500 GB (57%)
   - Plenty of space ✅
   - Reviews content by type:
     • Videos: 245 ✅
     • AI Generated: 1,245 ✅
   - Clicks random content item to spot-check
   - "Python Functions Lecture"
   - Clicks "[Preview]"
   - Plays video in modal - quality good ✅
   - Closes preview
   - Clicks "[View AI Processing]" on that content
       ↓
5. AI Configuration (Page 26)
   - Shows processing history for that video:
     • Original upload: Feb 10, 2026
     • Transcript generated: Feb 10, 2026 (2 min)
     • Audio summary: Feb 10, 2026 (5 min)
     • Video explainer: Feb 10, 2026 (12 min)
   - All successful ✅
   - Closes details
   - Reviews overall AI health:
     • Queue: 5 queued, 3 processing ✅
     • Success Rate: 98% ✅
     • Avg Job Time: 8.5 minutes ✅
   - Checks API credits:
     • TTS: 4,567 minutes remaining
     • Video: 234 minutes remaining ⚠️
   - Video credits low! Need to add more
   - Clicks "Configure Services"
   - Expands Synthesia Video settings
   - Notes: "Need to purchase additional credits"
   - Clicks outside admin panel task
   - Makes note to contact procurement
   - Back to review
   - Checks this month's costs:
     • $4,567 / $10,000 budget (46%) ✅
   - On track, budget healthy
   - Reviews error log: 25 failures (2%)
   - All from that temporary Synthesia issue (already resolved)
   - Everything looks good
   - Clicks "Dashboard"
       ↓
6. Admin Dashboard (Page 23)
   - Complete platform review done:
     ✅ Users: Healthy, growing
     ✅ Content: Well managed, plenty of storage
     ✅ AI: Processing smoothly
     ⚠️ Action needed: Add video API credits
   - Weekly maintenance complete
   - Logout
       ↓
7. Login (Page 1) - Session ended
   - Platform in excellent health
   - One action item for next week
```

---

### **Journey 5: Emergency Response - Storage Full**

```
1. Login (Page 1)
       ↓
2. Admin Dashboard (Page 23)  
   - Emergency alert: "🔴 Storage at 95% - URGENT"
   - Critical situation!
   - Clicks "[Manage Content →]" immediately
       ↓
3. Knowledge Base (Page 25)
   - Storage: 475 GB / 500 GB (95%) 🔴
   - Only 25 GB remaining
   - System will stop working at 100%
   - Clicks "[View Storage Details]"
   - Expands breakdown:
     • Videos: 345 GB (73%) - huge increase!
     • Documents: 78 GB
     • Audio: 42 GB
     • Other: 10 GB
   - Videos are the problem
   - Sees recommendations:
     • 45 unused files (28 GB) [Delete]
     • 12 duplicates (15 GB) [Clean]
   - Clicks "[Delete]" on unused
   - Removes 45 unused files - freed 28 GB
   - Now at: 447 GB (89%) - better but not enough
   - Clicks "[Clean]" on duplicates
   - Removes 12 duplicates - freed 15 GB
   - Now at: 432 GB (86%) - improved!
   - Still need more space
   - Clicks "[Run Full Cleanup Wizard]"
       ↓
4. Cleanup Wizard Modal (Page 25)
   - Step 1: Identify large old files
   - Finds: 234 videos over 6 months old, rarely viewed
   - Shows details: total 89 GB
   - Step 2: Review for deletion
   - Identifies 50 truly unused videos (32 GB)
   - Marks for deletion
   - Step 3: Archive options
   - "Move to cold storage" (cheaper, slower access)
   - Marks 100 old videos for archival (45 GB)
   - Step 4: Confirm
   - Will free: 32 GB (deleted) + 45 GB (archived) = 77 GB
   - Clicks "[Execute Cleanup]"
   - Processing... 
   - Complete! ✅
   - New storage: 355 GB / 500 GB (71%)
   - Crisis averted!
   - Closes wizard
       ↓
5. Knowledge Base (Page 25)
   - Storage healthy now: 71%
   - Sets up alert for future
   - Clicks "Settings" (if available)
   - Configures: "Alert at 80% storage"
   - Returns to Dashboard
       ↓
6. Admin Dashboard (Page 23)
   - Alert cleared
   - Storage: 355 GB / 500 GB (71%) ✅
   - Emergency resolved
   - Sends note to team: "Storage cleaned, monitor uploads"
   - Logout
```

---

## 🎯 Navigation Summary by Page

### Quick Reference: "Click X → Go to Y"

| From Page | Click Element | Go To Page |
|-----------|---------------|------------|
| **Admin Dashboard (23)** | View Details (Users) | User Management (24) |
| **Admin Dashboard (23)** | Total Users / New registrations | User Management (24) |
| **Admin Dashboard (23)** | Manage Content | Knowledge Base (25) |
| **Admin Dashboard (23)** | Content Items | Knowledge Base (25) |
| **Admin Dashboard (23)** | View AI Configuration | AI Configuration (26) |
| **Admin Dashboard (23)** | AI Generations / Queue status | AI Configuration (26) |
| | |
| **User Management (24)** | View Uploaded Content | Knowledge Base (25) |
| **User Management (24)** | Browse Courses | Course selector modal |
| **User Management (24)** | View Activity Log | Audit log view |
| | |
| **Knowledge Base (25)** | View AI Processing | AI Configuration (26) |
| **Knowledge Base (25)** | Uploader name | User Management (24) |
| **Knowledge Base (25)** | Reprocess AI | AI Configuration (26) |
| **Knowledge Base (25)** | View Processing Queue | AI Configuration (26) |
| **Knowledge Base (25)** | Browse Courses (job creation) | Course selector |
| | |
| **AI Configuration (26)** | View Source Content | Knowledge Base (25) |
| **AI Configuration (26)** | Content name in job | Knowledge Base (25) |
| **AI Configuration (26)** | Browse content (manual job) | Knowledge Base (25) |
| **AI Configuration (26)** | View user (in logs) | User Management (24) |
| | |
| **Any Page** | Logo | Admin Dashboard (23) |
| **Any Page** | Dashboard sidebar | Admin Dashboard (23) |
| **Any Page** | Users sidebar | User Management (24) |
| **Any Page** | Content sidebar | Knowledge Base (25) |
| **Any Page** | AI Config sidebar | AI Configuration (26) |
| **Any Page** | Profile → Logout | Login (1) |

---

## 💡 Key Navigation Patterns

### 1. **The System Health Check**
```
Dashboard (overview) → Identify issues → 
Navigate to specific management area → 
Address problem → Return to Dashboard
```

### 2. **The User Management Flow**
```
Dashboard (User stats) → User Management (approve/manage) →
View user content → Knowledge Base →
Check AI processing → AI Configuration
```

### 3. **The Content Management Loop**
```
Dashboard (Content alerts) → Knowledge Base (manage content) →
View AI processing → AI Configuration (monitor jobs) →
Return to Knowledge Base (verify)
```

### 4. **The AI Troubleshooting Pattern**
```
Dashboard (AI alert) → AI Configuration (investigate) →
Find problematic content → Knowledge Base (review) →
Fix and retry → AI Configuration (monitor)
```

### 5. **The Complete Audit Trail**
```
Dashboard → User Management (user action) →
Content they uploaded (Knowledge Base) →
AI jobs triggered (AI Configuration) →
Full activity trace
```

---

## 🔄 Always Available Navigation

No matter which admin page you're on, you can always:

1. **Go Home:** Click logo or "Dashboard" → Admin Dashboard (Page 23)
2. **Manage Users:** Click "Users" → User Management (Page 24)
3. **Manage Content:** Click "Content" → Knowledge Base (Page 25)
4. **Configure AI:** Click "AI Config" → AI Configuration (26)
5. **Search:** Use global search for users, content, or courses
6. **Alerts:** Check notification icon for system alerts
7. **Logout:** Profile → Logout → Login (Page 1)

---

## 🎯 Admin-Specific Features

### System-Wide Control
- **All users manageable** from one place
- **All content visible** and editable
- **All AI jobs controllable** (pause, cancel, retry)
- **Complete audit trail** of all actions

### Critical Operations
- **User approvals/rejections** - Control platform access
- **Content deletion** - Permanent removal with warnings
- **AI service configuration** - Platform-wide settings
- **Storage management** - Critical for system health

### Monitoring and Alerting
- **Real-time status** of all services
- **Proactive alerts** for issues (storage, failures, quotas)
- **Processing queue visibility** - See what's happening
- **Error tracking** - Identify and resolve problems

### Interconnected Workflow
- **User actions trace to content** they uploaded
- **Content traces to AI jobs** it triggered
- **AI jobs trace back to users** who initiated them
- **Complete circular navigation** for full context

---

## 🔐 Security Notes

### Audit Logging
- **All admin actions logged** for accountability
- **Who, what, when** tracked for every operation
- **Cannot be deleted** by admins
- **Accessible to system owners** only

### Access Control
- **Admins can modify anything** - use carefully
- **User deletions are permanent** - strong confirmations required
- **API keys masked** in UI for security
- **Two-factor authentication** recommended for admin accounts

---

This complete navigation guide shows every clickable element and where it takes administrators throughout their entire journey from login to logout!
