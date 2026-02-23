import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";

/* ─────────────────────────────────────────────
   CUSTOM CURSOR HOOK
───────────────────────────────────────────── */
function useCustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => setIsHovered(!!e.target.closest("button,a,input,select,[role='button']"));
    const down = () => setIsClicked(true);
    const up = () => setIsClicked(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);
  return { pos, isHovered, isClicked };
}

/* ─────────────────────────────────────────────
   ICON
───────────────────────────────────────────── */
const Icon = ({ name, className = "" }) => (
  <span
    className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24" }}
  >
    {name}
  </span>
);

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const COURSES = [
  { id: "python-101", title: "Python 101" },
  { id: "data-science", title: "Data Science Fundamentals" },
  { id: "digital-mktg", title: "Digital Marketing" },
  { id: "soft-skills", title: "Soft Skills" },
];

const ASSETS = [
  {
    id: 1,
    title: "Advanced Quantum Physics",
    badgeIcon: "videocam",
    badgeText: "14:20",
    aiEnhanced: true,
    views: "1.2k views",
    course: "Science 101",
    courseId: "science-101",
    usedInLessons: 3,
    uploadedAt: "today",
    enhancement: { icon: "mic", text: "🎤 Audio summary available", bg: "bg-blue-600/5 border border-blue-600/10", tc: "text-[#137fec]", ic: "text-[#137fec]" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuATbpDj90u0HKuGhFyX8mR8zmiQoBu_BmiYCv_oSQ5wv7_p-Jog12A5LDh6HtcVld536dP_b0eBYzSxWwRqsH1DmwZQ39PNiNPcokAHIDGtFQsy5jk2ODCU1lDXqadvsbT-OD3hUoPWVVw0J4rfpbEtM1MmLrTrvYgpgei18AgZlWQN7oBKh8GffrWLOLSnnIDC-57ZqY4-ufuxGsB5nXGh03qHAWDROUTrrN0lyEF_TgdXHqbseIsk_fDhBfp7PVK3fbCt5Fu4Wck",
  },
  {
    id: 2,
    title: "SEO Mastery 2024",
    badgeIcon: "description",
    badgeText: "24 PAGES",
    aiEnhanced: false,
    views: "850 views",
    course: "Digital Mktg",
    courseId: "digital-mktg",
    usedInLessons: 1,
    uploadedAt: "today",
    enhancement: { icon: "description", text: "📄 AI Transcript generated", bg: "bg-amber-500/5 border border-amber-500/10", tc: "text-amber-600", ic: "text-amber-500" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYk50c_qUYXe4wEZqWUZTzBj_GUoe1TiMsbJ9KEmCfgj1za66rgxBNx_eAzHiX1kLqhGh89yYFrKF7xTDGd4312WI0aIL3_x8WsKXuOxXrQqS4aIM9jtd-63rBPMsGWY8vRsy8y6RH4dRmfhaswqWm6_EotjYk0ZWFkuwsEWRLTY42GLuD-f-od5LPyGQt_9Ftx1kVqvSEWl0-6KZ148fu7ElD4flrT5Y1xR0ai6iro8JSBFJns52s264liiO5Qo3y27fYz8lMwy0",
  },
  {
    id: 3,
    title: "Public Speaking Workshop",
    badgeIcon: "mic",
    badgeText: "45:00",
    aiEnhanced: false,
    views: "2.1k views",
    course: "Soft Skills",
    courseId: "soft-skills",
    usedInLessons: 2,
    uploadedAt: "yesterday",
    enhancement: { icon: "quiz", text: "✨ AI Quiz ready", bg: "bg-emerald-500/5 border border-emerald-500/10", tc: "text-emerald-600", ic: "text-emerald-500" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVFRj82yoxsx-H-OGZWRh_N7TKpJPZ1khMRHzrYpushZZXDJjRes1oQ0exbsySAXfQWXVqwWOiaonu6uIFweOlW2u_-LQDfKLbKDXkshx1C0q7A14o5hiYM6fSdb6r07FDKMOmXcgPS50Nwzmx4mqXFn2kBdnGxNNrLseYlHpY2uq-0j7yKYR_HM6VI8ntwvQRrFtmnXrfwouHcuUGNkwftCF9a1e0C3_LnqpCERh6_2VoIdjR58Bnaiq1pAxpL9NiWWSQ62tLVC0",
  },
  {
    id: 4,
    title: "Python for Beginners",
    badgeIcon: "videocam",
    badgeText: "32:15",
    aiEnhanced: false,
    views: "3.4k views",
    course: "CS Intro",
    courseId: "python-101",
    usedInLessons: 5,
    uploadedAt: "today",
    enhancement: { icon: "mic", text: "🎤 Audio summary available", bg: "bg-blue-600/5 border border-blue-600/10", tc: "text-[#137fec]", ic: "text-[#137fec]" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDw9fFwuw73f-0j1xDMPxkMfUEZntenqgon2gO7gbueXjWoo4euTVg44ZsxzGPM45DediUi-iQMG26H9kPSyGQem6a9etHleq6uFr4npaUe9tkNQHhiJFEtWDgftDzmdq_KqJddx9X-IEDHe62ErlBo7NLo3_1CH1K6uVyXpTNPNMhjeAESkhp4edZ8lmkieg7zZwe69WkQOHvm37EbUHQT-HasgE7Vcuhsd3pq1maU8IaD9mmsf9ghZorWy5ECJtDp131t-JxuX1o",
  },
  {
    id: 5,
    title: "UX Design Principles",
    badgeIcon: "description",
    badgeText: "12 PAGES",
    aiEnhanced: false,
    views: "920 views",
    course: "Design Lab",
    courseId: "data-science",
    usedInLessons: 2,
    uploadedAt: "yesterday",
    enhancement: { icon: "description", text: "📄 AI Transcript generated", bg: "bg-amber-500/5 border border-amber-500/10", tc: "text-amber-600", ic: "text-amber-500" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrV1_eO6N_asLJDALhB9mcEP9DoBiEUfRaP6iQ6o3MgzBYLvogjLrKu4RpSrSNzsMG6WH14R1t4kJ2eZ8emIFVFimbwmcinQof2WfjrsTSqtzBbDmae81po-lC1TdEzg7CvRBc_Gzyrf2OlqlFWf9UL4YXPV8zGLJOj78Rrh4SShwMlJkK6WKVpz41Aq1AX5GyyeLvmIQJicE9nqpaKiFqAZ9T59xkwGmsEGfOFPzzxTFanV_xX93rZt2syGa0i5Eg8Edmc4ZnAA",
  },
  {
    id: 6,
    title: "History of Renaissance Art",
    badgeIcon: "videocam",
    badgeText: "1:05:00",
    aiEnhanced: false,
    views: "450 views",
    course: "Humanities",
    courseId: "data-science",
    usedInLessons: 1,
    uploadedAt: "yesterday",
    enhancement: { icon: "quiz", text: "✨ AI Quiz ready", bg: "bg-emerald-500/5 border border-emerald-500/10", tc: "text-emerald-600", ic: "text-emerald-500" },
    thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcvMwpaC2YLCdCzbj5CPWvU3MKTzLCR4lf3c2sQSN8eoZE6NywRYkOMy-aPgtoahO2lezSIOwtyclN6omjwypZLekwMWlYkJ7k-i55_zCsyJTOEAjKKvsokw1fljoSQIkgNL8zYfKU2y2BB2S9uV-B62FZfOonyZ6fTlERK0qIT-BpzccUXvGTm2NWYoMEFlBwVNPK1HBMHlXRGpv_bIB-T08qHnXIKlt6T3CWd7gzujMKGNqr85s4vVgSttkl0aoVfP4TC0ksOig",
  },
];

const INITIAL_COLLECTIONS = [
  { id: "python-materials", label: "Python Course Materials" },
  { id: "data-science-resources", label: "Data Science Resources" },
  { id: "ai-generated", label: "AI Generated Content" },
];

/* ─────────────────────────────────────────────
   ASSET DETAIL MODAL — stays on Page 18
   Click title/thumbnail → detailed view
───────────────────────────────────────────── */
function AssetDetailModal({ asset, onClose, onEdit, onReuse, onAIEnhance, onViewInCourses }) {
  if (!asset) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 truncate pr-4">{asset.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <Icon name="close" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <img src={asset.thumb} alt={asset.title} className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Views</p>
              <p className="text-lg font-black text-slate-900">{asset.views}</p>
            </div>
            {/* Spec §6: Click "Used in X lessons" → View in courses → Page 14 */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Used In</p>
              <p
                onClick={onViewInCourses}
                className="text-lg font-black text-slate-900 cursor-pointer hover:text-[#137fec] transition-colors flex items-center gap-1"
              >
                {asset.usedInLessons} lessons
                <Icon name="open_in_new" className="text-sm text-[#137fec]" />
              </p>
              <p
                onClick={onViewInCourses}
                className="text-[10px] text-[#137fec] font-semibold cursor-pointer hover:underline mt-0.5"
              >
                View in courses →
              </p>
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
          {/* Spec §3: View in AI Studio button for AI Enhanced content */}
          {asset.aiEnhanced && (
            <button
              onClick={onAIEnhance}
              className="w-full flex items-center justify-center gap-2 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <Icon name="auto_awesome" className="text-base" />
              View in AI Studio
            </button>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onReuse} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">
            Reuse
          </button>
          <button onClick={onEdit} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
            Edit
          </button>
          <button onClick={onAIEnhance} className="flex-1 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
            <Icon name="auto_awesome" className="text-base" /> AI Enhance
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REUSE MODAL — course/lesson selector
   After selection → Course Management (Page 14)
───────────────────────────────────────────── */
function ReuseModal({ asset, onClose, onConfirm }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleConfirm = () => {
    if (!selectedCourse) return;
    setSuccessMsg(true);
    setTimeout(() => {
      onConfirm(selectedCourse);
    }, 900);
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
              <div className="space-y-2">
                {COURSES.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50 transition-colors">
                    <input
                      type="radio"
                      name="course-select"
                      value={c.id}
                      checked={selectedCourse === c.id}
                      onChange={() => setSelectedCourse(c.id)}
                      className="accent-[#137fec]"
                    />
                    <span className="text-sm font-medium text-slate-700">{c.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
              <button
                onClick={handleConfirm}
                disabled={!selectedCourse}
                className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Course
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DELETE CONFIRM MODAL — stays on Page 18
───────────────────────────────────────────── */
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
              <strong>{asset.title}</strong> is used in <strong>{asset.usedInLessons} lesson{asset.usedInLessons !== 1 ? "s" : ""}</strong>. Deleting it will remove it from all courses.
            </p>
          </div>
          <p className="text-sm text-slate-500">Are you sure you want to permanently delete this content? This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BULK ADD TO COURSE MODAL
   After selection → Course Management (Page 14)
───────────────────────────────────────────── */
function BulkAddModal({ count, onClose, onConfirm }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Add {count} Item{count !== 1 ? "s" : ""} to Course</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-3">
          {COURSES.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50 transition-colors">
              <input
                type="radio"
                name="bulk-course"
                value={c.id}
                checked={selectedCourse === c.id}
                onChange={() => setSelectedCourse(c.id)}
                className="accent-[#137fec]"
              />
              <span className="text-sm font-medium text-slate-700">{c.title}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button
            onClick={() => { if (selectedCourse) onConfirm(selectedCourse); }}
            disabled={!selectedCourse}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to Course
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BULK DELETE CONFIRM MODAL — stays on Page 18
───────────────────────────────────────────── */
function BulkDeleteModal({ count, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-rose-600">Delete {count} Item{count !== 1 ? "s" : ""}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>{count} selected item{count !== 1 ? "s" : ""}</strong>? This will remove them from all courses they're used in.
          </p>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors">Delete All</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NEW COLLECTION MODAL — stays on Page 18
───────────────────────────────────────────── */
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Collection Name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && name.trim()) { onConfirm(name.trim()); onClose(); }}}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30"
            placeholder="e.g. Python Course Materials"
          />
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button
            onClick={() => { if (name.trim()) { onConfirm(name.trim()); onClose(); }}}
            className="flex-1 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors"
          >Create</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEND TO STUDENT MODAL — pre-opened via ?action=send
   Stays on Page 18 with success
───────────────────────────────────────────── */
function SendToStudentModal({ studentId, onClose }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [sent, setSent] = useState(false);

  const toggleAsset = (id) => setSelectedAssets(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSend = () => {
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">Send Resources to Student</h3>
            {studentId && <p className="text-xs text-slate-500 mt-0.5">Student ID: {studentId}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="check_circle" className="text-green-600 text-2xl" />
            </div>
            <p className="font-bold text-slate-900">Resources Sent!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              <p className="text-sm text-slate-600 mb-3">Select content to send:</p>
              {ASSETS.map(a => (
                <label key={a.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-[#137fec]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(a.id)}
                    onChange={() => toggleAsset(a.id)}
                    className="accent-[#137fec]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.course}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
              <button
                onClick={handleSend}
                disabled={selectedAssets.length === 0}
                className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send {selectedAssets.length > 0 ? `(${selectedAssets.length})` : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   UPLOAD MODAL
───────────────────────────────────────────── */
function UploadModal({ onClose, onGoToUploadPage }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Upload New Asset</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-[#137fec] bg-blue-50" : "border-slate-200 hover:border-[#137fec]/50"}`}
          >
            <Icon name="cloud_upload" className="text-5xl text-slate-300 mb-3 block" />
            <p className="text-sm font-semibold text-slate-700">Drag & drop your files here</p>
            <p className="text-xs text-slate-400 mt-1">Supports MP4, MP3, PDF, DOCX up to 500MB</p>
            <button
              onClick={onGoToUploadPage}
              className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors"
            >
              Browse Files
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Asset Title</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30" placeholder="Enter title..." />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Course</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30">
              <option>Science 101</option><option>Digital Mktg</option><option>Soft Skills</option><option>CS Intro</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onGoToUploadPage} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors shadow-sm">Upload Asset</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FILTER DRAWER
───────────────────────────────────────────── */
function FilterDrawer({ open, onClose }) {
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
          {[
            { label: "Asset Type", type: "radio", options: ["All", "Videos", "Audio", "Documents"] },
            { label: "Enhancement", type: "checkbox", options: ["AI Enhanced", "AI Quiz Ready", "AI Transcript"] },
            { label: "Course", type: "checkbox", options: ["Science 101", "Digital Mktg", "Soft Skills", "CS Intro", "Design Lab", "Humanities"] },
          ].map(({ label, type, options }) => (
            <div key={label}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type={type} name={label} defaultChecked={i === 0 && type === "radio"} className="accent-[#137fec]" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Reset</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD DROPDOWN
───────────────────────────────────────────── */
function CardMenu({ open, onClose, onEdit, onReuse, onAIEnhance, onDelete }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
      {[
        { icon: "edit", label: "Edit", fn: onEdit },
        { icon: "refresh", label: "Reuse in Course", fn: onReuse },
        { icon: "auto_awesome", label: "AI Enhance", fn: onAIEnhance },
        { icon: "download", label: "Download", fn: onClose },
        { icon: "delete", label: "Delete", fn: onDelete, danger: true },
      ].map(({ icon, label, fn, danger }) => (
        <button key={label} onClick={() => { fn?.(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50 ${danger ? "text-rose-600" : "text-slate-700"}`}>
          <Icon name={icon} className={`text-base ${danger ? "text-rose-400" : "text-slate-400"}`} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   GRID CARD
───────────────────────────────────────────── */
function AssetCard({ asset, selected, onSelect, onPreview, onReuse, onEdit, onDelete, onAIEnhance }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { enhancement: e } = asset;
  return (
    <div className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${selected ? "border-[#137fec] ring-2 ring-[#137fec]/20" : "border-slate-200"}`}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div className="absolute top-3 left-3 z-10" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="accent-[#137fec] w-4 h-4"
          />
        </div>
        <img
          src={asset.thumb}
          alt={asset.title}
          onClick={onPreview}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Icon name={asset.badgeIcon} className="text-xs" />{asset.badgeText}
          </div>
        </div>
        {asset.aiEnhanced && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Icon name="auto_awesome" className="text-xs" />AI Enhanced
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3
            onClick={onPreview}
            className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#137fec] transition-colors flex-1 cursor-pointer"
          >
            {asset.title}
          </h3>
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(p => !p)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icon name="more_vert" />
            </button>
            <CardMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onEdit={onEdit}
              onReuse={onReuse}
              onAIEnhance={onAIEnhance}
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            <Icon name="visibility" className="text-sm" />{asset.views}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            <Icon name="history" className="text-sm" />{asset.course}
          </div>
        </div>
        <div className={`${e.bg} rounded-lg p-2.5 mb-5`}>
          <p className={`text-[11px] font-semibold ${e.tc} flex items-center gap-1.5`}>
            <Icon name={e.icon} className={`text-sm ${e.ic}`} />{e.text}
          </p>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <button onClick={onReuse} className="flex items-center justify-center gap-1 py-2 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4] transition-colors shadow-sm">
            <Icon name="refresh" className="text-base" />Reuse
          </button>
          <button onClick={onEdit} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
            <Icon name="edit" className="text-base" />Edit
          </button>
          {asset.aiEnhanced ? (
            // Spec §3: AI Enhanced items show Regenerate → AI Studio (Page 16)
            <button onClick={onAIEnhance} className="flex items-center justify-center gap-1 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-200">
              <Icon name="autorenew" className="text-base text-amber-500" />
            </button>
          ) : (
            <button onClick={onAIEnhance} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
              <Icon name="auto_awesome" className="text-base text-amber-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIST ROW
───────────────────────────────────────────── */
function AssetRow({ asset, selected, onSelect, onPreview, onReuse, onEdit, onDelete, onAIEnhance }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { enhancement: e } = asset;
  return (
    <div className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 p-4 ${selected ? "border-[#137fec] ring-2 ring-[#137fec]/20" : "border-slate-200"}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="accent-[#137fec] w-4 h-4 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      />
      <div className="relative rounded-lg overflow-hidden flex-shrink-0 w-36 h-[80px] cursor-pointer" onClick={onPreview}>
        <img src={asset.thumb} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-1.5 right-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
          <Icon name={asset.badgeIcon} className="text-[10px]" />{asset.badgeText}
        </div>
        {asset.aiEnhanced && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
              <Icon name="auto_awesome" className="text-[10px]" />AI Enhanced
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          onClick={onPreview}
          className="text-sm font-bold text-slate-900 group-hover:text-[#137fec] transition-colors truncate cursor-pointer"
        >
          {asset.title}
        </h3>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <Icon name="visibility" className="text-xs" />{asset.views}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <Icon name="history" className="text-xs" />{asset.course}
          </span>
        </div>
        <div className={`${e.bg} rounded-lg px-2 py-1 mt-2 inline-flex items-center gap-1`}>
          <Icon name={e.icon} className={`text-xs ${e.ic}`} />
          <span className={`text-[11px] font-semibold ${e.tc}`}>{e.text}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onReuse} className="flex items-center gap-1 px-3 py-1.5 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4] transition-colors">
          <Icon name="refresh" className="text-sm" />Reuse
        </button>
        <button onClick={onEdit} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
          <Icon name="edit" className="text-sm" />Edit
        </button>
        {asset.aiEnhanced ? (
          // Spec §3: AI Enhanced items show Regenerate → AI Studio (Page 16)
          <button onClick={onAIEnhance} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-200 flex items-center gap-1">
            <Icon name="autorenew" className="text-sm text-amber-500" />
          </button>
        ) : (
          <button onClick={onAIEnhance} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
            <Icon name="auto_awesome" className="text-sm text-amber-500" />
          </button>
        )}
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="more_vert" />
          </button>
          <CardMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onEdit={onEdit}
            onReuse={onReuse}
            onAIEnhance={onAIEnhance}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function TrainerContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const actionParam  = searchParams.get("action");
  const studentParam = searchParams.get("student");
  const filterParam  = searchParams.get("filter");

  const [activeNav, setActiveNav] = useState("Content Library");
  const [activeCategory, setActiveCategory] = useState("All Assets");
  const [activeEnhancement, setActiveEnhancement] = useState(null);
  const [activeCollection, setActiveCollection] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [assets, setAssets] = useState(ASSETS);
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [selectedIds, setSelectedIds] = useState([]);

  const [showUpload, setShowUpload]               = useState(false);
  const [showFilters, setShowFilters]             = useState(false);
  const [detailAsset, setDetailAsset]             = useState(null);
  const [reuseAsset, setReuseAsset]               = useState(null);
  const [deleteAsset, setDeleteAsset]             = useState(null);
  const [showBulkAdd, setShowBulkAdd]             = useState(false);
  const [showBulkDelete, setShowBulkDelete]       = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showSendToStudent, setShowSendToStudent] = useState(false);

  useEffect(() => {
    if (actionParam === "send") setShowSendToStudent(true);
    if (filterParam === "recent") {
      setSearchQuery("");
      setActiveCategory("All Assets");
    }
  }, [actionParam, filterParam]);

  const handleNavClick = (link) => {
    setActiveNav(link);
    switch (link) {
      case "Dashboard": navigate("/dashboard/trainer"); break;
      case "Content Library": break;
      case "Courses": navigate("/dashboard/trainer"); break;
      case "Analytics": navigate("/trainer/analytics"); break;
      default: break;
    }
  };

  const handleEdit = (asset) => navigate(`/trainer/courses/${asset.courseId}/upload?lesson=${asset.id}`);

  const handleReuse = (asset) => {
    setReuseAsset(asset);
    setDetailAsset(null);
  };

  const handleReuseConfirm = (courseId) => {
    setReuseAsset(null);
    navigate(`/trainer/courses/${courseId}`);
  };

  const handleDelete = (asset) => {
    setDeleteAsset(asset);
    setDetailAsset(null);
  };

  const handleDeleteConfirm = () => {
    setAssets(prev => prev.filter(a => a.id !== deleteAsset.id));
    setSelectedIds(prev => prev.filter(id => id !== deleteAsset.id));
    setDeleteAsset(null);
  };

  const handleAIEnhance = (asset) => navigate(`/trainer/ai-studio?asset=${asset.id}`);
  const handlePreview = (asset) => setDetailAsset(asset);

  // Spec §6: "View in courses" → Course Management (Page 14)
  const handleViewInCourses = (asset) => {
    setDetailAsset(null);
    navigate(`/trainer/courses/${asset.courseId}`);
  };

  const toggleSelect = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const clearSelection = () => setSelectedIds([]);

  const handleBulkAddConfirm = (courseId) => {
    setShowBulkAdd(false);
    clearSelection();
    navigate(`/trainer/courses/${courseId}`);
  };

  const handleBulkDeleteConfirm = () => {
    setAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
    clearSelection();
    setShowBulkDelete(false);
  };

  const handleNewCollection = (name) => {
    setCollections(prev => [...prev, { id: Date.now().toString(), label: name }]);
  };

  const handleGoToUploadPage = () => navigate("/trainer/courses/standalone/upload");

  const filtered = assets.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecent = filterParam === "recent" ? a.uploadedAt === "today" : true;
    return matchesSearch && matchesRecent;
  });

  const navLinks = ["Dashboard", "Content Library", "Courses", "Analytics"];
  const categories = [
    { icon: "grid_view", label: "All Assets" },
    { icon: "videocam", label: "Video Lessons" },
    { icon: "mic", label: "Audio Content" },
    { icon: "description", label: "Documents" },
  ];
  const enhancements = [
    { icon: "auto_awesome", label: "AI Enhanced", iconColor: "text-amber-500" },
    { icon: "quiz", label: "AI Quizzes Ready", iconColor: "text-emerald-500" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{font-family:'Lexend',sans-serif;background:#f6f7f8;margin:0;}
        .line-clamp-1{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;}
        .scrollbar-thin::-webkit-scrollbar{width:4px;}
        .scrollbar-thin::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
      `}</style>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onGoToUploadPage={() => { setShowUpload(false); handleGoToUploadPage(); }}
        />
      )}
      <FilterDrawer open={showFilters} onClose={() => setShowFilters(false)} />
      {detailAsset && (
        <AssetDetailModal
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onEdit={() => { setDetailAsset(null); handleEdit(detailAsset); }}
          onReuse={() => handleReuse(detailAsset)}
          onAIEnhance={() => { setDetailAsset(null); handleAIEnhance(detailAsset); }}
          onViewInCourses={() => handleViewInCourses(detailAsset)}
        />
      )}
      {reuseAsset && (
        <ReuseModal
          asset={reuseAsset}
          onClose={() => setReuseAsset(null)}
          onConfirm={handleReuseConfirm}
        />
      )}
      {deleteAsset && (
        <DeleteModal
          asset={deleteAsset}
          onClose={() => setDeleteAsset(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showBulkAdd && (
        <BulkAddModal
          count={selectedIds.length}
          onClose={() => setShowBulkAdd(false)}
          onConfirm={handleBulkAddConfirm}
        />
      )}
      {showBulkDelete && (
        <BulkDeleteModal
          count={selectedIds.length}
          onClose={() => setShowBulkDelete(false)}
          onConfirm={handleBulkDeleteConfirm}
        />
      )}
      {showNewCollection && (
        <NewCollectionModal
          onClose={() => setShowNewCollection(false)}
          onConfirm={handleNewCollection}
        />
      )}
      {showSendToStudent && (
        <SendToStudentModal
          studentId={studentParam}
          onClose={() => setShowSendToStudent(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Lexend',sans-serif", backgroundColor: "#f6f7f8" }}>
        <TrainerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* TOP NAV */}
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
              <div className="flex items-center gap-8 flex-shrink-0">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate("/dashboard/trainer")}
                >
                  <div className="bg-[#137fec] p-1.5 rounded-lg text-white flex items-center justify-center">
                    <Icon name="school" className="text-xl" />
                  </div>
                  <span className="text-slate-900 text-xl font-bold tracking-tight">LMS Trainer</span>
                </div>

              </div>
              <div className="flex flex-1 items-center justify-end gap-4">
                <div className="relative w-full max-w-md hidden md:block">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 rounded-lg pl-10 pr-10 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 placeholder:text-slate-500"
                    placeholder="Search your assets..."
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Icon name="close" className="text-base" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => navigate("/trainer/courses/standalone/upload")}
                  className="bg-[#137fec] hover:bg-[#0f6fd4] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm flex-shrink-0"
                >
                  <Icon name="upload" className="text-lg" />
                  <span className="hidden sm:inline">Upload New Asset</span>
                </button>
                <TrainerProfileDropdown name="Dr. Smith" role="Lead Trainer" />
              </div>
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-6 flex gap-8">

              {/* SIDEBAR */}
              <aside className="w-64 flex-shrink-0 hidden xl:block">
                <div className="flex flex-col gap-8 sticky top-24">
                  {/* Categories */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Asset Categories</h3>
                    <ul className="space-y-1">
                      {categories.map(({ icon, label }) => (
                        <li key={label}>
                          <button
                            onClick={() => { setActiveCategory(label); setActiveCollection(null); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeCategory === label && !activeCollection ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
                          >
                            <Icon name={icon} className="text-[20px] flex-shrink-0" />
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enhancements */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enhancements</h3>
                    <ul className="space-y-1">
                      {enhancements.map(({ icon, label, iconColor }) => (
                        <li key={label}>
                          <button
                            onClick={() => setActiveEnhancement(activeEnhancement === label ? null : label)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeEnhancement === label ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
                          >
                            <Icon name={icon} className={`text-[20px] flex-shrink-0 ${iconColor}`} />
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {activeEnhancement === "AI Enhanced" && (
                      <button
                        onClick={() => navigate("/trainer/ai-studio")}
                        className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-[#137fec]/10 text-[#137fec] rounded-lg text-xs font-bold hover:bg-[#137fec]/20 transition-colors"
                      >
                        <Icon name="auto_awesome" className="text-base" />
                        View in AI Studio →
                      </button>
                    )}
                  </div>

                  {/* Collections */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collections</h3>
                      <button
                        onClick={() => setShowNewCollection(true)}
                        className="text-[#137fec] hover:text-[#0f6fd4] transition-colors"
                      >
                        <Icon name="add" className="text-base" />
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {collections.map(c => (
                        <li key={c.id}>
                          <button
                            onClick={() => { setActiveCollection(c.id); setActiveCategory("All Assets"); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeCollection === c.id ? "bg-[#137fec]/10 text-[#137fec] font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
                          >
                            <Icon name="folder" className="text-[20px] flex-shrink-0" />
                            <span className="truncate">{c.label}</span>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={() => setShowNewCollection(true)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-left"
                        >
                          <Icon name="add" className="text-[20px] flex-shrink-0" />
                          New Collection
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Storage */}
                  <div className="p-4 rounded-xl bg-[#137fec]/5 border border-[#137fec]/10">
                    <p className="text-xs font-bold text-[#137fec] uppercase mb-2">Storage Usage</p>
                    <div className="w-full bg-slate-200 h-2 rounded-full mb-2 overflow-hidden">
                      <div className="bg-[#137fec] h-2 rounded-full" style={{ width: "62%" }} />
                    </div>
                    <p className="text-[11px] text-slate-500">12.4 GB of 20 GB used</p>
                  </div>
                </div>
              </aside>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <button
                        onClick={() => navigate("/dashboard/trainer")}
                        className="hover:text-[#137fec] transition-colors"
                      >
                        Dashboard
                      </button>
                      <Icon name="chevron_right" className="text-xs" />
                      <span className="text-slate-900 font-medium">Content Library</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Library</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                      Manage, discover and enhance your teaching materials with AI.
                      {filterParam === "recent" && (
                        <span className="ml-2 px-2 py-0.5 bg-[#137fec]/10 text-[#137fec] text-xs font-bold rounded">Showing Recent Uploads</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Icon name="filter_list" className="text-lg" />Filters
                    </button>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-slate-100 text-[#137fec]" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <Icon name="grid_view" className="block" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-slate-100 text-[#137fec]" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <Icon name="format_list_bulleted" className="block" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                  <div className="mb-6 flex items-center gap-3 p-3 bg-[#137fec]/5 border border-[#137fec]/20 rounded-xl">
                    <span className="text-sm font-bold text-[#137fec]">{selectedIds.length} selected</span>
                    <div className="flex gap-2 ml-auto">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                        <Icon name="download" className="text-sm" />Download
                      </button>
                      <button
                        onClick={() => setShowBulkAdd(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#137fec] text-white rounded-lg text-xs font-bold hover:bg-[#0f6fd4] transition-colors"
                      >
                        <Icon name="add" className="text-sm" />Add to Course
                      </button>
                      <button
                        onClick={() => setShowBulkDelete(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                      >
                        <Icon name="delete" className="text-sm" />Delete
                      </button>
                      <button
                        onClick={clearSelection}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        <Icon name="close" className="text-sm" />Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Search */}
                <div className="relative md:hidden mb-6">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 placeholder:text-slate-400"
                    placeholder="Search your assets..."
                  />
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Icon name="search_off" className="text-6xl text-slate-200 mb-4" />
                    <p className="text-lg font-bold text-slate-400">No assets found</p>
                    <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                    <button onClick={() => setSearchQuery("")} className="mt-4 px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Grid */}
                {filtered.length > 0 && viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(a => (
                      <AssetCard
                        key={a.id}
                        asset={a}
                        selected={selectedIds.includes(a.id)}
                        onSelect={() => toggleSelect(a.id)}
                        onPreview={() => handlePreview(a)}
                        onReuse={() => handleReuse(a)}
                        onEdit={() => handleEdit(a)}
                        onDelete={() => handleDelete(a)}
                        onAIEnhance={() => handleAIEnhance(a)}
                      />
                    ))}
                  </div>
                )}

                {/* List */}
                {filtered.length > 0 && viewMode === "list" && (
                  <div className="flex flex-col gap-4">
                    {filtered.map(a => (
                      <AssetRow
                        key={a.id}
                        asset={a}
                        selected={selectedIds.includes(a.id)}
                        onSelect={() => toggleSelect(a.id)}
                        onPreview={() => handlePreview(a)}
                        onReuse={() => handleReuse(a)}
                        onEdit={() => handleEdit(a)}
                        onDelete={() => handleDelete(a)}
                        onAIEnhance={() => handleAIEnhance(a)}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filtered.length > 0 && (
                  <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <Icon name="chevron_left" />
                    </button>
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === p ? "bg-[#137fec] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {p}
                      </button>
                    ))}
                    <span className="text-slate-400 text-sm">...</span>
                    <button
                      onClick={() => setCurrentPage(12)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === 12 ? "bg-[#137fec] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      12
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(12, p + 1))}
                      disabled={currentPage === 12}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                )}
              </div>
            </div>{/* ← closes max-w-[1400px] div */}
          </main>

          {/* Mobile FAB */}
          <button
            onClick={() => setShowUpload(true)}
            className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-[#137fec] text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-[#0f6fd4] transition-colors"
          >
            <Icon name="add" className="text-3xl" />
          </button>
        </div>
      </div>
    </>
  );
}
