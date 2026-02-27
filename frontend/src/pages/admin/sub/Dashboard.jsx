import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminDashboardApi } from '../../../services/adminApi'

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
)
const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue:  'bg-blue-100 text-blue-700',
    red:   'bg-red-100 text-red-700',
  }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>
}

const RAW = [38,52,41,67,59,80,70,88,63,75,85,92,71,58,80,68,85,90,65,72,82,88,75,62,85,70,93,83,76,90]
const LABELS = ['Apr 1','Apr 8','Apr 15','Apr 22','Apr 30']

function ActivityChart() {
  const W = 800, H = 180, PAD = { t:16, r:20, b:32, l:40 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b
  const min = Math.min(...RAW) - 8
  const max = Math.max(...RAW) + 4
  const x = (i) => PAD.l + (i / (RAW.length - 1)) * chartW
  const y = (v) => PAD.t + chartH - ((v - min) / (max - min)) * chartH
  const area = `M${x(0)},${y(RAW[0])} ` + RAW.slice(1).map((v,i) => `L${x(i+1)},${y(v)}`).join(' ') +
    ` L${x(RAW.length-1)},${PAD.t+chartH} L${x(0)},${PAD.t+chartH} Z`
  const line = `M${x(0)},${y(RAW[0])} ` + RAW.slice(1).map((v,i) => `L${x(i+1)},${y(v)}`).join(' ')
  const ticks = [0,1,2,3].map(i => Math.round(min + (i/3) * (max-min)))
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#137fec" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#137fec" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {ticks.map((tick, i) => {
          const yy = y(tick)
          return (
            <g key={i}>
              <line x1={PAD.l} y1={yy} x2={W-PAD.r} y2={yy} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.l-6} y={yy+4} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.4">{tick}</text>
            </g>
          )
        })}
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="#137fec" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {RAW.map((v, i) => i % 5 === 0 && (
          <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#137fec" stroke="white" strokeWidth="2" />
        ))}
        {LABELS.map((label, i) => {
          const xi = Math.round((i / (LABELS.length-1)) * (RAW.length-1))
          return <text key={i} x={x(xi)} y={H-6} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.45">{label}</text>
        })}
        <line x1={PAD.l} y1={PAD.t+chartH} x2={W-PAD.r} y2={PAD.t+chartH} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      </svg>
    </div>
  )
}

// ✅ Matches App.jsx route: <Route path="/dashboard/admin" element={<AdminLayout />}>
const BASE = '/dashboard/admin'

const QUICK_ACTIONS = [
  { label:'Add New User',    icon:'person_add',  path:`${BASE}/users`,     color:'bg-blue-500'   },
  { label:'Upload Content',  icon:'upload_file', path:`${BASE}/knowledge`, color:'bg-purple-500' },
  { label:'Run AI Job',      icon:'play_circle', path:`${BASE}/ai`,        color:'bg-green-500'  },
  { label:'Generate Report', icon:'summarize',   path:`${BASE}/reports`,   color:'bg-blue-600'   },
]

const AI_SERVICES_SUMMARY = [
  { name:'OpenAI GPT-4',    status:'active', calls:12847, uptime:'99.9%' },
  { name:'Whisper STT',     status:'active', calls:3421,  uptime:'99.7%' },
  { name:'ElevenLabs TTS',  status:'active', calls:891,   uptime:'98.2%' },
  { name:'Stable Diffusion',status:'idle',   calls:234,   uptime:'95.1%' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats]           = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [toastMsg, setToastMsg]     = useState(null)
  const userName = localStorage.getItem('userName') || 'Admin'

  const [alerts, setAlerts] = useState([
    { id:1, type:'warning', msg:'Storage usage at 74% – consider cleanup',   icon:'storage'    },
    { id:2, type:'info',    msg:'Check AI configuration for active services', icon:'smart_toy'  },
    { id:3, type:'info',    msg:'Platform stats loaded from live database',   icon:'person_add' },
  ])

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type })
    setTimeout(() => setToastMsg(null), 3000)
  }
  const dismiss = (id) => setAlerts(a => a.filter(x => x.id !== id))
  const alertClass = (type) => {
    if (type === 'warning') return 'bg-amber-50 text-amber-700 border border-amber-200'
    if (type === 'error')   return 'bg-red-50 text-red-600 border border-red-200'
    return 'bg-blue-50 text-blue-600 border border-blue-200'
  }

  useEffect(() => {
    Promise.all([
      adminDashboardApi.getStats(),
      adminDashboardApi.getActivities(8),
    ]).then(([statsData, activitiesData]) => {
      setStats(statsData)
      setActivities(activitiesData || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const STATS = stats ? [
    { label:'Total Users',     value: stats.total_users?.toLocaleString()    || '0', sub:`${stats.total_trainers || 0} trainers · ${stats.total_learners || 0} learners`, icon:'group',       color:'text-blue-500',   bg:'bg-blue-50',   path:`${BASE}/users`    },
    { label:'Active Learners', value: stats.total_learners?.toLocaleString() || '0', sub:`${stats.total_enrollments || 0} total enrollments`,                              icon:'school',      color:'text-green-500',  bg:'bg-green-50',  path:`${BASE}/users`    },
    { label:'Content Items',   value: stats.total_lessons?.toLocaleString()  || '0', sub:`Across ${stats.total_courses || 0} courses`,                                     icon:'folder_open', color:'text-purple-500', bg:'bg-purple-50', path:`${BASE}/knowledge`},
    { label:'Total Courses',   value: stats.total_courses?.toLocaleString()  || '0', sub:`${stats.published_courses || 0} published · ${stats.draft_courses || 0} drafts`, icon:'smart_toy',   color:'text-blue-600',   bg:'bg-blue-50',   path:`${BASE}/courses`  },
  ] : [
    { label:'Total Users',     value:'—', sub:'Loading...', icon:'group',       color:'text-blue-500',   bg:'bg-blue-50',   path:`${BASE}/users`    },
    { label:'Active Learners', value:'—', sub:'Loading...', icon:'school',      color:'text-green-500',  bg:'bg-green-50',  path:`${BASE}/users`    },
    { label:'Content Items',   value:'—', sub:'Loading...', icon:'folder_open', color:'text-purple-500', bg:'bg-purple-50', path:`${BASE}/knowledge`},
    { label:'Total Courses',   value:'—', sub:'Loading...', icon:'smart_toy',   color:'text-blue-600',   bg:'bg-blue-50',   path:`${BASE}/courses`  },
  ]

  const actionIcon = (action) => {
    const map = {
      course_created:   { icon:'school',         bg:'bg-blue-50',   color:'text-blue-600'   },
      course_published: { icon:'publish',         bg:'bg-green-50',  color:'text-green-600'  },
      video_uploaded:   { icon:'video_library',   bg:'bg-purple-50', color:'text-purple-600' },
      pdf_uploaded:     { icon:'picture_as_pdf',  bg:'bg-red-50',    color:'text-red-600'    },
      password_reset:   { icon:'lock_reset',      bg:'bg-amber-50',  color:'text-amber-600'  },
      role_changed:     { icon:'manage_accounts', bg:'bg-indigo-50', color:'text-indigo-600' },
      user_toggled:     { icon:'toggle_on',       bg:'bg-slate-100', color:'text-slate-600'  },
    }
    return map[action] || { icon:'notifications', bg:'bg-slate-100', color:'text-slate-500' }
  }

  const formatTime = (isoStr) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    const diff = Math.floor((Date.now() - d) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div>
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 ${toastMsg.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <Icon name={toastMsg.type === 'success' ? 'check_circle' : 'error'} />
          {toastMsg.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Welcome back, {userName}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`${BASE}/reports`)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <Icon name="bar_chart" className="text-lg" />View Reports
          </button>
          <button onClick={() => { setLoading(true); window.location.reload() }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
            <Icon name="refresh" className="text-lg" />Refresh
          </button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:-translate-y-1 transition-transform group"
            onClick={() => navigate(s.path)}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon name={s.icon} className={`text-2xl ${s.color}`} /></div>
              <Icon name="arrow_outward" className="text-slate-300 group-hover:text-blue-600 text-lg transition-colors" />
            </div>
            <div className={`text-3xl font-black text-slate-900 ${loading ? 'animate-pulse' : ''}`}>{s.value}</div>
            <div className="text-sm font-semibold text-slate-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-green-500 font-semibold mt-1.5 flex items-center gap-1">
              <Icon name="trending_up" className="text-base" />{s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900">User Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily logins over the last 30 days</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="text-xs text-slate-400 font-medium">Logins</span>
              </div>
              <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Peak Day',  value:'93',  icon:'trending_up', color:'text-green-500'  },
              { label:'Daily Avg', value:'74',  icon:'show_chart',  color:'text-blue-600'   },
              { label:'This Week', value:'+8%', icon:'insights',    color:'text-purple-500' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <Icon name={s.icon} className={`text-2xl ${s.color}`} />
                <div>
                  <p className="text-lg font-black text-slate-900 leading-none">{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <ActivityChart />
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Icon name="smart_toy" className="text-blue-600 text-xl" />AI Services
            </h3>
            <button onClick={() => navigate(`${BASE}/ai`)} className="text-xs text-blue-600 font-semibold hover:underline">
              Configure →
            </button>
          </div>
          <div className="space-y-3">
            {AI_SERVICES_SUMMARY.map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.calls.toLocaleString()} calls · {s.uptime}</p>
                  </div>
                </div>
                <Badge color={s.status === 'active' ? 'green' : 'amber'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live
            </span>
          </div>
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
            ) : activities.map((ev, i) => {
              const { icon, bg, color } = actionIcon(ev.action)
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${bg}`}>
                    <Icon name={icon} className={`text-base ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium">{ev.description || ev.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTime(ev.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 group">
                <div className={`p-1.5 rounded-lg ${a.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon name={a.icon} className="text-base" />
                </div>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">System Health</h3>
          {[
            ['CPU Usage', '42%', 'bg-green-500', 'text-green-500'],
            ['Memory',    '68%', 'bg-amber-500', 'text-amber-500'],
            ['Storage',   '74%', 'bg-amber-500', 'text-amber-500'],
            ['API Health','99%', 'bg-green-500', 'text-green-500'],
          ].map(([label, val, barColor, textColor]) => (
            <div key={label} className="mb-4 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-semibold">{label}</span>
                <span className={`font-bold ${textColor}`}>{val}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full">
                <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: val }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}