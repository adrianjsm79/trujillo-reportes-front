import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Trash2, ShieldCheck, AtSign } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const AREAS = [
  '@Serenazgo', '@ObrasPublicas', '@MedioAmbiente',
  '@SEDALIB', '@Hidrandina', '@Transporte', '@Municipalidad'
];

// Resalta @menciones en texto plano
function renderWithMentions(text) {
  if (!text) return null;
  const parts = text.split(/(@[A-Za-zá-úÁ-ÚñÑ]+)/g);
  return parts.map((part, i) =>
    AREAS.some(a => a.toLowerCase() === part.toLowerCase())
      ? <span key={i} className="text-primary-600 font-semibold bg-primary-50 rounded px-1">{part}</span>
      : part
  );
}

export default function CommentSection({ reportId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    api.comments.list(reportId)
      .then(d => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reportId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const c = await api.comments.create(reportId, { content: text.trim() });
      setComments(prev => [...prev, c]);
      setText('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  async function deleteComment(id) {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await api.comments.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <h3 className="font-display font-bold text-lg text-navy-900">
        Comentarios <span className="text-navy-800/40 font-semibold text-base">({comments.length})</span>
      </h3>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-16 bg-navy-800/5 rounded-xl animate-pulse" />)}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-navy-800/50 font-body py-4">Sé el primero en comentar.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id}
              className={`rounded-xl p-4 ${c.is_official
                ? 'bg-navy-800 text-white'
                : 'bg-white border border-navy-800/8'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold
                    ${c.is_official ? 'bg-gold-500 text-navy-900' : 'bg-navy-800/10 text-navy-700'}`}>
                    {c.author_username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className={`text-xs font-display font-semibold ${c.is_official ? 'text-gold-400' : 'text-navy-800'}`}>
                      {c.author_username || 'Usuario'}
                    </span>
                    {c.is_official && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-display font-semibold text-gold-300">
                        <ShieldCheck size={10} /> Respuesta oficial
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-body ${c.is_official ? 'text-white/50' : 'text-navy-800/40'}`}>
                    {formatDistanceToNow(new Date(c.created_at), { locale: es, addSuffix: true })}
                  </span>
                  {(user?.id === c.user_id || user?.role === 'admin') && (
                    <button onClick={() => deleteComment(c.id)}
                      className={`p-1 rounded hover:bg-red-500/10 transition-colors ${c.is_official ? 'text-white/40 hover:text-red-300' : 'text-navy-800/30 hover:text-red-500'}`}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className={`text-sm font-body leading-relaxed ${c.is_official ? 'text-white/90' : 'text-navy-800/80'}`}>
                {renderWithMentions(c.content)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {user ? (
        <div className="pt-2 space-y-2">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <AtSign size={10} /> Puedes mencionar áreas: {AREAS.slice(0, 4).join(', ')}...
          </p>
          <form onSubmit={submit} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Escribe un comentario... (@Serenazgo, @ObrasPublicas)"
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={1000}
            />
            <button type="submit" disabled={!text.trim() || sending} className="btn-primary px-4 disabled:opacity-50">
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-navy-800/50 font-body">
          <a href="/login" className="text-navy-800 font-semibold underline underline-offset-2">Inicia sesión</a> para comentar.
        </p>
      )}
    </div>
  );
}