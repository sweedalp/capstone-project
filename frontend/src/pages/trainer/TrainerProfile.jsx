import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function TrainerProfile() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Trainer';
    const userEmail = localStorage.getItem('userEmail') || '';

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ full_name: '', email: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/api/v1/auth/me')
            .then(res => {
                setProfile(res.data);
                setForm({ full_name: res.data.full_name || '', email: res.data.email || '' });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await apiClient.put('/api/v1/auth/profile', null, {
                params: { full_name: form.full_name, email: form.email }
            });
            setProfile(res.data);
            localStorage.setItem('userName', res.data.full_name || res.data.username);
            localStorage.setItem('userEmail', res.data.email);
            setSuccess('Profile updated successfully!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <TrainerSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Icon name="person" className="text-blue-600" />My Profile
                    </h2>
                    <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-2xl mx-auto space-y-6">

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <Icon name="check_circle" className="text-green-600" />
                                <p className="text-sm text-green-700 font-medium">{success}</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                <Icon name="error" className="text-red-500" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                                    <Icon name="close" />
                                </button>
                            </div>
                        )}

                        {/* Profile Card */}
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-28 relative">
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                                        <Icon name="person" className="text-blue-600 text-4xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-14 px-8 pb-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name || profile?.username}</h1>
                                        <p className="text-sm text-slate-500 mt-1">{profile?.email}</p>
                                        <span className="inline-block mt-2 text-xs font-bold uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {profile?.role}
                                        </span>
                                    </div>
                                    <button onClick={() => setEditing(!editing)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                        <Icon name={editing ? "close" : "edit"} className="text-base" />
                                        {editing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Profile Details */}
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Icon name="info" className="text-blue-600" />Profile Information
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                                    {editing ? (
                                        <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
                                    ) : (
                                        <p className="text-slate-900 font-medium">{profile?.full_name || '—'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                                    {editing ? (
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
                                    ) : (
                                        <p className="text-slate-900 font-medium">{profile?.email || '—'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Username</label>
                                    <p className="text-slate-900 font-medium">{profile?.username || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Role</label>
                                    <p className="text-slate-900 font-medium capitalize">{profile?.role || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Member Since</label>
                                    <p className="text-slate-900 font-medium">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                    </p>
                                </div>
                                {editing && (
                                    <button onClick={handleSave} disabled={saving}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {saving ? 'Saving...' : <><Icon name="save" className="text-base" />Save Changes</>}
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
