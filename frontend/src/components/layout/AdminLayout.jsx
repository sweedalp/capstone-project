import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AdminProvider, useApp } from '../../context/AdminContext.jsx'
import Toast from '../ui/Toast.jsx'

// ── Sparkle Logo ─────────────────────────────────────────────────────────────
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
  { path: '/dashboard/admin',            label: 'Dashboard'       },
  { path: '/dashboard/admin/users',      label: 'User Management', badge: '7' },
  { path: '/dashboard/admin/knowledge',  label: 'Knowledge Base'  },
  { path: '/dashboard/admin/ai',         label: 'AI Config',      badge: '1' },
  { path: '/dashboard/admin/reports',    label: 'Reports'         },
  { path: '/dashboard/admin/courses',    label: 'Courses'         },
  { path: '/dashboard/admin/settings',   label: 'Settings'        },
]

// ── Inner layout (needs AdminContext) ─────────────────────────────────────────
function AdminShell() {
  const navigate = useNavigate()
  const { dark, setDark, toast, setToast } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Get current path to highlight active nav
  const currentPath = window.location.pathname
  const active = (path) =>
    path === '/dashboard/admin'
      ? currentPath === '/dashboard/admin'
      : currentPath.startsWith(path)

  // Read user from localStorage (set by the existing login page)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const PRIMARY = NAV_ITEMS.slice(0, 5)
  const MORE    = NAV_ITEMS.slice(5)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] font-[Lexend,sans-serif]">
      {/* ── Top navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center h-16 px-4 sm:px-6 gap-4">

          {/* Logo */}
          <button onClick={() => navigate('/dashboard/admin')}
            className="flex items-center gap-2.5 flex-shrink-0 mr-2">
            <div className="w-9 h-9 bg-[#137fec] rounded-xl flex items-center justify-center shadow-md">
              <SparkLogo />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">AI LMS</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Admin Portal</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {PRIMARY.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${active(item.path)
                    ? 'text-[#137fec] bg-blue-50 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
                {item.label}
                {item.badge && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#137fec] text-white rounded-full">{item.badge}</span>
                )}
                {active(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#137fec] rounded-full" />
                )}
              </button>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button onClick={() => setMoreOpen(p => !p)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                  ${MORE.some(m => active(m.path)) ? 'text-[#137fec] bg-blue-50 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                More
                <span className="material-symbols-outlined text-base">{moreOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl py-1.5 z-50">
                  <div className="absolute -top-2 left-5 w-4 h-4 bg-white dark:bg-slate-900 border-l border-t border-slate-100 dark:border-slate-800 rotate-45" />
                  {MORE.map(item => (
                    <button key={item.path} onClick={() => { navigate(item.path); setMoreOpen(false) }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors
                        ${active(item.path) ? 'text-[#137fec] bg-blue-50 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <span>{item.label}</span>
                      {item.badge && <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#137fec] text-white rounded-full">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" placeholder="Search anything…"
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#137fec]" />
            </div>

            <button onClick={() => setDark(!dark)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined text-xl text-slate-500">{dark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-xl text-slate-500">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setMobileOpen(p => !p)}
                className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl p-1.5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-white">
                  {user.name || 'Admin'}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
              </button>

              {mobileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 py-2 shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">{user.email || ''}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mt-1">Admin</span>
                  </div>
                  {[['person','My Profile'],['tune','Preferences'],['lock','Change Password']].map(([icon, label]) => (
                    <button key={label} onClick={() => { navigate('/dashboard/admin/settings'); setMobileOpen(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>{label}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">logout</span>Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

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