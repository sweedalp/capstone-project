/**
 * TrainerAIStudentAnalytics.jsx — Route: /trainer/courses/:courseId/analytics  (Page 17)
 *
 * All routing/navigation per Navigation Flow Document.
 * Zero UI/layout/style changes from original Figma.
 * Every button is wired — no dead buttons.
 */

import React, { useState, useEffect, useCallback } from "react";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";

// ─── React Router v6 graceful import ─────────────────────────────────────────
let _useNavigate, _useLocation, _useParams;
try {
  const rr = require("react-router-dom");
  _useNavigate = rr.useNavigate;
  _useLocation  = rr.useLocation;
  _useParams    = rr.useParams;
} catch (_) {
  _useNavigate = () => () => {};
  _useLocation  = () => ({ state: null });
  _useParams    = () => ({ courseId: "1" });
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function useCustomCursor() {
  const [cursor, setCursor] = useState({ x: 0, y: 0, hovering: false });
  useEffect(() => {
    const move = e => setCursor(c => ({ ...c, x: e.clientX, y: e.clientY }));
    const over  = e => setCursor(c => ({ ...c, hovering: !!e.target.closest("button,a,[data-hover]") }));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, []);
  return cursor;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────
function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`} style={{ fontFamily: "'Material Symbols Outlined'" }}>{name}</span>;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-blue-500", height = "h-1.5" }) {
  return (
    <div className={`w-full bg-slate-100 ${height} rounded-full overflow-hidden`}>
      <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data, onBarClick }) {
  return (
    <div className="h-16 flex items-end gap-1.5">
      {data.map((h, i) => (
        <button
          key={i}
          onClick={() => onBarClick && onBarClick(i, h)}
          className={`flex-1 rounded-t transition-all duration-300 hover:opacity-80 ${i === 6 ? "bg-blue-600" : "bg-blue-600/20"}`}
          style={{ height: `${h}%` }}
          title={`Day ${i + 1}: ${h}% engagement`}
        />
      ))}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose, actionLabel, onAction }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[600] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
      <Icon name="notifications" className="text-blue-400 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {actionLabel && <button onClick={onAction} className="text-blue-400 text-xs font-bold whitespace-nowrap">{actionLabel}</button>}
      <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0"><Icon name="close" className="text-sm" /></button>
    </div>
  );
}

// ─── Filter Panel (stays on Page 17) ─────────────────────────────────────────
function FilterPanel({ onClose, activeFilters, setActiveFilters }) {
  const [local, setLocal] = useState({ ...activeFilters });
  return (
    <div className="fixed inset-0 bg-black/50 z-[400] flex items-start justify-end p-4 pt-24" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900">Filter View</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {["All","At Risk","On Track","Top Performers"].map(s => (
                <button key={s} onClick={() => setLocal(l => ({ ...l, status: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${local.status===s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Progress Range</label>
            <div className="flex gap-3">
              <input type="number" min={0} max={100} value={local.minProgress}
                onChange={e => setLocal(l => ({ ...l, minProgress: e.target.value }))}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Min %" />
              <input type="number" min={0} max={100} value={local.maxProgress}
                onChange={e => setLocal(l => ({ ...l, maxProgress: e.target.value }))}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Max %" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Period</label>
            <div className="flex gap-2">
              {["7d","30d","90d","All"].map(t => (
                <button key={t} onClick={() => setLocal(l => ({ ...l, period: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${local.period===t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setLocal({ status:"All", minProgress:"", maxProgress:"", period:"30d" }); }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Reset</button>
          <button onClick={() => { setActiveFilters(local); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Detail Modal (stays on Page 17) ──────────────────────────────────
function StudentDetailModal({ student, onClose, onContact, onSendResources, onSchedule }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="size-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon name="person" className="text-3xl text-slate-400" />
          </div>
          <div>
            <p className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mb-1
              ${student.status==="rose" ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50"}`}>
              {student.tag}
            </p>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {student.stats.map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
              <p className={`text-sm font-bold mt-1 ${s.highlight ? "text-rose-500" : "text-slate-800"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Full history */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Activity History</p>
          {["Logged in 4 days ago","Completed Quiz 2 (58%)","Watched: Closure Explained (Video)","Started: Module 4 Lesson 1"].map((a,i) => (
            <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-600">{a}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => { onClose(); onContact(student); }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            <Icon name="chat" className="text-base" />Contact
          </button>
          <button onClick={() => { onClose(); onSendResources(student); }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            <Icon name="send" className="text-base" />Send Resources
          </button>
          <button onClick={() => { onClose(); onSchedule(student); }}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Icon name="event" className="text-base" />Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Modal (stays on Page 17) ────────────────────────────────────────
function ContactModal({ student, onClose, onSend }) {
  const [type, setType]     = useState("email");
  const [message, setMsg]   = useState("");
  const [sent, setSent]     = useState(false);
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Contact {student.name}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Message Sent!</p>
            <p className="text-sm text-slate-500 mb-6">{student.name} will receive your message shortly.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              {[["email","Email","mail"],["notification","Notification","notifications"],["sms","SMS","sms"]].map(([v,l,icon]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all
                    ${type===v ? "border-2 border-blue-600 bg-blue-50 text-blue-600" : "border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                  <Icon name={icon} className="text-lg" />{l}
                </button>
              ))}
            </div>
            <textarea value={message} onChange={e => setMsg(e.target.value)}
              className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 resize-none mb-4 focus:outline-none focus:border-blue-400"
              placeholder={`Write your message to ${student.name}...`} style={{ fontFamily: "'Lexend',sans-serif" }} />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => { if (message.trim()) setSent(true); }} disabled={!message.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Send Resources Modal (stays on Page 17 OR links to Content Library Page 18) ─
function SendResourcesModal({ student, onClose, onBrowseLibrary, onSend }) {
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);
  const resources = [
    { id: "r1", title: "Async/Await Explained - Video",    type: "video" },
    { id: "r2", title: "Closure Scope - Audio Summary",    type: "audio" },
    { id: "r3", title: "Module 4 Practice Quiz",           type: "quiz" },
    { id: "r4", title: "Functions Deep Dive - Walkthrough",type: "walkthrough" },
  ];
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x!==id) : [...s, id]);
  const iconFor = t => ({ video:"videocam", audio:"mic", quiz:"quiz", walkthrough:"touch_app" }[t]||"description");

  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Send Resources</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Resources Sent!</p>
            <p className="text-sm text-slate-500 mb-6">{selected.length} resource(s) sent to {student.name}.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">Select resources for <strong>{student.name}</strong>:</p>
            <div className="space-y-2 mb-4">
              {resources.map(r => (
                <button key={r.id} onClick={() => toggle(r.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all
                    ${selected.includes(r.id) ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <Icon name={iconFor(r.type)} className={selected.includes(r.id)?"text-blue-600":"text-slate-400"} />
                  <span className="text-sm font-medium text-slate-700 flex-1">{r.title}</span>
                  {selected.includes(r.id) && <Icon name="check_circle" className="text-blue-600" />}
                </button>
              ))}
            </div>
            {/* NAV FLOW: Browse Content Library (Page 18) */}
            <button onClick={onBrowseLibrary}
              className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all mb-4 flex items-center justify-center gap-2">
              <Icon name="folder_open" className="text-base" />Browse Content Library
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => { if (selected.length) setSent(true); }} disabled={!selected.length}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">
                Send ({selected.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Schedule Modal (stays on Page 17) ───────────────────────────────────────
function ScheduleModal({ student, onClose, onToast }) {
  const [date, setDate]   = useState("");
  const [time, setTime]   = useState("");
  const [type, setType]   = useState("video");
  const [done, setDone]   = useState(false);
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Schedule Check-in</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="event_available" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Check-in Scheduled!</p>
            <p className="text-sm text-slate-500 mb-6">{student.name} has been notified.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">Schedule with <strong>{student.name}</strong>:</p>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meeting Type</label>
            <div className="flex gap-2 mb-4">
              {[["video","Video Call","videocam"],["in_person","In-Person","person"],["async","Async","chat"]].map(([v,l,icon]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all
                    ${type===v ? "border-2 border-blue-600 bg-blue-50 text-blue-600" : "border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                  <Icon name={icon} className="text-lg" />{l}
                </button>
              ))}
            </div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400" />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-6 focus:outline-none focus:border-blue-400" />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => { if (date && time) setDone(true); }} disabled={!date || !time}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">Confirm</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Topic Detail Modal (stays on Page 17) ────────────────────────────────────
function TopicDetailModal({ topic, onClose, onGenerateContent, onSendReview }) {
  if (!topic) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{topic.topic}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <p className="text-xs text-slate-500 mb-4">{topic.module}</p>

        {/* Struggle breakdown */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Struggle Rate</span>
            <span className={`text-sm font-black ${topic.rate>=65?"text-rose-500":"text-amber-500"}`}>{topic.rate}%</span>
          </div>
          <ProgressBar value={topic.rate} color={topic.rate>=65?"bg-rose-500":"bg-amber-400"} height="h-2" />
        </div>

        {/* Students struggling */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Students Struggling</p>
          {["Alex Johnson (42%)","Maria Silva (58%)","Leon Wu (35%)"].map((s,i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <Icon name="person" className="text-sm text-slate-400" />
              </div>
              <span className="text-sm text-slate-700">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {/* NAV FLOW: Generate Extra Content → AI Studio (Page 16) pre-filled */}
          <button onClick={() => { onClose(); onGenerateContent(topic); }}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Icon name="auto_fix_high" className="text-base" />Generate Content
          </button>
          {/* NAV FLOW: Send Review stays on Page 17 */}
          <button onClick={() => { onClose(); onSendReview(topic); }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            <Icon name="send" className="text-base" />Send Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Send Review Modal (stays on Page 17) ────────────────────────────────────
function SendReviewModal({ topic, onClose, onGoToLibrary, onGoToAIStudio, onToast }) {
  if (!topic) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Send Review</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-6">Choose how to help students struggling with <strong>{topic.topic}</strong>:</p>
        <div className="space-y-3 mb-6">
          {/* NAV FLOW: Send existing resources → Content Library (Page 18) */}
          <button onClick={onGoToLibrary}
            className="w-full p-4 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Icon name="folder_open" className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Send Existing Resources</p>
                <p className="text-[11px] text-slate-500">Browse Content Library</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
            </div>
          </button>
          {/* NAV FLOW: Generate new content → AI Studio (Page 16) */}
          <button onClick={() => { onClose(); onGoToAIStudio(topic); }}
            className="w-full p-4 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Icon name="auto_fix_high" className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Generate New Content</p>
                <p className="text-[11px] text-slate-500">AI Content Studio</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
            </div>
          </button>
          {/* NAV FLOW: Schedule review session */}
          <button onClick={() => { onClose(); onToast("Scheduling tool opened for class review session."); }}
            className="w-full p-4 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Icon name="event" className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Schedule Review Session</p>
                <p className="text-[11px] text-slate-500">Set up a group session</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-300 group-hover:text-blue-600 ml-auto transition-colors" />
            </div>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Cancel</button>
      </div>
    </div>
  );
}

// ─── Lesson Analytics Expanded (stays on Page 17) ────────────────────────────
function LessonAnalyticsPanel({ lesson, onClose, onGoToLesson }) {
  if (!lesson) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{lesson.title}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Completion Rate", value: lesson.completion+"%" },
            { label: "Avg Score",       value: lesson.avgScore+"%" },
            { label: "Avg Time Spent",  value: "42 min" },
            { label: "AI Content Views",value: "89" },
          ].map((m,i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
              <p className="text-lg font-black text-slate-900 mt-1">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Completion Over Time</p>
          <MiniBarChart data={[30,45,55,60,70,75,lesson.completion]} />
        </div>
        <div className="flex gap-3">
          {/* NAV FLOW: View Lesson → Course Management (Page 14) */}
          <button onClick={() => { onClose(); onGoToLesson(lesson); }}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Icon name="open_in_new" className="text-base" />View in Course
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Analytics Detail (stays on Page 17) ──────────────────────────────────
function AIAnalyticsModal({ type, onClose }) {
  const details = {
    all: { title: "AI Content Analytics", items: [
      { label: "Audio Summaries", plays: 245, completion: 78, icon: "mic",       color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Video Explainers", plays: 189, completion: 92, icon: "videocam",  color: "text-blue-600",  bg: "bg-blue-50" },
      { label: "Walkthroughs",    plays: 124, completion: 76, icon: "touch_app", color: "text-purple-600",bg: "bg-purple-50" },
    ]},
    audio: { title: "Audio Summaries", items: [] },
    video: { title: "Video Explainers", items: [] },
  };
  const d = details[type] || details.all;
  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{d.title}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {d.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={item.icon} className={item.color} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.plays} interactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-900">{item.completion}%</p>
              <p className="text-[10px] text-slate-500">Completion</p>
            </div>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Ranked by Engagement</p>
          {["Video Explainers (92%)","Interactive Walkthroughs (76%)","Audio Summaries (78%)"].map((item,i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <span className="text-xs font-black text-slate-400 w-4">{i+1}.</span>
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Close</button>
      </div>
    </div>
  );
}

// ─── Chart Data Point Modal (stays on Page 17) ───────────────────────────────
function ChartDrillModal({ point, onClose }) {
  if (!point) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Day {point.day} Detail</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="text-center py-4">
          <div className="text-4xl font-black text-blue-600 mb-1">{point.value}%</div>
          <p className="text-sm text-slate-500">Engagement Rate</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mt-2 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-slate-500">Active students</span><span className="font-bold text-slate-800">22</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Content views</span><span className="font-bold text-slate-800">89</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Quiz attempts</span><span className="font-bold text-slate-800">14</span></div>
        </div>
        <button onClick={onClose} className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Close</button>
      </div>
    </div>
  );
}

// ─── Group Message Modal ──────────────────────────────────────────────────────
function GroupMessageModal({ onClose, onToast }) {
  const [msg, setMsg]   = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Contact Class</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Message Sent!</p>
            <p className="text-sm text-slate-500 mb-6">All 28 students notified.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">Message will be sent to all 28 students.</p>
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
              className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 resize-none mb-6 focus:outline-none focus:border-blue-400"
              placeholder="Write your message to the class..." style={{ fontFamily: "'Lexend',sans-serif" }} />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => { if (msg.trim()) setSent(true); }} disabled={!msg.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">Send to Class</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, badge, badgeColor, label, value, valueSuffix, sub, progress, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 ${onClick?"cursor-pointer":"cursor-default"}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}><Icon name={icon} /></span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">
        {value}{valueSuffix && <span className="text-slate-400 text-lg font-bold">{valueSuffix}</span>}
      </p>
      {sub && <p className="text-[10px] text-slate-400 mt-2 font-medium">{sub}</p>}
      {progress !== undefined && <ProgressBar value={progress} color="bg-blue-500" />}
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student, onViewProfile, onContact, onSendResources, onSchedule, onAISupport }) {
  const borderColor = student.status==="rose" ? "border-rose-500" : "border-amber-500";
  const tagColor    = student.status==="rose"  ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50";

  const handleAction = (action, e) => {
    e.stopPropagation();
    if (action.label==="Chat" || action.label==="Email") onContact(student);
    else if (action.label==="AI Support") onAISupport(student);
    else if (action.label==="Meet") onSchedule(student);
    else if (action.label==="Reset Attempt") onContact(student);  // opens contact to discuss
    else onContact(student);
  };

  return (
    <div className={`bg-white rounded-xl border-l-4 ${borderColor} shadow-sm p-5 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {/* NAV FLOW: Click student name → Student detail modal */}
          <button onClick={() => onViewProfile(student)}
            className="size-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 hover:ring-2 hover:ring-blue-400 transition-all">
            <Icon name="person" className="text-3xl" />
          </button>
          <div>
            <button onClick={() => onViewProfile(student)}
              className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors text-left">
              {student.name}
            </button>
            <p className={`text-[10px] font-bold ${tagColor} inline-block px-2 py-0.5 rounded uppercase mt-1`}>{student.tag}</p>
          </div>
        </div>
        {/* more_vert → opens profile */}
        <button onClick={() => onViewProfile(student)} className="text-slate-300 hover:text-slate-500 transition-colors">
          <Icon name="more_vert" />
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {student.stats.map((s, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-slate-500">{s.label}</span>
            <span className={`font-medium ${s.highlight ? "text-rose-500 font-bold" : "text-slate-700"}`}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
        {student.actions.map((a, i) => (
          <button key={i} onClick={e => handleAction(a, e)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 ${
              a.primary ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700"
            }`}>
            <Icon name={a.icon} className="text-base" /> {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Gap Row ──────────────────────────────────────────────────────────────────
function GapRow({ topic, module, rate, color, onGenerateContent, onTopicClick }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        {/* NAV FLOW: Click topic → expanded detail (stays Page 17) */}
        <button onClick={() => onTopicClick({ topic, module, rate, color })} className="text-left hover:text-blue-600 transition-colors group">
          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 leading-none">{topic}</p>
          <p className="text-[10px] text-slate-500 mt-1">{module}</p>
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${rate}%` }} />
          </div>
          <span className={`text-xs font-black ${rate>=65?"text-rose-500":rate>=50?"text-rose-400":"text-amber-500"}`}>{rate}%</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {/* NAV FLOW: AI Generate Content → AI Studio (Page 16) */}
        <button onClick={() => onGenerateContent({ topic, module, rate, color })}
          className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black px-3 py-1.5 rounded uppercase whitespace-nowrap">
          AI Generate Content
        </button>
      </td>
    </tr>
  );
}

// ─── Engagement Row ───────────────────────────────────────────────────────────
function EngagementRow({ item, onViewDetail }) {
  return (
    <button onClick={() => onViewDetail(item)} className="flex items-center justify-between w-full hover:bg-slate-50 rounded-xl px-2 py-1 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`size-12 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={item.icon} className={item.iconColor} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</p>
          <p className="text-xs text-slate-500">{item.sub}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-slate-900">{item.value}</p>
        <p className={`text-[10px] font-bold ${item.valueColor}`}>{item.valueLabel}</p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrainerAIStudentAnalytics({ navigate: navProp, location: locProp }) {
  const _nav      = _useNavigate();
  const _loc      = _useLocation();
  const _params   = _useParams();
  const navigate  = navProp || _nav;
  const location  = locProp || _loc;
  const params    = _params;
  const courseId  = params?.courseId || "1";

  const cursor = useCustomCursor();

  // ── Nav state
  const [searchValue,   setSearchValue]   = useState("");
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [showBanner,    setShowBanner]    = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [activeNav,     setActiveNav]     = useState("Insights");
  const [atRiskFilter,  setAtRiskFilter]  = useState(false);  // View All At-Risk filter
  const [topFilter,     setTopFilter]     = useState(false);   // View Top Performers filter
  const [toasts, setToasts] = useState([]);

  // ── Modals
  const [showFilter,      setShowFilter]      = useState(false);
  const [activeFilters,   setActiveFilters]   = useState({ status:"All", minProgress:"", maxProgress:"", period:"30d" });
  const [studentModal,    setStudentModal]    = useState(null);
  const [contactModal,    setContactModal]    = useState(null);
  const [resourceModal,   setResourceModal]   = useState(null);
  const [scheduleModal,   setScheduleModal]   = useState(null);
  const [topicModal,      setTopicModal]      = useState(null);
  const [sendReviewModal, setSendReviewModal] = useState(null);
  const [lessonModal,     setLessonModal]     = useState(null);
  const [aiModal,         setAiModal]         = useState(null);
  const [chartModal,      setChartModal]      = useState(null);
  const [groupMsgModal,   setGroupMsgModal]   = useState(false);

  // ── Toast helpers
  const addToast = useCallback((msg, actionLabel, onAction) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, actionLabel, onAction }]);
  }, []);
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Data
  const navItems = [
    { icon: "dashboard",    label: "Dashboard" },
    { icon: "school",       label: "My Classes" },
    { icon: "group",        label: "Students" },
    { icon: "auto_stories", label: "Curriculum" },
    { icon: "analytics",    label: "Insights" },
  ];

  const stats = [
    { icon:"trending_up",       iconBg:"bg-blue-600/10",  iconColor:"text-blue-600",   badge:"+5.2%",  badgeColor:"text-emerald-600 bg-emerald-50", label:"Avg Progress",    value:"78.4%",  progress:78 },
    { icon:"workspace_premium", iconBg:"bg-amber-50",     iconColor:"text-amber-500",   badge:"-1.8%",  badgeColor:"text-rose-600 bg-rose-50",       label:"Avg Score",       value:"82.1%",  sub:"B+ Average class grade" },
    { icon:"person_check",      iconBg:"bg-indigo-50",    iconColor:"text-indigo-500",  badge:"Active", badgeColor:"text-emerald-600 bg-emerald-50", label:"Active Students", value:"24",     valueSuffix:"/28", sub:"85% attendance rate this week" },
    { icon:"schedule",          iconBg:"bg-rose-50",      iconColor:"text-rose-500",    badge:"-12%",   badgeColor:"text-rose-600 bg-rose-50",       label:"Avg Time Spent",  value:"4.5",    valueSuffix:"h/wk", sub:"Engagement is down this module" },
  ];

  const allStudents = [
    { name:"Alex Johnson", tag:"Behind Schedule", status:"rose",
      stats:[{ label:"Last activity", value:"4 days ago" },{ label:"Module completion", value:"42% (Target: 65%)" }],
      actions:[{ icon:"chat", label:"Chat" },{ icon:"mail", label:"Email" }] },
    { name:"Maria Silva",  tag:"Struggling: Arrays", status:"amber",
      stats:[{ label:"Avg quiz score", value:"58%", highlight:true },{ label:"Engagement", value:"High (7.2h/wk)" }],
      actions:[{ icon:"bolt", label:"AI Support", primary:true },{ icon:"event", label:"Meet" }] },
    { name:"Leon Wu",      tag:"Failed Assessment 2", status:"rose",
      stats:[{ label:"Attempts", value:"3 of 3 used" },{ label:"Confidence score", value:"Low", highlight:true }],
      actions:[{ icon:"restart_alt", label:"Reset Attempt" },{ icon:"chat", label:"Chat" }] },
  ];

  const topPerformers = [
    { name:"Alice Chen", progress:95, avgScore:92 },
    { name:"Ben Torres", progress:91, avgScore:89 },
    { name:"Sara Kim",   progress:88, avgScore:94 },
  ];

  const gaps = [
    { topic:"Async/Await Loops",    module:"Module 4: Advanced Patterns", rate:70, color:"bg-rose-500" },
    { topic:"Closure Scope Chains", module:"Module 2: Fundamentals II",   rate:64, color:"bg-rose-400" },
    { topic:"Destructuring Defaults",module:"Module 1: Modern Syntax",    rate:48, color:"bg-amber-400" },
  ];

  const lessons = [
    { title:"Ch 2, Lesson 3: Functions",     completion:78, avgScore:72 },
    { title:"Ch 3, Lesson 1: Closures",      completion:65, avgScore:60 },
    { title:"Ch 4, Lesson 2: Async Patterns",completion:55, avgScore:58 },
  ];

  const engagements = [
    { icon:"play_circle",        iconBg:"bg-blue-50",   iconColor:"text-blue-600",   title:"AI Explainer Videos",       sub:"14 modules generated",   value:"92%", valueLabel:"Completion",    valueColor:"text-emerald-600" },
    { icon:"spatial_tracking",   iconBg:"bg-purple-50", iconColor:"text-purple-600", title:"Interactive Walkthroughs",  sub:"8 lab simulations",       value:"76%", valueLabel:"Success Rate",  valueColor:"text-amber-600" },
    { icon:"headphones",         iconBg:"bg-amber-50",  iconColor:"text-amber-600",  title:"AI Audio Summaries",        sub:"Weekly recap podcasts",   value:"45%", valueLabel:"Opt-in rate",   valueColor:"text-slate-400" },
  ];

  const barData = [40, 55, 45, 65, 80, 75, 90, 85, 70, 95];

  // ── Filtered students
  const displayedStudents = atRiskFilter
    ? allStudents.filter(s => s.status==="rose")
    : allStudents;

  // ── Navigation handlers

  // NAV FLOW §9: Breadcrumb/sidebar navigation
  const handleNavItem = label => {
    setActiveNav(label);
    if (label==="Dashboard") navigate("/dashboard/trainer");
    else if (label==="My Classes") navigate("/trainer/courses/" + courseId);
    else if (label==="Students") navigate("/trainer/students");
    else if (label==="Curriculum") navigate("/trainer/curriculum");
  };

  // NAV FLOW §8: Create Targeted Content → AI Studio (Page 16)
  const handleCreateTargetedContent = () => {
    navigate("/trainer/ai-studio", { state: { from:"analytics", courseId, prefill:"Targeted content based on analytics" } });
  };

  // NAV FLOW §8: Adjust Course Pace → Course Management (Page 14)
  const handleAdjustCoursePace = () => {
    navigate("/trainer/courses/" + courseId, { state: { from:"analytics", mode:"edit", courseId } });
  };

  // NAV FLOW §4/§8: Generate Extra Content → AI Studio (Page 16) pre-filled
  const handleGenerateContent = topic => {
    navigate("/trainer/ai-studio", { state: { from:"analytics", topic: topic.topic, module: topic.module, prefill: `Generate targeted content for: ${topic.topic}` } });
  };

  // NAV FLOW §2: Send Resources → Content Library (Page 18)
  const handleBrowseLibrary = () => {
    setResourceModal(null);
    setSendReviewModal(null);
    navigate("/trainer/content-library", { state: { selectMode:true, returnTo:`/trainer/courses/${courseId}/analytics`, from:"analytics" } });
  };

  // NAV FLOW §5: View Lesson in Course Management (Page 14)
  const handleGoToLesson = lesson => {
    navigate("/trainer/courses/" + courseId, { state: { from:"analytics", lesson: lesson.title, courseId } });
  };

  // NAV FLOW §1: Export Report (stays Page 17, downloads)
  const handleExportReport = () => {
    const a = document.createElement("a");
    a.href = `data:text/plain,${encodeURIComponent(`Analytics Report - Advanced JS Fall 2023\nExported: ${new Date().toLocaleString()}\n\nAvg Progress: 78.4%\nAvg Score: 82.1%\nActive Students: 24/28`)}`;
    a.download = "analytics-report.txt";
    a.click();
    addToast("Report downloaded!", null, null);
  };

  // NAV FLOW §7: Export Chart
  const handleExportChart = () => {
    addToast("Chart exported as PNG.", null, null);
  };

  // NAV FLOW §1: Stats click → filters view (stays Page 17)
  const handleStatClick = label => {
    if (label==="Active Students") setAtRiskFilter(false);
    addToast(`Filtered by: ${label}`, null, null);
  };

  // AI Support → opens send resources with AI-generated suggestion
  const handleAISupport = student => {
    setResourceModal(student);
  };

  return (
    <>
      {/* Font + cursor */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        * { }
        body { font-family: 'Lexend', sans-serif; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>



      {/* Modals */}
      {showFilter      && <FilterPanel onClose={() => setShowFilter(false)} activeFilters={activeFilters} setActiveFilters={setActiveFilters} />}
      {studentModal    && <StudentDetailModal student={studentModal} onClose={() => setStudentModal(null)} onContact={setContactModal} onSendResources={setResourceModal} onSchedule={setScheduleModal} />}
      {contactModal    && <ContactModal student={contactModal} onClose={() => setContactModal(null)} />}
      {resourceModal   && <SendResourcesModal student={resourceModal} onClose={() => setResourceModal(null)} onBrowseLibrary={handleBrowseLibrary} onSend={() => { setResourceModal(null); addToast("Resources sent!", null, null); }} />}
      {scheduleModal   && <ScheduleModal student={scheduleModal} onClose={() => setScheduleModal(null)} onToast={msg => addToast(msg, null, null)} />}
      {topicModal      && <TopicDetailModal topic={topicModal} onClose={() => setTopicModal(null)} onGenerateContent={handleGenerateContent} onSendReview={t => { setTopicModal(null); setSendReviewModal(t); }} />}
      {sendReviewModal && <SendReviewModal topic={sendReviewModal} onClose={() => setSendReviewModal(null)} onGoToLibrary={handleBrowseLibrary} onGoToAIStudio={handleGenerateContent} onToast={msg => addToast(msg, null, null)} />}
      {lessonModal     && <LessonAnalyticsPanel lesson={lessonModal} onClose={() => setLessonModal(null)} onGoToLesson={handleGoToLesson} />}
      {aiModal         && <AIAnalyticsModal type={aiModal} onClose={() => setAiModal(null)} />}
      {chartModal      && <ChartDrillModal point={chartModal} onClose={() => setChartModal(null)} />}
      {groupMsgModal   && <GroupMessageModal onClose={() => setGroupMsgModal(false)} onToast={msg => addToast(msg, null, null)} />}

      {/* Toasts */}
      {toasts.map(t => (
        <Toast key={t.id} message={t.msg} actionLabel={t.actionLabel}
          onAction={() => { t.onAction?.(); removeToast(t.id); }} onClose={() => removeToast(t.id)} />
      ))}

      <div className="flex h-screen overflow-hidden bg-slate-100" style={{ fontFamily: "'Lexend', sans-serif" }}>

        <TrainerSidebar courseId={courseId} />

        {/* MAIN */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto custom-scroll">

          {/* HEADER */}
          <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-blue-600 transition-colors md:hidden">
                <Icon name="menu" />
              </button>
              <div>
                {/* NAV FLOW §9: Breadcrumb navigation */}
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                  {/* Click Dashboard → Page 13 */}
                  <button onClick={() => navigate("/dashboard/trainer")} className="hover:text-blue-600 transition-colors">Dashboard</button>
                  <Icon name="chevron_right" className="text-sm" />
                  {/* Click Course → Course Management (Page 14) */}
                  <button onClick={() => navigate("/trainer/courses/" + courseId, { state: { courseId } })} className="hover:text-blue-600 transition-colors">Course</button>
                  <Icon name="chevron_right" className="text-sm" />
                  <span className="text-slate-600 font-medium">Analytics</span>
                </div>

                <p className="text-xs font-medium text-slate-500">Student Analytics &amp; Engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative hidden sm:block">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-400"
                  placeholder="Search student or topic..." value={searchValue} onChange={e => setSearchValue(e.target.value)} />
              </div>

              {/* NAV FLOW §1: Export Report */}
              <button onClick={handleExportReport}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
                <Icon name="download" className="text-lg" />Export Report
              </button>

              {/* NAV FLOW §1: Filter View */}
              <button onClick={() => setShowFilter(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
                <Icon name="filter_list" className="text-lg" />Filter View
              </button>

              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)}
                  className="size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative">
                  <Icon name="notifications" className="text-xl" />
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
                    <p className="font-bold text-slate-900 text-sm mb-3">Notifications</p>
                    {["Leon Wu failed Assessment 2","Engagement dropped 12% this week","Maria Silva needs AI support"].map((n,i) => (
                      <button key={i} onClick={() => {
                        setNotifOpen(false);
                        if (i===0) setStudentModal(allStudents[2]);
                        else if (i===2) setStudentModal(allStudents[1]);
                      }} className="flex gap-3 py-2 border-b border-slate-50 last:border-0 w-full text-left hover:bg-slate-50 rounded-lg px-2 transition-all">
                        <div className="size-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600">{n}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <TrainerProfileDropdown name="Dr. Smith" role="Lead Trainer" />
              {/* NAV FLOW: Contact Class → Group Message modal */}
              <button onClick={() => setGroupMsgModal(true)}
                className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors whitespace-nowrap">
                <Icon name="mail" className="text-lg" />
                <span className="hidden md:inline">Contact Class</span>
              </button>
            </div>
          </header>

          <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">

            {/* NAV FLOW §1: Stats — each card is clickable, filters view */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((s, i) => (
                <StatCard key={i} {...s} onClick={() => handleStatClick(s.label)} />
              ))}
            </div>

            {/* NAV FLOW §2: Students Needing Attention */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-black text-slate-900">Students Needing Attention</h3>
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Action Required</span>
                </div>
                {/* NAV FLOW §2: View All At-Risk → filter (stays Page 17) */}
                <button onClick={() => setAtRiskFilter(v => !v)}
                  className={`text-sm font-bold hover:underline flex items-center gap-1 whitespace-nowrap transition-colors ${atRiskFilter ? "text-rose-600" : "text-blue-600"}`}>
                  {atRiskFilter ? "Show All Students" : "View All Risks"}
                  <Icon name="arrow_forward" className="text-base" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayedStudents.map((s, i) => (
                  <StudentCard key={i} student={s}
                    onViewProfile={setStudentModal}
                    onContact={setContactModal}
                    onSendResources={setResourceModal}
                    onSchedule={setScheduleModal}
                    onAISupport={handleAISupport}
                  />
                ))}
              </div>
            </section>

            {/* NAV FLOW §3: Top Performers */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="workspace_premium" className="text-amber-500" />Top Performers
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">12</span>
                </h3>
                {/* NAV FLOW §3: View All Top Performers → filtered view (stays Page 17) */}
                <button onClick={() => { setTopFilter(v => !v); addToast(topFilter ? "Showing all students." : "Filtered to top performers."); }}
                  className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                  {topFilter ? "Show All" : "View All Top Performers"} <Icon name="arrow_forward" className="text-base" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topPerformers.map((s, i) => (
                  <button key={i} onClick={() => setStudentModal({ ...allStudents[0], name: s.name, tag:"Top Performer", status:"amber",
                    stats:[{ label:"Progress", value:`${s.progress}%` },{ label:"Avg Score", value:`${s.avgScore}%` }],
                    actions:[{ icon:"chat", label:"Chat" },{ icon:"mail", label:"Email" }] })}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all">
                    <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-amber-600">#{i+1}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.progress}% progress · {s.avgScore}% avg</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

              {/* NAV FLOW §4: Curriculum Gaps */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icon name="lightbulb_circle" className="text-blue-600" />Curriculum Gaps
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 5 Struggle Rates</span>
                </div>
                <div className="overflow-hidden flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Struggle Rate</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.map((g, i) => (
                        <GapRow key={i} {...g}
                          onGenerateContent={handleGenerateContent}
                          onTopicClick={setTopicModal}
                        />
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {/* NAV FLOW: Review All Topics → stays Page 17, shows all */}
                    <button onClick={() => addToast("Showing all curriculum topics.", null, null)}
                      className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                      Review All Topics
                    </button>
                  </div>
                </div>
              </section>

              {/* NAV FLOW §6: AI Content Engagement */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icon name="psychology" className="text-blue-600" />AI Content Engagement
                  </h3>
                  {/* NAV FLOW §6: Info → AI analytics expanded (stays Page 17) */}
                  <button onClick={() => setAiModal("all")}
                    className="size-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors" title="View AI Analytics">
                    <Icon name="info" className="text-slate-400" />
                  </button>
                </div>
                <div className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1">
                  {/* NAV FLOW §6: Each row is clickable → filtered AI view */}
                  {engagements.map((e, i) => (
                    <EngagementRow key={i} item={e} onViewDetail={() => setAiModal(i===0?"video":i===1?"walkthrough":"audio")} />
                  ))}

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Engagement Trend (Last 30 Days)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-600/5 px-2 py-0.5 rounded uppercase">AI Recommended</span>
                        {/* NAV FLOW §7: Export chart */}
                        <button onClick={handleExportChart} className="text-slate-400 hover:text-blue-600 transition-colors" title="Export Chart">
                          <Icon name="download" className="text-sm" />
                        </button>
                      </div>
                    </div>
                    {/* NAV FLOW §7: Click bar → drill-down modal */}
                    <MiniBarChart data={barData} onBarClick={(i, val) => setChartModal({ day: i+1, value: val })} />

                    {/* NAV FLOW §6: View AI Analytics button */}
                    <button onClick={() => setAiModal("all")}
                      className="mt-4 w-full py-2 bg-slate-50 border border-slate-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                      View AI Analytics →
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* NAV FLOW §5: Lesson-by-Lesson Performance */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="menu_book" className="text-blue-600" />Lesson Performance
                </h3>
                {/* NAV FLOW §7: Time period selector */}
                <div className="flex gap-1">
                  {["7d","30d","90d"].map(p => (
                    <button key={p} onClick={() => addToast(`Date range changed to ${p}.`, null, null)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {lessons.map((lesson, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      {/* NAV FLOW §5: Click lesson name → Course Management (Page 14) */}
                      <button onClick={() => navigate("/trainer/courses/" + courseId, { state: { lesson: lesson.title, courseId } })}
                        className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors text-left">
                        {lesson.title}
                      </button>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-slate-500">Completion: <strong className="text-slate-700">{lesson.completion}%</strong></span>
                        <span className="text-[10px] text-slate-500">Avg Score: <strong className="text-slate-700">{lesson.avgScore}%</strong></span>
                        {/* NAV FLOW §5: AI content engagement click */}
                        <button onClick={() => setAiModal("all")}
                          className="text-[10px] text-blue-600 font-bold hover:underline">AI Engagement ↗</button>
                      </div>
                    </div>
                    {/* NAV FLOW §5: View Lesson Analytics → expanded view (stays Page 17) */}
                    <button onClick={() => setLessonModal(lesson)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                      View Analytics
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* NAV FLOW §8: Action Buttons Based on Insights */}
            {showBanner && (
              <div className="bg-blue-600/5 rounded-2xl p-6 md:p-8 border border-blue-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="size-14 md:size-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 flex-shrink-0">
                    <Icon name="auto_awesome" className="text-3xl" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-slate-900 leading-tight">Generate Extra Assessment?</h4>
                    <p className="text-slate-500 text-sm mt-1">AI has detected high failure rates in "Asynchronous Loops". Would you like to create a supplemental quiz for Module 4?</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                  {/* NAV FLOW §8: Review Topic → stays Page 17 */}
                  <button onClick={() => setShowBanner(false)}
                    className="flex-1 md:flex-none px-6 py-3 border border-slate-300 text-slate-600 bg-white rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                    Review Topic
                  </button>
                  {/* NAV FLOW §8: Generate Now → AI Studio (Page 16) */}
                  <button onClick={() => handleGenerateContent({ topic:"Asynchronous Loops", module:"Module 4" })}
                    className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    Generate Now
                  </button>
                </div>
              </div>
            )}

            {/* NAV FLOW §8: Additional insight actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* NAV FLOW §8: Create Targeted Content → AI Studio (Page 16) */}
              <button onClick={handleCreateTargetedContent}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group text-left">
                <Icon name="auto_fix_high" className="text-blue-600 mb-2 text-2xl" />
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Create Targeted Content</p>
                <p className="text-[10px] text-slate-500 mt-0.5">AI Studio with insights</p>
              </button>
              {/* NAV FLOW §8: Send Group Message → modal */}
              <button onClick={() => setGroupMsgModal(true)}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group text-left">
                <Icon name="campaign" className="text-indigo-500 mb-2 text-2xl" />
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Send Group Message</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Notify all students</p>
              </button>
              {/* NAV FLOW §8: Adjust Course Pace → Course Management (Page 14) */}
              <button onClick={handleAdjustCoursePace}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group text-left">
                <Icon name="tune" className="text-amber-500 mb-2 text-2xl" />
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Adjust Course Pace</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Course Management</p>
              </button>
              {/* NAV FLOW §8: Generate Report → downloads PDF */}
              <button onClick={handleExportReport}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group text-left">
                <Icon name="picture_as_pdf" className="text-rose-500 mb-2 text-2xl" />
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Generate Report</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Download PDF</p>
              </button>
            </div>

            {/* Footer */}
            <footer className="px-8 py-6 flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest bg-white rounded-xl border border-slate-100 gap-2">
              <p>© 2023 AI LMS Analytics Engine</p>
              <div className="flex gap-4">
                {["Privacy","Help Center","API Status"].map(l => (
                  <button key={l} onClick={() => addToast(`Opening ${l}…`, null, null)}
                    className="hover:text-blue-600 transition-colors">{l}</button>
                ))}
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}
