import { useState, useEffect } from 'react'
import { adminReportsApi, adminExportApi } from '../../../services/adminApi'

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
)

const REPORT_TYPES = [
  { id: 'student_progress',   label: 'Student Progress',     desc: 'Individual performance tracking across all courses', icon: 'school' },
  { id: 'completion_rates',   label: 'Completion Rates',     desc: 'Aggregated data on course completion and drop-offs', icon: 'bar_chart' },
  { id: 'engagement_metrics', label: 'Engagement Metrics',   desc: 'User activity levels, time-spent, and platform participation', icon: 'insights' },
  { id: 'user_summary',       label: 'User Summary',         desc: 'Breakdown of users by role, active status and counts', icon: 'group' },
]

const FORMATS = ['CSV', 'EXCEL', 'PPT']

const QUICK_RANGES = [
  { label: 'Last 7d',  days: 7  },
  { label: 'Last 30d', days: 30 },
  { label: 'Q2 2024',  from: '2024-04-01', to: '2024-06-30' },
  { label: 'Custom',   custom: true },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgoStr(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function Reports() {
  const [reports, setReports]         = useState([])
  const [scheduled, setScheduled]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [generating, setGenerating]   = useState(false)
  const [toast, setToast]             = useState(null)
  const [showSchedule, setShowSched]  = useState(false)

  const [selectedType, setType] = useState('completion_rates')
  const [selectedFmt,  setFmt]  = useState('CSV')
  const [dateFrom, setFrom]     = useState(daysAgoStr(30))
  const [dateTo,   setTo]       = useState(todayStr())
  const [activeRange, setRange] = useState('Last 30d')

  // Schedule form
  const [schedForm, setSchedForm] = useState({ name: '', report_type: 'completion_rates', frequency: 'weekly', next_run: 'Monday 08:00 AM' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [r, s] = await Promise.all([adminReportsApi.getAll(), adminReportsApi.getScheduled()])
      setReports(r.reports || [])
      setScheduled(s || [])
    } catch {
      showToast('Failed to load reports', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const applyRange = (r) => {
    setRange(r.label)
    if (r.days) { setFrom(daysAgoStr(r.days)); setTo(todayStr()) }
    else if (r.from) { setFrom(r.from); setTo(r.to) }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await adminReportsApi.generate(selectedType, selectedFmt, dateFrom, dateTo)
      showToast('Report generated and downloaded!')
      load()   // refresh list
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Generation failed', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!schedForm.name.trim()) return showToast('Name is required', 'error')
    try {
      const s = await adminReportsApi.createScheduled(schedForm)
      setScheduled(prev => [s, ...prev])
      setShowSched(false)
      showToast('Schedule created!')
    } catch {
      showToast('Failed to create schedule', 'error')
    }
  }

  const handleDeleteSchedule = async (id) => {
    try {
      await adminReportsApi.deleteScheduled(id)
      setScheduled(prev => prev.filter(s => s.id !== id))
      showToast('Schedule deleted')
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  const INSIGHTS = [
    { icon: 'trending_up', color: 'text-green-500', title: 'Engagement Increase', desc: 'Total active users up 12% compared to last month. Peak times shifted to weekday evenings.' },
    { icon: 'smart_toy',   color: 'text-blue-500',  title: 'AI Tutor Impact',     desc: 'Students using AI assistance 3× per week show 15% higher retention in STEM modules.' },
    { icon: 'warning',     color: 'text-amber-500', title: 'Action Recommended',  desc: 'Mathematics Module 4 completion rates are logging. Recommended review of quiz difficulty.' },
  ]

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <Icon name={toast.type === 'success' ? 'check_circle' : 'error'} />{toast.msg}
        </div>
      )}

      {/* Schedule modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg mb-5">New Scheduled Report</h3>
            <div className="space-y-3">
              <input value={schedForm.name} onChange={e => setSchedForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Report name *"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              <select value={schedForm.report_type} onChange={e => setSchedForm(f => ({ ...f, report_type: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                {REPORT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <select value={schedForm.frequency} onChange={e => setSchedForm(f => ({ ...f, frequency: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <input value={schedForm.next_run} onChange={e => setSchedForm(f => ({ ...f, next_run: e.target.value }))}
                placeholder="Next run (e.g. Monday 08:00 AM)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowSched(false)} className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateSchedule} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Generate and schedule reports from live data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: generator */}
        <div className="lg:col-span-8 space-y-5">

          {/* Report type selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Icon name="bar_chart" className="text-blue-600" />1. Select Report Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map(r => (
                <button key={r.id} onClick={() => setType(r.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedType === r.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedType === r.id ? 'border-blue-600' : 'border-slate-300'}`}>
                      {selectedType === r.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{r.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 ml-6">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date range + format */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3">2. Date Range</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input type="date" value={dateFrom} onChange={e => setFrom(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  <span className="text-slate-400 text-sm">to</span>
                  <input type="date" value={dateTo} onChange={e => setTo(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_RANGES.map(r => (
                    <button key={r.label} onClick={() => applyRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${activeRange === r.label ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3">3. Format & Delivery</h3>
                <div className="flex gap-3 mb-4">
                  {FORMATS.map(f => (
                    <button key={f} onClick={() => setFmt(f)}
                      className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1 ${selectedFmt === f ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <Icon name={f === 'CSV' ? 'table_view' : f === 'EXCEL' ? 'grid_on' : 'slideshow'} className="text-xl" />
                      {f}
                    </button>
                  ))}
                </div>
                <button onClick={handleGenerate} disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60">
                  <Icon name={generating ? 'hourglass_empty' : 'download'} className="text-lg" />
                  {generating ? 'Generating…' : 'Compile & Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick exports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Quick Data Exports</h2>
            <div className="grid grid-cols-3 gap-3">
              {['users', 'courses', 'activities'].map(type => (
                <button key={type} onClick={() => adminExportApi.download(type)}
                  className="flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 capitalize">
                  <Icon name="download" className="text-slate-400 text-lg" />Export {type}
                </button>
              ))}
            </div>
          </div>

          {/* Recent reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Recent Reports</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : reports.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No reports generated yet. Generate your first report above.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Report Name', 'Generated', 'Format', 'Size', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-900">{r.name}</td>
                      <td className="py-3 px-3 text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</td>
                      <td className="py-3 px-3"><span className="text-xs font-bold text-blue-600">{r.format}</span></td>
                      <td className="py-3 px-3 text-slate-500">{r.file_size}</td>
                      <td className="py-3 px-3">
                        {r.url && (
                          <a href={r.url} download className="text-blue-500 hover:text-blue-700">
                            <Icon name="download" className="text-lg" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: insights + schedules */}
        <div className="lg:col-span-4 space-y-5">

          {/* AI Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Icon name="auto_awesome" className="text-blue-600" />AI Key Insights
            </h3>
            <div className="space-y-4">
              {INSIGHTS.map((ins, i) => (
                <div key={i} className="flex gap-3">
                  <Icon name={ins.icon} className={`text-xl flex-shrink-0 mt-0.5 ${ins.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ins.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ins.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 border border-slate-200 rounded-xl py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all">
              Full Monthly Analysis
            </button>
          </div>

          {/* Scheduled reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Scheduled Reports</h3>
              <button onClick={() => setShowSched(true)} className="text-blue-600 hover:text-blue-700">
                <Icon name="add_circle" className="text-xl" />
              </button>
            </div>
            {scheduled.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No scheduled reports</p>
            ) : (
              <div className="space-y-3">
                {scheduled.map(s => (
                  <div key={s.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                        {s.frequency} · {s.next_run}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button className="text-slate-400 hover:text-blue-600"><Icon name="edit" className="text-lg" /></button>
                      <button onClick={() => handleDeleteSchedule(s.id)} className="text-slate-400 hover:text-red-600"><Icon name="delete" className="text-lg" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}