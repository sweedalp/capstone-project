import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import LearnerDashboard from './pages/learner/LearnerDashboard'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import LeadershipDashboard from './pages/leadership/LeadershipDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard/learner" element={<LearnerDashboard />} />
        <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/leadership" element={<LeadershipDashboard />} />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route path="/courses" element={<div>Courses - Coming Soon</div>} />
        <Route path="/learn/:courseId" element={<div>Learning Interface - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
