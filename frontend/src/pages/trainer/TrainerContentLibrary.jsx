import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";
import apiClient from "../../services/api";

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24" }}>
    {name}
  </span>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAssetType(lesson) {
  if (lesson.lesson_type === "video") return "video";
  if (lesson.lesson_type === "quiz")  return "document";
  return "audio";
}
function getBadgeIcon(type) {
  return { video: "videocam", document: "description", audio: "mic" }[type] || "description";
}
function getEnhancement(lesson) {
  if (lesson.lesson_type === "video")
    return { icon: "mic",         text: "🎤 Audio summary available", bg: "bg-blue-600/5 border border-blue-600/10",    tc: "text-[#137fec]",   ic: "text-[#137fec]" };
  if (lesson.lesson_type === "quiz")
    return { icon: "quiz",        text: "✨ AI Quiz ready",           bg: "bg-emerald-500/5 border border-emerald-500/10", tc: "text-emerald-600", ic: "text-emerald-500" };
  return   { icon: "description", text: "📄 AI Transcript generated", bg: "bg-amber-500/5 border border-amber-500/10",   tc: "text-amber-600",   ic: "text-amber-500" };
}

// Convert lesson → UI asset
function lessonToAsset(lesson, course) {
  const type = getAssetType(lesson);
  return {
    id: lesson.id,
    title: lesson.title,
    badgeIcon: getBadgeIcon(type),
    badgeText: lesson.duration_minutes ? `${lesson.duration_minutes}:00` : type.toUpperCase(),
    type,
    collectionId: `course-${course.id}`,
    hasQuiz: lesson.lesson_type === "quiz",
    aiEnhanced: false,
    views: "—",
    course: course.title,
    courseId: String(course.id),
    usedInLessons: 1,
    uploadedAt: "today",
    isKnowledgeBase: false,
    enhancement: getEnhancement(lesson),
    thumb: course.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=137fec&color=fff&size=320`,
  };
}

// ✅ Convert admin KB file → UI asset
function kbFileToAsset(kf) {
  const typeMap  = { VIDEO: "video", PDF: "document", PPTX: "document", DOCX: "document", ZIP: "document", TXT: "document" };
  const iconMap  = { VIDEO: "videocam", PDF: "picture_as_pdf", PPTX: "slideshow", DOCX: "description", ZIP: "folder_zip", TXT: "article" };
  const type     = typeMap[kf.file_type] || "document";
  const isVideo  = type === "video";
  return {
    id:              `kb-${kf.id}`,
    title:           kf.original_name,
    badgeIcon:       iconMap[kf.file_type] || "description",
    badgeText:       kf.file_type,
    type,
    collectionId:    "kb-admin",
    hasQuiz:         false,
    aiEnhanced:      false,
    views:           kf.view_count || 0,
    course:          "Knowledge Base",
    courseId:        null,
    usedInLessons:   0,
    uploadedAt:      kf.created_at,
    isKnowledgeBase: true,
    kbFileId:        kf.id,
    kbUrl:           kf.url,          // e.g. /static/uploads/knowledge/abc.pdf
    sizeMb:          kf.file_size_mb,
    enhancement: {
      icon: "library_books",
      text: "📚 Admin Knowledge Base",
      bg:   "bg-purple-500/5 border border-purple-500/10",
      tc:   "text-purple-600",
      ic:   "text-purple-500",
    },
    thumb: isVideo
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(kf.original_name)}&background=137fec&color=fff&size=320`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(kf.original_name)}&background=7c3aed&color=fff&size=320`,
  };
}

// ── Modals ────────────────────────────────────────────────────────────────────
function AssetDetailModal({ asset, onClose, onEdit, onReuse, onAIEnhance }) {
  if (!asset) return null;
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const kbFullUrl = asset.kbUrl
    ? (asset.kbUrl.startsWith("http") ? asset.kbUrl : `${API_BASE}${asset.kbUrl}`)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 truncate pr-4">{asset.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-4">
          <img src={asset.thumb} alt={asset.title} className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Type</p>
              <p className="text-lg font-black text-slate-900 capitalize">{asset.type}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Source</p>
              <p className="text-sm font-bold text-slate-900">{asset.course}</p>
            </div>
          </div>
          {asset.sizeMb && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">File Size</p>
              <p className="text-sm font-semibold text-slate-800">{asset.sizeMb} MB</p>
            </div>
          )}
          <div className={`${asset.enhancement.bg} rounded-lg p-3`}>
            <p className={`text-sm font-semibold ${asset.enhancement.tc} flex items-center gap-2`}>
              <Icon name={asset.enhancement.icon} className={`text-base ${asset.enhancement.ic}`} />
              {asset.enhancement.text}
            </p>
          </div>

          {/* ✅ KB file: inline preview */}
          {asset.isKnowledgeBase && kbFullUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              {asset.type === "video" ? (
                <video src={kbFullUrl} controls className="w-full" style={{ aspectRatio: "16/9" }} />
              ) : (
                <div className="bg-slate-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={asset.badgeIcon} className="text-purple-600 text-xl" />
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{asset.title}</span>
                  </div>
                  <a href={kbFullUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                    <Icon name="open_in_new" className="text-sm" />Open File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          {!asset.isKnowledgeBase && (
            <>
              <button onClick={onReuse} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4]">Reuse</button>
              <button onClick={onEdit}  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">Edit</button>
              <button onClick={onAIEnhance} className="flex-1 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 flex items-center justify-center gap-1">
                <Icon name="auto_awesome" className="text-base" />AI Enhance
              </button>
            </>
          )}
          {asset.isKnowledgeBase && kbFullUrl && (
            <a href={kbFullUrl} target="_blank" rel="noreferrer"
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
              <Icon name="download" className="text-base" />Download / Open
            </a>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">Close</button>
        </div>
      </div>
    </div>
  );
}

function ReuseModal({ asset, courses, onClose, onConfirm }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const handleConfirm = () => {
    if (!selectedCourse) return;
    setSuccessMsg(true);
    setTimeout(() => onConfirm(selectedCourse), 900);
  };
  if (!asset) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Reuse in Course</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        {successMsg ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="check_circle" className="text-green-600 text-2xl" />
            </div>
            <p className="font-bold text-slate-900">Content Added!</p>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">Select course to add <strong>{asset.title}</strong> to:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {courses.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50">
                    <input type="radio" name="course-select" value={c.id}
                      checked={selectedCourse === String(c.id)}
                      onChange={() => setSelectedCourse(String(c.id))} className="accent-[#137fec]" />
                    <span className="text-sm font-medium text-slate-700">{c.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
              <button onClick={handleConfirm} disabled={!selectedCourse}
                className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold disabled:opacity-40">
                Add to Course
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteModal({ asset, onClose, onConfirm }) {
  if (!asset) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-rose-600">Delete Content</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-3">
            <Icon name="warning" className="text-rose-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">
              Delete <strong>{asset.title}</strong>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose}    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={onConfirm}  className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold">Delete</button>
        </div>
      </div>
    </div>
  );
}

function FilterDrawer({ open, onClose, onApply, courseNames }) {
  const [assetType, setAssetType] = useState("All");
  const [courses,   setCourses]   = useState([]);
  const toggleCourse = opt => setCourses(p => p.includes(opt) ? p.filter(x => x !== opt) : [...p, opt]);
  const handleApply = () => { onApply({ assetType, courses }); onClose(); };
  const handleReset = () => { setAssetType("All"); setCourses([]); onApply({ assetType: "All", courses: [] }); onClose(); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Asset Type</p>
            <div className="space-y-2">
              {["All", "Videos", "Audio", "Documents"].map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="assetType" checked={assetType === opt} onChange={() => setAssetType(opt)} className="accent-[#137fec]" />
                  <span className="text-sm text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Source</p>
            <div className="space-y-2">
              {courseNames.map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={courses.includes(opt)} onChange={() => toggleCourse(opt)} className="accent-[#137fec]" />
                  <span className="text-sm text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={handleReset} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600">Reset</button>
          <button onClick={handleApply} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold">Apply</button>
        </div>
      </div>
    </div>
  );
}

function CardMenu({ open, onClose, onEdit, onReuse, onAIEnhance, onDelete, isKb }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  const items = isKb
    ? [{ icon: "delete", label: "Delete", fn: onDelete, danger: true }]
    : [
        { icon: "edit",         label: "Edit",            fn: onEdit },
        { icon: "refresh",      label: "Reuse in Course", fn: onReuse },
        { icon: "auto_awesome", label: "AI Enhance",      fn: onAIEnhance },
        { icon: "delete",       label: "Delete",          fn: onDelete, danger: true },
      ];
  return (
    <div ref={ref} className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
      {items.map(({ icon, label, fn, danger }) => (
        <button key={label} onClick={() => { fn?.(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium hover:bg-slate-50 ${danger ? "text-rose-600" : "text-slate-700"}`}>
          <Icon name={icon} className={`text-base ${danger ? "text-rose-400" : "text-slate-400"}`} />
          {label}
        </button>
      ))}
    </div>
  );
}

function AssetCard({ asset, selected, onSelect, onPreview, onReuse, onEdit, onDelete, onAIEnhance }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { enhancement: e } = asset;
  return (
    <div className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${selected ? "border-[#137fec] ring-2 ring-[#137fec]/20" : "border-slate-200"}`}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div className="absolute top-3 left-3 z-10" onClick={ev => ev.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onSelect} className="accent-[#137fec] w-4 h-4" />
        </div>
        <img src={asset.thumb} alt={asset.title} onClick={onPreview}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" />
        <div className="absolute top-3 right-3">
          <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Icon name={asset.badgeIcon} className="text-xs" />{asset.badgeText}
          </div>
        </div>
        {/* ✅ KB badge */}
        {asset.isKnowledgeBase && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
              <Icon name="library_books" className="text-xs" />Knowledge Base
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 onClick={onPreview}
            className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#137fec] transition-colors flex-1 cursor-pointer">
            {asset.title}
          </h3>
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(p => !p)} className="text-slate-400 hover:text-slate-600">
              <Icon name="more_vert" />
            </button>
            <CardMenu open={menuOpen} onClose={() => setMenuOpen(false)}
              onEdit={onEdit} onReuse={onReuse} onAIEnhance={onAIEnhance} onDelete={onDelete}
              isKb={asset.isKnowledgeBase} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded ${asset.isKnowledgeBase ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
            <Icon name={asset.isKnowledgeBase ? "library_books" : "school"} className="text-sm" />
            {asset.course}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded capitalize">
            <Icon name="label" className="text-sm" />{asset.type}
          </div>
          {asset.sizeMb && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {asset.sizeMb} MB
            </div>
          )}
        </div>
        <div className={`${e.bg} rounded-lg p-2.5 mb-5`}>
          <p className={`text-[11px] font-semibold ${e.tc} flex items-center gap-1.5`}>
            <Icon name={e.icon} className={`text-sm ${e.ic}`} />{e.text}
          </p>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          {!asset.isKnowledgeBase ? (
            <>
              <button onClick={onReuse} className="flex items-center justify-center gap-1 py-2 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4]">
                <Icon name="refresh" className="text-base" />Reuse
              </button>
              <button onClick={onEdit} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                <Icon name="edit" className="text-base" />Edit
              </button>
              <button onClick={onAIEnhance} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                <Icon name="auto_awesome" className="text-base text-amber-500" />
              </button>
            </>
          ) : (
            <>
              <a href={asset.kbUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${asset.kbUrl}` : "#"}
                target="_blank" rel="noreferrer"
                className="col-span-2 flex items-center justify-center gap-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                <Icon name="open_in_new" className="text-base" />Open File
              </a>
              <button onClick={onDelete} className="flex items-center justify-center py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-100">
                <Icon name="delete" className="text-base" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetRow({ asset, selected, onSelect, onPreview, onReuse, onEdit, onDelete, onAIEnhance }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { enhancement: e } = asset;
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return (
    <div className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center gap-4 p-4 ${selected ? "border-[#137fec] ring-2 ring-[#137fec]/20" : "border-slate-200"}`}>
      <input type="checkbox" checked={selected} onChange={onSelect} className="accent-[#137fec] w-4 h-4 flex-shrink-0" onClick={ev => ev.stopPropagation()} />
      <div className="relative rounded-lg overflow-hidden flex-shrink-0 w-36 h-[80px] cursor-pointer" onClick={onPreview}>
        <img src={asset.thumb} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-1.5 right-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
          <Icon name={asset.badgeIcon} className="text-[10px]" />{asset.badgeText}
        </div>
        {asset.isKnowledgeBase && (
          <div className="absolute bottom-1 left-1 bg-purple-600 text-white px-1 py-0.5 rounded text-[8px] font-bold">KB</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 onClick={onPreview} className="text-sm font-bold text-slate-900 group-hover:text-[#137fec] transition-colors truncate cursor-pointer">{asset.title}</h3>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${asset.isKnowledgeBase ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
            <Icon name={asset.isKnowledgeBase ? "library_books" : "school"} className="text-xs" />{asset.course}
          </span>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">{asset.type}</span>
          {asset.sizeMb && <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{asset.sizeMb} MB</span>}
        </div>
        <div className={`${e.bg} rounded-lg px-2 py-1 mt-2 inline-flex items-center gap-1`}>
          <Icon name={e.icon} className={`text-xs ${e.ic}`} />
          <span className={`text-[11px] font-semibold ${e.tc}`}>{e.text}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!asset.isKnowledgeBase ? (
          <>
            <button onClick={onReuse}     className="flex items-center gap-1 px-3 py-1.5 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4]"><Icon name="refresh" className="text-sm" />Reuse</button>
            <button onClick={onEdit}      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"><Icon name="edit" className="text-sm" />Edit</button>
            <button onClick={onAIEnhance} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"><Icon name="auto_awesome" className="text-sm text-amber-500" /></button>
          </>
        ) : (
          <a href={asset.kbUrl ? `${API_BASE}${asset.kbUrl}` : "#"} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
            <Icon name="open_in_new" className="text-sm" />Open
          </a>
        )}
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)} className="text-slate-400 hover:text-slate-600"><Icon name="more_vert" /></button>
          <CardMenu open={menuOpen} onClose={() => setMenuOpen(false)}
            onEdit={onEdit} onReuse={onReuse} onAIEnhance={onAIEnhance} onDelete={onDelete}
            isKb={asset.isKnowledgeBase} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TrainerContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userName  = localStorage.getItem("userName") || "Trainer";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [assets,      setAssets]      = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [kbCount,     setKbCount]     = useState(0);  // ✅ track KB file count

  const [activeCategory,   setActiveCategory]   = useState("All Assets");
  const [activeCollection, setActiveCollection] = useState(null);
  const [viewMode,         setViewMode]         = useState("grid");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedIds,      setSelectedIds]      = useState([]);
  const [drawerFilters,    setDrawerFilters]    = useState({ assetType: "All", courses: [] });

  const [showFilters,       setShowFilters]       = useState(false);
  const [detailAsset,       setDetailAsset]       = useState(null);
  const [reuseAsset,        setReuseAsset]        = useState(null);
  const [deleteAsset,       setDeleteAsset]       = useState(null);
  const [showBulkDelete,    setShowBulkDelete]    = useState(false);

  // ── Fetch: lessons from courses + KB files from admin ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allAssets = [];

        // 1️⃣ Trainer's own courses & lessons
        const coursesRes = await apiClient.get("/api/v1/trainer/courses");
        const courseList = coursesRes.data || [];
        setCourses(courseList);

        const courseCollections = courseList.map(c => ({ id: `course-${c.id}`, label: c.title }));

        await Promise.all(
          courseList.map(async (course) => {
            try {
              const modulesRes = await apiClient.get(`/api/v1/trainer/courses/${course.id}/modules`);
              const modules = modulesRes.data || [];
              modules.forEach(mod => {
                (mod.lessons || []).forEach(lesson => {
                  allAssets.push(lessonToAsset(lesson, course));
                });
              });
            } catch { /* skip */ }
          })
        );

        // 2️⃣ Admin Knowledge Base files
        let kbCollection = null;
        try {
          const kbRes  = await apiClient.get("/api/v1/knowledge?page_size=100");
          const kbFiles = kbRes.data?.files || [];
          setKbCount(kbFiles.length);
          kbFiles.forEach(kf => allAssets.push(kbFileToAsset(kf)));
          if (kbFiles.length > 0) {
            kbCollection = { id: "kb-admin", label: `📚 Knowledge Base (${kbFiles.length})` };
          }
        } catch {
          // KB fetch failed (e.g. not admin/trainer) — silently skip
        }

        setAssets(allAssets);
        setCollections([
          ...courseCollections,
          ...(kbCollection ? [kbCollection] : []),
        ]);
      } catch (err) {
        setError("Failed to load content library");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleEdit      = (asset) => { if (!asset.isKnowledgeBase) navigate(`/trainer/courses/${asset.courseId}`); };
  const handleReuse     = (asset) => { if (!asset.isKnowledgeBase) { setReuseAsset(asset); setDetailAsset(null); } };
  const handleDelete    = (asset) => { setDeleteAsset(asset); setDetailAsset(null); };
  const handlePreview   = (asset) => setDetailAsset(asset);
  const handleAIEnhance = (asset) => { if (!asset.isKnowledgeBase) navigate(`/trainer/ai-studio?asset=${asset.id}`); };

  const handleReuseConfirm = (courseId) => {
    setReuseAsset(null);
    navigate(`/trainer/courses/${courseId}`);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteAsset.isKnowledgeBase) {
        // KB files can only be deleted by admin — show message
        alert("Knowledge Base files can only be deleted by an Admin.");
        setDeleteAsset(null);
        return;
      }
      await apiClient.delete(`/api/v1/trainer/lessons/${deleteAsset.id}`);
      setAssets(prev => prev.filter(a => a.id !== deleteAsset.id));
      setSelectedIds(prev => prev.filter(id => id !== deleteAsset.id));
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleteAsset(null);
    }
  };

  const toggleSelect   = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);

  const handleBulkDeleteConfirm = async () => {
    try {
      const nonKbIds = selectedIds.filter(id => !String(id).startsWith("kb-"));
      await Promise.all(nonKbIds.map(id => apiClient.delete(`/api/v1/trainer/lessons/${id}`)));
      setAssets(prev => prev.filter(a => !nonKbIds.includes(a.id)));
      clearSelection();
    } catch { alert("Some deletes failed"); }
    finally { setShowBulkDelete(false); }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const courseNames = [...new Set(assets.map(a => a.course))];

  const filtered = assets.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
      || a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const catMap = {
      "All Assets":    true,
      "Video Lessons": a.type === "video",
      "Audio Content": a.type === "audio",
      "Documents":     a.type === "document",
      "Knowledge Base": a.isKnowledgeBase,       // ✅ new category
    };
    const matchCat   = catMap[activeCategory] ?? true;
    const matchColl  = activeCollection ? a.collectionId === activeCollection : true;
    const typeMap    = { "All": true, "Videos": a.type === "video", "Audio": a.type === "audio", "Documents": a.type === "document" };
    const matchType  = typeMap[drawerFilters.assetType] ?? true;
    const matchCourse = drawerFilters.courses.length === 0 || drawerFilters.courses.includes(a.course);
    return matchSearch && matchCat && matchColl && matchType && matchCourse;
  });

  const categories = [
    { icon: "grid_view",    label: "All Assets" },
    { icon: "videocam",     label: "Video Lessons" },
    { icon: "mic",          label: "Audio Content" },
    { icon: "description",  label: "Documents" },
    { icon: "library_books", label: "Knowledge Base" },   // ✅ new
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading content library...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-rose-500 font-semibold mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{font-family:'Lexend',sans-serif;background:#f6f7f8;margin:0;}
        .line-clamp-1{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;}
      `}</style>

      <FilterDrawer open={showFilters} onClose={() => setShowFilters(false)} onApply={setDrawerFilters} courseNames={courseNames} />
      {detailAsset  && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)}
        onEdit={() => { setDetailAsset(null); handleEdit(detailAsset); }}
        onReuse={() => handleReuse(detailAsset)}
        onAIEnhance={() => { setDetailAsset(null); handleAIEnhance(detailAsset); }} />}
      {reuseAsset   && <ReuseModal asset={reuseAsset} courses={courses} onClose={() => setReuseAsset(null)} onConfirm={handleReuseConfirm} />}
      {deleteAsset  && <DeleteModal asset={deleteAsset} onClose={() => setDeleteAsset(null)} onConfirm={handleDeleteConfirm} />}

      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Lexend',sans-serif", backgroundColor: "#f6f7f8" }}>
        <TrainerSidebar />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/trainer/dashboard")}>
                <div className="bg-[#137fec] p-1.5 rounded-lg text-white flex items-center justify-center">
                  <Icon name="school" className="text-xl" />
                </div>
                <span className="text-slate-900 text-xl font-bold tracking-tight">LMS Trainer</span>
              </div>
              <div className="flex flex-1 items-center justify-end gap-4">
                <div className="relative w-full max-w-md hidden md:block">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 rounded-lg pl-10 pr-10 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#137fec]/30"
                    placeholder="Search assets..." />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Icon name="close" className="text-base" />
                    </button>
                  )}
                </div>
                <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-6 flex gap-8">

              {/* Sidebar */}
              <aside className="w-64 flex-shrink-0 hidden xl:block">
                <div className="flex flex-col gap-8 sticky top-24">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Asset Categories</h3>
                    <ul className="space-y-1">
                      {categories.map(({ icon, label }) => (
                        <li key={label}>
                          <button onClick={() => { setActiveCategory(label); setActiveCollection(null); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeCategory === label && !activeCollection ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}>
                            <Icon name={icon} className="text-[20px] flex-shrink-0" />
                            {label}
                            {label === "Knowledge Base" && kbCount > 0 && (
                              <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{kbCount}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collections</h3>
                    </div>
                    <ul className="space-y-1">
                      {collections.map(c => (
                        <li key={c.id}>
                          <button onClick={() => { setActiveCollection(c.id); setActiveCategory("All Assets"); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeCollection === c.id ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}>
                            <Icon name={c.id === "kb-admin" ? "library_books" : "folder"} className="text-[20px] flex-shrink-0" />
                            <span className="truncate">{c.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="p-4 rounded-xl bg-[#137fec]/5 border border-[#137fec]/10">
                    <p className="text-xs font-bold text-[#137fec] uppercase mb-2">Total Assets</p>
                    <p className="text-2xl font-black text-slate-900">{assets.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {courses.length} course{courses.length !== 1 ? "s" : ""}
                      {kbCount > 0 ? ` · ${kbCount} KB files` : ""}
                    </p>
                  </div>

                  {/* KB info box */}
                  {kbCount > 0 && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="library_books" className="text-purple-600 text-base" />
                        <p className="text-xs font-bold text-purple-700">Knowledge Base</p>
                      </div>
                      <p className="text-[11px] text-purple-600">{kbCount} file{kbCount !== 1 ? "s" : ""} uploaded by Admin</p>
                    </div>
                  )}
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <button onClick={() => navigate("/trainer/dashboard")} className="hover:text-[#137fec]">Dashboard</button>
                      <Icon name="chevron_right" className="text-xs" />
                      <span className="text-slate-900 font-medium">Content Library</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Library</h1>
                    <p className="text-slate-500 mt-1 text-sm">{filtered.length} asset{filtered.length !== 1 ? "s" : ""} found</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowFilters(true)}
                      className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-semibold shadow-sm transition-colors ${drawerFilters.assetType !== "All" || drawerFilters.courses.length > 0 ? "border-[#137fec] text-[#137fec] bg-[#137fec]/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      <Icon name="filter_list" className="text-lg" />Filters
                    </button>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-slate-100 text-[#137fec]" : "text-slate-400 hover:text-slate-600"}`}>
                        <Icon name="grid_view" className="block" />
                      </button>
                      <button onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-slate-100 text-[#137fec]" : "text-slate-400 hover:text-slate-600"}`}>
                        <Icon name="format_list_bulleted" className="block" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk bar */}
                {selectedIds.length > 0 && (
                  <div className="mb-6 flex items-center gap-3 p-3 bg-[#137fec]/5 border border-[#137fec]/20 rounded-xl">
                    <span className="text-sm font-bold text-[#137fec]">{selectedIds.length} selected</span>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setShowBulkDelete(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600">
                        <Icon name="delete" className="text-sm" />Delete
                      </button>
                      <button onClick={clearSelection}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                        <Icon name="close" className="text-sm" />Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty */}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Icon name="search_off" className="text-6xl text-slate-200 mb-4" />
                    <p className="text-lg font-bold text-slate-400">
                      {assets.length === 0 ? "No assets found" : "No assets match your filters"}
                    </p>
                    <button onClick={() => { setSearchQuery(""); setDrawerFilters({ assetType: "All", courses: [] }); setActiveCategory("All Assets"); setActiveCollection(null); }}
                      className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Grid */}
                {filtered.length > 0 && viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(a => (
                      <AssetCard key={a.id} asset={a} selected={selectedIds.includes(a.id)}
                        onSelect={() => toggleSelect(a.id)} onPreview={() => handlePreview(a)}
                        onReuse={() => handleReuse(a)} onEdit={() => handleEdit(a)}
                        onDelete={() => handleDelete(a)} onAIEnhance={() => handleAIEnhance(a)} />
                    ))}
                  </div>
                )}

                {/* List */}
                {filtered.length > 0 && viewMode === "list" && (
                  <div className="flex flex-col gap-4">
                    {filtered.map(a => (
                      <AssetRow key={a.id} asset={a} selected={selectedIds.includes(a.id)}
                        onSelect={() => toggleSelect(a.id)} onPreview={() => handlePreview(a)}
                        onReuse={() => handleReuse(a)} onEdit={() => handleEdit(a)}
                        onDelete={() => handleDelete(a)} onAIEnhance={() => handleAIEnhance(a)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}