import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, ThumbsUp, ArrowLeft, User, Trash2,
  ExternalLink, Calendar, Eye, MessageSquare, Building2,
  Share2, Check, ChevronLeft, ChevronRight, Play,
  AlertCircle, CheckCircle2, Loader2, XCircle,
  Navigation, Flame, Camera, Phone
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import CommentSection from '../components/CommentSection';
import ActivityTimeline from '../components/ActivityTimeline';
import { createReportIcon, STATUS_COLORS, addTileLayer } from '../hooks/useLeafletMap';
import { getCategoryIcon } from '../utils/categoryIcons';

const URGENCY_THRESHOLD = 5;

/* ─────────────────────────────────────────────
   Carrusel de media (reutilizado de FeedPost)
───────────────────────────────────────────── */
function DetailMediaCarousel({ mediaList, title }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);

  if (!mediaList || mediaList.length === 0) return null;

  const isVideo = (url) =>
    url.includes('video/upload') ||
    url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');

  const goTo = (i) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: i * container.offsetWidth, behavior: 'smooth' });
    setActive(i);
  };

  const onScroll = () => {
    const c = scrollRef.current;
    if (!c) return;
    const idx = Math.round(c.scrollLeft / c.offsetWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg">
      {/* Tira scroll-snap */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxHeight: 560,
        }}
      >
        {mediaList.map((url, i) => (
          <div
            key={i}
            style={{ scrollSnapAlign: 'start', flexShrink: 0, width: '100%', maxHeight: 560 }}
          >
            {isVideo(url) ? (
              <video
                src={url}
                className="w-full bg-black"
                style={{ maxHeight: 560, objectFit: 'contain' }}
                controls controlsList="nodownload" playsInline
              />
            ) : (
              <img
                src={url}
                alt={`${title} — imagen ${i + 1}`}
                className="w-full"
                style={{ maxHeight: 560, objectFit: 'cover' }}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>

      {/* Contador */}
      {mediaList.length > 1 && (
        <div className="absolute top-3 right-3 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-20"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          {active + 1} / {mediaList.length}
        </div>
      )}

      {/* Badge video */}
      {isVideo(mediaList[active]) && (
        <div className="absolute top-3 left-3 text-white text-xs flex items-center gap-1 px-2 py-1 rounded-full z-20"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <Play size={9} className="fill-white" /> Video
        </div>
      )}

      {/* Dots */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-4 flex gap-1.5 z-20" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          {mediaList.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              style={{
                borderRadius: '999px', transition: 'all 0.2s', border: 'none',
                cursor: 'pointer', padding: 0,
                width: i === active ? 20 : 6, height: 6,
                background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* Flechas */}
      {mediaList.length > 1 && active > 0 && (
        <button onClick={() => goTo(active - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 text-white rounded-full flex items-center justify-center z-20 shadow-lg"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {mediaList.length > 1 && active < mediaList.length - 1 && (
        <button onClick={() => goTo(active + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 text-white rounded-full flex items-center justify-center z-20 shadow-lg"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Timeline de estado del reporte
───────────────────────────────────────────── */
function StatusTimeline({ status }) {
  const steps = [
    { key: 'pending',     label: 'Reportado',      icon: AlertCircle,    color: 'text-amber-500',   bg: 'bg-amber-50   border-amber-200' },
    { key: 'in_progress', label: 'En atención',     icon: Loader2,        color: 'text-blue-500',    bg: 'bg-blue-50    border-blue-200' },
    { key: 'resolved',    label: 'Resuelto',        icon: CheckCircle2,   color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  const order = { pending: 0, in_progress: 1, resolved: 2, rejected: -1 };
  const currentIdx = order[status] ?? 0;

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
        <XCircle size={16} /> Este reporte fue rechazado
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done    = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-1 flex-1 ${current ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${current || done ? step.bg : 'bg-slate-50 border-slate-200'}`}>
                <Icon size={15} className={current || done ? step.color : 'text-slate-300'} />
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight ${current ? step.color.replace('text-', 'text-') : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${i < currentIdx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente principal: ReportDetail
───────────────────────────────────────────── */
export default function ReportDetail() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const { user, isAuthority }   = useAuth();

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted,   setVoted]   = useState(false);
  const [votes,   setVotes]   = useState(0);
  const [voting,  setVoting]  = useState(false);
  const [copied,  setCopied]  = useState(false);

  const miniMapRef  = useRef(null);
  const miniMapInst = useRef(null);

  useEffect(() => {
    api.reports.get(id)
      .then(d => { setReport(d); setVoted(d.user_voted); setVotes(d.vote_count); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  // Mini mapa Leaflet en sidebar
  useEffect(() => {
    if (!report?.latitude || !miniMapRef.current || miniMapInst.current) return;
    if (!window.L) return;

    miniMapInst.current = window.L.map(miniMapRef.current, {
      center: [report.latitude, report.longitude], zoom: 15,
      zoomControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false,
    });

    window.L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 20 }
    ).addTo(miniMapInst.current);

    window.L.marker(
      [report.latitude, report.longitude],
      { icon: createReportIcon(STATUS_COLORS[report.status] || '#94A3B8') }
    ).addTo(miniMapInst.current);

    return () => { miniMapInst.current?.remove(); miniMapInst.current = null; };
  }, [report]);

  async function toggleVote() {
    if (!user) { navigate('/login'); return; }
    if (voting) return;
    setVoting(true);
    try {
      if (voted) { await api.votes.unvote(id); setVoted(false); setVotes(v => v - 1); }
      else       { await api.votes.vote(id);   setVoted(true);  setVotes(v => v + 1); }
    } catch (err) { alert(err.message); }
    finally { setVoting(false); }
  }

  async function deleteReport() {
    if (!confirm('¿Eliminar este reporte permanentemente?')) return;
    try { await api.reports.delete(id); navigate('/'); }
    catch (err) { alert(err.message); }
  }

  const shareReport = async () => {
    const url = window.location.href;

    // Función de copia robusta: funciona en HTTP, HTTPS y todos los navegadores
    const copyToClipboard = (text) => {
      // Intento 1: Clipboard API moderna (requiere HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
          .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
          .catch(() => copyViaExecCommand(text));
      }
      // Intento 2: execCommand clásico (funciona en HTTP también)
      copyViaExecCommand(text);
    };

    const copyViaExecCommand = (text) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        // Último recurso: mostrar la URL para que el usuario la copie manualmente
        prompt('Copia este enlace:', text);
      } finally {
        document.body.removeChild(textarea);
      }
    };

    // navigator.share (solo móvil/HTTPS)
    if (navigator.share) {
      try {
        await navigator.share({ title: report.title, text: report.description, url });
        return; // Si share funcionó, no necesitamos copiar
      } catch (_) {
        // El usuario canceló el share nativo — fallback a copiar
      }
    }

    copyToClipboard(url);
  };


  // ─── Loading skeleton ───
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-5">
      <div className="h-5 bg-slate-200 rounded-full w-28" />
      <div className="h-72 bg-slate-200 rounded-2xl" />
      <div className="h-7 bg-slate-200 rounded-full w-2/3" />
      <div className="h-4 bg-slate-200 rounded-full w-1/3" />
    </div>
  );
  if (!report) return null;

  // Construir lista de media
  const mediaList = Array.isArray(report.media) && report.media.length > 0
    ? report.media
    : report.image_url ? [report.image_url] : [];

  const osmUrl = report.latitude
    ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=16/${report.latitude}/${report.longitude}`
    : null;

  // Fecha de creación formateada (muestra AMBAS: relativa y absoluta)
  const createdDate = new Date(report.created_at);
  const relativeTime = formatDistanceToNow(createdDate, { locale: es, addSuffix: true });
  const absoluteDate = format(createdDate, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Navegación superior */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={15} /> Volver al feed
          </Link>
          <button onClick={shareReport}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all ${copied ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300'}`}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copiado' : 'Compartir'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Columna principal ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Carrusel de media */}
            {mediaList.length > 0
              ? <DetailMediaCarousel mediaList={mediaList} title={report.title} />
              : (
                <div className="rounded-2xl overflow-hidden h-48 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                  <div className="text-center">
                    <div className="text-5xl mb-2 opacity-50">{getCategoryIcon(report.category_name, 48)}</div>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{report.category_name || 'Reporte'}</p>
                  </div>
                </div>
              )
            }

            {/* Cabecera del reporte */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={report.status} />
                {report.category_name && <CategoryBadge name={report.category_name} />}
              </div>

              {/* Título */}
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 leading-tight mb-4">
                {report.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  {report.is_anonymous ? 'Vecino Anónimo' : (report.author_username || 'Usuario')}
                </span>
                {/* ← AQUÍ: mostramos la fecha absoluta con tooltip de relativa */}
                <span className="flex items-center gap-1.5" title={`Hace ${relativeTime.replace('hace ', '')}`}>
                  <Calendar size={13} />
                  {absoluteDate}
                </span>
                {report.district && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {report.district}{report.address && ` · ${report.address}`}
                  </span>
                )}
              </div>

              {/* Métricas rápidas */}
              <div className="flex items-center gap-4 pt-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Eye size={13} /> {report.view_count || 0} vistas</span>
                <span className="flex items-center gap-1"><MessageSquare size={13} /> {report.comment_count || 0} comentarios</span>
                <span className="flex items-center gap-1"><ThumbsUp size={13} /> {votes} apoyos</span>
                {votes >= URGENCY_THRESHOLD && (
                  <span className="ml-auto flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <Flame size={11} className="fill-red-500" /> URGENTE
                  </span>
                )}
              </div>
            </div>

            {/* Timeline de progreso */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-slate-700 mb-4">Estado del reporte</h2>
              <StatusTimeline status={report.status} />
              {report.status === 'pending' && (
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Pendiente de revisión por la municipalidad. Tu apoyo ayuda a priorizar.
                </p>
              )}
              {report.status === 'in_progress' && (
                <p className="text-xs text-blue-500 mt-3 text-center font-medium">
                  Las autoridades están atendiendo este problema.
                </p>
              )}
              {report.status === 'resolved' && (
                <p className="text-xs text-emerald-600 mt-3 text-center font-medium">
                  ¡Este problema fue resuelto gracias a los reportes ciudadanos!
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary-500 rounded-full inline-block" />
                Descripción del problema
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                {report.description}
              </p>
            </div>

            {/* Respuesta oficial */}
            {report.official_response && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-sm border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Respuesta Oficial</p>
                    {report.assigned_to && (
                      <p className="text-xs text-slate-400">{report.assigned_to}</p>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{report.official_response}</p>
                {report.resolved_at && (
                  <p className="text-slate-500 text-xs mt-4 flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    Resuelto el {format(new Date(report.resolved_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                )}
              </div>
            )}

            {/* ── Galería de evidencia de resolución ── */}
            {report.resolution_media && report.resolution_media.length > 0 && (
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Camera size={15} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 text-sm">Evidencia de resolución</h2>
                    <p className="text-xs text-emerald-600">Fotos del trabajo realizado por la municipalidad</p>
                  </div>
                </div>
                <div className={`grid gap-2 ${
                  report.resolution_media.length === 1 ? 'grid-cols-1' :
                  report.resolution_media.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {report.resolution_media.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
                      <img src={url} alt={`Evidencia ${i + 1}`}
                        className="w-full h-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Timeline de actividad ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-4 bg-primary-500 rounded-full inline-block" />
                <h2 className="font-semibold text-slate-800 text-sm">Historial de actividad</h2>
              </div>
              <ActivityTimeline
                reportId={id}
                createdAt={report.created_at}
                assignedTo={report.assigned_to}
              />
            </div>

            {/* Comentarios */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <CommentSection reportId={id} />
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-4">

            {/* Botón Apoyar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
              <p className="text-xs text-slate-500 mb-3 font-medium">¿Este problema te afecta?</p>
              <button
                onClick={toggleVote}
                disabled={voting}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  voted
                    ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp size={16} className={voted ? 'fill-white' : ''} />
                {voted ? 'Apoyando' : 'Apoyar'} · {votes}
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                {votes} vecino{votes !== 1 ? 's' : ''} apoya{votes === 1 ? '' : 'n'} este reporte
              </p>
            </div>

            {/* Info del reporte */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm text-slate-800">Información</h3>
              <InfoRow label="Estado"><StatusBadge status={report.status} size="sm" /></InfoRow>
              <InfoRow label="Categoría">
                <span className="text-xs font-medium flex items-center gap-1 text-slate-600">
                  {getCategoryIcon(report.category_name || 'default', 13)} {report.category_name || '—'}
                </span>
              </InfoRow>
              <InfoRow label="Distrito">
                <span className="text-xs text-slate-600">{report.district || 'Trujillo'}</span>
              </InfoRow>
              <InfoRow label="Publicado">
                {/* Fecha exacta en sidebar */}
                <span className="text-xs text-slate-500" title={absoluteDate}>
                  {relativeTime}
                </span>
              </InfoRow>
              <InfoRow label="Vistas">
                <span className="text-xs text-slate-600">{report.view_count || 0}</span>
              </InfoRow>
              {report.assigned_to && (
                <InfoRow label="Área responsable">
                  <span className="text-xs text-primary-700 font-medium text-right max-w-[140px] leading-tight">{report.assigned_to}</span>
                </InfoRow>
              )}
            </div>

            {/* Mini mapa */}
            {report.latitude && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div ref={miniMapRef} style={{ height: 180 }} />
                <div className="p-3 flex gap-2">
                  <a href={osmUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <ExternalLink size={11} /> OpenStreetMap
                  </a>
                  <Link
                    to={`/mapa?lat=${report.latitude}&lng=${report.longitude}&id=${report.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    <Navigation size={11} /> Ver en mapa
                  </Link>
                </div>
              </div>
            )}

            {/* Acciones de administración */}
            {(user?.id === report.user_id || isAuthority) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <h3 className="font-semibold text-sm text-slate-800 mb-3">Acciones</h3>
                {isAuthority && (
                  <Link to={`/admin?report=${id}`}
                    className="btn-secondary w-full justify-center text-xs py-2">
                    Gestionar reporte
                  </Link>
                )}
                {(user?.id === report.user_id || user?.role === 'admin') && (
                  <button onClick={deleteReport}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 py-2 rounded-xl transition-colors">
                    <Trash2 size={13} /> Eliminar reporte
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}