import { Navigate } from 'react-router-dom'

/**
 * Checks localStorage for a token + admin role.
 * Redirects to /login if not authenticated or not admin.
 */
export default function PrivateAdminRoute({ children }) {
  const token = localStorage.getItem('token')

  // Try to get user role — adjust the key to match what your login page stores
  let role = ''
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    role = user.role || user.userType || ''
  } catch (_) {}

  if (!token) return <Navigate to="/login" replace />
  // If your login doesn't store role yet, remove the role check temporarily
  if (role && role.toLowerCase() !== 'admin') return <Navigate to="/login" replace />

  return children
}