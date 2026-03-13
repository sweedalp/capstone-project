import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * TrainerSidebar
 * Used on ALL trainer pages.
 * Props:
 *   courseId (string, optional) — current course context for course-aware links
 */
const TrainerSidebar = ({ courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (id) => {
    if (id === 'dashboard') return path === '/trainer/dashboard' || path === '/dashboard/trainer';
    if (id === 'content') return path.includes('/trainer/content-library');
    if (id === 'courses') return path.includes('/trainer/courses') && !path.includes('/analytics') && !path.includes('/upload');
    if (id === 'analytics') return path.includes('/analytics');
    if (id === 'messages') return path.includes('/trainer/messages');
    if (id === 'meetings') return path.includes('/trainer/meetings');
    return false;
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/trainer/dashboard',
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: 'library_books',
      path: '/trainer/content-library',
    },
    {
      id: 'courses',
      label: 'Course Management',
      icon: 'school',
      path: courseId ? `/trainer/courses/${courseId}` : '/trainer/courses',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics',
      path: courseId ? `/trainer/courses/${courseId}/analytics` : '/trainer/analytics',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'mail',
      path: '/trainer/messages',
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: 'videocam',
      path: '/trainer/meetings',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen">
      {/* Logo */}
      <div
        className="p-6 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/trainer/dashboard')}
      >
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <span className="material-symbols-outlined block">cognition</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">AI-LMS</span>
      </div>

      <nav className="flex-1 mt-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all cursor-pointer relative
                ${active
                  ? 'bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span className={`material-symbols-outlined ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>

              {/* Active indicator dot */}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 space-y-3">
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default TrainerSidebar;