import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import apiClient from '../../services/api';
import '../../index.css';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedAIFeatures, setSelectedAIFeatures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const notificationsRef = useRef(null);

  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'Learner';

  const AI_FEATURES = ['Audio Summary', 'Video Transcripts', 'Walkthroughs', 'AI Tutor'];

  // Mock notifications (real endpoint not yet built)
  const notifications = [
    { id: 1, type: 'deadline', icon: 'schedule', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', title: 'Neural Nets Quiz Due Soon', message: 'Quiz deadline is tomorrow at 11:59 PM', time: '2 hours ago', unread: true },
    { id: 2, type: 'achievement', icon: 'military_tech', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', title: 'New Badge Earned!', message: 'You earned "Python Master" badge', time: '5 hours ago', unread: true },
    { id: 3, type: 'ai', icon: 'psychology', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'AI Generated Summary Ready', message: 'Your study session recap is available', time: 'Yesterday', unread: false },
    { id: 4, type: 'course', icon: 'auto_stories', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'New Lesson Available', message: 'Module 4: Deep Learning has been released', time: '2 days ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    apiClient.get('/api/v1/courses/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchMyCourses = () => {
    apiClient.get('/api/v1/courses/my/enrolled')
      .then(res => setMyCourses(res.data))
      .catch(() => {});
  };
  useEffect(() => { fetchMyCourses(); }, []);
useEffect(() => {
  setLoading(true);
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (selectedLevel) params.append('level', selectedLevel.toLowerCase());
  // Only send category_id if exactly ONE is selected (backend limitation)
  if (selectedCategories.length === 1) {
    const cat = categories.find(c => c.name === selectedCategories[0]);
    if (cat) params.append('category_id', cat.id);
  }
  params.append('skip', (currentPage - 1) * ITEMS_PER_PAGE);
  params.append('limit', ITEMS_PER_PAGE);

  apiClient.get(`/api/v1/courses/?${params.toString()}`)
    .then(res => {
      let courses = res.data;
      // Client-side filter for multi-category selection
      if (selectedCategories.length > 1) {
        courses = courses.filter(c => selectedCategories.includes(c.category_name));
      }
      setAllCourses(courses);
      setLoading(false);
    })
    .catch(() => { setError('Failed to load courses'); setLoading(false); });
}, [searchQuery, selectedLevel, selectedCategories, currentPage, categories]);

  const enrolledIds = new Set(myCourses.map(c => c.id));
  const myCoursesMap = Object.fromEntries(myCourses.map(c => [c.id, c]));

  const getDisplayCourses = () => {
    if (activeTab === 'inProgress') return myCourses.filter(c => c.progress_percent > 0 && c.progress_percent < 100);
    if (activeTab === 'completed') return myCourses.filter(c => c.progress_percent >= 100);
    if (activeTab === 'wishlist') return myCourses.filter(c => c.is_wishlisted);
    return allCourses;
  };
  const displayCourses = getDisplayCourses();

  const getLevelColor = (level) => {
    if (level === 'beginner') return 'bg-amber-500';
    if (level === 'intermediate') return 'bg-blue-600';
    return 'bg-emerald-500';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  };

  const handleEnroll = async (course) => {
    setEnrolling(true);
    try {
      await apiClient.post('/api/v1/enrollments/', { course_id: course.id });
      await fetchMyCourses();
      setShowEnrollModal(false);
      navigate(`/learner/courses/${course.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleFavorite = async (e, courseId) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/api/v1/enrollments/${courseId}/wishlist`);
      fetchMyCourses();
    } catch {
      setFavorites(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleAIFeature = (feature) => {
    setSelectedAIFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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
          <button onClick={() => navigate('/learner/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">dashboard</span><span>Dashboard</span>
          </button>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer" href="#">
            <span className="material-symbols-outlined">book_5</span><span>My Courses</span>
          </a>
          <button onClick={() => navigate('/learner/ai-hub')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">psychology</span><span>AI Learning Hub</span>
          </button>
          <button onClick={() => navigate('/learner/analytics')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">monitoring</span><span>Analytics</span>
          </button>
          <button onClick={() => navigate('/learner/search')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">search</span><span>Search & QA</span>
          </button>
          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>
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
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] mt-2 text-slate-400">1.3GB of 2GB cloud sync used</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="relative w-full group">
              <button type="submit" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 z-10">search</button>
              <input className="block w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-sm" placeholder="Search courses, skills, or instructors..."
                type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </form>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => navigate('/learner/ai-hub', { state: { openChat: true } })} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span><span>Ask AI</span>
            </button>

            {/* Notifications */}
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

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="flex flex-1 px-6 lg:px-12 py-8 gap-8">
            {/* Filter Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col gap-8 shrink-0">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={selectedCategories.includes(cat.name)} onChange={() => toggleCategory(cat.name)}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                      <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Level</h3>
                <div className="space-y-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <label key={level} className="flex items-center gap-3 group cursor-pointer">
                      <input type="radio" name="level" checked={selectedLevel === level} onChange={() => { setSelectedLevel(level); setCurrentPage(1); }}
                        className="h-5 w-5 border-slate-300 text-blue-600 cursor-pointer" />
                      <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{level}</span>
                    </label>
                  ))}
                  {selectedLevel && (
                    <button onClick={() => setSelectedLevel('')} className="text-xs text-blue-600 hover:underline mt-1">Clear level</button>
                  )}
                </div>
              </div>

              {/* AI Features Filter — UI ready, backend field pending */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">AI Features</h3>
                <p className="text-[10px] text-slate-400 mb-3 italic">Filter by available AI tools</p>
                <div className="space-y-2">
                  {AI_FEATURES.map((feature) => (
                    <label key={feature} className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={selectedAIFeatures.includes(feature)} onChange={() => toggleAIFeature(feature)}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                      <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{feature}</span>
                    </label>
                  ))}
                </div>
                {selectedAIFeatures.length > 0 && (
                  <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    AI feature filtering coming soon
                  </p>
                )}
              </div>
            </aside>

            {/* Course List */}
            <main className="flex-1 min-w-0">
              <div className="mb-8 border-b border-slate-200">
                <nav className="flex gap-10">
                  {[['all', 'All Courses'], ['inProgress', 'In Progress'], ['completed', 'Completed'], ['wishlist', 'Wishlist']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`relative pb-4 text-sm font-bold transition-colors ${activeTab === key ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
                      {label}
                      {activeTab === key && <span className="absolute bottom-0 left-0 h-1 w-full rounded-t bg-blue-600"></span>}
                    </button>
                  ))}
                </nav>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-5xl text-rose-400 mb-3 block">error</span>
                  <p className="text-slate-600 font-medium">{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">Retry</button>
                </div>
              ) : displayCourses.length === 0 ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">school_off</span>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No courses found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {displayCourses.map((course) => {
                    const isEnrolled = enrolledIds.has(course.id);
                    const myData = myCoursesMap[course.id];
                    const progress = myData?.progress_percent ?? 0;
                    const isWishlisted = myData?.is_wishlisted || favorites[course.id];
                    return (
                      <div key={course.id}
                        className="group relative flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:shadow-md cursor-pointer"
                        onClick={() => isEnrolled ? navigate(`/learner/courses/${course.id}`) : (() => { setSelectedCourse(course); setShowEnrollModal(true); })()}>
                        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl md:w-64">
                          {course.thumbnail_url
                            ? <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={course.title} src={course.thumbnail_url} />
                            : <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl text-blue-400">school</span>
                              </div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                            <span className={`rounded ${getLevelColor(course.level)} px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}>{course.level}</span>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                {course.category_name && <p className="text-xs font-bold text-blue-600 uppercase mb-1">{course.category_name}</p>}
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                              </div>
                              <button onClick={(e) => toggleFavorite(e, course.id)}
                                className={`text-slate-400 hover:text-rose-500 transition-colors ${isWishlisted ? 'text-rose-500' : ''}`}>
                                <span className="material-symbols-outlined leading-none" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 flex-wrap">
                              {course.trainer_name && <span className="flex items-center gap-1 font-medium text-slate-700"><span className="material-symbols-outlined text-base">person</span>{course.trainer_name}</span>}
                              <span>•</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">schedule</span>{formatDuration(course.duration_minutes)}</span>
                              {course.total_lessons > 0 && <><span>•</span><span>{course.total_lessons} lessons</span></>}
                            </div>
                            {isEnrolled && progress > 0 && (
                              <div className="mb-4 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-blue-600">{Math.round(progress)}% Completed</span>
                                  {myData?.current_module && <span className="text-slate-400">Current: {myData.current_module}</span>}
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                  <div className="h-full rounded-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>
                            )}
                            {!isEnrolled && course.description && (
                              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); isEnrolled ? navigate(`/learner/courses/${course.id}`) : (() => { setSelectedCourse(course); setShowEnrollModal(true); })(); }}
                              className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-bold transition-all active:scale-95 ${isEnrolled ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600/5'}`}>
                              {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'all' && !loading && (
                <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
                  <p className="text-sm text-slate-500">Showing {displayCourses.length} courses</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    {[1, 2, 3].map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>{p}</button>
                    ))}
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={displayCourses.length < ITEMS_PER_PAGE}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </main>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">Enroll in Course</h2>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="relative h-48 rounded-xl overflow-hidden">
                {selectedCourse.thumbnail_url
                  ? <img className="h-full w-full object-cover" alt={selectedCourse.title} src={selectedCourse.thumbnail_url} />
                  : <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-blue-400">school</span>
                    </div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    {selectedCourse.trainer_name && <span>{selectedCourse.trainer_name}</span>}
                    <span>•</span>
                    <span>{formatDuration(selectedCourse.duration_minutes)}</span>
                    <span>•</span>
                    <span className={`rounded ${getLevelColor(selectedCourse.level)} px-2 py-1 text-[10px] font-bold uppercase`}>{selectedCourse.level}</span>
                  </div>
                </div>
              </div>
              {selectedCourse.description && (
                <div>
                  <h4 className="font-bold mb-2">About This Course</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">schedule</span>
                  <div><p className="text-sm font-semibold text-slate-900">Flexible Schedule</p><p className="text-xs text-slate-500">Learn at your own pace</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                  <div><p className="text-sm font-semibold text-slate-900">AI Learning Tools</p><p className="text-xs text-slate-500">Video, audio & interactive guides</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-600/5 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">workspace_premium</span>
                  <div><p className="text-sm font-semibold text-slate-900">Certificate</p><p className="text-xs text-slate-500">Earn upon completion</p></div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex items-center justify-between">
              <button onClick={() => setShowEnrollModal(false)} className="px-6 py-3 text-slate-600 font-semibold hover:text-slate-900">Maybe Later</button>
              <button onClick={() => handleEnroll(selectedCourse)} disabled={enrolling}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg disabled:opacity-60">
                {enrolling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[20px]">check_circle</span>}
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;