import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import '../../index.css';

const LessonContent = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [audioProgress, setAudioProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'Learner';

  const notifications = [
    { id: 1, title: 'New Lesson Available', message: 'Check out the new lesson added to your course.', time: '5 minutes ago', icon: 'school', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', unread: true },
    { id: 2, title: 'Assignment Due Soon', message: 'Your assignment is due in 2 days.', time: '1 hour ago', icon: 'assignment', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', unread: true },
    { id: 3, title: 'Achievement Unlocked', message: 'You earned the "Quick Learner" badge!', time: '3 hours ago', icon: 'workspace_premium', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', unread: false },
    { id: 4, title: 'Course Update', message: 'New AI-generated content added.', time: '1 day ago', icon: 'update', iconBg: 'bg-green-100', iconColor: 'text-green-600', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語 (Japan)', flag: '🇯🇵' },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/api/v1/content/lessons/${lessonId}`),
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/content/courses/${courseId}/modules`),
    ]).then(([lessonRes, courseRes, modulesRes]) => {
      setLesson(lessonRes.data);
      setCourse(courseRes.data);
      const flat = (modulesRes.data || []).flatMap(m =>
        (m.lessons || []).map(l => ({ ...l, moduleName: m.title }))
      );
      setAllLessons(flat);
      const current = flat.find(l => l.id === parseInt(lessonId));
      setIsCompleted(current?.is_completed || false);
      setLoading(false);
    }).catch(() => { setError('Failed to load lesson'); setLoading(false); });
  }, [courseId, lessonId]);

  const currentIdx = allLessons.findIndex(l => l.id === parseInt(lessonId));
  const previousLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const lessonsByModule = allLessons.reduce((acc, l) => {
    if (!acc[l.moduleName]) acc[l.moduleName] = [];
    acc[l.moduleName].push(l);
    return acc;
  }, {});

  const relatedConcepts = [
    ...allLessons.slice(Math.max(0, currentIdx - 1), currentIdx).map(l => ({ ...l, isPrerequisite: true })),
    ...allLessons.slice(currentIdx + 1, currentIdx + 3).map(l => ({ ...l, isPrerequisite: false })),
  ].filter(l => l.id !== parseInt(lessonId));

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      const enrollRes = await apiClient.get('/api/v1/courses/my/enrolled');
      const enr = enrollRes.data.find(e => e.id === parseInt(courseId));
      if (!enr) throw new Error('Not enrolled');
      await apiClient.post('/api/v1/progress/', {
        enrollment_id: enr.id,
        lesson_id: parseInt(lessonId),
        is_completed: true,
      });
      setIsCompleted(true);
      setAllLessons(prev => prev.map(l => l.id === parseInt(lessonId) ? { ...l, is_completed: true } : l));
      if (nextLesson) setTimeout(() => navigate(`/learner/courses/${courseId}/lessons/${nextLesson.id}`), 500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not mark complete');
    } finally {
      setMarking(false);
    }
  };

  // ── Content helpers ───────────────────────────────────────────────
  const getVideoUrl = () => lesson?.contents?.find(c => c.content_type === 'video_url')?.content || null;
  const getTextBody = () => lesson?.contents?.find(c => c.content_type === 'text_body')?.content || null;
  const getFileUrl = () => lesson?.contents?.find(c => c.content_type === 'file_url')?.content || null;
  const getLessonIcon = (type) => type === 'video' ? 'movie' : type === 'quiz' ? 'quiz' : 'article';

  // ── Universal video config — handles all URL types ────────────────
  const getVideoConfig = (url) => {
    if (!url) return null;

    // Direct video file or uploaded to our server
    if (url.startsWith('/static/') || url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return { type: 'direct', src: url };
    }
    // YouTube watch URL
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    // YouTube short URL
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    // YouTube embed already
    if (url.includes('youtube.com/embed/')) {
      return { type: 'iframe', src: url };
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    // Google Drive
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match) return { type: 'iframe', src: `https://drive.google.com/file/d/${match[1]}/preview` };
    }
    // Loom
    if (url.includes('loom.com/share/')) {
      const id = url.split('loom.com/share/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://www.loom.com/embed/${id}` };
    }
    // Zoom, Google Meet, Teams — cannot embed, show external link
    if (url.includes('zoom.us') || url.includes('meet.google.com') || url.includes('teams.microsoft.com')) {
      return { type: 'external', src: url };
    }
    // Fallback — try iframe
    return { type: 'iframe', src: url };
  };

  // ── Fix: real quiz finder ─────────────────────────────────────────
  const handleStartQuiz = () => {
    const quizLesson = allLessons.find(l =>
      l.lesson_type === 'quiz' && l.moduleName === lesson?.moduleName
    );
    if (quizLesson) {
      navigate(`/learner/courses/${courseId}/assessments/${quizLesson.id}`);
    } else {
      const anyQuiz = allLessons.find(l => l.lesson_type === 'quiz');
      if (anyQuiz) navigate(`/learner/courses/${courseId}/assessments/${anyQuiz.id}`);
    }
  };

  const aiEnhancements = [
    { icon: 'mic', title: 'Audio Summary', subtitle: 'Listen to 2-min recap', color: 'indigo' },
    { icon: 'movie', title: 'Video Explainer', subtitle: 'Simplified visual recap', color: 'amber' },
    { icon: 'explore', title: 'Walkthrough', subtitle: 'Step-by-step guide', color: 'emerald' },
  ];

  const walkthroughSteps = [
    { title: 'Understanding the Concept', description: `You're about to study: "${lesson?.title || ''}". Read through the key ideas before watching.`, icon: 'lightbulb' },
    { title: 'Watch & Take Notes', description: 'Write down key points as you go. This reinforces memory retention significantly.', icon: 'edit_note' },
    { title: 'Check Your Understanding', description: 'Try explaining the concept in your own words. If you can teach it, you truly understand it.', icon: 'psychology' },
    { title: 'Practice It!', description: 'Apply what you learned by completing the quiz or advancing to the next lesson.', icon: 'task_alt' },
  ];

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
        <p className="text-slate-500 font-medium">Loading lesson...</p>
      </div>
    </div>
  );

  if (error || !lesson) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
        <p className="text-slate-700 font-bold mb-4">{error || 'Lesson not found'}</p>
        <button onClick={() => navigate(`/learner/courses/${courseId}`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Back to Course</button>
      </div>
    </div>
  );

  const videoConfig = getVideoConfig(getVideoUrl());
  const textBody = getTextBody();
  const fileUrl = getFileUrl();

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex h-screen flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg"><span className="material-symbols-outlined text-2xl">auto_awesome</span></div>
              <h2 className="text-lg font-bold tracking-tight">AI Learning LMS</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/learner/dashboard')} className="text-sm font-medium hover:text-blue-600 transition-colors">Dashboard</button>
              <button onClick={() => navigate('/learner/courses')} className="text-sm font-medium text-blue-600">My Courses</button>
              <button onClick={() => navigate('/learner/ai-hub')} className="text-sm font-medium hover:text-blue-600 transition-colors">AI Hub</button>
              <button onClick={() => navigate('/learner/analytics')} className="text-sm font-medium hover:text-blue-600 transition-colors">Analytics</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/learner/search?q=${encodeURIComponent(searchQuery)}`); }} className="relative group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">search</button>
              <input className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm" placeholder="Search..." type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            <button onClick={() => navigate('/learner/ai-hub')} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span><span>Ask AI</span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
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
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
              </div>
              <ProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Sidebar ── */}
          <aside className={`${sidebarCollapsed ? 'w-0' : 'w-72'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-sm truncate mb-2">{course?.title || 'Course'}</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all"
                  style={{ width: `${Math.round((allLessons.filter(l => l.is_completed).length / Math.max(allLessons.length, 1)) * 100)}%` }}></div>
              </div>
              <p className="text-[10px] mt-1 text-slate-400">{allLessons.filter(l => l.is_completed).length}/{allLessons.length} lessons complete</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {Object.entries(lessonsByModule).map(([moduleName, lessons], mIdx) => (
                <div key={moduleName}>
                  <div className={`px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider ${mIdx > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}`}>{moduleName}</div>
                  {lessons.map(l => (
                    <button key={l.id} onClick={() => navigate(`/learner/courses/${courseId}/lessons/${l.id}`)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${l.id === parseInt(lessonId) ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <span className={`material-symbols-outlined text-xl ${l.is_completed ? 'text-green-500' : l.id === parseInt(lessonId) ? 'text-blue-600' : 'text-slate-400'}`}>
                        {l.is_completed ? 'check_circle' : getLessonIcon(l.lesson_type)}
                      </span>
                      <span className={`text-sm truncate ${l.id === parseInt(lessonId) ? 'font-bold' : 'font-medium'}`}>{l.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => setSidebarCollapsed(true)} className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200">
                <span className="material-symbols-outlined text-lg">first_page</span>Collapse
              </button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
            <div className="max-w-5xl mx-auto p-6 md:p-8">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium flex-wrap">
                <button onClick={() => navigate('/learner/dashboard')} className="hover:text-blue-600">Home</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => navigate('/learner/courses')} className="hover:text-blue-600">Courses</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => navigate(`/learner/courses/${courseId}`)} className="hover:text-blue-600 truncate max-w-[120px]">{course?.title}</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-blue-600 truncate max-w-[160px]">{lesson.title}</span>
              </div>

              {/* ── VIDEO SECTION — handles all URL types ── */}
              {videoConfig ? (
                <div className="mb-8">
                  {videoConfig.type === 'direct' && (
                    <div className="rounded-xl overflow-hidden bg-black shadow-2xl">
                      <video
                        src={videoConfig.src}
                        controls
                        className="w-full"
                        style={{ maxHeight: '500px' }}
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                  {videoConfig.type === 'iframe' && (
                    <div className="rounded-xl overflow-hidden bg-black shadow-2xl"
                      style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        src={videoConfig.src}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Lesson Video"
                      />
                    </div>
                  )}
                  {videoConfig.type === 'external' && (
                    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center shadow-2xl">
                      <span className="material-symbols-outlined text-white/50 text-7xl mb-4 block">videocam</span>
                      <p className="text-white font-semibold text-lg mb-2">Meeting Recording</p>
                      <p className="text-white/50 text-sm mb-6">This recording is hosted externally and cannot be embedded</p>
                      <a href={videoConfig.src} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <span className="material-symbols-outlined">open_in_new</span>
                        Watch Recording
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 aspect-video mb-8 shadow-2xl flex items-center justify-center relative">
                  <div className="text-center text-white/50">
                    <span className="material-symbols-outlined text-7xl mb-3 block">{getLessonIcon(lesson.lesson_type)}</span>
                    <p className="font-medium capitalize">{lesson.lesson_type} lesson</p>
                  </div>
                  <button onClick={() => setShowLanguageModal(true)}
                    className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm">translate</span>
                    {selectedLanguage}
                  </button>
                </div>
              )}

              {/* ── PDF SECTION ── */}
              {fileUrl && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                      <span className="font-bold">PDF Document</span>
                    </div>
                    <a href={fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Open in new tab
                    </a>
                  </div>
                  <iframe
                    src={fileUrl.includes('drive.google.com') ?
                      fileUrl.replace('/view', '/preview') :
                      `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
                    }
                    className="w-full"
                    style={{ height: '600px' }}
                    title="PDF Document"
                  />
                </div>
              )}

              {/* Lesson Header */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isCompleted ? '✓ Completed' : lesson.lesson_type}
                    </span>
                    {lesson.duration_minutes > 0 && <span className="text-xs text-slate-400">{lesson.duration_minutes} min</span>}
                    {allLessons.length > 0 && <span className="text-xs text-slate-400">Lesson {currentIdx + 1} of {allLessons.length}</span>}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {lesson.description || `In this lesson, you'll explore ${lesson.title}. Follow along carefully and use the AI tools on the right to enhance your understanding.`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <button onClick={handleMarkComplete} disabled={marking}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-60">
                      {marking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                      Mark Complete
                    </button>
                  )}
                  <button onClick={() => setShowLanguageModal(true)} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200">
                    <span className="material-symbols-outlined text-lg">translate</span>Language
                  </button>
                  <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200">
                    <span className="material-symbols-outlined text-lg">bookmark</span>Save
                  </button>
                </div>
              </div>

              {/* ── TEXT CONTENT ── */}
              {textBody && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">description</span>
                    <span className="font-bold">Lesson Content</span>
                  </div>
                  <div className="p-6 prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: textBody }} />
                </div>
              )}

              {/* Related Concepts */}
              {relatedConcepts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">hub</span>Related Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedConcepts.map((concept) => (
                      <div key={concept.id}
                        onClick={() => navigate(`/learner/courses/${courseId}/lessons/${concept.id}`)}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-md cursor-pointer transition-all group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${concept.isPrerequisite ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            <span className={`material-symbols-outlined text-lg ${concept.isPrerequisite ? 'text-amber-600' : 'text-blue-600'}`}>
                              {getLessonIcon(concept.lesson_type)}
                            </span>
                          </div>
                          {concept.isPrerequisite && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Prerequisite</span>}
                          {concept.is_completed && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Done</span>}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{concept.title}</p>
                        <p className="text-xs text-slate-400 mt-1 capitalize">{concept.lesson_type}{concept.duration_minutes ? ` • ${concept.duration_minutes}m` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── QUIZ SECTION — real quiz finder ── */}
              <div className="mb-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">quiz</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Test Your Knowledge</h3>
                      <p className="text-blue-100 text-sm">Take a short quiz to reinforce what you've learned</p>
                    </div>
                  </div>
                  <button onClick={handleStartQuiz}
                    className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors text-sm">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>Start Quiz
                  </button>
                </div>
              </div>

              {/* Footer Nav */}
              <div className="flex items-center justify-between border-t border-slate-100 mt-8 pt-8">
                {previousLesson ? (
                  <button onClick={() => navigate(`/learner/courses/${courseId}/lessons/${previousLesson.id}`)} className="flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-slate-50">
                    <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Previous</p>
                      <p className="text-sm font-semibold truncate max-w-[200px]">{previousLesson.title}</p>
                    </div>
                  </button>
                ) : <div></div>}
                {nextLesson ? (
                  <button onClick={() => navigate(`/learner/courses/${courseId}/lessons/${nextLesson.id}`)} className="flex items-center gap-3 group px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/70">Next Lesson</p>
                      <p className="text-sm font-semibold truncate max-w-[200px]">{nextLesson.title}</p>
                    </div>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                ) : (
                  <button onClick={() => navigate(`/learner/courses/${courseId}`)} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500 text-white shadow-lg hover:bg-emerald-600">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-semibold">Finish Course</span>
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* ── Right Sidebar: AI ── */}
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                <h3 className="font-bold text-sm tracking-wide uppercase">AI Enhancements</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {aiEnhancements.map((tool, idx) => (
                  <button key={idx}
                    onClick={() => {
                      if (tool.title === 'Audio Summary') setShowAudioPlayer(true);
                      else if (tool.title === 'Video Explainer') setShowVideoModal(true);
                      else if (tool.title === 'Walkthrough') { setShowWalkthroughOverlay(true); setWalkthroughStep(0); }
                    }}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 hover:border-blue-600 transition-all text-left group">
                    <div className={`w-10 h-10 rounded-lg bg-${tool.color}-100 text-${tool.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{tool.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tool.title}</p>
                      <p className="text-[10px] text-slate-500">{tool.subtitle}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 ml-auto text-sm">chevron_right</span>
                  </button>
                ))}
              </div>
              <div className="bg-blue-600/5 border border-blue-600/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">AI Processing Units</span>
                  <span className="text-xs font-bold text-blue-600">47 / 100</span>
                </div>
                <div className="h-1.5 w-full bg-blue-600/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[47%]"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">53 units remaining this month</p>
              </div>
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Knowledge Level</label>
                <div className="flex p-1 bg-slate-200 rounded-lg">
                  {['beginner', 'advanced'].map(level => (
                    <button key={level} onClick={() => setKnowledgeLevel(level)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md capitalize transition-all ${knowledgeLevel === level ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                  AI Q&A Assistant <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </label>
                <div className="bg-blue-600/5 rounded-xl p-3 mb-3 border border-blue-600/10">
                  <p className="text-[11px] text-blue-600/80 italic">Ask me anything about "{lesson.title}"</p>
                </div>
                <div className="relative mb-3">
                  <input value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && setChatMessage('')}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Ask a question..." />
                  <button onClick={() => setChatMessage('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-600/10 rounded-lg">
                    <span className="material-symbols-outlined text-xl">send</span>
                  </button>
                </div>
                <button onClick={() => navigate('/learner/search')} className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200">
                  <span className="material-symbols-outlined text-base">search</span>Open Full Search & Q&A
                </button>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-2">
                <span>LESSON PROGRESS</span><span>{isCompleted ? '100%' : 'In Progress'}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500 w-full' : 'bg-blue-600 w-[45%]'}`}></div>
              </div>
            </div>
          </aside>
        </div>

        {/* Expand sidebar */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg z-30">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}

        {/* ── Walkthrough Overlay ── */}
        {showWalkthroughOverlay && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{walkthroughSteps[walkthroughStep].icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{walkthroughSteps[walkthroughStep].title}</h3>
                    <p className="text-xs text-slate-500">Step {walkthroughStep + 1} of {walkthroughSteps.length}</p>
                  </div>
                </div>
                <button onClick={() => setShowWalkthroughOverlay(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 text-lg">{walkthroughSteps[walkthroughStep].description}</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {walkthroughSteps.map((_, idx) => (
                  <div key={idx} className={`h-2 rounded-full transition-all ${idx === walkthroughStep ? 'w-8 bg-blue-600' : idx < walkthroughStep ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-300'}`}></div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4">
                <button onClick={() => setWalkthroughStep(s => Math.max(0, s - 1))} disabled={walkthroughStep === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50 disabled:opacity-50">
                  <span className="material-symbols-outlined">arrow_back</span>Previous
                </button>
                {walkthroughStep < walkthroughSteps.length - 1 ? (
                  <button onClick={() => setWalkthroughStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                    Next<span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ) : (
                  <button onClick={() => { setShowWalkthroughOverlay(false); setWalkthroughStep(0); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600">
                    <span className="material-symbols-outlined">check_circle</span>Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Video Explainer Modal ── */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">movie</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI Video Explainer</h3>
                    <p className="text-sm text-slate-500">{lesson.title} — Simplified Visual Breakdown</p>
                  </div>
                </div>
                <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <span className="material-symbols-outlined text-8xl mb-4 block">play_circle</span>
                  <p className="font-medium text-lg">AI Video Explainer</p>
                  <p className="text-sm mt-1">Coming soon — AI team integration pending</p>
                </div>
              </div>
              <div className="p-6 flex justify-end">
                <button onClick={() => { setShowVideoModal(false); navigate('/learner/ai-hub'); }}
                  className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
                  <span className="material-symbols-outlined text-sm">open_in_new</span>Open in AI Hub
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Language Modal ── */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLanguageModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Select Language</h3>
                  <p className="text-sm text-slate-500">Choose your preferred language for AI content</p>
                </div>
                <button onClick={() => setShowLanguageModal(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-2 mb-6">
                {languageOptions.map((lang) => (
                  <button key={lang.code} onClick={() => { setSelectedLanguage(lang.name); setShowLanguageModal(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedLanguage === lang.name ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <span className="text-2xl">{lang.flag}</span>
                    <p className="font-semibold text-slate-900 flex-1">{lang.name}</p>
                    {selectedLanguage === lang.name && <span className="material-symbols-outlined text-blue-600">check_circle</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Multi-language AI content generation coming soon
              </p>
            </div>
          </div>
        )}

        {/* ── Audio Player ── */}
        {showAudioPlayer && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-40">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-indigo-600">mic</span>
              </div>
              <button className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </button>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 truncate">Audio Summary: {lesson.title}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex-shrink-0">0:00</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      setAudioProgress(pct);
                    }}>
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">2:00</span>
                </div>
              </div>
              <button onClick={() => setShowAudioPlayer(false)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg flex-shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LessonContent;