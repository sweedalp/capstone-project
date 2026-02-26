import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';
import apiClient from '../../services/api';

const AssessmentResults = () => {
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();
  const notificationsRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications (backend pending)
  const notifications = [
    { id: 1, icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  // ── Fetch results ─────────────────────────────────────────────
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await apiClient.get(`/api/v1/assessments/${assessmentId}/results`);
        setResults(res.data);
      } catch (err) {
        setError('Could not load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [assessmentId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/learner/search', { state: { query: searchQuery } });
  };

  const getScoreStars = (score) => {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    return 1;
  };

  const getPerformanceColor = (status) => {
    if (status === 'mastered') return { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600', badge: 'text-emerald-600 bg-emerald-100' };
    return { bg: 'bg-rose-50 border-rose-100', icon: 'text-rose-600', badge: 'text-rose-600 bg-rose-100' };
  };

  const getLessonTypeIcon = (type) => {
    if (type === 'video') return 'video_library';
    if (type === 'audio') return 'podcasts';
    return 'quiz';
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading your results...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-slate-200 max-w-md">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4 block">error</span>
        <p className="text-slate-700 font-medium mb-4">{error}</p>
        <button onClick={() => navigate(`/learner/courses/${courseId}/assessments/${assessmentId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Retake Quiz
        </button>
      </div>
    </div>
  );

  const score = results?.score || 0;
  const stars = getScoreStars(score);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm"
                placeholder="Search courses, concepts, or files..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
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
                    <button onClick={() => setShowNotifications(false)}><span className="material-symbols-outlined text-slate-400 text-lg">close</span></button>
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
        <main className="flex-1 overflow-y-auto py-8 px-6">
          <div className="max-w-[1400px] mx-auto">

            {/* Hero Card */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-stretch rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                {/* Score */}
                <div className="w-full md:w-1/3 bg-blue-600/5 flex flex-col items-center justify-center p-8 border-r border-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-blue-600 blur-3xl"></div>
                  </div>
                  <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Quiz Score</p>
                  <div className="text-blue-600 text-6xl font-black leading-tight mb-4 relative z-10">{Math.round(score)}%</div>
                  <div className="flex gap-1 mb-2 relative z-10">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="material-symbols-outlined" style={{
                        fontVariationSettings: i <= stars ? "'FILL' 1" : "'FILL' 0",
                        color: i <= stars ? '#fbbf24' : '#d1d5db'
                      }}>star</span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm font-medium relative z-10">
                    {results?.correct_answers} out of {results?.total_questions} correct
                  </p>
                </div>

                {/* Actions */}
                <div className="flex w-full md:w-2/3 flex-col justify-center p-8 gap-4">
                  <div>
                    <h1 className="text-slate-900 text-3xl font-bold leading-tight mb-2">
                      {score >= 80 ? `Great job, ${userName}!` : score >= 60 ? `Good effort, ${userName}!` : `Keep going, ${userName}!`}
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {score >= 80
                        ? "You've shown a strong grasp of the fundamentals. With a quick review of a few key concepts, you'll be ready for the next challenge."
                        : score >= 60
                        ? "You're making progress! Review the recommended content below to strengthen your understanding."
                        : "Don't worry — reviewing the material and practicing again will help you improve quickly."}
                    </p>
                    {results?.ai_insight && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">lightbulb</span>
                          {results.ai_insight}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button onClick={() => navigate('/learner/revision')}
                      className="flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20">
                      <span className="material-symbols-outlined text-[20px]">play_circle</span>Start Review Session
                    </button>
                    <button onClick={() => navigate(`/learner/courses/${courseId}/assessments/${assessmentId}`)}
                      className="flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-white border border-slate-300 text-slate-900 text-sm font-bold hover:bg-slate-50">
                      <span className="material-symbols-outlined text-[20px]">refresh</span>Retake Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  <p className="text-slate-600 text-sm font-medium">Correct Answers</p>
                </div>
                <p className="text-slate-900 text-3xl font-bold">{results?.correct_answers}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500">cancel</span>
                  <p className="text-slate-600 text-sm font-medium">Incorrect Answers</p>
                </div>
                <p className="text-slate-900 text-3xl font-bold">{results?.incorrect_answers}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">schedule</span>
                  <p className="text-slate-600 text-sm font-medium">Total Time</p>
                </div>
                <p className="text-slate-900 text-3xl font-bold">{results?.total_time || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Breakdown */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-slate-900 text-xl font-bold mb-4">Performance Breakdown</h3>
                  {results?.performance_breakdown?.length > 0 ? (
                    <div className="space-y-3">
                      {results.performance_breakdown.map((item, idx) => {
                        const colors = getPerformanceColor(item.status);
                        return (
                          <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border ${colors.bg}`}>
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined ${colors.icon}`}>
                                {item.status === 'mastered' ? 'verified' : 'error'}
                              </span>
                              <span className="font-medium text-sm">{item.topic}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${colors.badge}`}>{item.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                      <p className="text-slate-500 text-sm">Detailed breakdown not available.</p>
                    </div>
                  )}
                </div>

                {/* AI Insight */}
                {results?.ai_insight && (
                  <div className="p-6 rounded-xl bg-blue-600/5 border border-blue-600/10">
                    <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">lightbulb</span>AI Insight
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{results.ai_insight}</p>
                  </div>
                )}
              </div>

              {/* Recommendations — real from backend */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                    Recommended Lessons
                  </h3>
                  <button onClick={() => navigate('/learner/ai-hub')} className="text-blue-600 text-sm font-semibold hover:underline">
                    View All
                  </button>
                </div>

                {results?.recommendations?.length > 0 ? (
                  <div className="space-y-4">
                    {results.recommendations.map((rec, idx) => (
                      <div key={idx} onClick={() => navigate(rec.url)}
                        className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className={`w-full md:w-40 h-24 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                          rec.type === 'video' ? 'bg-blue-50 group-hover:bg-blue-100' :
                          rec.type === 'audio' ? 'bg-purple-50 group-hover:bg-purple-100' :
                          'bg-green-50 group-hover:bg-green-100'
                        }`}>
                          <span className={`material-symbols-outlined text-4xl ${
                            rec.type === 'video' ? 'text-blue-600' :
                            rec.type === 'audio' ? 'text-purple-600' : 'text-green-600'
                          }`}>{getLessonTypeIcon(rec.type)}</span>
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase capitalize">{rec.type} Lesson</span>
                            {rec.duration_minutes > 0 && <span className="text-xs text-slate-400">• {rec.duration_minutes}m</span>}
                          </div>
                          <h4 className="text-slate-900 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{rec.title}</h4>
                        </div>
                        <div className="flex items-center pr-2">
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">arrow_forward_ios</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">recommend</span>
                    <p className="text-slate-500">No recommendations available yet.</p>
                  </div>
                )}

                {/* Final Actions */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-slate-600 text-sm italic">Ready to move on? You can always come back to these reviews later.</p>
                  <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/learner/courses/${courseId}`)}
                      className="text-slate-600 text-sm font-bold hover:text-blue-600 transition-colors underline underline-offset-4">
                      Skip for now
                    </button>
                    <button onClick={() => navigate(`/learner/courses/${courseId}`)}
                      className="flex items-center gap-2 justify-center rounded-lg h-12 px-8 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20">
                      <span>Continue Course</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentResults;