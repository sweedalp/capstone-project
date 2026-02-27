import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminKnowledgeApi } from '../../../services/adminApi'

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
)

const TYPE_COLORS = {
  PDF:   { label: 'PDF',   dot: 'text-red-500',    bg: 'bg-red-50'    },
  VIDEO: { label: 'VIDEO', dot: 'text-purple-500',  bg: 'bg-purple-50' },
  PPTX:  { label: 'PPTX',  dot: 'text-orange-500',  bg: 'bg-orange-50' },
  DOCX:  { label: 'DOCX',  dot: 'text-blue-500',    bg: 'bg-blue-50'   },
  ZIP:   { label: 'ZIP',   dot: 'text-slate-500',   bg: 'bg-slate-50'  },
  TXT:   { label: 'TXT',   dot: 'text-green-500',   bg: 'bg-green-50'  },
}

const STATUS_COLORS = {
  complete:   'text-green-600',
  processing: 'text-blue-500',
  error:      'text-red-500',
}

const TABS = ['All Content', 'PDFs', 'Videos', 'Processed', 'Errors']

// SVG donut chart for storage
function StorageDonut({ pct = 74 }) {
  const r = 54, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="14"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-2xl font-black" fontSize="22" fontWeight="900" fill="#0f172a">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">Used</text>
    </svg>
  )
}

export default function KnowledgeRepository() {
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [files, setFiles]         = useState([])
  const [storage, setStorage]     = useState({ total_gb: 0, by_type: {} })
  const [totalFiles, setTotal]    = useState(0)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('All Content')
  const [search, setSearch]       = useState('')
  const [viewMode, setViewMode]   = useState('grid')   // grid | table
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [toast, setToast]         = useState(null)
  const [deleteId, setDeleteId]   = useState(null)

  const STORAGE_LIMIT_GB = 25

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Map tab label → API file_type param
  const tabToType = (tab) => {
    const m = { 'PDFs': 'PDF', 'Videos': 'VIDEO', 'Processed': 'complete', 'Errors': 'error' }
    return m[tab] || null
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminKnowledgeApi.getAll({
        fileType: tabToType(activeTab),
        search: search || undefined,
      })
      setFiles(res.files || [])
      setTotal(res.total || 0)
      setStorage(res.storage || { total_gb: 0, by_type: {} })
    } catch {
      showToast('Failed to load files', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [activeTab, search])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadPct(0)
    try {
      const newFile = await adminKnowledgeApi.upload(file, setUploadPct)
      setFiles(prev => [newFile, ...prev])
      setTotal(prev => prev + 1)
      showToast(`"${file.name}" uploaded successfully`)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Upload failed', 'error')
    } finally {
      setUploading(false)
      setUploadPct(0)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminKnowledgeApi.delete(id)
      setFiles(prev => prev.filter(f => f.id !== id))
      setTotal(prev => prev - 1)
      showToast('File deleted')
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  const storagePct = Math.min(Math.round((storage.total_gb / STORAGE_LIMIT_GB) * 100), 100)
  const storageByType = [
    { label: 'Videos',        gb: storage.by_type?.VIDEO || 0,  color: 'bg-purple-500' },
    { label: 'PDFs',          gb: storage.by_type?.PDF   || 0,  color: 'bg-red-500'    },
    { label: 'Presentations', gb: storage.by_type?.PPTX  || 0,  color: 'bg-orange-400' },
    { label: 'Other',         gb: (storage.total_gb - (storage.by_type?.VIDEO||0) - (storage.by_type?.PDF||0) - (storage.by_type?.PPTX||0)), color: 'bg-slate-400' },
  ].filter(x => x.gb > 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <Icon name={toast.type === 'success' ? 'check_circle' : 'error'} />
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete File?</h3>
            <p className="text-slate-500 text-sm mb-5">This file will be permanently removed from storage.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Knowledge Base</h1>
            <p className="text-slate-500 mt-1">{totalFiles} content items · {storage.total_gb.toFixed(1)} GB used</p>
          </div>
          <button onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60">
            <Icon name="upload_file" className="text-lg" />
            {uploading ? `Uploading ${uploadPct}%…` : 'Upload Content'}
          </button>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.mp4,.webm,.avi,.pptx,.ppt,.docx,.doc,.zip,.txt"
            onChange={handleUpload} />
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className="mb-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span>Uploading…</span><span>{uploadPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left: files */}
          <div className="flex-1 min-w-0">
            {/* Tabs + search + view toggle */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                {TABS.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search content…"
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-52" />
                </div>
                <button onClick={() => setViewMode(v => v === 'grid' ? 'table' : 'grid')}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50">
                  <Icon name={viewMode === 'grid' ? 'table_rows' : 'grid_view'} className="text-slate-600 text-lg" />
                </button>
              </div>
            </div>

            {/* Files grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                    <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <Icon name="folder_open" className="text-5xl text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No files found</p>
                <p className="text-slate-400 text-sm mt-1">Upload content to get started</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map(f => {
                  const tc = TYPE_COLORS[f.file_type] || TYPE_COLORS.TXT
                  return (
                    <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${tc.dot}`}>{f.file_type}</span>
                          <span className={`text-xs font-semibold ${STATUS_COLORS[f.status] || 'text-slate-400'}`}>{f.status}</span>
                        </div>
                        <button onClick={() => setDeleteId(f.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">{f.original_name}</h4>
                      <p className="text-xs text-slate-400 mb-3">{f.file_size_mb} MB · {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                            {(f.uploader_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          {f.uploader_name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Icon name="visibility" className="text-sm" />{f.view_count}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Table view */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Type', 'Name', 'Size', 'Uploader', 'Views', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map(f => {
                      const tc = TYPE_COLORS[f.file_type] || TYPE_COLORS.TXT
                      return (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><span className={`text-xs font-bold ${tc.dot}`}>{f.file_type}</span></td>
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{f.original_name}</td>
                          <td className="px-4 py-3 text-slate-500">{f.file_size_mb} MB</td>
                          <td className="px-4 py-3 text-slate-500">{f.uploader_name}</td>
                          <td className="px-4 py-3 text-slate-500">{f.view_count}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-semibold ${STATUS_COLORS[f.status]}`}>{f.status}</span></td>
                          <td className="px-4 py-3">
                            <button onClick={() => setDeleteId(f.id)} className="text-red-400 hover:text-red-600">
                              <Icon name="delete" className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: storage panel */}
          <div className="w-64 flex-shrink-0 space-y-4">
            {/* Storage donut */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Storage Usage</h3>
              <div className="flex justify-center mb-4">
                <StorageDonut pct={storagePct} />
              </div>
              <div className="space-y-2">
                {storageByType.map(s => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-slate-600 font-medium">{s.label}</span>
                    </div>
                    <span className="text-slate-500">{s.gb.toFixed(1)} GB</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">{storage.total_gb.toFixed(1)} GB of {STORAGE_LIMIT_GB} GB used</p>
            </div>

            {/* AI Queue placeholder */}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="auto_awesome" className="text-xl" />
                <span className="font-bold text-sm">AI Processing Queue</span>
              </div>
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-blue-200 text-xs mb-3">jobs currently active</p>
              <button onClick={() => navigate('/dashboard/admin/ai')}
                className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-xl transition-all">
                View AI Configuration →
              </button>
            </div>

            {/* Cleanup */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Icon name="cleaning_services" className="text-lg" />Run Cleanup Wizard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}