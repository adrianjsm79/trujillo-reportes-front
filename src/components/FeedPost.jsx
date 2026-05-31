import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle, ThumbsUp, MapPin, Share2, MoreHorizontal,
  User, ChevronLeft, ChevronRight, Play, ExternalLink, Navigation,
  CheckCircle, Copy, Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge, CategoryBadge } from './Badges';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Sub-componente: Carrusel de Media
───────────────────────────────────────────── */
function MediaCarousel({ mediaList, reportId }) {
  const [active, setActive] = useState(0);
  const videoRef = useRef(null);

  if (!mediaList || mediaList.length === 0) return null;

  const isVideo = (url) =>
    url.includes('video/upload') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.mov');

  const prev = (e) => {
    e.preventDefault();
    setActive(a => (a === 0 ? mediaList.length - 1 : a - 1));
  };
  const next = (e) => {
    e.preventDefault();
    setActive(a => (a === mediaList.length - 1 ? 0 : a + 1));
  };

  const current = mediaList[active];

  return (
    <div className="relative bg-black group select-none">
      {/* Slide principal */}
      <div className="relative overflow-hidden" style={{ maxHeight: 480 }}>
        {isVideo(current) ? (
          <video
            ref={videoRef}
            src={current}
            className="w-full max-h-[480px] object-contain bg-black"
            controls
            controlsList="nodownload"
            playsInline
          />
        ) : (
          <Link to={`/reporte/${reportId}`} className="block">
            <img
              src={current}
              alt={`Imagen ${active + 1}`}
              className="w-full max-h-[480px] object-cover hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </Link>
        )}

        {/* Overlay degradado inferior */}
        {!isVideo(current) && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Controles de navegación (solo si hay más de 1) */}
      {mediaList.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {mediaList.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setActive(i); }}
                className={`rounded-full transition-all ${i === active ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm z-10">
            {active + 1} / {mediaList.length}
          </div>
        </>
      )}

      {/* Indicador de video */}
      {isVideo(current) && mediaList.length === 1 && (
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm">
          <Play size={10} className="fill-white" /> Video
        </div>
      )}

      {/* Miniaturas (si hay 2-4 archivos) */}
      {mediaList.length > 1 && mediaList.length <= 4 && (
        <div className="flex gap-1 p-1 bg-black">
          {mediaList.map((url, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setActive(i); }}
              className={`relative flex-1 aspect-square rounded overflow-hidden transition-all ${i === active ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-75'}`}
            >
              {isVideo(url) ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Play size={16} className="text-white fill-white" />
                </div>
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-componente: Placeholder sin imagen
───────────────────────────────────────────── */
function CategoryVisual({ categoryName }) {
  const palettes = {
    'Baches':           { from: '#1e3a5f', to: '#2563eb', emoji: '🛣️' },
    'Alumbrado':        { from: '#78350f', to: '#d97706', emoji: '💡' },
    'Basura':           { from: '#14532d', to: '#16a34a', emoji: '🗑️' },
    'Seguridad':        { from: '#450a0a', to: '#dc2626', emoji: '🔒' },
    'Agua':             { from: '#0c4a6e', to: '#0284c7', emoji: '💧' },
    'Infraestructura':  { from: '#1c1917', to: '#57534e', emoji: '🏗️' },
    'Parques':          { from: '#052e16', to: '#15803d', emoji: '🌳' },
  };
  const p = palettes[categoryName] || { from: '#1e293b', to: '#475569', emoji: '📋' };

  return (
    <div
      className="h-40 flex flex-col items-center justify-center gap-2"
      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
    >
      <span className="text-4xl opacity-60 select-none">{p.emoji}</span>
      <span className="text-white/60 text-xs font-medium uppercase tracking-widest">{categoryName || 'Reporte'}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente principal: FeedPost
───────────────────────────────────────────── */
export default function FeedPost({ report, index = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hasVoted, setHasVoted]           = useState(report.user_voted || false);
  const [voteCount, setVoteCount]         = useState(report.vote_count || 0);
  const [isLiking, setIsLiking]           = useState(false);
  const [showComments, setShowComments]   = useState(false);
  const [comments, setComments]           = useState([]);
  const [newComment, setNewComment]       = useState('');
  const [loadingComments, setLoadComments]= useState(false);
  const [submittingComment, setSubmitting]= useState(false);
  const [commentCount, setCommentCount]   = useState(report.comment_count || 0);
  const [copied, setCopied]               = useState(false);
  const [expanded, setExpanded]           = useState(false);

  const timeAgo = formatDistanceToNow(new Date(report.created_at), { locale: es, addSuffix: true });

  const mediaList = (() => {
    if (Array.isArray(report.media) && report.media.length > 0) return report.media;
    if (report.image_url) return [report.image_url];
    return [];
  })();

  const DESC_LIMIT = 200;
  const isLongDesc = (report.description || '').length > DESC_LIMIT;

  /* ── Votar ── */
  const toggleVote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (hasVoted) {
        await api.votes.unvote(report.id);
        setVoteCount(c => c - 1);
        setHasVoted(false);
      } else {
        await api.votes.vote(report.id);
        setVoteCount(c => c + 1);
        setHasVoted(true);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setIsLiking(false);
    }
  };

  /* ── Comentarios ── */
  const toggleComments = async () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening && comments.length === 0) {
      setLoadComments(true);
      try {
        const data = await api.comments.list(report.id);
        setComments(data.comments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadComments(false);
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmitting(true);
    try {
      const c = await api.comments.create(report.id, { text: newComment });
      setComments(prev => [c, ...prev]);
      setCommentCount(n => n + 1);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Compartir ── */
  const share = async () => {
    const url = `${window.location.origin}/reporte/${report.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: report.title, text: report.description, url });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColors = {
    pending:     'bg-amber-50 border-amber-200 text-amber-700',
    in_progress: 'bg-blue-50 border-blue-200 text-blue-700',
    resolved:    'bg-emerald-50 border-emerald-200 text-emerald-700',
    rejected:    'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <article
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-5 animate-fade-up stagger-${Math.min(index + 1, 5)} hover:shadow-md transition-shadow`}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {report.author_avatar ? (
              <img src={report.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
              {report.is_anonymous ? 'Vecino Anónimo' : (report.author_username || 'Usuario')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{timeAgo}</span>
              {report.district && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <MapPin size={10} />
                    {report.district}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badge de estado inline (top right) */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[report.status] || statusColors.pending}`}>
            {report.status === 'pending' ? 'Pendiente' :
             report.status === 'in_progress' ? 'En proceso' :
             report.status === 'resolved' ? 'Resuelto' : 'Rechazado'}
          </span>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="px-5 pb-3">
        {/* Categoría */}
        {report.category_name && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
              {report.category_name}
            </span>
          </div>
        )}

        {/* Título */}
        <Link to={`/reporte/${report.id}`} className="group block mb-2">
          <h3 className="font-bold text-slate-900 text-[17px] leading-snug group-hover:text-primary-700 transition-colors">
            {report.title}
          </h3>
        </Link>

        {/* Descripción con "Ver más" */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {isLongDesc && !expanded
            ? report.description.slice(0, DESC_LIMIT) + '…'
            : report.description}
        </p>
        {isLongDesc && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary-600 font-semibold mt-1 hover:underline"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>

      {/* ── MULTIMEDIA ── */}
      {mediaList.length > 0 ? (
        <MediaCarousel mediaList={mediaList} reportId={report.id} />
      ) : (
        <CategoryVisual categoryName={report.category_name} />
      )}

      {/* ── STATS BAR ── */}
      <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-100">
        <button
          onClick={toggleVote}
          className="flex items-center gap-1.5 hover:text-slate-600 transition-colors"
        >
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${hasVoted ? 'bg-primary-100' : 'bg-slate-100'}`}>
            <ThumbsUp size={10} className={hasVoted ? 'text-primary-600 fill-primary-600' : 'text-slate-400'} />
          </span>
          <span>{voteCount} {voteCount === 1 ? 'apoyo' : 'apoyos'}</span>
        </button>
        <button onClick={toggleComments} className="hover:text-slate-600 transition-colors">
          {commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}
        </button>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
        {/* Apoyar */}
        <button
          onClick={toggleVote}
          disabled={isLiking}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
            ${hasVoted
              ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
          <ThumbsUp size={15} className={hasVoted ? 'fill-current' : ''} />
          <span className="hidden xs:inline">Apoyar</span>
        </button>

        {/* Comentar */}
        <button
          onClick={toggleComments}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
            ${showComments
              ? 'text-primary-600 bg-primary-50'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
          <MessageCircle size={15} className={showComments ? 'fill-primary-100 stroke-primary-600' : ''} />
          <span className="hidden xs:inline">Comentar</span>
        </button>

        {/* Ver en Mapa */}
        {report.latitude && report.longitude ? (
          <Link
            to={`/mapa?lat=${report.latitude}&lng=${report.longitude}&id=${report.id}`}
            className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Navigation size={15} />
            <span className="hidden xs:inline">En mapa</span>
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-300 cursor-not-allowed">
            <Navigation size={15} />
            <span className="hidden xs:inline">Mapa</span>
          </div>
        )}

        {/* Compartir */}
        <button
          onClick={share}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
            ${copied
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          <span className="hidden xs:inline">{copied ? 'Copiado' : 'Compartir'}</span>
        </button>
      </div>

      {/* ── LINK VER DETALLE ── */}
      <div className="px-5 py-2">
        <Link
          to={`/reporte/${report.id}`}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-semibold hover:underline w-fit"
        >
          <ExternalLink size={12} />
          Ver reporte completo e historial
        </Link>
      </div>

      {/* ── COMENTARIOS INLINE ── */}
      {showComments && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          {/* Input de nuevo comentario */}
          {user ? (
            <form onSubmit={submitComment} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0">
                {user.avatar_url
                  ? <img src={user.avatar_url} className="w-full h-full object-cover rounded-full" />
                  : <User size={14} className="text-white" />
                }
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-400 transition-all">
                <input
                  type="text"
                  placeholder="Agrega un comentario..."
                  className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="text-primary-600 hover:text-primary-700 disabled:text-slate-300 transition-colors flex-shrink-0"
                >
                  <CheckCircle size={18} className={newComment.trim() ? 'fill-primary-100' : ''} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesión</Link>
                {' '}o{' '}
                <Link to="/registro" className="text-primary-600 font-semibold hover:underline">regístrate</Link>
                {' '}para comentar.
              </p>
            </div>
          )}

          {/* Lista de comentarios */}
          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 bg-slate-200 rounded-2xl h-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {c.author_avatar
                      ? <img src={c.author_avatar} className="w-full h-full object-cover" />
                      : <User size={14} className="text-white" />
                    }
                  </div>
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                    <p className="font-semibold text-slate-800 text-xs mb-0.5">
                      {c.is_anonymous ? 'Vecino Anónimo' : (c.author_username || 'Usuario')}
                    </p>
                    <p className="text-slate-700 text-sm">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-3">
                  Sé el primero en comentar sobre este reporte.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
