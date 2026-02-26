import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { AVATAR } from '../../data/mockData.js'

// ── Sparkle logo (same as before) ────────────────────────────────────────────
function SparkLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M20 8 L21.8 17.5 L31 20 L21.8 22.5 L20 32 L18.2 22.5 L9 20 L18.2 17.5 Z" fill="white" />
      <path d="M29 9 L29.9 12.5 L33.5 13.5 L29.9 14.5 L29 18 L28.1 14.5 L24.5 13.5 L28.1 12.5 Z" fill="white" opacity="0.85" />
      <circle cx="13" cy="28" r="2" fill="white" opacity="0.7" />
    </svg>
  )
}

// ── Nav items — primary ones shown flat, overflow go in "More" dropdown ───────
const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard'        },
  { path: '/users',     label: 'User Management', badge: '7'  },
  { path: '/knowledge', label: 'Knowledge Base'   },
  { path: '/ai',        label: 'AI Config',       badge: '1'  },
  { path: '/reports',   label: 'Reports'          },
  { path: '/courses',   label: 'Courses'          },
  { path: '/settings',  label: 'Settings'         },
]

// ── Generic hook: close dropdown when clicking outside ────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export default function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, setDark, logout } = useApp()

  const [profileOpen, setProfileOpen] = useState(false)
  const [moreOpen,    setMoreOpen]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const profileRef = useRef(null)
  const moreRef    = useRef(null)
  const mobileRef  = useRef(null)

  useClickOutside(profileRef, () => setProfileOpen(false))
  useClickOutside(moreRef,    () => setMoreOpen(false))
  useClickOutside(mobileRef,  () => setMobileOpen(false))

  const active = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  // Split nav: first 5 flat, rest in "More" dropdown
  const PRIMARY = NAV_ITEMS.slice(0, 5)
  const MORE    = NAV_ITEMS.slice(5)

  const go = (path) => { navigate(path); setMoreOpen(false); setMobileOpen(false) }

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center h-16 px-4 sm:px-6 gap-4">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => go('/')}
          className="flex items-center gap-2.5 flex-shrink-0 mr-2"
        >
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
            <SparkLogo />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">AI LMS</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Admin Portal</p>
          </div>
        </button>

        {/* ── Primary nav items (desktop) ──────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {PRIMARY.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium
                          transition-all whitespace-nowrap
                          ${active(item.path)
                            ? 'text-primary bg-primary/8 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
            >
              {item.label}
              {item.badge && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold
                                 bg-primary text-white rounded-full leading-none">
                  {item.badge}
                </span>
              )}
              {/* Active underline indicator */}
              {active(item.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}

          {/* "More" dropdown for remaining items */}
          {MORE.length > 0 && (
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(p => !p)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                            ${MORE.some(m => active(m.path))
                              ? 'text-primary bg-primary/8 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
              >
                More
                <span className="material-symbols-outlined text-base">{moreOpen ? 'expand_less' : 'expand_more'}</span>
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 card py-1.5 shadow-xl z-50 border border-slate-100 dark:border-slate-800">
                  {/* Tooltip arrow */}
                  <div className="absolute -top-2 left-5 w-4 h-4 bg-white dark:bg-slate-900 border-l border-t border-slate-100 dark:border-slate-800 rotate-45" />
                  {MORE.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => go(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors
                                  ${active(item.path)
                                    ? 'text-primary bg-primary/5 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold
                                         bg-primary text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* ── Right controls ────────────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search anything…"
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-48
                         focus:outline-none focus:ring-2 focus:ring-primary focus:w-56 transition-all"
            />
          </div>

          {/* Dark mode */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl text-slate-500">{dark ? 'light_mode' : 'dark_mode'}</span>
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
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(p => !p)}
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl p-1.5 transition-colors"
            >
              <img src={AVATAR} className="w-8 h-8 rounded-full object-cover border-2 border-primary/20" alt="Profile" />
              <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-white">James</span>
              <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 card py-2 shadow-xl z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">James Rodriguez</p>
                  <p className="text-xs text-slate-500">j.rod@company.com</p>
                  <span className="badge bg-blue-100 text-blue-700 mt-1">Admin</span>
                </div>
                {[['person', 'My Profile'], ['tune', 'Preferences'], ['lock', 'Change Password']].map(([icon, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate('/settings') }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                               hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>
                    {label}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); logout() }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(p => !p)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer (below header) ─────────────────────── */}
      {mobileOpen && (
        <div ref={mobileRef} className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
                          ${active(item.path)
                            ? 'text-primary bg-primary/8 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold
                                 bg-primary text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          {/* Mobile search */}
          <div className="pt-2 pb-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input type="text" placeholder="Search anything…"
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm w-full
                           focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
