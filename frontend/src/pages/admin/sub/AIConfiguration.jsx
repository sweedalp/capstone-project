import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AdminContext.jsx'
import { MOCK_AI_JOBS } from '../../../data/adminMockData.js'
import Icon   from '../../../components/ui/Icon.jsx'
import Badge  from '../../../components/ui/Badge.jsx'
import Toggle from '../../../components/ui/Toggle.jsx'
import Modal  from '../../../components/ui/Modal.jsx'

const TABS = [
  {id:'overview', label:'Services',          icon:'hub'},
  {id:'queue',    label:'Processing Queue',  icon:'queue'},
  {id:'config',   label:'Configuration',    icon:'tune'},
  {id:'logs',     label:'Error Logs',        icon:'bug_report'},
]

const statusColor = (s) => s==='complete'?'green':s==='running'?'blue':s==='error'?'red':'amber'

export default function AIConfiguration() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [tab, setTab]       = useState('overview')
  const [jobs, setJobs]     = useState(MOCK_AI_JOBS)
  const [jobModal, setJobModal] = useState(null)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [temp, setTemp]     = useState(0.7)
  const [toggles, setToggles] = useState({
    contentAnalysis: true, transcription: true, imageGen: false,
    autoProcess: true, qualityCheck: true, smartCache: true,
  })

  const toggle = (k) => setToggles(t=>({...t,[k]:!t[k]}))

  const services = [
    {name:'GPT-4o',      desc:'Content analysis & generation', key:'contentAnalysis', calls:1203},
    {name:'Whisper v3',  desc:'Audio & video transcription',   key:'transcription',   calls:456},
    {name:'DALL·E 3',    desc:'AI image generation',           key:'imageGen',        calls:89},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">AI Configuration</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage AI services, processing queues, and model settings.</p>
        </div>
        <button onClick={()=>showToast('All AI settings saved!','success')} className="btn-primary">
          <Icon name="save" className="text-lg" />Save All Settings
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm w-fit flex-wrap">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab===t.id?'bg-primary text-white shadow-sm':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Icon name={t.icon} className="text-lg" />{t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab==='overview'&&(
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {services.map(svc=>(
              <div key={svc.name} className="card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${toggles[svc.key]?'bg-primary/10':'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon name="smart_toy" className={`text-2xl ${toggles[svc.key]?'text-primary':'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{svc.name}</h3>
                      <p className="text-xs text-slate-400">{svc.desc}</p>
                    </div>
                  </div>
                  <Toggle checked={toggles[svc.key]} onChange={()=>toggle(svc.key)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[['API Calls (30d)',svc.calls.toLocaleString()],['Avg Response','1.2s'],['Error Rate','0.1%']].map(([k,v])=>(
                    <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{v}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">{k}</p>
                    </div>
                  ))}
                </div>
                {toggles[svc.key]&&(
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>showToast(`Testing ${svc.name}… Connection successful!`,'success')} className="btn-secondary text-xs py-1.5"><Icon name="speed" className="text-base" />Test Connection</button>
                    <button onClick={()=>showToast('API key copied','info')} className="btn-secondary text-xs py-1.5"><Icon name="key" className="text-base" />View API Key</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-5">
            <div className="card p-6">
              <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Automation</h3>
              <div className="space-y-4">
                {[['Auto-Process Uploads','autoProcess'],['Quality Check','qualityCheck'],['Smart Cache','smartCache']].map(([label,k])=>(
                  <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <Toggle checked={toggles[k]} onChange={()=>toggle(k)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Processing Queue</span>
                <Icon name="queue" className="text-xl" />
              </div>
              <div className="text-4xl font-black mb-1">3</div>
              <p className="text-xs text-blue-100 mb-4">Jobs in queue · 1 running</p>
              <button onClick={()=>setTab('queue')} className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors w-full">View Queue →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Queue ── */}
      {tab==='queue'&&(
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{jobs.length} total jobs</p>
            <button onClick={()=>showToast('New job created!','success')} className="btn-primary text-xs py-2"><Icon name="add" className="text-lg" />Create Manual Job</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>{['Job ID','Content','Type','Status','Progress','Duration','Actions'].map(h=><th key={h} className="px-5 py-4">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {jobs.map(job=>(
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4 text-xs font-mono font-bold text-slate-500">{job.id}</td>
                    <td className="px-5 py-4"><button onClick={()=>navigate('/knowledge')} className="text-sm font-medium hover:text-primary transition-colors text-left">{job.content}</button></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{job.type}</td>
                    <td className="px-5 py-4"><Badge color={statusColor(job.status)}>{job.status}</Badge></td>
                    <td className="px-5 py-4 w-32">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div className={`h-1.5 rounded-full ${job.status==='error'?'bg-red-500':job.status==='running'?'bg-blue-500 animate-pulse':'bg-green-500'}`} style={{width:`${job.progress}%`}} />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{job.progress}%</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{job.duration}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={()=>setJobModal(job)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Icon name="visibility" className="text-base text-slate-400 hover:text-primary" /></button>
                        {job.status==='error'&&<button onClick={()=>{setJobs(j=>j.map(x=>x.id===job.id?{...x,status:'running',progress:0}:x));showToast('Job restarted','info')}} className="p-1.5 hover:bg-amber-50 rounded-lg"><Icon name="refresh" className="text-base text-amber-500" /></button>}
                        <button onClick={()=>{setJobs(j=>j.filter(x=>x.id!==job.id));showToast('Job removed','info')}} className="p-1.5 hover:bg-red-50 rounded-lg"><Icon name="delete" className="text-base text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Config ── */}
      {tab==='config'&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Model Parameters</h3>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Max Tokens</span><span className="text-primary font-bold">{maxTokens.toLocaleString()}</span></div>
              <input type="range" min="512" max="8192" step="512" value={maxTokens} onChange={e=>setMaxTokens(+e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>512</span><span>8,192</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Temperature</span><span className="text-primary font-bold">{temp}</span></div>
              <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e=>setTemp(+e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0 (Precise)</span><span>1 (Creative)</span></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Default Model</label>
              <select className="input-field"><option>GPT-4o (Recommended)</option><option>GPT-4 Turbo</option><option>GPT-3.5 Turbo</option></select>
            </div>
          </div>
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white">API Configuration</h3>
            {[['OpenAI API Key','sk-•••••••••••••••••••••••••'],['Organization ID','org-•••••••••••••'],['Webhook URL','https://api.company.com/ai/webhook']].map(([label,val])=>(
              <div key={label}>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">{label}</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue={val} className="input-field font-mono text-xs flex-1" />
                  <button onClick={()=>showToast('Copied!','success')} className="btn-secondary p-2.5"><Icon name="content_copy" className="text-base" /></button>
                </div>
              </div>
            ))}
            <button onClick={()=>showToast('API key refreshed!','success')} className="btn-danger w-full justify-center"><Icon name="refresh" className="text-lg" />Regenerate API Key</button>
          </div>
        </div>
      )}

      {/* ── Error logs ── */}
      {tab==='logs'&&(
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Error Log</h3>
            <button onClick={()=>showToast('Logs cleared!','success')} className="btn-danger text-xs py-1.5"><Icon name="delete_sweep" className="text-base" />Clear Logs</button>
          </div>
          {[
            {time:'Apr 18 09:32:14',code:'ERR_TIMEOUT',msg:'OpenAI API request timeout after 30s',content:'Compliance & Ethics Training'},
            {time:'Apr 18 08:15:33',code:'ERR_QUOTA',  msg:'API rate limit exceeded – 429 Too Many Requests',content:'System (batch)'},
            {time:'Apr 17 22:45:01',code:'ERR_FORMAT', msg:'Unsupported file format during extraction',content:'Archive_2019.rar'},
          ].map((log,i)=>(
            <div key={i} className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-red-50/30 dark:hover:bg-red-900/10">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                <Badge color="red">{log.code}</Badge>
                <button onClick={()=>navigate('/knowledge')} className="text-xs text-primary hover:underline ml-auto">{log.content}</button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{log.msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Job detail modal */}
      <Modal open={!!jobModal} onClose={()=>setJobModal(null)} title="Job Details">
        {jobModal&&(
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Job ID',jobModal.id],['Content',jobModal.content],['Type',jobModal.type],['Status',jobModal.status],['Started',jobModal.started],['Duration',jobModal.duration]].map(([k,v])=>(
                <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">{k}</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Progress</p>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className={`h-3 rounded-full ${jobModal.status==='error'?'bg-red-500':jobModal.status==='running'?'bg-blue-500':'bg-green-500'}`} style={{width:`${jobModal.progress}%`}} />
              </div>
              <p className="text-right text-xs text-slate-400 mt-1">{jobModal.progress}%</p>
            </div>
            {jobModal.tokens&&<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Tokens Used</p><p className="font-black text-lg text-slate-900 dark:text-white">{jobModal.tokens.toLocaleString()}</p></div>}
            <div className="flex gap-2 pt-2">
              <button onClick={()=>navigate('/knowledge')} className="btn-secondary flex-1 justify-center"><Icon name="folder_open" className="text-lg" />View Source</button>
              {jobModal.status==='error'&&<button onClick={()=>{showToast('Retry initiated','info');setJobModal(null)}} className="btn-primary flex-1 justify-center"><Icon name="refresh" className="text-lg" />Retry</button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}