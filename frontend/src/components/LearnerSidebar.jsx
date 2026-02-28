/**
 * LearnerSidebar — shared sidebar for ALL learner pages
 * Handles active state automatically from current URL.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/learner/dashboard' },
    { id: 'courses', label: 'My Courses', icon: 'book_5', path: '/learner/courses' },
    { id: 'messages', label: 'Messages', icon: 'mail', path: '/learner/messages' },
    { id: 'meetings', label: 'Meetings', icon: 'videocam', path: '/learner/meetings' },
    { id: 'ai-hub', label: 'AI Learning Hub', icon: 'psychology', path: '/learner/ai-hub' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring', path: '/learner/analytics' },
    { id: 'search', label: 'Search & QA', icon: 'search', path: '/learner/search' },
];

const PERSONAL_ITEMS = [
    { id: 'saved', label: 'Saved Resources', icon: 'bookmark', path: '/learner/saved' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/learner/settings' },
];

export default function LearnerSidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (path) => {
        if (path === '/learner/dashboard') return pathname === '/learner/dashboard' || pathname === '/dashboard/learner';
        return pathname.startsWith(path);
    };

    const btnClass = (path) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors ${isActive(path)
            ? 'bg-blue-600/10 text-blue-600 font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`;

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/learner/dashboard')}>
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => (
                    <button key={item.id} onClick={() => navigate(item.path)} className={btnClass(item.path)}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}

                <div className="pt-8 pb-2 px-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
                </div>

                {PERSONAL_ITEMS.map(item => (
                    <button key={item.id} onClick={() => navigate(item.path)} className={btnClass(item.path)}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-blue-600/5 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-blue-600 text-2xl mb-1 block">school</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">AI-Powered LMS</p>
                    <p className="text-[10px] mt-1 text-slate-400">Learn smarter with AI tools</p>
                </div>
            </div>
        </aside>
    );
}
