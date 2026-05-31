import { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, XCircle, CircleDashed, Loader2,
  MapPin, User, Camera, ArrowRight, Flag
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api/client';

const STATUS_META = {
  pending:     { label: 'Pendiente',   color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',  Icon: CircleDashed },
  in_progress: { label: 'En proceso',  color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-200',   Icon: Loader2      },
  resolved:    { label: 'Resuelto',    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',Icon: CheckCircle2  },
  rejected:    { label: 'Rechazado',   color: 'text-red-600',     bg: 'bg-red-50     border-red-200',    Icon: XCircle      },
};

function TimelineItem({ icon: Icon, iconBg, title, subtitle, note, date, isLast, isFirst }) {
  return (
    <div className="flex gap-4">
      {/* Línea vertical + ícono */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={15} />
        </div>
        {!isLast && <div className="w-0.5 bg-slate-200 flex-1 mt-1 min-h-[24px]" />}
      </div>

      {/* Contenido */}
      <div className={`flex-1 ${!isLast ? 'pb-5' : 'pb-1'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            {note && (
              <div className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed italic">
                "{note}"
              </div>
            )}
          </div>
          <time className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5 tabular-nums">
            {format(new Date(date), "d MMM, HH:mm", { locale: es })}
          </time>
        </div>
      </div>
    </div>
  );
}

export default function ActivityTimeline({ reportId, createdAt, assignedTo }) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.reports.history(reportId)
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Construir la lista de eventos: creación + historial de estados
  const events = [];

  // Evento 0: Creación del reporte
  events.push({
    type: 'created',
    date: createdAt,
    Icon: Flag,
    iconBg: 'bg-slate-100 border-slate-300 text-slate-500',
    title: 'Reporte publicado',
    subtitle: 'Recibido por la plataforma ciudadana',
  });

  // Eventos de historial de estados
  history.forEach(h => {
    const to = STATUS_META[h.new_status] || STATUS_META.pending;
    const Icon = to.Icon;
    events.push({
      type: 'status',
      date: h.created_at,
      Icon,
      iconBg: `${to.bg} ${to.color}`,
      title: `Estado actualizado a "${to.label}"`,
      subtitle: h.changed_by_username ? `por ${h.changed_by_username}` : 'por la municipalidad',
      note: h.note,
    });
  });

  // Si hay assignedTo, insertar evento de asignación (si hay historial en progreso)
  if (assignedTo && history.some(h => h.new_status === 'in_progress')) {
    const inProgressEvent = history.find(h => h.new_status === 'in_progress');
    if (inProgressEvent) {
      events.push({
        type: 'assigned',
        date: inProgressEvent.created_at,
        Icon: MapPin,
        iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
        title: `Asignado a ${assignedTo}`,
        subtitle: 'Área responsable designada',
      });
    }
  }

  // Ordenar por fecha
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {events.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Sin actividad registrada aún.</p>
      ) : (
        events.map((ev, i) => (
          <TimelineItem
            key={`${ev.type}-${i}`}
            icon={ev.Icon}
            iconBg={ev.iconBg}
            title={ev.title}
            subtitle={ev.subtitle}
            note={ev.note}
            date={ev.date}
            isFirst={i === 0}
            isLast={i === events.length - 1}
          />
        ))
      )}
    </div>
  );
}
