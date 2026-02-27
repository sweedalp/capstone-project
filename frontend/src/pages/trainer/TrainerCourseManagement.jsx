import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";
import apiClient from "../../services/api";

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

// ── Chapter Menu ──────────────────────────────────────────────────
function ChapterMenu({ onRename, onDelete, onAddLesson }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
        className="size-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-500 transition-all">
        <Icon name="more_horiz" className="text-[20px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1">
          {[
            { icon: "edit",   label: "Rename Chapter", fn: onRename },
            { icon: "add",    label: "Add Lesson",     fn: onAddLesson },
            { icon: "delete", label: "Delete Chapter", fn: onDelete, danger: true },
          ].map(({ icon, label, fn, danger }) => (
            <button key={label} onClick={() => { setOpen(false); fn?.(); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-slate-50 ${danger ? "text-rose-600" : "text-slate-700"}`}>
              <Icon name={icon} className={`text-base ${danger ? "text-rose-400" : "text-slate-400"}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Simple Modal ──────────────────────────────────────────────────
function Modal({ title, placeholder, onConfirm, onClose }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <input autoFocus value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && value.trim()) { onConfirm(value.trim()); onClose(); } }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            placeholder={placeholder} />
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
          <button onClick={() => { if (value.trim()) { onConfirm(value.trim()); onClose(); } }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Row ────────────────────────────────────────────────────
function LessonRow({ lesson, onDelete }) {
  return (
    <div className="p-4 pl-12 flex items-center justify-between gap-4 group hover:bg-slate-50/50 border-t border-slate-100 first:border-t-0">
      <div>
        <h4 className="font-semibold text-slate-900 text-sm">{lesson.title}</h4>
        <p className="text-xs text-slate-400 capitalize mt-1">
          {lesson.lesson_type}{lesson.duration_minutes ? ` • ${lesson.duration_minutes}m` : ''}
        </p>
      </div>
      <button onClick={onDelete}
        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
        <Icon name="delete" className="text-[20px]" />
      </button>
    </div>
  );
}

// ── Chapter Block ─────────────────────────────────────────────────
function ChapterBlock({ chapter, onToggle, onDeleteChapter, onRenameChapter, onDeleteLesson, onAddLesson }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className={`flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50 ${chapter.expanded ? 'bg-slate-50 border-b border-slate-100' : ''}`}
        onClick={onToggle}>
        <div className="flex items-center gap-3">
          <Icon
            name={chapter.expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}
            className={chapter.expanded ? "text-blue-600" : "text-slate-400"} />
          <h3 className="font-bold text-slate-900">{chapter.title}</h3>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-400 mr-1">{(chapter.lessons || []).length} Lessons</span>
          <ChapterMenu
            onRename={() => onRenameChapter(chapter.id)}
            onDelete={() => onDeleteChapter(chapter.id)}
            onAddLesson={() => onAddLesson(chapter.id)} />
        </div>
      </div>
      {chapter.expanded && (
        <>
          <div>
            {(chapter.lessons || []).map(lesson => (
              <LessonRow key={lesson.id} lesson={lesson}
                onDelete={() => onDeleteLesson(chapter.id, lesson.id)} />
            ))}
            {(chapter.lessons || []).length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">No lessons yet</div>
            )}
          </div>
          <div className="p-3 flex justify-center border-t border-slate-100">
            <button onClick={() => onAddLesson(chapter.id)}
              className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Icon name="add_circle" className="text-[16px]" />Add Lesson
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────
function SettingsPanel({ course, onClose, onSave }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    level: course?.level || 'beginner',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Edit Course Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Course Title</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
            <textarea rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Level</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              {['beginner', 'intermediate', 'advanced'].map(l => (
                <option key={l} value={l} className="capitalize">{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Lesson Modal ──────────────────────────────────────────────
function AddLessonModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', lesson_type: 'video', duration_minutes: 0, content: '', content_type: 'video_url',
  });
  const [adding, setAdding] = useState(false);

  const contentTypeMap = { video: 'video_url', text: 'text_body', quiz: 'quiz_json' };

  const handleAdd = async () => {
    if (!form.title.trim()) return alert('Title required');
    setAdding(true);
    try {
      await onAdd(form);
      onClose();
    } catch {
      alert('Failed to add lesson');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Add New Lesson</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Lesson Title *</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              placeholder="e.g. Introduction to Variables"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={form.lesson_type}
              onChange={e => setForm({ ...form, lesson_type: e.target.value, content_type: contentTypeMap[e.target.value] || 'video_url' })}>
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Duration (minutes)</label>
            <input type="number"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={form.duration_minutes}
              onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} />
          </div>
          {form.lesson_type === 'video' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Video URL (YouTube, Drive etc)</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                placeholder="https://youtube.com/watch?v=..."
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
          )}
          {form.lesson_type === 'text' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Text Content</label>
              <textarea rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                placeholder="Enter lesson text content..."
                // ✅ Fixed: was binding to wrong field (videoUrl)
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value, content_type: 'text_body' })} />
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
          <button onClick={handleAdd} disabled={adding}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
            {adding ? 'Adding...' : 'Add Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function TrainerCourseManagement() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const userName = localStorage.getItem('userName') || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [activeTab, setActiveTab] = useState("Content");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [addLessonTarget, setAddLessonTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);

  // ── Fetch course + modules ──────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      // ✅ Fixed: use /api/v1/courses/{id} to fetch the course detail
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/trainer/courses/${courseId}/modules`),
      apiClient.get('/api/v1/trainer/students'),
    ]).then(([courseRes, modulesRes, studentsRes]) => {
      setCourse(courseRes.data);
      const mods = (modulesRes.data || []).map((m, i) => ({ ...m, expanded: i === 0 }));
      setModules(mods);
      setStudents(studentsRes.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [courseId]);

  // ── Chapter actions ─────────────────────────────────────────────
  const toggleChapter = (id) =>
    setModules(ms => ms.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));

  const addChapter = async (title) => {
    try {
      const res = await apiClient.post(`/api/v1/trainer/courses/${courseId}/modules`, { title });
      setModules(ms => [...ms, { ...res.data, lessons: [], expanded: true }]);
    } catch { alert('Failed to add chapter'); }
  };

  const deleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) return;
    try {
      // ✅ Correct endpoint: DELETE /api/v1/trainer/modules/{id}
      await apiClient.delete(`/api/v1/trainer/modules/${id}`);
      setModules(ms => ms.filter(m => m.id !== id));
    } catch { alert('Failed to delete chapter'); }
  };

  const renameChapter = (id, newTitle) => {
    // Local update only — no rename endpoint on backend
    setModules(ms => ms.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  // ── Lesson actions ──────────────────────────────────────────────
  const addLesson = async (moduleId, form) => {
    // ✅ Correct endpoint: POST /api/v1/trainer/modules/{id}/lessons
    const res = await apiClient.post(`/api/v1/trainer/modules/${moduleId}/lessons`, form);
    setModules(ms => ms.map(m =>
      m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), res.data] } : m
    ));
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      // ✅ Correct endpoint: DELETE /api/v1/trainer/lessons/{id}
      await apiClient.delete(`/api/v1/trainer/lessons/${lessonId}`);
      setModules(ms => ms.map(m =>
        m.id === moduleId
          ? { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) }
          : m
      ));
    } catch { alert('Failed to delete lesson'); }
  };

  // ── Save course settings ────────────────────────────────────────
  const handleSaveCourse = async (form) => {
    // ✅ Correct endpoint: PUT /api/v1/trainer/courses/{id}
    await apiClient.put(`/api/v1/trainer/courses/${courseId}`, form);
    setCourse(c => ({ ...c, ...form }));
  };

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons || []).length, 0);

  const tabs = [
    { icon: "menu_book",    label: "Content" },
    { icon: "group",        label: "Students" },
    { icon: "analytics",    label: "Analytics" },
    { icon: "auto_awesome", label: "AI Hub" },
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      {showSettings && (
        <SettingsPanel course={course} onClose={() => setShowSettings(false)} onSave={handleSaveCourse} />
      )}
      {showAddChapterModal && (
        <Modal title="Add New Chapter" placeholder="e.g. Chapter 4: Functions"
          onConfirm={addChapter} onClose={() => setShowAddChapterModal(false)} />
      )}
      {renameTarget !== null && (
        <Modal title="Rename Chapter" placeholder="New chapter title..."
          onConfirm={(title) => renameChapter(renameTarget, title)}
          onClose={() => setRenameTarget(null)} />
      )}
      {addLessonTarget !== null && (
        <AddLessonModal
          onClose={() => setAddLessonTarget(null)}
          onAdd={(form) => addLesson(addLessonTarget, form)} />
      )}

      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* ✅ Pass courseId so sidebar highlights correct nav item */}
        <TrainerSidebar courseId={courseId} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <Icon name="school" className="text-blue-600" />
                </div>
                <h2 className="text-slate-900 text-lg font-bold">Course Management</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="rounded-lg border-none bg-slate-100 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-56"
                    placeholder="Search..." />
                </div>
                <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 py-6">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                {/* ✅ Fixed: was navigating to /dashboard/trainer, use /trainer/dashboard */}
                <button onClick={() => navigate('/trainer/dashboard')} className="hover:text-blue-600">Dashboard</button>
                <Icon name="chevron_right" className="text-xs" />
                <span className="text-slate-900 font-medium">{course?.title || 'Course'}</span>
              </nav>

              {/* Heading */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-black text-slate-900">{course?.title || 'Course'}</h1>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {course?.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-slate-400">Manage your curriculum and learning materials.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowSettings(true)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
                    <Icon name="edit" className="text-[18px]" />Edit Details
                  </button>
                  <button onClick={() => navigate(`/trainer/courses/${courseId}/upload`)}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                    <Icon name="add" className="text-[18px]" />Add Content
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-8">
                  {tabs.map(({ icon, label }) => (
                    <button key={label} onClick={() => setActiveTab(label)}
                      className={`pb-3 border-b-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === label ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-blue-600'}`}>
                      <Icon name={icon} className="text-[20px]" />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === "Content" && (
                <div className="space-y-4">
                  {modules.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                      <Icon name="layers" className="text-5xl text-slate-200 mb-3 block" />
                      <p className="text-slate-500 font-medium mb-4">No chapters yet</p>
                      <button onClick={() => setShowAddChapterModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm">
                        Add First Chapter
                      </button>
                    </div>
                  ) : (
                    modules
                      .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(module => (
                        <ChapterBlock key={module.id} chapter={module}
                          onToggle={() => toggleChapter(module.id)}
                          onDeleteChapter={deleteChapter}
                          onRenameChapter={(id) => setRenameTarget(id)}
                          onDeleteLesson={deleteLesson}
                          onAddLesson={(id) => setAddLessonTarget(id)} />
                      ))
                  )}
                  <button onClick={() => setShowAddChapterModal(true)}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/5 transition-all group">
                    <Icon name="add_circle" className="text-3xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Add New Chapter</span>
                  </button>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === "Students" && (
                <div className="space-y-3">
                  {students.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                      <Icon name="group" className="text-5xl text-slate-200 mb-3 block" />
                      <p className="text-slate-500">No students enrolled yet</p>
                    </div>
                  ) : students.map((s, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                          <Icon name="person" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{s.user_name}</p>
                          <p className="text-xs text-slate-400">{s.user_email} • {s.enrolled_courses} course(s)</p>
                        </div>
                      </div>
                      {/* ✅ Fixed: navigate to course-specific analytics */}
                      <button onClick={() => navigate(`/trainer/courses/${courseId}/analytics`)}
                        className="text-xs text-blue-600 font-semibold hover:underline">View →</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "Analytics" && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Icon name="analytics" className="text-5xl text-slate-200 mb-3 block" />
                  <p className="font-bold text-slate-900 text-lg mb-2">Course Analytics</p>
                  <button onClick={() => navigate(`/trainer/courses/${courseId}/analytics`)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm">
                    View Full Analytics →
                  </button>
                </div>
              )}

              {/* AI Hub Tab */}
              {activeTab === "AI Hub" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "auto_awesome", label: "Quick Summary",  desc: "Generate AI summary",  tool: "summary" },
                    { icon: "quiz",         label: "Quiz Generator", desc: "Auto-create quizzes", tool: "quiz" },
                    { icon: "headphones",   label: "Audio Summary",  desc: "Convert to audio",    tool: "audio" },
                  ].map(a => (
                    <button key={a.label}
                      onClick={() => navigate(`/trainer/ai-studio?course=${courseId}&tool=${a.tool}`)}
                      className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-600 hover:shadow-sm transition-all group">
                      <div className="size-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-3">
                        <Icon name={a.icon} className="text-blue-600 text-xl" />
                      </div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600">{a.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{a.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "description", label: "Total Lessons",   value: totalLessons,      color: "blue" },
                  { icon: "layers",      label: "Total Chapters",  value: modules.length,    color: "green" },
                  { icon: "group",       label: "Enrolled Students", value: students.length, color: "purple" },
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className={`size-12 rounded-lg bg-${s.color}-100 flex items-center justify-center text-${s.color}-600`}>
                      <Icon name={s.icon} className="text-[28px]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">{s.label}</p>
                      <p className="text-xl font-black text-slate-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}