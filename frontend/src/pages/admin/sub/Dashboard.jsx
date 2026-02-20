import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AdminContext.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { DASHBOARD_EVENTS, AI_SERVICES_SUMMARY } from '../../../data/adminMockData.js'

const STATS = [
  { label:'Total Users',     value:'1,247', sub:'+23 this week',   icon:'group',       color:'text-blue-500',   bg:'bg-blue-50 dark:bg-blue-900/20',     path:'/users'     },
  { label:'Active Learners', value:'934',   sub:'74.9% of users',  icon:'school',      color:'text-green-500',  bg:'bg-green-50 dark:bg-green-900/20',   path:'/users'     },
  { label:'Content Items',   value:'186',   sub:'12 this month',   icon:'folder_open', color:'text-purple-500', bg:'bg-purple-50 dark:bg-purple-900/20', path:'/knowledge' },
  { label:'AI Generations',  value:'3,892', sub:'Queue: 3 jobs',   icon:'smart_toy',   color:'text-primary',    bg:'bg-blue-50 dark:bg-blue-900/20',     path:'/ai'        },
]

const QUICK_ACTIONS = [
  { label:'Add New User',    icon:'person_add',  path:'/users',     color:'bg-blue-500'   },
  { label:'Upload Content',  icon:'upload_file', path:'/knowledge', color:'bg-purple-500' },
  { label:'Run AI Job',      icon:'play_circle', path:'/ai',        color:'bg-green-500'  },
  { label:'Generate Report', icon:'summarize',   path:'/reports',   color:'bg-primary'    },
]

// ── Raw data for the activity chart ──────────────────────────────────────────
const RAW = [38,52,41,67,59,80,70,88,63,75,85,92,71,58,80,68,85,90,65,72,82,88,75,62,85,70,93,83,76,90]
const LABELS = ['Apr 1','Apr 8','Apr 15','Apr 22','Apr 30']

// ── Pure SVG area chart (no library needed) ───────────────────────────────────
function ActivityChart() {
  const W = 800, H = 180, PAD = { t:16, r:20, b:32, l:40 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b
  const min = Math.min(...RAW) - 8
  const max = Math.max(...RAW) + 4
  const x = (i) => PAD.l + (i / (RAW.length - 1)) * chartW
  const y = (v) => PAD.t + chartH - ((v - min) / (max - min)) * chartH

  const pts = RAW.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const area = `M${x(0)},${y(RAW[0])} ` +
    RAW.slice(1).map((v,i) => `L${x(i+1)},${y(v)}`).join(' ') +
    ` L${x(RAW.length-1)},${PAD.t+chartH} L${x(0)},${PAD.t+chartH} Z`
  const line = `M${x(0)},${y(RAW[0])} ` + RAW.slice(1).map((v,i) => `L${x(i+1)},${y(v)}`).join(' ')

  // y-axis tick values
  const ticks = [0,1,2,3].map(i => Math.round(min + (i/(3)) * (max-min)))

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320 }}
        aria-label="User activity chart"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#137fec" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#137fec" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {ticks.map((tick, i) => {
          const yy = y(tick)
          return (
            <g key={i}>
              <line x1={PAD.l} y1={yy} x2={W - PAD.r} y2={yy}
                stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="4 4" className="text-slate-500" />
              <text x={PAD.l - 6} y={yy + 4} textAnchor="end"
                fontSize="9" fill="currentColor" opacity="0.4" className="text-slate-500">{tick}</text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={area} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={line} fill="none" stroke="#137fec" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points – render only every 5th to avoid clutter */}
        {RAW.map((v, i) => i % 5 === 0 && (
          <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#137fec" stroke="white" strokeWidth="2" />
        ))}

        {/* X-axis labels */}
        {LABELS.map((label, i) => {
          const xi = Math.round((i / (LABELS.length - 1)) * (RAW.length - 1))
          return (
            <text key={i} x={x(xi)} y={H - 6} textAnchor="middle"
              fontSize="10" fill="currentColor" opacity="0.45" className="text-slate-500">{label}</text>
          )
        })}

        {/* X-axis base line */}
        <line x1={PAD.l} y1={PAD.t + chartH} x2={W - PAD.r} y2={PAD.t + chartH}
          stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" className="text-slate-500" />
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [alerts, setAlerts] = useState([
    { id:1, type:'warning', msg:'Storage usage at 74% – consider cleanup',      icon:'storage'    },
    { id:2, type:'error',   msg:'AI job failed: Compliance & Ethics Training',  icon:'error'      },
    { id:3, type:'info',    msg:'2 users pending approval',                     icon:'person_add' },
  ])

  const dismiss = (id) => setAlerts(a => a.filter(x => x.id !== id))

  const alertClass = (type) => {
    if (type === 'warning') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 border border-amber-200'
    if (type === 'error')   return 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200'
    return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200'
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, James. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/reports')} className="btn-secondary"><Icon name="bar_chart" className="text-lg" />View Reports</button>
          <button onClick={() => showToast('Data refreshed!', 'success')} className="btn-primary"><Icon name="refresh" className="text-lg" />Refresh</button>
        </div>
      </div>

      {/* Alert banners */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map(a => (
            <div key={a.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${alertClass(a.type)}`}>
              <Icon name={a.icon} className="text-xl flex-shrink-0" />
              <span className="flex-1">{a.msg}</span>
              <button onClick={() => dismiss(a.id)} className="opacity-60 hover:opacity-100">
                <Icon name="close" className="text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="stat-card group" onClick={() => navigate(s.path)}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon name={s.icon} className={`text-2xl ${s.color}`} /></div>
              <Icon name="arrow_outward" className="text-slate-300 group-hover:text-primary text-lg transition-colors" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            <div className="text-xs text-green-500 font-semibold mt-1.5 flex items-center gap-1">
              <Icon name="trending_up" className="text-base" />{s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── User Activity chart ───────────────────────────────── */}
        <div className="lg:col-span-8 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">User Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily logins over the last 30 days</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                <span className="text-xs text-slate-400 font-medium">Logins</span>
              </div>
              <select className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5
                                 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Peak Day',    value:'93',  sub:'Apr 27', icon:'trending_up', color:'text-green-500'  },
              { label:'Daily Avg',   value:'74',  sub:'logins', icon:'show_chart',  color:'text-primary'    },
              { label:'This Week',   value:'+8%', sub:'vs last', icon:'insights',   color:'text-purple-500' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SVG chart */}
          <ActivityChart />
        </div>

        {/* ── AI Services ─────────────────────────────────────────── */}
        <div className="lg:col-span-4 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="smart_toy" className="text-primary text-xl" />AI Services
            </h3>
            <button onClick={() => navigate('/ai')} className="text-xs text-primary font-semibold hover:underline">
              Configure →
            </button>
          </div>
          <div className="space-y-3">
            {AI_SERVICES_SUMMARY.map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.calls.toLocaleString()} calls · {s.uptime}</p>
                  </div>
                </div>
                <Badge color={s.status === 'active' ? 'green' : 'amber'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Events ────────────────────────────────────────── */}
        <div className="lg:col-span-6 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live
            </span>
          </div>
          <div className="space-y-3">
            {DASHBOARD_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${ev.bg}`}>
                  <Icon name={ev.icon} className={`text-base ${ev.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{ev.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────── */}
        <div className="lg:col-span-3 card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800
                           transition-all text-sm font-medium text-slate-700 dark:text-slate-300 group">
                <div className={`p-1.5 rounded-lg ${a.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon name={a.icon} className="text-base" />
                </div>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── System Health ────────────────────────────────────────── */}
        <div className="lg:col-span-3 card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">System Health</h3>
          {[
            ['CPU Usage', '42%', 42, 'bg-green-500', 'text-green-500'],
            ['Memory',    '68%', 68, 'bg-amber-500', 'text-amber-500'],
            ['Storage',   '74%', 74, 'bg-amber-500', 'text-amber-500'],
            ['API Health','99%', 99, 'bg-green-500', 'text-green-500'],
          ].map(([label, val, pct, barColor, textColor]) => (
            <div key={label} className="mb-4 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-semibold">{label}</span>
                <span className={`font-bold ${textColor}`}>{val}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: val }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
