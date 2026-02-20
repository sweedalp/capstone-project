// ─── Settings.jsx ──────────────────────────────────────────────────────────
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Toggle, Input, Select } from './_ui';

const PROFILE_TABS = [
  { id: 'profile',        label: 'Profile',        icon: 'person'               },
  { id: 'notifications',  label: 'Notifications',  icon: 'notifications'        },
  { id: 'security',       label: 'Security',       icon: 'lock'                 },
  { id: 'preferences',    label: 'Preferences',    icon: 'tune'                 },
  { id: 'integrations',   label: 'Integrations',   icon: 'integration_instructions'},
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@ailms.com',
    title: 'Program Director', department: 'Leadership & Strategy', timezone: 'EST (UTC-5)',
  });
  const [notifs, setNotifs] = useState({
    atRiskAlerts: true, weeklyReports: true, completionMilestones: false,
    systemUpdates: true, trainerAlerts: false, aiInsights: true,
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState({});
  const [saving, setSaving] = useState(false);

  const handleProfileSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Profile saved!'); }, 800);
  };

  const handlePwSave = () => {
    const errs = {};
    if (!pwForm.current)                 errs.current  = 'Required';
    if (pwForm.next.length < 8)          errs.next     = 'Min 8 characters';
    if (pwForm.next !== pwForm.confirm)  errs.confirm  = 'Passwords do not match';
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    toast.success('Password updated!');
    setPwForm({ current: '', next: '', confirm: '' });
  };

  const setNotif = (key, v) => {
    setNotifs(p => ({ ...p, [key]: v }));
    toast.success(`${key} ${v ? 'enabled' : 'disabled'}`);
  };

  return (
    <LeadershipShell title="Settings">
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-bold">Settings</h2>
          <p className="text-slate-500 text-[13px] mt-0.5">Manage your account preferences and configurations</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Vertical nav */}
          <nav className="lg:w-52 shrink-0">
            <Card className="p-2 space-y-0.5">
              {PROFILE_TABS.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
                    ${activeTab === id ? 'bg-[#137fec]/10 text-[#137fec]' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </Card>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── Profile ── */}
            {activeTab === 'profile' && (
              <Card className="p-6 space-y-5">
                <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                  <div className="size-20 rounded-full bg-[#137fec] flex items-center justify-center text-white text-[24px] font-bold shrink-0">AR</div>
                  <div>
                    <h3 className="text-[17px] font-bold">Alex Rivera</h3>
                    <p className="text-[13px] text-slate-500">Program Director</p>
                    <button onClick={() => toast.success('Photo editor opened!')}
                      className="mt-1.5 text-[12px] text-[#137fec] font-semibold hover:underline">Change photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                  <Input label="Last Name"  value={profileForm.lastName}  onChange={e => setProfileForm(p => ({ ...p, lastName:  e.target.value }))} />
                  <Input label="Email"      value={profileForm.email}     onChange={e => setProfileForm(p => ({ ...p, email:     e.target.value }))} type="email" />
                  <Input label="Job Title"  value={profileForm.title}     onChange={e => setProfileForm(p => ({ ...p, title:     e.target.value }))} />
                  <Input label="Department" value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department:e.target.value }))} />
                  <Select label="Time Zone" value={profileForm.timezone}   onChange={e => setProfileForm(p => ({ ...p, timezone:  e.target.value }))}>
                    {['EST (UTC-5)', 'PST (UTC-8)', 'CST (UTC-6)', 'MST (UTC-7)', 'UTC', 'IST (UTC+5:30)', 'CET (UTC+1)'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                </div>
                <div className="flex justify-end pt-2">
                  <Btn onClick={handleProfileSave} disabled={saving}>
                    {saving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Changes
                  </Btn>
                </div>
              </Card>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <Card className="overflow-hidden p-0">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-[15px]">Notification Preferences</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Control which alerts you receive and how</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { key: 'atRiskAlerts',        label: 'At-Risk Student Alerts',  desc: 'Get notified when students are flagged as at-risk'              },
                    { key: 'weeklyReports',        label: 'Weekly Reports',           desc: 'Receive weekly summary reports every Monday morning'            },
                    { key: 'completionMilestones', label: 'Completion Milestones',    desc: 'Alerts when students complete courses or earn certificates'      },
                    { key: 'systemUpdates',        label: 'System Updates',           desc: 'Platform maintenance and new feature announcements'             },
                    { key: 'trainerAlerts',        label: 'Trainer Activity Alerts',  desc: 'Notifications about trainer content updates and activity'       },
                    { key: 'aiInsights',           label: 'AI Insights Digest',       desc: 'Daily AI-generated insights about program performance'          },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-[13px] font-semibold">{label}</p>
                        <p className="text-[11px] text-slate-400">{desc}</p>
                      </div>
                      <Toggle value={notifs[key]} onChange={(v) => setNotif(key, v)} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Security ── */}
            {activeTab === 'security' && (
              <Card className="p-6 space-y-5">
                <h3 className="font-bold text-[15px]">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Input label="Current Password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} type="password" placeholder="••••••••" />
                    {pwErr.current && <p className="text-[11px] text-red-500 mt-1">{pwErr.current}</p>}
                  </div>
                  <div>
                    <Input label="New Password"     value={pwForm.next}    onChange={e => setPwForm(p => ({ ...p, next:    e.target.value }))} type="password" placeholder="Min 8 characters" />
                    {pwErr.next && <p className="text-[11px] text-red-500 mt-1">{pwErr.next}</p>}
                  </div>
                  <div>
                    <Input label="Confirm Password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} type="password" placeholder="••••••••" />
                    {pwErr.confirm && <p className="text-[11px] text-red-500 mt-1">{pwErr.confirm}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">security</span>
                    Two-factor authentication: <strong>Enabled</strong>
                    <button onClick={() => toast.success('2FA settings opened!')}
                      className="text-[#137fec] text-[12px] font-semibold hover:underline ml-1">Manage</button>
                  </div>
                  <Btn onClick={handlePwSave}>
                    <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    Update Password
                  </Btn>
                </div>

                {/* Sessions */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-bold text-[14px] mb-3">Active Sessions</h4>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome · Windows 11',   location: 'Bangalore, IN',     time: 'Current session', current: true  },
                      { device: 'Safari · iPhone 15',    location: 'Bangalore, IN',     time: '2 hours ago',     current: false },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">{s.current ? 'computer' : 'smartphone'}</span>
                          <div>
                            <p className="text-[13px] font-semibold">{s.device}</p>
                            <p className="text-[11px] text-slate-400">{s.location} · {s.time}</p>
                          </div>
                        </div>
                        {s.current
                          ? <span className="badge-green text-[11px] px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Current</span>
                          : <button onClick={() => toast.success('Session revoked!')}
                              className="text-[12px] text-red-500 font-semibold hover:underline">Revoke</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* ── Preferences ── */}
            {activeTab === 'preferences' && (
              <Card className="p-6 space-y-5">
                <h3 className="font-bold text-[15px]">Display Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Language">
                    {['English (US)','Spanish','French','Mandarin','Hindi','Arabic'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Date Format">
                    {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Default Dashboard View">
                    {['Last 30 Days','Last 7 Days','This Quarter','This Year'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Default Report Format">
                    {['PDF','EXCEL','PPT'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-[14px]">Dashboard Widgets</h4>
                  {[
                    { label: 'Show At-Risk Alerts on Dashboard',  key: 'atRiskWidget'   },
                    { label: 'Show AI Performance Banner',         key: 'aiBanner'       },
                    { label: 'Show Recent Reports Panel',          key: 'reportsWidget'  },
                  ].map(({ label }) => (
                    <div key={label} className="flex items-center justify-between">
                      <p className="text-[13px] text-slate-700">{label}</p>
                      <Toggle value={true} onChange={() => toast.success('Preference saved!')} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Btn onClick={() => toast.success('Preferences saved!')}>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Preferences
                  </Btn>
                </div>
              </Card>
            )}

            {/* ── Integrations ── */}
            {activeTab === 'integrations' && (
              <Card className="p-6">
                <h3 className="font-bold text-[15px] mb-5">Connected Integrations</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Slack',          desc: 'Receive leadership alerts directly in Slack',       connected: true,  icon: 'chat_bubble' },
                    { name: 'Google Sheets',  desc: 'Auto-export weekly reports to Google Sheets',       connected: true,  icon: 'table_chart' },
                    { name: 'Zoom',           desc: 'Schedule and launch leadership review meetings',    connected: false, icon: 'videocam'    },
                    { name: 'Power BI',       desc: 'Sync analytics data with Power BI dashboards',     connected: false, icon: 'analytics'   },
                    { name: 'JIRA',           desc: 'Create curriculum improvement tasks in JIRA',      connected: false, icon: 'task'        },
                  ].map(({ name, desc, connected, icon }) => (
                    <div key={name} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-[#137fec]/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 rounded-xl">
                          <span className="material-symbols-outlined text-slate-500 text-[22px]">{icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[14px]">{name}</p>
                          <p className="text-[11px] text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.success(connected ? `${name} disconnected!` : `${name} connected!`)}
                        className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-colors
                          ${connected
                            ? 'border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                            : 'bg-[#137fec] text-white hover:bg-[#0d6bbf]'}`}>
                        {connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </LeadershipShell>
  );
}
