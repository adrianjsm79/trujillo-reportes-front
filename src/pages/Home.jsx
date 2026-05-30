import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReportCard  from '../components/ReportCard';
import FilterBar   from '../components/FilterBar';
import Pagination  from '../components/Pagination';

export default function Home() {
  const { user } = useAuth();
  const [reports,    setReports]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({ page: 1, limit: 12, sort: 'recent' });

  useEffect(() => {
    setLoading(true);
    api.reports.list(filters)
      .then(d => { setReports(d.reports || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  // Stats de portada (reutilizamos la lista)
  useEffect(() => {
    Promise.all([
      api.reports.list({ status: 'pending', limit: 1 }),
      api.reports.list({ status: 'in_progress', limit: 1 }),
      api.reports.list({ status: 'resolved', limit: 1 }),
      api.reports.list({ limit: 1 }),
    ]).then(([p, ip, r, all]) => {
      setStats({
        pending:     p.pagination?.total || 0,
        in_progress: ip.pagination?.total || 0,
        resolved:    r.pagination?.total || 0,
        total:       all.pagination?.total || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy-900 relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-navy-700/40 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
              <span className="text-primary-400 text-xs font-display font-medium">Plataforma activa en Trujillo</span>
            </div>
            <h1 className="text-white font-display font-bold text-4xl sm:text-5xl leading-tight tracking-tight mb-5">
              Reporta problemas<br />
              <span className="text-primary-400">en tu comunidad</span>
            </h1>
            <p className="text-slate-300 font-body text-base leading-relaxed mb-8 max-w-lg">
              Baches, alumbrado, basura, seguridad — repórtalo de forma anónima o con tu cuenta y dale seguimiento hasta que se resuelva.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link to="/nuevo" className="btn-primary">
                  <Plus size={16} /> Nuevo Reporte
                </Link>
              ) : (
                <Link to="/nuevo" className="btn-primary">
                  <Plus size={16} /> Hacer un reporte
                </Link>
              )}
              <Link to="/mapa" className="btn-secondary border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                Ver en el mapa
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
              <StatCard icon={<TrendingUp size={16} />} value={stats.total}       label="Total reportes"  />
              <StatCard icon={<AlertTriangle size={16} />} value={stats.pending}  label="Pendientes"      color="text-amber-400" />
              <StatCard icon={<Clock size={16} />}         value={stats.in_progress} label="En proceso"   color="text-blue-400" />
              <StatCard icon={<CheckCircle size={16} />}   value={stats.resolved} label="Resueltos"       color="text-emerald-400" />
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="aspect-[16/9] bg-navy-800/8" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-navy-800/8 rounded-full w-1/2" />
                  <div className="h-4 bg-navy-800/8 rounded-full w-full" />
                  <div className="h-3 bg-navy-800/8 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Search size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="font-display font-semibold text-slate-700 text-lg">No se encontraron reportes</p>
            <p className="text-sm text-slate-500 mt-1">Intenta con otros filtros o sé el primero en reportar.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-navy-800/40 font-body mb-4">
              {pagination.total} reporte{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {reports.map((r, i) => <ReportCard key={r.id} report={r} index={i} />)}
            </div>
            <Pagination page={filters.page} totalPages={pagination.total_pages} onChange={p => setFilters(f => ({ ...f, page: p }))} />
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color = 'text-primary-400' }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-4 animate-fade-up">
      <div className={`flex items-center gap-2 ${color} mb-1.5`}>
        {icon}
        <span className="font-display font-semibold text-2xl">{value ?? '—'}</span>
      </div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}