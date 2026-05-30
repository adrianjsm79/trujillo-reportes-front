import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layers, X, MapPin, ThumbsUp, MessageCircle } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, CategoryBadge } from '../components/Badges';

const TRUJILLO = { lat: -8.1119, lng: -79.0282 };

const STATUS_COLORS = {
  pending:     '#94A3B8',
  in_progress: '#F59E0B',
  resolved:    '#22C55E',
  rejected:    '#EF4444',
};

export default function MapPage() {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersRef   = useRef([]);
  const infoWindowRef = useRef(null);

  const [markers,   setMarkers]   = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter,    setFilter]    = useState({ category: '', status: '' });
  const [loading,   setLoading]   = useState(true);
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps);

  // Esperar a que Google Maps cargue
  useEffect(() => {
    if (window.google?.maps) { setMapsReady(true); return; }
    const interval = setInterval(() => {
      if (window.google?.maps) { setMapsReady(true); clearInterval(interval); }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Cargar categorías
  useEffect(() => {
    api.categories.list().then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  // Cargar markers del API
  useEffect(() => {
    setLoading(true);
    api.reports.map(filter)
      .then(d => setMarkers(d.markers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstance.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: TRUJILLO,
      zoom:   13,
      styles: mapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapsReady]);

  // Pintar markers cuando cambian
  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpiar markers anteriores
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    markers.forEach(r => {
      const color = STATUS_COLORS[r.status] || '#94A3B8';
      const marker = new window.google.maps.Marker({
        position: { lat: r.latitude, lng: r.longitude },
        map: mapInstance.current,
        title: r.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10,
        },
      });

      marker.addListener('click', () => {
        setSelected(r);
        mapInstance.current.panTo({ lat: r.latitude, lng: r.longitude });
      });

      markersRef.current.push(marker);
    });
  }, [markers, mapsReady]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Toolbar */}
      <div className="bg-white border-b border-navy-800/8 px-4 py-3 flex items-center gap-3 flex-wrap z-10 shadow-sm">
        <div className="flex items-center gap-2 text-navy-800/50">
          <Layers size={15} />
          <span className="text-xs font-display font-semibold text-navy-800">Filtros:</span>
        </div>

        <select className="input h-8 text-xs py-0 w-auto"
          value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>

        <select className="input h-8 text-xs py-0 w-auto"
          value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
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
          {loading && <span className="text-xs text-navy-800/40 font-body animate-pulse">Cargando…</span>}
          {!loading && <span className="text-xs text-navy-800/40 font-body">{markers.length} reportes</span>}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mapa */}
        <div ref={mapRef} className="flex-1 h-full" />

        {/* Panel lateral de reporte seleccionado */}
        {selected && (
          <div className="absolute top-4 right-4 w-80 card shadow-hover animate-fade-up z-20 overflow-hidden">
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.title}
                className="w-full h-36 object-cover" />
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-sm text-navy-900 leading-snug flex-1">
                  {selected.title}
                </h3>
                <button onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-navy-800/8 text-navy-800/40 hover:text-navy-800 transition-colors flex-shrink-0">
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
                <span className="flex items-center gap-1"><ThumbsUp size={11} /> {selected.vote_count}</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</span>
              </div>
              <Link to={`/reporte/${selected.id}`}
                className="btn-primary w-full justify-center text-xs py-2">
                Ver detalle completo
              </Link>
            </div>
          </div>
        )}

        {/* Placeholder si Maps no cargó */}
        {!mapsReady && (
          <div className="absolute inset-0 bg-surface flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-navy-800/20 mx-auto mb-3" />
              <p className="font-display font-semibold text-navy-800/60">Cargando mapa…</p>
              <p className="text-xs text-navy-800/40 mt-1 font-body">Verifica que la API Key de Google Maps esté configurada</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilo oscuro para el mapa
const mapStyles = [
  { featureType: 'all',      elementType: 'geometry',       stylers: [{ color: '#f5f3ee' }] },
  { featureType: 'water',    elementType: 'geometry',       stylers: [{ color: '#c8dbe8' }] },
  { featureType: 'road',     elementType: 'geometry',       stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',     elementType: 'geometry.stroke',stylers: [{ color: '#e8e4db' }] },
  { featureType: 'poi.park', elementType: 'geometry',       stylers: [{ color: '#d8edd8' }] },
  { featureType: 'transit',  elementType: 'geometry',       stylers: [{ color: '#eae8e2' }] },
  { featureType: 'all',      elementType: 'labels.text.fill',  stylers: [{ color: '#1B3A6B' }] },
  { featureType: 'all',      elementType: 'labels.text.stroke',stylers: [{ color: '#ffffff' }, { weight: 3 }] },
];