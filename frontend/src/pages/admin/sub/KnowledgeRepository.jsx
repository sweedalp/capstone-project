import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AdminContext.jsx'
import { MOCK_CONTENT, AVATAR } from '../../../data/adminMockData.js'
import { STORAGE_BREAKDOWN } from '../../../data/curriculumData.js'
import Icon  from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Modal from '../../../components/ui/Modal.jsx'

const TYPE_STYLE = { PDF:'text-red-600 bg-red-50', VIDEO:'text-purple-600 bg-purple-50', PPTX:'text-orange-600 bg-orange-50', ZIP:'text-slate-600 bg-slate-100', DOCX:'text-blue-600 bg-blue-50' }
const AI_COLOR   = { complete:'green', processing:'blue', error:'red' }

const TABS = [
  {id:'all',       label:'All Content'},
  {id:'pdf',       label:'PDFs'},
  {id:'video',     label:'Videos'},
  {id:'processed', label:'Processed'},
  {id:'error',     label:'Errors'},
]

export default function KnowledgeRepository() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [content, setContent] = useState(MOCK_CONTENT)
  const [tab, setTab]         = useState('all')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView]       = useState('grid')

  const filtered = content.filter(c => {
    const matchTab = tab==='all' || c.type.toLowerCase()===tab || (tab==='processed'&&c.status==='processed') || (tab==='error'&&c.status==='error')
    return matchTab && c.title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Knowledge Base</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{content.length} content items · 18.5 GB used</p>
        </div>
        <button onClick={()=>showToast('Upload dialog would open','info')} className="btn-primary"><Icon name="upload_file" className="text-lg" />Upload Content</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content list */}
        <div className="lg:col-span-8 space-y-5">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex gap-1 flex-wrap">
                {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`tab-btn text-xs ${tab===t.id?'active':''}`}>{t.label}</button>)}
              </div>
              <div className="flex gap-2 sm:ml-auto">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content…" className="input-field pl-9 text-xs w-48" />
                </div>
                <button onClick={()=>setView(v=>v==='grid'?'list':'grid')} className="btn-secondary p-2.5">
                  <Icon name={view==='grid'?'view_list':'grid_view'} className="text-lg" />
                </button>
              </div>
            </div>

            {view==='grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filtered.map(item=>(
                  <div key={item.id} onClick={()=>setSelected(item)}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge text-xs font-bold ${TYPE_STYLE[item.type]||'bg-slate-100 text-slate-600'}`}>{item.type}</span>
                      <Badge color={AI_COLOR[item.aiStatus]}>{item.aiStatus}</Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{item.size} · {item.date}</p>
                    <div className="flex items-center justify-between">
                      <button onClick={e=>{e.stopPropagation();navigate('/users')}} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary">
                        <img src={AVATAR} className="w-5 h-5 rounded-full" alt="" />{item.uploader}
                      </button>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Icon name="visibility" className="text-base" />{item.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(item=>(
                  <div key={item.id} onClick={()=>setSelected(item)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <span className={`badge text-xs ${TYPE_STYLE[item.type]||''}`}>{item.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.uploader} · {item.date} · {item.size}</p>
                    </div>
                    <Badge color={AI_COLOR[item.aiStatus]}>{item.aiStatus}</Badge>
                    <div className="flex gap-1">
                      <button onClick={e=>{e.stopPropagation();navigate('/ai')}} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Icon name="smart_toy" className="text-base text-slate-400 hover:text-primary" /></button>
                      <button onClick={e=>{e.stopPropagation();setContent(c=>c.filter(x=>x.id!==item.id));showToast('Deleted','info')}} className="p-1.5 hover:bg-red-50 rounded-lg"><Icon name="delete" className="text-base text-slate-400 hover:text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filtered.length===0&&<div className="text-center py-12 text-slate-400"><Icon name="folder_off" className="text-4xl block mx-auto mb-2" /><p>No content found</p></div>}
          </div>
        </div>

        {/* Storage sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-5">Storage Usage</h3>
            <div className="flex justify-center mb-5">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#137fec" strokeWidth="3"
                    strokeDasharray="74 26" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">74%</span>
                  <span className="text-[10px] text-slate-400">Used</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {STORAGE_BREAKDOWN.map(s=>(
                <div key={s.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${s.colorClass}`} /><span className="font-semibold text-slate-700 dark:text-slate-300">{s.type}</span></div>
                    <span className="text-slate-400">{s.size}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className={`h-1.5 rounded-full ${s.colorClass}`} style={{width:`${s.pct}%`}} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>showToast('Cleanup wizard would open','info')} className="btn-secondary w-full justify-center mt-5 text-xs">
              <Icon name="cleaning_services" className="text-base" />Run Cleanup Wizard
            </button>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-primary/20">
            <Icon name="auto_awesome" className="text-3xl mb-3" />
            <p className="font-bold mb-1">AI Processing Queue</p>
            <p className="text-4xl font-black mb-1">3</p>
            <p className="text-blue-100 text-xs">jobs currently active</p>
            <button onClick={()=>navigate('/ai')} className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors w-full">
              View AI Configuration →
            </button>
          </div>
        </div>
      </div>

      {/* Content detail modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Content Details" size="lg">
        {selected&&(
          <div className="space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className={`badge text-sm font-bold px-3 py-1.5 ${TYPE_STYLE[selected.type]||''}`}>{selected.type}</span>
                <Badge color={AI_COLOR[selected.aiStatus]}>{selected.aiStatus}</Badge>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{selected.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{selected.size} · Uploaded {selected.date}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Uploader',selected.uploader],['Views',selected.views],['AI Status',selected.aiStatus],['Tags',selected.tags.join(', ')]].map(([k,v])=>(
                <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">{k}</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=>navigate('/ai')} className="btn-primary"><Icon name="smart_toy" className="text-lg" />View AI Details</button>
              <button onClick={()=>{navigate('/users');setSelected(null)}} className="btn-secondary"><Icon name="person" className="text-lg" />View Uploader</button>
              <button onClick={()=>{showToast('Reprocessing started!','info');setSelected(null)}} className="btn-secondary ml-auto"><Icon name="refresh" className="text-lg" />Reprocess</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}