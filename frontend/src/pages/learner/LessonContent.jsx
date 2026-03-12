import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import VoiceChatModal from '../../components/VoiceChatModal';
import apiClient from '../../services/api';
import aiContentService from '../../services/aiContentService';
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVoiceChatModal, setShowVoiceChatModal] = useState(false);
  const notificationsRef = useRef(null);
  const aiSectionRef = useRef(null);
  const [aiContent, setAiContent] = useState(null);
  const [aiStatus, setAiStatus] = useState('not_processed');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [activeAiTab, setActiveAiTab] = useState('summary');
  const [flippedCards, setFlippedCards] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingVoiceContext, setLoadingVoiceContext] = useState(false);
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'Learner';
  const notifications = [
    { id: 1, title: 'New Lesson Available', message: 'Check out the new lesson.', time: '5 min ago', icon: 'school', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', unread: true },
    { id: 2, title: 'Assignment Due Soon', message: 'Due in 2 days.', time: '1 hour ago', icon: 'assignment', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', unread: true },
    { id: 3, title: 'Achievement Unlocked', message: 'Quick Learner badge!', time: '3 hours ago', icon: 'workspace_premium', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const normalizeFlashcards = (cards) => {
    if (!Array.isArray(cards)) return [];
    return cards
      .map((card) => {
        if (typeof card === 'string') {
          return { front: card, back: '' };
        }
        return {
          front: card.front || card.question || card.term || '',
          back: card.back || card.answer || card.definition || '',
        };
      })
      .filter(card => card.front || card.back);
  };

  const normalizeQuiz = (quiz) => {
    if (!Array.isArray(quiz)) return [];
    return quiz
      .map((q) => ({
        question: q.question || q.prompt || '',
        options: Array.isArray(q.options)
          ? q.options
          : Array.isArray(q.choices)
            ? q.choices
            : [],
        correct_answer: q.correct_answer || q.answer || '',
        explanation: q.explanation || '',
      }))
      .filter(q => q.question && q.options.length > 0);
  };

  const normalizeAiContent = (data) => ({
    ...data,
    flashcards: normalizeFlashcards(data.flashcards),
    quiz: normalizeQuiz(data.quiz),
  });

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    setAiContent(null);
    setAiStatus('not_processed');
    setAiProcessing(false);
    setAiProgressText('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setFlippedCards({});
    setLoadingVoiceContext(false);
    Promise.all([
      apiClient.get(`/api/v1/content/lessons/${lessonId}`),
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/content/courses/${courseId}/modules`),
    ])
      .then(([lessonRes, courseRes, modulesRes]) => {
        setLesson(lessonRes.data);
        setCourse(courseRes.data);
        const flat = (modulesRes.data || []).flatMap((module) =>
          (module.lessons || []).map((item) => ({
            ...item,
            moduleName: module.title,
          }))
        );
        setAllLessons(flat);
        const current = flat.find((l) => l.id === parseInt(lessonId, 10));
        setIsCompleted(current?.is_completed || false);
        setLoading(false);
        fetchAiContent();
      })
      .catch(() => {
        setError('Failed to load lesson');
        setLoading(false);
      });
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!aiContent) return;
    const tabs = [
      aiContent.summary_notes ? 'summary' : null,
      aiContent.transcript ? 'transcript' : null,
      aiContent.flashcards?.length ? 'flashcards' : null,
      aiContent.quiz?.length ? 'quiz' : null,
    ].filter(Boolean);
    if (tabs.length > 0 && !tabs.includes(activeAiTab)) {
      setActiveAiTab(tabs[0]);
    }
  }, [aiContent, activeAiTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchAiContent = async () => {
    try {
      const raw = await aiContentService.getContent(parseInt(lessonId, 10));
      const data = normalizeAiContent(raw);
      setAiStatus(data.status);
      if (data.status === 'completed') {
        setAiContent(data);
      } else if (data.status === 'processing') {
        setAiProcessing(true);
        setAiProgressText(data.progress || 'Processing...');
        pollAiContent();
      }
    } catch {
      setAiStatus('not_processed');
    }
  };

  const pollAiContent = async () => {
    try {
      const raw = await aiContentService.pollUntilReady(
        parseInt(lessonId, 10),
        (progress) => setAiProgressText(progress),
        120
      );
      const data = normalizeAiContent(raw);
      setAiContent(data);
      setAiStatus('completed');
      setAiProcessing(false);
      setAiProgressText('');
    } catch (err) {
      setAiStatus('failed');
      setAiProcessing(false);
      setAiProgressText(err.message || 'Failed');
    }
  };

  const handleGenerateAiContent = async () => {
    const videoUrl = getVideoUrl();
    if (!videoUrl) {
      alert('No video found for this lesson.');
      return;
    }
    setAiProcessing(true);
    setAiStatus('processing');
    setAiProgressText('Starting processing...');
    try {
      await aiContentService.processLesson(
        parseInt(lessonId, 10),
        videoUrl,
        lesson?.title || ''
      );
      pollAiContent();
    } catch (err) {
      setAiProcessing(false);
      setAiStatus('failed');
      setAiProgressText(err.response?.data?.detail || 'Failed to start');
    }
  };

  const handleRegenerateAiContent = async () => {
    try {
      await aiContentService.deleteContent(parseInt(lessonId, 10));
    } catch (_) {
      // ignore
    }
    setAiContent(null);
    setAiStatus('not_processed');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setFlippedCards({});
    handleGenerateAiContent();
  };

  const handleLoadVoiceContext = async () => {
    if (aiStatus !== 'completed' || !aiContent) {
      alert('Generate AI content first before starting Voice AI.');
      return;
    }
    setLoadingVoiceContext(true);
    try {
      await apiClient.post(`/api/v1/voice-context/lesson/${lessonId}/load`);
      setShowVoiceChatModal(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to load voice knowledge base');
    } finally {
      setLoadingVoiceContext(false);
    }
  };

  const toggleFlipCard = (idx) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleQuizAnswer = (qIdx, answer) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const getQuizScore = () => {
    if (!aiContent?.quiz?.length) return 0;
    let correct = 0;
    aiContent.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) correct += 1;
    });
    return Math.round((correct / aiContent.quiz.length) * 100);
  };

  const currentIdx = allLessons.findIndex(l => l.id === parseInt(lessonId, 10));
  const previousLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const currentLessonMeta = allLessons.find(l => l.id === parseInt(lessonId, 10));
  const lessonsByModule = allLessons.reduce((acc, item) => {
    if (!acc[item.moduleName]) acc[item.moduleName] = [];
    acc[item.moduleName].push(item);
    return acc;
  }, {});

  const relatedConcepts = [
    ...allLessons.slice(Math.max(0, currentIdx - 1), currentIdx).map(l => ({ ...l, isPrerequisite: true })),
    ...allLessons.slice(currentIdx + 1, currentIdx + 3).map(l => ({ ...l, isPrerequisite: false })),
  ].filter(l => l.id !== parseInt(lessonId, 10));

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      const enrollRes = await apiClient.get('/api/v1/courses/my/enrolled');
      const enr = enrollRes.data.find(
        e => e.id === parseInt(courseId, 10) || e.course_id === parseInt(courseId, 10)
      );
      if (!enr) {
        await apiClient.post('/api/v1/enrollments/enroll', {
          course_id: parseInt(courseId, 10),
        });
      }
      await apiClient.post('/api/v1/progress/complete', {
        lesson_id: parseInt(lessonId, 10),
        score: null,
        time_spent_seconds: 0,
      });
      setIsCompleted(true);
      setAllLessons(prev =>
        prev.map(l =>
          l.id === parseInt(lessonId, 10)
            ? { ...l, is_completed: true }
            : l
        )
      );
      if (nextLesson) {
        setTimeout(() => {
          navigate(`/learner/courses/${courseId}/lessons/${nextLesson.id}`);
        }, 500);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not mark complete');
    } finally {
      setMarking(false);
    }
  };

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await apiClient.post('/api/v1/saved-resources/', {
        title: lesson.title,
        resource_type: lesson.lesson_type || 'lesson',
        lesson_id: parseInt(lessonId, 10),
        icon:
          lesson.lesson_type === 'video'
            ? 'movie'
            : lesson.lesson_type === 'quiz'
              ? 'quiz'
              : 'article',
        icon_color:
          lesson.lesson_type === 'video'
            ? 'text-amber-600'
            : lesson.lesson_type === 'quiz'
              ? 'text-green-600'
              : 'text-blue-600',
        icon_bg:
          lesson.lesson_type === 'video'
            ? 'bg-amber-100'
            : lesson.lesson_type === 'quiz'
              ? 'bg-green-100'
              : 'bg-blue-100',
        url: null,
      });
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getVideoUrl = () =>
    lesson?.contents?.find(c => c.content_type === 'video_url')?.content ||
    lesson?.video_url ||
    null;

  const getTextBody = () =>
    lesson?.contents?.find(c => c.content_type === 'text_body')?.content ||
    lesson?.text_body ||
    null;

  const getFileUrl = () =>
    lesson?.contents?.find(c => c.content_type === 'file_url')?.content ||
    lesson?.pdf_url ||
    null;

  const getLessonIcon = (type) => {
    if (type === 'video') return 'movie';
    if (type === 'quiz') return 'quiz';
    return 'article';
  };

  const getVideoConfig = (url) => {
    if (!url) return null;
    if (url.startsWith('/static/')) {
      return { type: 'direct', src: `http://localhost:8000${url}` };
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }
    if (url.includes('youtube.com/embed/')) {
      return { type: 'iframe', src: url };
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match) {
        return { type: 'iframe', src: `https://drive.google.com/file/d/${match[1]}/preview` };
      }
    }
    if (url.includes('loom.com/share/')) {
      const id = url.split('loom.com/share/')[1]?.split('?')[0];
      return { type: 'iframe', src: `https://www.loom.com/embed/${id}` };
    }
    if (
      url.includes('zoom.us') ||
      url.includes('meet.google.com') ||
      url.includes('teams.microsoft.com')
    ) {
      return { type: 'external', src: url };
    }
    return { type: 'iframe', src: url };
  };

  const handleStartQuiz = () => {
    const quizLesson =
      allLessons.find(
        l => l.lesson_type === 'quiz' && l.moduleName === currentLessonMeta?.moduleName
      ) || allLessons.find(l => l.lesson_type === 'quiz');
    if (quizLesson) {
      navigate(`/learner/courses/${courseId}/assessments/${quizLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
          <p className="text-slate-700 font-bold mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate(`/learner/courses/${courseId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const videoConfig = getVideoConfig(getVideoUrl());
  const textBody = getTextBody();
  const fileUrl = getFileUrl();
  const hasVideo = !!getVideoUrl();
  const AI_TABS = [
    { key: 'summary', label: 'Summary', icon: 'summarize', show: !!aiContent?.summary_notes },
    { key: 'transcript', label: 'Transcript', icon: 'description', show: !!aiContent?.transcript },
    { key: 'flashcards', label: 'Flashcards', icon: 'style', show: aiContent?.flashcards?.length > 0 },
    { key: 'quiz', label: 'Quiz', icon: 'quiz', show: aiContent?.quiz?.length > 0 },
  ].filter(tab => tab.show);
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/learner/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="relative"
            >
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">search</button>
              <input
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm"
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
            <button
              onClick={() => navigate('/learner/ai-hub')}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button>
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] max-h-[500px] flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-slate-500">{unreadCount} unread</p>}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
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
          <aside className={`${sidebarCollapsed ? 'w-0' : 'w-72'} border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-sm truncate mb-2">{course?.title || 'Course'}</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.round(
                      (allLessons.filter(l => l.is_completed).length / Math.max(allLessons.length, 1)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] mt-1 text-slate-400">
                {allLessons.filter(l => l.is_completed).length}/{allLessons.length} lessons complete
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {Object.entries(lessonsByModule).map(([moduleName, lessons], mIdx) => (
                <div key={moduleName}>
                  <div className={`px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider ${mIdx > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}`}>
                    {moduleName}
                  </div>
                  {lessons.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/learner/courses/${courseId}/lessons/${item.id}`)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${item.id === parseInt(lessonId, 10) ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className={`material-symbols-outlined text-xl ${item.is_completed ? 'text-green-500' : item.id === parseInt(lessonId, 10) ? 'text-blue-600' : 'text-slate-400'}`}>
                        {item.is_completed ? 'check_circle' : getLessonIcon(item.lesson_type)}
                      </span>
                      <span className={`text-sm truncate ${item.id === parseInt(lessonId, 10) ? 'font-bold' : 'font-medium'}`}>
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-lg">first_page</span>
                Collapse
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-5xl mx-auto p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium flex-wrap">
                <button onClick={() => navigate('/learner/dashboard')} className="hover:text-blue-600">Home</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => navigate('/learner/courses')} className="hover:text-blue-600">Courses</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => navigate(`/learner/courses/${courseId}`)} className="hover:text-blue-600 truncate max-w-[120px]">{course?.title}</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-blue-600 truncate max-w-[160px]">{lesson.title}</span>
              </div>

              {videoConfig ? (
                <div className="mb-6">
                  {videoConfig.type === 'direct' && (
                    <div className="rounded-xl overflow-hidden bg-black shadow-2xl">
                      <video src={videoConfig.src} controls className="w-full" style={{ maxHeight: '500px' }}>
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                  {videoConfig.type === 'iframe' && (
                    <div className="rounded-xl overflow-hidden bg-black shadow-2xl" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
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
                      <a href={videoConfig.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <span className="material-symbols-outlined">open_in_new</span>
                        Watch Recording
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 aspect-video mb-6 shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <span className="material-symbols-outlined text-7xl mb-3 block">{getLessonIcon(lesson.lesson_type)}</span>
                    <p className="font-medium capitalize">{lesson.lesson_type} lesson</p>
                  </div>
                </div>
              )}

              {hasVideo && (
                <div ref={aiSectionRef} className="mb-8">
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                      <h2 className="text-lg font-bold">AI-Generated Content</h2>
                      {aiStatus === 'completed' && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Ready</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
{/*                       {aiStatus === 'not_processed' && ( */}
{/*                         <button */}
{/*                           onClick={handleGenerateAiContent} */}
{/*                           className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]" */}
{/*                         > */}
{/*                           <span className="material-symbols-outlined text-[18px]">auto_fix_high</span> */}
{/*                           Generate Summary, Quiz & Flashcards */}
{/*                         </button> */}
{/*                       )} */}
                      {aiStatus === 'completed' && (
                        <>
                          <button
                            onClick={handleLoadVoiceContext}
                            disabled={loadingVoiceContext}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-semibold text-sm"
                          >
                            {loadingVoiceContext ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                            )}
                            Talk to Voice AI
                          </button>
                          <button
                            onClick={handleRegenerateAiContent}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium"
                          >
                            <span className="material-symbols-outlined text-[16px]">refresh</span>
                            Regenerate
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {aiProcessing && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                          <svg className="animate-spin h-6 w-6 text-purple-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900 mb-1">AI is processing your video...</h3>
                          <p className="text-sm text-purple-700">{aiProgressText}</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse w-2/3"></div>
                      </div>
                      <p className="text-xs text-purple-500 mt-2">This may take 1–3 minutes depending on video length.</p>
                    </div>
                  )}

                  {aiStatus === 'failed' && !aiProcessing && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
                      <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                      <div className="flex-1">
                        <p className="font-bold text-red-800">Processing failed</p>
                        <p className="text-sm text-red-600">{aiProgressText || 'Something went wrong.'}</p>
                      </div>
                      <button onClick={handleRegenerateAiContent} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700">Retry</button>
                    </div>
                  )}

                  {aiStatus === 'not_processed' && !aiProcessing && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-purple-600 text-3xl">auto_awesome</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Generate AI Study Materials</h3>
                      <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                        Our AI will watch this video and create summary notes, transcript, flashcards, and a practice quiz.
                      </p>
                      <button
                        onClick={handleGenerateAiContent}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-[1.02]"
                      >
                        <span className="material-symbols-outlined">auto_fix_high</span>
                        Generate Now
                      </button>
                    </div>
                  )}

                  {aiStatus === 'completed' && aiContent && AI_TABS.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                        {AI_TABS.map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveAiTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeAiTab === tab.key ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-blue-600'}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                            {tab.key === 'flashcards' && (
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{aiContent.flashcards.length}</span>
                            )}
                            {tab.key === 'quiz' && (
                              <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">{aiContent.quiz.length}Q</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="p-6">
                        {activeAiTab === 'summary' && aiContent.summary_notes && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-blue-600">summarize</span>
                              <h3 className="font-bold text-lg">Summary Notes</h3>
                            </div>
                            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap bg-blue-50/30 rounded-lg p-5 border border-blue-100">
                              {aiContent.summary_notes}
                            </div>
                          </div>
                        )}
                        {activeAiTab === 'transcript' && aiContent.transcript && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">description</span>
                                <h3 className="font-bold text-lg">Full Transcript</h3>
                              </div>
                              <button
                                onClick={() => { navigator.clipboard.writeText(aiContent.transcript); alert('Transcript copied!'); }}
                                className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
                              >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                Copy
                              </button>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 max-h-96 overflow-y-auto">
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiContent.transcript}</p>
                            </div>
                          </div>
                        )}
                        {activeAiTab === 'flashcards' && aiContent.flashcards?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-blue-600">style</span>
                              <h3 className="font-bold text-lg">Flashcards</h3>
                              <span className="text-xs text-slate-400">Click to flip</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aiContent.flashcards.map((card, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => toggleFlipCard(idx)}
                                  className="cursor-pointer"
                                  style={{ minHeight: '160px', perspective: '1000px' }}
                                >
                                  <div
                                    style={{
                                      transformStyle: 'preserve-3d',
                                      transform: flippedCards[idx] ? 'rotateY(180deg)' : 'rotateY(0)',
                                      transition: 'transform 0.5s',
                                      position: 'relative',
                                      width: '100%',
                                      height: '160px',
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-5 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Q{idx + 1}</span>
                                        <span className="text-[10px] text-slate-400">Click to reveal</span>
                                      </div>
                                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">{card.front}</p>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-5 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">A{idx + 1}</span>
                                        <span className="text-[10px] text-slate-400">Click to flip back</span>
                                      </div>
                                      <p className="text-sm text-slate-700 leading-relaxed">{card.back}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {activeAiTab === 'quiz' && aiContent.quiz?.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">quiz</span>
                                <h3 className="font-bold text-lg">Practice Quiz</h3>
                                <span className="text-xs text-slate-400">{aiContent.quiz.length} questions</span>
                              </div>
                              {quizSubmitted && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${getQuizScore() >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  <span className="material-symbols-outlined text-[18px]">{getQuizScore() >= 70 ? 'check_circle' : 'warning'}</span>
                                  Score: {getQuizScore()}%
                                </div>
                              )}
                            </div>
                            <div className="space-y-6">
                              {aiContent.quiz.map((q, qIdx) => {
                                const userAnswer = quizAnswers[qIdx];
                                const isCorrect = userAnswer === q.correct_answer;
                                return (
                                  <div
                                    key={qIdx}
                                    className={`p-5 rounded-xl border-2 transition-all ${quizSubmitted ? (isCorrect ? 'border-green-300 bg-green-50/50' : userAnswer ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50') : 'border-slate-200 bg-white'}`}
                                  >
                                    <div className="flex items-start gap-3 mb-4">
                                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{qIdx + 1}</span>
                                      <p className="font-semibold text-slate-900">{q.question}</p>
                                    </div>
                                    <div className="space-y-2 ml-10">
                                      {(q.options || []).map((opt, oIdx) => {
                                        const isSelected = userAnswer === opt;
                                        const isCorrectOpt = opt === q.correct_answer;
                                        let optClass = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50';
                                        if (quizSubmitted) {
                                          if (isCorrectOpt) optClass = 'border-green-400 bg-green-50';
                                          else if (isSelected && !isCorrectOpt) optClass = 'border-red-400 bg-red-50';
                                          else optClass = 'border-slate-200 opacity-60';
                                        } else if (isSelected) {
                                          optClass = 'border-blue-500 bg-blue-50 ring-2 ring-blue-200';
                                        }
                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => handleQuizAnswer(qIdx, opt)}
                                            disabled={quizSubmitted}
                                            className={`w-full text-left p-3 rounded-lg border-2 text-sm font-medium transition-all ${optClass}`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 border-current">
                                                {String.fromCharCode(65 + oIdx)}
                                              </span>
                                              <span>{opt}</span>
                                              {quizSubmitted && isCorrectOpt && (
                                                <span className="material-symbols-outlined text-green-600 ml-auto text-[18px]">check_circle</span>
                                              )}
                                              {quizSubmitted && isSelected && !isCorrectOpt && (
                                                <span className="material-symbols-outlined text-red-500 ml-auto text-[18px]">cancel</span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {quizSubmitted && q.explanation && (
                                      <div className="mt-3 ml-10 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs font-bold text-blue-700 mb-1">Explanation:</p>
                                        <p className="text-sm text-blue-800">{q.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {!quizSubmitted ? (
                              <button
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(quizAnswers).length < aiContent.quiz.length}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:cursor-not-allowed"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Submit Answers ({Object.keys(quizAnswers).length}/{aiContent.quiz.length})
                              </button>
                            ) : (
                              <button
                                onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Retry Quiz
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {fileUrl && (() => {
                const isLocal = fileUrl.startsWith('/static/') || fileUrl.startsWith('http://localhost');
                const localSrc = fileUrl.startsWith('/static/') ? `http://localhost:8000${fileUrl}` : fileUrl;
                const isGDrive = fileUrl.includes('drive.google.com');
                const embedSrc = isLocal ? localSrc : isGDrive ? fileUrl.replace('/view', '/preview').replace('/edit', '/preview') : null;
                return (
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                    <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                        <span className="font-bold">PDF Document</span>
                      </div>
                      <a href={isLocal ? localSrc : fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Open in new tab
                      </a>
                    </div>
                    {embedSrc ? (
                      <iframe src={embedSrc} className="w-full" style={{ height: '600px' }} title="PDF Document" />
                    ) : (
                      <div className="p-12 text-center bg-slate-50">
                        <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">picture_as_pdf</span>
                        <p className="text-slate-600 font-medium mb-2">PDF preview not available</p>
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                          <span className="material-symbols-outlined">open_in_new</span>
                          Open PDF
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                    {lesson.description || `In this lesson, you'll explore ${lesson.title}.`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-60 transition-colors"
                    >
                      {marking ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-60'}`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined text-lg">{saved ? 'bookmark' : 'bookmark_border'}</span>
                    )}
                    {saved ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>

              {textBody && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">description</span>
                    <span className="font-bold">Lesson Content</span>
                  </div>
                  <div className="p-6 prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: textBody }} />
                </div>
              )}

              {relatedConcepts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">hub</span>
                    Related Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedConcepts.map((concept) => (
                      <div
                        key={concept.id}
                        onClick={() => navigate(`/learner/courses/${courseId}/lessons/${concept.id}`)}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${concept.isPrerequisite ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            <span className={`material-symbols-outlined text-lg ${concept.isPrerequisite ? 'text-amber-600' : 'text-blue-600'}`}>{getLessonIcon(concept.lesson_type)}</span>
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

          <aside className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                <h3 className="font-bold text-sm tracking-wide uppercase">AI Study Tools</h3>
              </div>
              <div className={`rounded-xl p-4 border-2 ${aiStatus === 'completed' ? 'bg-green-50 border-green-200' : aiStatus === 'processing' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${aiStatus === 'completed' ? 'bg-green-100 text-green-600' : aiStatus === 'processing' ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                    <span className="material-symbols-outlined">
                      {aiStatus === 'completed' ? 'check_circle' : aiStatus === 'processing' ? 'hourglass_top' : 'auto_awesome'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {aiStatus === 'completed' ? 'AI Content Ready' : aiStatus === 'processing' ? 'Processing...' : 'Not Generated Yet'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {aiStatus === 'completed' ? 'Summary, Quiz & Flashcards' : aiProcessing ? aiProgressText : 'Click Generate below'}
                    </p>
                  </div>
                </div>
                {aiStatus === 'completed' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Summary', icon: 'summarize', tab: 'summary', show: !!aiContent?.summary_notes },
                        { label: 'Transcript', icon: 'description', tab: 'transcript', show: !!aiContent?.transcript },
                        { label: 'Flashcards', icon: 'style', tab: 'flashcards', show: aiContent?.flashcards?.length > 0 },
                        { label: 'Quiz', icon: 'quiz', tab: 'quiz', show: aiContent?.quiz?.length > 0 },
                      ].filter(t => t.show).map(tool => (
                        <button
                          key={tool.tab}
                          onClick={() => {
                            setActiveAiTab(tool.tab);
                            aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition-colors ${activeAiTab === tool.tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{tool.icon}</span>
                          {tool.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleLoadVoiceContext}
                      disabled={loadingVoiceContext}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-xs font-bold"
                    >
                      {loadingVoiceContext ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
                      )}
                      Talk to Voice AI
                    </button>
                  </div>
                )}
                {aiStatus === 'not_processed' && hasVideo && (
                  <button
                    onClick={handleGenerateAiContent}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-lg text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                    Generate AI Content
                  </button>
                )}
                {aiProcessing && (
                  <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full animate-pulse w-2/3"></div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Knowledge Level</label>
                <div className="flex p-1 bg-slate-200 rounded-lg">
                  {['beginner', 'advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setKnowledgeLevel(level)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md capitalize transition-all ${knowledgeLevel === level ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-2">
                <span>LESSON PROGRESS</span>
                <span>{isCompleted ? '100%' : 'In Progress'}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500 w-full' : 'bg-blue-600 w-[45%]'}`}></div>
              </div>
            </div>
          </aside>
        </div>

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg z-30"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}

        {showVoiceChatModal && (
          <VoiceChatModal
            isOpen={showVoiceChatModal}
            onClose={() => setShowVoiceChatModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LessonContent;