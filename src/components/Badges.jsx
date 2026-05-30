// ── StatusBadge ───────────────────────────────────────────
const STATUS = {
  pending:     { label: 'Pendiente',   bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400'   },
  in_progress: { label: 'En proceso',  bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-500'   },
  resolved:    { label: 'Resuelto',    bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected:    { label: 'Rechazado',   bg: 'bg-red-50',       text: 'text-red-600',     dot: 'bg-red-400'     },
};

export function StatusBadge({ status, size = 'md' }) {
  const s   = STATUS[status] || STATUS.pending;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`badge ${s.bg} ${s.text} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'in_progress' ? 'animate-pulse-dot' : ''}`} />
      {s.label}
    </span>
  );
}

// ── CategoryBadge ─────────────────────────────────────────
export function CategoryBadge({ icon, name, color, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`badge bg-navy-800/6 text-navy-700 ${pad}`}>
      <span>{icon}</span>
      {name}
    </span>
  );
}