import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Import pages (to be created)
// import Dashboard from './pages/Dashboard'
// import Courses from './pages/Courses'
// import Learning from './pages/Learning'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <h1>LMS & Knowledge Intelligence Platform</h1>
          <p>Frontend application - Setup complete!</p>
          
          {/* Routes will be added here */}
          <Routes>
            <Route path="/" element={<div>Dashboard - Coming Soon</div>} />
            <Route path="/courses" element={<div>Courses - Coming Soon</div>} />
            <Route path="/learn/:courseId" element={<div>Learning Interface - Coming Soon</div>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
