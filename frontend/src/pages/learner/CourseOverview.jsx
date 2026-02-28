import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import LearnerSidebar from '../../components/LearnerSidebar';
import apiClient from '../../services/api';
import '../../index.css';

const CourseOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();

  // Real data
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  // Mock objectives — real model pending (LearningObjective table not built yet)
  const [objectives, setObjectives] = useState([
    { id: 1, text: 'Complete all modules in order', completed: false },
    { id: 2, text: 'Score above 70% on all quizzes', completed: false },
    { id: 3, text: 'Watch all video lessons', completed: false },
    { id: 4, text: 'Try the AI walkthrough feature', completed: false },
    { id: 5, text: 'Finish the final assessment', completed: false },
  ]);

  // Mock notifications (real endpoint not yet built)
  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'A new module has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
    if (location.state?.showEnrollModal) setShowEnrollModal(true);
  }, [location.state]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/content/courses/${courseId}/modules`),
      apiClient.get('/api/v1/courses/my/enrolled'),
    ]).then(([courseRes, modulesRes, enrolledRes]) => {
      setCourse(courseRes.data);
      setModules(modulesRes.data || []);
      const myEnrollment = enrolledRes.data.find(e => e.id === parseInt(courseId));
      if (myEnrollment) {
        setEnrollment(myEnrollment);
        setProgressPercent(myEnrollment.progress_percent || 0);
        const firstIncomplete = (modulesRes.data || []).findIndex(m => m.lessons?.some(l => !l.is_completed));
        setExpandedChapter(firstIncomplete >= 0 ? firstIncomplete : 0);
      } else {
        setExpandedChapter(0);
      }
      setLoading(false);
    }).catch(() => { setError('Failed to load course'); setLoading(false); });
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await apiClient.post('/api/v1/enrollments/', { course_id: parseInt(courseId) });
      setEnrollment(res.data);
      setShowEnrollModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const getFirstIncompleteLesson = () => {
    for (const mod of modules) {
      for (const lesson of (mod.lessons || [])) {
        if (!lesson.is_completed) return lesson;
      }
    }
    return modules[0]?.lessons?.[0] || null;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  };

  const getLessonIcon = (type) => {
    if (type === 'video') return 'movie';
    if (type === 'quiz') return 'quiz';
    return 'article';
  };

  const toggleObjective = (id) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, completed: !o.completed } : o));
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading course...</p>
      </div>
    </div>
  );

  if (error || !course) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
        <p className="text-slate-700 font-bold mb-4">{error || 'Course not found'}</p>
        <button onClick={() => navigate('/learner/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Back to Courses</button>
      </div>
    </div>
  );

  const continueLesson = getFirstIncompleteLesson();

  // Mock AI Hub content (real AI content model not yet built)
  const aiHubContent = {
    audioSummaries: [
      { title: `${course.title} - Key Concepts`, duration: '8:30', chapter: 'Module 1' },
      { title: `${course.title} - Deep Dive`, duration: '6:15', chapter: 'Module 2' },
    ],
    videoTopics: modules.slice(0, 4).map(m => m.title?.split(':')[0] || m.title),
    walkthroughs: modules.slice(0, 2).map((m, i) => ({
      title: `Walkthrough: ${m.title}`,
      duration: '15 min',
      lessonId: m.lessons?.[0]?.id,
    })),
  };

  // Mock resources (real CourseResource model not yet built)
  const resources = [
    { name: `${course.title} - Study Guide`, type: 'PDF', size: '2.4 MB', icon: 'picture_as_pdf', color: 'text-red-600' },
    { name: 'Practice Exercises', type: 'ZIP', size: '1.8 MB', icon: 'code', color: 'text-blue-600' },
    { name: 'Course Slides', type: 'PDF', size: '5.1 MB', icon: 'description', color: 'text-green-600' },
  ];

  const keyTakeaways = [
    `Master the core concepts of ${course.title}`,
    'Build practical skills through hands-on exercises',
    'Integrate AI tools to optimize your learning speed',
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <LearnerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate('/learner/search', { state: { query: searchQuery } }); }} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm" placeholder="Search courses, concepts, or files..."
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span><span>Ask AI</span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] max-h-[500px] flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">close</span></button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.map((n) => (
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
                    <button onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-blue-600 w-full text-center">View All Notifications</button>
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

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="w-full mx-auto px-4 lg:px-8 py-8">
            <button onClick={() => navigate('/learner/courses')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6 group">
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="font-semibold">Back to Catalog</span>
            </button>

            {/* Hero */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-32 h-32 rounded-xl object-cover shadow-lg" />
                    : <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-outlined text-6xl">school</span>
                    </div>
                  }
                </div>
                <div className="flex-1 text-center md:text-left">
                  {course.category_name && <p className="text-xs font-bold text-blue-600 uppercase mb-1">{course.category_name}</p>}
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 text-sm mb-6">
                    {course.trainer_name && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">person</span>{course.trainer_name}</span>}
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">schedule</span>{formatDuration(course.duration_minutes)}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">{course.level}</span>
                    {course.total_lessons > 0 && <span>{course.total_lessons} lessons</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {enrollment && continueLesson ? (
                      <button onClick={() => navigate(`/learner/courses/${courseId}/lessons/${continueLesson.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        <span className="material-symbols-outlined">play_circle</span>Continue Where You Left Off
                      </button>
                    ) : !enrollment ? (
                      <button onClick={() => setShowEnrollModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md">
                        <span className="material-symbols-outlined">school</span>Enroll Now
                      </button>
                    ) : (
                      <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>Completed!
                      </button>
                    )}
                    {enrollment && (
                      <button onClick={() => {
                        const allLessons = modules.flatMap(m => m.lessons || []);
                        const firstQuiz = allLessons.find(l => l.lesson_type === 'quiz');
                        if (firstQuiz) {
                          navigate(`/learner/courses/${courseId}/assessments/${firstQuiz.id}`);
                        }
                      }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined">quiz</span>Take Assessment
                      </button>
                    )}
                    <button onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        navigator.share({ title: course.title, text: `Check out this course: ${course.title}`, url });
                      } else {
                        navigator.clipboard.writeText(url).then(() => alert('Course link copied to clipboard!')).catch(() => alert('Could not copy link'));
                      }
                    }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all">
                      <span className="material-symbols-outlined">share</span>Share
                    </button>
                  </div>
                </div>
                {enrollment && (
                  <div className="shrink-0 flex flex-col items-center gap-2 p-4 bg-blue-600/5 rounded-xl border border-blue-600/10">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle className="text-slate-200" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                        <circle className="text-blue-600 transition-all duration-700" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="8" />
                      </svg>
                      <span className="absolute text-xl font-bold text-slate-900">{Math.round(progressPercent)}%</span>
                    </div>
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Overall Progress</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {/* Tabs */}
                <div className="border-b border-slate-200">
                  <nav className="flex gap-8 overflow-x-auto no-scrollbar">
                    {[
                      ['overview', 'Overview'],
                      ['content', 'Content'],
                      ['ai-hub', 'AI Hub', true],
                      ['resources', 'Resources'],
                    ].map(([key, label, badge]) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>
                        {label}
                        {badge && <span className="bg-blue-600/10 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">Smart</span>}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Course Description</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">{course.description || 'No description provided.'}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                      <div className="text-center"><p className="text-2xl font-bold text-blue-600">{course.total_modules || 0}</p><p className="text-xs text-slate-500 mt-1">Modules</p></div>
                      <div className="text-center"><p className="text-2xl font-bold text-blue-600">{course.total_lessons || 0}</p><p className="text-xs text-slate-500 mt-1">Lessons</p></div>
                      <div className="text-center"><p className="text-2xl font-bold text-blue-600">{formatDuration(course.duration_minutes)}</p><p className="text-xs text-slate-500 mt-1">Duration</p></div>
                      <div className="text-center"><p className="text-2xl font-bold text-blue-600 capitalize">{course.level}</p><p className="text-xs text-slate-500 mt-1">Level</p></div>
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    {modules.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">menu_book</span>
                        <p className="text-slate-500">No modules available yet.</p>
                      </div>
                    ) : modules.map((mod, modIdx) => {
                      const completedCount = (mod.lessons || []).filter(l => l.is_completed).length;
                      const totalCount = (mod.lessons || []).length;
                      const isCompleted = totalCount > 0 && completedCount === totalCount;
                      const isCurrent = !isCompleted && (mod.lessons || []).some(l => !l.is_completed);
                      return (
                        <div key={mod.id} className={`bg-white rounded-xl overflow-hidden border transition-all ${isCurrent ? 'border-2 border-blue-600 shadow-md' : 'border-slate-200'}`}>
                          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setExpandedChapter(expandedChapter === modIdx ? null : modIdx)}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                <span className={`material-symbols-outlined text-lg ${isCompleted ? 'text-green-600' : isCurrent ? 'text-white' : 'text-slate-500'}`}>
                                  {isCompleted ? 'check' : isCurrent ? 'play_arrow' : 'lock_open'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{mod.title}</h3>
                                <p className={`text-xs ${isCurrent ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                                  {completedCount}/{totalCount} lessons complete
                                  {mod.description ? ` • ${mod.description}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`material-symbols-outlined ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                              {expandedChapter === modIdx ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                          {expandedChapter === modIdx && (
                            <div className="divide-y divide-slate-100">
                              {(mod.lessons || []).map((lesson) => (
                                <div key={lesson.id}
                                  onClick={() => enrollment ? navigate(`/learner/courses/${courseId}/lessons/${lesson.id}`) : setShowEnrollModal(true)}
                                  className="p-4 flex items-center justify-between group hover:bg-slate-50 cursor-pointer transition-colors">
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className="relative">
                                      <span className="material-symbols-outlined p-2 rounded-lg bg-blue-600/10 text-blue-600 group-hover:scale-110 transition-transform">
                                        {getLessonIcon(lesson.lesson_type)}
                                      </span>
                                      {lesson.is_completed && (
                                        <span className="absolute -top-1 -right-1 material-symbols-outlined text-green-600 text-lg bg-white rounded-full">check_circle</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-medium group-hover:text-blue-600 transition-colors ${lesson.is_completed ? 'text-slate-500' : 'text-slate-900'}`}>{lesson.title}</p>
                                      <p className="text-xs text-slate-400 capitalize">{lesson.lesson_type}{lesson.duration_minutes ? ` • ${lesson.duration_minutes}m` : ''}</p>
                                    </div>
                                  </div>
                                  <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-all">arrow_forward</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Hub Tab — mock content, real AI model not yet built */}
                {activeTab === 'ai-hub' && (
                  <div className="space-y-6">
                    {/* Audio Summaries */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-2xl">mic</span>
                          <h2 className="text-xl font-bold">Audio Summaries</h2>
                          <span className="bg-blue-600/10 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">{aiHubContent.audioSummaries.length * 6} available</span>
                        </div>
                        <button onClick={() => navigate('/learner/ai-hub', { state: { filter: 'audio', courseId } })} className="text-sm text-blue-600 hover:text-blue-700 font-semibold">View All →</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiHubContent.audioSummaries.map((audio, idx) => (
                          <div key={idx} onClick={() => { setSelectedMedia({ type: 'audio', title: audio.title, duration: audio.duration, chapter: audio.chapter, description: `Listen to an audio summary of ${audio.title}.` }); setShowMediaModal(true); }}
                            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                            <p className="font-semibold text-slate-900 mb-2">🎤 {audio.title}</p>
                            <p className="text-xs text-slate-500 mb-3">{audio.duration} • {audio.chapter}</p>
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">play_arrow</span>Play Audio
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video Explainers */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-2xl">movie</span>
                          <h2 className="text-xl font-bold">Video Explainers</h2>
                          <span className="bg-blue-600/10 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">{aiHubContent.videoTopics.length * 2} available</span>
                        </div>
                        <button onClick={() => navigate('/learner/ai-hub', { state: { filter: 'video', courseId } })} className="text-sm text-blue-600 font-semibold">View All →</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {aiHubContent.videoTopics.map((topic, idx) => (
                          <div key={idx} onClick={() => { setSelectedMedia({ type: 'video', title: `${topic} - Video Explainer`, duration: '5:30', chapter: `Module ${idx + 1}`, description: `Watch a visual explanation of ${topic}.` }); setShowMediaModal(true); }}
                            className="relative group cursor-pointer">
                            <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-blue-600">play_circle</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 mt-2 truncate">{topic}</p>
                            <p className="text-xs text-slate-500">5:30</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Walkthroughs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">explore</span>
                        <h2 className="text-xl font-bold">Interactive Walkthroughs</h2>
                        <span className="bg-blue-600/10 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">{aiHubContent.walkthroughs.length * 3} available</span>
                      </div>
                      <div className="space-y-3">
                        {aiHubContent.walkthroughs.map((walkthrough, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div>
                              <p className="font-semibold text-slate-900">🧭 {walkthrough.title}</p>
                              <p className="text-xs text-slate-500">Step-by-step guide • {walkthrough.duration}</p>
                            </div>
                            <button onClick={() => walkthrough.lessonId && navigate(`/learner/courses/${courseId}/lessons/${walkthrough.lessonId}`, { state: { aiFeature: 'walkthrough', autoStart: true } })}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                              Start
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resources Tab — mock data, real CourseResource model not yet built */}
                {activeTab === 'resources' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Course Resources</h2>
                    <div className="space-y-3">
                      {resources.map((resource, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                          <span className={`material-symbols-outlined ${resource.color} text-2xl`}>{resource.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{resource.name}</p>
                            <p className="text-xs text-slate-500">{resource.type} • {resource.size}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <span className="material-symbols-outlined">download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Real resources will load from the backend once trainers upload them
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Key Takeaways */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-600">tips_and_updates</span>
                    <h2 className="text-lg font-bold">Key Takeaways</h2>
                  </div>
                  <ul className="space-y-4">
                    {keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0"></span>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Objectives — mock data, real LearningObjective model not yet built */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-600">checklist_rtl</span>
                    <h2 className="text-lg font-bold">Learning Objectives</h2>
                  </div>
                  <div className="space-y-3">
                    {objectives.map((objective) => (
                      <label key={objective.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <input checked={objective.completed} onChange={() => toggleObjective(objective.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" type="checkbox" />
                        <span className={`text-sm transition-all ${objective.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {objective.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Milestone Badge */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <span>Milestone Badge</span>
                      <span>{objectives.every(o => o.completed) ? 'Unlocked!' : 'Locked'}</span>
                    </div>
                    <div className={`bg-slate-100 rounded-lg p-3 flex items-center gap-3 ${objectives.every(o => o.completed) ? '' : 'grayscale opacity-60'}`}>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-yellow-600">military_tech</span>
                      </div>
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-700">{course.title} Master</p>
                        <p className="text-slate-500">{objectives.every(o => o.completed) ? 'Congratulations!' : 'Complete all objectives to earn'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Course details */}
                  {!enrollment && (
                    <button onClick={() => setShowEnrollModal(true)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">
                      Enroll for Free
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Enroll in Course</h2>
                <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
              </div>
              <p className="text-slate-600 mb-6">Join and start learning <strong>{course.title}</strong> with AI-enhanced learning!</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">schedule</span>
                  <div><p className="text-sm font-semibold">Flexible Schedule</p><p className="text-xs text-slate-500">Learn at your own pace</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                  <div><p className="text-sm font-semibold">AI Learning Tools</p><p className="text-xs text-slate-500">Video, audio & interactive guides</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">workspace_premium</span>
                  <div><p className="text-sm font-semibold">Certificate</p><p className="text-xs text-slate-500">Earn upon completion</p></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEnrollModal(false)} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold">Maybe Later</button>
                <button onClick={handleEnroll} disabled={enrolling}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {enrolling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">check_circle</span>}
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prerequisite Modal */}
      {showPrerequisiteModal && selectedLockedLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPrerequisiteModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-2xl">lock</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Lesson Locked</h2>
                  <p className="text-sm text-slate-500">Complete prerequisites first</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-slate-900 mb-1">{selectedLockedLesson.title}</p>
                <p className="text-sm text-slate-600">Complete previous lessons to unlock this content.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPrerequisiteModal(false)} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold">Got It</button>
                <button onClick={() => { setShowPrerequisiteModal(false); setExpandedChapter(0); }}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span>Start from Beginning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Player Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMediaModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${selectedMedia.type === 'audio' ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${selectedMedia.type === 'audio' ? 'text-purple-600' : 'text-blue-600'} text-2xl`}>
                      {selectedMedia.type === 'audio' ? 'mic' : 'movie'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedMedia.title}</h2>
                    <p className="text-sm text-slate-500">{selectedMedia.duration} • {selectedMedia.chapter}</p>
                  </div>
                </div>
                <button onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
              </div>
              <p className="text-slate-600 mb-6">{selectedMedia.description}</p>
              <div className={`${selectedMedia.type === 'video' ? 'aspect-video' : 'aspect-[3/1]'} bg-gradient-to-br ${selectedMedia.type === 'audio' ? 'from-purple-500/20 to-blue-500/20' : 'from-blue-500/20 to-blue-600/20'} rounded-lg flex items-center justify-center mb-6`}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-blue-600 mb-2">{selectedMedia.type === 'audio' ? 'graphic_eq' : 'play_circle'}</span>
                  <p className="text-sm text-slate-600">{selectedMedia.type === 'audio' ? 'Audio Player' : 'Video Player'}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">0:00</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-slate-500">{selectedMedia.duration}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-slate-700">replay_10</span>
                  </button>
                  <button className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors">
                    <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-slate-700">forward_10</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowMediaModal(false)} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold">Close</button>
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">bookmark</span>Save to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOverview;