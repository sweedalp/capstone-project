import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import VoiceAIDrawer from '../../components/VoiceAIDrawer';
import '../../index.css';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const notificationsRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  useEffect(() => {
    apiClient.get('/api/v1/dashboard/')
      .then(res => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load dashboard');
        setLoading(false);
      });
  }, []);

  const firstName = dashboardData?.welcome_name || userName.split(' ')[0];
  const weeklyGoalPercent = dashboardData?.weekly_goal_percent ?? 0;
  const modulesRemaining = dashboardData?.modules_remaining ?? 0;
  const learningProgressCourses = dashboardData?.courses_in_progress || [];
  const upcomingDeadlines = dashboardData?.upcoming_deadlines || [];
  const recentActivities = dashboardData?.recent_activity || [];
  const personalizedRecommendations = dashboardData?.struggles || [];

  const notifications = [
    { id: 1, type: 'deadline', icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, type: 'achievement', icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, type: 'ai', icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, type: 'course', icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const handleAskAI = () => { navigate('/learner/ai-hub', { state: { openChat: true } }); };
  const handleNotificationsToggle = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/learner/search', { state: { query: searchQuery } });
  };

  const handleSearchKeyPress = (e) => { if (e.key === 'Enter') handleSearch(e); };

  const handleContinueCourse = (course) => {
    navigate(`/learner/courses/${course.id}`);
  };

  const handleRecommendationClick = (recommendation) => {
    navigate(`/learner/courses/${recommendation.course_id}/lessons/${recommendation.lesson_id}`, {
      state: { aiEnhancement: recommendation.lesson_type }
    });
  };

  const handleMediaIconClick = (e, recommendation) => {
    e.stopPropagation();
    navigate('/learner/ai-hub', { state: { contentType: recommendation.lesson_type, autoPlay: true } });
  };

  const formatDeadline = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    };
  };

  const getProgressColor = (percent) => {
    if (percent >= 70) return { bar: 'bg-blue-600', text: 'text-blue-600' };
    if (percent >= 40) return { bar: 'bg-emerald-500', text: 'text-emerald-500' };
    return { bar: 'bg-purple-500', text: 'text-purple-500' };
  };

  const getLessonIcon = (type) => {
    if (type === 'video') return { icon: 'movie', color: 'text-rose-600', bg: 'bg-rose-50' };
    if (type === 'audio') return { icon: 'headphones', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: 'article', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
          <p className="text-slate-700 font-bold mb-2">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer" href="#">
            <span className="material-symbols-outlined">dashboard</span><span>Dashboard</span>
          </a>
          <button onClick={() => navigate('/learner/courses')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">book_5</span><span>My Courses</span>
          </button>
          <button onClick={() => navigate('/learner/ai-hub')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">psychology</span><span>AI Learning Hub</span>
          </button>
          <button onClick={() => navigate('/learner/analytics')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">monitoring</span><span>Analytics</span>
          </button>
          <button onClick={() => navigate('/learner/search')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">search</span><span>Search & QA</span>
          </button>
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">bookmark</span><span>Saved Resources</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">settings</span><span>Settings</span>
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 hover:text-blue-600 cursor-pointer z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400" placeholder="Search courses, concepts, or files..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearchKeyPress} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={handleAskAI} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span><span>Ask AI</span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button onClick={handleNotificationsToggle} className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] max-h-[500px] flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">close</span></button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} rounded-full flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-lg ${notification.iconColor}`}>{notification.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{notification.title}</p>
                              {notification.unread && <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">{notification.message}</p>
                            <p className="text-xs text-slate-400">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 w-full text-center">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
              </div>
              <ProfileDropdown userName={userName} userEmail={userEmail} profileImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {firstName}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">
              You've completed <span className="text-blue-600 font-bold">{weeklyGoalPercent}%</span> of your weekly goal.{' '}
              {modulesRemaining > 0 ? `${modulesRemaining} more modules to go!` : 'Great job this week!'}
            </p>
          </div>

          {/* Learning Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">rocket_launch</span>My Learning Progress
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/learner/courses')}>View All →</button>
            </div>
            {learningProgressCourses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">school</span>
                <p className="text-slate-500 font-medium">No courses in progress yet</p>
                <button onClick={() => navigate('/learner/courses')} className="mt-4 text-blue-600 font-semibold text-sm hover:underline">Browse Courses →</button>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                {learningProgressCourses.map((course) => {
                  const colors = getProgressColor(course.progress_percent);
                  return (
                    <div key={course.id} className="flex-shrink-0 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all cursor-pointer" onClick={() => handleContinueCourse(course)}>
                      <div className="relative h-36 bg-slate-200 dark:bg-slate-800">
                        {course.thumbnail_url
                          ? <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={course.thumbnail_url} alt={course.title} />
                          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-slate-400">school</span></div>
                        }
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">{course.category_name || 'Course'}</p>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 line-clamp-1">{course.title}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span>Progress</span>
                            <span className={colors.text}>{course.progress_percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                            <div className={`${colors.bar} h-full rounded-full`} style={{ width: `${course.progress_percent}%` }}></div>
                          </div>
                          {course.current_module && <p className="text-[10px] text-slate-400">Current: {course.current_module}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Struggles */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">psychology_alt</span>Based on your recent struggles
              </h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              {personalizedRecommendations.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">celebration</span>
                  <p className="text-slate-500 font-medium">No struggles detected — you're doing great!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personalizedRecommendations.map((recommendation) => {
                    const iconData = getLessonIcon(recommendation.lesson_type);
                    return (
                      <div key={recommendation.lesson_id} onClick={() => handleRecommendationClick(recommendation)} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`${iconData.bg} p-2.5 rounded-lg`}>
                            <span className={`material-symbols-outlined ${iconData.color} text-xl`}>{iconData.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{recommendation.lesson_title}</h3>
                              <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full uppercase font-bold">{recommendation.lesson_type}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{recommendation.reason}</p>
                          </div>
                        </div>
                        <button onClick={(e) => handleMediaIconClick(e, recommendation)} className={`flex-shrink-0 ${iconData.bg} p-3 rounded-lg transition-all`}>
                          <span className={`material-symbols-outlined ${iconData.color}`}>{recommendation.lesson_type === 'video' ? 'play_circle' : 'volume_up'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
                    Click any item to review the lesson
                  </p>
                  <button onClick={() => navigate('/learner/revision')} className="text-blue-600 font-semibold hover:underline">View All Recommendations</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recap */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-30px] left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-lg">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">stars</span>Personalized Recap
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Your Daily Learning Brief is Ready</h2>
                  <p className="text-blue-50 mb-6">AI generated a 2-minute recap video and summary points from your study session yesterday.</p>
                  <div className="flex gap-3">
                    <button className="bg-white text-blue-600 font-bold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">Watch Recap</button>
                    <button className="bg-transparent border border-white/30 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">Read Summary</button>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-48 h-32 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center group cursor-pointer">
                  <span className="material-symbols-outlined text-5xl text-white/50 group-hover:scale-110 transition-transform">play_circle</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div onClick={() => navigate('/learner/ai-hub')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all"><span className="material-symbols-outlined">hub</span></div>
              <h3 className="text-lg font-bold mb-2">AI Learning Hub</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Access all neural-enhanced tools and custom GPT models tailored to your curriculum.</p>
              <div className="flex items-center text-sm font-bold text-blue-600 gap-1">Explore Tools <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
            </div>
            <div onClick={() => navigate('/learner/search')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all"><span className="material-symbols-outlined">key_visualizer</span></div>
              <h3 className="text-lg font-bold mb-2">Quick Concept Search</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Semantic search that finds specific concepts across video transcripts and PDFs instantly.</p>
              <div className="flex items-center text-sm font-bold text-amber-600 gap-1">Start Searching <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
            </div>
            <div onClick={() => navigate('/learner/revision')} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-4 group-hover:bg-rose-500 group-hover:text-white transition-all"><span className="material-symbols-outlined">assignment_turned_in</span></div>
              <h3 className="text-lg font-bold mb-2">Revision Assistant</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Let AI generate interactive quizzes based on areas where your performance is dipping.</p>
              <div className="flex items-center text-sm font-bold text-rose-600 gap-1">Practice Now <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden lg:flex flex-col p-6 overflow-y-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Upcoming Deadlines</h3>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No upcoming deadlines 🎉</p>
          ) : (
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => {
                const { day, month } = formatDeadline(deadline.due_date);
                return (
                  <div key={deadline.id} className="flex gap-4 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex flex-col items-center justify-center font-bold text-[10px]">
                      <span className="text-sm">{day}</span><span>{month}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{deadline.title}</p>
                      <p className="text-xs text-slate-500">{deadline.weight_percent ? `Grade Weight ${deadline.weight_percent}%` : 'No grade weight'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No recent activity yet</p>
          ) : (
            <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="relative flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">{activity.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{activity.action} <span className="font-bold">{activity.description}</span></p>
                    <p className="text-xs text-slate-400">{new Date(activity.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
            <span className="material-symbols-outlined text-lg">lightbulb</span>AI Pro Tip
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Try the "Deep Dive" mode on any video to get interactive code snippets generated in real-time.
          </p>
        </div>
      </aside>

      {/* Voice AI Drawer - Header assistant */}
      <VoiceAIDrawer
        isOpen={showVoiceDrawer}
        onClose={() => setShowVoiceDrawer(false)}
        courseContext={{
          courseId: null, // Set to current course ID when available
          lessonId: null
        }}
        userProfile={{
          name: userName,
          email: userEmail,
          role: userRole
        }}
      />
    </div>
  );
};

export default LearnerDashboard;
