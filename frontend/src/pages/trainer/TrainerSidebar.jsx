import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * TrainerSidebar
 * Exact replica of the Dashboard sidebar, used on ALL trainer pages.
 * Props:
 *   courseId (string, optional) — current course context for course-aware links
 */
const TrainerSidebar = ({ courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (id) => {
    if (id === 'dashboard') return path === '/dashboard/trainer' || path === '/trainer/dashboard';
    if (id === 'content')   return path.includes('/trainer/content-library');
    if (id === 'courses')   return path.includes('/trainer/courses') && !path.includes('/analytics') && !path.includes('/upload');
    if (id === 'analytics') return path.includes('/analytics');
    if (id === 'ai-studio') return path.includes('/trainer/ai-studio');
    return false;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',         icon: 'dashboard',    path: '/dashboard/trainer' },
    { id: 'content',   label: 'Content Library',   icon: 'library_books',path: '/trainer/content-library' },
    { id: 'courses',   label: 'Course Management', icon: 'school',       path: courseId ? `/trainer/courses/${courseId}` : '/trainer/courses/python-101' },
    { id: 'analytics', label: 'Analytics',         icon: 'analytics',    path: courseId ? `/trainer/courses/${courseId}/analytics` : '/trainer/analytics' },
    { id: 'ai-studio', label: 'AI Studio',         icon: 'auto_awesome', path: '/trainer/ai-studio' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo — always navigates to Dashboard */}
      <div
        className="p-6 flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/dashboard/trainer')}
      >
        <div className="bg-primary p-1.5 rounded-lg text-white">
          <span className="material-symbols-outlined block">cognition</span>
        </div>
        <span className="text-xl font-bold tracking-tight">AI-LMS</span>
      </div>

      <nav className="flex-1 mt-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all cursor-pointer relative overflow-hidden
              ${isActive(item.id)
                ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Pro Plan</p>
          <p className="text-sm text-slate-700 leading-tight mb-3">Upgrade for unlimited AI generations.</p>
          <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-all">
            Go Premium
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TrainerSidebar;
