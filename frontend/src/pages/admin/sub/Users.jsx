import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AdminContext.jsx'
import apiClient from '../../../services/api'
import Icon from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Modal from '../../../components/ui/Modal.jsx'

const statusColor = (s) => s === 'active' ? 'green' : s === 'pending' ? 'amber' : 'slate'

const TABS = [
  { id: 'all', label: 'All Users' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'inactive', label: 'Inactive' },
]

export default function Users() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [selectedUser, setSelected] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setChecked] = useState([])
  const [newUser, setNew] = useState({ name: '', email: '', role: 'Learner' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await apiClient.get('/api/v1/admin/users')
        if (!active) return
        const list = Array.isArray(res.data) ? res.data : (res.data.users || [])
        const apiUsers = list.map(u => ({
          id: u.id,
          name: u.full_name || u.name || '',
          email: u.email,
          role: u.role,
          status: u.is_active ? 'active' : 'inactive',
          joined: u.joined || '',
          dept: '',
          avatar: '',
          lastLogin: '',
          courses: 0,
          uploads: 0,
        }))
        setUsers(apiUsers)
      } catch (e) {
        console.error(e)
        if (!active) return
        setError('Failed to load users from server.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const tabs = TABS.map(t => ({ ...t, count: t.id === 'all' ? users.length : users.filter(u => u.status === t.id).length }))

  const filtered = users.filter(u => {
    const matchTab = tab === 'all' || u.status === tab
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const toggle = (id) => setChecked(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const approve = async (id) => {
    try {
      const res = await apiClient.post(`/api/v1/admin/users/${id}/toggle-active`)
      const updated = res.data
      setUsers(u =>
        u.map(x =>
          x.id === id ? { ...x, status: updated.is_active ? 'active' : 'inactive' } : x
        )
      )
      showToast('User status updated', 'success')
    } catch (e) {
      console.error(e)
      showToast('Failed to update user', 'error')
    }
  }

  const remove = async (id) => {
    try {
      await apiClient.delete(`/api/v1/admin/users/${id}`)
      setUsers(u => u.filter(x => x.id !== id))
      showToast('User removed', 'info')
      setSelected(null)
    } catch (e) {
      console.error(e)
      showToast('Failed to remove user', 'error')
    }
  }

  const handleAdd = () => {
    // For now, admin cannot create new users directly; they self-register.
    // Keep a light UX by just showing an info toast.
    showToast('User creation is handled via Sign Up flow.', 'info')
    setAddOpen(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">User Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => showToast('Import wizard would open', 'info')} className="btn-secondary"><Icon name="upload" className="text-lg" />Import CSV</button>
          <button onClick={() => setAddOpen(true)} className="btn-primary"><Icon name="person_add" className="text-lg" />Add User</button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-primary">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => { showToast('Exported', 'success'); setChecked([]) }} className="btn-secondary text-xs py-1.5">Export</button>
            <button onClick={() => { setUsers(u => u.filter(x => !selected.includes(x.id))); setChecked([]); showToast('Deleted', 'info') }} className="btn-danger text-xs py-1.5">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Error / loading */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-1 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
                {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="input-field pl-10 w-full sm:w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="pl-6 pr-3 py-4">
                  <input type="checkbox" className="rounded border-slate-300 text-primary"
                    onChange={e => setChecked(e.target.checked ? filtered.map(u => u.id) : [])} />
                </th>
                {['User', 'Role', 'Department', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} className="px-4 py-4">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="pl-6 pr-3 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-primary"
                      checked={selected.includes(user.id)} onChange={() => toggle(user.id)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-slate-200 text-xs font-bold text-primary">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <button onClick={() => setSelected(user)} className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">{user.name}</button>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><Badge color={user.role === 'Admin' ? 'blue' : user.role === 'Trainer' ? 'purple' : 'slate'}>{user.role}</Badge></td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{user.dept}</td>
                  <td className="px-4 py-4"><Badge color={statusColor(user.status)}>{user.status}</Badge></td>
                  <td className="px-4 py-4 text-xs text-slate-500">{user.lastLogin}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(user)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Icon name="visibility" className="text-base text-slate-400 hover:text-primary" /></button>
                      {user.status === 'pending' && <button onClick={() => approve(user.id)} className="p-1.5 hover:bg-green-50 rounded-lg"><Icon name="check_circle" className="text-base text-green-500" /></button>}
                      <button onClick={() => navigate('/knowledge')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Icon name="folder" className="text-base text-slate-400 hover:text-purple-500" /></button>
                      <button onClick={() => remove(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Icon name="delete" className="text-base text-slate-400 hover:text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400"><Icon name="search_off" className="text-4xl block mx-auto mb-2" /><p>No users found</p></div>}
        </div>
      </div>

      {/* User detail modal */}
      <Modal open={!!selectedUser} onClose={() => setSelected(null)} title="User Profile" size="lg">
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={selectedUser.avatar} className="w-16 h-16 rounded-2xl object-cover border-4 border-primary/20" alt="" />
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge color={selectedUser.role === 'Admin' ? 'blue' : selectedUser.role === 'Trainer' ? 'purple' : 'slate'}>{selectedUser.role}</Badge>
                  <Badge color={statusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Department', selectedUser.dept], ['Joined', selectedUser.joined], ['Courses', selectedUser.courses], ['Uploads', selectedUser.uploads], ['Last Login', selectedUser.lastLogin]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{k}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {selectedUser.status === 'pending' && <button onClick={() => { approve(selectedUser.id); setSelected(null) }} className="btn-primary"><Icon name="check_circle" className="text-lg" />Approve</button>}
              {selectedUser.uploads > 0 && <button onClick={() => { setSelected(null); navigate('/knowledge') }} className="btn-secondary"><Icon name="folder_open" className="text-lg" />View Content</button>}
              <button onClick={() => remove(selectedUser.id)} className="btn-danger ml-auto"><Icon name="delete" className="text-lg" />Remove</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add user modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User">
        <div className="space-y-4">
          {[['Full Name', 'name', 'text', 'Enter full name'], ['Email Address', 'email', 'email', 'user@company.com'], ['Department', 'dept', 'text', 'e.g. Engineering']].map(([label, field, type, ph]) => (
            <div key={field}>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">{label}</label>
              <input type={type} placeholder={ph} className="input-field" value={newUser[field]} onChange={e => setNew(u => ({ ...u, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Role</label>
            <select className="input-field" value={newUser.role} onChange={e => setNew(u => ({ ...u, role: e.target.value }))}>
              <option>Learner</option><option>Trainer</option><option>Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={() => setAddOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleAdd} className="btn-primary flex-1 justify-center"><Icon name="person_add" className="text-lg" />Add User</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}