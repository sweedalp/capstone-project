import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import aiContentService from '../../services/aiContentService';
import '../../index.css';

const CourseOverview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [courseAiContent, setCourseAiContent] = useState(null);
  const [aiHubLoading, setAiHubLoading] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState(null);
  const [expandedAiLesson, setExpandedAiLesson] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/content/courses/${courseId}/modules`),
      apiClient.get('/api/v1/courses/my/enrolled'),
    ])
      .then(([courseRes, modulesRes, enrolledRes]) => {
        setCourse(courseRes.data);
        const mods = modulesRes.data || [];
        setModules(mods);
        const firstModIdx = {};
        mods.forEach((m, i) => { if (i === 0) firstModIdx[m.id] = true; });
        setExpandedModules(firstModIdx);
        const enrolled = (enrolledRes.data || []).some(
          e => e.id === parseInt(courseId) || e.course_id === parseInt(courseId)
        );
        setIsEnrolled(enrolled);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load course');
        setLoading(false);
      });
  }, [courseId]);

  const loadAiHubData = async () => {
    if (courseAiContent) return;
    setAiHubLoading(true);
    try {
      const data = await aiContentService.getCourseContent(parseInt(courseId));
      setCourseAiContent(data);
    } catch (err) {
      console.error('Failed to load AI Hub data:', err);
    } finally {
      setAiHubLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-hub') loadAiHubData();
  }, [activeTab]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiClient.post('/api/v1/enrollments/enroll', { course_id: parseInt(courseId) });
      setIsEnrolled(true);
      const firstLesson = modules[0]?.lessons?.[0];
      if (firstLesson) navigate(`/learner/courses/${courseId}/lessons/${firstLesson.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    const allLessons = modules.flatMap(m => m.lessons || []);
    const incomplete = allLessons.find(l => !l.is_completed) || allLessons[0];
    if (incomplete) navigate(`/learner/courses/${courseId}/lessons/${incomplete.id}`);
  };

  const handleGenerateForLesson = async (lesson) => {
    const videoUrl = aiContentService.getVideoUrl(lesson);
    if (!videoUrl) { alert('No video found for this lesson.'); return; }
    setGeneratingLesson(lesson.id);
    try {
      await aiContentService.processLesson(lesson.id, videoUrl, lesson.title || '');
      await aiContentService.pollUntilReady(lesson.id, () => {}, 120);
      const updated = await aiContentService.getCourseContent(parseInt(courseId));
      setCourseAiContent(updated);
    } catch (err) {
      alert(err.message || 'Failed to generate AI content');
    } finally {
      setGeneratingLesson(null);
    }
  };

  const toggleFlipCard = (key) => setFlippedCards(prev => ({ ...prev, [key]: !prev[key] }));

  const allLessons = modules.flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleName: m.title })));
  const completedCount = allLessons.filter(l => l.is_completed).length;
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const videoLessons = allLessons.filter(l => l.lesson_type === 'video');

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'info' },
    { key: 'curriculum', label: 'Curriculum', icon: 'menu_book' },
    { key: 'ai-hub', label: 'AI Hub', icon: 'auto_awesome' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
          <p className="text-slate-700 font-bold mb-4">{error || 'Course not found'}</p>
          <button onClick={() => navigate('/learner/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">AI Learning LMS</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/learner/dashboard')} className="text-sm font-medium hover:text-blue-600">Dashboard</button>
            <button onClick={() => navigate('/learner/courses')} className="text-sm font-medium text-blue-600">My Courses</button>
            <button onClick={() => navigate('/learner/ai-hub')} className="text-sm font-medium hover:text-blue-600">AI Hub</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) navigate(`/learner/search?q=${encodeURIComponent(searchQuery)}`); }} className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input className="w-56 pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm border-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </form>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{userName}</p>
              <p className="text-[10px] text-slate-500 uppercase">Pro {userRole}</p>
            </div>
            <ProfileDropdown userName={userName} userEmail={userEmail} />
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-10 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/learner/courses')} className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to My Courses
          </button>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-4xl">school</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">{course.level || 'All Levels'}</span>
                {course.category && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{course.category}</span>}
                {isEnrolled && <span className="px-3 py-1 bg-green-500/80 rounded-full text-xs font-bold">✓ Enrolled</span>}
              </div>
              <h1 className="text-3xl font-black mb-2">{course.title}</h1>
              <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-2xl">{course.description}</p>
              <div className="flex items-center gap-6 text-sm text-white/80 flex-wrap">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">menu_book</span>{allLessons.length} lessons</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span>{totalDuration} min</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">movie</span>{videoLessons.length} videos</span>
                {isEnrolled && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span>{progressPct}% complete</span>}
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isEnrolled ? (
                <button onClick={handleEnroll} disabled={enrolling} className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-50 transition-colors disabled:opacity-60">
                  {enrolling ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">rocket_launch</span>}
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : progressPct === 100 ? (
                <div className="flex flex-col items-end gap-2">
                  <button onClick={handleStartCourse} className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-50 transition-colors">
                    <span className="material-symbols-outlined">play_arrow</span>
                    Review Course
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      const res = await fetch(`/api/v1/courses/${courseId}/certificate`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) { alert('Could not generate certificate. Please try again.'); return; }
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `certificate_${courseId}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-yellow-300 transition-colors"
                  >
                    <span className="material-symbols-outlined">workspace_premium</span>
                    Download Certificate
                  </button>
                </div>
              ) : (
                <button onClick={handleStartCourse} className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined">play_arrow</span>
                  {progressPct > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
              )}
            </div>
          </div>
          {isEnrolled && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span>Course Progress</span>
                <span>{completedCount}/{allLessons.length} lessons</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex border-b border-slate-200 mb-8 gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-blue-600'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {tab.key === 'ai-hub' && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">AI</span>}
            </button>
          ))}
        </div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4">About This Course</h2>
                <p className="text-slate-600 leading-relaxed">{course.description || 'No description available.'}</p>
              </div>
              {course.learning_objectives?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learning_objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="material-symbols-outlined text-green-600 text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
                        <span className="text-sm text-slate-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.prerequisites?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
                  <ul className="space-y-2">
                    {course.prerequisites.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="material-symbols-outlined text-blue-600 text-[16px]">arrow_right</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold mb-4">Course Details</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'menu_book', label: 'Lessons', value: allLessons.length },
                    { icon: 'schedule', label: 'Duration', value: `${totalDuration} min` },
                    { icon: 'movie', label: 'Videos', value: videoLessons.length },
                    { icon: 'signal_cellular_alt', label: 'Level', value: course.level || 'All Levels' },
                    { icon: 'category', label: 'Category', value: course.category || 'General' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        {item.label}
                      </div>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isEnrolled && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-bold mb-3">Your Progress</h3>
                  <div className="text-center mb-3">
                    <span className="text-4xl font-black text-blue-600">{progressPct}%</span>
                    <p className="text-xs text-slate-400 mt-1">{completedCount} of {allLessons.length} lessons done</p>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                  </div>
                  <button onClick={handleStartCourse} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    {progressPct > 0 ? 'Continue' : 'Start'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-sm">{modules.length} modules • {allLessons.length} lessons • {totalDuration} min total</p>
              <button
                onClick={() => {
                  const allExpanded = modules.every(m => expandedModules[m.id]);
                  const next = {};
                  modules.forEach(m => { next[m.id] = !allExpanded; });
                  setExpandedModules(next);
                }}
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                {modules.every(m => expandedModules[m.id]) ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            {modules.map((module, mIdx) => {
              const moduleLessons = module.lessons || [];
              const moduleCompleted = moduleLessons.filter(l => l.is_completed).length;
              const isExpanded = expandedModules[module.id];
              return (
                <div key={module.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
                        {mIdx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{module.title}</h3>
                        <p className="text-xs text-slate-400">{moduleLessons.length} lessons • {moduleCompleted}/{moduleLessons.length} done</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {moduleCompleted === moduleLessons.length && moduleLessons.length > 0 && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Complete</span>
                      )}
                      <span className="material-symbols-outlined text-slate-400 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {moduleLessons.map((lesson, lIdx) => (
                        <button
                          key={lesson.id}
                          onClick={() => isEnrolled && navigate(`/learner/courses/${courseId}/lessons/${lesson.id}`)}
                          className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${isEnrolled ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default opacity-75'}`}
                        >
                          <span className={`material-symbols-outlined text-xl flex-shrink-0 ${lesson.is_completed ? 'text-green-500' : lesson.lesson_type === 'video' ? 'text-blue-500' : lesson.lesson_type === 'quiz' ? 'text-green-500' : 'text-slate-400'}`}>
                            {lesson.is_completed ? 'check_circle' : lesson.lesson_type === 'video' ? 'play_circle' : lesson.lesson_type === 'quiz' ? 'quiz' : 'article'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{lesson.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{lesson.lesson_type}{lesson.duration_minutes ? ` • ${lesson.duration_minutes}m` : ''}</p>
                          </div>
                          {lesson.is_completed && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">Done</span>}
                          {!isEnrolled && <span className="material-symbols-outlined text-slate-300 text-[18px] flex-shrink-0">lock</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'ai-hub' && (
          <div>
            {aiHubLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading AI content...</p>
                </div>
              </div>
            ) : courseAiContent ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: 'summarize', label: 'Summaries', value: courseAiContent.lessons?.filter(l => l.has_summary).length || 0, color: 'text-blue-600 bg-blue-50' },
                    { icon: 'description', label: 'Transcripts', value: courseAiContent.lessons?.filter(l => l.has_transcript).length || 0, color: 'text-purple-600 bg-purple-50' },
                    { icon: 'style', label: 'Flashcards', value: courseAiContent.lessons?.reduce((sum, l) => sum + (l.flashcard_count || 0), 0) || 0, color: 'text-amber-600 bg-amber-50' },
                    { icon: 'quiz', label: 'Quiz Questions', value: courseAiContent.lessons?.reduce((sum, l) => sum + (l.quiz_count || 0), 0) || 0, color: 'text-green-600 bg-green-50' },
                  ].map(stat => (
                    <div key={stat.label} className={`rounded-xl p-4 ${stat.color.split(' ')[1]} border border-slate-200`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-[20px] ${stat.color.split(' ')[0]}`}>{stat.icon}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
                      </div>
                      <p className={`text-3xl font-black ${stat.color.split(' ')[0]}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                    Lessons with AI Content
                  </h3>
                  <div className="space-y-3">
                    {(courseAiContent.lessons || []).filter(l => l.status === 'completed').map(lessonAi => {
                      const isExpanded = expandedAiLesson === lessonAi.lesson_id;
                      return (
                        <div key={lessonAi.lesson_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => setExpandedAiLesson(isExpanded ? null : lessonAi.lesson_id)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-slate-800">{lessonAi.lesson_title}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {lessonAi.has_summary && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">Summary</span>}
                                  {lessonAi.has_transcript && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">Transcript</span>}
                                  {lessonAi.flashcard_count > 0 && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">{lessonAi.flashcard_count} Cards</span>}
                                  {lessonAi.quiz_count > 0 && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold">{lessonAi.quiz_count} Quiz</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); navigate(`/learner/courses/${courseId}/lessons/${lessonAi.lesson_id}`); }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                              >
                                Open Lesson
                              </button>
                              <span className="material-symbols-outlined text-slate-400 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
                            </div>
                          </button>
                          {isExpanded && lessonAi.flashcards?.length > 0 && (
                            <div className="border-t border-slate-100 p-5">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Preview Flashcards</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {lessonAi.flashcards.slice(0, 4).map((card, idx) => {
                                  const key = `${lessonAi.lesson_id}_${idx}`;
                                  const isFlipped = flippedCards[key];
                                  return (
                                    <div key={idx} onClick={() => toggleFlipCard(key)} className="cursor-pointer" style={{ perspective: '1000px', height: '120px' }}>
                                      <div style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)', transition: 'transform 0.4s', position: 'relative', width: '100%', height: '100%' }}>
                                        <div className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-200 p-3 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                                          <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Question</p>
                                          <p className="text-xs font-semibold text-slate-700 line-clamp-3">{card.front || card.question || card.term || ''}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-green-50 rounded-lg border border-green-200 p-3 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                          <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Answer</p>
                                          <p className="text-xs text-slate-700 line-clamp-3">{card.back || card.answer || card.definition || ''}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {videoLessons.filter(l => {
                  const aiLesson = courseAiContent.lessons?.find(al => al.lesson_id === l.id);
                  return !aiLesson || aiLesson.status !== 'completed';
                }).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">pending</span>
                      Unprocessed Video Lessons
                    </h3>
                    <div className="space-y-3">
                      {videoLessons.filter(l => {
                        const aiLesson = courseAiContent.lessons?.find(al => al.lesson_id === l.id);
                        return !aiLesson || aiLesson.status !== 'completed';
                      }).map(lesson => (
                        <div key={lesson.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-amber-600 text-[18px]">movie</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{lesson.title}</p>
                              <p className="text-xs text-slate-400">{lesson.duration_minutes ? `${lesson.duration_minutes} min` : 'Video lesson'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleGenerateForLesson(lesson)}
                            disabled={generatingLesson === lesson.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
                          >
                            {generatingLesson === lesson.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                            )}
                            {generatingLesson === lesson.id ? 'Generating...' : 'Generate'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-purple-600 text-3xl">auto_awesome</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No AI Content Yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  Open individual video lessons and click "Generate AI Content" to create summaries, transcripts, flashcards and quizzes.
                </p>
                <button onClick={handleStartCourse} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
                  <span className="material-symbols-outlined">play_arrow</span>
                  Go to Lessons
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
