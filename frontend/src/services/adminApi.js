/**
 * api.js – Centralised service layer.
 * All functions currently return mock data / simulate async delays.
 * Replace the bodies with real fetch/axios calls when a backend is ready.
 */

import { MOCK_USERS, MOCK_CONTENT, MOCK_AI_JOBS, MOCK_COURSES } from '../data/mockData.js'

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  /** @returns {Promise<{token: string, user: object}>} */
  login: async (email, _password) => {
    await delay()
    if (!email) throw new Error('Email is required')
    return { token: 'mock-jwt-token', user: { id: 4, name: 'James Rodriguez', email, role: 'Admin' } }
  },
  logout: async () => { await delay(100) },
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async () => { await delay(); return [...MOCK_USERS] },
  getById: async (id) => { await delay(); return MOCK_USERS.find((u) => u.id === id) ?? null },
  create: async (data) => { await delay(); return { id: Date.now(), ...data, status: 'pending', joined: 'Today', courses: 0, lastLogin: 'Never', uploads: 0 } },
  update: async (id, data) => { await delay(); return { id, ...data } },
  remove: async (_id) => { await delay() },
  approve: async (_id) => { await delay() },
}

// ─── Content / Knowledge Base ─────────────────────────────────────────────────
export const contentApi = {
  getAll: async () => { await delay(); return [...MOCK_CONTENT] },
  getById: async (id) => { await delay(); return MOCK_CONTENT.find((c) => c.id === id) ?? null },
  remove: async (_id) => { await delay() },
  reprocess: async (_id) => { await delay() },
}

// ─── AI Jobs ──────────────────────────────────────────────────────────────────
export const aiApi = {
  getJobs: async () => { await delay(); return [...MOCK_AI_JOBS] },
  createJob: async (data) => { await delay(); return { id: `JOB-${Date.now()}`, ...data, status: 'running', progress: 0 } },
  retryJob: async (_id) => { await delay() },
  deleteJob: async (_id) => { await delay() },
  testConnection: async (service) => { await delay(800); return { ok: true, service } },
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesApi = {
  getAll: async () => { await delay(); return [...MOCK_COURSES] },
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  generate: async (_params) => { await delay(1200); return { url: '#', filename: 'report.pdf' } },
  getScheduled: async () => { await delay(); return [] },
}
