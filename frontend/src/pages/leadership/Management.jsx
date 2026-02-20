// ─── Management.jsx ────────────────────────────────────────────────────────
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Tabs, Modal, Input, Select, Toggle } from './_ui';
import { useLeadershipData } from './_store';

const TABS = [
  { id: 'trainers',     label: 'Trainers',    icon: 'school'              },
  { id: 'announce',     label: 'Announcements', icon: 'campaign'           },
  { id: 'programs',     label: 'Programs',    icon: 'menu_book'           },
  { id: 'permissions',  label: 'Permissions', icon: 'admin_panel_settings'},
];

const INIT_ANNOUNCEMENTS = [
  { id: 1, title: 'Q1 2026 Progress Review',         date: 'Feb 15, 2026', audience: 'All Students',      status: 'sent'      },
  { id: 2, title: 'New Python Module Launch',         date: 'Feb 10, 2026', audience: 'Python Mastery',    status: 'sent'      },
  { id: 3, title: 'Upcoming Mentorship Sessions',     date: 'Feb 20, 2026', audience: 'At-Risk Students',  status: 'scheduled' },
];

export default function Management() {
  const { trainers } = useLeadershipData();
  const [activeTab, setActiveTab] = useState('trainers');
  const [announcements, setAnnouncements] = useState(INIT_ANNOUNCEMENTS);
  const [announceModal, setAnnounceModal] = useState(false);
  const [form, setForm] = useState({ title: '', audience: 'All Students', message: '' });
  const [formErr, setFormErr] = useState({});
  const [programSettings, setProgramSettings] = useState({ aiCoach: true, peerReview: false, liveSession: true, autoNudge: true });

  const validateAnnounce = () => {
    const errs = {};
    if (!form.title.trim())   errs.title   = 'Title is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    setFormErr(errs);
    return Object.keys(errs).length === 0;
  };

  const submitAnnounce = () => {
    if (!validateAnnounce()) return;
    setAnnouncements(prev => [{ id: Date.now(), title: form.title, date: 'Feb 19, 2026', audience: form.audience, status: 'scheduled' }, ...prev]);
    toast.success('Announcement scheduled!');
    setAnnounceModal(false);
    setForm({ title: '', audience: 'All Students', message: '' });
    setFormErr({});
  };

  const deleteAnnounce = (id) => { setAnnouncements(prev => prev.filter(a => a.id !== id)); toast.success('Removed!'); };

  return (
    <LeadershipShell title="Program Management">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold">Program Management</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Manage trainers, announcements, and program settings</p>
          </div>
          <Btn onClick={() => setAnnounceModal(true)}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Announcement
          </Btn>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Trainers',      value: '8',  icon: 'school',         bg: 'bg-blue-50',   text: 'text-[#137fec]'   },
            { label: 'Total Programs',       value: '5',  icon: 'menu_book',      bg: 'bg-purple-50', text: 'text-purple-600'  },
            { label: 'Pending Reviews',      value: '3',  icon: 'rate_review',    bg: 'bg-amber-50',  text: 'text-amber-600'   },
            { label: 'Announcements Sent',   value: '24', icon: 'campaign',       bg: 'bg-emerald-50',text: 'text-emerald-600' },
          ].map(({ label, value, icon, bg, text }) => (
            <Card key={label} className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <span className={`material-symbols-outlined ${text} text-[22px]`}>{icon}</span>
              </div>
              <div>
                <p className="text-[22px] font-bold leading-none">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── Trainers ── */}
        {activeTab === 'trainers' && (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-[15px] font-bold">Trainer Roster</h3>
              <Btn className="text-[12px] py-1.5" onClick={() => toast.success('Invite sent!')}>
                <span className="material-symbols-outlined text-[14px]">person_add</span> Invite Trainer
              </Btn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Trainer','Courses','Students','Rating','Status','Actions'].map(h => (
                      <th key={h} className={`text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trainers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-[#137fec] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold">{t.name}</p>
                            <p className="text-[11px] text-slate-400">{t.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{t.courses} courses</td>
                      <td className="px-4 py-3.5 text-slate-600">{t.students}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-amber-400 text-[16px]">star</span>
                          <span className="font-semibold">{t.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold
                          ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toast.success(`Message sent to ${t.name}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#137fec] transition-colors">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                          </button>
                          <button onClick={() => toast.success('Profile opened!')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#137fec] transition-colors">
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── Announcements ── */}
        {activeTab === 'announce' && (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-[15px] font-bold">Announcements</h3>
              <Btn className="text-[12px] py-1.5" onClick={() => setAnnounceModal(true)}>
                <span className="material-symbols-outlined text-[14px]">add</span> Create
              </Btn>
            </div>
            <div className="divide-y divide-slate-50">
              {announcements.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-[44px] block mb-2">campaign</span>
                  No announcements yet
                </div>
              )}
              {announcements.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl shrink-0">
                      <span className="material-symbols-outlined text-[#137fec] text-[18px]">campaign</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[13px]">{a.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.date} · {a.audience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold
                      ${a.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.status}
                    </span>
                    <button onClick={() => deleteAnnounce(a.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Programs ── */}
        {activeTab === 'programs' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Program Feature Settings</h3>
            <div className="divide-y divide-slate-50">
              {[
                { key: 'aiCoach',     label: 'AI Coaching Assistant',  desc: 'Enable AI-powered real-time coaching for all students' },
                { key: 'peerReview',  label: 'Peer Review System',      desc: 'Allow students to review each other\'s assignments'    },
                { key: 'liveSession', label: 'Live Q&A Sessions',       desc: 'Enable scheduled live sessions with trainers'          },
                { key: 'autoNudge',   label: 'Automated Nudges',        desc: 'Send automated reminders to inactive students'         },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-[13px] font-semibold">{label}</p>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                  </div>
                  <Toggle value={programSettings[key]}
                    onChange={(v) => {
                      setProgramSettings(prev => ({ ...prev, [key]: v }));
                      toast.success(`${label} ${v ? 'enabled' : 'disabled'}`);
                    }} />
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <Btn onClick={() => toast.success('Program settings saved!')}>
                <span className="material-symbols-outlined text-[16px]">save</span> Save Settings
              </Btn>
            </div>
          </Card>
        )}

        {/* ── Permissions ── */}
        {activeTab === 'permissions' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Role-Based Access Control</h3>
            <div className="space-y-4">
              {[
                { role: 'Leadership',  permissions: ['View all dashboards', 'Generate reports', 'Manage programs', 'View AI analytics'],       color: 'bg-purple-100 text-purple-700' },
                { role: 'Trainer',     permissions: ['View assigned students', 'Manage course content', 'View course analytics'],               color: 'bg-blue-100 text-blue-700'   },
                { role: 'Learner',     permissions: ['View personal progress', 'Access course content', 'Use AI tutor'],                        color: 'bg-green-100 text-green-700' },
                { role: 'Admin',       permissions: ['Full system access', 'Manage users & roles', 'System configuration', 'Billing & plans'], color: 'bg-red-100 text-red-700'     },
              ].map(({ role, permissions, color }) => (
                <div key={role} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${color}`}>{role}</span>
                    <button onClick={() => toast.success(`${role} permissions editor opened!`)}
                      className="text-[12px] text-[#137fec] font-semibold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map(p => (
                      <span key={p} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Announcement Modal */}
      <Modal open={announceModal} onClose={() => { setAnnounceModal(false); setFormErr({}); }}
        title="Create Announcement"
        footer={<>
          <Btn variant="secondary" onClick={() => { setAnnounceModal(false); setFormErr({}); }}>Cancel</Btn>
          <Btn onClick={submitAnnounce}>
            <span className="material-symbols-outlined text-[16px]">send</span> Send Announcement
          </Btn>
        </>}>
        <div className="space-y-4">
          <div>
            <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Announcement title…" />
            {formErr.title && <p className="text-[11px] text-red-500 mt-1">{formErr.title}</p>}
          </div>
          <Select label="Audience" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
            {['All Students','At-Risk Students','Python Mastery','Data Science & AI','All Trainers'].map(o => <option key={o}>{o}</option>)}
          </Select>
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Message</label>
            <textarea rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 resize-none"
              placeholder="Write your announcement…"
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            {formErr.message && <p className="text-[11px] text-red-500 mt-1">{formErr.message}</p>}
          </div>
        </div>
      </Modal>
    </LeadershipShell>
  );
}
