import { useEffect } from 'react'

const TYPES = {
  success: { bg:'bg-green-500', icon:'check_circle' },
  error:   { bg:'bg-red-500',   icon:'error'        },
  info:    { bg:'bg-primary',   icon:'info'         },
  warning: { bg:'bg-amber-500', icon:'warning'      },
}

export default function Toast({ message, type = 'success', onClose }) {
  const { bg, icon } = TYPES[type] ?? TYPES.info

  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl toast-enter ${bg}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="text-sm font-semibold">{message}</span>
      <button type="button" onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}