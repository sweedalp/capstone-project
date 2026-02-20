import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const NAV = [
  { to: '/leadership/dashboard',  icon: 'dashboard',       label: 'Dashboard'   },
  { to: '/leadership/students',   icon: 'group',           label: 'Students'    },
  { to: '/leadership/curriculum', icon: 'auto_stories',    label: 'Curriculum'  },
  { to: '/leadership/analytics',  icon: 'bar_chart',       label: 'Reports'     },
  { to: '/leadership/management', icon: 'manage_accounts', label: 'Management'  },
  { to: '/leadership/settings',   icon: 'settings',        label: 'Settings'    },
];

const NOTIFICATIONS = [
  {
    id: 1,
    icon: 'schedule',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    title: 'Student Report Due Soon',
    message: 'Monthly progress report deadline is tomorrow',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    icon: 'military_tech',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    title: 'New Course Completed!',
    message: '5 students finished Advanced Python',
    time: '5 hours ago',
    unread: true,
  },
];

export default function LeadershipShell({ children }) {
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen]           = useState(false);
  const [notifOpen, setNotifOpen]                 = useState(false);
  const [logoutModal, setLogoutModal]             = useState(false);

  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  /* ── close on outside click ── */
  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen, notifOpen]);

  /* ── logout ── */
  const handleLogoutConfirm = () => {
    localStorage.clear();
    setLogoutModal(false);
    navigate('/login');
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Lexend', 'Segoe UI', sans-serif" }}
    >
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { fontFamily: "'Lexend','Segoe UI',sans-serif", fontSize: '13px' } }}
      />

      {/* ══ Mobile overlay ══ */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col',
          'w-64 bg-white border-r border-slate-200 transition-transform duration-300 shrink-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-[18px] font-bold tracking-tight text-blue-600 leading-none">AI LMS</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Leadership Suite</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Storage Used */}
        <div className="border-t border-slate-200 p-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Used</p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">1.3 GB of 2 GB cloud sync used</p>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Topbar ── */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-20 flex items-center gap-4 px-6">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors lg:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Page title — supplied by each page via prop or left empty */}
          <h1 className="text-[15px] font-bold text-slate-800 hidden sm:block whitespace-nowrap">
            Leadership Dashboard
          </h1>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search courses, concepts, or files..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-[13px] border-none outline-none focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); }}
                className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Notification panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-bold">Notifications</p>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">{unreadCount} new</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className={`p-2 rounded-xl ${n.iconBg} shrink-0`}>
                          <span className={`material-symbols-outlined text-[18px] ${n.iconColor}`}>{n.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                        {n.unread && <span className="size-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <button className="text-[12px] text-blue-600 font-semibold hover:underline">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + name + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2.5 cursor-pointer group"
                aria-expanded={dropdownOpen}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[12px] font-bold leading-none">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Program Director</p>
                </div>
                <div
                  className="size-9 rounded-full bg-cover bg-center border-2 border-white shadow ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                  style={{ backgroundImage: `url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=compress")` }}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-bold text-slate-900">Alex Rivera</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">alex.rivera@company.com</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/leadership/settings'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-slate-500">person</span>
                      <span className="font-medium">Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-slate-500">help</span>
                      <span className="font-medium">Help & Support</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => { setDropdownOpen(false); setLogoutModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════════════
          LOGOUT CONFIRMATION MODAL
      ══════════════════════════════════════════════ */}
      {logoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-[17px] font-bold text-slate-900">Confirm Logout</h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-amber-600">logout</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">Are you sure you want to logout?</p>
                  <p className="text-[12px] text-slate-500 mt-1">You will be redirected to the login page.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => setLogoutModal(false)}
                className="px-5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-5 py-2.5 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}