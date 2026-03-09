// ─── Leadership Module Mock Data ───────────────────────────────────────────
export const STUDENTS = [
  { id: 'AI-20492', name: 'Alex Johnson',     email: 'alex.johnson@learnai.com',     avatar: 'AJ', course: 'Neural Networks II',             progress: 92, module: '12/13', status: 'top-performer', lastActive: '2 hours ago',  score: 96, jobReady: true  },
  { id: 'AI-21033', name: 'Sarah Williams',   email: 'sarah.williams@learnai.com',   avatar: 'SW', course: 'Machine Learning Fundamentals',  progress: 24, module: '3/15',  status: 'at-risk',       lastActive: '8 days ago',   score: 41, jobReady: false },
  { id: 'AI-20512', name: 'Michael Chen',     email: 'michael.chen@learnai.com',     avatar: 'MC', course: 'Data Science & AI',              progress: 68, module: '8/12',  status: 'on-track',      lastActive: '1 hour ago',   score: 74, jobReady: false },
  { id: 'AI-19822', name: 'Emily Davis',      email: 'emily.davis@learnai.com',      avatar: 'ED', course: 'Neural Networks II',             progress: 100,module: 'Done', status: 'completed',     lastActive: 'Oct 25, 2023', score: 89, jobReady: true  },
  { id: 'AI-20901', name: 'James Wilson',     email: 'james.wilson@learnai.com',     avatar: 'JW', course: 'Python Mastery',                 progress: 45, module: '5/11',  status: 'behind',        lastActive: '3 days ago',   score: 58, jobReady: false },
  { id: 'AI-21100', name: 'Priya Patel',      email: 'priya.patel@learnai.com',      avatar: 'PP', course: 'Data Science & AI',              progress: 88, module: '10/12', status: 'top-performer', lastActive: '30 min ago',   score: 91, jobReady: true  },
  { id: 'AI-19900', name: 'Carlos Rodriguez', email: 'carlos.rodriguez@learnai.com', avatar: 'CR', course: 'Python Mastery',                 progress: 33, module: '4/11',  status: 'at-risk',       lastActive: '5 days ago',   score: 38, jobReady: false },
  { id: 'AI-21250', name: 'Aisha Okafor',     email: 'aisha.okafor@learnai.com',     avatar: 'AO', course: 'Machine Learning Fundamentals',  progress: 75, module: '10/15', status: 'on-track',      lastActive: '4 hours ago',  score: 80, jobReady: false },
  { id: 'AI-20345', name: 'Tom Nguyen',       email: 'tom.nguyen@learnai.com',       avatar: 'TN', course: 'Neural Networks II',             progress: 55, module: '7/13',  status: 'behind',        lastActive: '2 days ago',   score: 62, jobReady: false },
  { id: 'AI-21400', name: 'Fatima Hassan',    email: 'fatima.hassan@learnai.com',    avatar: 'FH', course: 'Python Mastery',                 progress: 98, module: '10/11', status: 'top-performer', lastActive: '1 hour ago',   score: 94, jobReady: true  },
  { id: 'AI-21500', name: 'Diego Morales',    email: 'diego.morales@learnai.com',    avatar: 'DM', course: 'Data Science & AI',              progress: 12, module: '1/12',  status: 'at-risk',       lastActive: '12 days ago',  score: 29, jobReady: false },
  { id: 'AI-21600', name: 'Yuki Tanaka',      email: 'yuki.tanaka@learnai.com',      avatar: 'YT', course: 'Python Mastery',                 progress: 60, module: '7/11',  status: 'on-track',      lastActive: '6 hours ago',  score: 71, jobReady: false },
];

export const COURSES = [
  { id: 'PY-101',  name: 'Python Mastery',                students: 120, avgProgress: 82, avgScore: 78, atRisk: 12, completion: 65, health: 82 },
  { id: 'DS-101',  name: 'Data Science & AI',             students: 85,  avgProgress: 74, avgScore: 82, atRisk: 5,  completion: 71, health: 88 },
  { id: 'ML-ADV',  name: 'Machine Learning Fundamentals', students: 95,  avgProgress: 56, avgScore: 64, atRisk: 18, completion: 48, health: 64 },
  { id: 'NN-II',   name: 'Neural Networks II',            students: 70,  avgProgress: 79, avgScore: 85, atRisk: 7,  completion: 72, health: 90 },
  { id: 'AI-FND',  name: 'AI Fundamentals',               students: 80,  avgProgress: 88, avgScore: 87, atRisk: 4,  completion: 83, health: 92 },
];

export const PROBLEM_AREAS = [
  { id: 1, topic: 'Python Function Parameters', course: 'Python Mastery',                 chapter: 'Chapter 3', struggleRate: 70, avgScore: 45, severity: 'critical' },
  { id: 2, topic: 'Data Visualization Basics',  course: 'Data Science & AI',             chapter: 'Chapter 5', struggleRate: 38, avgScore: 58, severity: 'warning'  },
  { id: 3, topic: 'Gradient Descent',           course: 'Machine Learning Fundamentals', chapter: 'Chapter 7', struggleRate: 62, avgScore: 51, severity: 'critical' },
  { id: 4, topic: 'Backpropagation',            course: 'Neural Networks II',            chapter: 'Chapter 4', struggleRate: 45, avgScore: 56, severity: 'warning'  },
];

export const REPORTS = [
  { id: 1, name: 'Q1 2026 Progress Report',          date: 'Feb 10, 2026', type: 'PDF',   size: '4.2 MB', category: 'Student Progress'       },
  { id: 2, name: 'Python 101 Completion Analysis',   date: 'Feb 8, 2026',  type: 'EXCEL', size: '2.1 MB', category: 'Completion Rates'        },
  { id: 3, name: 'AI Interaction Impact – Jan 2026', date: 'Feb 1, 2026',  type: 'PDF',   size: '3.8 MB', category: 'AI Interaction Impact'   },
  { id: 4, name: 'Monthly KPI Review',               date: 'Jan 31, 2026', type: 'PDF',   size: '2.5 MB', category: 'Student Progress'        },
  { id: 5, name: 'At-Risk Student Cohort Report',    date: 'Jan 25, 2026', type: 'EXCEL', size: '1.9 MB', category: 'Engagement Metrics'      },
];

export const TRAINERS = [
  { id: 1, name: 'Dr. Robert Chen',    role: 'Lead Trainer',           courses: 3, students: 145, rating: 4.8, status: 'active'   },
  { id: 2, name: 'Prof. Sarah Miller', role: 'Data Science Trainer',   courses: 2, students: 89,  rating: 4.6, status: 'active'   },
  { id: 3, name: 'James Thompson',     role: 'ML Specialist',          courses: 2, students: 97,  rating: 4.4, status: 'active'   },
  { id: 4, name: 'Amara Diallo',       role: 'AI Curriculum Designer', courses: 1, students: 52,  rating: 4.9, status: 'inactive' },
];

export const CURRICULUM = {
  'PY-101': {
    name: 'Python Mastery',
    health: { clarity: 82, alignment: 95, engagement: 64, roi: 88 },
    overallScore: 80,
    problemAreas: [
      { topic: 'Python Function Parameters', struggleRate: 70, avgScore: 45,
        analysis: 'Students confuse args and kwargs in nested scope scenarios.',
        recommendation: 'Add 3 interactive visual examples demonstrating memory allocation during scope changes.' },
      { topic: 'List Comprehensions',        struggleRate: 45, avgScore: 62,
        analysis: 'Students skip comprehension syntax in favour of verbose loops.',
        recommendation: 'Add side-by-side comparison exercises with timing benchmarks.' },
      { topic: 'Exception Handling',         struggleRate: 38, avgScore: 67,
        analysis: 'Try/except nesting causes confusion around propagation.',
        recommendation: 'Create a flowchart diagram for exception propagation paths.' },
    ],
    optimizationFlags: [
      { type: 'bottleneck', title: 'Pacing Bottleneck: Module 4',   desc: '82% of students take 3× the expected time.',      action: 'Review Content' },
      { type: 'gap',        title: 'Prerequisite Gap Detected',      desc: 'Students lack OOP basics before Module 7.',        action: 'Auto-Bridge'    },
      { type: 'validity',   title: 'Low Assessment Validity',        desc: 'Final exam Q12 has 0% correlation with grades.',  action: 'Edit Quiz'      },
    ],
    aiContent: { engagement: { traditional: 42, ai: 88 }, retention: { traditional: 58, ai: 75 } },
  },
  'DS-101': {
    name: 'Data Science & AI',
    health: { clarity: 88, alignment: 92, engagement: 78, roi: 91 },
    overallScore: 87,
    problemAreas: [
      { topic: 'Data Visualization', struggleRate: 38, avgScore: 58,
        analysis: 'Students struggle choosing the right chart type for distributions.',
        recommendation: 'Add a decision tree for chart selection.' },
      { topic: 'Statistical Inference', struggleRate: 52, avgScore: 54,
        analysis: 'P-value interpretation causes widespread confusion.',
        recommendation: 'Create interactive simulation for hypothesis testing.' },
    ],
    optimizationFlags: [
      { type: 'bottleneck', title: 'Module 6 Completion Gap', desc: '45% of students drop off at midpoint.',          action: 'Review Content' },
      { type: 'gap',        title: 'Math Prerequisites Needed', desc: 'Students lack statistics foundation before M3.', action: 'Auto-Bridge'    },
    ],
    aiContent: { engagement: { traditional: 55, ai: 85 }, retention: { traditional: 62, ai: 80 } },
  },
};
