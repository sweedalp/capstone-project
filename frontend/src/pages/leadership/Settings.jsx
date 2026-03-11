// ─── Settings.jsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Toggle, Input, Select } from './_ui';
import apiClient from '../../services/api';

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
    firstName: '', lastName: '', email: '',
    title: 'Program Director', department: 'Leadership & Strategy', timezone: 'EST (UTC-5)',
  });
  const [notifs, setNotifs] = useState({
    atRiskAlerts: true, weeklyReports: true, completionMilestones: false,
    systemUpdates: true, trainerAlerts: false, aiInsights: true,
  });
  const [prefs, setPrefs] = useState({
    language: 'English (US)', dateFormat: 'MM/DD/YYYY',
    defaultView: 'Last 30 Days', defaultReportFormat: 'PDF',
    atRiskWidget: true, aiBanner: true, reportsWidget: true,
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr]   = useState({});
  const [saving, setSaving] = useState(false);

  // ── Sessions ──────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);

  const loadSessions = () => {
    apiClient.get('/api/v1/leadership/sessions')
      .then(res => setSessions(res.data))
      .catch(() => {});
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await apiClient.delete(`/api/v1/leadership/sessions/${sessionId}`);
      toast.success('Session revoked!');
      loadSessions();
    } catch (e) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await apiClient.delete('/api/v1/leadership/sessions');
      toast.success('All other sessions revoked!');
      loadSessions();
    } catch (e) {
      toast.error('Failed to revoke sessions');
    }
  };

  // ── 2FA State ─────────────────────────────────────────────────────────────
  const [twoFAEnabled, setTwoFAEnabled]   = useState(false);
  const [twoFAModal, setTwoFAModal]       = useState(false);
  const [twoFAStep, setTwoFAStep]         = useState('setup');
  const [twoFAQR, setTwoFAQR]             = useState('');
  const [twoFASecret, setTwoFASecret]     = useState('');
  const [twoFACode, setTwoFACode]         = useState('');
  const [twoFALoading, setTwoFALoading]   = useState(false);
  // ── Integrations ─────────────────────────────────────────────────────────
  const [integrations, setIntegrations] = useState({
    "Slack":         false,
    "Google Sheets": false,
    "Zoom":          false,
    "Power BI":      false,
    "JIRA":          false,
  });

  const load2FAStatus = () => {
    apiClient.get('/api/v1/auth/2fa/status')
      .then(res => setTwoFAEnabled(res.data.totp_enabled))
      .catch(() => {});
  };

  const handleManage2FA = async () => {
    setTwoFACode('');
    if (twoFAEnabled) {
      setTwoFAStep('disable');
      setTwoFAModal(true);
    } else {
      setTwoFALoading(true);
      try {
        const res = await apiClient.post('/api/v1/auth/2fa/setup');
        setTwoFAQR(res.data.qr_code);
        setTwoFASecret(res.data.secret);
        setTwoFAStep('verify');
        setTwoFAModal(true);
      } catch (e) {
        toast.error('Failed to start 2FA setup');
      } finally {
        setTwoFALoading(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setTwoFALoading(true);
    try {
      await apiClient.post('/api/v1/auth/2fa/verify', { code: twoFACode });
      toast.success('2FA enabled successfully!');
      setTwoFAEnabled(true);
      setTwoFAModal(false);
      setTwoFACode('');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Invalid code. Try again.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) { toast.error('Enter the 6-digit code to confirm'); return; }
    setTwoFALoading(true);
    try {
      await apiClient.post('/api/v1/auth/2fa/disable', { code: twoFACode });
      toast.success('2FA disabled');
      setTwoFAEnabled(false);
      setTwoFAModal(false);
      setTwoFACode('');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Invalid code. Try again.');
    } finally {
      setTwoFALoading(false);
    }
  };
  // ── Integrations ─────────────────────────────────────────────────────────
  const loadIntegrations = () => {
      apiClient.get('/api/v1/leadership/integrations')
      .then(res => setIntegrations(res.data))
      .catch(() => {});
  };

  const handleToggleIntegration = async (name) => {
      const updated = { ...integrations, [name]: !integrations[name] };
       setIntegrations(updated);
       try {
           await apiClient.put('/api/v1/leadership/integrations', updated);
           toast.success(updated[name] ? `${name} connected!` : `${name} disconnected!`);
       } catch (e) {
           toast.error(`Failed to update ${name}`);
       }
   };

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/api/v1/auth/me')
      .then(res => {
        const u = res.data;
        const parts = (u.full_name || '').split(' ');
        setProfileForm(p => ({
          ...p,
          firstName: parts[0] || '',
          lastName:  parts.slice(1).join(' ') || '',
          email:     u.email || '',
        }));
      })
      .catch(() => {});
    loadSessions();
    load2FAStatus();
    loadIntegrations();
  }, []);

  useEffect(() => {
    apiClient.get('/api/v1/leadership/notification-preferences')
      .then(res => setNotifs(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/api/v1/leadership/preferences')
      .then(res => setPrefs(res.data))
      .catch(() => {});
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/v1/auth/profile', null, {
        params: {
          full_name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
          email: profileForm.email,
        }
      });
      toast.success('Profile saved!');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async () => {
    const errs = {};
    if (!pwForm.current)                errs.current = 'Required';
    if (pwForm.next.length < 8)         errs.next    = 'Min 8 characters';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        current_password: pwForm.current,
        new_password:     pwForm.next,
      });
      toast.success('Password updated!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to update password');
    }
  };

  const setNotif = async (key, v) => {
    const updated = { ...notifs, [key]: v };
    setNotifs(updated);
    try {
      await apiClient.put('/api/v1/leadership/notification-preferences', updated);
      toast.success(`${key} ${v ? 'enabled' : 'disabled'}`);
    } catch (e) {
      toast.error('Failed to save preference');
    }
  };

  const handlePrefsSave = async () => {
    try {
      await apiClient.put('/api/v1/leadership/preferences', prefs);
      toast.success('Preferences saved!');
    } catch (e) {
      toast.error('Failed to save preferences');
    }
  };

  const displayName = `${profileForm.firstName} ${profileForm.lastName}`.trim() || 'User';
  const initials    = [profileForm.firstName?.[0], profileForm.lastName?.[0]]
                        .filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <LeadershipShell title="Settings">
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-bold">Settings</h2>
          <p className="text-slate-500 text-[13px] mt-0.5">Manage your account preferences and configurations</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
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

          <div className="flex-1 min-w-0">

            {/* ── Profile ── */}
            {activeTab === 'profile' && (
              <Card className="p-6 space-y-5">
                <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                  <div className="size-20 rounded-full bg-[#137fec] flex items-center justify-center text-white text-[24px] font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold">{displayName}</h3>
                    <p className="text-[13px] text-slate-500">{profileForm.title}</p>
                    <button onClick={() => toast.success('Photo editor opened!')}
                      className="mt-1.5 text-[12px] text-[#137fec] font-semibold hover:underline">Change photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name"  value={profileForm.firstName}  onChange={e => setProfileForm(p => ({ ...p, firstName:  e.target.value }))} />
                  <Input label="Last Name"   value={profileForm.lastName}   onChange={e => setProfileForm(p => ({ ...p, lastName:   e.target.value }))} />
                  <Input label="Email"       value={profileForm.email}      onChange={e => setProfileForm(p => ({ ...p, email:      e.target.value }))} type="email" />
                  <Input label="Job Title"   value={profileForm.title}      onChange={e => setProfileForm(p => ({ ...p, title:      e.target.value }))} />
                  <Input label="Department"  value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))} />
                  <Select label="Time Zone"  value={profileForm.timezone}   onChange={e => setProfileForm(p => ({ ...p, timezone:   e.target.value }))}>
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
                    { key: 'atRiskAlerts',        label: 'At-Risk Student Alerts',  desc: 'Get notified when students are flagged as at-risk'        },
                    { key: 'weeklyReports',        label: 'Weekly Reports',           desc: 'Receive weekly summary reports every Monday morning'      },
                    { key: 'completionMilestones', label: 'Completion Milestones',    desc: 'Alerts when students complete courses or earn certificates'},
                    { key: 'systemUpdates',        label: 'System Updates',           desc: 'Platform maintenance and new feature announcements'       },
                    { key: 'trainerAlerts',        label: 'Trainer Activity Alerts',  desc: 'Notifications about trainer content updates and activity' },
                    { key: 'aiInsights',           label: 'AI Insights Digest',       desc: 'Daily AI-generated insights about program performance'    },
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
                <h3 className="font-bold text-[15px]">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Input label="Current Password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} type="password" placeholder="••••••••" />
                    {pwErr.current && <p className="text-[11px] text-red-500 mt-1">{pwErr.current}</p>}
                  </div>
                  <div>
                    <Input label="New Password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} type="password" placeholder="Min 8 characters" />
                    {pwErr.next && <p className="text-[11px] text-red-500 mt-1">{pwErr.next}</p>}
                  </div>
                  <div>
                    <Input label="Confirm Password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} type="password" placeholder="••••••••" />
                    {pwErr.confirm && <p className="text-[11px] text-red-500 mt-1">{pwErr.confirm}</p>}
                  </div>
                </div>

                {/* 2FA Row */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <span className={`material-symbols-outlined text-[18px] ${twoFAEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>security</span>
                    Two-factor authentication:
                    <strong className={twoFAEnabled ? 'text-emerald-600' : 'text-slate-500'}>
                      {twoFAEnabled ? ' Enabled' : ' Disabled'}
                    </strong>
                    <button onClick={handleManage2FA} disabled={twoFALoading}
                      className="text-[#137fec] text-[12px] font-semibold hover:underline ml-1">
                      {twoFALoading ? 'Loading...' : 'Manage'}
                    </button>
                  </div>
                  <Btn onClick={handlePwSave}>
                    <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    Update Password
                  </Btn>
                </div>

                {/* Sessions */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-[14px]">Active Sessions</h4>
                    {sessions.length > 1 && (
                      <button onClick={handleRevokeAll}
                        className="text-[12px] text-red-500 font-semibold hover:underline">
                        Revoke All Others
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sessions.length === 0 && (
                      <p className="text-[13px] text-slate-400">No active sessions found.</p>
                    )}
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">
                            {s.device?.toLowerCase().includes('mobile') || s.device?.toLowerCase().includes('iphone') || s.device?.toLowerCase().includes('android') ? 'smartphone' : 'computer'}
                          </span>
                          <div>
                            <p className="text-[13px] font-semibold">{s.device || 'Unknown Device'}</p>
                            <p className="text-[11px] text-slate-400">
                              {s.ip_address} · {s.is_current ? 'Current session' : new Date(s.last_seen_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {s.is_current
                          ? <span className="text-[11px] px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Current</span>
                          : <button onClick={() => handleRevokeSession(s.id)}
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
                  <Select label="Language" value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                    {['English (US)','Spanish','French','Mandarin','Hindi','Arabic'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Date Format" value={prefs.dateFormat} onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))}>
                    {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Default Dashboard View" value={prefs.defaultView} onChange={e => setPrefs(p => ({ ...p, defaultView: e.target.value }))}>
                    {['Last 30 Days','Last 7 Days','This Quarter','This Year'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Default Report Format" value={prefs.defaultReportFormat} onChange={e => setPrefs(p => ({ ...p, defaultReportFormat: e.target.value }))}>
                    {['PDF','EXCEL','PPT'].map(o => <option key={o}>{o}</option>)}
                  </Select>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="font-bold text-[14px]">Dashboard Widgets</h4>
                  {[
                    { label: 'Show At-Risk Alerts on Dashboard', key: 'atRiskWidget'  },
                    { label: 'Show AI Performance Banner',        key: 'aiBanner'      },
                    { label: 'Show Recent Reports Panel',         key: 'reportsWidget' },
                  ].map(({ label, key }) => (
                    <div key={label} className="flex items-center justify-between">
                      <p className="text-[13px] text-slate-700">{label}</p>
                      <Toggle value={prefs[key] ?? true} onChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Btn onClick={handlePrefsSave}>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Preferences
                  </Btn>
                </div>
              </Card>
            )}

            {/* ── Integrations ── */}
            {activeTab === 'integrations' && (
  <Card className="p-6">
    <h3 className="font-bold text-[15px] mb-2">Connected Integrations</h3>
    <p className="text-[12px] text-slate-400 mb-5">Manage your third-party service connections</p>
    <div className="space-y-4">
      {[
        { name: 'Slack',         desc: 'Receive leadership alerts directly in Slack',    icon: 'chat_bubble', scope: true  },
        { name: 'Google Sheets', desc: 'Auto-export weekly reports to Google Sheets',    icon: 'table_chart', scope: true  },
        { name: 'Zoom',          desc: 'Schedule and launch leadership review meetings', icon: 'videocam',    scope: true  },
        { name: 'Power BI',      desc: 'Sync analytics data with Power BI dashboards',  icon: 'analytics',   scope: true  },
        { name: 'JIRA',          desc: 'Create curriculum improvement tasks in JIRA',   icon: 'task',        scope: false },
      ].map(({ name, desc, icon, scope }) => {
        const connected = integrations[name] || false;
        return (
          <div key={name} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-[#137fec]/20 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${connected ? 'bg-[#137fec]/10' : 'bg-slate-100'}`}>
                <span className={`material-symbols-outlined text-[22px] ${connected ? 'text-[#137fec]' : 'text-slate-500'}`}>{icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[14px]">{name}</p>
                  {connected && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Connected</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{desc}</p>
              </div>
            </div>
            <button
              onClick={() => scope ? handleToggleIntegration(name) : toast('JIRA integration coming soon!')}
              className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-colors
                ${!scope
                  ? 'border border-slate-200 text-slate-400 cursor-not-allowed'
                  : connected
                    ? 'border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                    : 'bg-[#137fec] text-white hover:bg-[#0d6bbf]'}`}>
              {!scope ? 'Coming Soon' : connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        );
      })}
    </div>
  </Card>
)}

          </div>
        </div>
      </div>

      {/* ── 2FA Modal ─────────────────────────────────────────────────────────── */}
      {twoFAModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold">
                {twoFAStep === 'verify' ? '🔐 Enable Two-Factor Authentication' : '🔓 Disable Two-Factor Authentication'}
              </h3>
              <button onClick={() => setTwoFAModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {twoFAStep === 'verify' && (
              <>
                <p className="text-[13px] text-slate-500">
                  Scan this QR code with <strong>Google Authenticator</strong>, then enter the 6-digit code.
                </p>
                {twoFAQR && (
                  <div className="flex justify-center">
                    <img src={twoFAQR} alt="2FA QR Code" className="w-48 h-48 border border-slate-200 rounded-xl" />
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1">Manual entry key</p>
                  <p className="text-[13px] font-mono font-bold text-slate-700 tracking-widest">{twoFASecret}</p>
                </div>
                <Input
                  label="Enter 6-digit code from app"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
                <div className="flex gap-3 justify-end">
                  <Btn variant="secondary" onClick={() => setTwoFAModal(false)}>Cancel</Btn>
                  <Btn onClick={handleVerify2FA} disabled={twoFALoading}>
                    {twoFALoading ? 'Verifying...' : 'Enable 2FA'}
                  </Btn>
                </div>
              </>
            )}

            {twoFAStep === 'disable' && (
              <>
                <p className="text-[13px] text-slate-500">
                  Enter the 6-digit code from your authenticator app to <strong>disable</strong> 2FA.
                </p>
                <Input
                  label="6-digit code"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
                <div className="flex gap-3 justify-end">
                  <Btn variant="secondary" onClick={() => setTwoFAModal(false)}>Cancel</Btn>
                  <Btn variant="danger" onClick={handleDisable2FA} disabled={twoFALoading}>
                    {twoFALoading ? 'Disabling...' : 'Disable 2FA'}
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </LeadershipShell>
  );
}