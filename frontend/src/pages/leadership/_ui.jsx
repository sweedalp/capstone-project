// ─── _ui.jsx – Shared micro-components ────────────────────────────────────
import React from 'react';

// ── Avatar ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-[#137fec]','bg-purple-500','bg-emerald-500',
  'bg-amber-500','bg-pink-500','bg-teal-500','bg-rose-500',
];
export function Avatar({ name, size = 9 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const sz = `size-${size}`;
  return (
    <div className={`${sz} rounded-full ${color} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
      {initials}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
const BADGE = {
  'top-performer': { cls: 'bg-emerald-100 text-emerald-700', icon: 'emoji_events',  label: 'Top Performer'    },
  'on-track':      { cls: 'bg-blue-100   text-blue-700',     icon: 'check_circle',  label: 'On Track'         },
  'at-risk':       { cls: 'bg-red-100    text-red-700',      icon: 'warning',       label: 'At Risk'          },
  'behind':        { cls: 'bg-amber-100  text-amber-700',    icon: 'schedule',      label: 'Behind Schedule'  },
  'completed':     { cls: 'bg-emerald-100 text-emerald-700', icon: 'verified',      label: 'Completed'        },
};
export function StatusBadge({ status }) {
  const cfg = BADGE[status] || BADGE['on-track'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────
export function ProgressBar({ value, height = 'h-2.5', color }) {
  const auto = value > 70 ? 'bg-[#137fec]' : value > 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div className={`${height} ${color || auto} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div onClick={onClick}
      className={[
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        hover ? 'cursor-pointer hover:shadow-md hover:border-[#137fec]/30 transition-all' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}>
      {children}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60';
  const vars = {
    primary:   'bg-[#137fec] text-white hover:bg-[#0d6bbf]',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'text-[#137fec] hover:bg-[#137fec]/10',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${vars[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ── SectionHeading ────────────────────────────────────────────────────────
export function SectionHeading({ children }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{children}</h3>;
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[fadeIn_.18s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-bold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-[12px] font-medium text-slate-600 mb-1.5">{label}</label>}
      <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/25 focus:border-[#137fec] transition" {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-[12px] font-medium text-slate-600 mb-1.5">{label}</label>}
      <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/25 bg-white transition" {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-0.5 border-b border-slate-200">
      {tabs.map(({ id, label, icon }) => (
        <button key={id} onClick={() => onChange(id)}
          className={[
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
            active === id ? 'border-[#137fec] text-[#137fec]' : 'border-transparent text-slate-500 hover:text-slate-700',
          ].join(' ')}>
          {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-[#137fec]' : 'bg-slate-200'}`}>
      <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner() {
  return <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>;
}
