import { useState } from 'react'
import { useApp } from '../../../context/AdminContext.jsx'
import { REPORT_TYPES, SCHEDULED_REPORTS, RECENT_REPORTS, AI_INSIGHTS } from '../../../data/curriculumData.js'
import Icon from '../../../components/ui/Icon.jsx'

const FORMAT_COLOR = { PDF:'text-red-600 bg-red-50', EXCEL:'text-green-600 bg-green-50', PPT:'text-orange-600 bg-orange-50' }

export default function Reports() {
  const { showToast } = useApp()
  const [reportType, setReportType] = useState('progress')
  const [format, setFormat]         = useState('pdf')
  const [schedules, setSchedules]   = useState(SCHEDULED_REPORTS)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Reports &amp; Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate AI-powered insights and track organisational performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Generator */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="add_chart" className="text-primary text-xl" />Generate New Report
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* 1. Type */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">1. Select Report Type</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REPORT_TYPES.map(rt=>(
                    <label key={rt.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${reportType===rt.id?'border-primary bg-primary/5':'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                      <input type="radio" name="report_type" className="mt-1 text-primary" checked={reportType===rt.id} onChange={()=>setReportType(rt.id)} />
                      <div><p className="text-sm font-bold text-slate-900 dark:text-white">{rt.label}</p><p className="text-xs text-slate-400 mt-0.5">{rt.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Date range */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">2. Date Range</p>
                  <div className="flex gap-2 mb-3">
                    <input type="date" defaultValue="2024-04-01" className="input-field flex-1" />
                    <span className="self-center text-slate-400 text-xs">to</span>
                    <input type="date" defaultValue="2024-04-30" className="input-field flex-1" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['Last 7d','Last 30d','Q2 2024','Custom'].map(r=>(
                      <button key={r} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors font-medium text-slate-600 dark:text-slate-400">{r}</button>
                    ))}
                  </div>
                </div>

                {/* 3. Format & generate */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">3. Format &amp; Delivery</p>
                  <div className="flex gap-2 mb-4">
                    {[['pdf','picture_as_pdf','PDF'],['excel','table_view','Excel'],['ppt','slideshow','PPT']].map(([id,icon,label])=>(
                      <button key={id} onClick={()=>setFormat(id)}
                        className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${format===id?'border-primary bg-primary/5 text-primary':'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'}`}>
                        <Icon name={icon} className="text-2xl mb-1" /><span className="text-xs font-bold uppercase">{label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>showToast('Report generation started! Download will begin shortly.','success')}
                    className="w-full btn-primary justify-center py-3 shadow-lg shadow-primary/20">
                    <Icon name="summarize" className="text-xl" />Compile &amp; Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent reports table */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Reports</h3>
              <button className="text-primary text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>{['Report Name','Generated','Format','Size','Action'].map(h=><th key={h} className={`px-6 py-4 ${h==='Action'?'text-right':''}`}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {RECENT_REPORTS.map((r,i)=>(
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{r.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{r.date}</td>
                      <td className="px-6 py-4"><span className={`badge font-bold text-xs ${FORMAT_COLOR[r.format]||'bg-slate-100 text-slate-600'}`}>{r.format}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-400">{r.size}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={()=>showToast(`Downloading ${r.name}…`,'info')} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
                          <Icon name="download" className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-primary/10 bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 text-primary font-bold"><Icon name="auto_awesome" className="text-xl" />AI Key Insights</div>
            </div>
            <div className="p-5 space-y-4">
              {AI_INSIGHTS.map(ins=>(
                <div key={ins.title} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${ins.colorClass}`}><Icon name={ins.icon} className="text-lg" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ins.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ins.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 pt-0">
              <button onClick={()=>showToast('Full analysis report loaded','info')} className="w-full text-sm font-bold text-primary py-2 px-4 rounded-lg border border-primary/30 hover:bg-primary hover:text-white transition-all">Full Monthly Analysis</button>
            </div>
          </div>

          {/* Scheduled reports */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Scheduled Reports</h3>
              <button onClick={()=>showToast('Schedule wizard opened','info')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Icon name="add" className="text-xl text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map(s=>(
                <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">{s.schedule}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>showToast('Edit schedule','info')} className="p-1.5 hover:text-primary transition-colors text-slate-400"><Icon name="edit" className="text-lg" /></button>
                    <button onClick={()=>setSchedules(prev=>prev.filter(x=>x.id!==s.id))} className="p-1.5 hover:text-red-500 transition-colors text-slate-400"><Icon name="delete" className="text-lg" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data accuracy badge */}
          <div className="bg-primary p-6 rounded-xl text-white shadow-lg shadow-primary/20">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold uppercase tracking-widest opacity-80">Data Accuracy</span><Icon name="verified" className="text-xl" /></div>
            <div className="text-4xl font-black mb-1">99.8%</div>
            <p className="text-xs text-blue-100 leading-relaxed">System data synchronised across all regional departments. Last sync: 4 minutes ago.</p>
          </div>
        </div>
      </div>
    </div>
  )
}