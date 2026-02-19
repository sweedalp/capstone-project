import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [dark, setDark]   = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    return () => document.documentElement.classList.remove('dark')
  }, [dark])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  return (
    <AdminContext.Provider value={{ dark, setDark, toast, setToast, showToast }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useApp must be used within AdminProvider')
  return ctx
}