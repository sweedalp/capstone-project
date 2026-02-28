import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import LearnerSidebar from '../../components/LearnerSidebar';

export default function Analytics() {
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiClient.get('/api/v1/notifications/')
      .then(res => {
        const items = (res.data.notifications || []).map(n => ({
          ...n,
          iconColor: n.icon_color,
          iconBg: n.icon_bg,
          unread: !n.is_read,
          time: new Date(n.created_at).toLocaleString(),
        }));
        setNotifications(items);
        setUnreadCount(res.data.unread_count || 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, []);

  // Badge rarity config — mock metadata until badge model has rarity field
  const BADGE_RARITY = {
    common: { label: 'Common', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', gradient: 'from-slate-300 to-slate-400', pct: 68 },
    rare: { label: 'Rare', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-600', pct: 24 },
    epic: { label: 'Epic', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-600', pct: 11 },
    legendary: { label: 'Legendary', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-yellow-400 to-orange-500', pct: 3 },
  };

  // Assign mock rarity to badges by index cycle (real rarity field on ActivityLog not yet built)
  const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
  const getBadgeRarity = (idx) => rarityOrder[idx % rarityOrder.length];

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      apiClient.get(`/api/v1/analytics/overview?days=${timeRange}`),
      apiClient.get('/api/v1/analytics/weekly'),
      apiClient.get('/api/v1/analytics/courses'),
      apiClient.get('/api/v1/analytics/achievements'),
    ]).then(([overviewResult, weeklyResult, coursesResult, achievementsResult]) => {

      const overview = overviewResult.status === 'fulfilled' ? overviewResult.value.data : {};
      const weekly = weeklyResult.status === 'fulfilled' ? weeklyResult.value.data : {};
      const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data : {};
      const achievements = achievementsResult.status === 'fulfilled' ? achievementsResult.value.data : {};

      if (overviewResult.status === 'rejected') console.warn('Overview failed:', overviewResult.reason);
      if (weeklyResult.status === 'rejected') console.warn('Weekly failed:', weeklyResult.reason);
      if (coursesResult.status === 'rejected') console.warn('Courses failed:', coursesResult.reason);
      if (achievementsResult.status === 'rejected') console.warn('Achievements failed:', achievementsResult.reason);

      setAnalyticsData({
        ...overview,
        daily_activity: (weekly.daily_stats || []).map(d => ({
          date: d.date,
          hours: d.hours,
        })),
        enrolled_courses: (courses.courses || []).map(c => ({
          id: c.course_id,
          title: c.course_title,
          progress_percent: c.progress_percent,
          avg_quiz_score: c.avg_quiz_score,
          duration_minutes: null,
          level: '',
          thumbnail_url: null,
        })),
        achievements: (achievements.badges || []).map((b, i) => ({
          id: b.id,
          title: b.name,
          description: b.description,
          icon: 'workspace_premium',
          is_locked: !b.earned,
          earned_at: b.earned_date || new Date().toISOString(),
        })),
        current_streak_days: overview.current_streak_days ?? 0,
        best_streak_days: overview.current_streak_days ?? 0,
        hours_today: 0,
        weekly_progress_delta: 0,
        ai_content_usage: {},
      });
      setLoading(false);
    });
  }, [timeRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const overallProgress = analyticsData?.overall_progress_percent ?? 0;
  const totalHours = analyticsData?.hours_learned ?? 0;
  const currentStreak = analyticsData?.current_streak_days ?? 0;
  const bestStreak = analyticsData?.best_streak_days ?? 0;
  const weeklyActivity = analyticsData?.daily_activity || [];
  const currentCourses = analyticsData?.enrolled_courses || [];
  const achievements = analyticsData?.achievements || [];
  const aiUsage = analyticsData?.ai_content_usage || {};
  const hoursToday = analyticsData?.hours_today ?? 0;
  const weeklyProgressDelta = analyticsData?.weekly_progress_delta ?? 0;

  const maxHours = Math.max(...weeklyActivity.map(d => d.hours || 0), 1);
  const chartData = weeklyActivity.map(d => ({
    date: d.date,
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: d.hours || 0,
    height: Math.round(((d.hours || 0) / maxHours) * 95),
  }));

  // Build streak day indicators from daily_activity
  // Shows last 7 days as circles (real streak calendar — derived from backend data)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const match = weeklyActivity.find(a => a.date === iso);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
      date: iso,
      active: match ? match.hours > 0 : false,
      isToday: i === 6,
    };
  });

  const aiContentUsage = [
    { type: 'Videos', icon: 'movie', hours: `${(aiUsage.video_hours || 0).toFixed(1)}h`, color: 'text-purple-500' },
    { type: 'Audio', icon: 'mic', hours: `${(aiUsage.audio_hours || 0).toFixed(1)}h`, color: 'text-blue-500' },
    { type: 'Walks', icon: 'explore', hours: `${(aiUsage.walkthrough_hours || 0).toFixed(1)}h`, color: 'text-emerald-500' },
    { type: 'AI Q&A', icon: 'smart_toy', hours: `${(aiUsage.qa_count || 0)} asks`, color: 'text-orange-500' },
  ];

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 block">error</span>
        <p className="text-slate-700 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <LearnerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
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
                      <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
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
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                              {n.unread && <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-1">{n.message}</p>
                            <p className="text-xs text-slate-400">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <button onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 w-full text-center">
                      View All Notifications
                    </button>
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

        <main className="flex-1 overflow-y-auto bg-slate-50 px-10 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">Learning Progress & Analytics</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Welcome back, {userName}. Your AI-powered growth insights are ready.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Progress */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Overall Progress</p>
                  <span className="material-symbols-outlined text-blue-600">donut_large</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(overallProgress)}%</p>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }}></div>
                  </div>
                  {weeklyProgressDelta !== 0 && (
                    <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${weeklyProgressDelta > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                      <span className="material-symbols-outlined text-sm">{weeklyProgressDelta > 0 ? 'trending_up' : 'trending_down'}</span>
                      {weeklyProgressDelta > 0 ? '+' : ''}{weeklyProgressDelta.toFixed(1)}% this week
                    </p>
                  )}
                </div>
              </div>

              {/* Total Hours */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Hours Learned</p>
                  <span className="material-symbols-outlined text-blue-600">schedule</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{totalHours.toFixed(1)} <span className="text-lg font-medium text-slate-500">hrs</span></p>
                  {hoursToday > 0 && (
                    <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">trending_up</span>+{hoursToday.toFixed(1)} hrs today
                    </p>
                  )}
                  {hoursToday === 0 && (
                    <p className="text-slate-400 text-sm mt-2">No activity recorded today yet</p>
                  )}
                </div>
              </div>

              {/* Streak — with day indicator circles */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Current Streak</p>
                  <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{currentStreak} <span className="text-lg font-medium text-slate-500">Days</span></p>
                  {bestStreak > 0 && (
                    <p className="text-blue-600 text-sm font-medium mt-1">Personal best: {bestStreak} days</p>
                  )}
                  {/* Streak day indicator circles — real data from daily_activity */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {last7Days.map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${day.active
                          ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200'
                          : day.isToday
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-slate-200 text-slate-400 bg-slate-50'
                          }`}>
                          {day.active ? '🔥' : day.label}
                        </div>
                        <span className={`text-[8px] font-bold uppercase ${day.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart + Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 flex flex-col gap-6 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Learning Stats</h3>
                  <select className="text-sm border-slate-200 rounded-lg bg-slate-100 py-1 pr-8 focus:ring-blue-600 cursor-pointer"
                    value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-slate-400 text-sm">No activity data yet. Start learning to see your progress!</p>
                  </div>
                ) : (
                  <div className="relative mt-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex gap-3 items-end">
                      <div className="flex flex-col justify-between h-48 pb-6 flex-shrink-0">
                        {[maxHours, Math.round(maxHours * 0.75), Math.round(maxHours * 0.5), Math.round(maxHours * 0.25), 0].map(v => (
                          <span key={v} className="text-[9px] text-slate-400 font-medium leading-none">{v}h</span>
                        ))}
                      </div>
                      <div className="relative flex-1 h-48">
                        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
                          {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full border-t border-dashed border-slate-200"></div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-end gap-2 pb-6 px-1">
                          {chartData.map((data, index) => {
                            const isHovered = hoveredDay === index;
                            const isMax = data.hours === maxHours && maxHours > 0;
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                                onMouseEnter={() => setHoveredDay(index)} onMouseLeave={() => setHoveredDay(null)}>
                                <span className={`text-[9px] font-bold leading-none mb-0.5 transition-all ${isMax ? 'text-blue-600' : isHovered ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {data.hours > 0 ? `${data.hours.toFixed(1)}h` : ''}
                                </span>
                                <div className={`w-full rounded-lg cursor-pointer transition-all duration-300 ${isMax ? 'shadow-lg shadow-blue-500/40' : ''}`}
                                  style={{
                                    height: `${Math.max(data.height, 2)}%`,
                                    background: isMax
                                      ? 'linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)'
                                      : isHovered
                                        ? 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)'
                                        : 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)'
                                  }}>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-1 h-6 items-center">
                          {chartData.map((data, index) => (
                            <div key={index} className="flex-1 flex justify-center">
                              <span className={`text-[10px] font-bold ${hoveredDay === index ? 'text-slate-700' : 'text-slate-400'}`}>{data.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Total: <strong className="text-slate-700">{totalHours.toFixed(1)}h</strong></span>
                      {chartData.length > 0 && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          Best: {Math.max(...chartData.map(d => d.hours)).toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Content Usage */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <p className="text-sm font-bold text-slate-900 mb-4">AI Content Usage Breakdown</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {aiContentUsage.map((content, index) => (
                      <div key={index} onClick={() => navigate('/learner/ai-hub', { state: { filter: content.type.toLowerCase() } })}
                        className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                        <span className={`material-symbols-outlined ${content.color}`}>{content.icon}</span>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{content.type}</p>
                          <p className="text-sm font-bold text-slate-900">{content.hours}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Courses */}
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold text-slate-900">Current Courses</h3>
                <div className="flex flex-col gap-4">
                  {currentCourses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">school</span>
                      <p className="text-slate-500 text-sm">No courses enrolled yet.</p>
                      <button onClick={() => navigate('/learner/courses')} className="mt-3 text-blue-600 font-semibold text-sm hover:underline">Browse Courses →</button>
                    </div>
                  ) : currentCourses.map(course => (
                    <div key={course.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-600 transition-all group cursor-pointer"
                      onClick={() => navigate(`/learner/courses/${course.id}`)}>
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
                          {course.thumbnail_url
                            ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-3xl">school</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{course.title}</h4>
                          <p className="text-xs text-slate-500 capitalize">{course.level} • {formatDuration(course.duration_minutes)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Progress</span><span>{Math.round(course.progress_percent || 0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: `${course.progress_percent || 0}%` }}></div>
                        </div>
                        {course.avg_quiz_score != null && (
                          <div className="mt-2 flex justify-between items-center bg-slate-100 p-2 rounded">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Quiz Score</span>
                            <span className={`text-sm font-bold ${course.avg_quiz_score >= 80 ? 'text-green-600' : course.avg_quiz_score >= 60 ? 'text-blue-600' : 'text-rose-500'}`}>
                              {Math.round(course.avg_quiz_score)}%
                            </span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); navigate(`/learner/courses/${course.id}`); }}
                          className="mt-2 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                          Continue Learning<span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/learner/courses')} className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-600/10 rounded-lg border border-dashed border-blue-600/30">
                    Explore More Courses
                  </button>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="flex flex-col gap-6 pb-12 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Achievements</h3>
                {achievements.length > 0 && (
                  <span className="text-sm text-slate-500">{achievements.filter(a => !a.is_locked).length} earned</span>
                )}
              </div>
              {achievements.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">military_tech</span>
                  <p className="text-slate-500">Complete lessons and quizzes to earn achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {achievements.map((badge, idx) => {
                    const rarity = getBadgeRarity(idx);
                    const rarityMeta = BADGE_RARITY[rarity];
                    return (
                      <div key={badge.id}
                        onClick={() => { if (!badge.is_locked) { setSelectedBadge({ ...badge, rarity, rarityMeta, idx }); setShowBadgeModal(true); } }}
                        className={`flex flex-col items-center gap-3 p-4 bg-white rounded-xl border-2 text-center shadow-sm hover:shadow-md transition-all ${badge.is_locked ? 'opacity-40 grayscale cursor-not-allowed border-slate-200' : `cursor-pointer ${rarityMeta.border} hover:scale-105`}`}>
                        <div className={`size-16 rounded-full flex items-center justify-center ${badge.is_locked ? 'bg-slate-200' : `bg-gradient-to-br ${rarityMeta.gradient} shadow-lg`}`}>
                          <span className={`material-symbols-outlined text-3xl ${badge.is_locked ? 'text-slate-500' : 'text-white'}`}>
                            {badge.icon || 'workspace_premium'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{badge.title}</p>
                          {!badge.is_locked ? (
                            <>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rarityMeta.bg} ${rarityMeta.color}`}>{rarityMeta.label}</span>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Earned {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </>
                          ) : (
                            <p className="text-[10px] text-slate-400">Locked</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Badge Modal — with rarity, earned-by stats, description */}
      {showBadgeModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBadgeModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Gradient header based on rarity */}
            <div className={`bg-gradient-to-br ${selectedBadge.rarityMeta.gradient} p-8 flex flex-col items-center gap-4`}>
              <div className="size-24 rounded-full bg-white/20 flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-white text-5xl">{selectedBadge.icon || 'workspace_premium'}</span>
              </div>
              <div className="text-center">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedBadge.rarityMeta.label}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">{selectedBadge.title}</h3>
                <p className="text-sm text-slate-500">
                  Earned on {new Date(selectedBadge.earned_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedBadge.description || `You earned the "${selectedBadge.title}" badge by demonstrating exceptional dedication to your learning journey. Keep up the great work!`}
                </p>
              </div>

              {/* Rarity + earned-by stats — mock numbers until badge model has these fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl ${selectedBadge.rarityMeta.bg} border ${selectedBadge.rarityMeta.border} text-center`}>
                  <p className={`text-lg font-black ${selectedBadge.rarityMeta.color}`}>{selectedBadge.rarityMeta.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Rarity</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-lg font-black text-slate-700">{selectedBadge.rarityMeta.pct}%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Learners have this</p>
                </div>
              </div>

              <button onClick={() => setShowBadgeModal(false)} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
