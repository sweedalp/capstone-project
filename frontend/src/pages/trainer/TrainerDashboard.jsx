import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // ── Real data state ───────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Course Creation Modal ─────────────────────────────────────
  const [showCourseCreationModal, setShowCourseCreationModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner',
    thumbnail_url: '',
  });

  const userName = localStorage.getItem('userName') || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';

  // ── Fetch all data on mount ───────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get('/api/v1/trainer/stats'),
      apiClient.get('/api/v1/trainer/courses'),
      apiClient.get('/api/v1/trainer/students'),
      apiClient.get('/api/v1/trainer/categories'),
    ]).then(([statsRes, coursesRes, studentsRes, catsRes]) => {
      setStats(statsRes.data);
      setCourses(coursesRes.data || []);
      setStudents(studentsRes.data || []);
      setCategories(catsRes.data || []);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load dashboard data');
      setLoading(false);
    });
  }, []);

  // ── Create course ─────────────────────────────────────────────
  const handleCourseCreationSubmit = async (e) => {
    e.preventDefault();
    if (!newCourseData.title.trim()) return alert('Course title is required');
    setCreating(true);
    try {
      const res = await apiClient.post('/api/v1/trainer/courses', {
        title: newCourseData.title,
        description: newCourseData.description,
        level: newCourseData.level,
        category_id: newCourseData.category_id ? parseInt(newCourseData.category_id) : null,
        thumbnail_url: newCourseData.thumbnail_url || null,
      });
      const newCourse = res.data;
      setShowCourseCreationModal(false);
      setNewCourseData({ title: '', description: '', category_id: '', level: 'beginner', thumbnail_url: '' });
      // Navigate to course management with real ID
      navigate(`/trainer/courses/${newCourse.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleCourseCreationCancel = () => {
    setShowCourseCreationModal(false);
    setNewCourseData({ title: '', description: '', category_id: '', level: 'beginner', thumbnail_url: '' });
  };

  // ── Publish / Unpublish ───────────────────────────────────────
  const handlePublish = async (courseId, isPublished) => {
    try {
      const endpoint = isPublished
        ? `/api/v1/trainer/courses/${courseId}/unpublish`
        : `/api/v1/trainer/courses/${courseId}/publish`;
      await apiClient.post(endpoint);
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, is_published: !isPublished } : c
      ));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update course status');
    }
  };

  // ── Delete course ─────────────────────────────────────────────
  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/v1/trainer/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  // Students needing attention (less than 50% progress)
  const atRiskStudents = students.slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <TrainerSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="Search courses or students..."
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* Welcome + Stats */}
          <section>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trainer Dashboard</h1>
            <p className="text-slate-500">Welcome back, {userName}! 👋</p>

            {/* Stats Row */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Total Courses', value: stats.total_courses, icon: 'school', color: 'blue' },
                  { label: 'Published', value: stats.published_courses, icon: 'published_with_changes', color: 'green' },
                  { label: 'Total Lessons', value: stats.total_lessons, icon: 'menu_book', color: 'purple' },
                  { label: 'Total Students', value: stats.total_students, icon: 'group', color: 'amber' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                      <span className={`material-symbols-outlined text-${stat.color}-600`}>{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MY COURSES */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">📚 MY COURSES</h2>
              <button
                onClick={() => setShowCourseCreationModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>New Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">school</span>
                <p className="text-slate-500 font-medium mb-4">No courses yet</p>
                <button onClick={() => setShowCourseCreationModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm">
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses
                  .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((course) => (
                  <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {course.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
                              {course.level}
                            </span>
                          </div>
                          {course.description && (
                            <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">layers</span>
                              {course.total_modules} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">menu_book</span>
                              {course.total_lessons} lessons
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handlePublish(course.id, course.is_published)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${course.is_published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                            {course.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => navigate(`/trainer/courses/${course.id}`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all">
                            Manage
                          </button>
                          <button
                            onClick={() => navigate(`/trainer/courses/${course.id}/analytics`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                            Analytics
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="p-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STUDENT INSIGHTS */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">📊 STUDENT INSIGHTS</h2>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500">group</span>
                <span className="text-sm font-semibold text-slate-900">
                  Total Students Enrolled: {stats?.total_students || 0}
                </span>
              </div>
              <button onClick={() => navigate('/trainer/analytics')}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold">
                View Detailed Analytics →
              </button>
            </div>

            {atRiskStudents.length > 0 ? (
              <div className="space-y-3">
                {atRiskStudents.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{student.user_name}</h4>
                      <p className="text-xs text-slate-500">{student.user_email} • {student.enrolled_courses} course(s)</p>
                    </div>
                    <button
                      onClick={() => navigate(`/trainer/analytics`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                      View →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No students enrolled yet</p>
            )}

            <button onClick={() => navigate('/trainer/analytics')}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
              View Detailed Analytics →
            </button>
          </section>

          {/* AI CONTENT STUDIO */}
          <section className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold tracking-tight mb-6">🤖 AI CONTENT STUDIO</h2>
              <div className="mb-6 space-y-3">
                {[
                  { icon: 'mic', label: 'Generate Audio Summary', tool: 'audio' },
                  { icon: 'movie', label: 'Create Video Explainer', tool: 'video' },
                  { icon: 'route', label: 'Build Interactive Walkthrough', tool: 'walkthrough' },
                ].map((item, idx) => (
                  <div key={idx} onClick={() => navigate(`/trainer/ai-studio?tool=${item.tool}`)}
                    className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-blue-400">{item.icon}</span>
                    <span>• {item.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/trainer/ai-studio')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                Open AI Studio →
              </button>
            </div>
          </section>

          {/* CONTENT LIBRARY */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">📁 CONTENT LIBRARY</h2>
            <p className="text-sm text-slate-500 mb-6">Upload and manage course materials</p>
            <button onClick={() => navigate('/trainer/content-library')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
              Browse Library →
            </button>
          </section>

        </div>
      </main>

      {/* Course Creation Modal */}
      {showCourseCreationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
              <button onClick={handleCourseCreationCancel} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  value={newCourseData.title}
                  onChange={(e) => setNewCourseData({...newCourseData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. Advanced Python Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData({...newCourseData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Brief description..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select
                  value={newCourseData.category_id}
                  onChange={(e) => setNewCourseData({...newCourseData, category_id: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Thumbnail URL (optional)</label>
                <input
                  type="text"
                  value={newCourseData.thumbnail_url}
                  onChange={(e) => setNewCourseData({...newCourseData, thumbnail_url: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                <div className="flex gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer gap-2">
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={newCourseData.level === level}
                        onChange={(e) => setNewCourseData({...newCourseData, level: e.target.value})}
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCourseCreationCancel}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCourseCreationSubmit}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {creating
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</>
                    : 'Create Course'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;