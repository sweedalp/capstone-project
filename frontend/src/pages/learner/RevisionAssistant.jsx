import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';

export default function RevisionAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);
  const chatEndRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  // Context passed from Dashboard or AI Hub
  const passedData = location.state || {};
  const initialTopic = passedData.topic || null;
  const quizScore = passedData.quizScore || null;

  // ── State ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [areasNeedingAttention, setAreasNeedingAttention] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [studyPlanMeta, setStudyPlanMeta] = useState({ completed: 0, total: 0, progress_percent: 0 });
  const [misunderstoodAreas, setMisunderstoodAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      text: initialTopic
        ? `I see you struggled with ${initialTopic}${quizScore ? ` (scored ${quizScore}%)` : ''}. Let me help you improve. What specific aspect would you like to focus on?`
        : "Hi! I'm your AI revision assistant. I can help you understand topics you're struggling with. What would you like to review today?"
    }
  ]);

  const quickPrompts = [
    "Explain what I struggled with in simple terms",
    "Show me examples of common mistakes",
    "Give me practice problems",
    "What are the key concepts I need to master?"
  ];

  // ── Load full page data ───────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/api/v1/revision/')
      .then(res => {
        const data = res.data;
        setAreasNeedingAttention(data.areas_needing_attention || []);
        setStudyPlan(data.study_plan?.tasks || []);
        setStudyPlanMeta({
          completed: data.study_plan?.completed || 0,
          total: data.study_plan?.total || 0,
          progress_percent: data.study_plan?.progress_percent || 0,
        });
        setMisunderstoodAreas(data.misunderstood_areas || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load revision data', err);
        setLoading(false);
      });
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // ── Chat ─────────────────────────────────────────────────────────────────
  const handleSendMessage = async (msg) => {
    const text = (msg || chatInput).trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { type: 'user', text }]);
    setChatInput('');
    setChatSending(true);

    try {
      const res = await apiClient.post('/api/v1/revision/chat', {
        message: text,
        context: { topic: initialTopic, quiz_score: quizScore }
      });
      setChatMessages(prev => [...prev, { type: 'ai', text: res.data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { type: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setChatSending(false);
    }
  };

  const handleQuickPrompt = (prompt) => handleSendMessage(prompt);

  // ── Study Plan Toggle ─────────────────────────────────────────────────────
  const handleToggleTask = async (lessonId) => {
    try {
      const res = await apiClient.patch(`/api/v1/revision/study-plan/${lessonId}/toggle`);
      setStudyPlan(prev => prev.map(t =>
        t.id === lessonId ? { ...t, completed: res.data.is_completed } : t
      ));
      // Recalculate meta
      setStudyPlan(prev => {
        const done = prev.filter(t => t.completed).length;
        setStudyPlanMeta({
          completed: done,
          total: prev.length,
          progress_percent: prev.length ? Math.round((done / prev.length) * 100) : 0,
        });
        return prev;
      });
    } catch (e) {
      console.error('Failed to toggle task', e);
    }
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/learner/search', { state: { query: searchQuery } });
  };

  const handleStartReviewSession = (area) => {
    navigate('/learner/ai-hub', {
      state: { focusTopic: area.topic, reviewMode: true, courseId: area.course_id, lessonId: area.lesson_id }
    });
  };

  const handleWatchVideo = (resource, area) => {
    if (resource?.url) navigate(resource.url);
  };

  const handleListenText = (resource, area) => {
    if (resource?.url) navigate(resource.url);
  };

  const handlePracticeExercises = (area) => {
    if (area.resources?.practice_url) navigate(area.resources.practice_url);
  };

  const handleTaskClick = (task) => {
    if (task.url) navigate(task.url);
  };

  const getScoreColor = (score) => {
    if (score < 50) return 'text-red-600 bg-red-50';
    if (score < 70) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your revision plan...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
          {[
            { label: 'Dashboard', icon: 'dashboard', path: '/learner/dashboard' },
            { label: 'My Courses', icon: 'book_5', path: '/learner/courses' },
            { label: 'AI Learning Hub', icon: 'psychology', path: '/learner/ai-hub' },
            { label: 'Analytics', icon: 'monitoring', path: '/learner/analytics' },
            { label: 'Search & QA', icon: 'search', path: '/learner/search' },
          ].map(({ label, icon, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>
          <button onClick={() => navigate('/learner/saved')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
            <span className="material-symbols-outlined">bookmark</span>
            <span>Saved Resources</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400"
                placeholder="Search courses, concepts, or files..." type="text"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">AI Revision Assistant</h1>
              <p className="text-slate-600 dark:text-slate-400">Personalized guidance to help you improve in areas where you're struggling</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left — Chat + Areas */}
              <div className="lg:col-span-2 space-y-6">

                {/* Chat */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">psychology</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ask Your AI Assistant</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Get personalized help with topics you're struggling with</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-blue-600 text-sm">psychology</span>
                          </div>
                        )}
                        <div className={`max-w-lg p-4 rounded-lg text-sm leading-relaxed ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {chatSending && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-blue-600 text-sm">psychology</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="px-6 pb-4">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <button key={i} onClick={() => handleQuickPrompt(prompt)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex gap-3">
                      <input type="text" value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything about your studies..."
                        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                      <button onClick={() => handleSendMessage()} disabled={chatSending}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">send</span>
                        Ask
                      </button>
                    </div>
                  </div>
                </div>

                {/* Areas Needing Attention */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Areas Needing Attention</h2>
                  </div>

                  {areasNeedingAttention.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">celebration</span>
                      <p className="text-slate-500 font-medium">No weak areas detected — you're doing great!</p>
                      <p className="text-slate-400 text-sm mt-1">Complete some quizzes to get personalized recommendations.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {areasNeedingAttention.map((area, index) => (
                        <div key={area.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-semibold text-slate-800 dark:text-white">{index + 1}. {area.topic}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(area.quiz_score)}`}>
                              {Math.round(area.quiz_score)}% quiz score
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 ml-4">
                            {area.resources?.video && (
                              <button onClick={() => handleWatchVideo(area.resources.video, area)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                <span className="material-symbols-outlined text-lg">play_circle</span>
                                Watch: {area.resources.video.title}
                                {area.resources.video.duration_minutes > 0 && ` (${area.resources.video.duration_minutes}m)`}
                              </button>
                            )}
                            {area.resources?.text && (
                              <button onClick={() => handleListenText(area.resources.text, area)}
                                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                                <span className="material-symbols-outlined text-lg">article</span>
                                Read: {area.resources.text.title}
                              </button>
                            )}
                            {area.resources?.practice_count > 0 && (
                              <button onClick={() => handlePracticeExercises(area)}
                                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                                <span className="material-symbols-outlined text-lg">edit_note</span>
                                Practice: {area.resources.practice_count} Exercise{area.resources.practice_count !== 1 ? 's' : ''}
                              </button>
                            )}
                          </div>

                          <button onClick={() => handleStartReviewSession(area)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">play_arrow</span>
                            Start Review Session
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commonly Misunderstood Areas */}
                {misunderstoodAreas.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-purple-600">help</span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Commonly Misunderstood Areas</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {misunderstoodAreas.map((topic, index) => (
                        <div key={topic.lesson_id}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all">
                          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{index + 1}. {topic.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{topic.description}</p>
                          <button onClick={() => navigate(topic.url)}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                            <span className="material-symbols-outlined text-lg">
                              {topic.lesson_type === 'video' ? 'play_circle' : 'article'}
                            </span>
                            {topic.lesson_type === 'video' ? 'Watch Explainer' : 'Read Now'}
                            {topic.duration_minutes > 0 && ` (${topic.duration_minutes}m)`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Study Plan */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">task_alt</span>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Today's Study Plan</h2>
                    </div>
                  </div>

                  {studyPlan.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">checklist</span>
                      <p className="text-slate-500 text-sm">Complete some quizzes to generate your study plan.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studyPlan.map((task) => (
                        <div key={task.id}
                          className={`border rounded-lg p-4 transition-all ${
                            task.completed
                              ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                          }`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => handleToggleTask(task.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                task.completed ? 'bg-green-600 border-green-600' : 'border-slate-300 hover:border-blue-500'
                              }`}>
                              {task.completed && <span className="material-symbols-outlined text-white text-sm">check</span>}
                            </button>
                            <button onClick={() => handleTaskClick(task)} className={`flex-1 text-left ${task.completed ? 'opacity-60' : ''}`}>
                              <div className={`font-medium mb-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                                {task.title}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{task.duration_minutes} min</span>
                                {task.type === 'video' && <span className="material-symbols-outlined text-blue-600 text-sm">play_circle</span>}
                                {task.type === 'text' && <span className="material-symbols-outlined text-purple-600 text-sm">article</span>}
                                {task.type === 'quiz' && <span className="material-symbols-outlined text-amber-600 text-sm">quiz</span>}
                              </div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {studyPlan.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Progress Today</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {studyPlanMeta.completed} / {studyPlanMeta.total} tasks
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${studyPlanMeta.progress_percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/learner/dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-blue-600">dashboard</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">Back to Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/learner/courses')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-green-600">school</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">My Courses</span>
                    </button>
                    <button onClick={() => navigate('/learner/analytics')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-purple-600">monitoring</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">View Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}