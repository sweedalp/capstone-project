import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import LearnerSidebar from '../../components/LearnerSidebar';
import apiClient from '../../services/api';

const WS_URL = 'ws://localhost:8000/api/voice';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);

  // Voice WebSocket
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Voice modal
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [qaAnswer, setQaAnswer] = useState(null);
  const [qaSources, setQaSources] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  // ── Fetch suggestions ─────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/api/v1/search/suggestions')
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => setSuggestions([
        "What is a Python function?",
        "How do loops work?",
        "Explain variables and data types",
        "What is the difference between list and tuple?",
        "How to use if-else statements?",
      ]));
  }, []);

  // ── Auto-search ───────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.query) handleSearch(location.state.query);
  }, []);

  // ── Close notifications ───────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // ── Auto scroll chat ──────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // ── WebSocket setup ───────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => { setWsConnected(false); setVoiceLoading(false); };
    ws.onerror = () => { setWsConnected(false); setVoiceLoading(false); };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          setWsConnected(true);
        } else if (data.type === 'thinking') {
          setVoiceLoading(true);
        } else if (data.type === 'response') {
          setVoiceLoading(false);
          const reply = data.text || '';
          setVoiceMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          // Speak the response
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.rate = 1;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        } else if (data.type === 'error') {
          setVoiceLoading(false);
          setVoiceMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.message}` }]);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };
  }, []);

  // ── Disconnect WS on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ── Search ────────────────────────────────────────────────────────
  const handleSearch = async (query) => {
    const q = (query || searchQuery).trim();
    if (!q) return;
    setSearchQuery(q);
    setSearching(true);
    setSearchError(null);
    setQaAnswer(null);
    setQaSources([]);
    setShowFullAnswer(false);
    try {
      const [searchRes, qaRes] = await Promise.all([
        apiClient.get(`/api/v1/search/?q=${encodeURIComponent(q)}`),
        apiClient.post('/api/v1/search/qa', { question: q }),
      ]);
      setResults(searchRes.data.results || []);
      setQaAnswer(qaRes.data.answer || null);
      setQaSources(qaRes.data.sources || []);
      setHasSearched(true);
    } catch {
      setSearchError('Search failed. Please try again.');
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  // ── Text Chat (via backend voice WebSocket) ───────────────────────
  const handleChatSend = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Use backend /api/v1/search/qa for chat answers
      const res = await apiClient.post('/api/v1/search/qa', { question: message });
      const reply = res.data.answer || "Sorry, I couldn't find an answer.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Voice (Web Speech API + backend WebSocket) ────────────────────
  const startVoiceConversation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't support voice recognition. Please use Chrome.");
      return;
    }

    connectWS();
    setShowVoiceDrawer(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setVoiceMessages(prev => [...prev, { role: 'user', content: transcript }]);
      setVoiceLoading(true);

      // Send via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'message', text: transcript }));
      } else {
        // Fallback to REST if WS not ready
        apiClient.post('/api/v1/search/qa', { question: transcript })
          .then(res => {
            const reply = res.data.answer || "Sorry, I couldn't find an answer.";
            setVoiceMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            const utterance = new SpeechSynthesisUtterance(reply);
            window.speechSynthesis.speak(utterance);
          })
          .catch(() => setVoiceMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }]))
          .finally(() => setVoiceLoading(false));
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const lessonResults = results.filter(r => r.type === 'lesson');
  const courseResults = results.filter(r => r.type === 'course');

  const getLessonTypeIcon = (type) => {
    if (type === 'video') return 'movie';
    if (type === 'quiz') return 'quiz';
    return 'article';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <LearnerSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm"
                placeholder="Search courses, concepts, or files..." type="text"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
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
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Search & Q&A</h1>
              <p className="text-slate-600">Ask questions and get AI-powered answers with related learning content</p>
            </div>

            {/* Search + Chat Input Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask anything about your lessons or any topic..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={startVoiceConversation}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-center
                    ${isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                  title="Voice AI Assistant"
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
                >
                  {chatLoading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    : <span className="material-symbols-outlined">send</span>}
                  {chatLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>

              {/* Suggested searches */}
              {suggestions.length > 0 && chatMessages.length === 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-3 font-medium">Suggested searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => { setChatInput(s); }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            {chatMessages.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col gap-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <span className="material-symbols-outlined text-white text-sm">psychology</span>
                      </div>
                    )}
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-sm">psychology</span>
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-5xl">chat</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Ask AI Anything</h3>
                <p className="text-slate-600">Ask any question — about your courses or any topic — and get AI-powered answers</p>
                <p className="text-slate-400 text-sm mt-2">Use the mic button to ask by voice</p>
              </div>
            )}

            {/* Search Error */}
            {searchError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500">error</span>
                <p className="text-rose-700 font-medium">{searchError}</p>
              </div>
            )}

            {/* Search Results */}
            {hasSearched && !searchError && (
              <>
                {qaAnswer && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-xl">psychology</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">AI Answer</h2>
                        <p className="text-slate-700 leading-relaxed mb-3">
                          {showFullAnswer ? qaAnswer : qaAnswer.slice(0, 200) + (qaAnswer.length > 200 ? '...' : '')}
                        </p>
                        {qaAnswer.length > 200 && (
                          <button onClick={() => setShowFullAnswer(!showFullAnswer)} className="text-blue-600 text-sm font-medium hover:underline">
                            {showFullAnswer ? 'Show less' : 'Read full answer'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {lessonResults.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">menu_book</span>
                      Related Lessons
                      <span className="text-sm font-normal text-slate-500">({lessonResults.length} found)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {lessonResults.map((lesson) => (
                        <div key={lesson.id} onClick={() => navigate(lesson.url)}
                          className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-600 text-lg">{getLessonTypeIcon(lesson.lesson_type)}</span>
                            <span className="text-xs text-blue-600 font-medium capitalize">{lesson.lesson_type}</span>
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600">{lesson.title}</h4>
                          <p className="text-xs text-slate-500 mb-3">{lesson.description}</p>
                          <span className="text-blue-600 text-sm font-medium">View Lesson →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {qaSources.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-slate-600">link</span>
                      <h3 className="text-lg font-bold text-slate-800">Sources</h3>
                    </div>
                    <div className="space-y-3">
                      {qaSources.map((source, idx) => (
                        <button key={idx} onClick={() => navigate(source.url)}
                          className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                            <div>
                              <p className="font-medium text-slate-800">{source.lesson_title}</p>
                              <p className="text-xs text-slate-500">{source.course_title} • {source.module_title}</p>
                            </div>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">source</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {courseResults.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">school</span>
                      Found in Courses
                      <span className="text-sm font-normal text-slate-500">({courseResults.length} found)</span>
                    </h3>
                    <div className="space-y-3">
                      {courseResults.map((course) => (
                        <button key={course.id} onClick={() => navigate(course.url)}
                          className="w-full flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {course.thumbnail_url
                              ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-blue-600">school</span>}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1">{course.title}</h4>
                            <p className="text-sm text-slate-600 mb-1 line-clamp-2">{course.description}</p>
                            {course.level && <span className="text-xs px-2 py-0.5 bg-slate-100 rounded capitalize">{course.level}</span>}
                          </div>
                          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Voice Modal */}
      {showVoiceDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">mic</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Voice AI Tutor</h3>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${wsConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    {isListening ? 'Listening...' : wsConnected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowVoiceDrawer(false); setVoiceMessages([]); window.speechSynthesis.cancel(); }}
                className="text-white/70 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-4 max-h-80 overflow-y-auto flex flex-col gap-3 min-h-[200px]">
              {voiceMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">record_voice_over</span>
                  <p className="text-slate-400 text-sm">Click "Start Talking" and ask any question</p>
                  <p className="text-slate-300 text-xs mt-1">Ask about courses or any topic!</p>
                </div>
              )}
              {voiceMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {voiceLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button onClick={() => { setVoiceMessages([]); window.speechSynthesis.cancel(); }}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
                Clear
              </button>
              <button onClick={startVoiceConversation}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all
                  ${isListening
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'}`}>
                <span className="material-symbols-outlined">mic</span>
                {isListening ? 'Listening...' : 'Start Talking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
