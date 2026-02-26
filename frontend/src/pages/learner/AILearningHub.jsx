import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import '../../index.css';

const AILearningHub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = React.useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  const firstName = userName.split(' ')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [currentAudioProgress, setCurrentAudioProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [showWalkthroughPreview, setShowWalkthroughPreview] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [currentWalkthroughStep, setCurrentWalkthroughStep] = useState(0);

  // Real data from backend
  const [streak, setStreak] = useState(0);
  const [revision, setRevision] = useState(null);
  const [videoLessons, setVideoLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock notifications (backend pending)
  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  // Mock walkthroughs (AI walkthrough model not yet built)
  const walkthroughs = [
    {
      id: 1, title: 'JSON Masterclass', description: 'A step-by-step interactive lab for handling complex data structures.',
      fullDescription: 'Master JSON data manipulation with this comprehensive interactive walkthrough.',
      level: 'Intermediate', duration: '25 min', icon: 'data_object', iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
      steps: [
        { name: 'JSON Syntax Basics', instruction: 'Learn the fundamental structure of JSON objects and arrays.', completed: false },
        { name: 'Nested Objects', instruction: 'Work with deeply nested data structures.', completed: false },
        { name: 'Data Validation', instruction: 'Validate JSON data and handle parsing errors.', completed: false },
        { name: 'Practical Exercise', instruction: 'Build a complete JSON processor for API responses.', completed: false },
      ],
      progress: 0, started: false,
    },
    {
      id: 2, title: 'Python Setup Walkthrough', description: 'Complete guide to setting up your Python development environment.',
      fullDescription: 'Get your Python environment configured perfectly.',
      level: 'Beginner', duration: '15 min', icon: 'settings', iconBg: 'bg-green-100', iconColor: 'text-green-600',
      steps: [
        { name: 'Install Python', instruction: 'Download and install Python from python.org', completed: false },
        { name: 'Setup Virtual Environment', instruction: 'Create and activate a virtual environment.', completed: false },
        { name: 'Install Packages', instruction: 'Use pip to install essential Python packages.', completed: false },
      ],
      progress: 0, started: false,
    },
    {
      id: 3, title: 'SQL Query Builder', description: 'Visualize joins and selections through a guided interface.',
      fullDescription: 'Master SQL queries with visual step-by-step guidance.',
      level: 'Intermediate', duration: '20 min', icon: 'database', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
      steps: [
        { name: 'Basic SELECT', instruction: 'Learn to query data from single tables.', completed: true },
        { name: 'WHERE Clauses', instruction: 'Filter data with conditions.', completed: true },
        { name: 'JOIN Operations', instruction: 'Combine data from multiple tables.', completed: true },
        { name: 'Advanced Queries', instruction: 'Use subqueries and aggregations.', completed: false },
      ],
      progress: 75, started: true,
    },
  ];

  // ── Fetch real data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchHub = async () => {
      try {
        const res = await apiClient.get('/api/v1/ai-hub/');
        setStreak(res.data.daily_streak || 0);
        setRevision(res.data.revision_assistant || null);
        setVideoLessons(res.data.video_lessons || []);
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error('AI Hub load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, []);

  // ── Close notifications outside click ──────────────────────────
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/learner/search', { state: { query: searchQuery } });
  };

  const handleStartReviewSession = () => {
    if (revision?.has_data) {
      navigate('/learner/revision', {
        state: {
          topic: revision.topic,
          quizScore: revision.score,
          lessonId: revision.focus_lesson?.lesson_id,
        }
      });
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    setIsVideoPlaying(false);
  };

  const handleAudioPlay = (audio) => {
    setPlayingAudioId(playingAudioId === audio.id ? null : audio.id);
    setSelectedAudio(audio);
    setShowAudioPlayer(true);
    setCurrentAudioProgress(audio.progress || 0);
  };

  const handleStartWalkthrough = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setCurrentWalkthroughStep(0);
    setShowWalkthroughOverlay(true);
  };

  const handleWalkthroughTitleClick = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setShowWalkthroughPreview(true);
  };

  const getLessonTypeIcon = (type) => {
    if (type === 'video') return 'play_circle';
    if (type === 'audio') return 'headphones';
    if (type === 'quiz') return 'quiz';
    return 'article';
  };

  const getLessonTypeBg = (type) => {
    if (type === 'video') return 'bg-blue-100 text-blue-600';
    if (type === 'audio') return 'bg-purple-100 text-purple-600';
    if (type === 'quiz') return 'bg-green-100 text-green-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg"><span className="material-symbols-outlined text-2xl">auto_awesome</span></div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button onClick={() => navigate('/learner/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">dashboard</span><span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/learner/courses')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">book_5</span><span>My Courses</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold w-full text-left">
            <span className="material-symbols-outlined">psychology</span><span>AI Learning Hub</span>
          </button>
          <button onClick={() => navigate('/learner/analytics')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">monitoring</span><span>Analytics</span>
          </button>
          <button onClick={() => navigate('/learner/search')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">search</span><span>Search & QA</span>
          </button>
          <div className="pt-8 pb-2 px-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p></div>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">bookmark</span><span>Saved Resources</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">settings</span><span>Settings</span>
          </a>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Storage Used</p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden"><div className="bg-blue-600 h-full w-[65%]"></div></div>
            <p className="text-[10px] mt-2 text-slate-400">1.3GB of 2GB cloud sync used</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm" placeholder="Search courses, concepts, or files..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span><span>Ask AI</span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] max-h-[500px] flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div><h3 className="text-sm font-bold">Notifications</h3>{unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}</div>
                    <button onClick={() => setShowNotifications(false)}><span className="material-symbols-outlined text-lg text-slate-400">close</span></button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 ${n.iconBg} rounded-full flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-lg ${n.iconColor}`}>{n.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold line-clamp-1">{n.title}</p>
                              {n.unread && <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-1">{n.message}</p>
                            <p className="text-xs text-slate-400">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <button className="text-sm font-semibold text-blue-600 w-full text-center">View All Notifications</button>
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
              <ProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-10 py-8">
          {/* Welcome Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-slate-900 text-4xl font-black tracking-tight mb-2">Welcome back, {firstName}</h1>
              <p className="text-slate-500 text-lg">Your personalized learning path for today is ready.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Streak</span>
              <span className="text-xl font-bold text-slate-900 flex items-center gap-1">
                {loading ? '...' : `${streak} Days`}
                <span className="material-symbols-outlined text-orange-500 text-[20px]">local_fire_department</span>
              </span>
            </div>
          </div>

          {/* Revision Assistant — real from backend */}
          <div className="mb-12">
            <h2 className="text-slate-900 text-xl font-bold mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              Personalized Revision Assistant
            </h2>

            {loading ? (
              <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
            ) : revision?.has_data ? (
              <div className="relative overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col md:flex-row items-stretch bg-gradient-to-r from-white to-blue-600/5 rounded-lg overflow-hidden">
                  <div className="flex-[1.5] p-8 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold mb-4 w-fit">
                      <span className="material-symbols-outlined text-xs">bolt</span> AI RECOMMENDATION
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-3">Mastering {revision.topic}</h3>
                    <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                      Based on your recent quiz score ({Math.round(revision.score)}%), we've identified gaps in your understanding. Let's fix that now.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <button onClick={handleStartReviewSession}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all">
                        <span className="material-symbols-outlined">auto_fix_high</span>Start Review Session
                      </button>
                      <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                        View Performance Analysis
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center min-h-[200px]">
                    <span className="material-symbols-outlined text-blue-300 text-[100px]">psychology</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">quiz</span>
                <p className="text-slate-500 font-medium">Complete a quiz to get personalized revision recommendations.</p>
                <button onClick={() => navigate('/learner/courses')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Browse Courses
                </button>
              </div>
            )}

            {/* Recommended lessons from revision endpoint */}
            {revision?.has_data && revision.recommended_lessons?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-slate-900 text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">recommend</span>
                  Recommended for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {revision.recommended_lessons.map((lesson) => (
                    <div key={lesson.lesson_id} onClick={() => navigate(lesson.url)}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:ring-2 hover:ring-blue-600/20 transition-all cursor-pointer group">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getLessonTypeBg(lesson.lesson_type)}`}>
                          <span className="material-symbols-outlined text-[20px]">{getLessonTypeIcon(lesson.lesson_type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{lesson.title}</h4>
                          <p className="text-slate-500 text-xs capitalize">{lesson.lesson_type} • {lesson.duration_minutes}m</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{lesson.course_title}</p>
                    </div>
                  ))}

                  {/* Quiz card from quizzes endpoint */}
                  {quizzes[0] && (
                    <div onClick={() => navigate(`/learner/courses/${quizzes[0].course_id}/assessments/${quizzes[0].lesson_id}`)}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:ring-2 hover:ring-blue-600/20 transition-all cursor-pointer group">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-green-600 text-[20px]">quiz</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 line-clamp-2">{quizzes[0].title}</h4>
                          <p className="text-slate-500 text-xs">Quiz • {quizzes[0].duration_minutes}m</p>
                        </div>
                      </div>
                      {quizzes[0].last_score != null && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Last score</span>
                          <span className="text-xs font-bold text-blue-600">{Math.round(quizzes[0].last_score)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-12">

              {/* Video Explainers — real from backend */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">play_circle</span>
                    Video Explainers
                  </h2>
                  <button onClick={() => navigate('/learner/courses')} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                    View All Videos<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex gap-6">
                    {[1,2,3].map(i => <div key={i} className="flex-none w-72 h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>)}
                  </div>
                ) : videoLessons.length > 0 ? (
                  <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                    {videoLessons.map((video) => (
                      <div key={video.lesson_id} className="flex-none w-72 snap-start group">
                        <div onClick={() => handleVideoClick(video)} className="relative aspect-video rounded-xl overflow-hidden mb-3 cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200">
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur rounded-full size-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                              <span className="material-symbols-outlined text-blue-600">play_arrow</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300 text-[60px]">play_circle</span>
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded">
                            {video.duration_minutes}m
                          </div>
                        </div>
                        <h4 onClick={() => navigate(video.url)} className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                          {video.title}
                        </h4>
                        <p className="text-slate-500 text-xs">{video.course_title} • {video.module_title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">play_circle</span>
                    <p className="text-slate-500">Enroll in courses with video lessons to see them here.</p>
                  </div>
                )}
              </section>

              {/* Audio — mock (AI audio generation pending) */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">headphones</span>
                    Audio Summaries & Podcasts
                  </h2>
                  <span className="text-xs text-slate-400 italic">AI audio generation coming soon</span>
                </div>
                {[
                  { id: 'a1', title: 'Python Functions Explained', duration: '12:04', progress: 33 },
                  { id: 'a2', title: 'Loops & Iteration Mastery', duration: '08:30', progress: 0 },
                  { id: 'a3', title: 'Data Types & Variables', duration: '05:00', progress: 0 },
                ].map((audio) => (
                  <div key={audio.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-600/30 transition-all hover:shadow-md group mb-4">
                    <button onClick={() => handleAudioPlay(audio)}
                      className={`size-12 rounded-full flex items-center justify-center transition-all ${playingAudioId === audio.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white'}`}>
                      <span className="material-symbols-outlined">{playingAudioId === audio.id ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800">{audio.title}</h4>
                        <span className="text-xs text-slate-400">{audio.duration}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${audio.progress}%` }}></div>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedAudio(audio); setShowTranscriptModal(true); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                ))}
              </section>
            </div>

            {/* Walkthroughs — mock (AI walkthrough model pending) */}
            <div className="lg:col-span-1">
              <section className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">route</span>
                    Walkthroughs
                  </h2>
                  <span className="text-xs text-slate-400 italic">Coming soon</span>
                </div>
                <div className="space-y-6">
                  {walkthroughs.map((wt) => (
                    <div key={wt.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm group hover:ring-2 hover:ring-blue-600/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`size-12 rounded-xl ${wt.iconBg} ${wt.iconColor} flex items-center justify-center`}>
                          <span className="material-symbols-outlined">{wt.icon}</span>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">{wt.level}</span>
                      </div>
                      <h4 onClick={() => handleWalkthroughTitleClick(wt)} className="font-bold text-slate-900 text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors">{wt.title}</h4>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{wt.description}</p>
                      <div className="space-y-3 mb-6">
                        {wt.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`size-2 rounded-full ${step.completed ? 'bg-blue-600' : 'bg-blue-600/30'}`}></div>
                            <span className={`text-xs font-medium ${step.completed ? 'text-slate-700' : 'text-slate-400'}`}>{step.name}</span>
                          </div>
                        ))}
                      </div>
                      {wt.progress > 0 && (
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${wt.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{wt.progress}% Done</span>
                        </div>
                      )}
                      <button onClick={() => handleStartWalkthrough(wt)}
                        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${wt.started ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        {wt.started ? 'Continue Lab' : 'Start Guided Path'}
                        <span className="material-symbols-outlined text-[18px]">{wt.started ? 'forward' : 'chevron_right'}</span>
                      </button>
                    </div>
                  ))}
                  <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
                    <span className="material-symbols-outlined text-4xl mb-3 block">workspace_premium</span>
                    <h4 className="font-bold text-lg mb-1">Unlock AI Mentor</h4>
                    <p className="text-white/80 text-xs mb-4">Get real-time feedback and voice-guided support.</p>
                    <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">Upgrade to Premium</button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Transcript Modal */}
      {showTranscriptModal && selectedAudio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTranscriptModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold">{selectedAudio.title}</h3>
                <p className="text-sm text-slate-500">Full Transcript • {selectedAudio.duration}</p>
              </div>
              <button onClick={() => setShowTranscriptModal(false)}><span className="material-symbols-outlined text-slate-400">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-slate-700 leading-relaxed text-sm italic">AI-generated transcript coming soon. Audio content generation is not yet built.</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Player */}
      {showAudioPlayer && selectedAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
            <button onClick={() => setPlayingAudioId(playingAudioId === selectedAudio.id ? null : selectedAudio.id)}
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
              <span className="material-symbols-outlined text-2xl">{playingAudioId === selectedAudio.id ? 'pause' : 'play_arrow'}</span>
            </button>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate mb-1">{selectedAudio.title}</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${currentAudioProgress}%` }}></div>
                </div>
                <span className="text-xs text-slate-400">{selectedAudio.duration}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic hidden md:block">AI audio generation coming soon</p>
            <button onClick={() => setShowAudioPlayer(false)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400">play_circle</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedVideo.title}</h3>
                  <p className="text-sm text-slate-400">{selectedVideo.duration_minutes}m • {selectedVideo.course_title}</p>
                </div>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {!isVideoPlaying ? (
                <div className="flex flex-col items-center">
                  <button onClick={() => setIsVideoPlaying(true)} className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all shadow-2xl hover:scale-110 mb-4">
                    <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
                  </button>
                  <p className="text-slate-400 text-sm">Click to play</p>
                </div>
              ) : (
                <div className="text-center">
                  <span className="material-symbols-outlined text-blue-400 text-6xl mb-4 block">play_circle</span>
                  <p className="text-slate-400">Video player coming soon</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-800/50 flex items-center justify-between">
              <button onClick={() => setIsVideoPlaying(!isVideoPlaying)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                <span className="material-symbols-outlined text-[20px]">{isVideoPlaying ? 'pause' : 'play_arrow'}</span>
                {isVideoPlaying ? 'Pause' : 'Play Video'}
              </button>
              <button onClick={() => { setShowVideoModal(false); navigate(selectedVideo.url); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600">
                <span className="material-symbols-outlined text-[20px]">school</span>Go to Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Preview Modal */}
      {showWalkthroughPreview && selectedWalkthrough && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWalkthroughPreview(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-xl ${selectedWalkthrough.iconBg} ${selectedWalkthrough.iconColor} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl">{selectedWalkthrough.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedWalkthrough.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{selectedWalkthrough.duration}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold">{selectedWalkthrough.level}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowWalkthroughPreview(false)}><span className="material-symbols-outlined text-slate-400">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-slate-700 leading-relaxed mb-6">{selectedWalkthrough.fullDescription}</p>
              <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">What You'll Learn</h4>
              <div className="space-y-3">
                {selectedWalkthrough.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm mb-1">{step.name}</h5>
                      <p className="text-slate-600 text-xs">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={() => setShowWalkthroughPreview(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Close</button>
              <button onClick={() => { setShowWalkthroughPreview(false); handleStartWalkthrough(selectedWalkthrough); }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>Start Walkthrough
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Overlay */}
      {showWalkthroughOverlay && selectedWalkthrough && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl ${selectedWalkthrough.iconBg} ${selectedWalkthrough.iconColor} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{selectedWalkthrough.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedWalkthrough.title}</h3>
                  <p className="text-sm text-slate-500">Step {currentWalkthroughStep + 1} of {selectedWalkthrough.steps.length}</p>
                </div>
              </div>
              <button onClick={() => { setShowWalkthroughOverlay(false); setSelectedWalkthrough(null); setCurrentWalkthroughStep(0); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedWalkthrough.steps.map((_, idx) => (
                  <div key={idx} className={`flex-1 h-1.5 rounded-full transition-all ${idx < currentWalkthroughStep ? 'bg-green-600' : idx === currentWalkthroughStep ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                  Step {currentWalkthroughStep + 1}
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">{selectedWalkthrough.steps[currentWalkthroughStep].name}</h4>
                <p className="text-slate-700 text-lg leading-relaxed mb-8">{selectedWalkthrough.steps[currentWalkthroughStep].instruction}</p>
                <div className="bg-slate-50 rounded-xl p-8 border-2 border-dashed border-slate-300 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <span className="material-symbols-outlined text-3xl">play_circle</span>
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">Interactive Exercise Area</h5>
                  <p className="text-slate-600 text-sm mb-4">Interactive environment coming soon.</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>Step ready to continue
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <button onClick={() => setCurrentWalkthroughStep(s => Math.max(0, s - 1))} disabled={currentWalkthroughStep === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined">arrow_back</span>Previous
              </button>
              {currentWalkthroughStep < selectedWalkthrough.steps.length - 1 ? (
                <button onClick={() => setCurrentWalkthroughStep(s => s + 1)} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                  Next Step<span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button onClick={() => { setShowWalkthroughOverlay(false); setSelectedWalkthrough(null); setCurrentWalkthroughStep(0); }}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                  <span className="material-symbols-outlined">check_circle</span>Complete Walkthrough
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;