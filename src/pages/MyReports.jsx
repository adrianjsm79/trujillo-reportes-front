import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, ThumbsUp, MessageCircle, Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import Pagination from '../components/Pagination';

export default function MyReports() {
  const { user } = useAuth();

  const [reports,    setReports]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [statusTab,  setStatusTab]  = useState('');

  useEffect(() => {
    // Cargar stats del perfil
    api.auth.me()
      .then(d => setStats(d.stats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    // Filtramos por usuario actual — el backend aplica el filtro con el token
    api.reports.list({ page, limit: 8, ...(statusTab && { status: statusTab }) })
      .then(d => { setReports(d.reports || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusTab]);

  const TABS = [
    { value: '',            label: 'Todos',       icon: <FileText size={13} /> },
    { value: 'pending',     label: 'Pendientes',  icon: <AlertTriangle size={13} /> },
    { value: 'in_progress', label: 'En proceso',  icon: <Clock size={13} /> },
    { value: 'resolved',    label: 'Resueltos',   icon: <CheckCircle size={13} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-900">Mis Reportes</h1>
          <p className="text-sm text-navy-800/50 font-body mt-1">
            Hola, <span className="font-semibold text-navy-700">{user?.username}</span>. Aquí está el historial de tus reportes.
          </p>
        </div>
        <Link to="/nuevo" className="btn-gold">
          <Plus size={15} /> Nuevo Reporte
        </Link>
      </div>

      {/* Stats del usuario */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <UserStatCard
            icon={<FileText size={18} className="text-navy-700" />}
            value={stats.total_reports}
            label="Total reportes"
            bg="bg-navy-800/5"
          />
          <UserStatCard
            icon={<CheckCircle size={18} className="text-emerald-600" />}
            value={stats.resolved_reports}
            label="Resueltos"
            bg="bg-emerald-50"
          />
          <UserStatCard
            icon={<ThumbsUp size={18} className="text-gold-500" />}
            value={stats.total_votes}
            label="Apoyos dados"
            bg="bg-amber-50"
          />
          <UserStatCard
            icon={<TrendingUp size={18} className="text-blue-600" />}
            value={stats.total_reports > 0 ? Math.round((stats.resolved_reports / stats.total_reports) * 100) + '%' : '—'}
            label="Tasa resolución"
            bg="bg-blue-50"
          />
        </div>
      )}

      {/* Tabs de estado */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-navy-800/8 w-fit mb-6">
        {TABS.map(t => (
          <button key={t.value}
            onClick={() => { setStatusTab(t.value); setPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-display font-semibold transition-all duration-150
              ${statusTab === t.value
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-navy-700/60 hover:text-navy-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Lista de reportes */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-5 animate-pulse flex gap-4">
              <div className="w-20 h-20 bg-navy-800/8 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 bg-navy-800/8 rounded-full w-1/4" />
                <div className="h-4 bg-navy-800/8 rounded-full w-3/4" />
                <div className="h-3 bg-navy-800/8 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 card">
          <span className="text-5xl mb-4 block">📋</span>
          <p className="font-display font-semibold text-navy-800/60 text-lg">No tienes reportes aún</p>
          <p className="text-sm text-navy-800/40 font-body mt-1 mb-6">Crea tu primer reporte y ayuda a mejorar Trujillo</p>
          <Link to="/nuevo" className="btn-primary mx-auto">
            <Plus size={15} /> Crear primer reporte
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((r, i) => (
              <Link to={`/reporte/${r.id}`} key={r.id}
                className={`card card-hover flex gap-4 p-4 animate-fade-up stagger-${Math.min(i+1,5)}`}>
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-navy-800/5 flex-shrink-0 flex items-center justify-center">
                  {r.image_url
                    ? <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">{r.category_icon || '📋'}</span>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <StatusBadge status={r.status} size="sm" />
                    {r.category_name && <CategoryBadge icon={r.category_icon} name={r.category_name} size="sm" />}
                  </div>
                  <h3 className="font-display font-bold text-sm text-navy-900 truncate">{r.title}</h3>
                  <p className="text-xs text-navy-800/50 font-body mt-0.5 line-clamp-1">{r.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-navy-800/40 font-body">
                    <span className="flex items-center gap-1"><ThumbsUp size={10} /> {r.vote_count}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={10} /> {r.comment_count}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(r.created_at), { locale: es, addSuffix: true })}
                    </span>
                    {r.district && <span>{r.district}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={pagination.total_pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function UserStatCard({ icon, value, label, bg }) {
  return (
    <div className={`card p-4 ${bg} animate-fade-up`}>
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg p-2 shadow-sm">{icon}</div>
        <div>
          <div className="font-display font-bold text-xl text-navy-900">{value ?? 0}</div>
          <div className="text-xs text-navy-800/50 font-body">{label}</div>
        </div>
      </div>
    </div>
  );
}