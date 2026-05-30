// ============================================================
// PÁGINA DE MAPA
// Leaflet + CartoDB Positron — sin API key, 100% gratuito
// Filtros de visibilidad por estado con chips toggle
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, ThumbsUp, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import {
  useLeafletMap,
  createReportIcon,
  STATUS_COLORS,
  L,
} from '../hooks/useLeafletMap';

const TRUJILLO = [-8.1119, -79.0282];

// Configuración de cada estado: label, color, visible por defecto
const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',   defaultVisible: true  },
  in_progress: { label: 'En proceso',  defaultVisible: true  },
  resolved:    { label: 'Resuelto',    defaultVisible: false },
  rejected:    { label: 'Rechazado',   defaultVisible: false },
};

export default function MapPage() {
  const containerRef = useRef(null);
  const mapRef       = useLeafletMap(containerRef, { center: TRUJILLO, zoom: 13 });
  const markersRef   = useRef([]);       // todos los markers creados
  const markerMapRef = useRef({});       // { reportId: L.marker }

  const [reports,    setReports]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [catFilter,  setCatFilter]  = useState('');
  const [loading,    setLoading]    = useState(true);

  // Visibilidad por estado (togglable)
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(
      Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.defaultVisible])
    )
  );

  // Cargar categorías una sola vez
  useEffect(() => {
    api.categories.list()
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Cargar TODOS los markers (sin filtro de status, filtrado client-side)
  useEffect(() => {
    setLoading(true);
    const params = catFilter ? { category: catFilter } : {};
    api.reports.map(params)
      .then(d => setReports(d.markers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catFilter]);

  // Pintar/actualizar markers cuando cambian reportes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar todos los markers anteriores
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    markerMapRef.current = {};

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;

      const color  = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
      const marker = L.marker([r.latitude, r.longitude], {
        icon:  createReportIcon(color),
        title: r.title,
      }).addTo(map);

      // Visibilidad inicial según toggle
      if (!visible[r.status]) marker.setOpacity(0);

      marker.bindTooltip(r.title, { direction: 'top', offset: [0, -10] });

      marker.on('click', () => {
        if (!visible[r.status]) return; // ignorar click en markers ocultos
        setSelected(r);
        map.panTo([r.latitude, r.longitude], { animate: true });
      });

      markersRef.current.push(marker);
      markerMapRef.current[r.id] = { marker, status: r.status };
    });
  }, [reports, mapRef.current]);

  // Actualizar visibilidad de markers cuando cambia el toggle (sin re-fetch)
  useEffect(() => {
    Object.values(markerMapRef.current).forEach(({ marker, status }) => {
      marker.setOpacity(visible[status] ? 1 : 0);
    });
    // Si el reporte seleccionado ya no es visible, cerrarlo
    if (selected && !visible[selected.status]) setSelected(null);
  }, [visible]);

  function toggleStatus(status) {
    setVisible(v => ({ ...v, [status]: !v[status] }));
  }

  const visibleCount = reports.filter(r => visible[r.status]).length;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-navy-800/8 px-4 py-3 flex items-center gap-3 flex-wrap z-10 shadow-sm">

        {/* Filtro de categoría */}
        <select
          className="input h-8 text-xs py-0 w-auto"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Separador */}
        <div className="w-px h-5 bg-navy-800/15" />

        {/* Chips de visibilidad por estado */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const isOn  = visible[status];
            const color = STATUS_COLORS[status];
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                title={isOn ? `Ocultar ${cfg.label}` : `Mostrar ${cfg.label}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold
                  border transition-all duration-150 select-none
                  ${isOn
                    ? 'border-transparent text-white shadow-sm'
                    : 'bg-white text-navy-800/40 border-navy-800/15'
                  }`}
                style={isOn ? { background: color, borderColor: color } : {}}
              >
                {isOn ? <Eye size={11} /> : <EyeOff size={11} />}
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Contador */}
        <div className="ml-auto text-xs font-body text-navy-800/40">
          {loading
            ? <span className="animate-pulse">Cargando…</span>
            : <span>{visibleCount} de {reports.length} reportes</span>
          }
        </div>
      </div>

      {/* ── Mapa + panel lateral ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Contenedor del mapa Leaflet */}
        <div ref={containerRef} className="flex-1 h-full" />

        {/* Panel lateral: reporte seleccionado */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:w-80 card shadow-hover animate-fade-up z-[1000] overflow-hidden">
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
                  <CategoryBadge name={selected.category_name} size="sm" />
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