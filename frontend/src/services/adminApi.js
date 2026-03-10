/**
 * adminApi.js – All Admin API calls wired to real backend endpoints.
 */
import apiClient from './api'

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const adminDashboardApi = {
  getStats: () => apiClient.get('/api/v1/admin/stats').then(r => r.data),
  getActivities: (limit = 8) => apiClient.get(`/api/v1/admin/activities?limit=${limit}`).then(r => r.data),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const adminUsersApi = {
  getAll: ({ page = 1, pageSize = 20, role, search } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize })
    if (role && role !== 'all') params.set('role', role)
    if (search) params.set('search', search)
    return apiClient.get(`/api/v1/admin/users?${params}`).then(r => r.data)
  },
  toggleActive: (userId) => apiClient.post(`/api/v1/admin/users/${userId}/toggle-active`).then(r => r.data),
  changeRole: (userId, role) => apiClient.post(`/api/v1/admin/users/${userId}/change-role`, { role }).then(r => r.data),
  resetPassword: (userId, newPwd) => apiClient.post(`/api/v1/admin/users/${userId}/reset-password`, { new_password: newPwd }).then(r => r.data),
  delete: (userId) => apiClient.delete(`/api/v1/admin/users/${userId}`),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const adminCategoriesApi = {
  getAll: () => apiClient.get('/api/v1/admin/categories').then(r => r.data),
  create: (name, description = '') => apiClient.post('/api/v1/admin/categories', { name, description }).then(r => r.data),
  update: (id, name, description = '') => apiClient.put(`/api/v1/admin/categories/${id}`, { name, description }).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/admin/categories/${id}`),
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export const adminCoursesApi = {
  getAll: () => apiClient.get('/api/v1/admin/courses').then(r => r.data),
  getById: (id) => apiClient.get(`/api/v1/admin/courses/${id}`).then(r => r.data),
  create: (payload) => apiClient.post('/api/v1/admin/courses', payload).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/admin/courses/${id}`).then(r => r.data),
  publish: (id) => apiClient.post(`/api/v1/admin/courses/${id}/publish`).then(r => r.data),
  unpublish: (id) => apiClient.post(`/api/v1/admin/courses/${id}/unpublish`).then(r => r.data),
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────
export const adminKnowledgeApi = {
  getAll: ({ fileType, search, page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize })
    if (fileType && fileType !== 'All Content') params.set('file_type', fileType)
    if (search) params.set('search', search)
    return apiClient.get(`/api/v1/knowledge?${params}`).then(r => r.data)
  },

  upload: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/api/v1/knowledge/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    }).then(r => r.data)
  },

  delete: (id) => apiClient.delete(`/api/v1/knowledge/${id}`),
  recordView: (id) => apiClient.post(`/api/v1/knowledge/${id}/view`).then(r => r.data),
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export const adminReportsApi = {
  getAll: ({ page = 1, pageSize = 20 } = {}) =>
    apiClient.get(`/api/v1/reports?page=${page}&page_size=${pageSize}`).then(r => r.data),

  generate: async (reportType, format, dateFrom, dateTo) => {
    const response = await apiClient.post('/api/v1/reports/generate', {
      report_type: reportType,
      format,
      date_from: dateFrom,
      date_to: dateTo,
    }, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    const ext = format.toLowerCase() === 'csv' ? 'csv' : 'pdf'
    link.href = url
    link.setAttribute('download', `${reportType}_report.${ext}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },

  getScheduled: () => apiClient.get('/api/v1/reports/scheduled').then(r => r.data),
  createScheduled: (payload) => apiClient.post('/api/v1/reports/scheduled', payload).then(r => r.data),
  deleteScheduled: (id) => apiClient.delete(`/api/v1/reports/scheduled/${id}`),
}

// ─── Export ───────────────────────────────────────────────────────────────────
export const adminExportApi = {
  download: async (type) => {
    const response = await apiClient.get(`/api/v1/admin/export/${type}`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${type}_report.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}

// ─── Leadership ───────────────────────────────────────────────────────────────
export const leadershipApi = {
  // existing
  getStats: () => apiClient.get('/api/v1/leadership/stats').then(r => r.data),
  getActivities: (limit = 8) => apiClient.get(`/api/v1/leadership/activities?limit=${limit}`).then(r => r.data),
  sendMessage: (payload) => apiClient.post('/api/v1/leadership/send-email', payload).then(r => r.data),

  // management
  getManagementStats: () => apiClient.get('/api/v1/leadership/management/stats').then(r => r.data),
  getTrainers: () => apiClient.get('/api/v1/leadership/trainers').then(r => r.data),
  inviteTrainer: (payload) => apiClient.post('/api/v1/leadership/trainers/invite', payload).then(r => r.data),
  messageTrainer: (payload) => apiClient.post('/api/v1/leadership/trainers/message', payload).then(r => r.data),
  getAnnouncements: () => apiClient.get('/api/v1/leadership/announcements').then(r => r.data),
  createAnnouncement: (payload) => apiClient.post('/api/v1/leadership/announcements', payload).then(r => r.data),
  deleteAnnouncement: (id) => apiClient.delete(`/api/v1/leadership/announcements/${id}`),
  getProgramSettings: () => apiClient.get('/api/v1/leadership/program-settings').then(r => r.data),
  saveProgramSettings: (payload) => apiClient.put('/api/v1/leadership/program-settings', payload).then(r => r.data),
}
