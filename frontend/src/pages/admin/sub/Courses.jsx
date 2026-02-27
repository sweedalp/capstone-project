import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../../services/api'
const Icon = ({ name, className = '' }) => <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
const Badge = ({ children, color = 'slate' }) => {
  const c = { green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700', slate:'bg-slate-100 text-slate-600', red:'bg-red-100 text-red-700' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c[color]||c.slate}`}>{children}</span>
}
export default function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '', level: 'beginner' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/v1/admin/courses')
      setCourses(res.data || [])
    } catch {
      showToast('Failed to load courses', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const handlePublishToggle = async (course) => {
    try {
      const endpoint = course.is_published
        ? `/api/v1/admin/courses/${course.id}/unpublish`
        : `/api/v1/admin/courses/${course.id}/publish`
      await apiClient.post(endpoint)
      showToast(course.is_published ? 'Course unpublished' : 'Course published')
      fetchCourses()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Action failed', 'error')
    }
  }

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/api/v1/admin/courses/${courseId}`)
      showToast('Course deleted', 'info')
      fetchCourses()
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const handleCreate = async () => {
    if (!newCourse.title.trim()) return showToast('Title is required', 'error')
    setCreating(true)
    try {
      await apiClient.post('/api/v1/admin/courses', newCourse)
      setShowCreate(false)
      setNewCourse({ title: '', description: '', level: 'beginner' })
      showToast('Course created!')
      fetchCourses()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create', 'error')
    } finally {
      setCreating(false)
    }
  }

  const published = courses.filter(c => c.is_published).length

  return (
    <div>
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3
          ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Courses</h2>
          <p className="text-slate-500 mt-1">{published} published · {courses.length} total</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
          <Icon name="add_circle" className="text-lg" />Create Course
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Icon name="school" className="text-5xl block mx-auto mb-3" />
          <p className="font-semibold">No courses yet</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
            Create First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Icon name="school" className="text-2xl text-blue-600" />
                </div>
                <Badge color={c.is_published ? 'green' : 'amber'}>
                  {c.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{c.title}</h3>
              <p className="text-xs text-slate-500 mb-1">By {c.trainer_name} · {c.level}</p>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{c.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Icon name="layers" className="text-sm" />{c.total_modules} modules
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="menu_book" className="text-sm" />{c.total_lessons} lessons
                </span>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => handlePublishToggle(c)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${c.is_published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {c.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => navigate(`/trainer/courses/${c.id}`)}
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  Manage
                </button>
                <button onClick={() => handleDelete(c.id, c.title)}
                  className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Icon name="delete" className="text-base text-slate-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Create New Course</h3>
              <button onClick={() => setShowCreate(false)}><Icon name="close" className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Title *</label>
                <input value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="e.g. Advanced Python" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Description</label>
                <textarea value={newCourse.description} onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                  rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                  placeholder="Brief description..." />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Level</label>
                <select value={newCourse.level} onChange={e => setNewCourse(p => ({ ...p, level: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleCreate} disabled={creating}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}