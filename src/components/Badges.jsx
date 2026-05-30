import { Clock, CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';

// ── StatusBadge ───────────────────────────────────────────
const STATUS = {
  pending:     { label: 'Pendiente',   bg: 'bg-slate-50',    text: 'text-slate-600',   border: 'border-slate-200',   Icon: CircleDashed },
  in_progress: { label: 'En proceso',  bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    Icon: Clock        },
  resolved:    { label: 'Resuelto',    bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', Icon: CheckCircle2 },
  rejected:    { label: 'Rechazado',   bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     Icon: XCircle      },
};

export function StatusBadge({ status, size = 'md' }) {
  const s   = STATUS[status] || STATUS.pending;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;
  const IconComponent = s.Icon;

  return (
    <span className={`badge ${s.bg} ${s.text} ${s.border} ${pad}`}>
      <IconComponent size={iconSize} className={status === 'in_progress' ? 'animate-pulse' : ''} />
      {s.label}
    </span>
  );
}

// ── CategoryBadge ─────────────────────────────────────────
export function CategoryBadge({ name, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;
  
  return (
    <span className={`badge bg-slate-50 border-slate-200 text-slate-700 ${pad}`}>
      <span className="text-slate-500">{getCategoryIcon(name, iconSize)}</span>
      {name}
    </span>
  );
}