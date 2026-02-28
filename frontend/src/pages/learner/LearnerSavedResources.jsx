import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnerSidebar from '../../components/LearnerSidebar';
import apiClient from '../../services/api';

const Icon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
);

export default function LearnerSavedResources() {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/api/v1/saved-resources/')
            .then(res => {
                setResources(
                    (res.data || []).map(r => ({
                        ...r,
                        color: r.icon_color,
                        bg: r.icon_bg,
                        savedAt: new Date(r.created_at).toLocaleDateString(),
                    }))
                );
            })
            .catch(err => console.warn('Failed to load saved resources', err))
            .finally(() => setLoading(false));
    }, []);

    const remove = async (id) => {
        try {
            await apiClient.delete(`/api/v1/saved-resources/${id}`);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to remove resource', err);
        }
    };

    const openResource = (r) => {
        if (r.url) navigate(r.url);
        else if (r.lesson_id) navigate(`/learner/courses/0/lessons/${r.lesson_id}`);
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            <LearnerSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Icon name="bookmark" className="text-blue-600" />Saved Resources</h2>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-3xl space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 p-12 text-center">
                            <Icon name="bookmark_border" className="text-5xl text-slate-300 block mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No saved resources yet</p>
                            <p className="text-xs text-slate-400 mt-1">Bookmark lessons, videos, and documents to access them here</p>
                        </div>
                    ) : resources.map(r => (
                        <div key={r.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => openResource(r)}>
                                <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}>
                                    <Icon name={r.icon} className={r.color} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="capitalize">{r.resource_type}</span>
                                        <span>Saved {r.savedAt}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openResource(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                    <Icon name="open_in_new" className="text-base" />
                                </button>
                                <button onClick={() => remove(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Icon name="bookmark_remove" className="text-base" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
