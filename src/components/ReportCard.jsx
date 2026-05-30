import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, ThumbsUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge, CategoryBadge } from './Badges';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function ReportCard({ report, index = 0 }) {
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { locale: es, addSuffix: true });

  return (
    <Link
      to={`/reporte/${report.id}`}
      className={`card card-hover flex flex-col overflow-hidden animate-fade-up stagger-${Math.min(index + 1, 5)} group`}
    >
      {/* Imagen */}
      {report.image_url ? (
        <div className="aspect-[16/9] overflow-hidden bg-navy-800/5">
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-300">
          {getCategoryIcon(report.category_name || 'default', 48)}
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {report.category_name && (
            <CategoryBadge name={report.category_name} size="sm" />
          )}
          <StatusBadge status={report.status} size="sm" />
        </div>

        {/* Título */}
        <h3 className="font-display font-bold text-navy-900 text-base leading-snug group-hover:text-navy-700 transition-colors line-clamp-2">
          {report.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-navy-800/60 font-body leading-relaxed line-clamp-2 flex-1">
          {report.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-navy-800/6 mt-auto">
          <div className="flex items-center gap-1 text-navy-800/50 text-xs font-body">
            <MapPin size={11} />
            <span>{report.district || 'Trujillo'}</span>
          </div>
          <div className="flex items-center gap-3 text-navy-800/50 text-xs font-body">
            <span className="flex items-center gap-1">
              <ThumbsUp size={11} /> {report.vote_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={11} /> {report.comment_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}