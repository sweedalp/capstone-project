import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../../services/api'

// ── UI primitives ─────────────────────────────────────────
const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
)
const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    green:'bg-green-100 text-green-700', amber:'bg-amber-100 text-amber-700',
    blue:'bg-blue-100 text-blue-700', purple:'bg-purple-100 text-purple-700',
    slate:'bg-slate-100 text-slate-600', red:'bg-red-100 text-red-700',
  }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color]||colors.slate}`}>{children}</span>
}
const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const widths = { md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl' }
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]||widths.md} p-8 max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const statusColor = (s) => s==='active'?'green':s==='pending'?'amber':'slate'
const roleColor   = (r) => r==='admin'||r==='Admin'?'blue':r==='trainer'||r==='Trainer'?'purple':'slate'

const TABS = [
  { id:'all',      label:'All Users'  },
  { id:'active',   label:'Active'     },
  { id:'pending',  label:'Pending'    },
  { id:'inactive', label:'Inactive'   },
]

export default function Users() {
  const navigate = useNavigate()

  // ── State ─────────────────────────────────────────────────
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('all')
  const [selectedUser, setSelected] = useState(null)
  const [addOpen, setAddOpen]       = useState(false)
  const [checked, setChecked]       = useState([])
  const [newUser, setNew]           = useState({ name:'', email:'', role:'learner', dept:'' })
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const PAGE_SIZE = 20

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch users ───────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE })
      if (tab !== 'all') params.set('role', tab)
      if (search) params.set('search', search)
      const res = await apiClient.get(`/api/v1/admin/users?${params}`)
      setUsers(res.data.users || [])
      setTotal(res.data.total || 0)
    } catch {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [tab, page])
  // search with debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers() }, 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Tabs with counts ──────────────────────────────────────
  const tabs = TABS.map(t => ({
    ...t,
    count: t.id === 'all' ? total : users.filter(u => u.is_active === (t.id === 'active')).length
  }))

  // ── Client-side filter (on current page) ──────────────────
  const filtered = users.filter(u => {
    const name  = u.full_name || ''
    const email = u.email || ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
    if (tab === 'active')   return u.is_active && matchSearch
    if (tab === 'inactive') return !u.is_active && matchSearch
    return matchSearch
  })

  // ── Checkbox helpers ──────────────────────────────────────
  const toggle = (id) => setChecked(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id])

  // ── Actions ───────────────────────────────────────────────
  const toggleActive = async (user) => {
    try {
      await apiClient.post(`/api/v1/admin/users/${user.id}/toggle-active`)
      showToast(user.is_active ? 'User deactivated' : 'User activated', 'success')
      fetchUsers()
      setSelected(null)
    } catch {
      showToast('Action failed', 'error')
    }
  }

  const changeRole = async (userId, role) => {
    try {
      await apiClient.post(`/api/v1/admin/users/${userId}/change-role`, { role })
      showToast(`Role changed to ${role}`, 'success')
      fetchUsers()
    } catch {
      showToast('Failed to change role', 'error')
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await apiClient.delete(`/api/v1/admin/users/${userId}`)
      showToast('User removed', 'info')
      setSelected(null)
      fetchUsers()
    } catch {
      showToast('Failed to delete user', 'error')
    }
  }

  const deleteBulk = async () => {
    if (!window.confirm(`Delete ${checked.length} users?`)) return
    try {
      await Promise.all(checked.map(id => apiClient.delete(`/api/v1/admin/users/${id}`)))
      setChecked([])
      showToast('Selected users deleted', 'info')
      fetchUsers()
    } catch {
      showToast('Some deletes failed', 'error')
    }
  }

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email) return showToast('Name and email required', 'error')
    setSaving(true)
    try {
      // Register via auth endpoint
      await apiClient.post('/api/v1/auth/register', {
        full_name: newUser.name,
        email: newUser.email,
        password: 'Temp1234!', // default temp password
        role: newUser.role,
      })
      setAddOpen(false)
      setNew({ name:'', email:'', role:'learner', dept:'' })
      showToast('User added! They can reset their password on first login.', 'success')
      fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to add user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    window.open('/api/v1/admin/export/users', '_blank')
    showToast('Downloading CSV...', 'success')
  }

  const resetPassword = async (userId) => {
    const newPass = prompt('Enter new password for this user:')
    if (!newPass) return
    try {
      await apiClient.post(`/api/v1/admin/users/${userId}/reset-password`, { new_password: newPass })
      showToast('Password reset successfully', 'success')
    } catch {
      showToast('Failed to reset password', 'error')
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3
          ${toast.type==='success'?'bg-green-600 text-white':toast.type==='error'?'bg-red-600 text-white':'bg-slate-800 text-white'}`}>
          <Icon name={toast.type==='success'?'check_circle':toast.type==='error'?'error':'info'} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">{total} total users registered</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Icon name="upload" className="text-lg" />Export CSV
          </button>
          <button onClick={()=>setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
            <Icon name="person_add" className="text-lg" />Add User
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {checked.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-blue-600">{checked.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={handleExportCSV} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">Export</button>
            <button onClick={deleteBulk} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={()=>{setTab(t.id);setPage(1)}}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                  ${tab===t.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative sm:ml-auto">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="pl-6 pr-3 py-4">
                  <input type="checkbox" className="rounded border-slate-300"
                    onChange={e => setChecked(e.target.checked ? filtered.map(u=>u.id) : [])} />
                </th>
                {['User','Role','Status','Active','Last Login','Actions'].map(h=>(
                  <th key={h} className="px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="pl-6 pr-3 py-4">
                    <input type="checkbox" className="rounded border-slate-300"
                      checked={checked.includes(user.id)} onChange={()=>toggle(user.id)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="person" className="text-blue-600" />
                      </div>
                      <div>
                        <button onClick={()=>setSelected(user)} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {user.full_name}
                        </button>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge color={roleColor(user.role)}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge color={user.is_active ? 'green' : 'slate'}>{user.is_active ? 'active' : 'inactive'}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge color={user.is_active ? 'green' : 'slate'}>{user.is_active ? 'Yes' : 'No'}</Badge>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setSelected(user)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="View">
                        <Icon name="visibility" className="text-base text-slate-400 hover:text-blue-600" />
                      </button>
                      <button onClick={()=>toggleActive(user)} className="p-1.5 hover:bg-slate-100 rounded-lg" title={user.is_active?'Deactivate':'Activate'}>
                        <Icon name={user.is_active?'toggle_on':'toggle_off'} className={`text-base ${user.is_active?'text-green-500':'text-slate-400'}`} />
                      </button>
                      <button onClick={()=>navigate('/admin/knowledge')} className="p-1.5 hover:bg-slate-100 rounded-lg" title="View Content">
                        <Icon name="folder" className="text-base text-slate-400 hover:text-purple-500" />
                      </button>
                      <button onClick={()=>deleteUser(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                        <Icon name="delete" className="text-base text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Icon name="search_off" className="text-4xl block mx-auto mb-2" />
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <button disabled={page*PAGE_SIZE>=total} onClick={()=>setPage(p=>p+1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* User detail modal */}
      <Modal open={!!selectedUser} onClose={()=>setSelected(null)} title="User Profile" size="lg">
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center border-4 border-blue-200 flex-shrink-0">
                <Icon name="person" className="text-3xl text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">{selectedUser.full_name}</h4>
                <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge color={roleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                  <Badge color={selectedUser.is_active?'green':'slate'}>{selectedUser.is_active?'active':'inactive'}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['User ID',    selectedUser.id],
                ['Role',       selectedUser.role],
                ['Status',     selectedUser.is_active ? 'Active' : 'Inactive'],
                ['Joined',     selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'],
              ].map(([k,v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{k}</p>
                  <p className="font-bold text-slate-900 mt-1">{v}</p>
                </div>
              ))}
            </div>

            {/* Role change */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Change Role</label>
              <div className="flex gap-2">
                {['learner','trainer','admin'].map(r => (
                  <button key={r} onClick={()=>changeRole(selectedUser.id, r)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border transition-all
                      ${selectedUser.role===r ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-400'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 flex-wrap">
              <button onClick={()=>toggleActive(selectedUser)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                  ${selectedUser.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                <Icon name={selectedUser.is_active?'toggle_off':'toggle_on'} className="text-lg" />
                {selectedUser.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={()=>resetPassword(selectedUser.id)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Icon name="lock_reset" className="text-lg" />Reset Password
              </button>
              <button onClick={()=>{setSelected(null);navigate('/admin/knowledge')}}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Icon name="folder_open" className="text-lg" />View Content
              </button>
              <button onClick={()=>deleteUser(selectedUser.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 ml-auto">
                <Icon name="delete" className="text-lg" />Remove
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add user modal */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add New User">
        <div className="space-y-4">
          {[
            ['Full Name',      'name',  'text',  'Enter full name'],
            ['Email Address',  'email', 'email', 'user@company.com'],
          ].map(([label, field, type, ph]) => (
            <div key={field}>
              <label className="text-sm font-semibold text-slate-700 block mb-2">{label}</label>
              <input type={type} placeholder={ph}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                value={newUser[field]} onChange={e=>setNew(u=>({...u,[field]:e.target.value}))} />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Role</label>
            <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              value={newUser.role} onChange={e=>setNew(u=>({...u,role:e.target.value}))}>
              <option value="learner">Learner</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
            Default password: <strong>Temp1234!</strong> — user should reset on first login.
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={()=>setAddOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="person_add" className="text-lg" />}
              Add User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}