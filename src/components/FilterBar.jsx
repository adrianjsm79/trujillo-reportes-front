import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../api/client';

const STATUSES = [
  { value: '',            label: 'Todos' },
  { value: 'pending',     label: 'Pendiente' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'resolved',    label: 'Resuelto' },
];

const SORTS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'popular',    label: 'Más votados' },
  { value: 'unresolved', label: 'Sin resolver' },
];

const DISTRICTS = [
  '', 'Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco',
  'La Esperanza', 'Laredo', 'Moche', 'Salaverry', 'Simbal', 'Victor Larco Herrera',
];

export default function FilterBar({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.categories.list().then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  function set(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  function clear() {
    onChange({ page: 1, limit: 12 });
  }

  const hasFilters = filters.category || filters.status || filters.district || filters.search;

  return (
    <div className="space-y-3">
      {/* Barra principal */}
      <div className="flex gap-2">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-800/40" />
          <input
            className="input pl-10 pr-4 h-10"
            placeholder="Buscar reportes..."
            value={filters.search || ''}
            onChange={e => set('search', e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`btn-secondary h-10 px-3.5 ${showFilters ? 'bg-navy-800/8 border-navy-800/30' : ''}`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filtros</span>
          {hasFilters && <span className="w-2 h-2 rounded-full bg-gold-500" />}
        </button>
        {hasFilters && (
          <button onClick={clear} className="btn-secondary h-10 px-3 text-red-500 border-red-200 hover:bg-red-50">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-navy-800/8 w-fit">
        {SORTS.map(s => (
          <button key={s.value}
            onClick={() => set('sort', s.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-150
              ${(filters.sort || 'recent') === s.value
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-navy-700/60 hover:text-navy-800'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white border border-navy-800/8 rounded-2xl p-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            {/* Estado */}
            <div>
              <label className="label">Estado</label>
              <select className="input" value={filters.status || ''} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* Distrito */}
            <div>
              <label className="label">Distrito</label>
              <select className="input" value={filters.district || ''} onChange={e => set('district', e.target.value)}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d || 'Todos los distritos'}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}