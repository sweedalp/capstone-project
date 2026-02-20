// ─── Leadership Zustand Stores ─────────────────────────────────────────────
// Single file export – import what you need from '_store.js'
import { create } from 'zustand';
import { STUDENTS, COURSES, REPORTS, PROBLEM_AREAS, TRAINERS, CURRICULUM } from './_mockData';

// ── UI Store ──────────────────────────────────────────────────────────────
export const useLeadershipUI = create((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  toggleSidebar:       () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openMobileSidebar:   () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar:  () => set({ mobileSidebarOpen: false }),
}));

// ── Data Store ────────────────────────────────────────────────────────────
export const useLeadershipData = create((set, get) => ({
  students:     STUDENTS,
  courses:      COURSES,
  reports:      REPORTS,
  problemAreas: PROBLEM_AREAS,
  trainers:     TRAINERS,
  curriculum:   CURRICULUM,

  // Student filters
  studentFilter: 'all',
  studentSearch: '',
  studentCourse: 'all',
  selectedCourse: 'PY-101',

  setStudentFilter:  (f)  => set({ studentFilter: f }),
  setStudentSearch:  (q)  => set({ studentSearch: q }),
  setStudentCourse:  (c)  => set({ studentCourse: c }),
  setSelectedCourse: (id) => set({ selectedCourse: id }),

  getFilteredStudents: () => {
    const { students, studentFilter, studentSearch, studentCourse } = get();
    return students.filter((s) => {
      const okFilter = studentFilter === 'all' || s.status === studentFilter;
      const okSearch = !studentSearch ||
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(studentSearch.toLowerCase());
      const okCourse = studentCourse === 'all' || s.course === studentCourse;
      return okFilter && okSearch && okCourse;
    });
  },
}));
