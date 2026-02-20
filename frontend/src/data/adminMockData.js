// ─── Shared placeholder avatar ───────────────────────────────────────────────
export const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDVIwAedUy03OFIkszovhCMYUXYQiQJGtoM0ogL_WMMZw6c2Snkv_pJplAoasqos6pUW9X37oCsOjhxWziPDuo6AppuXUhS8pow0ur2VQPSgVsmTIpyEb7LrxCKJ3dG9VGi28RCHCc4pjEXt2uBHcKZM_SYXWGTSyCwULeonlEkGXTPH2oH2QqZEUYJMiKmEhDU6Jk0kXxrEsm774J0WVy7A8eMiSTngVMUFWZsgdWbcEgXnjqPxzPFcpPB5XO_hp7bOU0nQ-yKOhM'

// ─── Users ───────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id: 1,  name: 'Sarah Johnson',   email: 'sarah.j@company.com',  role: 'Trainer',  status: 'active',   joined: 'Jan 15, 2024', courses: 8,  avatar: AVATAR, lastLogin: '2h ago',  uploads: 24, dept: 'Engineering' },
  { id: 2,  name: 'Michael Chen',    email: 'm.chen@company.com',   role: 'Learner',  status: 'active',   joined: 'Mar 3, 2024',  courses: 5,  avatar: AVATAR, lastLogin: '1d ago',  uploads: 0,  dept: 'Marketing'   },
  { id: 3,  name: 'Emma Williams',   email: 'emma.w@company.com',   role: 'Learner',  status: 'pending',  joined: 'Apr 10, 2024', courses: 2,  avatar: AVATAR, lastLogin: '3d ago',  uploads: 0,  dept: 'Sales'       },
  { id: 4,  name: 'James Rodriguez', email: 'j.rod@company.com',    role: 'Admin',    status: 'active',   joined: 'Dec 1, 2023',  courses: 0,  avatar: AVATAR, lastLogin: '15m ago', uploads: 12, dept: 'IT'          },
  { id: 5,  name: 'Priya Patel',     email: 'priya.p@company.com',  role: 'Trainer',  status: 'active',   joined: 'Feb 20, 2024', courses: 6,  avatar: AVATAR, lastLogin: '5h ago',  uploads: 31, dept: 'HR'          },
  { id: 6,  name: 'Tom Nguyen',      email: 't.nguyen@company.com', role: 'Learner',  status: 'inactive', joined: 'Nov 5, 2023',  courses: 3,  avatar: AVATAR, lastLogin: '30d ago', uploads: 0,  dept: 'Finance'     },
  { id: 7,  name: 'Lisa Park',       email: 'lisa.p@company.com',   role: 'Learner',  status: 'pending',  joined: 'Apr 28, 2024', courses: 0,  avatar: AVATAR, lastLogin: 'Never',   uploads: 0,  dept: 'Legal'       },
  { id: 8,  name: 'David Kim',       email: 'd.kim@company.com',    role: 'Trainer',  status: 'active',   joined: 'Jan 8, 2024',  courses: 11, avatar: AVATAR, lastLogin: '30m ago', uploads: 45, dept: 'Engineering' },
]

// ─── Content / Knowledge Base ─────────────────────────────────────────────────
export const MOCK_CONTENT = [
  { id: 1, title: 'Advanced Machine Learning Fundamentals', type: 'PDF',   size: '12.4 MB', uploader: 'Sarah Johnson', uploaderId: 1, date: 'Apr 18, 2024', status: 'processed',  views: 342, aiStatus: 'complete',   tags: ['AI', 'ML', 'Advanced'] },
  { id: 2, title: 'Q1 Sales Training Video 2024',           type: 'VIDEO', size: '284 MB',  uploader: 'Priya Patel',   uploaderId: 5, date: 'Apr 15, 2024', status: 'processing', views: 89,  aiStatus: 'processing', tags: ['Sales', 'Training']    },
  { id: 3, title: 'Leadership Communication Deck',          type: 'PPTX',  size: '8.2 MB',  uploader: 'David Kim',     uploaderId: 8, date: 'Apr 12, 2024', status: 'processed',  views: 214, aiStatus: 'complete',   tags: ['Leadership', 'Soft Skills'] },
  { id: 4, title: 'Python for Data Science - Full Course',  type: 'ZIP',   size: '1.2 GB',  uploader: 'Sarah Johnson', uploaderId: 1, date: 'Apr 10, 2024', status: 'processed',  views: 567, aiStatus: 'complete',   tags: ['Python', 'Data', 'Programming'] },
  { id: 5, title: 'Employee Onboarding Handbook',           type: 'DOCX',  size: '3.1 MB',  uploader: 'Priya Patel',   uploaderId: 5, date: 'Apr 8, 2024',  status: 'processed',  views: 891, aiStatus: 'complete',   tags: ['HR', 'Onboarding']     },
  { id: 6, title: 'Compliance & Ethics Training',           type: 'PDF',   size: '5.7 MB',  uploader: 'James Rodriguez', uploaderId: 4, date: 'Apr 5, 2024', status: 'error',    views: 43,  aiStatus: 'error',      tags: ['Compliance', 'Legal']  },
]

// ─── AI Jobs ──────────────────────────────────────────────────────────────────
export const MOCK_AI_JOBS = [
  { id: 'JOB-001', content: 'Advanced Machine Learning Fundamentals', type: 'Content Analysis',      status: 'complete', progress: 100, started: 'Apr 18 09:15', duration: '4m 32s',     tokens: 12400 },
  { id: 'JOB-002', content: 'Q1 Sales Training Video',                type: 'Transcription + Summary', status: 'running',  progress: 67,  started: 'Apr 18 11:42', duration: 'in progress', tokens: null  },
  { id: 'JOB-003', content: 'Leadership Communication Deck',          type: 'Slide Analysis',         status: 'complete', progress: 100, started: 'Apr 15 14:20', duration: '2m 18s',     tokens: 5800  },
  { id: 'JOB-004', content: 'Python for Data Science',                type: 'Content Indexing',       status: 'complete', progress: 100, started: 'Apr 10 10:05', duration: '12m 44s',    tokens: 34500 },
  { id: 'JOB-005', content: 'Compliance & Ethics Training',           type: 'Content Analysis',       status: 'error',    progress: 28,  started: 'Apr 5 08:30',  duration: 'failed',      tokens: null  },
]

// ─── Courses ──────────────────────────────────────────────────────────────────
export const MOCK_COURSES = [
  { id: 1, title: 'Machine Learning Fundamentals', learners: 142, completion: 76, instructor: 'Sarah Johnson', status: 'active',   category: 'Technology', duration: '12h' },
  { id: 2, title: 'Sales Excellence Program',       learners: 89,  completion: 54, instructor: 'Priya Patel',   status: 'active',   category: 'Sales',       duration: '8h'  },
  { id: 3, title: 'Leadership in the Digital Age',  learners: 67,  completion: 88, instructor: 'David Kim',     status: 'active',   category: 'Leadership',  duration: '6h'  },
  { id: 4, title: 'Python for Non-Programmers',     learners: 201, completion: 41, instructor: 'Sarah Johnson', status: 'active',   category: 'Technology', duration: '10h' },
  { id: 5, title: 'Effective Communication Skills', learners: 156, completion: 92, instructor: 'Priya Patel',   status: 'archived', category: 'Soft Skills', duration: '5h'  },
]

// ─── Dashboard activity events ────────────────────────────────────────────────
export const DASHBOARD_EVENTS = [
  { icon: 'person_add',   color: 'text-green-500',  bg: 'bg-green-50',  text: 'Emma Williams registered as a new learner',              time: '2m ago'  },
  { icon: 'upload_file',  color: 'text-blue-500',   bg: 'bg-blue-50',   text: 'New content uploaded: Python for Data Science',          time: '15m ago' },
  { icon: 'smart_toy',    color: 'text-purple-500', bg: 'bg-purple-50', text: 'AI processing completed for ML Fundamentals',            time: '32m ago' },
  { icon: 'warning',      color: 'text-amber-500',  bg: 'bg-amber-50',  text: 'Storage usage reached 75% threshold',                    time: '1h ago'  },
  { icon: 'school',       color: 'text-primary',    bg: 'bg-blue-50',   text: 'Machine Learning Fundamentals reached 142 learners',     time: '2h ago'  },
  { icon: 'check_circle', color: 'text-green-500',  bg: 'bg-green-50',  text: 'Monthly compliance report generated successfully',       time: '3h ago'  },
]

// ─── Dashboard AI services summary ────────────────────────────────────────────
export const AI_SERVICES_SUMMARY = [
  { name: 'GPT-4o Content Analysis', status: 'active',  uptime: '99.9%', calls: 1203 },
  { name: 'Whisper Transcription',   status: 'active',  uptime: '99.7%', calls: 456  },
  { name: 'DALL·E Image Gen',        status: 'standby', uptime: '99.5%', calls: 89   },
  { name: 'Custom Embeddings',       status: 'active',  uptime: '100%',  calls: 2144 },
]
