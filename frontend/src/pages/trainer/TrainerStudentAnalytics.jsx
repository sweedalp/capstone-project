import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerProfileDropdown from "./TrainerProfileDropdown";
import apiClient from "../../services/api";

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function ProgressBar({ value, color = "bg-blue-500", height = "h-1.5" }) {
  return (
    <div className={`w-full bg-slate-100 ${height} rounded-full overflow-hidden`}>
      <div className={`${color} h-full rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function MiniBarChart({ data, onBarClick }) {
  return (
    <div className="h-16 flex items-end gap-1.5">
      {data.map((h, i) => (
        <button key={i} onClick={() => onBarClick?.(i, h)}
          className={`flex-1 rounded-t transition-all hover:opacity-80 ${i === data.length - 1 ? "bg-blue-600" : "bg-blue-600/20"}`}
          style={{ height: `${h}%` }} title={`Day ${i + 1}: ${h}%`} />
      ))}
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[600] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
      <Icon name="notifications" className="text-blue-400 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <Icon name="close" className="text-sm" />
      </button>
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, badge, badgeColor, label, value, valueSuffix, sub, progress, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 ${onClick ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}><Icon name={icon} /></span>
        {badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>}
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

function StudentCard({ student, onViewProfile, onContact, onSchedule }) {
  return (
    <div className="bg-white rounded-xl border-l-4 border-rose-400 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
            <Icon name="person" className="text-2xl" />
          </div>
          <div>
            <button onClick={() => onViewProfile(student)}
              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left">
              {student.user_name}
            </button>
            <p className="text-xs text-slate-400 mt-0.5">{student.user_email}</p>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-500 mb-4">
        {student.enrolled_courses} course(s) enrolled
      </div>
      <div className="flex gap-2">
        <button onClick={() => onContact(student)}
          className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-all flex items-center justify-center gap-1">
          <Icon name="chat" className="text-base" />Chat
        </button>
        <button onClick={() => onSchedule(student)}
          className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-1">
          <Icon name="event" className="text-base" />Meet
        </button>
      </div>
    </div>
  );
}

function ContactModal({ student, onClose }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  if (!student) return null;
  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiClient.post('/api/v1/messaging', {
        recipient_id: student.user_id,
        subject: 'Message from trainer',
        body: message,
      });
      setSent(true);
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Contact {student.user_name}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Message Sent!</p>
            <button onClick={onClose} className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Done</button>
          </div>
        ) : (
          <>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 resize-none mb-4 focus:outline-none focus:border-blue-400"
              placeholder={`Write your message to ${student.user_name}...`} />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={handleSend} disabled={!message.trim() || sending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScheduleModal({ student, onClose }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [done, setDone] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  if (!student) return null;
  const handleSchedule = async () => {
    if (!date || !time) return;
    setScheduling(true);
    try {
      await apiClient.post('/api/v1/meetings', {
        title: `Check-in with ${student.user_name}`,
        scheduled_at: `${date}T${time}`,
        duration_minutes: 30,
        description: `Scheduled check-in with ${student.user_name}`,
      });
      setDone(true);
    } catch {
      alert('Failed to schedule meeting');
    } finally {
      setScheduling(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Schedule Check-in</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="event_available" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Scheduled!</p>
            <p className="text-sm text-slate-500 mb-4">{student.user_name} has been notified.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">Schedule with <strong>{student.user_name}</strong>:</p>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400" />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-6 focus:outline-none focus:border-blue-400" />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={handleSchedule} disabled={!date || !time || scheduling}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">{scheduling ? 'Scheduling...' : 'Confirm'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GroupMessageModal({ onClose }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await apiClient.post('/api/v1/messaging/announce', {
        subject: 'Class Announcement',
        body: msg,
      });
      setSent(true);
    } catch {
      alert('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Contact Class</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-500" />
            </div>
            <p className="font-bold mb-1">Message Sent!</p>
            <button onClick={onClose} className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Done</button>
          </div>
        ) : (
          <>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 resize-none mb-4 focus:outline-none focus:border-blue-400"
              placeholder="Write message to all students..." />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={handleSend} disabled={!msg.trim() || sending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">{sending ? 'Sending...' : 'Send to Class'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrainerAIStudentAnalytics() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const userName = localStorage.getItem('userName') || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [contactModal, setContactModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [groupMsgModal, setGroupMsgModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
  }, []);
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch real data ───────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get('/api/v1/trainer/stats'),
      apiClient.get('/api/v1/trainer/students'),
      // ✅ Only fetch modules if courseId is present
      courseId
        ? apiClient.get(`/api/v1/trainer/courses/${courseId}/modules`)
        : Promise.resolve({ data: [] }),
    ]).then(([statsRes, studentsRes, modulesRes]) => {
      setStats(statsRes.data);
      setStudents(studentsRes.data || []);
      setModules(modulesRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [courseId]);

  const handleExportReport = () => {
    const content = [
      `Analytics Report`,
      `Exported: ${new Date().toLocaleString()}`,
      ``,
      `Total Courses: ${stats?.total_courses ?? 0}`,
      `Published Courses: ${stats?.published_courses ?? 0}`,
      `Total Students: ${stats?.total_students ?? 0}`,
      `Total Lessons: ${stats?.total_lessons ?? 0}`,
    ].join('\n');
    const a = document.createElement("a");
    a.href = `data:text/plain,${encodeURIComponent(content)}`;
    a.download = "analytics-report.txt";
    a.click();
    addToast("Report downloaded!");
  };

  const allLessons = modules.flatMap(m =>
    (m.lessons || []).map(l => ({ ...l, moduleName: m.title }))
  );

  const filteredStudents = students.filter(s =>
    s.user_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const barData = [40, 55, 45, 65, 80, 75, 90, 85, 70, 95];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      {contactModal && <ContactModal student={contactModal} onClose={() => setContactModal(null)} />}
      {scheduleModal && <ScheduleModal student={scheduleModal} onClose={() => setScheduleModal(null)} />}
      {groupMsgModal && <GroupMessageModal onClose={() => setGroupMsgModal(false)} />}
      {toasts.map(t => <Toast key={t.id} message={t.msg} onClose={() => removeToast(t.id)} />)}

      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* ✅ Pass courseId for correct sidebar highlight */}
        <TrainerSidebar courseId={courseId} />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 gap-4">
            <div>
              {/* ✅ Fixed: breadcrumb uses /trainer/dashboard */}
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <button onClick={() => navigate('/trainer/dashboard')} className="hover:text-blue-600">Dashboard</button>
                <Icon name="chevron_right" className="text-sm" />
                {courseId && (
                  <>
                    <button onClick={() => navigate(`/trainer/courses/${courseId}`)} className="hover:text-blue-600">Course</button>
                    <Icon name="chevron_right" className="text-sm" />
                  </>
                )}
                <span className="text-slate-600 font-medium">Analytics</span>
              </div>
              <p className="text-xs font-medium text-slate-500">Student Analytics & Engagement</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Search students..." value={searchValue} onChange={e => setSearchValue(e.target.value)} />
              </div>
              <button onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">
                <Icon name="download" className="text-lg" />Export
              </button>
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)}
                  className="size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 relative">
                  <Icon name="notifications" className="text-xl" />
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
                    <p className="font-bold text-slate-900 text-sm mb-3">Notifications</p>
                    <p className="text-xs text-slate-400 text-center py-2">No new notifications</p>
                  </div>
                )}
              </div>
              <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
              <button onClick={() => setGroupMsgModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
                <Icon name="mail" className="text-lg" />Contact Class
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "school", iconBg: "bg-blue-600/10", iconColor: "text-blue-600", label: "Total Courses", value: stats?.total_courses || 0, badge: `${stats?.published_courses || 0} live`, badgeColor: "text-green-600 bg-green-50" },
                { icon: "menu_book", iconBg: "bg-purple-50", iconColor: "text-purple-600", label: "Total Lessons", value: stats?.total_lessons || 0, badge: "Content", badgeColor: "text-purple-600 bg-purple-50" },
                { icon: "group", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", label: "Total Students", value: stats?.total_students || 0, badge: "Enrolled", badgeColor: "text-emerald-600 bg-emerald-50" },
                { icon: "layers", iconBg: "bg-amber-50", iconColor: "text-amber-600", label: "Draft Courses", value: stats?.draft_courses || 0, badge: "Drafts", badgeColor: "text-amber-600 bg-amber-50" },
              ].map((s, i) => (
                <StatCard key={i} {...s} onClick={() => addToast(`Viewing ${s.label}`)} />
              ))}
            </div>

            {/* Students */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900">Enrolled Students</h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {filteredStudents.length} total
                  </span>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                  <Icon name="group" className="text-5xl text-slate-200 mb-3 block" />
                  <p className="text-slate-400 font-medium">No students enrolled yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((s, i) => (
                    <StudentCard key={i} student={s}
                      onViewProfile={() => addToast(`Viewing ${s.user_name}'s profile`)}
                      onContact={setContactModal}
                      onSchedule={setScheduleModal} />
                  ))}
                </div>
              )}
            </section>

            {/* Lessons from modules */}
            {allLessons.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icon name="menu_book" className="text-blue-600" />Lesson Overview
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {allLessons.map((lesson, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <button onClick={() => navigate(`/trainer/courses/${courseId}`)}
                          className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors text-left">
                          {lesson.title}
                        </button>
                        <p className="text-xs text-slate-400 mt-1">{lesson.moduleName} • {lesson.lesson_type}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 capitalize font-medium">
                        {lesson.lesson_type}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI Engagement + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <Icon name="psychology" className="text-blue-600" />AI Content Engagement
                </h3>
                <div className="space-y-6">
                  {[
                    { icon: "play_circle", iconBg: "bg-blue-50", iconColor: "text-blue-600", title: "AI Explainer Videos", sub: "Auto-generated", value: "92%", valueColor: "text-emerald-600" },
                    { icon: "spatial_tracking", iconBg: "bg-purple-50", iconColor: "text-purple-600", title: "Interactive Walkthroughs", sub: "Guided tours", value: "76%", valueColor: "text-amber-600" },
                    { icon: "headphones", iconBg: "bg-amber-50", iconColor: "text-amber-600", title: "Audio Summaries", sub: "Podcast format", value: "45%", valueColor: "text-slate-400" },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-xl ${e.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={e.icon} className={e.iconColor} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{e.title}</p>
                          <p className="text-xs text-slate-500">{e.sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{e.value}</p>
                        <p className={`text-[10px] font-bold ${e.valueColor}`}>Completion</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-3">Engagement Trend</p>
                  <MiniBarChart data={barData}
                    onBarClick={(i, val) => addToast(`Day ${i + 1}: ${val}% engagement`)} />
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <Icon name="bolt" className="text-blue-600" />Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "auto_fix_high", label: "Create Content", color: "text-blue-600", bg: "bg-blue-50", action: () => navigate('/trainer/ai-studio') },
                    { icon: "campaign", label: "Message Class", color: "text-indigo-600", bg: "bg-indigo-50", action: () => setGroupMsgModal(true) },
                    { icon: "tune", label: "Adjust Pace", color: "text-amber-600", bg: "bg-amber-50", action: () => navigate(courseId ? `/trainer/courses/${courseId}` : '/trainer/dashboard') },
                    { icon: "download", label: "Export Report", color: "text-rose-600", bg: "bg-rose-50", action: handleExportReport },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action}
                      className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group text-left">
                      <div className={`size-10 rounded-lg ${a.bg} flex items-center justify-center mb-3`}>
                        <Icon name={a.icon} className={`${a.color} text-xl`} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{a.label}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}