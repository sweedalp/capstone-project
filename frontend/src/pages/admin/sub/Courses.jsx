import { useEffect, useState, useRef } from 'react'
import { useApp } from '../../../context/AdminContext.jsx'
import apiClient from '../../../services/api'
import Icon from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Modal from '../../../components/ui/Modal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Courses() {
  const { showToast } = useApp()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [trainers, setTrainers] = useState([])
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', level: 'beginner',
    category_id: '', thumbnail_url: '', trainer_id: '',
  })
  const [contentFiles, setContentFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef(null)

  // ── Detail modal ──
  const [detailCourse, setDetailCourse] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // ── Enroll learners panel (inside detail modal) ──
  const [showEnrollPanel, setShowEnrollPanel] = useState(false)
  const [learners, setLearners] = useState([])
  const [learnerSearch, setLearnerSearch] = useState('')
  const [selectedLearners, setSelectedLearners] = useState([])
  const [enrolling, setEnrolling] = useState(false)

  // ── Reassign trainer panel (inside detail modal) ──
  const [showReassignPanel, setShowReassignPanel] = useState(false)
  const [reassignTrainerId, setReassignTrainerId] = useState('')
  const [reassigning, setReassigning] = useState(false)

  // ── Category management ──
  const [catSectionOpen, setCatSectionOpen] = useState(true)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [editingCat, setEditingCat] = useState(null)
  const [catLoading, setCatLoading] = useState(false)

  // ── Load data ──
  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true); setError('')
      try {
        const [coursesRes, catRes, usersRes] = await Promise.all([
          apiClient.get('/api/v1/admin/courses'),
          apiClient.get('/api/v1/admin/categories'),
          apiClient.get('/api/v1/admin/users?role=trainer&page_size=100'),
        ])
        if (!isMounted) return
        setCourses(coursesRes.data || [])
        setCategories(catRes.data || [])
        setTrainers(usersRes.data?.users || [])
      } catch (e) {
        console.error(e)
        if (!isMounted) return
        setError('Failed to load courses.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  // ── Load learners for enrollment (lazy, when panel opens) ──
  const loadLearners = async (search = '') => {
    try {
      const res = await apiClient.get(`/api/v1/admin/learners?search=${encodeURIComponent(search)}&page_size=100`)
      setLearners(res.data?.users || [])
    } catch {
      showToast('Failed to load learners', 'error')
    }
  }

  const active = courses.filter(c => c.is_published).length
  const total  = courses.length

  // ── Category CRUD ──
  const handleCreateCategory = async () => {
    const name = newCatName.trim()
    if (!name) { showToast('Category name is required', 'error'); return }
    setCatLoading(true)
    try {
      const res = await apiClient.post('/api/v1/admin/categories', { name, description: newCatDesc.trim() })
      setCategories(prev => [...prev, res.data])
      setNewCatName(''); setNewCatDesc('')
      showToast('Category created', 'success')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to create category', 'error')
    } finally { setCatLoading(false) }
  }

  const handleUpdateCategory = async () => {
    if (!editingCat) return
    const name = editingCat.name.trim()
    if (!name) { showToast('Category name is required', 'error'); return }
    setCatLoading(true)
    try {
      const res = await apiClient.put(`/api/v1/admin/categories/${editingCat.id}`, { name, description: editingCat.description || '' })
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...res.data } : c))
      setEditingCat(null)
      showToast('Category updated', 'success')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to update', 'error')
    } finally { setCatLoading(false) }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    setCatLoading(true)
    try {
      await apiClient.delete(`/api/v1/admin/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
      showToast('Category deleted', 'info')
    } catch { showToast('Failed to delete', 'error') }
    finally { setCatLoading(false) }
  }

  // ── File helpers ──
  const ACCEPTED_TYPES = ['video/mp4','video/webm','video/avi','video/quicktime','application/pdf',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']
  const ACCEPTED_EXTS = '.mp4,.webm,.avi,.mov,.pdf,.ppt,.pptx'

  const handleContentFilesChange = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      return ACCEPTED_TYPES.includes(f.type) || ['mp4','webm','avi','mov','pdf','ppt','pptx'].includes(ext)
    })
    if (valid.length < files.length) showToast('Some files skipped — only Video, PDF, PPT allowed.', 'error')
    setContentFiles(prev => [...prev, ...valid.map(f => ({ file: f, name: f.name, size: f.size }))])
    e.target.value = ''
  }

  const removeContentFile = (idx) => setContentFiles(prev => prev.filter((_, i) => i !== idx))
  const formatFileSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB'
  const fileIcon = (n) => {
    const e = n.split('.').pop().toLowerCase()
    if (['mp4','webm','avi','mov'].includes(e)) return 'video_library'
    if (e === 'pdf') return 'picture_as_pdf'
    if (['ppt','pptx'].includes(e)) return 'slideshow'
    return 'insert_drive_file'
  }
  const isVideo = (n) => ['mp4','webm','avi','mov'].includes(n.split('.').pop().toLowerCase())
  const isPdf   = (n) => n.split('.').pop().toLowerCase() === 'pdf'

  // ── Create course ──
  const handleCreate = async () => {
    if (!newCourse.title.trim()) { showToast('Title is required', 'error'); return }
    setUploading(true); setUploadProgress('Creating course…')
    try {
      const res = await apiClient.post('/api/v1/admin/courses', {
        title:         newCourse.title.trim(),
        description:   newCourse.description || '',
        level:         newCourse.level,
        category_id:   newCourse.category_id ? Number(newCourse.category_id) : null,
        thumbnail_url: newCourse.thumbnail_url || null,
        trainer_id:    newCourse.trainer_id ? Number(newCourse.trainer_id) : null,
      })
      const courseId = res.data.id

      if (contentFiles.length > 0) {
        setUploadProgress('Creating materials module…')
        const modRes = await apiClient.post(`/api/v1/trainer/courses/${courseId}/modules`, {
          title: 'Course Materials', description: 'Uploaded content files',
        })
        const moduleId = modRes.data.id
        for (let i = 0; i < contentFiles.length; i++) {
          const cf = contentFiles[i]
          setUploadProgress(`Uploading ${i + 1}/${contentFiles.length}: ${cf.name}`)
          const lessonRes = await apiClient.post(`/api/v1/trainer/modules/${moduleId}/lessons`, {
            title: cf.name.replace(/\.[^/.]+$/, ''),
            lesson_type: isVideo(cf.name) ? 'video' : 'text',
            duration_minutes: 0,
          })
          const lid = lessonRes.data.id
          const fd = new FormData(); fd.append('file', cf.file)
          const endpoint = isVideo(cf.name)
            ? `/api/v1/trainer/lessons/${lid}/upload-video`
            : `/api/v1/trainer/lessons/${lid}/upload-pdf`
          await apiClient.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        }
      }

      const fresh = await apiClient.get('/api/v1/admin/courses')
      setCourses(fresh.data || [])
      setCreateOpen(false)
      setNewCourse({ title: '', description: '', level: 'beginner', category_id: '', thumbnail_url: '', trainer_id: '' })
      setContentFiles([])
      showToast(`Course created${contentFiles.length > 0 ? ` with ${contentFiles.length} file(s)` : ''}`, 'success')
    } catch (e) {
      console.error(e)
      showToast(e.response?.data?.detail || 'Failed to create course', 'error')
    } finally { setUploading(false); setUploadProgress('') }
  }

  // ── Open detail ──
  const openCourseDetail = async (courseId) => {
    setDetailCourse({})
    setDetailLoading(true)
    setShowEnrollPanel(false)
    setShowReassignPanel(false)
    setSelectedLearners([])
    setReassignTrainerId('')
    try {
      const res = await apiClient.get(`/api/v1/admin/courses/${courseId}`)
      setDetailCourse(res.data)
    } catch { showToast('Failed to load course details', 'error'); setDetailCourse(null) }
    finally { setDetailLoading(false) }
  }

  const handlePublishToggle = async (courseId, isPublished) => {
    try {
      await apiClient.post(`/api/v1/admin/courses/${courseId}/${isPublished ? 'unpublish' : 'publish'}`)
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !isPublished } : c))
      if (detailCourse?.id === courseId) setDetailCourse(prev => ({ ...prev, is_published: !isPublished }))
      showToast(`Course ${!isPublished ? 'published' : 'unpublished'}`, 'success')
    } catch { showToast('Failed to update course', 'error') }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    try {
      await apiClient.delete(`/api/v1/admin/courses/${courseId}`)
      setCourses(prev => prev.filter(c => c.id !== courseId))
      setDetailCourse(null)
      showToast('Course deleted', 'info')
    } catch { showToast('Failed to delete course', 'error') }
  }

  // ── Enroll learners ──
  const handleEnrollLearners = async () => {
    if (!selectedLearners.length) { showToast('Select at least one learner', 'error'); return }
    setEnrolling(true)
    try {
      const res = await apiClient.post(`/api/v1/admin/courses/${detailCourse.id}/enroll`, {
        learner_ids: selectedLearners,
      })
      showToast(`Enrolled ${res.data.enrolled_count} learner(s)${res.data.skipped_count > 0 ? `, ${res.data.skipped_count} skipped (already enrolled)` : ''}`, 'success')
      setSelectedLearners([])
      setShowEnrollPanel(false)
      // refresh enrollment count
      const fresh = await apiClient.get(`/api/v1/admin/courses/${detailCourse.id}`)
      setDetailCourse(fresh.data)
    } catch (e) {
      showToast(e.response?.data?.detail || 'Enrollment failed', 'error')
    } finally { setEnrolling(false) }
  }

  // ── Reassign trainer ──
  const handleReassignTrainer = async () => {
    if (!reassignTrainerId) { showToast('Select a trainer', 'error'); return }
    setReassigning(true)
    try {
      const res = await apiClient.post(`/api/v1/admin/courses/${detailCourse.id}/reassign-trainer`, {
        trainer_id: Number(reassignTrainerId),
      })
      showToast(`Trainer changed to ${res.data.trainer_name}`, 'success')
      setShowReassignPanel(false)
      setReassignTrainerId('')
      // refresh detail
      const fresh = await apiClient.get(`/api/v1/admin/courses/${detailCourse.id}`)
      setDetailCourse(fresh.data)
      setCourses(prev => prev.map(c => c.id === detailCourse.id ? { ...c, trainer_name: res.data.trainer_name } : c))
    } catch (e) {
      showToast(e.response?.data?.detail || 'Reassign failed', 'error')
    } finally { setReassigning(false) }
  }

  // ── Filtered learners for picker ──
  const filteredLearners = learners.filter(l =>
    !learnerSearch ||
    l.full_name?.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.email?.toLowerCase().includes(learnerSearch.toLowerCase())
  )

  const toggleLearner = (id) => {
    setSelectedLearners(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Courses</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {active} published · {total} total
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Icon name="add_circle" className="text-lg" />Create Course
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}

      {/* ── Category Management ── */}
      <div className="card mb-8">
        <button
          type="button"
          onClick={() => setCatSectionOpen(o => !o)}
          className="flex items-center justify-between w-full p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Icon name="category" className="text-xl text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Management</h3>
              <p className="text-sm text-slate-500">{categories.length} categories</p>
            </div>
          </div>
          <Icon name={catSectionOpen ? 'expand_less' : 'expand_more'} className="text-2xl text-slate-400" />
        </button>

        {catSectionOpen && (
          <div className="px-5 pb-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <input className="input-field mb-2" placeholder="Category name *" value={newCatName}
                  onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCategory()} />
                <input className="input-field" placeholder="Description (optional)" value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCategory()} />
              </div>
              <button type="button" onClick={handleCreateCategory} disabled={catLoading} className="btn-primary self-end whitespace-nowrap">
                <Icon name="add" className="text-lg" />Add
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Icon name="category" className="text-4xl block mx-auto mb-2" />
                <p>No categories yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {editingCat?.id === cat.id ? (
                      <>
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input className="input-field flex-1" value={editingCat.name}
                            onChange={e => setEditingCat(c => ({ ...c, name: e.target.value }))} autoFocus />
                          <input className="input-field flex-1" value={editingCat.description || ''}
                            onChange={e => setEditingCat(c => ({ ...c, description: e.target.value }))} placeholder="Description" />
                        </div>
                        <button onClick={handleUpdateCategory} disabled={catLoading} className="p-1.5 hover:bg-green-50 rounded-lg">
                          <Icon name="check" className="text-base text-green-600" />
                        </button>
                        <button onClick={() => setEditingCat(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <Icon name="close" className="text-base text-slate-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Icon name="label" className="text-base text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</span>
                          {cat.description && <p className="text-xs text-slate-400 truncate">{cat.description}</p>}
                        </div>
                        <Badge color="slate">{cat.course_count ?? 0} courses</Badge>
                        <button onClick={() => setEditingCat({ id: cat.id, name: cat.name, description: cat.description || '' })}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <Icon name="edit" className="text-base text-slate-400 hover:text-primary" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Icon name="delete" className="text-base text-slate-400 hover:text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Courses Grid ── */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <Icon name="hourglass_empty" className="text-4xl block mx-auto mb-2" />
          <p>Loading courses…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(c => (
            <div key={c.id} className="card p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Icon name="school" className="text-2xl text-primary" />
                </div>
                <Badge color={c.is_published ? 'green' : 'slate'}>{c.is_published ? 'Published' : 'Draft'}</Badge>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{c.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                {(c.category || c.category_name) && (
                  <><span className="w-1 h-1 rounded-full bg-slate-300" />{c.category || c.category_name}</>
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
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min(100, (c.total_modules || 1) * 20)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="person" className="text-base text-slate-400" />
                  {c.trainer_name || `Trainer #${c.trainer_id}`}
                </span>
                <button onClick={() => openCourseDetail(c.id)} className="text-xs text-primary font-semibold hover:underline">
                  Manage →
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Icon name="school" className="text-4xl block mx-auto mb-2" />
              <p>No courses yet. Create the first one above.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── Create Course Modal ──
      ══════════════════════════════════════════════════════════ */}
      <Modal open={createOpen} onClose={() => !uploading && setCreateOpen(false)} title="Create New Course">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Title</label>
            <input className="input-field" value={newCourse.title}
              onChange={e => setNewCourse(c => ({ ...c, title: e.target.value }))}
              placeholder="e.g. Python Fundamentals" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Description</label>
            <textarea className="input-field" rows={3} value={newCourse.description}
              onChange={e => setNewCourse(c => ({ ...c, description: e.target.value }))}
              placeholder="Short summary of the course" />
          </div>

          {/* ✅ Assign Trainer */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Assign Trainer <span className="text-red-400">*</span>
            </label>
            <select className="input-field" value={newCourse.trainer_id}
              onChange={e => setNewCourse(c => ({ ...c, trainer_id: e.target.value }))}>
              <option value="">— Select a trainer —</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
              ))}
            </select>
            {trainers.length === 0 && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <Icon name="warning" className="text-sm" />
                No trainers found. Create a trainer user first in User Management.
              </p>
            )}
          </div>

          {/* Level + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Level</label>
              <select className="input-field" value={newCourse.level}
                onChange={e => setNewCourse(c => ({ ...c, level: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Category</label>
              <select className="input-field" value={newCourse.category_id}
                onChange={e => setNewCourse(c => ({ ...c, category_id: e.target.value }))}>
                <option value="">Uncategorized</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Thumbnail URL (optional)</label>
            <input className="input-field" value={newCourse.thumbnail_url}
              onChange={e => setNewCourse(c => ({ ...c, thumbnail_url: e.target.value }))}
              placeholder="https://images.unsplash.com/..." />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Course Content Files
              <span className="ml-2 text-xs font-normal text-slate-400">(optional — added as first module)</span>
            </label>
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Icon name="cloud_upload" className="text-3xl text-slate-300 block mx-auto mb-1" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload files</p>
              <p className="text-xs text-slate-400 mt-1">Video (MP4, WebM, AVI), PDF, PowerPoint (PPT, PPTX)</p>
            </div>
            <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTS} multiple className="hidden" onChange={handleContentFilesChange} />
            {contentFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {contentFiles.map((cf, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Icon name={fileIcon(cf.name)} className="text-lg text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{cf.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(cf.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeContentFile(idx)} disabled={uploading}
                      className="p-1 hover:bg-red-50 rounded-lg">
                      <Icon name="close" className="text-base text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && uploadProgress && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <Icon name="hourglass_empty" className="text-base animate-spin" />
                {uploadProgress}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setCreateOpen(false)} disabled={uploading} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="button" onClick={handleCreate} disabled={uploading || !newCourse.title.trim()} className="btn-primary flex-1 justify-center">
              {uploading
                ? <><Icon name="hourglass_empty" className="text-lg animate-spin" />Working…</>
                : <><Icon name="add_circle" className="text-lg" />Create</>
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          ── Course Detail Modal ──
      ══════════════════════════════════════════════════════════ */}
      <Modal open={!!detailCourse} onClose={() => { setDetailCourse(null); setShowEnrollPanel(false); setShowReassignPanel(false) }}
        title="Course Details" size="lg">
        {detailLoading ? (
          <div className="text-center py-8 text-slate-400">
            <Icon name="hourglass_empty" className="text-3xl block mx-auto mb-2 animate-spin" />
            <p>Loading…</p>
          </div>
        ) : detailCourse?.id ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              {detailCourse.thumbnail_url && (
                <img
                  src={detailCourse.thumbnail_url.startsWith('http') ? detailCourse.thumbnail_url : `${API_BASE}${detailCourse.thumbnail_url}`}
                  alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-slate-100"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{detailCourse.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{detailCourse.description || 'No description'}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge color={detailCourse.is_published ? 'green' : 'slate'}>
                    {detailCourse.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge color="blue">{detailCourse.level}</Badge>
                  {detailCourse.category && <Badge color="purple">{detailCourse.category}</Badge>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Modules', detailCourse.total_modules ?? 0],
                ['Lessons', detailCourse.total_lessons ?? 0],
                ['Enrollments', detailCourse.enrollment_count ?? 0],
                ['Trainer', detailCourse.trainer_name || 'Unknown'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{k}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1 truncate">{v}</p>
                </div>
              ))}
            </div>

            {/* Modules */}
            {detailCourse.modules?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Modules & Lessons</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailCourse.modules.map(m => (
                    <div key={m.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.title}</p>
                      {m.lessons?.length > 0 && (
                        <div className="mt-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                          {m.lessons.map(l => (
                            <p key={l.id} className="text-xs text-slate-500 py-0.5">
                              <Icon name={l.type === 'video' ? 'play_circle' : 'description'} className="text-xs mr-1 align-middle" />
                              {l.title}{l.duration ? ` · ${l.duration} min` : ''}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action Buttons Row ── */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handlePublishToggle(detailCourse.id, detailCourse.is_published)}
                className={detailCourse.is_published ? 'btn-secondary' : 'btn-primary'}
              >
                <Icon name={detailCourse.is_published ? 'unpublished' : 'publish'} className="text-lg" />
                {detailCourse.is_published ? 'Unpublish' : 'Publish'}
              </button>

              {/* ✅ Enroll Learners button */}
              <button
                onClick={() => { setShowEnrollPanel(p => !p); setShowReassignPanel(false); if (!learners.length) loadLearners() }}
                className="btn-secondary"
              >
                <Icon name="person_add" className="text-lg" />Enroll Learners
              </button>

              {/* ✅ Reassign Trainer button */}
              <button
                onClick={() => { setShowReassignPanel(p => !p); setShowEnrollPanel(false) }}
                className="btn-secondary"
              >
                <Icon name="swap_horiz" className="text-lg" />Reassign Trainer
              </button>

              <button onClick={() => handleDeleteCourse(detailCourse.id)} className="btn-danger ml-auto">
                <Icon name="delete" className="text-lg" />Delete
              </button>
            </div>

            {/* ── Enroll Learners Panel ── */}
            {showEnrollPanel && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon name="person_add" className="text-base text-primary" />
                    Enroll Learners
                  </h4>
                  {selectedLearners.length > 0 && (
                    <Badge color="blue">{selectedLearners.length} selected</Badge>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    className="input-field pl-9"
                    placeholder="Search learners by name or email…"
                    value={learnerSearch}
                    onChange={e => { setLearnerSearch(e.target.value); loadLearners(e.target.value) }}
                  />
                </div>

                {/* Learner list */}
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-900">
                  {filteredLearners.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      {learnerSearch ? 'No learners match your search' : 'No learners found'}
                    </div>
                  ) : (
                    filteredLearners.map(l => {
                      const checked = selectedLearners.includes(l.id)
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => toggleLearner(l.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            checked ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                            checked ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {checked && <Icon name="check" className="text-white text-xs" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{l.full_name}</p>
                            <p className="text-xs text-slate-400 truncate">{l.email}</p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Select All / Clear */}
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={() => setSelectedLearners(filteredLearners.map(l => l.id))}
                    className="text-primary hover:underline font-semibold">Select all</button>
                  <span className="text-slate-300">·</span>
                  <button type="button" onClick={() => setSelectedLearners([])}
                    className="text-slate-400 hover:underline">Clear</button>
                </div>

                <button
                  type="button"
                  onClick={handleEnrollLearners}
                  disabled={enrolling || selectedLearners.length === 0}
                  className="btn-primary w-full justify-center"
                >
                  {enrolling
                    ? <><Icon name="hourglass_empty" className="text-lg animate-spin" />Enrolling…</>
                    : <><Icon name="how_to_reg" className="text-lg" />Enroll {selectedLearners.length || ''} Learner{selectedLearners.length !== 1 ? 's' : ''}</>
                  }
                </button>
              </div>
            )}

            {/* ── Reassign Trainer Panel ── */}
            {showReassignPanel && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon name="swap_horiz" className="text-base text-primary" />
                  Reassign Trainer
                </h4>
                <p className="text-xs text-slate-500">
                  Current: <span className="font-semibold text-slate-700 dark:text-slate-300">{detailCourse.trainer_name || 'Unknown'}</span>
                </p>
                <select
                  className="input-field"
                  value={reassignTrainerId}
                  onChange={e => setReassignTrainerId(e.target.value)}
                >
                  <option value="">— Select new trainer —</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleReassignTrainer}
                  disabled={reassigning || !reassignTrainerId}
                  className="btn-primary w-full justify-center"
                >
                  {reassigning
                    ? <><Icon name="hourglass_empty" className="text-lg animate-spin" />Saving…</>
                    : <><Icon name="swap_horiz" className="text-lg" />Confirm Reassign</>
                  }
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}