import React, { useState, useEffect } from 'react';
import LearnerSidebar from '../../components/LearnerSidebar';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function LearnerMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/api/v1/meetings/all').then(res => {
            setMeetings(res.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const formatDateTime = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const isUpcoming = (iso) => new Date(iso) > new Date();
    const upcoming = meetings.filter(m => isUpcoming(m.scheduled_at));
    const past = meetings.filter(m => !isUpcoming(m.scheduled_at));

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            <LearnerSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Icon name="videocam" className="text-blue-600" />Scheduled Meetings</h2>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Icon name="event_upcoming" className="text-green-600" />Upcoming Meetings ({upcoming.length})
                                </h3>
                                {upcoming.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                                        <Icon name="event" className="text-4xl block mx-auto mb-2" />
                                        <p className="font-medium">No upcoming meetings</p>
                                        <p className="text-xs mt-1">Your trainer will schedule meetings here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcoming.map(m => (
                                            <div key={m.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <Icon name="videocam" className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{m.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1"><Icon name="person" className="text-xs" />{m.host_name}</span>
                                                            <span className="flex items-center gap-1"><Icon name="schedule" className="text-xs" />{formatDateTime(m.scheduled_at)}</span>
                                                            <span className="flex items-center gap-1"><Icon name="timer" className="text-xs" />{m.duration_minutes} min</span>
                                                        </div>
                                                        {m.description && <p className="text-xs text-slate-400 mt-1">{m.description}</p>}
                                                    </div>
                                                </div>
                                                {m.meeting_url ? (
                                                    <a href={m.meeting_url} target="_blank" rel="noopener noreferrer"
                                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1.5 shadow-sm shrink-0">
                                                        <Icon name="open_in_new" className="text-sm" />Join Meeting
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic shrink-0">Link not yet shared</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {past.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Icon name="history" className="text-slate-400" />Past Meetings ({past.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {past.map(m => (
                                            <div key={m.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 opacity-60">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Icon name="videocam" className="text-slate-400 text-base" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{m.title}</h4>
                                                    <span className="text-xs text-slate-400">{m.host_name} · {formatDateTime(m.scheduled_at)} · {m.duration_minutes} min</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
