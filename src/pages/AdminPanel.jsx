import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, BarChart2, CheckCircle,
  Clock, AlertTriangle, XCircle, ChevronDown, Search,
  ExternalLink, RefreshCw, UserCog, MapPin, TrendingUp,
  Camera, Flame, Upload
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import Pagination from '../components/Pagination';

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
  { id: 'reports',   label: 'Reportes',   icon: <FileText size={15} /> },
  { id: 'users',     label: 'Usuarios',   icon: <Users size={15} /> },
];

const STATUS_LABELS = {
  pending:     'Pendiente',
  in_progress: 'En proceso',
  resolved:    'Resuelto',
  rejected:    'Rechazado',
};

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-navy-800/6 border border-navy-800/10 rounded-full px-3 py-1 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs font-display font-semibold text-navy-700">Panel de Administración</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-navy-900">
          Centro de Gestión Ciudadana
        </h1>
        <p className="text-sm text-navy-800/50 font-body mt-1">
          Gestiona reportes, responde a ciudadanos y monitorea el estado de la ciudad.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-navy-800/8 w-fit mb-8 shadow-sm">
        {TABS.filter(t => t.id !== 'users' || isAdmin).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all duration-150
              ${tab === t.id ? 'bg-navy-800 text-white shadow-sm' : 'text-navy-700/60 hover:text-navy-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'reports'   && <ReportsTab />}
      {tab === 'users'     && isAdmin && <UsersTab />}
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────
function DashboardTab() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats)  return <p className="text-navy-800/50 text-sm">Error al cargar estadísticas.</p>;

  const t = stats.totals;
  const maxCategory = Math.max(...(stats.by_category || []).map(c => c.total), 1);
  const maxDistrict = Math.max(...(stats.by_district || []).map(d => d.total), 1);

  return (
    <div className="space-y-8">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStatCard color="bg-navy-800"   icon={<TrendingUp size={20} />} value={t.total_reports} label="Total reportes"  sub={`${t.total_users} usuarios registrados`} />
        <BigStatCard color="bg-amber-500"  icon={<AlertTriangle size={20} />} value={t.pending}   label="Pendientes"      sub="Sin atender" />
        <BigStatCard color="bg-blue-600"   icon={<Clock size={20} />}      value={t.in_progress}  label="En proceso"      sub="Siendo atendidos" />
        <BigStatCard color="bg-emerald-500" icon={<CheckCircle size={20} />} value={t.resolved}  label="Resueltos"       sub={`${stats.avg_resolution_hours}h promedio`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad 7 días */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-sm text-navy-900 mb-5">Reportes últimos 7 días</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.recent_activity.length === 0 ? (
              <p className="text-xs text-navy-800/40 font-body">Sin actividad reciente</p>
            ) : (
              stats.recent_activity.map(d => {
                const max = Math.max(...stats.recent_activity.map(r => r.total), 1);
                const pct = (d.total / max) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-display font-semibold text-navy-800/60">{d.total}</span>
                    <div className="w-full bg-navy-800/6 rounded-t-md overflow-hidden" style={{ height: 80 }}>
                      <div className="w-full bg-navy-800 rounded-t-md transition-all duration-500"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
                    </div>
                    <span className="text-[9px] text-navy-800/40 font-body">
                      {format(new Date(d.day), 'dd/MM')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-sm text-navy-900 mb-5">Reportes por categoría</h3>
          <div className="space-y-3">
            {stats.by_category.filter(c => c.total > 0).slice(0, 6).map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-navy-800/80">{c.icon} {c.name}</span>
                  <span className="text-xs font-display font-bold text-navy-900">{c.total}</span>
                </div>
                <div className="h-1.5 bg-navy-800/6 rounded-full overflow-hidden">
                  <div className="h-full bg-navy-800 rounded-full transition-all duration-700"
                    style={{ width: `${(c.total / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distritos */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-sm text-navy-900 mb-5">Reportes por distrito</h3>
          <div className="space-y-3">
            {stats.by_district.slice(0, 6).map(d => (
              <div key={d.district}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-navy-800/80 flex items-center gap-1">
                    <MapPin size={10} /> {d.district || 'Sin distrito'}
                  </span>
                  <span className="text-xs font-display font-bold text-navy-900">{d.total}</span>
                </div>
                <div className="h-1.5 bg-navy-800/6 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full transition-all duration-700"
                    style={{ width: `${(d.total / maxDistrict) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado resumen */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-sm text-navy-900 mb-5">Distribución de estados</h3>
          <div className="space-y-3">
            {[
              { key: 'pending',     label: 'Pendiente',   val: t.pending,     color: 'bg-slate-400',   total: t.total_reports },
              { key: 'in_progress', label: 'En proceso',  val: t.in_progress, color: 'bg-amber-500',   total: t.total_reports },
              { key: 'resolved',    label: 'Resuelto',    val: t.resolved,    color: 'bg-emerald-500', total: t.total_reports },
              { key: 'rejected',    label: 'Rechazado',   val: t.rejected,    color: 'bg-red-400',     total: t.total_reports },
            ].map(s => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-navy-800/80">{s.label}</span>
                  <span className="text-xs font-display font-bold text-navy-900">
                    {s.val} ({s.total > 0 ? Math.round((s.val / s.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-navy-800/6 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`}
                    style={{ width: `${s.total > 0 ? (s.val / s.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REPORTS TAB ───────────────────────────────────────────
function ReportsTab() {
  const [reports,    setReports]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [areas,      setAreas]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({ page: 1, limit: 15, sort: 'recent' });
  const [active,     setActive]     = useState(null); // reporte con panel abierto

  useEffect(() => {
    api.admin.areas().then(d => setAreas(d.areas || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.admin.reports(filters)
      .then(d => { setReports(d.reports || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  function setF(k, v) { setFilters(f => ({ ...f, [k]: v, page: 1 })); }

  async function updateStatus(id, status, note = '') {
    try {
      await api.admin.setStatus(id, { status, note });
      setReports(rs => rs.map(r => r.id === id ? { ...r, status } : r));
      setActive(null);
    } catch (err) { alert(err.message); }
  }

  async function assignArea(id, assigned_to) {
    try {
      await api.admin.assign(id, { assigned_to });
      setReports(rs => rs.map(r => r.id === id ? { ...r, assigned_to } : r));
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="label text-xs">Buscar</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-800/40" />
            <input className="input pl-9 h-9 text-xs" placeholder="Título, dirección…"
              value={filters.search || ''} onChange={e => setF('search', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label text-xs">Estado</label>
          <select className="input h-9 text-xs" value={filters.status || ''} onChange={e => setF('status', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Ordenar por</label>
          <select className="input h-9 text-xs" value={filters.sort || 'recent'} onChange={e => setF('sort', e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="popular">Más votados</option>
          </select>
        </div>
        <button onClick={() => setFilters({ page: 1, limit: 15, sort: 'recent' })}
          className="btn-secondary h-9 text-xs px-3">
          <RefreshCw size={13} /> Limpiar
        </button>
      </div>

      {/* Conteo */}
      <p className="text-xs text-navy-800/40 font-body">{pagination.total || 0} reportes encontrados</p>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800/8 bg-navy-800/2">
                {['Reporte', 'Estado', 'Distrito', 'Votos', 'Área asignada', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-navy-800/50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-navy-800/5">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-navy-800/6 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-navy-800/40 text-sm font-body">No se encontraron reportes</td></tr>
              ) : (
                reports.map(r => (
                  <>
                    <tr key={r.id}
                      className="border-b border-navy-800/5 hover:bg-navy-800/2 transition-colors cursor-pointer"
                      onClick={() => setActive(active === r.id ? null : r.id)}>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-navy-800/6 flex items-center justify-center flex-shrink-0 text-base">
                            {r.category_icon || '📋'}
                          </div>
                          <div>
                            <p className="font-display font-semibold text-xs text-navy-900 line-clamp-1">{r.title}</p>
                            <p className="text-[11px] text-navy-800/40 font-body mt-0.5">
                              {r.is_anonymous ? 'Anónimo' : r.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                      <td className="px-4 py-3 text-xs text-navy-800/70 font-body whitespace-nowrap">{r.district || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-display font-bold ${r.vote_count >= 5 ? 'text-red-600' : 'text-navy-800'}`}>
                          {r.vote_count >= 5 && <Flame size={11} className="inline fill-red-400 mr-0.5" />}
                          {r.vote_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select className="input h-7 text-[11px] py-0 min-w-44"
                          value={r.assigned_to || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); assignArea(r.id, e.target.value); }}>
                          <option value="">Sin asignar</option>
                          {areas.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-navy-800/50 font-body whitespace-nowrap">
                        {formatDistanceToNow(new Date(r.created_at), { locale: es, addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <Link to={`/reporte/${r.id}`} target="_blank"
                            className="p-1.5 rounded-lg hover:bg-navy-800/8 text-navy-800/40 hover:text-navy-800 transition-colors">
                            <ExternalLink size={13} />
                          </Link>
                          <button onClick={() => setActive(active === r.id ? null : r.id)}
                            className="p-1.5 rounded-lg hover:bg-navy-800/8 text-navy-800/40 hover:text-navy-800 transition-colors">
                            <ChevronDown size={13} className={`transition-transform ${active === r.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Panel expandido de acciones */}
                    {active === r.id && (
                      <tr key={`${r.id}-panel`} className="bg-navy-800/2">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Cambiar estado */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-display font-semibold text-navy-800/60">Cambiar estado:</span>
                              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                <button key={val}
                                  disabled={r.status === val}
                                  onClick={() => updateStatus(r.id, val)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all border
                                    ${r.status === val
                                      ? 'bg-navy-800 text-white border-navy-800 cursor-default'
                                      : 'bg-white text-navy-700 border-navy-800/15 hover:border-navy-800/40'}`}>
                                  {label}
                                </button>
                              ))}
                              <Link to={`/reporte/${r.id}`} target="_blank"
                                className="ml-auto text-xs font-display font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1 transition-colors">
                                Ver reporte <ExternalLink size={11} />
                              </Link>
                            </div>

                            {/* Subir evidencia de resolución */}
                            <ResolutionUploader reportId={r.id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={filters.page} totalPages={pagination.total_pages}
        onChange={p => setFilters(f => ({ ...f, page: p }))} />
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────
function UsersTab() {
  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page,       setPage]       = useState(1);

  function load() {
    setLoading(true);
    api.admin.users({ page, limit: 15, ...(search && { search }), ...(roleFilter && { role: roleFilter }) })
      .then(d => { setUsers(d.users || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [page, search, roleFilter]);

  async function changeRole(id, role) {
    try {
      await api.admin.setRole(id, role);
      setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) { alert(err.message); }
  }

  async function toggleActive(id, is_active) {
    if (!confirm(`¿${is_active ? 'Activar' : 'Desactivar'} este usuario?`)) return;
    try {
      await api.admin.setActive(id, is_active);
      setUsers(us => us.map(u => u.id === id ? { ...u, is_active: is_active ? 1 : 0 } : u));
    } catch (err) { alert(err.message); }
  }

  const ROLE_STYLES = {
    admin:     'bg-purple-100 text-purple-700',
    authority: 'bg-blue-100 text-blue-700',
    citizen:   'bg-navy-800/6 text-navy-700',
  };
  const ROLE_LABELS = { admin: 'Admin', authority: 'Autoridad', citizen: 'Ciudadano' };

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="label text-xs">Buscar usuario</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-800/40" />
            <input className="input pl-9 h-9 text-xs" placeholder="Username o email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div>
          <label className="label text-xs">Rol</label>
          <select className="input h-9 text-xs" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Todos los roles</option>
            <option value="citizen">Ciudadano</option>
            <option value="authority">Autoridad</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800/8 bg-navy-800/2">
                {['Usuario', 'Email', 'Rol', 'Distrito', 'Reportes', 'Desde', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-navy-800/50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-navy-800/5">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-navy-800/6 rounded-full animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-navy-800/40 text-sm font-body">No se encontraron usuarios</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className={`border-b border-navy-800/5 transition-colors ${!u.is_active ? 'opacity-50' : 'hover:bg-navy-800/2'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-navy-800/10 flex items-center justify-center text-xs font-display font-bold text-navy-700">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-display font-semibold text-xs text-navy-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-800/60 font-body">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className={`badge border-0 cursor-pointer text-xs font-display font-semibold ${ROLE_STYLES[u.role]}`}>
                        {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-800/60 font-body">{u.district || '—'}</td>
                    <td className="px-4 py-3 text-xs font-display font-semibold text-navy-900">{u.report_count}</td>
                    <td className="px-4 py-3 text-[11px] text-navy-800/50 font-body whitespace-nowrap">
                      {format(new Date(u.created_at), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(u.id, !u.is_active)}
                        className={`flex items-center gap-1 text-[11px] font-display font-semibold px-2.5 py-1 rounded-lg transition-colors
                          ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                        <UserCog size={11} />
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={pagination.total_pages} onChange={setPage} />
    </div>
  );
}

// ── RESOLUTION UPLOADER ───────────────────────────────────
function ResolutionUploader({ reportId }) {
  const [files,     setFiles]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      await api.admin.uploadResolutionMedia(reportId, files);
      setDone(true);
      setFiles([]);
    } catch (e) {
      setError(e.message || 'Error al subir');
    } finally {
      setUploading(false);
    }
  }

  if (done) return (
    <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
      <CheckCircle size={14} /> Evidencia de resolución subida correctamente
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-display font-semibold text-navy-800/60 flex items-center gap-1">
        <Camera size={12} /> Evidencia de resolución:
      </span>
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-100 transition-colors">
        <Upload size={11} />
        {files.length ? `${files.length} archivo(s) seleccionado(s)` : 'Seleccionar fotos'}
        <input type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={e => setFiles(Array.from(e.target.files))} />
      </label>
      {files.length > 0 && (
        <button onClick={handleUpload} disabled={uploading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
          {uploading ? 'Subiendo…' : 'Subir evidencia'}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────
function BigStatCard({ color, icon, value, label, sub }) {
  return (
    <div className="card p-5 animate-fade-up">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white mb-3 shadow-sm`}>
        {icon}
      </div>
      <div className="font-display font-bold text-3xl text-navy-900">{value ?? 0}</div>
      <div className="font-display font-semibold text-sm text-navy-800 mt-0.5">{label}</div>
      <div className="text-xs text-navy-800/40 font-body mt-0.5">{sub}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 h-32 bg-navy-800/4" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="card p-6 h-56 bg-navy-800/4" />)}
      </div>
    </div>
  );
}