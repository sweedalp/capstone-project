# Leadership Module

## Setup

### 1. Install dependencies (if not already installed)
```bash
npm install react-hot-toast zustand react-router-dom
```

### 2. Drop this folder
Place this entire `leadership/` folder inside your `src/pages/` directory.
Final path: `src/pages/leadership/`

### 3. Add Curriculum route to App.jsx
Your App.jsx is missing the Curriculum route. Add this one line:

```jsx
import LeadershipCurriculum from './pages/leadership/Curriculum.jsx'

// Inside <Routes>:
<Route path="/leadership/curriculum" element={<LeadershipCurriculum />} />
```

### 4. Google Material Symbols font
Make sure your index.html has this (for icons):
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
```

### 5. Done!
Route to `/leadership/dashboard` and all pages work.

## Files
```
leadership/
├── _mockData.js         ← All mock data (students, courses, reports…)
├── _store.js            ← Zustand stores (useLeadershipUI, useLeadershipData)
├── _ui.jsx              ← Shared UI primitives (Card, Btn, Modal, Avatar…)
├── LeadershipShell.jsx  ← Sidebar + topbar layout wrapper
├── Dashboard.jsx        ← /leadership/dashboard
├── Students.jsx         ← /leadership/students
├── Curriculum.jsx       ← /leadership/curriculum
├── Analytics.jsx        ← /leadership/analytics
├── Management.jsx       ← /leadership/management
└── Settings.jsx         ← /leadership/settings
```
