import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'

// Import other pages (to be created)
// import Dashboard from './pages/Dashboard'
// import Courses from './pages/Courses'
// import Learning from './pages/Learning'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route path="/courses" element={<div>Courses - Coming Soon</div>} />
        <Route path="/learn/:courseId" element={<div>Learning Interface - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
