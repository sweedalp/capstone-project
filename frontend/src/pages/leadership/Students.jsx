// ─── Students.jsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Avatar, StatusBadge, ProgressBar, Card, Btn, Modal, Input } from './_ui';
import { useLeadershipData } from './_store';
import { leadershipApi } from '../../services/adminApi';

const FILTERS = [
  { value: 'all',           label: 'All Students'    },
  { value: 'at-risk',       label: 'At Risk'         },
  { value: 'top-performer', label: 'Top Performers'  },
  { value: 'on-track',      label: 'On Track'        },
  { value: 'behind',        label: 'Behind Schedule' },
  { value: 'completed',     label: 'Completed'       },
];

export default function Students() {
  const navigate = useNavigate();
  const {
    studentFilter, studentSearch, studentCourse,
    setStudentFilter, setStudentSearch, setStudentCourse,
    getFilteredStudents, courses, setSelectedCourse,
    fetchStudents, studentsLoading,
  } = useLeadershipData();

  const [expandedId, setExpandedId] = useState(null);
  const [interventionModal, setInterventionModal] = useState(null);
  const [interventionType, setInterventionType] = useState('Assign Mentor');
  const [interventionMsg, setInterventionMsg] = useState('');
  const [intervening, setIntervening] = useState(false);
  const [messageModal, setMessageModal] = useState(null);
  const [msgFields, setMsgFields] = useState({ subject: '', body: '' });
  const [msgSending, setMsgSending] = useState(false);
  const [page, setPage] = useState(1);
  const [studentStats, setStudentStats] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    fetchStudents();
    leadershipApi.getStudentStats().then(setStudentStats).catch(() => {});
    leadershipApi.getStudentCourses().then(setCourseOptions).catch(() => {});
  }, []);

  const handleSendMessage = async () => {
    if (!msgFields.subject.trim() || !msgFields.body.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setMsgSending(true);
    try {
      await leadershipApi.sendMessage({
        to_name:  messageModal.name,
        to_email: messageModal.email,
        subject:  msgFields.subject,
        body:     msgFields.body,
      });
      toast.success(`Message sent to ${messageModal.name}`);
      setMessageModal(null);
      setMsgFields({ subject: '', body: '' });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to send email. Please try again.');
    } finally {
      setMsgSending(false);
    }
  };

  const handleIntervene = async () => {
    setIntervening(true);
    try {
      await leadershipApi.intervene({
        student_user_id: interventionModal.user_id,
        intervention_type: interventionType,
        message: interventionMsg,
      });
      toast.success(`Intervention sent to ${interventionModal.name}`);
      setInterventionModal(null);
      setInterventionMsg('');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to send intervention.');
    } finally {
      setIntervening(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await leadershipApi.exportStudents();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'students_progress.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed.');
    }
  };

  const handleCertificate = async (s) => {
    try {
      const res = await leadershipApi.getCertificate(s.user_id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `certificate_${s.user_id}.html`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Certificate not available.');
    }
  };

  const PER_PAGE = 8;

  const filtered = getFilteredStudents();
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  return (
    <LeadershipShell title="Student Progress Tracking">
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold">Student Progress Tracking</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Real-time overview across all AI curriculums</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" onClick={() => { toast.success('Generating progress report…'); navigate('/leadership/analytics'); }}>
              <span className="material-symbols-outlined text-[16px]">description</span>
              Progress Report
            </Btn>
            <Btn onClick={handleExport}>
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </Btn>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg. Progress', value: studentStats ? `${studentStats.avg_progress}%` : '—', icon: 'trending_up', bg: 'bg-emerald-50', ico: 'text-emerald-600' },
            { label: 'At Risk',       value: studentStats ? String(studentStats.at_risk_count) : '—', icon: 'warning',     bg: 'bg-red-50',     ico: 'text-red-500'     },
            { label: 'Certifications',value: studentStats ? String(studentStats.certifications) : '—', icon: 'school',      bg: 'bg-blue-50',    ico: 'text-[#137fec]'   },
          ].map(({ label, value, icon, bg, ico }) => (
            <Card key={label} className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <span className={`material-symbols-outlined ${ico} text-[22px]`}>{icon}</span>
              </div>
              <div>
                <p className="text-[22px] font-bold leading-none">{value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
              <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition"
                placeholder="Search by name or ID…"
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setPage(1); }} />
            </div>
            <select value={studentCourse} onChange={(e) => { setStudentCourse(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
              <option value="all">All Courses</option>
              {(courseOptions.length > 0 ? courseOptions : courses).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={studentFilter} onChange={(e) => { setStudentFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
              {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </Card>

        {/* ── Status pill tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setStudentFilter(f.value); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors
                ${studentFilter === f.value ? 'bg-[#137fec] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Student', 'Course', 'Progress', 'Status', 'Last Active', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentsLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-slate-400">
                      <span className="material-symbols-outlined text-[36px] block mb-2 animate-spin">progress_activity</span>
                      Loading students…
                    </td>
                  </tr>
                )}
                {!studentsLoading && paged.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-slate-400">
                      <span className="material-symbols-outlined text-[44px] block mb-2">search_off</span>
                      No students match your current filters
                    </td>
                  </tr>
                )}
                {paged.map((s) => {
                  const isExpanded = expandedId === s.id;
                  return (
                    <React.Fragment key={s.id}>
                      <tr className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/40' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}>

                        {/* Student */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} />
                            <div>
                              <p className="font-semibold text-slate-900">{s.name}</p>
                              <p className="text-[11px] text-slate-400">#{s.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-4 py-3.5">
                          <button className="text-slate-700 hover:text-[#137fec] font-medium transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedCourse('PY-101'); navigate('/leadership/curriculum'); }}>
                            {s.course}
                          </button>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-24">
                              <ProgressBar value={s.progress} height="h-2" />
                            </div>
                            <span className="font-bold text-slate-900 min-w-[38px]">{s.progress}%</span>
                            <span className="text-[11px] text-slate-400 hidden xl:block">Mod {s.module}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>

                        {/* Activity */}
                        <td className="px-4 py-3.5 text-slate-400 text-[12px]">{s.lastActive}</td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {(s.status === 'at-risk' || s.status === 'behind') ? (
                              <button className="px-3 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                onClick={() => { setInterventionModal(s); setInterventionType('Assign Mentor'); setInterventionMsg(''); }}>
                                Intervene
                              </button>
                            ) : s.status === 'completed' ? (
                              <button className="text-[12px] text-[#137fec] font-semibold hover:underline"
                                onClick={() => handleCertificate(s)}>Certificate</button>
                            ) : (
                              <button className="text-[12px] text-[#137fec] font-semibold hover:underline"
                                onClick={() => setExpandedId(isExpanded ? null : s.id)}>Details</button>
                            )}
                            <button className="text-[12px] text-slate-400 hover:text-[#137fec] font-semibold hover:underline"
                              onClick={() => navigate('/leadership/analytics')}>Analytics</button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {isExpanded && (
                        <tr className="bg-blue-50/30">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              {[
                                { label: 'Score',      value: `${s.score}%`,           cls: '' },
                                { label: 'Progress',   value: `${s.progress}%`,        cls: '' },
                                { label: 'Job Ready',  value: s.jobReady ? 'Yes' : 'No', cls: s.jobReady ? 'text-emerald-600' : 'text-red-500' },
                                { label: 'Module',     value: s.module,                cls: '' },
                              ].map(({ label, value, cls }) => (
                                <div key={label} className="bg-white rounded-xl p-3 border border-blue-100">
                                  <p className="text-[11px] text-slate-400">{label}</p>
                                  <p className={`text-[20px] font-bold mt-0.5 ${cls}`}>{value}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Btn variant="secondary" className="text-[12px] py-1.5"
                                onClick={() => { setMessageModal(s); setMsgFields({ subject: `Regarding your progress in ${s.course}`, body: '' }); }}>
                                <span className="material-symbols-outlined text-[14px]">mail</span> Message
                              </Btn>
                              <Btn className="text-[12px] py-1.5"
                                onClick={() => navigate('/leadership/curriculum')}>
                                <span className="material-symbols-outlined text-[14px]">auto_stories</span> Curriculum
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[13px] text-slate-500">
            <span>Showing <strong className="text-slate-800">{paged.length}</strong> of {filtered.length} students</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors">‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${page === i + 1 ? 'bg-[#137fec] text-white font-semibold' : 'hover:bg-slate-100'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors">›</button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Message Modal ── */}
      <Modal
        open={!!messageModal}
        onClose={() => { setMessageModal(null); setMsgFields({ subject: '', body: '' }); }}
        title={`Message – ${messageModal?.name}`}
        footer={<>
          <Btn variant="secondary" onClick={() => { setMessageModal(null); setMsgFields({ subject: '', body: '' }); }}>Cancel</Btn>
          <Btn disabled={msgSending} onClick={handleSendMessage}>
            <span className="material-symbols-outlined text-[16px]">{msgSending ? 'hourglass_empty' : 'send'}</span>
            {msgSending ? 'Sending…' : 'Send Message'}
          </Btn>
        </>}>
        {messageModal && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">To</label>
              <input readOnly value={`${messageModal.name} — ${messageModal.email}`}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-slate-50 text-slate-500 outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Subject</label>
              <input
                value={msgFields.subject}
                onChange={e => setMsgFields(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Your progress update"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Message</label>
              <textarea
                rows={5}
                value={msgFields.body}
                onChange={e => setMsgFields(f => ({ ...f, body: e.target.value }))}
                placeholder="Write your message here…"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 resize-none" />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Intervention Modal ── */}
      <Modal open={!!interventionModal} onClose={() => setInterventionModal(null)}
        title={`Intervene – ${interventionModal?.name}`}
        footer={<>
          <Btn variant="secondary" onClick={() => setInterventionModal(null)}>Cancel</Btn>
          <Btn onClick={handleIntervene} disabled={intervening}>
            <span className="material-symbols-outlined text-[16px]">send</span>
            {intervening ? 'Sending…' : 'Send Intervention'}
          </Btn>
        </>}>
        {interventionModal && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 rounded-xl text-[13px] text-red-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
              Student is {interventionModal.status === 'at-risk' ? 'flagged as at-risk' : 'behind schedule'} with {interventionModal.progress}% progress.
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Intervention Type</label>
              <select value={interventionType} onChange={e => setInterventionType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
                <option>Assign Mentor</option>
                <option>Send Encouragement Message</option>
                <option>Schedule 1-on-1 Session</option>
                <option>Adjust Learning Path</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Message (optional)</label>
              <textarea rows={3} value={interventionMsg} onChange={e => setInterventionMsg(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 resize-none"
                placeholder="Write a personal note…" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Assigned Mentor</label>
              <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
                <option>Dr. Robert Chen</option>
                <option>Prof. Sarah Miller</option>
                <option>James Thompson</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </LeadershipShell>
  );
}
