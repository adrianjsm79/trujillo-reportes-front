import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ThumbsUp, ArrowLeft, User, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import CommentSection from '../components/CommentSection';
import { createReportIcon, STATUS_COLORS, addTileLayer } from '../hooks/useLeafletMap';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function ReportDetail() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const { user, isAuthority }   = useAuth();

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted,   setVoted]   = useState(false);
  const [votes,   setVotes]   = useState(0);
  const [voting,  setVoting]  = useState(false);

  const miniMapRef  = useRef(null);
  const miniMapInst = useRef(null);

  // Cargar reporte
  useEffect(() => {
    api.reports.get(id)
      .then(d => {
        setReport(d);
        setVoted(d.user_voted);
        setVotes(d.vote_count);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  // Mini mapa Leaflet en sidebar
  useEffect(() => {
    if (!report?.latitude || !miniMapRef.current || miniMapInst.current) return;
    if (!window.L) return;

    miniMapInst.current = window.L.map(miniMapRef.current, {
      center:          [report.latitude, report.longitude],
      zoom:            15,
      zoomControl:     false,
      dragging:        false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom:       false,
    });

    // Tile layer CartoDB Positron
    window.L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 20 }
    ).addTo(miniMapInst.current);

    // Pin del reporte
    window.L.marker(
      [report.latitude, report.longitude],
      { icon: createReportIcon(STATUS_COLORS[report.status] || '#94A3B8') }
    ).addTo(miniMapInst.current);

    return () => {
      miniMapInst.current?.remove();
      miniMapInst.current = null;
    };
  }, [report]);

  async function toggleVote() {
    if (!user) { navigate('/login'); return; }
    if (voting) return;
    setVoting(true);
    try {
      if (voted) {
        await api.votes.unvote(id);
        setVoted(false); setVotes(v => v - 1);
      } else {
        await api.votes.vote(id);
        setVoted(true); setVotes(v => v + 1);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setVoting(false);
    }
  }

  async function deleteReport() {
    if (!confirm('¿Eliminar este reporte?')) return;
    try {
      await api.reports.delete(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-6 bg-navy-800/8 rounded-full w-32" />
      <div className="h-64 bg-navy-800/8 rounded-2xl" />
      <div className="h-8 bg-navy-800/8 rounded-full w-2/3" />
    </div>
  );

  if (!report) return null;

  const osmUrl = `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=16/${report.latitude}/${report.longitude}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-navy-800/60 hover:text-navy-800 transition-colors mb-6">
        <ArrowLeft size={15} /> Volver a reportes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagen */}
          {report.image_url && (
            <div className="rounded-2xl overflow-hidden shadow-card aspect-video bg-navy-800/5">
              <img src={report.image_url} alt={report.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={report.status} />
              {report.category_name && (
                <CategoryBadge name={report.category_name} />
              )}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight mb-3">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-body">
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {report.is_anonymous ? 'Anónimo' : (report.author_username || 'Usuario')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {formatDistanceToNow(new Date(report.created_at), { locale: es, addSuffix: true })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {report.district || 'Trujillo'}
                {report.address && ` · ${report.address}`}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-base text-slate-800 mb-3">Descripción del problema</h2>
            <p className="font-body text-slate-600 leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Respuesta oficial */}
          {report.official_response && (
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="font-display font-semibold text-primary-400 text-sm">Respuesta Oficial</span>
                {report.assigned_to && (
                  <span className="text-xs text-slate-400 font-body">— {report.assigned_to}</span>
                )}
              </div>
              <p className="text-white/85 font-body text-sm leading-relaxed">{report.official_response}</p>
              {report.resolved_at && (
                <p className="text-white/30 text-xs mt-3 font-body">
                  Resuelto el {format(new Date(report.resolved_at), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              )}
            </div>
          )}

          {/* Comentarios */}
          <div className="card p-6">
            <CommentSection reportId={id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Votar */}
          <div className="card p-5 text-center">
            <p className="text-xs text-slate-500 font-body mb-3">¿Este problema te afecta?</p>
            <button
              onClick={toggleVote}
              disabled={voting}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-display font-medium text-sm transition-all duration-200
                ${voted
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <ThumbsUp size={16} className={voted ? 'fill-white' : ''} />
              {voted ? 'Apoyando' : 'Apoyar'} · {votes}
            </button>
            <p className="text-[11px] text-slate-400 font-body mt-2">
              {votes} vecino{votes !== 1 ? 's' : ''} apoya{votes === 1 ? '' : 'n'} este reporte
            </p>
          </div>

          {/* Info */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold text-sm text-slate-800">Información</h3>
            <InfoRow label="Estado">
              <StatusBadge status={report.status} size="sm" />
            </InfoRow>
            <InfoRow label="Categoría">
              <span className="text-sm font-body flex items-center gap-1.5 text-slate-600">
                {getCategoryIcon(report.category_name || 'default', 14)} 
                {report.category_name || 'Sin categoría'}
              </span>
            </InfoRow>
            <InfoRow label="Distrito">
              <span className="text-sm font-body">{report.district || 'Trujillo'}</span>
            </InfoRow>
            <InfoRow label="Vistas">
              <span className="text-sm font-body">{report.view_count || 0}</span>
            </InfoRow>
            <InfoRow label="Comentarios">
              <span className="text-sm font-body">{report.comment_count || 0}</span>
            </InfoRow>
            {report.assigned_to && (
              <InfoRow label="Asignado a">
                <span className="text-sm font-body text-navy-700">{report.assigned_to}</span>
              </InfoRow>
            )}
          </div>

          {/* Mini mapa Leaflet */}
          <div className="card overflow-hidden">
            <div
              ref={miniMapRef}
              className="w-full"
              style={{ height: 180 }}
            />
            <div className="p-3">
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-display font-semibold text-navy-700 hover:text-navy-900 transition-colors"
              >
                <ExternalLink size={12} /> Ver en OpenStreetMap
              </a>
            </div>
          </div>

          {/* Acciones */}
          {(user?.id === report.user_id || isAuthority) && (
            <div className="card p-4 space-y-2">
              <h3 className="font-display font-bold text-sm text-navy-900 mb-3">Acciones</h3>
              {isAuthority && (
                <Link to={`/admin?report=${id}`} className="btn-secondary w-full justify-center text-xs py-2">
                  Gestionar reporte
                </Link>
              )}
              {(user?.id === report.user_id || user?.role === 'admin') && (
                <button
                  onClick={deleteReport}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-display font-semibold text-red-500 hover:bg-red-50 py-2 rounded-xl transition-colors"
                >
                  <Trash2 size={13} /> Eliminar reporte
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-navy-800/40 font-body">{label}</span>
      {children}
    </div>
  );
}