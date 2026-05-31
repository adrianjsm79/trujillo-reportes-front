import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ThumbsUp, MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import { api } from '../api/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_PILL = {
  pending:     { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'En proceso', cls: 'bg-blue-100  text-blue-700'  },
  resolved:    { label: 'Resuelto',   cls: 'bg-emerald-100 text-emerald-700' },
};

function UrgentCard({ report, rank }) {
  const timeAgo  = formatDistanceToNow(new Date(report.created_at), { locale: es, addSuffix: true });
  const thumb    = report.media?.[0] || report.image_url;
  const statusMeta = STATUS_PILL[report.status] || STATUS_PILL.pending;

  return (
    <Link
      to={`/reporte/${report.id}`}
      className="group flex gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
    >
      {/* Rank number */}
      <div className="flex-shrink-0 w-7 flex items-start justify-center pt-0.5">
        <span className={`font-black text-lg leading-none ${rank === 1 ? 'text-red-500' : rank === 2 ? 'text-orange-400' : 'text-amber-400'}`}>
          #{rank}
        </span>
      </div>

      {/* Thumbnail */}
      {thumb && (
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>
          {report.category_name && (
            <span className="text-[11px] text-slate-400 truncate">{report.category_name}</span>
          )}
        </div>
        <p className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
          {report.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-red-500">
            <ThumbsUp size={11} className="fill-red-400" /> {report.vote_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} /> {report.comment_count}
          </span>
          {report.district && (
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {report.district}
            </span>
          )}
        </div>
      </div>

      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 flex-shrink-0 self-center transition-colors" />
    </Link>
  );
}

export default function UrgentReports({ threshold = 1 }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.top(5)
      .then(d => setReports((d.reports || []).filter(r => r.vote_count >= threshold)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [threshold]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 animate-pulse">
              <div className="w-7 h-7 bg-slate-200 rounded" />
              <div className="w-14 h-14 bg-slate-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reports.length === 0) return null;

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
            <Flame size={14} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Reportes Urgentes</h2>
            <p className="text-[11px] text-slate-400">Los más apoyados por la comunidad</p>
          </div>
        </div>
        <Link to="/?sort=popular" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {reports.slice(0, 3).map((r, i) => (
          <UrgentCard key={r.id} report={r} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
