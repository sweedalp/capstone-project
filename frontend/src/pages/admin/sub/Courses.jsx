import { useEffect, useState } from 'react'
import { useApp } from '../../../context/AdminContext.jsx'
import apiClient from '../../../services/api'
import Icon  from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Modal from '../../../components/ui/Modal.jsx'

export default function Courses() {
  const { showToast } = useApp()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'beginner',
    category_id: '',
    thumbnail_url: '',
  })

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [coursesRes, catRes] = await Promise.all([
          apiClient.get('/api/v1/courses/'),
          apiClient.get('/api/v1/courses/categories'),
        ])
        if (!isMounted) return
        setCourses(coursesRes.data || [])
        setCategories(catRes.data || [])
      } catch (e) {
        console.error(e)
        if (!isMounted) return
        setError('Failed to load courses from server.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const active = courses.filter(c => c.is_published).length
  const total  = courses.length

  const handleCreate = async () => {
    if (!newCourse.title.trim()) {
      showToast('Course title is required','error')
      return
    }
    try {
      const payload = {
        title: newCourse.title.trim(),
        description: newCourse.description || '',
        level: newCourse.level,
        category_id: newCourse.category_id || null,
        thumbnail_url: newCourse.thumbnail_url || null,
      }
      const res = await apiClient.post('/api/v1/courses/', payload)
      setCourses(prev => [res.data, ...prev])
      setCreateOpen(false)
      setNewCourse({
        title: '',
        description: '',
        level: 'beginner',
        category_id: '',
        thumbnail_url: '',
      })
      showToast('Course created successfully','success')
    } catch (e) {
      console.error(e)
      showToast('Failed to create course','error')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Courses</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {active} published courses · {total} total courses
          </p>
        </div>
        <button onClick={()=>setCreateOpen(true)} className="btn-primary">
          <Icon name="add_circle" className="text-lg" />Create Course
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <Icon name="hourglass_empty" className="text-4xl block mx-auto mb-2" />
          <p>Loading courses…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(c=>(
            <div key={c.id} className="card p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Icon name="school" className="text-2xl text-primary" />
                </div>
                <Badge color={c.is_published ? 'green' : 'slate'}>
                  {c.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                {c.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                {c.duration_minutes || 0} min
                {c.category_name && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    {c.category_name}
                  </>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-semibold">Structure</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {c.total_modules ?? 0} modules · {c.total_lessons ?? 0} lessons
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (c.total_modules || 1) * 20)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="group" className="text-base text-slate-400" />
                  Managed by trainer #{c.trainer_id}
                </span>
                <button
                  onClick={()=>showToast('Course details view not yet wired','info')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Icon name="school" className="text-4xl block mx-auto mb-2" />
              <p>No courses found. Create the first course from the top-right button.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title="Create New Course">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Title
            </label>
            <input
              className="input-field"
              value={newCourse.title}
              onChange={e => setNewCourse(c => ({ ...c, title: e.target.value }))}
              placeholder="e.g. Python Fundamentals"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Description
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={newCourse.description}
              onChange={e => setNewCourse(c => ({ ...c, description: e.target.value }))}
              placeholder="Short summary of the course"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Level
              </label>
              <select
                className="input-field"
                value={newCourse.level}
                onChange={e => setNewCourse(c => ({ ...c, level: e.target.value }))}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Category
              </label>
              <select
                className="input-field"
                value={newCourse.category_id}
                onChange={e => setNewCourse(c => ({ ...c, category_id: e.target.value }))}
              >
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Thumbnail URL (optional)
            </label>
            <input
              className="input-field"
              value={newCourse.thumbnail_url}
              onChange={e => setNewCourse(c => ({ ...c, thumbnail_url: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={()=>setCreateOpen(false)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary flex-1 justify-center"
            >
              <Icon name="add_circle" className="text-lg" />Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}