import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Menu, X, User, LogOut, LayoutDashboard, FileText, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthority } = useAuth();
  const navigate   = useNavigate();
  const [open, setOpen]       = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setUserMenu(false);
  }

  const navLink = 'font-display font-semibold text-sm transition-colors duration-150';
  const active  = 'text-gold-500';
  const inactive = 'text-white/70 hover:text-white';

  return (
    <nav className="bg-navy-900 shadow-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-md group-hover:bg-gold-400 transition-colors">
              <MapPin size={16} className="text-navy-900" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <span className="font-display font-bold text-white text-base tracking-tight">TrujiReporta</span>
              <span className="block text-white/40 text-[10px] font-body tracking-wide">Plataforma Ciudadana</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/"     className={({ isActive }) => `${navLink} ${isActive ? active : inactive}`}>Reportes</NavLink>
            <NavLink to="/mapa" className={({ isActive }) => `${navLink} ${isActive ? active : inactive}`}>Mapa</NavLink>
            {isAuthority && (
              <NavLink to="/admin" className={({ isActive }) => `${navLink} ${isActive ? active : inactive}`}>Panel Admin</NavLink>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/nuevo" className="btn-gold text-xs py-2 px-4">
                  <Plus size={14} /> Nuevo Reporte
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(v => !v)}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-navy-700 border-2 border-navy-600 flex items-center justify-center">
                      <span className="font-display font-bold text-xs text-gold-400">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-display font-semibold text-sm">{user.username}</span>
                    <ChevronDown size={14} className={`transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-hover border border-navy-800/10 py-1 animate-fade-in">
                      <Link to="/mis-reportes" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-navy-800 hover:bg-surface transition-colors">
                        <FileText size={15} /> Mis reportes
                      </Link>
                      {isAuthority && (
                        <Link to="/admin" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-navy-800 hover:bg-surface transition-colors">
                          <LayoutDashboard size={15} /> Panel Admin
                        </Link>
                      )}
                      <hr className="my-1 border-navy-800/10" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                        <LogOut size={15} /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-xs py-2 px-4 border-white/20 text-white hover:bg-white/10">Ingresar</Link>
                <Link to="/registro" className="btn-gold text-xs py-2 px-4">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(v => !v)} className="md:hidden text-white/80 hover:text-white p-1">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy-950 border-t border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <MobileLink to="/"     onClick={() => setOpen(false)}>Reportes</MobileLink>
            <MobileLink to="/mapa" onClick={() => setOpen(false)}>Mapa</MobileLink>
            {isAuthority && <MobileLink to="/admin" onClick={() => setOpen(false)}>Panel Admin</MobileLink>}
            <div className="pt-3 pb-1 flex flex-col gap-2">
              {user ? (
                <>
                  <MobileLink to="/nuevo"        onClick={() => setOpen(false)}>+ Nuevo Reporte</MobileLink>
                  <MobileLink to="/mis-reportes" onClick={() => setOpen(false)}>Mis Reportes</MobileLink>
                  <button onClick={handleLogout}
                    className="text-left text-red-400 font-display font-semibold text-sm px-3 py-2.5">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setOpen(false)} className="btn-secondary w-full justify-center border-white/20 text-white hover:bg-white/10">Ingresar</Link>
                  <Link to="/registro" onClick={() => setOpen(false)} className="btn-gold w-full justify-center">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink to={to} onClick={onClick}
      className={({ isActive }) =>
        `block font-display font-semibold text-sm px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'text-gold-400 bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`
      }>
      {children}
    </NavLink>
  );
}