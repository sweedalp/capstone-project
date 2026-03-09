/**
 * LearnerSidebar — shared sidebar for ALL learner pages
 * Handles active state automatically from current URL.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
};

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

    const userName  = localStorage.getItem('userName')  || 'Learner';
    const userEmail = localStorage.getItem('userEmail') || '';
    const initials  = getInitials(userName);

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

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => navigate('/learner/settings')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                    <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0 text-left">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{userEmail || 'Learner'}</p>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-600 ml-auto shrink-0">settings</span>
                </button>
            </div>
        </aside>
    );
}
