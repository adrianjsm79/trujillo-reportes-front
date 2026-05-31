import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, TrendingUp, CheckCircle, Clock, AlertTriangle,
  Search, MapIcon, PenSquare, Megaphone
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FeedPost   from '../components/FeedPost';
import FilterBar  from '../components/FilterBar';
import Pagination from '../components/Pagination';

export default function Home() {
  const { user } = useAuth();
  const [reports,    setReports]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({ page: 1, limit: 10, sort: 'recent' });

  useEffect(() => {
    setLoading(true);
    api.reports.list(filters)
      .then(d => { setReports(d.reports || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    Promise.all([
      api.reports.list({ status: 'pending',     limit: 1 }),
      api.reports.list({ status: 'in_progress', limit: 1 }),
      api.reports.list({ status: 'resolved',    limit: 1 }),
      api.reports.list({ limit: 1 }),
    ]).then(([p, ip, r, all]) => {
      setStats({
        pending:     p.pagination?.total     || 0,
        in_progress: ip.pagination?.total    || 0,
        resolved:    r.pagination?.total     || 0,
        total:       all.pagination?.total   || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ───────── HERO ───────── */}
      <div className="bg-navy-900 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary-900/20 blur-3xl" />
          {/* Grid pattern sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Texto */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/25 rounded-full px-3.5 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-dot" />
                <span className="text-primary-300 text-xs font-semibold tracking-wide uppercase">
                  Comunidad activa en Trujillo
                </span>
              </div>
              <h1 className="text-white font-bold text-4xl leading-tight tracking-tight mb-3">
                La voz de los vecinos<br />
                <span className="text-primary-400">en un solo lugar</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                Reporta baches, alumbrado, basura, seguridad y más.
                Anónimo o con tu cuenta. Dale seguimiento hasta que se resuelva.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/nuevo" className="btn-primary text-sm px-5 py-2.5">
                  <PenSquare size={15} /> Publicar reporte
                </Link>
                <Link
                  to="/mapa"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-md border border-white/15 transition-all"
                >
                  <MapIcon size={15} /> Ver en el mapa
                </Link>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 md:w-64 flex-shrink-0">
                <StatTile value={stats.total}       label="Reportes"   color="text-white"          bg="bg-white/8" />
                <StatTile value={stats.pending}     label="Pendientes" color="text-amber-400"      bg="bg-amber-500/10" />
                <StatTile value={stats.in_progress} label="En proceso" color="text-blue-400"       bg="bg-blue-500/10" />
                <StatTile value={stats.resolved}    label="Resueltos"  color="text-emerald-400"    bg="bg-emerald-500/10" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────── LAYOUT PRINCIPAL ───────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* ── FEED (columna principal) ── */}
          <div className="flex-1 min-w-0">
            {/* Filtros */}
            <div className="mb-5">
              <FilterBar filters={filters} onChange={setFilters} />
            </div>

            {loading ? (
              <SkeletonFeed />
            ) : reports.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <p className="text-xs text-slate-400 font-medium mb-4 text-center">
                  {pagination.total} reporte{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                </p>
                {reports.map((r, i) => <FeedPost key={r.id} report={r} index={i} />)}
                <Pagination
                  page={filters.page}
                  totalPages={pagination.total_pages}
                  onChange={p => setFilters(f => ({ ...f, page: p }))}
                />
              </>
            )}
          </div>

          {/* ── SIDEBAR (solo en pantallas grandes) ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-4 sticky top-20">
            {/* CTA publicar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                  <Megaphone size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">¿Viste algo?</p>
                  <p className="text-xs text-slate-500">Ayuda a tu comunidad</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Reporta problemas en tu barrio. Puede ser anónimo. Solo toma 2 minutos.
              </p>
              <Link to="/nuevo" className="btn-primary w-full justify-center text-sm">
                <Plus size={15} /> Nuevo reporte
              </Link>
            </div>

            {/* Ir al mapa */}
            <Link
              to="/mapa"
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="w-10 h-10 bg-slate-100 group-hover:bg-primary-50 rounded-xl flex items-center justify-center transition-colors">
                <MapIcon size={20} className="text-slate-500 group-hover:text-primary-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Ver en el mapa</p>
                <p className="text-xs text-slate-400">Todos los reportes geolocalizados</p>
              </div>
            </Link>

            {/* Info / acerca de */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-sm">
              <p className="font-bold text-sm mb-1">TrujiReporta</p>
              <p className="text-xs text-primary-200 leading-relaxed mb-3">
                Plataforma ciudadana para reportar y dar seguimiento a problemas urbanos en Trujillo, Perú.
              </p>
              <p className="text-[11px] text-primary-300">
                Anónimo · Gratuito · Comunitario
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── Componentes auxiliares ── */

function StatTile({ value, label, color, bg }) {
  return (
    <div className={`${bg} border border-white/8 rounded-xl px-4 py-3 animate-fade-up`}>
      <p className={`font-bold text-2xl ${color} leading-none mb-1`}>{value ?? '—'}</p>
      <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function SkeletonFeed() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse shadow-sm">
          <div className="flex items-center gap-3 p-5 pb-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="px-5 pb-4 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
          <div className="h-48 bg-slate-100" />
          <div className="h-10 bg-slate-50" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search size={28} className="text-slate-300" />
      </div>
      <p className="font-bold text-slate-700 text-lg mb-1">No se encontraron reportes</p>
      <p className="text-sm text-slate-400 mb-6">Prueba con otros filtros o sé el primero en reportar.</p>
      <Link to="/nuevo" className="btn-primary mx-auto">
        <Plus size={15} /> Crear reporte
      </Link>
    </div>
  );
}