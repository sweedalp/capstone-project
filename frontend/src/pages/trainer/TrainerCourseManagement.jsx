import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */
function useCustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => setHovered(!!e.target.closest("button,a,input,[role='button'],[data-drag]"));
    const down = () => setClicked(true);
    const up = () => setClicked(false);
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
  return { pos, hovered, clicked };
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
   INITIAL DATA
───────────────────────────────────────────── */
const INITIAL_CHAPTERS = [
  {
    id: 1,
    title: "Chapter 1: Basics of Programming",
    expanded: true,
    lessons: [
      {
        id: 11,
        title: "1.1 Introduction to Python",
        tags: [
          { icon: "play_circle", label: "Video", ai: false },
          { icon: "description", label: "Slides", ai: false },
        ],
        aiTags: [
          { icon: "auto_awesome", label: "Quick Summary" },
          { icon: "quiz", label: "Quiz Ready" },
        ],
        generating: null,
      },
      {
        id: 12,
        title: "1.2 Setting up Environment",
        tags: [{ icon: "article", label: "Transcript", ai: false }],
        aiTags: [],
        generating: "AI Audio Summary - Generating...",
      },
    ],
  },
  {
    id: 2,
    title: "Chapter 2: Variables and Data Types",
    expanded: false,
    lessons: [
      { id: 21, title: "2.1 Variables", tags: [{ icon: "play_circle", label: "Video", ai: false }], aiTags: [], generating: null },
      { id: 22, title: "2.2 Data Types", tags: [{ icon: "description", label: "Slides", ai: false }], aiTags: [], generating: null },
      { id: 23, title: "2.3 Type Casting", tags: [{ icon: "article", label: "Transcript", ai: false }], aiTags: [], generating: null },
      { id: 24, title: "2.4 Constants", tags: [], aiTags: [{ icon: "quiz", label: "Quiz Ready" }], generating: null },
    ],
  },
  {
    id: 3,
    title: "Chapter 3: Control Flow",
    expanded: false,
    lessons: [
      { id: 31, title: "3.1 If Statements", tags: [{ icon: "play_circle", label: "Video", ai: false }], aiTags: [], generating: null },
      { id: 32, title: "3.2 Loops", tags: [{ icon: "description", label: "Slides", ai: false }], aiTags: [], generating: null },
      { id: 33, title: "3.3 Exception Handling", tags: [], aiTags: [], generating: null },
    ],
  },
];

/* ─────────────────────────────────────────────
   CHAPTER MENU DROPDOWN
───────────────────────────────────────────── */
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
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
        className="size-8 flex items-center justify-center rounded-lg hover:bg-white text-[#4c739a] transition-all"
      >
        <Icon name="more_horiz" className="text-[20px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#e7edf3] rounded-xl shadow-xl w-44 py-1 overflow-hidden">
          {[
            { icon: "edit", label: "Rename Chapter", fn: onRename },
            { icon: "add", label: "Add Lesson", fn: onAddLesson },
            { icon: "delete", label: "Delete Chapter", fn: onDelete, danger: true },
          ].map(({ icon, label, fn, danger }) => (
            <button key={label} onClick={() => { setOpen(false); fn?.(); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50 ${danger ? "text-rose-600" : "text-slate-700"}`}>
              <Icon name={icon} className={`text-base ${danger ? "text-rose-400" : "text-slate-400"}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADD LESSON / CHAPTER MODAL
───────────────────────────────────────────── */
function Modal({ title, placeholder, onConfirm, onClose }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-[#0d141b]">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="p-5">
          <input
            autoFocus value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && value.trim()) { onConfirm(value.trim()); onClose(); } }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30"
            placeholder={placeholder}
          />
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button
            onClick={() => { if (value.trim()) { onConfirm(value.trim()); onClose(); } }}
            className="flex-1 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors"
          >Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LESSON ROW
───────────────────────────────────────────── */
function LessonRow({ lesson, onDelete, onEdit }) {
  return (
    <div className="p-4 pl-12 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50/50 transition-colors border-t border-[#f0f4f8] first:border-t-0">
      <div className="flex items-center gap-4">
        {/* Drag handle – appears on hover */}
        <Icon name="drag_indicator" className="text-[#4c739a] text-[20px] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" data-drag />
        <div>
          <h4 className="font-semibold text-[#0d141b] text-sm">{lesson.title}</h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Regular tags */}
            {lesson.tags.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-200 text-[#4c739a] text-[10px] font-bold flex items-center gap-1">
                <Icon name={t.icon} className="text-[12px]" />{t.label}
              </span>
            ))}
            {/* Divider */}
            {lesson.tags.length > 0 && (lesson.aiTags.length > 0 || lesson.generating) && (
              <div className="h-3 w-[1px] bg-[#cfdbe7] mx-1" />
            )}
            {/* AI tags */}
            {lesson.aiTags.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-[#137fec]/10 text-[#137fec] text-[10px] font-bold flex items-center gap-1 ring-1 ring-[#137fec]/20">
                <Icon name={t.icon} className="text-[12px]" />{t.label}
              </span>
            ))}
            {/* Generating spinner */}
            {lesson.generating && (
              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-[#137fec]/5 rounded border border-[#137fec]/10">
                <div className="w-3 h-3 rounded-full border-2 border-[#137fec] border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-[#137fec] text-[10px] font-bold italic">{lesson.generating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-2 text-[#4c739a] hover:text-[#137fec] transition-colors rounded-lg hover:bg-slate-100">
          <Icon name="settings" className="text-[20px]" />
        </button>
        <button onClick={onDelete} className="p-2 text-[#4c739a] hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
          <Icon name="delete" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAPTER BLOCK
───────────────────────────────────────────── */
function ChapterBlock({ chapter, onToggle, onDeleteChapter, onRenameChapter, onDeleteLesson, onAddLesson }) {
  return (
    <div className={`bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden transition-opacity ${chapter.expanded ? "" : "opacity-80 hover:opacity-100"}`}>
      {/* Chapter header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${chapter.expanded ? "bg-slate-50 border-b border-[#e7edf3]" : "hover:bg-slate-50/50"}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon name="drag_indicator" className="text-[#4c739a] cursor-grab flex-shrink-0" data-drag />
          <Icon
            name={chapter.expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}
            className={chapter.expanded ? "text-[#137fec]" : "text-[#4c739a]"}
          />
          <h3 className="font-bold text-[#0d141b] text-base md:text-lg">{chapter.title}</h3>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-[#4c739a] mr-1">{chapter.lessons.length} Lessons</span>
          <ChapterMenu
            onRename={() => onRenameChapter(chapter.id)}
            onDelete={() => onDeleteChapter(chapter.id)}
            onAddLesson={() => onAddLesson(chapter.id)}
          />
        </div>
      </div>

      {/* Lessons */}
      {chapter.expanded && (
        <>
          <div className="divide-y divide-[#f0f4f8]">
            {chapter.lessons.map(lesson => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                onDelete={() => onDeleteLesson(chapter.id, lesson.id)}
                onEdit={() => {}}
              />
            ))}
          </div>
          {/* Add lesson button */}
          <div className="p-3 bg-white flex justify-center border-t border-[#f0f4f8]">
            <button
              onClick={() => onAddLesson(chapter.id)}
              className="text-[#137fec] text-xs font-bold flex items-center gap-1 hover:underline transition-all"
            >
              <Icon name="add_circle" className="text-[16px]" />
              Add Lesson to {chapter.title.split(":")[0]}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS PANEL (slide-in)
───────────────────────────────────────────── */
function SettingsPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0d141b]">Edit Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {[
            { label: "Course Title", placeholder: "Python 101", type: "input" },
            { label: "Description", placeholder: "Manage your curriculum...", type: "textarea" },
            { label: "Status", placeholder: "", type: "select", options: ["Active", "Draft", "Archived"] },
            { label: "Category", placeholder: "Programming", type: "input" },
          ].map(({ label, placeholder, type, options }) => (
            <div key={label}>
              <label className="text-xs font-bold text-[#4c739a] uppercase tracking-wider block mb-1">{label}</label>
              {type === "input" && (
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30" defaultValue={placeholder} />
              )}
              {type === "textarea" && (
                <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 resize-none" defaultValue={placeholder} />
              )}
              {type === "select" && (
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADD CONTENT MODAL
───────────────────────────────────────────── */
function AddContentModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const types = [
    { icon: "play_circle", label: "Video Lesson", value: "video" },
    { icon: "description", label: "Document / Slides", value: "doc" },
    { icon: "article", label: "Text Lesson", value: "text" },
    { icon: "quiz", label: "Quiz", value: "quiz" },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-[#0d141b]">{step === 1 ? "Add Content" : "Content Details"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
        </div>
        {step === 1 ? (
          <div className="p-5 grid grid-cols-2 gap-3">
            {types.map(t => (
              <button key={t.value} onClick={() => { setType(t.value); setStep(2); }}
                className="flex flex-col items-center gap-2 p-4 border-2 border-slate-200 rounded-xl hover:border-[#137fec] hover:bg-[#137fec]/5 transition-all group">
                <Icon name={t.icon} className="text-3xl text-slate-400 group-hover:text-[#137fec] transition-colors" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-[#137fec] transition-colors">{t.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#4c739a] uppercase tracking-wider block mb-1">Lesson Title</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30" placeholder="Enter lesson title..." />
            </div>
            <div>
              <label className="text-xs font-bold text-[#4c739a] uppercase tracking-wider block mb-1">Chapter</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30">
                <option>Chapter 1: Basics of Programming</option>
                <option>Chapter 2: Variables and Data Types</option>
                <option>Chapter 3: Control Flow</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[#137fec]" />
              <span className="text-xs text-slate-600 font-medium">Generate AI Quick Summary</span>
            </label>
          </div>
        )}
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={step === 1 ? onClose : () => setStep(1)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step === 2 && (
            <button onClick={() => { onAdd(); onClose(); }} className="flex-1 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold hover:bg-[#0f6fd4] transition-colors">
              Add Lesson
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function TrainerCourseManagement() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("Content");
  const [activeNav, setActiveNav] = useState("Courses");
  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / panels
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [addLessonTarget, setAddLessonTarget] = useState(null); // chapter id
  const [renameTarget, setRenameTarget] = useState(null); // chapter id

  // Notifications bell
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  useEffect(() => {
    if (!notifOpen) return;
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  /* Chapter actions */
  const toggleChapter = (id) => setChapters(cs => cs.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  const deleteChapter = (id) => setChapters(cs => cs.filter(c => c.id !== id));
  const renameChapter = (id, newTitle) => setChapters(cs => cs.map(c => c.id === id ? { ...c, title: newTitle } : c));
  const addChapter = (title) => setChapters(cs => [...cs, { id: Date.now(), title, expanded: false, lessons: [] }]);

  /* Lesson actions */
  const deleteLesson = (chapterId, lessonId) => setChapters(cs =>
    cs.map(c => c.id === chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c)
  );
  const addLesson = (chapterId, title) => setChapters(cs =>
    cs.map(c => c.id === chapterId ? {
      ...c,
      expanded: true,
      lessons: [...c.lessons, { id: Date.now(), title, tags: [], aiTags: [], generating: null }]
    } : c)
  );

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0);
  const tabs = [
    { icon: "menu_book", label: "Content" },
    { icon: "group", label: "Students" },
    { icon: "analytics", label: "Analytics" },
    { icon: "auto_awesome", label: "AI Hub", aiColor: true },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{font-family:'Lexend',sans-serif;background:#f6f7f8;margin:0;}
        .scrollbar-thin::-webkit-scrollbar{width:4px;}
        .scrollbar-thin::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .animate-spin{animation:spin 1s linear infinite;}
      `}</style>

      {/* ── Modals ── */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showAddContent && <AddContentModal onClose={() => setShowAddContent(false)} onAdd={() => {}} />}
      {showAddChapterModal && (
        <Modal
          title="Add New Chapter"
          placeholder="e.g. Chapter 4: Functions"
          onConfirm={addChapter}
          onClose={() => setShowAddChapterModal(false)}
        />
      )}
      {addLessonTarget !== null && (
        <Modal
          title="Add New Lesson"
          placeholder="e.g. 1.3 Variables Basics"
          onConfirm={(title) => addLesson(addLessonTarget, title)}
          onClose={() => setAddLessonTarget(null)}
        />
      )}
      {renameTarget !== null && (
        <Modal
          title="Rename Chapter"
          placeholder="New chapter title..."
          onConfirm={(title) => renameChapter(renameTarget, title)}
          onClose={() => setRenameTarget(null)}
        />
      )}

      <div className="flex h-screen overflow-hidden bg-[#f6f7f8]" style={{ fontFamily: "'Lexend',sans-serif" }}>
        <TrainerSidebar courseId={courseId} />
        <div className="flex-1 flex flex-col overflow-hidden">

        {/* ══ TOP HEADER ══ */}
        <header className="border-b border-[#e7edf3] bg-white px-4 md:px-10 py-3 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6">
            {/* Page title */}
            <div className="flex items-center gap-3">
              <div className="size-8 bg-[#137fec]/10 rounded-lg flex items-center justify-center">
                <Icon name="school" className="text-[#137fec]" />
              </div>
              <h2 className="text-[#0d141b] text-lg font-bold leading-tight tracking-tight">Course Management</h2>
            </div>

            {/* Right side */}
            <div className="flex flex-1 justify-end items-center gap-3">
              {/* Search */}
              <label className="hidden lg:flex relative min-w-40 max-w-64 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#4c739a]">
                  <Icon name="search" className="text-[20px]" />
                </div>
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border-none bg-[#e7edf3] py-2 pl-10 pr-3 text-sm placeholder:text-[#4c739a] focus:outline-none focus:ring-2 focus:ring-[#137fec]/20"
                  placeholder="Search courses..."
                />
              </label>
              {/* Bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(p => !p)}
                  className="size-10 flex items-center justify-center rounded-lg bg-[#e7edf3] text-[#0d141b] hover:bg-[#dce4ec] transition-colors relative">
                  <Icon name="notifications" />
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-white border border-[#e7edf3] rounded-xl shadow-xl p-4 z-50">
                    <p className="font-bold text-sm text-[#0d141b] mb-3">Notifications</p>
                    {["AI Audio Summary completed for Lesson 1.1", "3 students enrolled in Python 101", "Quiz Ready for Chapter 2"].map((n, i) => (
                      <div key={i} className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                        <div className="size-2 bg-[#137fec] rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-[#4c739a]">{n}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <TrainerProfileDropdown name="Dr. Smith" role="Lead Trainer" />
            </div>
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#4c739a] mb-4 flex-wrap">
            <button onClick={() => navigate("/dashboard/trainer")} className="hover:text-[#137fec] transition-colors cursor-pointer">Dashboard</button>
            <Icon name="chevron_right" className="text-xs" />
            <button onClick={() => navigate("/dashboard/trainer")} className="hover:text-[#137fec] transition-colors cursor-pointer">Courses</button>
            <Icon name="chevron_right" className="text-xs" />
            <span className="text-[#0d141b] font-medium">Python 101</span>
          </nav>

          {/* Page heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black tracking-tight text-[#0d141b]">Python 101</h1>
                <span className="px-2 py-0.5 rounded bg-[#137fec]/10 text-[#137fec] text-[10px] font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-[#4c739a] text-base">Manage your curriculum and AI-enhanced learning materials.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#e7edf3] text-[#0d141b] text-sm font-bold hover:bg-[#dce4ec] transition-all flex items-center gap-2">
                <Icon name="visibility" className="text-[18px]" />Preview
              </button>
              <button onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-lg bg-[#e7edf3] text-[#0d141b] text-sm font-bold hover:bg-[#dce4ec] transition-all flex items-center gap-2">
                <Icon name="edit" className="text-[18px]" />Edit Details
              </button>
              <button onClick={() => navigate(`/trainer/courses/${courseId || "course1"}/upload`)}
                className="px-6 py-2 rounded-lg bg-[#137fec] text-white text-sm font-bold hover:bg-[#0f6fd4] transition-all shadow-md flex items-center gap-2">
                <Icon name="add" className="text-[18px]" />Add Content
              </button>
            </div>
          </div>

          {/* Secondary tabs */}
          <div className="border-b border-[#cfdbe7] mb-6">
            <div className="flex gap-6 md:gap-8 overflow-x-auto">
              {tabs.map(({ icon, label, aiColor }) => (
                <button key={label} onClick={() => setActiveTab(label)}
                  className={`pb-3 border-b-2 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === label ? "border-[#137fec] text-[#137fec]" : "border-transparent text-[#4c739a] hover:text-[#137fec]"}`}>
                  <Icon name={icon} className={`text-[20px] ${aiColor && activeTab !== label ? "text-[#137fec]/70" : ""}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content Tab ── */}
          {activeTab === "Content" && (
            <div className="space-y-4">
              {chapters.map(chapter => (
                <ChapterBlock
                  key={chapter.id}
                  chapter={chapter}
                  onToggle={() => toggleChapter(chapter.id)}
                  onDeleteChapter={deleteChapter}
                  onRenameChapter={(id) => setRenameTarget(id)}
                  onDeleteLesson={deleteLesson}
                  onAddLesson={(id) => setAddLessonTarget(id)}
                />
              ))}
              {/* Add New Chapter */}
              <button
                onClick={() => setShowAddChapterModal(true)}
                className="w-full py-6 border-2 border-dashed border-[#cfdbe7] rounded-xl flex flex-col items-center justify-center text-[#4c739a] hover:border-[#137fec] hover:text-[#137fec] hover:bg-[#137fec]/5 transition-all group"
              >
                <Icon name="add_circle" className="text-3xl mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Add New Chapter</span>
              </button>
            </div>
          )}

          {/* ── Students Tab ── */}
          {activeTab === "Students" && (
            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-8 text-center">
              <Icon name="group" className="text-5xl text-slate-200 mb-3 block" />
              <p className="font-bold text-[#0d141b] text-lg">Students Enrolled</p>
              <p className="text-[#4c739a] text-sm mt-1">Manage student enrollment and track progress here.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  { name: "Alice Chen", progress: 72, status: "Active" },
                  { name: "Bob Martinez", progress: 45, status: "Active" },
                  { name: "Carol Kim", progress: 91, status: "Completed" },
                ].map(s => (
                  <div key={s.name} className="border border-[#e7edf3] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-8 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[#137fec]">
                        <Icon name="person" className="text-base" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#0d141b]">{s.name}</p>
                        <p className="text-xs text-[#4c739a]">{s.status}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#137fec] h-full rounded-full" style={{ width: `${s.progress}%` }} />
                    </div>
                    <p className="text-xs text-[#4c739a] mt-1">{s.progress}% complete</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "Analytics" && (() => { navigate(`/trainer/courses/${courseId || "course1"}/analytics`); return null; })()}
          {activeTab === "Analytics_view" && (
            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-8 text-center">
              <Icon name="analytics" className="text-5xl text-slate-200 mb-3 block" />
              <p className="font-bold text-[#0d141b] text-lg">Course Analytics</p>
              <p className="text-[#4c739a] text-sm mt-1">View detailed performance and engagement metrics.</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Completion Rate", value: "68%" },
                  { label: "Avg. Score", value: "82%" },
                  { label: "Total Views", value: "1,240" },
                  { label: "Enrolled", value: "47" },
                ].map(m => (
                  <div key={m.label} className="border border-[#e7edf3] rounded-xl p-4 text-left">
                    <p className="text-xs text-[#4c739a] uppercase font-bold tracking-wider">{m.label}</p>
                    <p className="text-2xl font-black text-[#0d141b] mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Hub Tab ── */}
          {activeTab === "AI Hub" && (
            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-8 text-center">
              <Icon name="auto_awesome" className="text-5xl text-[#137fec]/30 mb-3 block" />
              <p className="font-bold text-[#0d141b] text-lg">AI Hub</p>
              <p className="text-[#4c739a] text-sm mt-1">Generate AI-powered summaries, quizzes, and transcripts.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  { icon: "auto_awesome", label: "Quick Summary", desc: "Generate AI summary for any lesson", color: "text-[#137fec] bg-[#137fec]/10" },
                  { icon: "quiz", label: "Quiz Generator", desc: "Auto-create quizzes from lesson content", color: "text-emerald-600 bg-emerald-50" },
                  { icon: "headphones", label: "Audio Summary", desc: "Convert lessons to audio podcasts", color: "text-purple-600 bg-purple-50" },
                ].map(a => (
                  <button key={a.label} onClick={() => navigate(`/trainer/ai-studio?course=${courseId || "course1"}&tool=${encodeURIComponent(a.label)}`)} className="border border-[#e7edf3] rounded-xl p-5 text-left hover:border-[#137fec] hover:shadow-sm transition-all group cursor-pointer">
                    <div className={`size-10 rounded-lg ${a.color} flex items-center justify-center mb-3`}>
                      <Icon name={a.icon} className="text-xl" />
                    </div>
                    <p className="font-bold text-sm text-[#0d141b] group-hover:text-[#137fec] transition-colors">{a.label}</p>
                    <p className="text-xs text-[#4c739a] mt-1">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Stats Cards ── */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl border border-[#e7edf3] flex items-center gap-4 shadow-sm">
              <div className="size-12 rounded-lg bg-[#137fec]/10 flex items-center justify-center text-[#137fec] flex-shrink-0">
                <Icon name="description" className="text-[28px]" />
              </div>
              <div>
                <p className="text-xs text-[#4c739a] uppercase font-bold tracking-wider">Total Content</p>
                <p className="text-xl font-black text-[#0d141b]">{totalLessons} Lessons</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#e7edf3] flex items-center gap-4 shadow-sm">
              <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                <Icon name="schedule" className="text-[28px]" />
              </div>
              <div>
                <p className="text-xs text-[#4c739a] uppercase font-bold tracking-wider">Course Duration</p>
                <p className="text-xl font-black text-[#0d141b]">8h 45m</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#e7edf3] flex items-center gap-4 shadow-sm ring-2 ring-[#137fec]/20">
              <div className="size-12 rounded-lg bg-[#137fec]/10 flex items-center justify-center text-[#137fec] flex-shrink-0">
                <Icon name="auto_awesome" className="text-[28px]" />
              </div>
              <div>
                <p className="text-xs text-[#137fec] uppercase font-bold tracking-wider">AI Credit Usage</p>
                <p className="text-xl font-black text-[#0d141b]">68% used</p>
              </div>
            </div>
          </div>
          </div>
        </main>
        </div>
      </div>
    </>
  );
}
