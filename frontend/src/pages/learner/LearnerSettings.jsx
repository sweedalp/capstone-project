import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnerSidebar from '../../components/LearnerSidebar';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function LearnerSettings() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userRole = localStorage.getItem('userRole') || 'learner';

    const [profile, setProfile] = useState({ full_name: userName, email: userEmail });
    const [saving, setSaving] = useState(false);
    const [notifications, setNotifications] = useState({
        email_updates: true, deadline_reminders: true, course_announcements: true,
    });

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem('userName', profile.full_name);
            setSaving(false);
            alert('Profile updated!');
        }, 500);
    };

    const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); navigate('/login'); };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            <LearnerSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Icon name="settings" className="text-blue-600" />Settings</h2>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-2xl space-y-8">
                    {/* Profile */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icon name="person" className="text-blue-600" />Profile
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                                <input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                                <input value={profile.email} disabled className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-400" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Role</label>
                                <input value={userRole} disabled className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-400 capitalize" />
                            </div>
                            <button onClick={handleSave} disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icon name="notifications" className="text-amber-500" />Notification Preferences
                        </h3>
                        <div className="space-y-3">
                            {[
                                { key: 'email_updates', label: 'Email Updates', desc: 'Receive email notifications about course updates' },
                                { key: 'deadline_reminders', label: 'Deadline Reminders', desc: 'Get notified about upcoming deadlines' },
                                { key: 'course_announcements', label: 'Course Announcements', desc: 'Trainer announcements and messages' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className={`w-11 h-6 rounded-full transition-all relative ${notifications[item.key] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Account */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icon name="shield" className="text-rose-500" />Account
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <Icon name="lock" className="text-base text-slate-400" />Change Password
                            </button>
                            <button onClick={handleLogout}
                                className="w-full text-left p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center gap-3 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors">
                                <Icon name="logout" className="text-base" />Log Out
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
