// ============================================================
// PÁGINA DE MAPA
// Leaflet + CartoDB Positron — sin API key, 100% gratuito
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layers, X, MapPin, ThumbsUp } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import {
  useLeafletMap,
  createReportIcon,
  STATUS_COLORS,
  L,
} from '../hooks/useLeafletMap';

const TRUJILLO = [-8.1119, -79.0282];

export default function MapPage() {
  const containerRef = useRef(null);
  const mapRef       = useLeafletMap(containerRef, { center: TRUJILLO, zoom: 13 });
  const markersRef   = useRef([]);

  const [reports,    setReports]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter,     setFilter]     = useState({ category: '', status: '' });
  const [loading,    setLoading]    = useState(true);

  // Cargar categorías una sola vez
  useEffect(() => {
    api.categories.list()
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Cargar markers del API cuando cambian filtros
  useEffect(() => {
    setLoading(true);
    api.reports.map(filter)
      .then(d => setReports(d.markers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  // Pintar markers cuando cambian reportes o mapa está listo
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar markers anteriores
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;

      const color  = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
      const marker = L.marker([r.latitude, r.longitude], {
        icon: createReportIcon(color),
        title: r.title,
      }).addTo(map);

      marker.on('click', () => {
        setSelected(r);
        map.panTo([r.latitude, r.longitude]);
      });

      markersRef.current.push(marker);
    });
  }, [reports, mapRef.current]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-navy-800/8 px-4 py-3 flex items-center gap-3 flex-wrap z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-navy-800/50" />
          <span className="text-xs font-display font-semibold text-navy-800">Filtros:</span>
        </div>

        <select
          className="input h-8 text-xs py-0 w-auto"
          value={filter.category}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <select
          className="input h-8 text-xs py-0 w-auto"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Todos los estados</option>
          <option value="pending">🔘 Pendiente</option>
          <option value="in_progress">🟡 En proceso</option>
          <option value="resolved">🟢 Resuelto</option>
        </select>

        {/* Leyenda */}
        <div className="ml-auto flex items-center gap-3">
          {Object.entries({ pending: 'Pendiente', in_progress: 'En proceso', resolved: 'Resuelto' }).map(([k, label]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[k] }} />
              <span className="text-xs font-body text-navy-800/60 hidden sm:inline">{label}</span>
            </div>
          ))}
          {loading
            ? <span className="text-xs text-navy-800/40 font-body animate-pulse">Cargando…</span>
            : <span className="text-xs text-navy-800/40 font-body">{reports.length} reportes</span>
          }
        </div>
      </div>

      {/* ── Mapa + panel lateral ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Contenedor del mapa Leaflet */}
        <div ref={containerRef} className="flex-1 h-full" />

        {/* Panel lateral: reporte seleccionado */}
        {selected && (
          <div className="absolute top-4 right-4 w-80 card shadow-hover animate-fade-up z-[1000] overflow-hidden">
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt={selected.title}
                className="w-full h-36 object-cover"
              />
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-sm text-navy-900 leading-snug flex-1">
                  {selected.title}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-navy-800/8 text-navy-800/40 hover:text-navy-800 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={selected.status} size="sm" />
                {selected.category_name && (
                  <CategoryBadge icon={selected.category_icon} name={selected.category_name} size="sm" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-navy-800/50 font-body">
                <span className="flex items-center gap-1">
                  <ThumbsUp size={11} /> {selected.vote_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}
                </span>
              </div>

              <Link
                to={`/reporte/${selected.id}`}
                className="btn-primary w-full justify-center text-xs py-2"
              >
                Ver detalle completo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}