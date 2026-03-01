import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../../../context/AdminContext.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import Toggle from '../../../components/ui/Toggle.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import apiClient from '../../../services/api.js'

const TABS = [
  { id: 'profile', label: 'My Profile', icon: 'person' },
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'password', label: 'Change Password', icon: 'lock' },
  { id: 'security', label: 'Security', icon: 'security' },
  { id: 'billing', label: 'Billing', icon: 'credit_card' },
  { id: 'api', label: 'API Keys', icon: 'key' },
]

export default function Settings() {
  const { showToast, dark, setDark } = useApp()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'general'
  const [tab, setTab] = useState(initialTab)
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, weeklyDigest: true })
  const [sec, setSec] = useState({ twoFA: true, ssoEnabled: false, sessionTimeout: 30 })

  // Profile state
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Password state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' })

  // Fetch profile on mount
  useEffect(() => {
    setProfileLoading(true)
    apiClient.get('/api/v1/auth/me').then(res => {
      setProfile(res.data)
      setProfileForm({ full_name: res.data.full_name || '', email: res.data.email || '' })
    }).catch(() => { }).finally(() => setProfileLoading(false))
  }, [])

  // Update tab when query param changes
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && TABS.some(x => x.id === t)) setTab(t)
  }, [searchParams])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileMsg('')
    try {
      const res = await apiClient.put('/api/v1/auth/profile', null, {
        params: { full_name: profileForm.full_name, email: profileForm.email }
      })
      setProfile(res.data)
      localStorage.setItem('userName', res.data.full_name || res.data.username)
      localStorage.setItem('userEmail', res.data.email)
      setProfileMsg('Profile updated!')
      showToast('Profile updated!', 'success')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch (err) {
      setProfileMsg(err.response?.data?.detail || 'Failed to update')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwMsg({ text: '', type: '' })
    if (!pwForm.current || !pwForm.newPw) return setPwMsg({ text: 'All fields are required', type: 'error' })
    if (pwForm.newPw.length < 8) return setPwMsg({ text: 'Password must be at least 8 characters', type: 'error' })
    if (pwForm.newPw !== pwForm.confirm) return setPwMsg({ text: 'Passwords do not match', type: 'error' })
    setPwSaving(true)
    try {
      await apiClient.put('/api/v1/auth/change-password', null, {
        params: { current_password: pwForm.current, new_password: pwForm.newPw }
      })
      setPwMsg({ text: 'Password changed!', type: 'success' })
      setPwForm({ current: '', newPw: '', confirm: '' })
      showToast('Password changed!', 'success')
      setTimeout(() => setPwMsg({ text: '', type: '' }), 3000)
    } catch (err) {
      setPwMsg({ text: err.response?.data?.detail || 'Failed to change password', type: 'error' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure platform-wide settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-3">
          <div className="card p-2 sticky top-24">
            <nav className="space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`sidebar-link w-full text-left ${tab === t.id ? 'active' : ''}`}>
                  <Icon name={t.icon} className="text-xl" />{t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">

          {/* ── Profile Tab ── */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white">My Profile</h3>
                {profileLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    {profileMsg && <p className="text-sm font-medium text-green-600">{profileMsg}</p>}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Full Name</label>
                      <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Email</label>
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Username</label>
                      <input type="text" value={profile?.username || ''} className="input-field bg-slate-50" readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Role</label>
                      <input type="text" value={profile?.role || ''} className="input-field bg-slate-50 capitalize" readOnly />
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-primary"><Icon name="save" className="text-lg" />{profileSaving ? 'Saving...' : 'Save Profile'}</button>
            </div>
          )}

          {/* ── General Tab ── */}
          {tab === 'general' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Organisation Information</h3>
                {[['Organisation Name', 'AI LMS Enterprise'], ['Admin Email', 'admin@company.com'], ['Support URL', 'https://support.company.com'], ['Time Zone', 'UTC+0:00 (GMT)']].map(([label, val]) => (
                  <div key={label}>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">{label}</label>
                    <input type="text" defaultValue={val} className="input-field" />
                  </div>
                ))}
              </div>
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</p><p className="text-xs text-slate-400">Switch to a darker interface</p></div>
                  <Toggle checked={dark} onChange={setDark} />
                </div>
              </div>
              <button onClick={() => showToast('Settings saved!', 'success')} className="btn-primary"><Icon name="save" className="text-lg" />Save Changes</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card p-6 space-y-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              {Object.entries(notifs).map(([k, v]) => {
                const labels = { email: 'Email Notifications', push: 'Push Notifications', sms: 'SMS Alerts', weeklyDigest: 'Weekly Digest' }
                const descs = { email: 'Receive notifications via email', push: 'Browser and app push notifications', sms: 'Get critical alerts via SMS', weeklyDigest: 'Weekly summary email every Monday' }
                return (
                  <div key={k} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{labels[k]}</p><p className="text-xs text-slate-400">{descs[k]}</p></div>
                    <Toggle checked={v} onChange={val => setNotifs(n => ({ ...n, [k]: val }))} />
                  </div>
                )
              })}
              <button onClick={() => showToast('Notification settings saved!', 'success')} className="btn-primary"><Icon name="save" className="text-lg" />Save Preferences</button>
            </div>
          )}

          {/* ── Change Password Tab ── */}
          {tab === 'password' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Change Password</h3>
                {pwMsg.text && (
                  <p className={`text-sm font-medium ${pwMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{pwMsg.text}</p>
                )}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Current Password</label>
                  <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} className="input-field" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">New Password</label>
                  <input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} className="input-field" placeholder="At least 8 characters" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Confirm New Password</label>
                  <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} className="input-field" placeholder="Re-enter new password" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={pwSaving} className="btn-primary"><Icon name="lock" className="text-lg" />{pwSaving ? 'Changing...' : 'Change Password'}</button>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Security Settings</h3>
                <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                  <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Two-Factor Authentication</p><p className="text-xs text-slate-400">Require 2FA for all admin accounts</p></div>
                  <Toggle checked={sec.twoFA} onChange={v => setSec(s => ({ ...s, twoFA: v }))} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                  <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">SSO Integration</p><p className="text-xs text-slate-400">Enable single sign-on via SAML</p></div>
                  <Toggle checked={sec.ssoEnabled} onChange={v => setSec(s => ({ ...s, ssoEnabled: v }))} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Session Timeout (minutes)</label>
                  <input type="number" value={sec.sessionTimeout} onChange={e => setSec(s => ({ ...s, sessionTimeout: +e.target.value }))} className="input-field w-32" />
                </div>
              </div>
              <button onClick={() => showToast('Security settings saved!', 'success')} className="btn-primary"><Icon name="security" className="text-lg" />Update Security</button>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Current Plan</p>
                    <h3 className="text-2xl font-black mt-1">Enterprise Pro</h3>
                    <p className="text-blue-100 text-sm mt-1">Unlimited users · 100GB storage · Priority support</p>
                  </div>
                  <div className="text-right"><p className="text-3xl font-black">$299</p><p className="text-blue-100 text-xs">/month</p></div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[['Apr 2024', '$299.00', 'Paid'], ['Mar 2024', '$299.00', 'Paid'], ['Feb 2024', '$299.00', 'Paid']].map(([date, amt, status]) => (
                    <div key={date} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div><p className="text-sm font-semibold text-slate-900 dark:text-white">{date}</p><p className="text-xs text-slate-400">Enterprise Pro · Invoice</p></div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{amt}</span>
                        <Badge color="green">{status}</Badge>
                        <button onClick={() => showToast('Invoice downloading…', 'info')} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary"><Icon name="download" className="text-base" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'api' && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">API Keys</h3>
                <button onClick={() => showToast('New API key generated!', 'success')} className="btn-primary text-xs py-2"><Icon name="add" className="text-base" />Generate Key</button>
              </div>
              {[['Production API Key', 'sk-prod-1a2b3c4d5e6f7g8h9i0j', 'Active', 'All endpoints'], ['Staging API Key', 'sk-stag-9z8y7x6w5v4u3t2s1r0q', 'Active', 'Read-only'], ['Webhook Secret', 'whsec-abcdefghijklmnopqrstuvwxyz', 'Active', 'Events only']].map(([name, key, status, scope]) => (
                <div key={name} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div><p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p><p className="text-xs text-slate-400">{scope}</p></div>
                    <div className="flex items-center gap-2">
                      <Badge color="green">{status}</Badge>
                      <button onClick={() => showToast('Key revoked!', 'warning')} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Icon name="delete" className="text-base" /></button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" defaultValue={key} className="input-field font-mono text-xs flex-1" readOnly />
                    <button onClick={() => showToast('Copied!', 'success')} className="btn-secondary p-2.5"><Icon name="content_copy" className="text-base" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}