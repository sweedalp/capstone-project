import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Programming']);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [aiFeatures, setAiFeatures] = useState({
    audioSummary: true,
    videoTranscripts: false,
    walkthroughs: true,
    aiTutor: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const notificationsRef = useRef(null);

  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'Learner';

  // Handle Ask AI button click
  const handleAskAI = () => {
    navigate('/learner/ai-hub', {
      state: { openChat: true }
    });
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/learner/search', {
        state: { query: searchQuery }
      });
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'deadline',
      icon: 'schedule',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
      title: 'Neural Nets Quiz Due Soon',
      message: 'Quiz deadline is tomorrow at 11:59 PM',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'achievement',
      icon: 'military_tech',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'New Badge Earned!',
      message: 'You earned "Python Master" badge',
      time: '5 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'ai',
      icon: 'psychology',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'AI Generated Summary Ready',
      message: 'Your study session recap is available',
      time: 'Yesterday',
      unread: false
    },
    {
      id: 4,
      type: 'course',
      icon: 'auto_stories',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'New Lesson Available',
      message: 'Module 4: Deep Learning has been released',
      time: '2 days ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Mock courses data
  const allCourses = [
    {
      id: 1,
      title: 'Advanced Python: AI & ML Integration',
      instructor: 'Dr. Sarah Jenkins',
      duration: '14h 30m',
      level: 'Intermediate',
      levelColor: 'bg-blue-600',
      progress: 65,
      currentModule: 'Neural Nets',
      enrolled: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNgRj7-iSjM8qBSakYeDqNT0IVEKU9D-zNP5wEcho_qSWkn_JjpQ1eqnNh4gKQ4Pb0d148TpkLf1_uPiBdBqrPRKdn0UmX9TOvspv-Q9KIpm7T7w0U4x0BdisiWQPiFkk7SEMjqCf492u2cFdIDon1pzmPrTTCpQlRnvVxVERO4OuALPqoewGLrHdPGpSK6WLdCb3LdaQW9EYNEGEF3_XjbZ2q9-6Te3tYbfWYqsRqg9PVeF1aNPGvo3s5GOVmZYn883Fvz6j5Dmg',
      aiFeatures: ['Audio Summary', 'Video', 'AI Tutor'],
      aiIcons: ['mic', 'smart_display', 'psychology'],
      category: 'Programming'
    },
    {
      id: 2,
      title: 'Data Visualization Mastery with AI',
      instructor: 'Marcus Aurelio',
      duration: '8h 15m',
      level: 'Beginner',
      levelColor: 'bg-amber-500',
      progress: 0,
      enrolled: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5K3KDcXrGLeO4WR4K9hhmtNXR9Ln32k0OgPqPmV4_ECzi3SccqcnbWZD1QzUFJLeaqgGkF_isM03vnPce49QLIp_g5ZG9aRqi2hcyD8EhtSXoeLKivzNV9V37bN2WWK5u1uW9I9KA341jTW1rYe1aWWLi9X7S-bKq-6NIcinEZQUbjaOhaqXfAghEkX2520_MFCfwWb-e69PPG5A6Irc6BJz81Iu1e4C4h_2Z_vW3HPbDXNSMs8cx4MQIAqjSDS15drV5xNNRS8',
      description: 'Learn to build stunning interactive dashboards and use AI to automatically generate data stories and insights for stakeholders.',
      aiFeatures: ['Walkthrough', 'Video'],
      aiIcons: ['explore', 'smart_display'],
      category: 'Data Science'
    },
    {
      id: 3,
      title: 'Generative UI/UX Systems',
      instructor: 'Alex Rivera',
      duration: '22h 45m',
      level: 'Expert',
      levelColor: 'bg-emerald-500',
      progress: 0,
      enrolled: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsQk6Wgf0jKKjXi2EOQc2QP5gjuecZYbsMPpehBDu2NowIdySzlm2xRpq-M1yP1t0kI2ulDxLoaXBxUZr1xMew6UI6FGQatzjwuKTzjcEBr5A66_LqKjJ1y6PjHTQnLBeIztH7f_-ETOs41PaFuJsjlVSzyyW5YRMfM0V-MgIC7HiIYTclaKPnnNjlkhXoUhoCgKcfoBS3YqQQPMRxECK3Dk9ElSb-SxhjNP9OGyh5a878lgZnnhL1rDCiQQAMlp2R5FAK3gQmVrs',
      description: 'Explore the cutting edge of design systems that adapt in real-time using user behavior patterns and AI-driven layout generation.',
      aiFeatures: ['AI Labs', 'Video', 'Interactive'],
      aiIcons: ['psychology', 'smart_display', 'explore'],
      category: 'UI/UX Design'
    }
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAiFeature = (feature) => {
    setAiFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const toggleFavorite = (courseId) => {
    setFavorites(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Filter courses based on active tab
  const getFilteredCourses = () => {
    let filtered = allCourses;
    
    // Filter by tab
    if (activeTab === 'inProgress') {
      filtered = filtered.filter(course => course.enrolled && course.progress > 0 && course.progress < 100);
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(course => course.enrolled && course.progress === 100);
    } else if (activeTab === 'wishlist') {
      filtered = filtered.filter(course => favorites[course.id]);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => selectedCategories.includes(course.category));
    }
    
    // Filter by level
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => navigate('/learner/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer" href="#">
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </a>
          <button 
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </button>
          <button 
            onClick={() => navigate('/learner/analytics')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </button>
          <button 
            onClick={() => navigate('/learner/search')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
           <span className="material-symbols-outlined">search</span>
            <span>Search & QA</span>
          </button>
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>
          
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">bookmark</span>
            <span>Saved Resources</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Storage Used</p>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] mt-2 text-slate-400">1.3GB of 2GB cloud sync used</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button
                type="submit"
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 hover:text-blue-600 cursor-pointer z-10"
              >
                search
              </button>
              <input
                className="block w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50"
                placeholder="Search courses, skills, or instructors..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </form>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
        
          
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={handleNotificationsToggle}
              className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${
                        notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} dark:${notification.iconBg.replace('100', '900/30')} rounded-full flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-lg ${notification.iconColor}`}>
                            {notification.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 w-full text-center"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{userName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
            </div>
            <ProfileDropdown
              userName={userName}
              userEmail={userEmail}
              profileImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM"
            />
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-1 px-6 lg:px-12 py-8 gap-8">
        {/* Sidebar Filter Panel */}
        <aside className="hidden lg:flex w-72 flex-col gap-8 shrink-0">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {['Programming', 'Data Science', 'UI/UX Design', 'Business Intelligence'].map((category) => (
                <label key={category} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Level
            </h3>
            <div className="space-y-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label key={level} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevel === level}
                    onChange={() => setSelectedLevel(level)}
                    className="h-5 w-5 border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="rounded-xl bg-blue-600/5 p-6 border border-blue-600/10">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600 mb-4">
              <span className="material-symbols-outlined text-sm">bolt</span>
              AI Features
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">mic</span>
                  <span className="text-sm font-medium">Audio Summary</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.audioSummary}
                  onChange={() => toggleAiFeature('audioSummary')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">smart_display</span>
                  <span className="text-sm font-medium">AI Video Transcripts</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.videoTranscripts}
                  onChange={() => toggleAiFeature('videoTranscripts')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">explore</span>
                  <span className="text-sm font-medium">Walkthroughs</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.walkthroughs}
                  onChange={() => toggleAiFeature('walkthroughs')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-blue-600/70">psychology</span>
                  <span className="text-sm font-medium">Interactive AI Tutor</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiFeatures.aiTutor}
                  onChange={() => toggleAiFeature('aiTutor')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Tab Navigation */}
          <div className="mb-8 border-b border-slate-200">
            <nav className="flex gap-10">
              <button
                onClick={() => setActiveTab('all')}
                className={`relative pb-4 text-sm font-bold transition-colors ${
                  activeTab === 'all' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Courses
                {activeTab === 'all' && (
                  <span className="absolute bottom-0 left-0 h-1 w-full rounded-t bg-blue-600"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('inProgress')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'inProgress' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'completed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === 'wishlist' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Wishlist
              </button>
            </nav>
          </div>

          {/* Course Cards */}
          <div className="flex flex-col gap-6">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">school_off</span>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No courses found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md cursor-pointer"
                onClick={() => {
                  if (course.enrolled) {
                    navigate(`/learner/courses/${course.id}`);
                  } else {
                    setSelectedCourse(course);
                    setShowEnrollModal(true);
                  }
                }}
              >
                {/* Course Image */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl md:w-64">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={course.title}
                    src={course.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className={`rounded ${course.levelColor} px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(course.id);
                        }}
                        className={`text-slate-400 hover:text-rose-500 transition-colors ${
                          favorites[course.id] ? 'text-rose-500' : ''
                        }`}
                      >
                        <span
                          className="material-symbols-outlined leading-none"
                          style={{ fontVariationSettings: favorites[course.id] ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <span className="material-symbols-outlined text-base">person</span>
                        {course.instructor}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {course.duration}
                      </span>
                    </div>

                    {/* Progress Bar for Enrolled Courses */}
                    {course.enrolled && course.progress > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-600">{course.progress}% Completed</span>
                          <span className="text-slate-400">Current Module: {course.currentModule}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Description for Non-Enrolled Courses */}
                    {!course.enrolled && course.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* AI Features and Action Button */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {course.aiFeatures.map((feature, idx) => (
                        <span
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/learner/courses/${course.id}`, { state: { activeTab: 'aiHub' } });
                          }}
                          className="flex items-center gap-1.5 rounded-full bg-blue-600/10 px-3 py-1 text-[11px] font-semibold text-blue-600 cursor-pointer hover:bg-blue-600/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {course.aiIcons[idx]}
                          </span>
                          {feature}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (course.enrolled) {
                          // Navigate to course overview to continue
                          navigate(`/learner/courses/${course.id}`);
                        } else {
                          // Show enrollment modal
                          setSelectedCourse(course);
                          setShowEnrollModal(true);
                        }
                      }}
                      className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                        course.enrolled
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-600/90'
                          : 'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600/5'
                      }`}
                    >
                      {course.enrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Showing {filteredCourses.length} of {allCourses.length} courses
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 2
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 3
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                3
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                disabled={currentPage === 3}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </main>
        </div>
      </main>
      
      {/* Enrollment Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enroll in Course</h2>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Course Preview */}
              <div className="relative h-48 rounded-xl overflow-hidden">
                <img
                  className="h-full w-full object-cover"
                  alt={selectedCourse.title}
                  src={selectedCourse.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">person</span>
                      {selectedCourse.instructor}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {selectedCourse.duration}
                    </span>
                    <span>•</span>
                    <span className={`rounded ${selectedCourse.levelColor} px-2 py-1 text-[10px] font-bold uppercase tracking-widest`}>
                      {selectedCourse.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              {selectedCourse.description && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">About This Course</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* AI Features */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">AI-Powered Learning Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.aiFeatures.map((feature, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {selectedCourse.aiIcons[idx]}
                      </span>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">check_circle</span>
                  What You'll Learn
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">check</span>
                    <span>Master the fundamentals and advanced concepts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">check</span>
                    <span>Build real-world projects with AI assistance</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">check</span>
                    <span>Get personalized learning recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">check</span>
                    <span>Access interactive AI-generated content</span>
                  </li>
                </ul>
              </div>

              {/* Enrollment Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Free Enrollment</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This course is free to enroll. Start learning immediately with full access to all AI-powered features.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  // Handle enrollment logic here
                  navigate(`/learner/courses/${selectedCourse.id}`);
                }}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CourseCatalog;
