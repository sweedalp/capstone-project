import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";

const jobStore = {
  jobs: [],
  listeners: new Set(),
  add(job) { this.jobs.push(job); this._notify(); },
  update(id, patch) {
    const j = this.jobs.find(j => j.id === id);
    if (j) { Object.assign(j, patch); this._notify(); }
  },
  remove(id) { this.jobs = this.jobs.filter(j => j.id !== id); this._notify(); },
  pause(id) { this.update(id, { paused: true }); },
  resume(id) { this.update(id, { paused: false }); },
  cancel(id) { this.remove(id); },
  getAll() { return [...this.jobs]; },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  _notify() { this.listeners.forEach(fn => fn([...this.jobs])); },
};

function startBackgroundJob(type, title, onComplete) {
  const id = `job_${Date.now()}`;
  const job = { id, type, title, progress: 0, paused: false, status: "processing" };
  jobStore.add(job);
  let p = 0;
  const tick = setInterval(() => {
    const j = jobStore.jobs.find(j => j.id === id);
    if (!j) { clearInterval(tick); return; }
    if (j.paused) return;
    p += Math.random() * 5 + 2;
    if (p >= 100) {
      p = 100;
      clearInterval(tick);
      jobStore.update(id, { progress: 100, status: "done" });
      onComplete && onComplete(id);
    } else {
      jobStore.update(id, { progress: Math.round(p) });
    }
  }, 400);
  return id;
}

const Icon = ({ name, className = "", style }) => (
  <span
    className={`material-symbols-outlined select-none leading-none ${className}`}
    style={{
      fontFamily: "'Material Symbols Outlined'",
      fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
      ...style,
    }}
  >
    {name}
  </span>
);

function HistoryItem({ item, onPreview, onReuse, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const iconBg = {
    audio: "bg-indigo-100 text-indigo-600",
    video: "bg-rose-100 text-rose-600",
    walkthrough: "bg-amber-100 text-amber-600",
  }[item.type] || "bg-slate-100 text-slate-600";
  const iconName = { audio: "mic", video: "videocam", walkthrough: "touch_app" }[item.type] || "mic";

  return (
    <div
      className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-[#137fec]/20 transition-all group"
      onMouseEnter={() => item.status === "done" && setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={iconName} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
          <p className="text-[10px] text-slate-500">{item.meta}</p>
        </div>
        {item.status === "done" && (
          <span className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0">DONE</span>
        )}
        {item.status === "generating" && (
          <div className="w-3 h-3 border-2 border-[#137fec] border-t-transparent rounded-full mt-1 flex-shrink-0"
            style={{ animation: "spin 1s linear infinite" }} />
        )}
        {item.status === "archived" && (
          <span className="bg-slate-200 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0">ARCHIVED</span>
        )}
      </div>

      {item.status === "generating" && (
        <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#137fec] rounded-full transition-all duration-300"
            style={{ width: `${item.progress || 45}%` }} />
        </div>
      )}

      {showActions && item.status === "done" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onPreview(item)}
              className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50">
              ▶ Play
            </button>
            <button onClick={() => {
              const a = document.createElement("a");
              a.href = "#";
              a.download = `${item.title}.${item.type === "audio" ? "mp3" : item.type === "video" ? "mp4" : "html"}`;
              a.click();
            }} className="flex-1 py-1 bg-[#137fec] text-white rounded text-[10px] font-bold">
              Download
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onReuse(item)}
              className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50">
              Reuse
            </button>
            <button onClick={() => onEdit(item)}
              className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50">
              Edit
            </button>
            {confirmDelete ? (
              <button onClick={() => onDelete(item)}
                className="flex-1 py-1 bg-red-500 text-white rounded text-[10px] font-bold">
                Confirm
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="flex-1 py-1 bg-white border border-red-200 text-red-500 rounded text-[10px] font-bold hover:bg-red-50">
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {showActions && (item.status === "archived" || item.status === "more") && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onPreview(item)}
            className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50">
            Preview
          </button>
          <button onClick={() => onReuse(item)}
            className="flex-1 py-1 bg-[#137fec]/10 text-[#137fec] rounded text-[10px] font-bold">
            Reuse
          </button>
        </div>
      )}
    </div>
  );
}

function PreviewModal({ item, onClose, onAddToLesson, onRegenerate }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="bg-slate-100 rounded-xl flex items-center justify-center h-40 mb-6">
          {item.type === "audio" && (
            <div className="text-center">
              <Icon name="mic" className="text-4xl text-indigo-400 block mb-2" />
              <p className="text-xs text-slate-500">{item.meta}</p>
              <button className="mt-3 px-6 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">▶ Play Audio</button>
            </div>
          )}
          {item.type === "video" && (
            <div className="text-center">
              <Icon name="videocam" className="text-4xl text-rose-400 block mb-2" />
              <p className="text-xs text-slate-500">{item.meta}</p>
              <button className="mt-3 px-6 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">▶ Watch Video</button>
            </div>
          )}
          {item.type === "walkthrough" && (
            <div className="text-center">
              <Icon name="touch_app" className="text-4xl text-amber-400 block mb-2" />
              <p className="text-xs text-slate-500">{item.meta}</p>
              <button className="mt-3 px-6 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold">▶ Preview Walkthrough</button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => onAddToLesson(item)}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
            Add to Lesson
          </button>
          <button onClick={() => { onClose(); onRegenerate(item); }}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4] transition-all">
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

function AddToLessonModal({ item, onClose, onConfirm }) {
  const [selected, setSelected] = useState("");
  const lessons = ["Lesson 1: Introduction", "Lesson 2: Core Concepts", "Lesson 3: Advanced Topics", "Lesson 4: Practice"];
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Add to Lesson</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Select a lesson to add <strong>{item?.title}</strong>:</p>
        <div className="space-y-2 mb-6">
          {lessons.map(l => (
            <button key={l} onClick={() => setSelected(l)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all
                ${selected === l ? "border-[#137fec] bg-[#137fec]/5 text-[#137fec]" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => selected && onConfirm(selected)} disabled={!selected}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-[#0f6fd4] transition-all">
            Add &amp; Go to Course
          </button>
        </div>
      </div>
    </div>
  );
}

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
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentStep ? "bg-[#137fec]" : "bg-slate-200"}`} />
          ))}
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
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold disabled:opacity-40">
            Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(p => p + 1)}
              className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4]">
              Next
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold">
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
          {done ? (
            <Icon name="check_circle" className="text-4xl text-[#137fec]" />
          ) : (
            <div className="size-8 rounded-full border-4 border-[#137fec] border-t-transparent"
              style={{ animation: "spin 1s linear infinite" }} />
          )}
        </div>
        <h3 className="text-lg font-bold mb-1">{done ? `${tool} Ready!` : `Generating ${tool}...`}</h3>
        <p className="text-sm text-slate-500 mb-5">
          {done
            ? "Your asset has been added to history."
            : "AI is processing your content. You can navigate away — processing continues in the background."}
        </p>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-[#137fec] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mb-5">{Math.round(progress)}%</p>
        {!done && (
          <button onClick={onNavigateAway}
            className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors mb-3">
            Navigate Away (Processing Continues)
          </button>
        )}
        {done && (
          <button onClick={onDone}
            className="w-full py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">
            View in History
          </button>
        )}
      </div>
    </div>
  );
}

function ProcessingQueue({ jobs, onPause, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  if (jobs.length === 0) return null;
  const active = jobs.filter(j => j.status !== "done");
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#137fec]/10 flex items-center justify-center">
            <Icon name="settings" className="text-[#137fec] text-lg"
              style={{ animation: active.length ? "spin 2s linear infinite" : "none" }} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Processing Queue ({active.length} active)</h4>
            <p className="text-[10px] text-slate-400">Jobs continue even when you navigate away.</p>
          </div>
        </div>
        <button className="text-[#137fec] text-xs font-bold flex items-center gap-1"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}>
          {expanded ? "Hide Details" : "View Queue Details"}
          <Icon name={expanded ? "expand_less" : "expand_more"} className="text-sm" />
        </button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-700 truncate">{job.title}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-2 flex-shrink-0
                    ${job.status === "done" ? "bg-green-100 text-green-700" : job.paused ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {job.status === "done" ? "DONE" : job.paused ? "PAUSED" : "PROCESSING"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#137fec] rounded-full transition-all duration-300" style={{ width: `${job.progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{job.progress}%</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {job.status !== "done" && (
                  <button onClick={() => job.paused ? onPause(job.id, false) : onPause(job.id, true)}
                    className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[10px] font-bold hover:bg-amber-100">
                    {job.paused ? "Resume" : "Pause"}
                  </button>
                )}
                {job.status !== "done" && (
                  <button onClick={() => onCancel(job.id)}
                    className="px-2 py-1 bg-red-50 border border-red-200 text-red-500 rounded text-[10px] font-bold hover:bg-red-100">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnhanceContentCard({ onBrowse, onEnhance }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [enhancements, setEnhancements] = useState({ summary: true, concepts: true, quiz: true });
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(null);

  const handleEnhanceClick = () => {
    if (!selectedContent) { onBrowse(setSelectedContent); return; }
    setEnhancing(true);
    setTimeout(() => {
      setEnhancing(false);
      setEnhanced({ title: `Enhanced: ${selectedContent.name.substring(0, 20)}`, ...enhancements });
      onEnhance(selectedContent, enhancements);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Icon name="auto_fix_high" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">Enhance Existing Content</h4>
          <p className="text-xs text-slate-500">Add AI summaries, key concepts &amp; assessments.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500">
          {selectedContent ? selectedContent.name : "No content selected"}
        </div>
        <button onClick={() => onBrowse(setSelectedContent)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
          Browse...
        </button>
      </div>
      {selectedContent && !enhanced && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Select enhancements:</p>
          {[{ key: "summary", label: "AI Summary" }, { key: "concepts", label: "Key Concepts" }, { key: "quiz", label: "Assessment Quiz" }].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={enhancements[key]}
                onChange={e => setEnhancements(p => ({ ...p, [key]: e.target.checked }))}
                className="accent-[#137fec]" />
              {label}
            </label>
          ))}
        </div>
      )}
      {enhanced && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-bold text-emerald-700 mb-2">✓ Enhancement complete!</p>
          <div className="flex flex-wrap gap-2">
            {enhanced.summary && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded">AI Summary</span>}
            {enhanced.concepts && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded">Key Concepts</span>}
            {enhanced.quiz && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded">Quiz</span>}
          </div>
        </div>
      )}
      <button onClick={handleEnhanceClick} disabled={enhancing}
        className="w-full py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {enhancing ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 1s linear infinite" }} />Enhancing...</>
        ) : (
          <><Icon name="auto_fix_high" className="text-lg" />{selectedContent ? "Enhance Content" : "Select Content First"}</>
        )}
      </button>
    </div>
  );
}

function Toast({ message, onClose, onAction, actionLabel }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 right-6 z-[500] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
      <Icon name="notifications" className="text-[#137fec] flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {actionLabel && (
        <button onClick={onAction} className="text-[#137fec] text-xs font-bold whitespace-nowrap">{actionLabel}</button>
      )}
      <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0">
        <Icon name="close" className="text-sm" />
      </button>
    </div>
  );
}

function EditItemModal({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item?.title || "");
  const [notes, setNotes] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Edit Asset</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 mb-4 focus:outline-none focus:border-[#137fec]" />
        <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 resize-none mb-6 focus:outline-none focus:border-[#137fec]"
          placeholder="Add notes..." />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave({ ...item, title })}
            className="flex-1 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4]">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainerAIContentStudio() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeNav, setActiveNav] = useState("Creation Hub");
  const [activeTab, setActiveTab] = useState("Generate Audio Summary");
  const [script, setScript] = useState("");
  const [voiceTone, setVoiceTone] = useState("Friendly");
  const [duration, setDuration] = useState(55);
  const [searchQuery, setSearchQuery] = useState("");
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [stepCount, setStepCount] = useState("5 Steps");
  const [steps, setSteps] = useState([
    { id: 1, label: "Step 1: Introduction" },
    { id: 2, label: "Step 2: Dashboard" },
    { id: 3, label: "Step 3: Analytics" },
  ]);
  const [showWalkthroughPreview, setShowWalkthroughPreview] = useState(false);
  const [generatingTool, setGeneratingTool] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [addToLessonItem, setAddToLessonItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsub = jobStore.subscribe(setJobs);
    return unsub;
  }, []);

  const [history, setHistory] = useState({
    today: [
      { id: 1, type: "audio", title: "Q3 Compliance Summary", meta: "2:15 • 1.2 MB", status: "done" },
      { id: 2, type: "video", title: "Product Intro Explainer", meta: "Video • Generating assets...", status: "generating", progress: 45 },
    ],
    yesterday: [
      { id: 3, type: "walkthrough", title: "CRM Navigation Walkthrough", meta: "12 Steps • Interactive", status: "more" },
      { id: 4, type: "audio", title: "Safety Protocol Audio", meta: "1:45 • 900 KB", status: "archived" },
    ],
  });

  const historyRef = useRef(null);

  const addToast = useCallback((msg, actionLabel, onAction) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, actionLabel, onAction }]);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const formatDuration = (val) => {
    const totalSec = Math.round(30 + (val / 100) * 570);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")} min`;
  };

  const addStep = () => setSteps(prev => [...prev, { id: Date.now(), label: `Step ${prev.length + 1}: New Step` }]);

  const handleGenerate = () => {
    const toolMap = {
      "Generate Audio Summary": "Audio Summary",
      "Create Video Explainer": "Video Explainer",
      "Build Interactive Walkthrough": "Walkthrough",
    };
    setGeneratingTool(toolMap[activeTab] || "Content");
  };

  const typeMap = {
    "Generate Audio Summary": "audio",
    "Create Video Explainer": "video",
    "Build Interactive Walkthrough": "walkthrough",
  };

  const onGenerateDone = () => {
    const type = typeMap[activeTab] || "audio";
    const newItem = {
      id: Date.now(), type,
      title: script.substring(0, 28) + (script.length > 28 ? "..." : "") || "Untitled",
      meta: `${formatDuration(duration)} • ~1 MB`, status: "done",
    };
    setHistory(prev => ({ ...prev, today: [newItem, ...prev.today] }));
    setScript("");
    setGeneratingTool(null);
    setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const onGenerateNavigateAway = () => {
    const type = typeMap[activeTab] || "audio";
    const title = script.substring(0, 28) + "..." || "Untitled";
    setGeneratingTool(null);
    setScript("");
    startBackgroundJob(type, title, (jobId) => {
      const newItem = { id: Date.now(), type, title, meta: `${formatDuration(duration)} • ~1 MB`, status: "done" };
      setHistory(prev => ({ ...prev, today: [newItem, ...prev.today] }));
      addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} ready! "${title}"`, "View",
        () => historyRef.current?.scrollIntoView({ behavior: "smooth" }));
      jobStore.remove(jobId);
    });
  };

  const handlePreview = (item) => setPreviewItem(item);
  const handleEdit = (item) => setEditingItem(item);
  const handleEditSave = (updated) => {
    setHistory(prev => ({
      today: prev.today.map(i => i.id === updated.id ? updated : i),
      yesterday: prev.yesterday.map(i => i.id === updated.id ? updated : i),
    }));
    setEditingItem(null);
    addToast("Asset updated!", null, null);
  };
  const handleReuse = (item) => {
    const tabMap = { audio: "Generate Audio Summary", video: "Create Video Explainer", walkthrough: "Build Interactive Walkthrough" };
    setActiveTab(tabMap[item.type] || "Generate Audio Summary");
    setScript(item.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDelete = (item) => {
    setHistory(prev => ({
      today: prev.today.filter(i => i.id !== item.id),
      yesterday: prev.yesterday.filter(i => i.id !== item.id),
    }));
  };
  const handleAddToLesson = (item) => { setPreviewItem(null); setAddToLessonItem(item); };

  // ✅ Fixed: was navigate("/dashboard/trainer") → now /trainer/dashboard
  const handleLessonConfirm = (lessonName) => {
    setAddToLessonItem(null);
    navigate("/trainer/dashboard", {
      state: { addedContent: addToLessonItem, selectedLesson: lessonName, from: "ai-studio" }
    });
  };

  const handleRegenerate = (item) => {
    const tabMap = { audio: "Generate Audio Summary", video: "Create Video Explainer", walkthrough: "Build Interactive Walkthrough" };
    setActiveTab(tabMap[item.type] || "Generate Audio Summary");
    setGeneratingTool(item.type.charAt(0).toUpperCase() + item.type.slice(1));
  };

  // ✅ Fixed: was /trainer/analytics — correct
  const handleViewPerformance = () => navigate("/trainer/analytics");

  // ✅ Fixed: was /trainer/content-library — correct
  const handleViewAllHistory = () => navigate("/trainer/content-library");

  const handleBrowseContent = (setSelectedFn) => {
    const mockContent = { name: "Python Functions - Lesson 2.pdf", id: "c1" };
    setSelectedFn(mockContent);
  };

  const handleEnhanceContent = (content, enhancements) => {
    const newItem = { id: Date.now(), type: "audio", title: `Enhanced: ${content.name.substring(0, 20)}`, meta: "AI Enhanced • ~1 MB", status: "done" };
    setHistory(prev => ({ ...prev, today: [newItem, ...prev.today] }));
    addToast("Content enhanced! Preview or apply it to a lesson.", "View",
      () => historyRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const handlePauseJob = (id, shouldPause) => { if (shouldPause) jobStore.pause(id); else jobStore.resume(id); };
  const handleCancelJob = (id) => jobStore.cancel(id);

  const cardTitle = {
    "Generate Audio Summary": "Audio Summary Configuration",
    "Create Video Explainer": "Video Explainer Configuration",
    "Build Interactive Walkthrough": "Walkthrough Configuration",
  }[activeTab];
  const cardSub = {
    "Generate Audio Summary": "Convert long documents into bite-sized podcasts.",
    "Create Video Explainer": "Create engaging AI video presentations.",
    "Build Interactive Walkthrough": "Build step-by-step interactive guides.",
  }[activeTab];
  const cardBadge = {
    "Generate Audio Summary": "AI-Voice Active",
    "Create Video Explainer": "AI-Video Active",
    "Build Interactive Walkthrough": "AI-Walk Active",
  }[activeTab];
  const btnLabel = {
    "Generate Audio Summary": "Generate Audio",
    "Create Video Explainer": "Generate Video",
    "Build Interactive Walkthrough": "Build Walkthrough",
  }[activeTab];

  const tabList = [
    { icon: "description", label: "Generate Audio Summary" },
    { icon: "video_library", label: "Create Video Explainer" },
    { icon: "directions_run", label: "Build Interactive Walkthrough" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        body { font-family: 'Lexend', sans-serif; background: #f6f7f8; margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {generatingTool && <GeneratingModal tool={generatingTool} onDone={onGenerateDone} onNavigateAway={onGenerateNavigateAway} />}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} onAddToLesson={handleAddToLesson} onRegenerate={handleRegenerate} />}
      {addToLessonItem && <AddToLessonModal item={addToLessonItem} onClose={() => setAddToLessonItem(null)} onConfirm={handleLessonConfirm} />}
      {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleEditSave} />}
      {showWalkthroughPreview && <WalkthroughPreviewModal steps={steps} onClose={() => setShowWalkthroughPreview(false)} />}
      {toasts.map(t => (
        <Toast key={t.id} message={t.msg} actionLabel={t.actionLabel}
          onAction={() => { t.onAction?.(); removeToast(t.id); }}
          onClose={() => removeToast(t.id)} />
      ))}

      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Lexend',sans-serif", backgroundColor: "#f6f7f8" }}>
        <TrainerSidebar />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-[#137fec] p-1.5 rounded-lg text-white flex-shrink-0">
                  <Icon name="auto_awesome" className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Trainer AI Studio</h2>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                {["Creation Hub", "Library", "Templates", "Analytics"].map(link => (
                  <button key={link}
                    onClick={() => {
                      setActiveNav(link);
                      if (link === "Analytics") handleViewPerformance();
                    }}
                    className={`text-sm font-medium transition-colors ${activeNav === link ? "text-[#137fec] font-semibold" : "text-slate-500 hover:text-[#137fec]"}`}>
                    {link}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-100 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm w-64"
                  placeholder="Search projects..." />
              </div>
              <TrainerProfileDropdown name="Dr. Smith" role="Lead Trainer" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scroll p-8" style={{ paddingBottom: walkthroughOpen ? "320px" : "32px" }}>
            <div className="max-w-6xl mx-auto">

              {/* ✅ Fixed breadcrumbs: both now go to /trainer/dashboard */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <button onClick={() => navigate("/trainer/dashboard")}
                  className="hover:text-[#137fec] transition-colors font-medium">
                  Dashboard
                </button>
                <Icon name="chevron_right" className="text-xs" />
                <button onClick={() => navigate("/trainer/dashboard")}
                  className="hover:text-[#137fec] transition-colors font-medium">
                  Back to Course
                </button>
                <Icon name="chevron_right" className="text-xs" />
                <span className="text-slate-900 font-semibold">AI Content Studio</span>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Content Creation Studio</h1>
                <p className="text-slate-500 text-lg">Transform text-based training into rich media experiences in seconds.</p>
              </div>

              {jobs.length > 0 && <ProcessingQueue jobs={jobs} onPause={handlePauseJob} onCancel={handleCancelJob} />}

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
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{cardTitle}</h3>
                        <p className="text-xs text-slate-400">{cardSub}</p>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100 uppercase whitespace-nowrap flex-shrink-0">
                        {cardBadge}
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Script or Upload Document</label>
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
                                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all
                                    ${voiceTone === tone ? "border-2 border-[#137fec] bg-[#137fec]/5 text-[#137fec]" : "border border-slate-200 hover:border-[#137fec] text-slate-600"}`}>
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
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {[{ bg: "bg-indigo-300", l: "S" }, { bg: "bg-rose-300", l: "J" }, { bg: "bg-amber-300", l: "M" }].map((a, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${a.bg} flex items-center justify-center text-white text-[10px] font-bold`}>{a.l}</div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+12</div>
                          </div>
                          <button onClick={handleViewPerformance}
                            className="text-xs font-bold text-[#137fec] hover:underline flex items-center gap-1">
                            <Icon name="analytics" className="text-sm" />View Performance
                          </button>
                        </div>
                        <button onClick={handleGenerate}
                          className="bg-[#137fec] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#137fec]/30 hover:bg-[#0f6fd4] transition-all flex items-center gap-2">
                          <Icon name="auto_fix_high" className="text-lg" />{btnLabel}
                        </button>
                      </div>
                    </div>
                  </div>

                  <EnhanceContentCard onBrowse={handleBrowseContent} onEnhance={handleEnhanceContent} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#137fec]/40 transition-all cursor-pointer group"
                      onClick={() => setActiveTab("Create Video Explainer")}>
                      <div className="w-12 h-12 rounded-xl bg-[#137fec]/10 text-[#137fec] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="person_play" className="text-3xl" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Avatar Presenter</h4>
                      <p className="text-xs text-slate-500 mb-4">AI humans that speak your script with natural lip-sync and gestures.</p>
                      <div className="flex items-center gap-2 text-[#137fec] text-xs font-bold">
                        Setup Avatar <Icon name="arrow_forward" className="text-sm" />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#137fec]/40 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="animation" className="text-3xl" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Animated Slides</h4>
                      <p className="text-xs text-slate-500 mb-4">Auto-generate dynamic slides and motion graphics based on your text content.</p>
                      <div className="flex items-center gap-2 text-[#137fec] text-xs font-bold">
                        Choose Style <Icon name="arrow_forward" className="text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6" id="generation-history" ref={historyRef}>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col" style={{ height: "650px" }}>
                    <div className="p-6 border-b border-slate-100 flex-shrink-0">
                      <h3 className="font-bold text-slate-800">Generation History</h3>
                      <p className="text-xs text-slate-400">Manage your recent AI-generated assets.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#137fec] rounded-full inline-block" />Today
                        </p>
                        <div className="space-y-3">
                          {history.today.map(item => (
                            <HistoryItem key={item.id} item={item} onPreview={handlePreview}
                              onReuse={handleReuse} onEdit={handleEdit} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Yesterday</p>
                        <div className="space-y-3">
                          {history.yesterday.map(item => (
                            <HistoryItem key={item.id} item={item} onPreview={handlePreview}
                              onReuse={handleReuse} onEdit={handleEdit} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleViewAllHistory}
                      className="m-6 mt-0 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 flex-shrink-0">
                      <Icon name="history" className="text-sm" />View All History
                    </button>
                  </div>
                </div>
              </div>

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
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-all">Support Docs</button>
                  <button className="px-5 py-2.5 bg-[#137fec] rounded-xl text-sm font-bold shadow-lg shadow-[#137fec]/20 hover:scale-105 transition-transform">Invite Team</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

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
            <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                Step Count:
                <select value={stepCount} onChange={e => setStepCount(e.target.value)}
                  className="bg-slate-100 border-none py-1 px-3 rounded text-[10px] font-bold focus:outline-none">
                  {["3 Steps", "5 Steps", "10 Steps"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="w-[1px] h-6 bg-slate-200" />
              <button onClick={e => { e.stopPropagation(); setWalkthroughOpen(p => !p); }}>
                <Icon name={walkthroughOpen ? "expand_more" : "expand_less"} className="text-slate-400" />
              </button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4">
            {steps.map((step) => (
              <button key={step.id}
                className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-[#137fec] hover:bg-[#137fec]/5 transition-all group">
                <Icon name="add_circle" className="text-slate-300 group-hover:text-[#137fec] block mb-2 transition-colors" />
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-[#137fec] transition-colors">{step.label}</p>
              </button>
            ))}
            <div className="flex items-center justify-center p-3">
              <button onClick={addStep} className="text-xs font-bold text-[#137fec] flex items-center gap-1 hover:underline">
                <Icon name="add" className="text-sm" />Add more
              </button>
            </div>
          </div>
          <div className="flex gap-3 pb-4">
            <button onClick={() => setShowWalkthroughPreview(true)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              Preview Walkthrough
            </button>
            <button onClick={() => addToast("Walkthrough saved!", null, null)}
              className="px-5 py-2.5 bg-white border border-[#137fec] text-[#137fec] rounded-xl text-sm font-bold hover:bg-[#137fec]/5 transition-all">
              Save
            </button>
            <button onClick={() => setAddToLessonItem({ title: "Interactive Walkthrough", type: "walkthrough" })}
              className="px-5 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold hover:bg-[#0f6fd4] transition-all flex items-center gap-2">
              <Icon name="add_circle" className="text-lg" />Add to Lesson
            </button>
          </div>
        </div>
      </div>
    </>
  );
}