import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DISTRICTS = [
  'Trujillo','El Porvenir','Florencia de Mora','Huanchaco',
  'La Esperanza','Laredo','Moche','Salaverry','Simbal','Victor Larco Herrera',
];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', district: 'Trujillo',
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Mínimo 3 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email    = 'Email inválido';
    if (form.password.length < 6)                          e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword)            e.confirmPassword = 'Las contraseñas no coinciden';
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await register({ username: form.username, email: form.email, password: form.password, district: form.district });
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); }

  const pwdStrength = form.password.length >= 8 ? 'Fuerte' : form.password.length >= 6 ? 'Media' : form.password.length > 0 ? 'Débil' : '';
  const pwdColor    = pwdStrength === 'Fuerte' ? 'text-emerald-600' : pwdStrength === 'Media' ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <MapPin size={24} className="text-gold-400" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-navy-800/50 font-body">Únete a la comunidad ciudadana de Trujillo</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '📍', label: 'Sigue tus reportes' },
            { icon: '🔔', label: 'Recibe actualizaciones' },
            { icon: '👍', label: 'Apoya a vecinos' },
          ].map(b => (
            <div key={b.label} className="bg-white border border-navy-800/8 rounded-xl p-3 text-center shadow-card">
              <span className="text-xl block mb-1">{b.icon}</span>
              <span className="text-[11px] font-display font-semibold text-navy-700">{b.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl animate-fade-in">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Usuario <span className="text-red-400">*</span></label>
              <input className={`input ${errors.username ? 'border-red-400' : ''}`}
                placeholder="vecino123"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                autoComplete="username" autoFocus
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="label">Distrito</label>
              <select className="input" value={form.district} onChange={e => set('district', e.target.value)}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Correo electrónico <span className="text-red-400">*</span></label>
            <input type="email" className={`input ${errors.email ? 'border-red-400' : ''}`}
              placeholder="tu@correo.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Contraseña <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'}
                className={`input pr-11 ${errors.password ? 'border-red-400' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-800/40 hover:text-navy-800 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <p className={`text-xs mt-1 font-body ${pwdColor}`}>Contraseña {pwdStrength}</p>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="label">Confirmar contraseña <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'}
                className={`input pr-11 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                autoComplete="new-password"
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold w-full justify-center py-3 disabled:opacity-60 mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando cuenta…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={16} /> Crear cuenta gratis
              </span>
            )}
          </button>

          <p className="text-[11px] text-navy-800/40 font-body text-center leading-relaxed">
            Al registrarte aceptas el uso de tus datos para el funcionamiento de la plataforma ciudadana.
          </p>
        </form>

        <p className="text-sm text-navy-800/50 font-body text-center mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-display font-semibold text-navy-800 underline underline-offset-2 hover:text-navy-600">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}