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
import LearnerMessages from './pages/learner/LearnerMessages'
import LearnerMeetings from './pages/learner/LearnerMeetings'
import LearnerSettings from './pages/learner/LearnerSettings'
import LearnerSavedResources from './pages/learner/LearnerSavedResources'

// trainer imports
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import TrainerCourseManagement from './pages/trainer/TrainerCourseManagement'
import TrainerUploadContent from './pages/trainer/TrainerUploadContent'
import TrainerAIContentStudio from './pages/trainer/TrainerAIContentStudio'
import TrainerStudentAnalytics from './pages/trainer/TrainerStudentAnalytics'
import TrainerContentLibrary from './pages/trainer/TrainerContentLibrary'
import TrainerMessages from './pages/trainer/TrainerMessages'
import TrainerMeetings from './pages/trainer/TrainerMeetings'

//admin import
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/sub/Dashboard'
import AdminUsers from './pages/admin/sub/Users'
import KnowledgeRepo from './pages/admin/sub/KnowledgeRepository'
import AIConfig from './pages/admin/sub/AIConfiguration'
import AdminReports from './pages/admin/sub/Reports'
import AdminCourses from './pages/admin/sub/Courses'
import AdminSettings from './pages/admin/sub/Settings'
import PrivateAdminRoute from './components/PrivateAdminRoute'

import LeadershipDashboard from './pages/leadership/Dashboard'
import LeadershipStudentProgress from './pages/leadership/Students'
import LeadershipCurriculum from './pages/leadership/Curriculum'
import LeadershipAnalytics from './pages/leadership/Analytics'
import LeadershipManagement from './pages/leadership/Management'
import LeadershipSettings from './pages/leadership/Settings'

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
        <Route path="/learner/messages" element={<LearnerMessages />} />
        <Route path="/learner/meetings" element={<LearnerMeetings />} />
        <Route path="/learner/settings" element={<LearnerSettings />} />
        <Route path="/learner/saved" element={<LearnerSavedResources />} />

        {/* ── Trainer Routes (Pages 13–18) ── */}
        <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/courses" element={<TrainerCourseManagement />} />
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseManagement />} />
        <Route path="/trainer/courses/:courseId/upload" element={<TrainerUploadContent />} />
        <Route path="/trainer/ai-studio" element={<TrainerAIContentStudio />} />
        <Route path="/trainer/courses/:courseId/analytics" element={<TrainerStudentAnalytics />} />
        <Route path="/trainer/analytics" element={<TrainerStudentAnalytics />} />
        <Route path="/trainer/content-library" element={<TrainerContentLibrary />} />
        <Route path="/trainer/messages" element={<TrainerMessages />} />
        <Route path="/trainer/meetings" element={<TrainerMeetings />} />

        <Route path="/dashboard/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="knowledge" element={<KnowledgeRepo />} />
          <Route path="ai" element={<AIConfig />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/dashboard/leadership" element={<LeadershipDashboard />} />
        <Route path="/leadership/dashboard" element={<LeadershipDashboard />} />
        <Route path="/leadership/students" element={<LeadershipStudentProgress />} />
        <Route path="/leadership/curriculum" element={<LeadershipCurriculum />} />
        <Route path="/leadership/analytics" element={<LeadershipAnalytics />} />
        <Route path="/leadership/management" element={<LeadershipManagement />} />
        <Route path="/leadership/settings" element={<LeadershipSettings />} />
      </Routes>
    </Router>
  )
}

export default App