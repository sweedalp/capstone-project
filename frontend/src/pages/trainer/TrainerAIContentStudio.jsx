import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";
import apiClient from "../../services/api";

// ── Background job store (unchanged — purely UI) ──────────────────
const jobStore = {
  jobs: [], listeners: new Set(),
  add(job)    { this.jobs.push(job); this._notify(); },
  update(id, patch) { const j = this.jobs.find(j => j.id === id); if (j) { Object.assign(j, patch); this._notify(); } },
  remove(id)  { this.jobs = this.jobs.filter(j => j.id !== id); this._notify(); },
  pause(id)   { this.update(id, { paused: true }); },
  resume(id)  { this.update(id, { paused: false }); },
  cancel(id)  { this.remove(id); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  _notify()   { this.listeners.forEach(fn => fn([...this.jobs])); },
};

function startBackgroundJob(type, title, onComplete) {
  const id = `job_${Date.now()}`;
  jobStore.add({ id, type, title, progress: 0, paused: false, status: "processing" });
  let p = 0;
  const tick = setInterval(() => {
    const j = jobStore.jobs.find(j => j.id === id);
    if (!j) { clearInterval(tick); return; }
    if (j.paused) return;
    p += Math.random() * 5 + 2;
    if (p >= 100) {
      clearInterval(tick);
      jobStore.update(id, { progress: 100, status: "done" });
      onComplete?.(id);
    } else {
      jobStore.update(id, { progress: Math.round(p) });
    }
  }, 400);
  return id;
}

const Icon = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24", ...style }}>
    {name}
  </span>
);

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ message, onClose, onAction, actionLabel }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 right-6 z-[500] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
      <Icon name="notifications" className="text-[#137fec] flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {actionLabel && <button onClick={onAction} className="text-[#137fec] text-xs font-bold whitespace-nowrap">{actionLabel}</button>}
      <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0"><Icon name="close" className="text-sm" /></button>
    </div>
  );
}

// ── History Item ──────────────────────────────────────────────────
function HistoryItem({ item, onPreview, onReuse, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const iconBg = { audio: "bg-indigo-100 text-indigo-600", video: "bg-rose-100 text-rose-600", walkthrough: "bg-amber-100 text-amber-600" }[item.type] || "bg-slate-100 text-slate-600";
  const iconName = { audio: "mic", video: "videocam", walkthrough: "touch_app" }[item.type] || "mic";
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-[#137fec]/20 transition-all group"
      onMouseEnter={() => item.status === "done" && setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={iconName} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
          <p className="text-[10px] text-slate-500">{item.meta}</p>
        </div>
        {item.status === "done" && <span className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0">DONE</span>}
        {item.status === "generating" && <div className="w-3 h-3 border-2 border-[#137fec] border-t-transparent rounded-full mt-1 flex-shrink-0" style={{ animation: "spin 1s linear infinite" }} />}
      </div>
      {showActions && item.status === "done" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onPreview(item)} className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">▶ Preview</button>
            <button onClick={() => onReuse(item)} className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">Reuse</button>
            <button onClick={() => onEdit(item)} className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">Edit</button>
            {confirmDelete
              ? <button onClick={() => onDelete(item)} className="flex-1 py-1 bg-red-500 text-white rounded text-[10px] font-bold">Confirm</button>
              : <button onClick={() => setConfirmDelete(true)} className="flex-1 py-1 bg-white border border-red-200 text-red-500 rounded text-[10px] font-bold">Delete</button>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add to Lesson Modal (with real lessons from API) ──────────────
function AddToLessonModal({ item, courses, onClose, onConfirm }) {
  const [selectedLesson, setSelectedLesson]   = useState("");
  const [selectedCourse, setSelectedCourse]   = useState("");
  const [modules, setModules]                 = useState([]);
  const [loadingModules, setLoadingModules]   = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingModules(true);
    apiClient.get(`/api/v1/trainer/courses/${selectedCourse}/modules`)
      .then(r => setModules(r.data || []))
      .finally(() => setLoadingModules(false));
  }, [selectedCourse]);

  const allLessons = modules.flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleTitle: m.title })));

  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Add to Lesson</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Select Course</label>
            <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedLesson(""); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30">
              <option value="">-- Choose a course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {selectedCourse && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Select Lesson</label>
              {loadingModules ? (
                <p className="text-xs text-slate-400">Loading lessons...</p>
              ) : allLessons.length === 0 ? (
                <p className="text-xs text-slate-400">No lessons in this course yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allLessons.map(l => (
                    <button key={l.id} onClick={() => setSelectedLesson(String(l.id))}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all
                        ${selectedLesson === String(l.id) ? "border-[#137fec] bg-[#137fec]/5 text-[#137fec]" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                      <span className="text-[10px] text-slate-400 block">{l.moduleTitle}</span>
                      {l.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => selectedLesson && onConfirm(selectedLesson)} disabled={!selectedLesson}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-[#0f6fd4]">
            Add to Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generating Modal ──────────────────────────────────────────────
function GeneratingModal({ tool, onDone, onNavigateAway }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 7 + 3;
      if (p >= 100) { p = 100; clearInterval(t); setDone(true); }
      setProgress(Math.min(p, 100));
    }, 250);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="size-16 rounded-full bg-[#137fec]/10 flex items-center justify-center mx-auto mb-4">
          {done
            ? <Icon name="check_circle" className="text-4xl text-[#137fec]" />
            : <div className="size-8 rounded-full border-4 border-[#137fec] border-t-transparent" style={{ animation: "spin 1s linear infinite" }} />
          }
        </div>
        <h3 className="text-lg font-bold mb-1">{done ? `${tool} Ready!` : `Generating ${tool}...`}</h3>
        <p className="text-sm text-slate-500 mb-5">
          {done ? "Your asset has been added to history." : "AI is processing your content. You can navigate away — processing continues in the background."}
        </p>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-[#137fec] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mb-5">{Math.round(progress)}%</p>
        {!done && <button onClick={onNavigateAway} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold mb-3">Navigate Away (Processing Continues)</button>}
        {done  && <button onClick={onDone} className="w-full py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold">View in History</button>}
      </div>
    </div>
  );
}

// ── Processing Queue ──────────────────────────────────────────────
function ProcessingQueue({ jobs, onPause, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  if (jobs.length === 0) return null;
  const active = jobs.filter(j => j.status !== "done");
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#137fec]/10 flex items-center justify-center">
            <Icon name="settings" className="text-[#137fec] text-lg" style={{ animation: active.length ? "spin 2s linear infinite" : "none" }} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Processing Queue ({active.length} active)</h4>
            <p className="text-[10px] text-slate-400">Jobs continue even when you navigate away.</p>
          </div>
        </div>
        <button className="text-[#137fec] text-xs font-bold flex items-center gap-1">
          {expanded ? "Hide" : "View Details"} <Icon name={expanded ? "expand_less" : "expand_more"} className="text-sm" />
        </button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-700 truncate">{job.title}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${job.status === "done" ? "bg-green-100 text-green-700" : job.paused ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {job.status === "done" ? "DONE" : job.paused ? "PAUSED" : "PROCESSING"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#137fec] rounded-full transition-all duration-300" style={{ width: `${job.progress}%` }} />
                </div>
              </div>
              {job.status !== "done" && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => job.paused ? onPause(job.id, false) : onPause(job.id, true)}
                    className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[10px] font-bold">
                    {job.paused ? "Resume" : "Pause"}
                  </button>
                  <button onClick={() => onCancel(job.id)} className="px-2 py-1 bg-red-50 border border-red-200 text-red-500 rounded text-[10px] font-bold">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Walkthrough Preview ───────────────────────────────────────────
function WalkthroughPreviewModal({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Walkthrough Preview</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        <div className="mb-4 flex gap-1">
          {steps.map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= currentStep ? "bg-[#137fec]" : "bg-slate-200"}`} />)}
        </div>
        <div className="bg-slate-50 rounded-xl p-6 mb-6 text-center min-h-[120px] flex items-center justify-center">
          <div>
            <Icon name="touch_app" className="text-4xl text-amber-400 block mb-3" />
            <p className="font-bold text-slate-800">{steps[currentStep]?.label}</p>
            <p className="text-xs text-slate-500 mt-1">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold disabled:opacity-40">Previous</button>
          {currentStep < steps.length - 1
            ? <button onClick={() => setCurrentStep(p => p + 1)} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold">Next</button>
            : <button onClick={onClose} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold">Done ✓</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Edit Item Modal ───────────────────────────────────────────────
function EditItemModal({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item?.title || "");
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Edit Asset</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 mb-6 focus:outline-none focus:border-[#137fec]" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave({ ...item, title })} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold">Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function TrainerAIContentStudio() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const userName  = localStorage.getItem("userName") || "Trainer";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [activeTab,    setActiveTab]    = useState("Generate Audio Summary");
  const [script,       setScript]       = useState("");
  const [voiceTone,    setVoiceTone]    = useState("Friendly");
  const [duration,     setDuration]     = useState(55);
  const [searchQuery,  setSearchQuery]  = useState("");

  // Walkthrough drawer
  const [walkthroughOpen,       setWalkthroughOpen]       = useState(false);
  const [steps,                 setSteps]                 = useState([
    { id: 1, label: "Step 1: Introduction" },
    { id: 2, label: "Step 2: Dashboard" },
    { id: 3, label: "Step 3: Analytics" },
  ]);
  const [showWalkthroughPreview, setShowWalkthroughPreview] = useState(false);

  // Modals
  const [generatingTool,  setGeneratingTool]  = useState(null);
  const [previewItem,     setPreviewItem]     = useState(null);
  const [addToLessonItem, setAddToLessonItem] = useState(null);
  const [editingItem,     setEditingItem]     = useState(null);

  // Toasts & jobs
  const [toasts, setToasts] = useState([]);
  const [jobs,   setJobs]   = useState([]);

  // ── Real data ─────────────────────────────────────────────────
  const [courses,  setCourses]  = useState([]);
  const [history,  setHistory]  = useState({ today: [], yesterday: [] });
  const [loadingHistory, setLoadingHistory] = useState(true);

  const historyRef = useRef(null);

  useEffect(() => {
    const unsub = jobStore.subscribe(setJobs);
    return unsub;
  }, []);

  // Fetch courses for "Add to Lesson" modal
  useEffect(() => {
    apiClient.get("/api/v1/trainer/courses")
      .then(r => setCourses(r.data || []))
      .catch(() => {});
  }, []);

  // Fetch real lessons as generation history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const coursesRes = await apiClient.get("/api/v1/trainer/courses");
        const courseList = coursesRes.data || [];

        const allLessons = [];
        await Promise.all(courseList.map(async (course) => {
          try {
            const modRes = await apiClient.get(`/api/v1/trainer/courses/${course.id}/modules`);
            (modRes.data || []).forEach(mod => {
              (mod.lessons || []).forEach(lesson => {
                allLessons.push({
                  id:     lesson.id,
                  type:   lesson.lesson_type === "quiz" ? "walkthrough" : lesson.lesson_type === "text" ? "audio" : "video",
                  title:  lesson.title,
                  meta:   `${lesson.duration_minutes || 0}m • ${course.title}`,
                  status: "done",
                  courseId: course.id,
                });
              });
            });
          } catch {}
        }));

        // Split by index: first half = today, rest = yesterday (since we have no timestamps)
        const mid = Math.ceil(allLessons.length / 2);
        setHistory({
          today:     allLessons.slice(0, mid),
          yesterday: allLessons.slice(mid),
        });
      } catch {}
      finally { setLoadingHistory(false); }
    };
    fetchHistory();
  }, []);

  const addToast    = useCallback((msg, actionLabel, onAction) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, actionLabel, onAction }]);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const formatDuration = (val) => {
    const totalSec = Math.round(30 + (val / 100) * 570);
    return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")} min`;
  };

  const typeMap = {
    "Generate Audio Summary":       "audio",
    "Create Video Explainer":       "video",
    "Build Interactive Walkthrough":"walkthrough",
  };

  const handleGenerate = () => {
    if (!script.trim()) return addToast("Please enter a script first.", null, null);
    const toolMap = {
      "Generate Audio Summary":       "Audio Summary",
      "Create Video Explainer":       "Video Explainer",
      "Build Interactive Walkthrough":"Walkthrough",
    };
    setGeneratingTool(toolMap[activeTab] || "Content");
  };

  const onGenerateDone = () => {
    const type = typeMap[activeTab] || "audio";
    const newItem = {
      id:     `gen_${Date.now()}`,
      type,
      title:  script.substring(0, 28) + (script.length > 28 ? "..." : "") || "Untitled",
      meta:   `${formatDuration(duration)} • AI Generated`,
      status: "done",
    };
    setHistory(prev => ({ ...prev, today: [newItem, ...prev.today] }));
    setScript("");
    setGeneratingTool(null);
    setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const onGenerateNavigateAway = () => {
    const type  = typeMap[activeTab] || "audio";
    const title = script.substring(0, 28) + "..." || "Untitled";
    setGeneratingTool(null);
    setScript("");
    startBackgroundJob(type, title, (jobId) => {
      const newItem = { id: `gen_${Date.now()}`, type, title, meta: `${formatDuration(duration)} • AI Generated`, status: "done" };
      setHistory(prev => ({ ...prev, today: [newItem, ...prev.today] }));
      addToast(`${type} ready! "${title}"`, "View", () => historyRef.current?.scrollIntoView({ behavior: "smooth" }));
      jobStore.remove(jobId);
    });
  };

  // Add generated AI content to a real lesson via API
  const handleAddToLessonConfirm = async (lessonId) => {
    if (!addToLessonItem) return;
    try {
      const contentTypeMap = { audio: "text_body", video: "video_url", walkthrough: "text_body" };
      await apiClient.put(`/api/v1/trainer/lessons/${lessonId}`, {
        title:        addToLessonItem.title,
        content:      `AI Generated: ${addToLessonItem.title}`,
        content_type: contentTypeMap[addToLessonItem.type] || "text_body",
      });
      addToast(`"${addToLessonItem.title}" added to lesson!`, null, null);
    } catch {
      addToast("Failed to add to lesson", null, null);
    } finally {
      setAddToLessonItem(null);
    }
  };

  const handleReuse = (item) => {
    const tabMap = { audio: "Generate Audio Summary", video: "Create Video Explainer", walkthrough: "Build Interactive Walkthrough" };
    setActiveTab(tabMap[item.type] || "Generate Audio Summary");
    setScript(item.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item) => {
    // If it's a real lesson (numeric id), delete from backend
    if (typeof item.id === "number") {
      try {
        await apiClient.delete(`/api/v1/trainer/lessons/${item.id}`);
      } catch {}
    }
    setHistory(prev => ({
      today:     prev.today.filter(i => i.id !== item.id),
      yesterday: prev.yesterday.filter(i => i.id !== item.id),
    }));
  };

  const handleEditSave = async (updated) => {
    if (typeof updated.id === "number") {
      try {
        await apiClient.put(`/api/v1/trainer/lessons/${updated.id}`, { title: updated.title });
      } catch {}
    }
    setHistory(prev => ({
      today:     prev.today.map(i => i.id === updated.id ? updated : i),
      yesterday: prev.yesterday.map(i => i.id === updated.id ? updated : i),
    }));
    setEditingItem(null);
    addToast("Asset updated!", null, null);
  };

  const tabList = [
    { icon: "description",    label: "Generate Audio Summary" },
    { icon: "video_library",  label: "Create Video Explainer" },
    { icon: "directions_run", label: "Build Interactive Walkthrough" },
  ];

  const cardTitle = {
    "Generate Audio Summary":       "Audio Summary Configuration",
    "Create Video Explainer":       "Video Explainer Configuration",
    "Build Interactive Walkthrough":"Walkthrough Configuration",
  }[activeTab];

  const cardSub = {
    "Generate Audio Summary":       "Convert long documents into bite-sized podcasts.",
    "Create Video Explainer":       "Create engaging AI video presentations.",
    "Build Interactive Walkthrough":"Build step-by-step interactive guides.",
  }[activeTab];

  const btnLabel = {
    "Generate Audio Summary":       "Generate Audio",
    "Create Video Explainer":       "Generate Video",
    "Build Interactive Walkthrough":"Build Walkthrough",
  }[activeTab];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{font-family:'Lexend',sans-serif;background:#f6f7f8;margin:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .custom-scroll::-webkit-scrollbar{width:4px;}
        .custom-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px;}
      `}</style>

      {generatingTool  && <GeneratingModal tool={generatingTool} onDone={onGenerateDone} onNavigateAway={onGenerateNavigateAway} />}
      {addToLessonItem && <AddToLessonModal item={addToLessonItem} courses={courses} onClose={() => setAddToLessonItem(null)} onConfirm={handleAddToLessonConfirm} />}
      {editingItem     && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleEditSave} />}
      {showWalkthroughPreview && <WalkthroughPreviewModal steps={steps} onClose={() => setShowWalkthroughPreview(false)} />}
      {toasts.map(t => (
        <Toast key={t.id} message={t.msg} actionLabel={t.actionLabel}
          onAction={() => { t.onAction?.(); removeToast(t.id); }}
          onClose={() => removeToast(t.id)} />
      ))}

      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Lexend',sans-serif", backgroundColor: "#f6f7f8" }}>
        <TrainerSidebar />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-[#137fec] p-1.5 rounded-lg text-white flex-shrink-0">
                  <Icon name="auto_awesome" className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Trainer AI Studio</h2>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                {["Creation Hub", "Analytics"].map(link => (
                  <button key={link}
                    onClick={() => { if (link === "Analytics") navigate("/trainer/analytics"); }}
                    className="text-sm font-medium text-slate-500 hover:text-[#137fec] transition-colors">
                    {link}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-100 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#137fec]/30"
                  placeholder="Search projects..." />
              </div>
              <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scroll p-8" style={{ paddingBottom: walkthroughOpen ? "320px" : "32px" }}>
            <div className="max-w-6xl mx-auto">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <button onClick={() => navigate("/trainer/dashboard")} className="hover:text-[#137fec] font-medium">Dashboard</button>
                <Icon name="chevron_right" className="text-xs" />
                <span className="text-slate-900 font-semibold">AI Content Studio</span>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Content Creation Studio</h1>
                <p className="text-slate-500 text-lg">Transform text-based training into rich media experiences in seconds.</p>
              </div>

              {jobs.length > 0 && (
                <ProcessingQueue jobs={jobs}
                  onPause={(id, p) => p ? jobStore.pause(id) : jobStore.resume(id)}
                  onCancel={(id) => jobStore.cancel(id)} />
              )}

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                {tabList.map(({ icon, label }) => (
                  <button key={label} onClick={() => setActiveTab(label)}
                    className={`px-6 py-4 flex items-center gap-2 text-sm font-bold tracking-wide whitespace-nowrap flex-shrink-0 border-b-[3px] -mb-[1px] transition-all
                      ${activeTab === label ? "border-[#137fec] text-[#137fec]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                    <Icon name={icon} />{label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Generator */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{cardTitle}</h3>
                        <p className="text-xs text-slate-400">{cardSub}</p>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100 uppercase whitespace-nowrap flex-shrink-0">
                        AI Active
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Script or Training Content</label>
                        <textarea value={script} onChange={e => setScript(e.target.value)}
                          className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl text-sm p-4 placeholder:text-slate-400 resize-none focus:outline-none focus:border-[#137fec]"
                          placeholder="Type or paste your training script here..." />
                      </div>
                      {activeTab === "Generate Audio Summary" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Voice Tone</label>
                            <div className="grid grid-cols-3 gap-2">
                              {["Friendly", "Authoritative", "Excited"].map(tone => (
                                <button key={tone} onClick={() => setVoiceTone(tone)}
                                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${voiceTone === tone ? "border-2 border-[#137fec] bg-[#137fec]/5 text-[#137fec]" : "border border-slate-200 text-slate-600"}`}>
                                  {tone}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Duration</label>
                            <div className="flex items-center gap-4 pt-2">
                              <input type="range" min={0} max={100} value={duration}
                                onChange={e => setDuration(Number(e.target.value))} className="flex-1 accent-[#137fec]" />
                              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{formatDuration(duration)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4">
                        <button onClick={() => navigate("/trainer/analytics")}
                          className="text-xs font-bold text-[#137fec] hover:underline flex items-center gap-1">
                          <Icon name="analytics" className="text-sm" />View Performance
                        </button>
                        <button onClick={handleGenerate}
                          className="bg-[#137fec] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#137fec]/30 hover:bg-[#0f6fd4] transition-all flex items-center gap-2">
                          <Icon name="auto_fix_high" className="text-lg" />{btnLabel}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick access cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#137fec]/40 transition-all cursor-pointer group"
                      onClick={() => setActiveTab("Create Video Explainer")}>
                      <div className="w-12 h-12 rounded-xl bg-[#137fec]/10 text-[#137fec] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="person_play" className="text-3xl" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Avatar Presenter</h4>
                      <p className="text-xs text-slate-500 mb-4">AI humans that speak your script with natural lip-sync.</p>
                      <div className="flex items-center gap-2 text-[#137fec] text-xs font-bold">Setup Avatar <Icon name="arrow_forward" className="text-sm" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#137fec]/40 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="animation" className="text-3xl" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Animated Slides</h4>
                      <p className="text-xs text-slate-500 mb-4">Auto-generate dynamic slides from your text content.</p>
                      <div className="flex items-center gap-2 text-[#137fec] text-xs font-bold">Choose Style <Icon name="arrow_forward" className="text-sm" /></div>
                    </div>
                  </div>
                </div>

                {/* Right: History */}
                <div className="space-y-6" ref={historyRef}>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col" style={{ height: "650px" }}>
                    <div className="p-6 border-b border-slate-100 flex-shrink-0">
                      <h3 className="font-bold text-slate-800">Generation History</h3>
                      <p className="text-xs text-slate-400">
                        {loadingHistory ? "Loading..." : `${history.today.length + history.yesterday.length} total assets`}
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-6">
                      {loadingHistory ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <>
                          {history.today.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#137fec] rounded-full inline-block" />Recent
                              </p>
                              <div className="space-y-3">
                                {history.today
                                  .filter(i => !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                  .map(item => (
                                  <HistoryItem key={item.id} item={item}
                                    onPreview={() => addToast(`Preview: ${item.title}`, null, null)}
                                    onReuse={handleReuse}
                                    onEdit={setEditingItem}
                                    onDelete={handleDelete} />
                                ))}
                              </div>
                            </div>
                          )}
                          {history.yesterday.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Older</p>
                              <div className="space-y-3">
                                {history.yesterday
                                  .filter(i => !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                  .map(item => (
                                  <HistoryItem key={item.id} item={item}
                                    onPreview={() => addToast(`Preview: ${item.title}`, null, null)}
                                    onReuse={handleReuse}
                                    onEdit={setEditingItem}
                                    onDelete={handleDelete} />
                                ))}
                              </div>
                            </div>
                          )}
                          {history.today.length === 0 && history.yesterday.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <Icon name="history" className="text-5xl text-slate-200 mb-3" />
                              <p className="text-sm font-bold text-slate-400">No history yet</p>
                              <p className="text-xs text-slate-400">Generate content to see it here</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <button onClick={() => navigate("/trainer/content-library")}
                      className="m-6 mt-0 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 flex-shrink-0">
                      <Icon name="history" className="text-sm" />View All in Content Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Studio Tip */}
              <div className="mt-12 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-900 rounded-3xl text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="lightbulb" className="text-[#137fec] text-3xl" />
                  </div>
                  <div>
                    <p className="font-bold">Studio Tip</p>
                    <p className="text-xs text-white/60">Upload a PDF to auto-detect key learning points for your summaries.</p>
                  </div>
                </div>
                <button onClick={() => navigate("/trainer/content-library")}
                  className="px-5 py-2.5 bg-[#137fec] rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                  Browse Content Library
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Walkthrough Drawer */}
      <div className="fixed bottom-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-500 z-[60]"
        style={{ transform: walkthroughOpen ? "translateY(0)" : "translateY(85%)", left: "256px", right: 0 }}>
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setWalkthroughOpen(p => !p)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Icon name="edit_note" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">New Interactive Walkthrough</h4>
                <p className="text-[10px] text-slate-500">Configure your guided tutorial steps.</p>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); setWalkthroughOpen(p => !p); }}>
              <Icon name={walkthroughOpen ? "expand_more" : "expand_less"} className="text-slate-400" />
            </button>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4">
            {steps.map((step) => (
              <button key={step.id}
                className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-[#137fec] hover:bg-[#137fec]/5 transition-all group">
                <Icon name="add_circle" className="text-slate-300 group-hover:text-[#137fec] block mb-2 transition-colors" />
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-[#137fec]">{step.label}</p>
              </button>
            ))}
            <div className="flex items-center justify-center p-3">
              <button onClick={() => setSteps(prev => [...prev, { id: Date.now(), label: `Step ${prev.length + 1}: New Step` }])}
                className="text-xs font-bold text-[#137fec] flex items-center gap-1 hover:underline">
                <Icon name="add" className="text-sm" />Add more
              </button>
            </div>
          </div>
          <div className="flex gap-3 pb-4">
            <button onClick={() => setShowWalkthroughPreview(true)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Preview</button>
            <button onClick={() => addToast("Walkthrough saved!", null, null)}
              className="px-5 py-2.5 bg-white border border-[#137fec] text-[#137fec] rounded-xl text-sm font-bold hover:bg-[#137fec]/5">Save</button>
            <button onClick={() => setAddToLessonItem({ title: "Interactive Walkthrough", type: "walkthrough" })}
              className="px-5 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4] flex items-center gap-2">
              <Icon name="add_circle" className="text-lg" />Add to Lesson
            </button>
          </div>
        </div>
      </div>
    </>
  );
}