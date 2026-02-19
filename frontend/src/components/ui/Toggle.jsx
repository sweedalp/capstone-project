export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`toggle ${checked ? 'bg-primary' : 'bg-slate-300'}`}
      >
        <span className={`toggle-thumb ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      )}
    </label>
  )
}