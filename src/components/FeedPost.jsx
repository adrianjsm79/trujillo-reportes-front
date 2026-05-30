import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, MapPin, Share2, MoreHorizontal, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge, CategoryBadge } from './Badges';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function FeedPost({ report, index = 0 }) {
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(report.user_voted || false);
  const [voteCount, setVoteCount] = useState(report.vote_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(report.created_at), { locale: es, addSuffix: true });

  // Manejar el "Apoyar"
  const toggleVote = async () => {
    if (!user) {
      alert("Inicia sesión para apoyar este reporte");
      return;
    }
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
      alert(e.message);
    } finally {
      setIsLiking(false);
    }
  };

  // Manejar comentarios inline
  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0 && report.comment_count > 0) {
      setLoadingComments(true);
      try {
        const data = await api.comments.list(report.id);
        setComments(data.comments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const c = await api.comments.create(report.id, { text: newComment });
      setComments([c, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.description,
        url: window.location.origin + `/reporte/${report.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/reporte/${report.id}`);
      alert("Enlace copiado al portapapeles");
    }
  };

  const mediaList = report.media || [];
  
  return (
    <article className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-fade-up stagger-${Math.min(index + 1, 5)}`}>
      {/* HEADER: Usuario y tiempo */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {report.author_avatar ? (
              <img src={report.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-display font-semibold text-slate-800 text-sm">
              {report.is_anonymous ? 'Vecino Anónimo' : report.author_username || 'Usuario'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-body">
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={10} /> {report.district || 'Trujillo'}</span>
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* CONTENIDO: Texto */}
      <div className="px-4 pb-3">
        <h3 className="font-display font-bold text-slate-900 text-lg mb-1 leading-snug">
          {report.title}
        </h3>
        <p className="text-slate-700 font-body text-sm leading-relaxed whitespace-pre-wrap">
          {report.description}
        </p>
      </div>

      {/* ETIQUETAS */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {report.category_name && <CategoryBadge name={report.category_name} size="sm" />}
        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* MULTIMEDIA: Mosaico o Carrusel */}
      {mediaList.length > 0 && (
        <div className={`grid gap-1 bg-slate-900 ${mediaList.length === 1 ? 'grid-cols-1' : mediaList.length === 2 ? 'grid-cols-2' : mediaList.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {mediaList.map((url, i) => {
            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video/upload');
            // Si hay 3 items, el primero ocupa toda la fila superior
            const isFeatured = mediaList.length === 3 && i === 0;
            return (
              <div key={i} className={`relative bg-slate-100 ${isFeatured ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                {isVideo ? (
                  <video src={url} className="w-full h-full object-cover" controls controlsList="nodownload" />
                ) : (
                  <Link to={`/reporte/${report.id}`}>
                    <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ESTADÍSTICAS MENORES */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-body border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center"><ThumbsUp size={10} /></span>
          {voteCount} apoyos
        </div>
        <div>
          {report.comment_count || 0} comentarios
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="px-2 py-1 flex items-center justify-between">
        <button 
          onClick={toggleVote}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${hasVoted ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ThumbsUp size={18} className={hasVoted ? "fill-current" : ""} /> 
          <span>Apoyar</span>
        </button>
        <button 
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <MessageCircle size={18} /> 
          <span>Comentar</span>
        </button>
        <button 
          onClick={share}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Share2 size={18} /> 
          <span>Compartir</span>
        </button>
      </div>

      {/* SECCIÓN DE COMENTARIOS INLINE */}
      {showComments && (
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          {user ? (
            <form onSubmit={submitComment} className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Escribe un comentario..." 
                className="input py-2 text-sm flex-1"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!newComment.trim()} className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
                Enviar
              </button>
            </form>
          ) : (
            <div className="text-sm text-slate-500 mb-4 text-center bg-white p-3 rounded-lg border border-slate-200">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesión</Link> para comentar.
            </div>
          )}

          {loadingComments ? (
            <div className="text-center text-sm text-slate-400 py-2">Cargando comentarios...</div>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {c.author_avatar ? <img src={c.author_avatar} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-800">{c.author_username}</p>
                    <p className="text-slate-700">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-2">Sé el primero en comentar.</p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
