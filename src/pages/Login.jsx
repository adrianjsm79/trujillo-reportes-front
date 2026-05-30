import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, MapPin, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-1 bg-navy-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-navy-700/60 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-sm text-center">
          <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapPin size={28} className="text-navy-900" strokeWidth={2.5} />
          </div>
          <h2 className="font-display font-bold text-white text-3xl mb-4">
            Tu voz, la voz de Trujillo
          </h2>
          <p className="text-white/50 font-body leading-relaxed">
            Reporta baches, alumbrado, basura y más. Juntos construimos una ciudad mejor.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '🚧', label: 'Infraestructura' },
              { icon: '💡', label: 'Alumbrado' },
              { icon: '🗑️', label: 'Limpieza' },
              { icon: '🚨', label: 'Seguridad' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/70 text-sm font-display font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
                <MapPin size={15} className="text-gold-400" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-navy-900 text-base">TrujiReporta</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">Bienvenido de vuelta</h1>
            <p className="text-sm text-navy-800/50 font-body">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Contraseña</label>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-800/40 hover:text-navy-800 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} /> Ingresar
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-navy-800/50 font-body">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="font-display font-semibold text-navy-800 hover:text-navy-600 underline underline-offset-2">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-navy-800/8 text-center">
            <p className="text-xs text-navy-800/40 font-body">
              También puedes{' '}
              <Link to="/nuevo" className="text-navy-700 font-semibold underline underline-offset-2">
                reportar sin cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}