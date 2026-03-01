import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function TrainerSettings() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Trainer';
    const userEmail = localStorage.getItem('userEmail') || '';

    // Password change state
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');

    // Notification prefs (local only, no backend)
    const [notifPrefs, setNotifPrefs] = useState({
        email_notifications: true,
        new_enrollment: true,
        message_received: true,
        course_feedback: false,
    });

    const handleChangePassword = async () => {
        setPwError('');
        setPwSuccess('');
        if (!pwForm.current_password || !pwForm.new_password) return setPwError('All fields are required');
        if (pwForm.new_password.length < 8) return setPwError('New password must be at least 8 characters');
        if (pwForm.new_password !== pwForm.confirm_password) return setPwError('New passwords do not match');
        setPwSaving(true);
        try {
            await apiClient.put('/api/v1/auth/change-password', null, {
                params: { current_password: pwForm.current_password, new_password: pwForm.new_password }
            });
            setPwSuccess('Password changed successfully!');
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setPwSuccess(''), 3000);
        } catch (err) {
            setPwError(err.response?.data?.detail || 'Failed to change password');
        } finally {
            setPwSaving(false);
        }
    };

    const toggleNotif = (key) => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <TrainerSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Icon name="settings" className="text-blue-600" />Account Settings
                    </h2>
                    <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-2xl mx-auto space-y-6">

                        {/* Change Password */}
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Icon name="lock" className="text-blue-600" />Change Password
                            </h3>

                            {pwSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                                    <Icon name="check_circle" className="text-green-600" />
                                    <p className="text-sm text-green-700 font-medium">{pwSuccess}</p>
                                </div>
                            )}
                            {pwError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                                    <Icon name="error" className="text-red-500" />
                                    <p className="text-sm text-red-700 font-medium">{pwError}</p>
                                    <button onClick={() => setPwError('')} className="ml-auto text-red-400 hover:text-red-600">
                                        <Icon name="close" />
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Current Password</label>
                                    <input type="password" value={pwForm.current_password}
                                        onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                        placeholder="Enter current password" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">New Password</label>
                                    <input type="password" value={pwForm.new_password}
                                        onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                        placeholder="At least 8 characters" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Confirm New Password</label>
                                    <input type="password" value={pwForm.confirm_password}
                                        onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                        placeholder="Re-enter new password" />
                                </div>
                                <button onClick={handleChangePassword} disabled={pwSaving}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                                    {pwSaving ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </section>

                        {/* Notification Preferences */}
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Icon name="notifications" className="text-blue-600" />Notification Preferences
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive email updates about your courses' },
                                    { key: 'new_enrollment', label: 'New Enrollment Alerts', desc: 'Get notified when a student enrolls in your course' },
                                    { key: 'message_received', label: 'Message Alerts', desc: 'Get notified when you receive a new message' },
                                    { key: 'course_feedback', label: 'Course Feedback', desc: 'Get notified about student feedback and reviews' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                        </div>
                                        <label className="inline-flex relative items-center cursor-pointer flex-shrink-0">
                                            <input type="checkbox" className="sr-only peer" checked={notifPrefs[key]}
                                                onChange={() => toggleNotif(key)} />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
                                                peer-checked:after:translate-x-full peer-checked:after:border-white
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                                after:bg-white after:border-gray-300 after:border after:rounded-full
                                                after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                                <Icon name="warning" className="text-red-500" />Danger Zone
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back.</p>
                            <button className="px-4 py-2 border border-red-300 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50"
                                onClick={() => alert('Please contact admin to delete your account.')}>
                                Delete Account
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
