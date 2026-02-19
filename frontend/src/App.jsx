import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import LearnerDashboard from './pages/learner/LearnerDashboard'
import CourseCatalog from './pages/learner/CourseCatalog'
import CourseOverview from './pages/learner/CourseOverview'
import LessonContent from './pages/learner/LessonContent'
import Assessment from './pages/learner/Assessment'
import AssessmentResults from './pages/learner/AssessmentResults'
import AILearningHub from './pages/learner/AILearningHub'
import Search from './pages/learner/Search'
import RevisionAssistant from './pages/learner/RevisionAssistant'
import Analytics from './pages/learner/Analytics'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
//admin import ==================================================X
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/sub/Dashboard'
import AdminUsers from './pages/admin/sub/Users'
import KnowledgeRepo from './pages/admin/sub/KnowledgeRepository'
import AIConfig from './pages/admin/sub/AIConfiguration'
import AdminReports from './pages/admin/sub/Reports'
import AdminCourses from './pages/admin/sub/Courses'
import AdminSettings from './pages/admin/sub/Settings'
import PrivateAdminRoute from './components/PrivateAdminRoute'
//admin import ==================================================X
import LeadershipDashboard from './pages/leadership/LeadershipDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/dashboard/learner" element={<LearnerDashboard />} />
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/courses" element={<CourseCatalog />} />
        <Route path="/learner/courses/:courseId" element={<CourseOverview />} />
        <Route path="/learner/courses/:courseId/lessons/:lessonId" element={<LessonContent />} />
        <Route path="/learner/courses/:courseId/assessments/:assessmentId" element={<Assessment />} />
        <Route path="/learner/courses/:courseId/assessments/:assessmentId/results" element={<AssessmentResults />} />
        <Route path="/learner/ai-hub" element={<AILearningHub />} />
        <Route path="/learner/search" element={<Search />} />
        <Route path="/learner/revision" element={<RevisionAssistant />} />
        <Route path="/learner/analytics" element={<Analytics />} />
        <Route path="/learner/progress" element={<Analytics />} />
        <Route path="/dashboard/trainer" element={<TrainerDashboard />} />

        <Route path="/dashboard/admin" element={<AdminLayout />} >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="knowledge" element={<KnowledgeRepo />} />
          <Route path="ai" element={<AIConfig />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/dashboard/leadership" element={<LeadershipDashboard />} />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route path="/courses" element={<div>Courses - Coming Soon</div>} />
        <Route path="/learn/:courseId" element={<div>Learning Interface - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
