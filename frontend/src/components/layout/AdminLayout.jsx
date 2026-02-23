import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AdminProvider, useApp } from '../../context/AdminContext.jsx'
import Toast from '../ui/Toast.jsx'

// ── Sparkle Logo ──────────────────────────────────────────────────────────────
function SparkLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M20 8 L21.8 17.5 L31 20 L21.8 22.5 L20 32 L18.2 22.5 L9 20 L18.2 17.5 Z" fill="white" />
      <path d="M29 9 L29.9 12.5 L33.5 13.5 L29.9 14.5 L29 18 L28.1 14.5 L24.5 13.5 L28.1 12.5 Z" fill="white" opacity="0.85" />
      <circle cx="13" cy="28" r="2" fill="white" opacity="0.7" />
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard/admin',           icon: 'dashboard',   label: 'Dashboard'        },
  { path: '/dashboard/admin/users',     icon: 'group',       label: 'User Management', badge: '7', badgeColor: 'bg-[#137fec]/10 text-[#137fec]' },
  { path: '/dashboard/admin/knowledge', icon: 'folder_open', label: 'Knowledge Base'   },
  { path: '/dashboard/admin/ai',        icon: 'smart_toy',   label: 'AI Configuration', badge: '1', badgeColor: 'bg-amber-100 text-amber-700' },
  { path: '/dashboard/admin/reports',   icon: 'bar_chart',   label: 'Reports'          },
  { path: '/dashboard/admin/courses',   icon: 'school',      label: 'Courses'          },
  { path: '/dashboard/admin/settings',  icon: 'settings',    label: 'System Settings'  },
]

// ── Inner shell (needs AdminContext) ──────────────────────────────────────────
function AdminShell() {
  const navigate       = useNavigate()
  const location       = useLocation()
  const { dark, setDark, toast, setToast } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const active = (path) =>
    path === '/dashboard/admin'
      ? location.pathname === '/dashboard/admin'
      : location.pathname.startsWith(path)

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const go = (path) => { navigate(path); setSidebarOpen(false) }

  return (
    <div
      className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922]"
      style={{ fontFamily: "'Lexend', sans-serif" }}
    >
      {/* ── Sidebar ────────────────────────────────────────────── */}
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900
                    border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col
                    transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
          onClick={() => go('/dashboard/admin')}
        >
          <div className="w-9 h-9 bg-[#137fec] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-[#137fec]/30">
            <SparkLogo />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
              AI LMS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Portal</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-4 py-2">
            Main Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm font-medium transition-all
                ${active(item.path)
                  ? 'bg-[#137fec]/10 text-[#137fec] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-[#137fec]/5 hover:text-[#137fec]'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer: storage meter + help */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold">Storage</span>
              <span>74%</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: '74%' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">18.5 GB of 25 GB used</p>
          </div>
          <button
            type="button"
            onClick={() => go('/dashboard/admin/settings')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-xs font-medium
                       text-slate-600 dark:text-slate-400 hover:bg-[#137fec]/5 hover:text-[#137fec] transition-all"
          >
            <span className="material-symbols-outlined text-lg">help_outline</span>
            Help &amp; Support
          </button>
        </div>
      </aside>

      {/* ── Main area (offset by sidebar on desktop) ───────────── */}
      <div className="lg:pl-64">

        {/* ── Top header bar ─────────────────────────────────────── */}
        <header className="sticky top-0 z-20 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center h-16 px-4 sm:px-6 gap-4">

            {/* Hamburger (mobile only) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            {/* Search */}
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                type="text"
                placeholder="Search anything…"
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-56
                           focus:outline-none focus:ring-2 focus:ring-[#137fec]"
              />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Dark mode */}
              <button
                type="button"
                onClick={() => setDark(!dark)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-slate-500">
                  {dark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Notifications */}
              <button
                type="button"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <span className="material-symbols-outlined text-xl text-slate-500">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl p-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center text-white font-bold text-sm">
                    {(user.name || user.email || 'A')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-white">
                    {user.name || 'Admin'}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl
                                  border border-slate-100 dark:border-slate-800 py-2 shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name || 'Admin User'}</p>
                      <p className="text-xs text-slate-500">{user.email || ''}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mt-1">
                        Admin
                      </span>
                    </div>

                    {[['person','My Profile'],['tune','Preferences'],['lock','Change Password']].map(([icon, label]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setProfileOpen(false); go('/dashboard/admin/settings') }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                   text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>
                        {label}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────── */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  )
}
