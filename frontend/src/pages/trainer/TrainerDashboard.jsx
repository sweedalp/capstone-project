import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';




const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);


  // Course Creation Modal State
  const [showCourseCreationModal, setShowCourseCreationModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    category: '',
    level: 'beginner'
  });




  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };




  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    // Navigate to corresponding route according to TRAINER_NAVIGATION_FLOW.md
    switch(navItem) {
      case 'dashboard':
        navigate('/dashboard/trainer');
        break;
      case 'content':
        navigate('/trainer/content-library');
        break;
      case 'courses':
        navigate('/trainer/courses');
        break;
      case 'analytics':
        navigate('/trainer/analytics');
        break;
      case 'ai-studio':
        navigate('/trainer/ai-studio');
        break;
      default:
        navigate('/dashboard/trainer');
    }
  };




  const handleCourseAction = (action, courseId) => {
    switch(action) {
      case 'manage':
        // → Course Management (Page 14) for that specific course
        navigate(`/trainer/courses/${courseId}`);
        break;
      case 'analytics':
        // → Student Analytics (Page 17) for that course
        navigate(`/trainer/courses/${courseId}/analytics`);
        break;
      case 'view-title':
        // → Course Management (Page 14) (same as Manage Course)
        navigate(`/trainer/courses/${courseId}`);
        break;
      case 'progress':
        // → Student Analytics (Page 17) with relevant filter
        navigate(`/trainer/courses/${courseId}/analytics?filter=progress`);
        break;
      case 'ai-generated':
        // → AI Content Studio (Page 16) filtered for this course
        navigate(`/trainer/ai-studio?course=${courseId}`);
        break;
      default:
        break;
    }
  };




  const handleCreateNewCourse = () => {
    // [+ New Course] → Course creation modal/wizard
    setShowCourseCreationModal(true);
  };


  const handleCourseCreationSubmit = (e) => {
    e.preventDefault();
    console.log('handleCourseCreationSubmit called');
    // Create course logic here (API call would go here)
   
    // After creation → Course Management (Page 14) for new course
    // For now, navigate to course management with a mock ID
    const newCourseId = 'new-course-' + Date.now();
    console.log('Navigating to:', `/trainer/courses/${newCourseId}`);
    navigate(`/trainer/courses/${newCourseId}`);
    setShowCourseCreationModal(false);
    // Reset form
    setNewCourseData({
      title: '',
      description: '',
      duration: '',
      category: '',
      level: 'beginner'
    });
  };


  const handleCourseCreationCancel = () => {
    console.log('handleCourseCreationCancel called');
    setShowCourseCreationModal(false);
    // Reset form
    setNewCourseData({
      title: '',
      description: '',
      duration: '',
      category: '',
      level: 'beginner'
    });
  };




  const handleStudentInsights = () => {
    // [View Detailed Analytics →] → Student Analytics (Page 17)
    navigate('/trainer/analytics');
  };




  const handleAIStudio = () => {
    // [Open AI Studio →] → AI Content Studio (Page 16)
    navigate('/trainer/ai-studio');
  };




  const handleContentLibrary = () => {
    // [Browse Library →] → Content Library (Page 18)
    navigate('/trainer/content-library');
  };




  const handleStudentProfile = (studentId) => {
    // Student Analytics (Page 17) for that student OR student profile view
    navigate(`/trainer/analytics/student/${studentId}`);
  };




  const handleSendResources = (studentId) => {
    // Content Library (Page 18) to browse → Select content → Send to student
    navigate('/trainer/content-library?action=send&student=${studentId}');
  };




  const handleGenerateContent = (studentId, topic) => {
    // AI Content Studio (Page 16) with topic pre-filled
    navigate(`/trainer/ai-studio?student=${studentId}&topic=${topic}`);
  };




  const handleChartPointHover = (point, event) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 30
      });
    }
    setHoveredChartPoint(point);
  };




  const handleChartPointLeave = () => {
    setHoveredChartPoint(null);
  };




  const chartData = [
    { day: 'Mon', value: 12, students: '12k' },
    { day: 'Tue', value: 18, students: '18k' },
    { day: 'Wed', value: 25, students: '25k' },
    { day: 'Thu', value: 22, students: '22k' },
    { day: 'Fri', value: 15, students: '15k' },
    { day: 'Sat', value: 28, students: '28k' },
    { day: 'Sun', value: 13, students: '13k' },
    { day: 'Mon', value: 20, students: '20k' }
  ];




  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'content', label: 'Content Library', icon: 'library_books' },
    { id: 'courses', label: 'Course Management', icon: 'school' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'ai-studio', label: 'AI Studio', icon: 'auto_awesome' }
  ];




  const courses = [
    {
      id: 'python-101',
      title: 'Python 101',
      students: 45,
      weeks: 12,
      status: 'Active',
      avgProgress: 65,
      completion: 40,
      aiGenerated: {
        audioSummaries: 15,
        videoExplainers: 12,
        interactiveWalkthroughs: 8
      },
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop'
    },
    {
      id: 'data-science',
      title: 'Data Science Fundamentals',
      students: 32,
      weeks: 10,
      status: 'Active',
      avgProgress: 45,
      completion: 25,
      aiGenerated: {
        audioSummaries: 8,
        videoExplainers: 6,
        interactiveWalkthroughs: 4
      },
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
    }
  ];




  const aiStudioActions = [
    {
      title: 'Generate Summary',
      description: 'Quick TL;DR for lessons',
      icon: 'summarize',
      color: 'primary'
    },
    {
      title: 'Create Explainer',
      description: 'Simplified step-by-step',
      icon: 'description',
      color: 'indigo'
    },
    {
      title: 'Generate Quiz',
      description: 'AI-powered knowledge check',
      icon: 'quiz',
      color: 'teal'
    }
  ];




  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 transition-colors duration-200">
      <TrainerSidebar />




      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all cursor-pointer"
              placeholder="Search courses or students..."
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <TrainerProfileDropdown
              avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC7bF5uu5afQnUFN1NVp5Hpvvtl-ARYg51mGF5FgqYBFhfrHlUqaBy7sejOQM3nCzrKmkVuDg7h99OMO4QQPwgZNXzKYiWc9Un_9ekmzno90TXdFlRdb0d4gRq46FRgDrFkI54JHXCMMZ8ldkH78yV4PSYiuCyS3rOpFTaxej8x3Oq47pI32UxtaULxcUhXDl9yfEXoMozpxomZCyijhuzreRIgSLwNrdqt-I7dB_7V1WOQPn-_HESQDasf5V_7SZBEHhKx6T8t20M"
              name="Dr. Smith"
              role="Lead Trainer"
            />
          </div>
        </header>




        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Welcome Section */}
          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trainer Dashboard</h1>
            <p className="text-slate-500">Welcome back, Dr. Smith! 👋</p>
          </section>




          {/* MY COURSES Section */}
          <section className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">📚 MY COURSES</h2>
              <button
                onClick={handleCreateNewCourse}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                [+ New Course]
              </button>
            </div>
            <div className="space-y-6">
              {courses.map((course, index) => (
                <div key={course.id} className="course-card bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm card-hover animate-slide-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="h-40 bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 mix-blend-multiply"></div>
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={course.image}
                      alt={course.title}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      {course.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2 mb-4">
                      {/* Course Title - Clickable */}
                      <h3
                        onClick={() => handleCourseAction('view-title', course.id)}
                        className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                      >
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500">{course.students} students • {course.weeks} weeks • {course.status}</p>
                      {/* Progress/Stats - Clickable */}
                      <p
                        onClick={() => handleCourseAction('progress', course.id)}
                        className="text-sm text-slate-500 cursor-pointer hover:text-primary transition-colors"
                      >
                        Avg Progress: {course.avgProgress}% • Completion: {course.completion}%
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">AI Generated:</div>
                      <div
                        onClick={() => handleCourseAction('ai-generated', course.id)}
                        className="space-y-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="material-symbols-outlined text-primary">mic</span>
                          <span>• {course.aiGenerated.audioSummaries} Audio Summaries</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="material-symbols-outlined text-primary">movie</span>
                          <span>• {course.aiGenerated.videoExplainers} Video Explainers</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="material-symbols-outlined text-primary">route</span>
                          <span>• {course.aiGenerated.interactiveWalkthroughs} Interactive Walkthroughs</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => handleCourseAction('manage', course.id)}
                        className="flex-1 bg-slate-100 hover:bg-primary hover:text-white transition-all text-slate-700 py-2 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        [Manage Course]
                      </button>
                      <button
                        onClick={() => handleCourseAction('analytics', course.id)}
                        className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        [View Analytics]
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>




          {/* STUDENT INSIGHTS Section */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-slate-900 mb-6">📊 STUDENT INSIGHTS</h2>
            <div className="space-y-4">
              {/* Students Needing Attention */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  <span className="text-sm font-semibold text-slate-900">Students Needing Attention: 8</span>
                </div>
                <button
                  onClick={handleStudentInsights}
                  className="text-xs text-amber-600 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  [View Detailed Analytics →]
                </button>
              </div>




              {/* Individual Student Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">John Doe - 30% progress</h4>
                    <p className="text-xs text-slate-500">Behind schedule</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStudentProfile('john-doe')}
                      className="text-xs text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    >
                      [View Profile]
                    </button>
                    <button
                      onClick={() => handleSendResources('john-doe')}
                      className="text-xs text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    >
                      [Send Resources]
                    </button>
                  </div>
                </div>




                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Jane Smith - Failed assessments</h4>
                    <p className="text-xs text-slate-500">Needs intervention</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStudentProfile('jane-smith')}
                      className="text-xs text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    >
                      [View Profile]
                    </button>
                    <button
                      onClick={() => handleGenerateContent('jane-smith', 'assessments')}
                      className="text-xs text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    >
                      [Schedule Check-in]
                    </button>
                  </div>
                </div>
              </div>




              {/* View All At-Risk Students */}
              <div className="mt-4">
                <button
                  onClick={() => navigate('/trainer/analytics?filter=at-risk')}
                  className="text-xs text-slate-600 hover:text-primary transition-colors cursor-pointer"
                >
                  [View All At-Risk Students →]
                </button>
              </div>
            </div>




            <button
              onClick={handleStudentInsights}
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer"
            >
              View Detailed Analytics →
            </button>
          </section>




          {/* AI CONTENT STUDIO Section */}
          <section className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden animate-slide-in" style={{ animationDelay: '0.4s' }}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold tracking-tight mb-6">🤖 AI CONTENT STUDIO</h2>
             
              <div className="mb-6">
                <p className="text-sm text-slate-300 mb-4">Quick Actions:</p>
                <div className="space-y-3">
                  <div onClick={() => navigate('/trainer/ai-studio?tool=audio')} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-primary">mic</span>
                    <span>• Generate Audio Summary</span>
                  </div>
                  <div onClick={() => navigate('/trainer/ai-studio?tool=video')} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-primary">movie</span>
                    <span>• Create Video Explainer</span>
                  </div>
                  <div onClick={() => navigate('/trainer/ai-studio?tool=walkthrough')} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-primary">route</span>
                    <span>• Build Interactive Walkthrough</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <span>• AI-Enhance Existing Content</span>
                  </div>
                </div>
              </div>




              <button
                onClick={handleAIStudio}
                className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                [Open AI Studio →]
              </button>
            </div>
          </section>




          {/* CONTENT LIBRARY Section */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-slide-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">📁 CONTENT LIBRARY</h2>
            <p className="text-sm text-slate-500 mb-6">Reuse materials from previous sessions</p>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-4">
              <span className="text-sm font-semibold text-slate-900">Recent uploads: 5 • Total materials: 234</span>
            </div>
            <button
              onClick={handleContentLibrary}
              className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer"
            >
              [Browse Library →]
            </button>
          </section>
        </div>
      </main>


      {/* Course Creation Modal */}
      {showCourseCreationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
              <button
                onClick={handleCourseCreationCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>


            <form onSubmit={handleCourseCreationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={newCourseData.title}
                  onChange={(e) => setNewCourseData({...newCourseData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Advanced Python Programming"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData({...newCourseData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Brief description of the course..."
                  rows="3"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newCourseData.duration}
                  onChange={(e) => setNewCourseData({...newCourseData, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 8 weeks"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={newCourseData.category}
                  onChange={(e) => setNewCourseData({...newCourseData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Level
                </label>
                <div className="flex gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={newCourseData.level === level}
                        onChange={(e) => setNewCourseData({...newCourseData, level: e.target.value})}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCourseCreationCancel}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




export default TrainerDashboard;


































































































