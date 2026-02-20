// ─── Curriculum-related constants and data ───────────────────────────────────

export const REPORT_TYPES = [
  { id: 'progress',    label: 'Student Progress',       desc: 'Individual performance tracking across all courses.'             },
  { id: 'ai',         label: 'AI Interaction Impact',  desc: 'Correlation between AI tutoring and learning outcomes.'         },
  { id: 'completion', label: 'Completion Rates',        desc: 'Aggregated data on course completion and drop-off points.'      },
  { id: 'engagement', label: 'Engagement Metrics',      desc: 'User activity levels, time-spent, and platform participation.'  },
]

export const SCHEDULED_REPORTS = [
  { id: 1, name: 'Executive Weekly',   schedule: 'Every Monday · 08:00 AM'  },
  { id: 2, name: 'Monthly AI Efficacy', schedule: '1st of Month · 12:00 PM' },
  { id: 3, name: 'Quarterly Audit',    schedule: 'Every 90 Days · 09:00 AM' },
]

export const RECENT_REPORTS = [
  { name: 'Q3 Leadership_Audit.pdf',          date: 'Apr 18, 2024 · 14:20', format: 'PDF',   size: '4.2 MB'  },
  { name: 'Student_Interaction_Master.xlsx',  date: 'Apr 16, 2024 · 09:15', format: 'EXCEL', size: '12.8 MB' },
  { name: 'Monthly_KPI_Review.pdf',           date: 'Apr 14, 2024 · 18:45', format: 'PDF',   size: '2.1 MB'  },
  { name: 'AI_Efficacy_Report_Apr.pdf',       date: 'Apr 10, 2024 · 11:30', format: 'PDF',   size: '3.5 MB'  },
]

export const AI_INSIGHTS = [
  {
    icon: 'trending_up', colorClass: 'bg-green-100 text-green-600',
    title: 'Engagement Increase',
    desc:  'Total active users up 12% compared to last month. Peak times shifted to weekday evenings.',
  },
  {
    icon: 'psychology', colorClass: 'bg-blue-100 text-blue-600',
    title: 'AI Tutor Impact',
    desc:  'Students using AI assistance 3x per week show a 15% higher retention in STEM modules.',
  },
  {
    icon: 'priority_high', colorClass: 'bg-amber-100 text-amber-600',
    title: 'Action Recommended',
    desc:  'Mathematics Module 4 completion rates are lagging. Recommended review of quiz difficulty.',
  },
]

export const STORAGE_BREAKDOWN = [
  { type: 'Videos',        size: '8.4 GB', pct: 46, colorClass: 'bg-purple-500' },
  { type: 'PDFs',          size: '4.2 GB', pct: 23, colorClass: 'bg-red-500'    },
  { type: 'Presentations', size: '2.1 GB', pct: 12, colorClass: 'bg-orange-500' },
  { type: 'Other',         size: '3.8 GB', pct: 21, colorClass: 'bg-slate-400'  },
]
