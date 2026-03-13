import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerNotifications from '../../components/TrainerNotifications';
import TrainerProfileDropdown from './TrainerProfileDropdown';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function TrainerMessages() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Trainer';
    const userEmail = localStorage.getItem('userEmail') || '';

    const [folder, setFolder] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [form, setForm] = useState({ recipient_id: '', subject: '', body: '' });
    const [sending, setSending] = useState(false);
    const [announcing, setAnnouncing] = useState(false);
    const [announceForm, setAnnounceForm] = useState({ subject: '', body: '' });
    const [announceSending, setAnnounceSending] = useState(false);

    const loadMessages = (f) => {
        setLoading(true);
        apiClient.get(`/api/v1/messaging?folder=${f}`).then(res => {
            setMessages(res.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { loadMessages(folder); }, [folder]);

    useEffect(() => {
        apiClient.get('/api/v1/messaging/recipients').then(res => setRecipients(res.data || [])).catch(() => { });
    }, []);

    const handleSend = async () => {
        if (!form.recipient_id || !form.body.trim()) return alert('Recipient and message body are required.');
        setSending(true);
        try {
            await apiClient.post('/api/v1/messaging', {
                recipient_id: parseInt(form.recipient_id),
                subject: form.subject,
                body: form.body,
            });
            setComposing(false);
            setForm({ recipient_id: '', subject: '', body: '' });
            loadMessages(folder);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const handleAnnounce = async () => {
        if (!announceForm.body.trim()) return alert('Announcement body is required.');
        setAnnounceSending(true);
        try {
            const res = await apiClient.post('/api/v1/messaging/announce', announceForm);
            alert(res.data.message || 'Announcement sent!');
            setAnnouncing(false);
            setAnnounceForm({ subject: '', body: '' });
            loadMessages('sent');
            setFolder('sent');
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to send announcement');
        } finally {
            setAnnounceSending(false);
        }
    };

    const handleRead = async (msg) => {
        setSelectedMsg(msg);
        if (!msg.is_read && folder === 'inbox') {
            try {
                await apiClient.post(`/api/v1/messaging/${msg.id}/read`);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
            } catch { }
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <TrainerSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Icon name="mail" className="text-blue-600" />Messages</h2>
                    <div className="flex items-center gap-4">
                        <TrainerNotifications />
                        <TrainerProfileDropdown userName={userName} userEmail={userEmail} />
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left panel — list */}
                    <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex gap-1">
                                {['inbox', 'sent'].map(f => (
                                    <button key={f} onClick={() => { setFolder(f); setSelectedMsg(null); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${folder === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => { setComposing(true); setAnnouncing(false); setSelectedMsg(null); }}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all" title="Direct Message">
                                    <Icon name="edit" className="text-base" />
                                </button>
                                <button onClick={() => { setAnnouncing(true); setComposing(false); setSelectedMsg(null); }}
                                    className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-all" title="Announce to All Learners">
                                    <Icon name="campaign" className="text-base" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-6 text-center text-slate-400"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                            ) : messages.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">No messages</div>
                            ) : messages.map(msg => (
                                <button key={msg.id} onClick={() => handleRead(msg)}
                                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-blue-50/50 transition-all ${selectedMsg?.id === msg.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''} ${!msg.is_read && folder === 'inbox' ? 'bg-blue-50/30' : ''}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-bold truncate ${!msg.is_read && folder === 'inbox' ? 'text-blue-600' : 'text-slate-900'}`}>
                                            {folder === 'inbox' ? msg.sender_name : msg.recipient_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0">{formatDate(msg.created_at)}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 truncate">{msg.subject || '(No subject)'}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{msg.body}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — detail, compose, or announce */}
                    <div className="flex-1 flex flex-col bg-white">
                        {announcing ? (
                            <div className="p-6 space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Icon name="campaign" className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Group Announcement</h3>
                                        <p className="text-xs text-slate-500">This message will be sent to ALL active learners</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Subject</label>
                                    <input value={announceForm.subject} onChange={e => setAnnounceForm({ ...announceForm, subject: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                        placeholder="e.g. Important: Schedule Change" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Announcement</label>
                                    <textarea rows={8} value={announceForm.body} onChange={e => setAnnounceForm({ ...announceForm, body: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                                        placeholder="Write your announcement..." />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setAnnouncing(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                                    <button onClick={handleAnnounce} disabled={announceSending}
                                        className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-60 flex items-center gap-2">
                                        {announceSending ? 'Sending...' : <><Icon name="campaign" className="text-base" />Send to All Learners</>}
                                    </button>
                                </div>
                            </div>
                        ) : composing ? (
                            <div className="p-6 space-y-4 max-w-2xl">
                                <h3 className="text-lg font-bold text-slate-900">New Message</h3>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">To</label>
                                    <select value={form.recipient_id} onChange={e => setForm({ ...form, recipient_id: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30">
                                        <option value="">Select recipient...</option>
                                        {recipients.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.role}) — {r.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Subject</label>
                                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                                        placeholder="Subject..." />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message</label>
                                    <textarea rows={8} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none"
                                        placeholder="Write your message..." />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setComposing(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                                    <button onClick={handleSend} disabled={sending}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                                        {sending ? 'Sending...' : <><Icon name="send" className="text-base" />Send</>}
                                    </button>
                                </div>
                            </div>
                        ) : selectedMsg ? (
                            <div className="p-6 max-w-2xl">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">{selectedMsg.subject || '(No subject)'}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                        <Icon name="person" className="text-base" />
                                        <span>{folder === 'inbox' ? `From: ${selectedMsg.sender_name}` : `To: ${selectedMsg.recipient_name}`}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{new Date(selectedMsg.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedMsg.body}
                                </div>
                                {folder === 'inbox' && (
                                    <button onClick={() => { setComposing(true); setForm({ recipient_id: String(selectedMsg.sender_id), subject: `Re: ${selectedMsg.subject}`, body: '' }); }}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                                        <Icon name="reply" className="text-base" />Reply
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-300">
                                <div className="text-center">
                                    <Icon name="mail" className="text-5xl block mx-auto mb-3" />
                                    <p className="font-medium">Select a message to read</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
