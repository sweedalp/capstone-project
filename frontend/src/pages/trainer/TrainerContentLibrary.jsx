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

// ── Helpers ───────────────────────────────────────────────────────
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
    return { icon: "mic", text: "🎤 Audio summary available", bg: "bg-blue-600/5 border border-blue-600/10", tc: "text-[#137fec]", ic: "text-[#137fec]" };
  if (lesson.lesson_type === "quiz")
    return { icon: "quiz", text: "✨ AI Quiz ready", bg: "bg-emerald-500/5 border border-emerald-500/10", tc: "text-emerald-600", ic: "text-emerald-500" };
  return { icon: "description", text: "📄 AI Transcript generated", bg: "bg-amber-500/5 border border-amber-500/10", tc: "text-amber-600", ic: "text-amber-500" };
}

// Convert backend lesson → asset shape used by UI cards
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
    enhancement: getEnhancement(lesson),
    thumb: course.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=137fec&color=fff&size=320`,
  };
}

// ── Modals ────────────────────────────────────────────────────────
function AssetDetailModal({ asset, onClose, onEdit, onReuse, onAIEnhance }) {
  if (!asset) return null;
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
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Duration</p>
              <p className="text-lg font-black text-slate-900">{asset.badgeText}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Type</p>
              <p className="text-lg font-black text-slate-900 capitalize">{asset.type}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Course</p>
            <p className="text-sm font-semibold text-slate-800">{asset.course}</p>
          </div>
          <div className={`${asset.enhancement.bg} rounded-lg p-3`}>
            <p className={`text-sm font-semibold ${asset.enhancement.tc} flex items-center gap-2`}>
              <Icon name={asset.enhancement.icon} className={`text-base ${asset.enhancement.ic}`} />
              {asset.enhancement.text}
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onReuse} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">Reuse</button>
          <button onClick={onEdit} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Edit</button>
          <button onClick={onAIEnhance} className="flex-1 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
            <Icon name="auto_awesome" className="text-base" /> AI Enhance
          </button>
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
            <p className="text-sm text-slate-500 text-center">Redirecting to Course Management…</p>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">Select the course to add <strong>{asset.title}</strong> to:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {courses.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50 transition-colors">
                    <input type="radio" name="course-select" value={c.id}
                      checked={selectedCourse === String(c.id)}
                      onChange={() => setSelectedCourse(String(c.id))} className="accent-[#137fec]" />
                    <span className="text-sm font-medium text-slate-700">{c.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={handleConfirm} disabled={!selectedCourse}
                className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] disabled:opacity-40 disabled:cursor-not-allowed">
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
        <div className="p-5 space-y-3">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-3">
            <Icon name="warning" className="text-rose-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">
              Are you sure you want to permanently delete <strong>{asset.title}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function BulkAddModal({ count, courses, onClose, onConfirm }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Add {count} Item{count !== 1 ? "s" : ""} to Course</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
          {courses.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50">
              <input type="radio" name="bulk-course" value={c.id}
                checked={selectedCourse === String(c.id)}
                onChange={() => setSelectedCourse(String(c.id))} className="accent-[#137fec]" />
              <span className="text-sm font-medium text-slate-700">{c.title}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={() => { if (selectedCourse) onConfirm(selectedCourse); }}
            disabled={!selectedCourse}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold disabled:opacity-40">
            Add to Course
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkDeleteModal({ count, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-rose-600">Delete {count} Item{count !== 1 ? "s" : ""}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600">Permanently delete <strong>{count} selected item{count !== 1 ? "s" : ""}</strong>? This removes them from all courses.</p>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold">Delete All</button>
        </div>
      </div>
    </div>
  );
}

function NewCollectionModal({ onClose, onConfirm }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">New Collection</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && name.trim()) { onConfirm(name.trim()); onClose(); } }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30"
            placeholder="e.g. Python Course Materials" />
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={() => { if (name.trim()) { onConfirm(name.trim()); onClose(); } }}
            className="flex-1 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">Create</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ courses, onClose, onGoToUploadPage }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Upload New Asset</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-[#137fec] bg-blue-50" : "border-slate-200 hover:border-[#137fec]/50"}`}>
            <Icon name="cloud_upload" className="text-5xl text-slate-300 mb-3 block" />
            <p className="text-sm font-semibold text-slate-700">Drag & drop your files here</p>
            <p className="text-xs text-slate-400 mt-1">Supports MP4, MP3, PDF, DOCX up to 500MB</p>
            <button onClick={onGoToUploadPage}
              className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4]">
              Browse Files
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Course</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={onGoToUploadPage} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold">Upload Asset</button>
        </div>
      </div>
    </div>
  );
}

function FilterDrawer({ open, onClose, onApply, courseNames }) {
  const [assetType, setAssetType] = useState("All");
  const [courses, setCourses] = useState([]);
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Course</p>
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
          <button onClick={handleApply} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

function CardMenu({ open, onClose, onEdit, onReuse, onAIEnhance, onDelete }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
      {[
        { icon: "edit",         label: "Edit",            fn: onEdit },
        { icon: "refresh",      label: "Reuse in Course", fn: onReuse },
        { icon: "auto_awesome", label: "AI Enhance",      fn: onAIEnhance },
        { icon: "delete",       label: "Delete",          fn: onDelete, danger: true },
      ].map(({ icon, label, fn, danger }) => (
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
        {asset.aiEnhanced && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
              <Icon name="auto_awesome" className="text-xs" />AI Enhanced
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
            <CardMenu open={menuOpen} onClose={() => setMenuOpen(false)} onEdit={onEdit} onReuse={onReuse} onAIEnhance={onAIEnhance} onDelete={onDelete} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            <Icon name="school" className="text-sm" />{asset.course}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded capitalize">
            <Icon name="label" className="text-sm" />{asset.type}
          </div>
        </div>
        <div className={`${e.bg} rounded-lg p-2.5 mb-5`}>
          <p className={`text-[11px] font-semibold ${e.tc} flex items-center gap-1.5`}>
            <Icon name={e.icon} className={`text-sm ${e.ic}`} />{e.text}
          </p>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <button onClick={onReuse} className="flex items-center justify-center gap-1 py-2 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4]">
            <Icon name="refresh" className="text-base" />Reuse
          </button>
          <button onClick={onEdit} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
            <Icon name="edit" className="text-base" />Edit
          </button>
          <button onClick={onAIEnhance} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
            <Icon name="auto_awesome" className="text-base text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetRow({ asset, selected, onSelect, onPreview, onReuse, onEdit, onDelete, onAIEnhance }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { enhancement: e } = asset;
  return (
    <div className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center gap-4 p-4 ${selected ? "border-[#137fec] ring-2 ring-[#137fec]/20" : "border-slate-200"}`}>
      <input type="checkbox" checked={selected} onChange={onSelect} className="accent-[#137fec] w-4 h-4 flex-shrink-0" onClick={ev => ev.stopPropagation()} />
      <div className="relative rounded-lg overflow-hidden flex-shrink-0 w-36 h-[80px] cursor-pointer" onClick={onPreview}>
        <img src={asset.thumb} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-1.5 right-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
          <Icon name={asset.badgeIcon} className="text-[10px]" />{asset.badgeText}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 onClick={onPreview} className="text-sm font-bold text-slate-900 group-hover:text-[#137fec] transition-colors truncate cursor-pointer">{asset.title}</h3>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <Icon name="school" className="text-xs" />{asset.course}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
            {asset.type}
          </span>
        </div>
        <div className={`${e.bg} rounded-lg px-2 py-1 mt-2 inline-flex items-center gap-1`}>
          <Icon name={e.icon} className={`text-xs ${e.ic}`} />
          <span className={`text-[11px] font-semibold ${e.tc}`}>{e.text}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onReuse} className="flex items-center gap-1 px-3 py-1.5 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4]">
          <Icon name="refresh" className="text-sm" />Reuse
        </button>
        <button onClick={onEdit} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
          <Icon name="edit" className="text-sm" />Edit
        </button>
        <button onClick={onAIEnhance} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
          <Icon name="auto_awesome" className="text-sm text-amber-500" />
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)} className="text-slate-400 hover:text-slate-600">
            <Icon name="more_vert" />
          </button>
          <CardMenu open={menuOpen} onClose={() => setMenuOpen(false)} onEdit={onEdit} onReuse={onReuse} onAIEnhance={onAIEnhance} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function TrainerContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionParam  = searchParams.get("action");
  const studentParam = searchParams.get("student");

  const userName = localStorage.getItem("userName") || "Trainer";
  const userEmail = localStorage.getItem("userEmail") || "";

  // ── Real data state ───────────────────────────────────────────
  const [assets, setAssets]       = useState([]);
  const [courses, setCourses]     = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── UI state ──────────────────────────────────────────────────
  const [activeCategory,    setActiveCategory]    = useState("All Assets");
  const [activeCollection,  setActiveCollection]  = useState(null);
  const [viewMode,          setViewMode]          = useState("grid");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedIds,       setSelectedIds]       = useState([]);
  const [drawerFilters,     setDrawerFilters]     = useState({ assetType: "All", courses: [] });

  const [showUpload,         setShowUpload]         = useState(false);
  const [showFilters,        setShowFilters]        = useState(false);
  const [detailAsset,        setDetailAsset]        = useState(null);
  const [reuseAsset,         setReuseAsset]         = useState(null);
  const [deleteAsset,        setDeleteAsset]        = useState(null);
  const [showBulkAdd,        setShowBulkAdd]        = useState(false);
  const [showBulkDelete,     setShowBulkDelete]     = useState(false);
  const [showNewCollection,  setShowNewCollection]  = useState(false);

  // ── Fetch real data ───────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all trainer courses, then fetch modules+lessons for each
        const coursesRes = await apiClient.get("/api/v1/trainer/courses");
        const courseList = coursesRes.data || [];
        setCourses(courseList);

        // Build collections from real courses
        setCollections(courseList.map(c => ({ id: `course-${c.id}`, label: c.title })));

        // For each course, fetch modules (which include lessons)
        const allAssets = [];
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
            } catch {
              // skip courses that fail
            }
          })
        );
        setAssets(allAssets);
      } catch (err) {
        setError("Failed to load content library");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const handleEdit      = (asset) => navigate(`/trainer/courses/${asset.courseId}`);
  const handleReuse     = (asset) => { setReuseAsset(asset); setDetailAsset(null); };
  const handleDelete    = (asset) => { setDeleteAsset(asset); setDetailAsset(null); };
  const handlePreview   = (asset) => setDetailAsset(asset);
  const handleAIEnhance = (asset) => navigate(`/trainer/ai-studio?asset=${asset.id}`);

  const handleReuseConfirm = (courseId) => {
    setReuseAsset(null);
    navigate(`/trainer/courses/${courseId}`);
  };

  const handleDeleteConfirm = async () => {
    try {
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
      await Promise.all(selectedIds.map(id => apiClient.delete(`/api/v1/trainer/lessons/${id}`)));
      setAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
      clearSelection();
    } catch {
      alert("Some deletes failed");
    } finally {
      setShowBulkDelete(false);
    }
  };

  const handleBulkAddConfirm = (courseId) => {
    setShowBulkAdd(false);
    clearSelection();
    navigate(`/trainer/courses/${courseId}`);
  };

  const handleNewCollection = (name) => {
    const id = `custom-${Date.now()}`;
    setCollections(prev => [...prev, { id, label: name }]);
  };

  // ── Filtering ─────────────────────────────────────────────────
  const courseNames = [...new Set(assets.map(a => a.course))];

  const filtered = assets.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
      || a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const catMap = { "All Assets": true, "Video Lessons": a.type === "video", "Audio Content": a.type === "audio", "Documents": a.type === "document" };
    const matchCat = catMap[activeCategory] ?? true;
    const matchColl = activeCollection ? a.collectionId === activeCollection : true;
    const typeMap = { "All": true, "Videos": a.type === "video", "Audio": a.type === "audio", "Documents": a.type === "document" };
    const matchType = typeMap[drawerFilters.assetType] ?? true;
    const matchCourse = drawerFilters.courses.length === 0 || drawerFilters.courses.includes(a.course);
    return matchSearch && matchCat && matchColl && matchType && matchCourse;
  });

  const categories = [
    { icon: "grid_view",   label: "All Assets" },
    { icon: "videocam",    label: "Video Lessons" },
    { icon: "mic",         label: "Audio Content" },
    { icon: "description", label: "Documents" },
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

      {showUpload    && <UploadModal courses={courses} onClose={() => setShowUpload(false)} onGoToUploadPage={() => { setShowUpload(false); navigate("/trainer/dashboard"); }} />}
      <FilterDrawer   open={showFilters} onClose={() => setShowFilters(false)} onApply={setDrawerFilters} courseNames={courseNames} />
      {detailAsset   && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} onEdit={() => { setDetailAsset(null); handleEdit(detailAsset); }} onReuse={() => handleReuse(detailAsset)} onAIEnhance={() => { setDetailAsset(null); handleAIEnhance(detailAsset); }} />}
      {reuseAsset    && <ReuseModal asset={reuseAsset} courses={courses} onClose={() => setReuseAsset(null)} onConfirm={handleReuseConfirm} />}
      {deleteAsset   && <DeleteModal asset={deleteAsset} onClose={() => setDeleteAsset(null)} onConfirm={handleDeleteConfirm} />}
      {showBulkAdd   && <BulkAddModal count={selectedIds.length} courses={courses} onClose={() => setShowBulkAdd(false)} onConfirm={handleBulkAddConfirm} />}
      {showBulkDelete && <BulkDeleteModal count={selectedIds.length} onClose={() => setShowBulkDelete(false)} onConfirm={handleBulkDeleteConfirm} />}
      {showNewCollection && <NewCollectionModal onClose={() => setShowNewCollection(false)} onConfirm={handleNewCollection} />}

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
                    placeholder="Search your assets..." />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Icon name="close" className="text-base" />
                    </button>
                  )}
                </div>
                <button onClick={() => setShowUpload(true)}
                  className="bg-[#137fec] hover:bg-[#0f6fd4] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm flex-shrink-0">
                  <Icon name="upload" className="text-lg" />
                  <span className="hidden sm:inline">Upload New Asset</span>
                </button>
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
                            <Icon name={icon} className="text-[20px] flex-shrink-0" />{label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collections</h3>
                      <button onClick={() => setShowNewCollection(true)} className="text-[#137fec] hover:text-[#0f6fd4]">
                        <Icon name="add" className="text-base" />
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {collections.map(c => (
                        <li key={c.id}>
                          <button onClick={() => { setActiveCollection(c.id); setActiveCategory("All Assets"); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeCollection === c.id ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}>
                            <Icon name="folder" className="text-[20px] flex-shrink-0" />
                            <span className="truncate">{c.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Storage */}
                  <div className="p-4 rounded-xl bg-[#137fec]/5 border border-[#137fec]/10">
                    <p className="text-xs font-bold text-[#137fec] uppercase mb-2">Total Assets</p>
                    <p className="text-2xl font-black text-slate-900">{assets.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">across {courses.length} course{courses.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <button onClick={() => navigate("/trainer/dashboard")} className="hover:text-[#137fec]">Dashboard</button>
                      <Icon name="chevron_right" className="text-xs" />
                      <span className="text-slate-900 font-medium">Content Library</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Library</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                      {filtered.length} asset{filtered.length !== 1 ? "s" : ""} found
                    </p>
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

                {/* Bulk action bar */}
                {selectedIds.length > 0 && (
                  <div className="mb-6 flex items-center gap-3 p-3 bg-[#137fec]/5 border border-[#137fec]/20 rounded-xl">
                    <span className="text-sm font-bold text-[#137fec]">{selectedIds.length} selected</span>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setShowBulkAdd(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4]">
                        <Icon name="add" className="text-sm" />Add to Course
                      </button>
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

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Icon name="search_off" className="text-6xl text-slate-200 mb-4" />
                    <p className="text-lg font-bold text-slate-400">
                      {assets.length === 0 ? "No lessons found in your courses" : "No assets match your filters"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {assets.length === 0 ? "Create courses and add lessons to see them here" : "Try adjusting your search or filters"}
                    </p>
                    {assets.length === 0 ? (
                      <button onClick={() => navigate("/trainer/dashboard")}
                        className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">
                        Go to Dashboard
                      </button>
                    ) : (
                      <button onClick={() => { setSearchQuery(""); setDrawerFilters({ assetType: "All", courses: [] }); }}
                        className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">
                        Clear Filters
                      </button>
                    )}
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

          {/* Mobile FAB */}
          <button onClick={() => setShowUpload(true)}
            className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-[#137fec] text-white rounded-full shadow-xl flex items-center justify-center z-50">
            <Icon name="add" className="text-3xl" />
          </button>
        </div>
      </div>
    </>
  );
}