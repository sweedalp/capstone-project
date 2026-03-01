import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";
import apiClient from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

// ── Lesson Content Player ─────────────────────────────────────────
function LessonContentPlayer({ lesson }) {
  const [show, setShow] = useState(false);

  const videoUrl = lesson.video_url
    ? (lesson.video_url.startsWith("http") ? lesson.video_url : `${API_BASE}${lesson.video_url}`)
    : null;
  const pdfUrl = lesson.pdf_url
    ? (lesson.pdf_url.startsWith("http") ? lesson.pdf_url : `${API_BASE}${lesson.pdf_url}`)
    : null;
  const textBody   = lesson.text_body || null;
  const hasContent = videoUrl || pdfUrl || textBody;

  if (!hasContent) return (
    <div className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
      <Icon name="info" className="text-sm text-amber-500" />
      No content uploaded yet. Use "Add Lesson" to upload a video or PDF.
    </div>
  );

  return (
    <div className="mx-4 mb-3">
      <button onClick={() => setShow(p => !p)}
        className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2">
        <Icon name={show ? "expand_less" : "play_circle"} className="text-base" />
        {show ? "Hide Preview" : "Preview Content"}
      </button>
      {show && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
          {videoUrl && (
            <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
              <video src={videoUrl} controls controlsList="nodownload"
                className="w-full h-full" style={{ aspectRatio: "16/9" }}
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}>
                Your browser does not support the video tag.
              </video>
              <div className="hidden absolute inset-0 flex-col items-center justify-center bg-slate-800 text-white gap-3">
                <Icon name="broken_image" className="text-4xl text-slate-400" />
                <p className="text-sm text-slate-300">Video failed to load</p>
                <a href={videoUrl} target="_blank" rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  Open Directly ↗
                </a>
              </div>
            </div>
          )}
          {!videoUrl && pdfUrl && (
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Icon name="picture_as_pdf" className="text-red-500 text-xl" />
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{lesson.title}</span>
                </div>
                <a href={pdfUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  <Icon name="open_in_new" className="text-sm" />Open PDF
                </a>
              </div>
              <iframe src={`${pdfUrl}#toolbar=0`} className="w-full" style={{ height: "480px" }} title={lesson.title} />
            </div>
          )}
          {!videoUrl && !pdfUrl && textBody && (
            <div className="bg-white p-5 prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap rounded-xl">
              {textBody}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Upload Progress Bar ───────────────────────────────────────────
function UploadProgressBar({ progress, fileName }) {
  return (
    <div className="mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-blue-700 truncate max-w-[200px]">{fileName}</span>
        <span className="text-xs font-bold text-blue-700">{progress}%</span>
      </div>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-blue-500 mt-1">Uploading… please wait</p>
    </div>
  );
}

// ── Lesson Row ─────────────────────────────────────────────────────
function LessonRow({ lesson, onDelete, onUploadVideo, onUploadPdf }) {
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploadFileName,  setUploadFileName]  = useState("");
  const [localLesson,     setLocalLesson]     = useState(lesson);
  const videoRef = useRef(null);
  const pdfRef   = useRef(null);

  useEffect(() => setLocalLesson(lesson), [lesson]);

  const typeIcon  = { video: "play_circle", text: "description", quiz: "quiz" }[localLesson.lesson_type] || "article";
  const typeColor = { video: "text-blue-600", text: "text-green-600", quiz: "text-purple-600" }[localLesson.lesson_type] || "text-slate-400";

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploading(true); setUploadFileName(file.name); setUploadProgress(10);
    try {
      const fd = new FormData(); fd.append("file", file);
      const interval = setInterval(() => setUploadProgress(p => p < 85 ? p + 10 : p), 400);
      const res = await apiClient.post(`/api/v1/trainer/lessons/${localLesson.id}/upload-video`, fd,
        { headers: { "Content-Type": "multipart/form-data" } });
      clearInterval(interval); setUploadProgress(100);
      setTimeout(() => {
        setUploading(false); setUploadProgress(0);
        setLocalLesson(l => ({ ...l, video_url: res.data.video_url }));
        onUploadVideo?.(localLesson.id, res.data.video_url);
      }, 500);
    } catch (e) { setUploading(false); setUploadProgress(0); alert(e.response?.data?.detail || "Video upload failed"); }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    setUploading(true); setUploadFileName(file.name); setUploadProgress(20);
    try {
      const fd = new FormData(); fd.append("file", file);
      const interval = setInterval(() => setUploadProgress(p => p < 85 ? p + 15 : p), 300);
      const res = await apiClient.post(`/api/v1/trainer/lessons/${localLesson.id}/upload-pdf`, fd,
        { headers: { "Content-Type": "multipart/form-data" } });
      clearInterval(interval); setUploadProgress(100);
      setTimeout(() => {
        setUploading(false); setUploadProgress(0);
        setLocalLesson(l => ({ ...l, pdf_url: res.data.pdf_url }));
        onUploadPdf?.(localLesson.id, res.data.pdf_url);
      }, 500);
    } catch (e) { setUploading(false); setUploadProgress(0); alert(e.response?.data?.detail || "PDF upload failed"); }
  };

  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <div className="p-4 pl-12 flex items-center justify-between gap-4 group hover:bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <Icon name={typeIcon} className={`text-xl ${typeColor} flex-shrink-0`} />
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm truncate">{localLesson.title}</h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-400 capitalize">{localLesson.lesson_type}</span>
              {localLesson.duration_minutes > 0 && <span className="text-xs text-slate-400">· {localLesson.duration_minutes}m</span>}
              {localLesson.video_url && (
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <Icon name="check_circle" className="text-xs" />Video
                </span>
              )}
              {localLesson.pdf_url && (
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <Icon name="check_circle" className="text-xs" />PDF
                </span>
              )}
              {localLesson.text_body && (
                <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <Icon name="check_circle" className="text-xs" />Text
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {localLesson.lesson_type !== "quiz" && (
            <>
              <button onClick={() => videoRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 disabled:opacity-50">
                <Icon name="videocam" className="text-sm" />
                {localLesson.video_url ? "Replace Video" : "Upload Video"}
              </button>
              <input ref={videoRef} type="file" accept=".mp4,.webm,.avi,.mov" className="hidden"
                onChange={e => { if (e.target.files[0]) handleVideoUpload(e.target.files[0]); e.target.value = ""; }} />
              <button onClick={() => pdfRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50">
                <Icon name="picture_as_pdf" className="text-sm" />
                {localLesson.pdf_url ? "Replace PDF" : "Upload PDF"}
              </button>
              <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { if (e.target.files[0]) handlePdfUpload(e.target.files[0]); e.target.value = ""; }} />
            </>
          )}
          <button onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all">
            <Icon name="delete" className="text-[20px]" />
          </button>
        </div>
      </div>
      {uploading && <UploadProgressBar progress={uploadProgress} fileName={uploadFileName} />}
      {!uploading && <LessonContentPlayer lesson={localLesson} />}
    </div>
  );
}

// ── Chapter Block ─────────────────────────────────────────────────
function ChapterBlock({ chapter, onToggle, onDeleteChapter, onRenameChapter,
                        onDeleteLesson, onAddLesson, onLessonVideoUploaded, onLessonPdfUploaded }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50 ${chapter.expanded ? "bg-slate-50 border-b border-slate-100" : ""}`}
        onClick={onToggle}>
        <div className="flex items-center gap-3">
          <Icon name={chapter.expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}
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
                onDelete={() => onDeleteLesson(chapter.id, lesson.id)}
                onUploadVideo={(lessonId, url) => onLessonVideoUploaded?.(chapter.id, lessonId, url)}
                onUploadPdf={(lessonId, url) => onLessonPdfUploaded?.(chapter.id, lessonId, url)} />
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
    try { await onSave(form); onClose(); }
    catch { alert('Failed to save'); }
    finally { setSaving(false); }
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
  const [contentFile, setContentFile] = useState(null);
  const fileRef = useRef(null);
  const contentTypeMap = { video: 'video_url', text: 'text_body', quiz: 'quiz_json' };

  const handleAdd = async () => {
    if (!form.title.trim()) return alert('Title required');
    setAdding(true);
    try { await onAdd({ ...form, uploadFile: contentFile || null }); onClose(); }
    catch { alert('Failed to add lesson'); }
    finally { setAdding(false); }
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
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              placeholder="e.g. Introduction to Variables"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              value={form.lesson_type}
              onChange={e => { setForm({ ...form, lesson_type: e.target.value, content_type: contentTypeMap[e.target.value] || 'video_url' }); setContentFile(null); }}>
              <option value="video">Video</option>
              <option value="text">Text / PDF</option>
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
          {(form.lesson_type === 'video' || form.lesson_type === 'text') && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  {form.lesson_type === 'video' ? 'Video URL (YouTube, Drive etc)' : 'Text Content'}
                </label>
                {form.lesson_type === 'video' ? (
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                ) : (
                  <textarea rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                    placeholder="Enter lesson text content..."
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value, content_type: 'text_body' })} />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Or Upload File</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <Icon name="cloud_upload" className="text-2xl text-slate-300 block mx-auto" />
                  <p className="text-xs text-slate-500 mt-1">
                    {contentFile ? contentFile.name : (form.lesson_type === 'video' ? 'Upload Video (MP4, WebM, AVI)' : 'Upload PDF / PPT')}
                  </p>
                </div>
                <input ref={fileRef} type="file"
                  accept={form.lesson_type === 'video' ? '.mp4,.webm,.avi,.mov' : '.pdf,.ppt,.pptx'}
                  className="hidden"
                  onChange={e => { if (e.target.files[0]) setContentFile(e.target.files[0]); }} />
                {contentFile && (
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-slate-500">{(contentFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <button type="button" onClick={() => setContentFile(null)} className="text-red-500 hover:underline">Remove</button>
                  </div>
                )}
              </div>
            </>
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
  const navigate  = useNavigate();
  const { courseId } = useParams();
  const userName  = localStorage.getItem('userName')  || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [activeTab, setActiveTab] = useState("Content");
  const [course,   setCourse]   = useState(null);
  const [modules,  setModules]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showSettings,        setShowSettings]        = useState(false);
  const [showAddChapterModal,  setShowAddChapterModal]  = useState(false);
  const [addLessonTarget,     setAddLessonTarget]     = useState(null);
  const [renameTarget,        setRenameTarget]        = useState(null);

  // Messaging state
  const [showCourseMsg,     setShowCourseMsg]     = useState(false);
  const [courseMsgForm,     setCourseMsgForm]     = useState({ subject: '', body: '' });
  const [courseMsgSending,  setCourseMsgSending]  = useState(false);

  // ── Schedule Meeting state ────────────────────────────────────
  const [showCourseMeeting,  setShowCourseMeeting]  = useState(false);
  const [courseMeetForm,     setCourseMeetForm]     = useState({
    title: '', meeting_url: '', scheduled_at: '', duration_minutes: 30,
  });
  const [courseMeetCreating, setCourseMeetCreating] = useState(false);

  // DM state
  const [showDmModal, setShowDmModal] = useState(null);
  const [dmMsg,       setDmMsg]       = useState('');
  const [dmSending,   setDmSending]   = useState(false);

  // Course list state
  const [courses,          setCourses]          = useState([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse,        setNewCourse]        = useState({ title: '', description: '', level: 'beginner' });
  const [creating,         setCreating]         = useState(false);

  // ── Load course list ──────────────────────────────────────────
  useEffect(() => {
    if (courseId) return;
    setLoading(true);
    apiClient.get('/api/v1/trainer/courses')
      .then(res => { setCourses(res.data || []); setLoading(false); })
      .catch(() => { setCourses([]); setLoading(false); });
  }, [courseId]);

  // ── Load course detail ────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      apiClient.get(`/api/v1/courses/${courseId}`),
      apiClient.get(`/api/v1/trainer/courses/${courseId}/modules`),
      apiClient.get(`/api/v1/trainer/courses/${courseId}/students`),
    ]).then(([courseRes, modulesRes, studentsRes]) => {
      setCourse(courseRes.data);
      setModules((modulesRes.data || []).map((m, i) => ({ ...m, expanded: i === 0 })));
      setStudents(studentsRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [courseId]);

  // ── Course actions ────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) return;
    setCreating(true);
    try {
      const res = await apiClient.post('/api/v1/trainer/courses', newCourse);
      setCourses(prev => [...prev, res.data]);
      setShowCreateCourse(false);
      setNewCourse({ title: '', description: '', level: 'beginner' });
      navigate(`/trainer/courses/${res.data.id}`);
    } catch (err) { alert(err.response?.data?.detail || 'Failed to create course'); }
    finally { setCreating(false); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course and all its content?')) return;
    try { await apiClient.delete(`/api/v1/trainer/courses/${id}`); setCourses(prev => prev.filter(c => c.id !== id)); }
    catch { alert('Failed to delete course'); }
  };

  const handleTogglePublish = async (c) => {
    try {
      if (c.is_published) await apiClient.patch(`/api/v1/trainer/courses/${c.id}/unpublish`);
      else                 await apiClient.patch(`/api/v1/trainer/courses/${c.id}/publish`);
      setCourses(prev => prev.map(x => x.id === c.id ? { ...x, is_published: !x.is_published } : x));
    } catch { alert('Failed to update publish status'); }
  };

  const handleSaveCourse = async (form) => {
    await apiClient.put(`/api/v1/trainer/courses/${courseId}`, form);
    setCourse(c => ({ ...c, ...form }));
  };

  // ── Messaging ─────────────────────────────────────────────────
  const handleSendCourseMessage = async () => {
    if (!courseMsgForm.body.trim()) return;
    setCourseMsgSending(true);
    try {
      const res = await apiClient.post(`/api/v1/trainer/courses/${courseId}/message`, null, {
        params: { subject: courseMsgForm.subject, body: courseMsgForm.body }
      });
      alert(res.data.message || 'Message sent!');
      setShowCourseMsg(false);
      setCourseMsgForm({ subject: '', body: '' });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to send'); }
    finally { setCourseMsgSending(false); }
  };

  // ── Schedule Meeting ──────────────────────────────────────────
  const handleCreateCourseMeeting = async () => {
    if (!courseMeetForm.scheduled_at) return alert('Date & time is required');
    setCourseMeetCreating(true);
    try {
      await apiClient.post(`/api/v1/trainer/courses/${courseId}/meeting`, null, {
        params: { ...courseMeetForm }
      });
      alert('Meeting scheduled successfully!');
      setShowCourseMeeting(false);
      setCourseMeetForm({ title: '', meeting_url: '', scheduled_at: '', duration_minutes: 30 });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to create meeting'); }
    finally { setCourseMeetCreating(false); }
  };

  // ── DM ────────────────────────────────────────────────────────
  const handleSendDm = async () => {
    if (!dmMsg.trim() || !showDmModal) return;
    setDmSending(true);
    try {
      await apiClient.post('/api/v1/messaging', {
        recipient_id: showDmModal.user_id,
        subject: `[${course?.title}] Message from trainer`,
        body: dmMsg,
      });
      alert('Message sent!');
      setShowDmModal(null); setDmMsg('');
    } catch { alert('Failed to send message'); }
    finally { setDmSending(false); }
  };

  // ── Chapter actions ───────────────────────────────────────────
  const toggleChapter  = (id) => setModules(ms => ms.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));

  const addChapter = async (title) => {
    try {
      const res = await apiClient.post(`/api/v1/trainer/courses/${courseId}/modules`, { title });
      setModules(ms => [...ms, { ...res.data, lessons: [], expanded: true }]);
    } catch { alert('Failed to add chapter'); }
  };

  const deleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) return;
    try { await apiClient.delete(`/api/v1/trainer/modules/${id}`); setModules(ms => ms.filter(m => m.id !== id)); }
    catch { alert('Failed to delete chapter'); }
  };

  const renameChapter = (id, newTitle) =>
    setModules(ms => ms.map(m => m.id === id ? { ...m, title: newTitle } : m));

  // ── Lesson actions ────────────────────────────────────────────
  const addLesson = async (moduleId, form) => {
    const { uploadFile, ...lessonData } = form;
    const res = await apiClient.post(`/api/v1/trainer/modules/${moduleId}/lessons`, lessonData);
    const lessonId  = res.data.id || res.data.lesson_id;
    const newLesson = { ...res.data, video_url: null, pdf_url: null, text_body: null };

    if (uploadFile && lessonId) {
      const fd = new FormData(); fd.append('file', uploadFile);
      const endpoint = form.lesson_type === 'video'
        ? `/api/v1/trainer/lessons/${lessonId}/upload-video`
        : `/api/v1/trainer/lessons/${lessonId}/upload-pdf`;
      try {
        const uploadRes = await apiClient.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (form.lesson_type === 'video') newLesson.video_url = uploadRes.data.video_url;
        else newLesson.pdf_url = uploadRes.data.pdf_url;
      } catch (e) { console.error('File upload failed:', e); }
    }
    setModules(ms => ms.map(m =>
      m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m
    ));
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await apiClient.delete(`/api/v1/trainer/lessons/${lessonId}`);
      setModules(ms => ms.map(m =>
        m.id === moduleId ? { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) } : m
      ));
    } catch { alert('Failed to delete lesson'); }
  };

  const handleLessonVideoUploaded = (moduleId, lessonId, videoUrl) =>
    setModules(ms => ms.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, video_url: videoUrl } : l) }
        : m
    ));

  const handleLessonPdfUploaded = (moduleId, lessonId, pdfUrl) =>
    setModules(ms => ms.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, pdf_url: pdfUrl } : l) }
        : m
    ));

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons || []).length, 0);

  const tabs = [
    { icon: "menu_book",    label: "Content"  },
    { icon: "group",        label: "Students" },
    { icon: "analytics",    label: "Analytics"},
    { icon: "auto_awesome", label: "AI Hub"   },
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // ── Course List View ──────────────────────────────────────────
  if (!courseId) {
    return (
      <>
        {showCreateCourse && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Create New Course</h3>
                <button onClick={() => setShowCreateCourse(false)} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course Title *</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    placeholder="e.g. Introduction to Machine Learning"
                    value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                  <textarea rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                    placeholder="Brief course description..."
                    value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Level</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-slate-100">
                <button onClick={() => setShowCreateCourse(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                <button onClick={handleCreateCourse} disabled={creating || !newCourse.title.trim()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <TrainerSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
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
                      placeholder="Search courses..." />
                  </div>
                  <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">Your Courses</h1>
                    <p className="text-slate-400">Create, manage, and publish your courses.</p>
                  </div>
                  <button onClick={() => setShowCreateCourse(true)}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md">
                    <Icon name="add" className="text-[18px]" />Create New Course
                  </button>
                </div>
                {courses.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
                    <Icon name="school" className="text-6xl text-slate-200 mb-4 block" />
                    <p className="text-slate-500 font-medium text-lg mb-2">No courses yet</p>
                    <button onClick={() => setShowCreateCourse(true)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-blue-700">
                      Create Your First Course
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                      <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                        <div onClick={() => navigate(`/trainer/courses/${c.id}`)}
                          className="h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center cursor-pointer relative">
                          {c.thumbnail_url
                            ? <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                            : <Icon name="school" className="text-5xl text-white/40" />
                          }
                          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.is_published ? 'bg-green-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                            {c.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 onClick={() => navigate(`/trainer/courses/${c.id}`)}
                            className="font-bold text-slate-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1">{c.title}</h3>
                          <p className="text-xs text-slate-400 mb-4 line-clamp-2">{c.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                            <span className="flex items-center gap-1"><Icon name="layers" className="text-sm" />{c.total_modules || 0} modules</span>
                            <span className="flex items-center gap-1"><Icon name="group" className="text-sm" />{c.enrolled_count || 0} students</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/trainer/courses/${c.id}`)}
                              className="flex-1 py-2 bg-blue-600/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600/20">Manage</button>
                            <button onClick={() => handleTogglePublish(c)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold ${c.is_published ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                              {c.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => handleDeleteCourse(c.id)}
                              className="px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-100">
                              <Icon name="delete" className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowCreateCourse(true)}
                      className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/5 transition-all min-h-[280px] group">
                      <Icon name="add_circle" className="text-4xl mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm">Create New Course</span>
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // ── Course Detail View ────────────────────────────────────────
  return (
    <>
      {showSettings && <SettingsPanel course={course} onClose={() => setShowSettings(false)} onSave={handleSaveCourse} />}
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
        <AddLessonModal onClose={() => setAddLessonTarget(null)}
          onAdd={(form) => addLesson(addLessonTarget, form)} />
      )}

      <div className="flex h-screen overflow-hidden bg-slate-50">
        <TrainerSidebar courseId={courseId} />
        <div className="flex-1 flex flex-col overflow-hidden">
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

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 py-6">
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <button onClick={() => navigate('/trainer/dashboard')} className="hover:text-blue-600">Dashboard</button>
                <Icon name="chevron_right" className="text-xs" />
                <span className="text-slate-900 font-medium">{course?.title || 'Course'}</span>
              </nav>

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
                  <button onClick={() => setShowAddChapterModal(true)}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                    <Icon name="add" className="text-[18px]" />Add Chapter
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

              {/* ── Content Tab ── */}
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
                          onAddLesson={(id) => setAddLessonTarget(id)}
                          onLessonVideoUploaded={handleLessonVideoUploaded}
                          onLessonPdfUploaded={handleLessonPdfUploaded}
                        />
                      ))
                  )}
                  <button onClick={() => setShowAddChapterModal(true)}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/5 transition-all group">
                    <Icon name="add_circle" className="text-3xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Add New Chapter</span>
                  </button>
                </div>
              )}

              {/* ── Students Tab ── */}
              {activeTab === "Students" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Enrolled Students</h3>
                      <p className="text-sm text-slate-400">{students.length} student{students.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCourseMsg(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Icon name="mail" className="text-base" />Message All
                      </button>
                      <button onClick={() => setShowCourseMeeting(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2">
                        <Icon name="videocam" className="text-base" />Schedule Meeting
                      </button>
                    </div>
                  </div>
                  {students.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                      <Icon name="group" className="text-5xl text-slate-200 mb-3 block" />
                      <p className="text-slate-500 font-medium">No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map((s, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="size-11 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                              <Icon name="person" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{s.user_name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{s.user_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right mr-2 hidden sm:block">
                              <p className="text-xs font-bold text-slate-600">{s.progress_percent || 0}%</p>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.progress_percent || 0}%` }} />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{s.completed_lessons || 0}/{s.total_lessons || 0} lessons</p>
                            </div>
                            <button onClick={() => { setShowDmModal(s); setDmMsg(''); }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Send message">
                              <Icon name="chat" className="text-base" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Analytics Tab ── */}
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

              {/* ── AI Hub Tab ── */}
              {activeTab === "AI Hub" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "auto_awesome", label: "Quick Summary",  desc: "Generate AI summary", tool: "summary" },
                    { icon: "quiz",         label: "Quiz Generator", desc: "Auto-create quizzes",  tool: "quiz"   },
                    { icon: "headphones",   label: "Audio Summary",  desc: "Convert to audio",     tool: "audio"  },
                  ].map(a => (
                    <button key={a.label} onClick={() => navigate(`/trainer/ai-studio?course=${courseId}&tool=${a.tool}`)}
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
                  { icon: "description", label: "Total Lessons",  value: totalLessons,    color: "blue"   },
                  { icon: "layers",      label: "Total Chapters", value: modules.length,  color: "green"  },
                  { icon: "group",       label: "Students",       value: students.length, color: "purple" },
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

      {/* ── Message All Modal ── */}
      {showCourseMsg && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Message All Students</h3>
              <button onClick={() => setShowCourseMsg(false)} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Subject</label>
                <input value={courseMsgForm.subject}
                  onChange={e => setCourseMsgForm({ ...courseMsgForm, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message *</label>
                <textarea rows={4} value={courseMsgForm.body}
                  onChange={e => setCourseMsgForm({ ...courseMsgForm, body: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowCourseMsg(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
              <button onClick={handleSendCourseMessage} disabled={courseMsgSending || !courseMsgForm.body.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-60">
                {courseMsgSending ? 'Sending...' : `Send to ${students.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule Meeting Modal ── */}
      {showCourseMeeting && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="videocam" className="text-green-600" />
                </div>
                <h3 className="font-bold text-slate-900">Schedule Meeting</h3>
              </div>
              <button onClick={() => setShowCourseMeeting(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="close" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Meeting Title</label>
                <input value={courseMeetForm.title}
                  onChange={e => setCourseMeetForm({ ...courseMeetForm, title: e.target.value })}
                  placeholder={`${course?.title || 'Course'} — Live Session`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Meeting URL</label>
                <input value={courseMeetForm.meeting_url}
                  onChange={e => setCourseMeetForm({ ...courseMeetForm, meeting_url: e.target.value })}
                  placeholder="https://zoom.us/j/... or Google Meet link"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date & Time *</label>
                <input type="datetime-local" value={courseMeetForm.scheduled_at}
                  onChange={e => setCourseMeetForm({ ...courseMeetForm, scheduled_at: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Duration (minutes)</label>
                <input type="number" min={5} value={courseMeetForm.duration_minutes}
                  onChange={e => setCourseMeetForm({ ...courseMeetForm, duration_minutes: parseInt(e.target.value) || 30 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowCourseMeeting(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateCourseMeeting}
                disabled={courseMeetCreating || !courseMeetForm.scheduled_at}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {courseMeetCreating
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Scheduling...</>
                  : <><Icon name="videocam" className="text-base" />Schedule Meeting</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DM Modal ── */}
      {showDmModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Message {showDmModal.user_name}</h3>
              <button onClick={() => setShowDmModal(null)} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
            </div>
            <div className="p-5">
              <textarea rows={4} value={dmMsg} onChange={e => setDmMsg(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                placeholder={`Write your message to ${showDmModal.user_name}...`} />
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowDmModal(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
              <button onClick={handleSendDm} disabled={dmSending || !dmMsg.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-60">
                {dmSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}