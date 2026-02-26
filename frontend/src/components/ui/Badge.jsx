const COLORS = {
  green:   'bg-green-100 text-green-700',
  blue:    'bg-blue-100 text-blue-700',
  amber:   'bg-amber-100 text-amber-700',
  red:     'bg-red-100 text-red-700',
  purple:  'bg-purple-100 text-purple-700',
  slate:   'bg-slate-100 text-slate-600',
  primary: 'bg-primary/10 text-primary',
}

export default function Badge({ children, color = 'slate' }) {
  return (
    <span className={`badge ${COLORS[color] ?? COLORS.slate}`}>{children}</span>
  )
}