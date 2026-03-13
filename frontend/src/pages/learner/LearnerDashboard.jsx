import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import LearnerNotifications from '../../components/LearnerNotifications';
import LearnerSidebar from '../../components/LearnerSidebar';
import VoiceAIDrawer from '../../components/VoiceAIDrawer';
import apiClient from '../../services/api';
import '../../index.css';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  const firstName = userName.split(' ')[0];

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const refreshTimerRef = useRef(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const dashRes = await apiClient.get('/api/v1/dashboard/');
      setDashboardData(dashRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    refreshTimerRef.current = setInterval(fetchDashboard, 20000);
    const handleFocus = () => fetchDashboard();
    const handleVisibility = () => { if (!document.hidden) fetchDashboard(); };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(refreshTimerRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchDashboard]);

  const stats = dashboardData ? [
    {
      label: 'Courses Enrolled',
      value: dashboardData.total_enrolled ?? 0,
      icon: 'school',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: '+2 this month',
      trendUp: true,
    },
    {
      label: 'Lessons Completed',
      value: dashboardData.lessons_completed ?? 0,
      icon: 'check_circle',
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: `+${dashboardData.lessons_this_week ?? 0} this week`,
      trendUp: true,
    },
    {
      label: 'Avg Quiz Score',
      value: `${Math.round(dashboardData.average_quiz_score ?? 0)}%`,
      icon: 'quiz',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: dashboardData.quiz_trend ?? 'No change',
      trendUp: (dashboardData.average_quiz_score ?? 0) >= 70,
    },
    {
      label: 'Study Streak',
      value: `${dashboardData.study_streak ?? 0} days`,
      icon: 'local_fire_department',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      trend: 'Keep it up!',
      trendUp: true,
    },
  ] : [];

  const recentCourses = dashboardData?.recent_courses || [];
  const upcomingLessons = dashboardData?.upcoming_lessons || [];
  const recentActivity = dashboardData?.recent_activity || [];
  const aiRecommendations = dashboardData?.ai_recommendations || [];

  const getActivityIcon = (type) => {
    if (type === 'lesson_complete') return { icon: 'check_circle', bg: 'bg-green-100', color: 'text-green-600' };
    if (type === 'quiz_complete') return { icon: 'quiz', bg: 'bg-purple-100', color: 'text-purple-600' };
    if (type === 'course_enroll') return { icon: 'school', bg: 'bg-blue-100', color: 'text-blue-600' };
    if (type === 'achievement') return { icon: 'workspace_premium', bg: 'bg-amber-100', color: 'text-amber-600' };
    return { icon: 'circle', bg: 'bg-slate-100', color: 'text-slate-500' };
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <LearnerSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LearnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 z-10 shrink-0">
          <div className="flex items-center flex-1 max-w-xl">
            <form
              onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) navigate(`/learner/search?q=${encodeURIComponent(searchQuery)}`); }}
              className="relative w-full"
            >
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search courses, lessons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            {/* <button
              onClick={() => navigate('/learner/ai-hub')}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button> */}
            {/* <button
              onClick={() => setShowVoiceDrawer(true)}
              className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              <span>Voice AI</span>
            </button> */}
            <LearnerNotifications />
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-slate-500 uppercase">Pro {userRole}</p>
              </div>
              <ProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 py-8 bg-slate-50">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
              </h1>
              <p className="text-slate-500 text-lg">Here's your learning progress at a glance.</p>
            </div>
            <button
              onClick={() => navigate('/learner/courses')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Browse Courses
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-2xl ${stat.iconColor}`}>{stat.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">school</span>
                  Continue Learning
                </h2>
                <button onClick={() => navigate('/learner/courses')} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                  View All
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
              {recentCourses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">school</span>
                  <p className="text-slate-500 font-medium mb-4">You haven't enrolled in any courses yet.</p>
                  <button onClick={() => navigate('/learner/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                    Explore Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course) => {
                    const pct = course.total_lessons > 0
                      ? Math.round((course.completed_lessons / course.total_lessons) * 100)
                      : 0;
                    return (
                      <div
                        key={course.course_id}
                        onClick={() => navigate(`/learner/courses/${course.course_id}`)}
                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">school</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{course.course_title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${pct === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {pct === 100 ? '✓ Done' : `${pct}%`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                              {course.completed_lessons}/{course.total_lessons} lessons • Last: {formatTime(course.last_accessed)}
                            </p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        {course.next_lesson && (
                          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
                            <span className="material-symbols-outlined text-blue-500 text-[16px]">play_circle</span>
                            <span className="text-xs text-slate-500 truncate">Next: <span className="font-semibold text-slate-700">{course.next_lesson}</span></span>
                            <span className="material-symbols-outlined text-blue-600 text-[16px] ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">event</span>
                  Up Next
                </h2>
                {upcomingLessons.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-2 block">event</span>
                    <p className="text-slate-400 text-sm">No upcoming lessons</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingLessons.slice(0, 4).map((lesson, idx) => (
                      <div
                        key={lesson.lesson_id || idx}
                        onClick={() => navigate(`/learner/courses/${lesson.course_id}/lessons/${lesson.lesson_id}`)}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-purple-600 text-[18px]">
                              {lesson.lesson_type === 'video' ? 'play_circle' : lesson.lesson_type === 'quiz' ? 'quiz' : 'article'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-purple-600">{lesson.lesson_title}</p>
                            <p className="text-xs text-slate-400 truncate">{lesson.course_title}</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 text-[18px] group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-bold">AI Learning Hub</h3>
                    <p className="text-white/70 text-xs">Personalized for you</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-4">Get AI-generated summaries, quizzes and video explanations for any topic.</p>
                <button
                  onClick={() => navigate('/learner/ai-hub')}
                  className="w-full bg-white text-purple-700 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition-colors"
                >
                  Open AI Hub
                </button>
              </div>
            </div>
          </div>

          {recentActivity.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600">history</span>
                Recent Activity
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {recentActivity.slice(0, 6).map((activity, idx) => {
                  const { icon, bg, color } = getActivityIcon(activity.type);
                  return (
                    <div key={idx} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.description}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(activity.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {aiRecommendations.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                AI Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => rec.url && navigate(rec.url)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-blue-600 text-xl">{rec.icon || 'lightbulb'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{rec.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showVoiceDrawer && (
        <VoiceAIDrawer
          isOpen={showVoiceDrawer}
          onClose={() => setShowVoiceDrawer(false)}
        />
      )}
    </div>
  );
};

export default LearnerDashboard;