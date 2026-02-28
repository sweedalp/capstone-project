import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function TrainerMeetings() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Trainer';
    const userEmail = localStorage.getItem('userEmail') || '';

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: '', meeting_url: '', description: '', scheduled_at: '', duration_minutes: 30,
    });

    const loadMeetings = () => {
        setLoading(true);
        apiClient.get('/api/v1/meetings').then(res => {
            setMeetings(res.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { loadMeetings(); }, []);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.scheduled_at) return alert('Title and date are required.');
        setCreating(true);
        try {
            const res = await apiClient.post('/api/v1/meetings', form);
            setMeetings(prev => [res.data, ...prev]);
            setShowCreate(false);
            setForm({ title: '', meeting_url: '', description: '', scheduled_at: '', duration_minutes: 30 });
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to create meeting');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Cancel this meeting?')) return;
        try {
            await apiClient.delete(`/api/v1/meetings/${id}`);
            setMeetings(prev => prev.filter(m => m.id !== id));
        } catch { alert('Failed to delete meeting'); }
    };

    const formatDateTime = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const isUpcoming = (iso) => new Date(iso) > new Date();

    const upcoming = meetings.filter(m => isUpcoming(m.scheduled_at));
    const past = meetings.filter(m => !isUpcoming(m.scheduled_at));

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <TrainerSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Icon name="videocam" className="text-blue-600" />Meetings</h2>
                    <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule & Manage Meetings</h1>
                            <p className="text-slate-500 mt-1">Create video call links to meet with your students.</p>
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Icon name="add" className="text-base" />New Meeting
                        </button>
                    </div>

                    {/* Upcoming */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Icon name="event_upcoming" className="text-green-600" />Upcoming ({upcoming.length})
                        </h2>
                        {upcoming.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                                <Icon name="event" className="text-4xl block mx-auto mb-2" />
                                <p>No upcoming meetings</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcoming.map(m => (
                                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <Icon name="videocam" className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{m.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Icon name="schedule" className="text-xs" />{formatDateTime(m.scheduled_at)}</span>
                                                    <span>{m.duration_minutes} min</span>
                                                </div>
                                                {m.description && <p className="text-xs text-slate-400 mt-1">{m.description}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {m.meeting_url && (
                                                <a href={m.meeting_url} target="_blank" rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                                                    <Icon name="open_in_new" className="text-sm" />Join
                                                </a>
                                            )}
                                            <button onClick={() => handleDelete(m.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <Icon name="delete" className="text-base" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past */}
                    {past.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Icon name="history" className="text-slate-400" />Past ({past.length})
                            </h2>
                            <div className="space-y-2">
                                {past.map(m => (
                                    <div key={m.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between opacity-70">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <Icon name="videocam" className="text-slate-400 text-base" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-700 text-sm">{m.title}</h3>
                                                <span className="text-xs text-slate-400">{formatDateTime(m.scheduled_at)} · {m.duration_minutes} min</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(m.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all">
                                            <Icon name="close" className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Schedule Meeting</h2>
                            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                                <Icon name="close" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title *</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                    placeholder="e.g. Python Q&A Session" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Meeting URL</label>
                                <input value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                    placeholder="https://meet.google.com/... or Zoom link" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                                    placeholder="Brief description..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date & Time *</label>
                                    <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Duration (min)</label>
                                    <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowCreate(false)}
                                    className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                                <button onClick={handleCreate} disabled={creating}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                                    {creating ? 'Creating...' : 'Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
