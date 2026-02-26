import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);


  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [asking, setAsking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [currentWalkthroughStep, setCurrentWalkthroughStep] = useState(0);

  // Real data from backend
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [qaAnswer, setQaAnswer] = useState(null);
  const [qaSources, setQaSources] = useState([]);
  const [searchError, setSearchError] = useState(null);

  // Mock notifications (real endpoint not yet built)
  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  // Walkthrough steps (static tutorial UI — not backend dependent)
  const tutorialWalkthrough = {
    title: "Build Your First Function",
    steps: [
      { name: "Define the Function", instruction: "Start by using the 'def' keyword followed by your function name. Try creating a function called 'greet'." },
      { name: "Add Parameters", instruction: "Add a parameter called 'name' inside the parentheses. This allows your function to accept input." },
      { name: "Write Function Body", instruction: "Inside the function, write code to print a greeting message using the name parameter." },
      { name: "Call Your Function", instruction: "Outside the function, call it by typing greet('World') to see it in action!" },
    ],
  };

  // ── Fetch suggestions on mount ────────────────────────────────────
  useEffect(() => {
    apiClient.get('/api/v1/search/suggestions')
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => {
        // Fallback suggestions if endpoint not yet registered
        setSuggestions([
          "What is a Python function?",
          "How do loops work?",
          "Explain variables and data types",
          "What is the difference between list and tuple?",
          "How to use if-else statements?",
        ]);
      });
  }, []);

  // ── Auto-search if navigated here with a query ────────────────────
  useEffect(() => {
    if (location.state?.query) {
      handleSearch(location.state.query);
    }
  }, []);

  // ── Close notifications on outside click ─────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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
      // Run search + QA in parallel
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

  const handleSuggestedSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // Split results by type
  const lessonResults = results.filter(r => r.type === 'lesson');
  const courseResults = results.filter(r => r.type === 'course');

  const getLessonTypeIcon = (type) => {
    if (type === 'video') return 'movie';
    if (type === 'quiz') return 'quiz';
    return 'article';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
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
          <button onClick={() => navigate('/learner/ai-hub')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">psychology</span><span>AI Learning Hub</span>
          </button>
          <button onClick={() => navigate('/learner/analytics')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">monitoring</span><span>Analytics</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold w-full text-left">
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
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
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

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex gap-3 mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask anything... (e.g., What is a Python function?)"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                {/* Voice AI Button */}
                <button
                  onClick={() => setShowVoiceDrawer(true)}
                  className="p-3 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center"
                  title="Voice AI Assistant"
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button onClick={() => handleSearch()} disabled={searching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60">
                  {searching
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    : <span className="material-symbols-outlined">search</span>}
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Suggested Searches — real from backend */}
              {!hasSearched && suggestions.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-3 font-medium">Suggested searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button key={index} onClick={() => handleSuggestedSearch(suggestion)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {searchError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500">error</span>
                <p className="text-rose-700 font-medium">{searchError}</p>
              </div>
            )}

            {/* Results */}
            {hasSearched && !searchError && (
              <>
                {/* AI Q&A Answer — real from backend */}
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

                    {/* Action Buttons — UI ready, AI content generation pending */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                      <button onClick={() => { setSelectedVideo({ title: `${searchQuery} - Video Explainer`, duration: '5:30' }); setShowVideoModal(true); }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">play_circle</span>
                        <div className="text-left">
                          <div className="font-medium text-slate-800">Watch Video</div>
                          <div className="text-xs text-slate-500">AI-generated explainer</div>
                        </div>
                      </button>
                      <button onClick={() => { setSelectedAudio({ title: `${searchQuery} - Audio Summary`, duration: '3:15' }); setShowAudioPlayer(true); setIsAudioPlaying(true); }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                        <span className="material-symbols-outlined text-purple-600 text-2xl">headphones</span>
                        <div className="text-left">
                          <div className="font-medium text-slate-800">Listen to Audio</div>
                          <div className="text-xs text-slate-500">AI-generated summary</div>
                        </div>
                      </button>
                      <button onClick={() => { setShowWalkthroughOverlay(true); setCurrentWalkthroughStep(0); }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                        <span className="material-symbols-outlined text-green-600 text-2xl">explore</span>
                        <div className="text-left">
                          <div className="font-medium text-slate-800">Start Tutorial</div>
                          <div className="text-xs text-slate-500">Step-by-step walkthrough</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Lesson Results — real from backend */}
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
                            {lesson.duration_minutes > 0 && <span className="text-xs text-slate-400">• {lesson.duration_minutes}m</span>}
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
                          <p className="text-xs text-slate-500 mb-3">{lesson.description}</p>
                          <span className="text-blue-600 text-sm font-medium">View Lesson →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QA Sources — real from backend */}
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

                {/* Course Results — real from backend */}
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
                              : <span className="material-symbols-outlined text-blue-600">school</span>
                            }
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

                {/* No results */}
                {results.length === 0 && !qaAnswer && !searching && (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No results found</h3>
                    <p className="text-slate-600">Try a different search term or browse your courses directly</p>
                    <button onClick={() => navigate('/learner/courses')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                      Browse Courses
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!hasSearched && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-5xl">search</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Your Search</h3>
                <p className="text-slate-600">Ask any question about your courses and get AI-powered answers</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-slate-900 rounded-xl max-w-4xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedVideo.title}</h3>
                <p className="text-slate-400 text-sm">{selectedVideo.duration} • AI-generated explainer</p>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
              <div className="text-center text-white/40">
                <span className="material-symbols-outlined text-8xl mb-4 block">movie</span>
                <p className="text-lg font-medium">AI Video Explainer</p>
                <p className="text-sm mt-1">"{selectedVideo.title}"</p>
                <p className="text-xs mt-2 text-white/30">AI video generation coming soon</p>
              </div>
              <button className="absolute inset-0 flex items-center justify-center group">
                <div className="w-20 h-20 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
                </div>
              </button>
            </div>
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center gap-2">
                <span className="material-symbols-outlined">play_arrow</span>Play
              </button>
              <button onClick={() => { setShowVideoModal(false); navigate('/learner/ai-hub'); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <span className="material-symbols-outlined">open_in_new</span>Open in AI Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {showAudioPlayer && selectedAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setIsAudioPlaying(!isAudioPlaying)} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              <span className="material-symbols-outlined text-2xl">{isAudioPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <div className="flex-1">
              <div className="font-semibold">{selectedAudio.title}</div>
              <div className="text-sm text-white/80">{selectedAudio.duration} • Audio Summary</div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-1/3"></div>
              </div>
            </div>
            <p className="text-xs text-white/50">AI audio generation coming soon</p>
            <button onClick={() => setShowAudioPlayer(false)} className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Walkthrough Overlay */}
      {showWalkthroughOverlay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">explore</span>
                <div>
                  <h3 className="font-semibold text-lg">{tutorialWalkthrough.title}</h3>
                  <p className="text-sm text-white/90">Step {currentWalkthroughStep + 1} of {tutorialWalkthrough.steps.length}</p>
                </div>
              </div>
              <button onClick={() => { setShowWalkthroughOverlay(false); setCurrentWalkthroughStep(0); }} className="hover:bg-white/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="bg-slate-100 px-6 py-3">
              <div className="flex items-center gap-2">
                {tutorialWalkthrough.steps.map((_, index) => (
                  <div key={index} className={`flex-1 h-2 rounded-full transition-all ${index < currentWalkthroughStep ? 'bg-green-500' : index === currentWalkthroughStep ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">Step {currentWalkthroughStep + 1}</span>
                <h4 className="text-2xl font-bold text-slate-800 mb-3">{tutorialWalkthrough.steps[currentWalkthroughStep].name}</h4>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">{tutorialWalkthrough.steps[currentWalkthroughStep].instruction}</p>
                <div className="bg-slate-900 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm font-mono">exercise.py</span>
                    <span className="material-symbols-outlined text-slate-500">code</span>
                  </div>
                  <div className="font-mono text-sm text-green-400">
                    <div className="mb-2"># Try it yourself:</div>
                    <div className="text-slate-300 whitespace-pre">
                      {currentWalkthroughStep === 0 && "def greet():"}
                      {currentWalkthroughStep === 1 && "def greet(name):"}
                      {currentWalkthroughStep === 2 && "def greet(name):\n    print(f'Hello, {name}!')"}
                      {currentWalkthroughStep === 3 && "def greet(name):\n    print(f'Hello, {name}!')\n\ngreet('World')"}
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-amber-600">lightbulb</span>
                    <div>
                      <div className="font-semibold text-amber-900 mb-1">Pro Tip</div>
                      <p className="text-sm text-amber-800">
                        {currentWalkthroughStep === 0 && "Function names should be lowercase with underscores for readability."}
                        {currentWalkthroughStep === 1 && "Parameters are like variables that exist only within the function."}
                        {currentWalkthroughStep === 2 && "Indentation matters in Python! Use 4 spaces for the function body."}
                        {currentWalkthroughStep === 3 && "Functions can be called multiple times with different arguments!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
              <button onClick={() => setCurrentWalkthroughStep(s => Math.max(0, s - 1))} disabled={currentWalkthroughStep === 0}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined">arrow_back</span>Previous
              </button>
              {currentWalkthroughStep < tutorialWalkthrough.steps.length - 1 ? (
                <button onClick={() => setCurrentWalkthroughStep(s => s + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                  Next Step<span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button onClick={() => { setShowWalkthroughOverlay(false); setCurrentWalkthroughStep(0); }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>Complete Tutorial
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}