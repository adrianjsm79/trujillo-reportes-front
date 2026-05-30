// ============================================================
// useLeaflet — hook compartido para inicializar mapas Leaflet
// Usa CartoDB Positron: tiles limpios, 100% gratuitos, sin API key
// ============================================================
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Colores por estado del reporte
export const STATUS_COLORS = {
  pending:     '#94A3B8',   // slate
  in_progress: '#F59E0B',   // amber
  resolved:    '#22C55E',   // emerald
  rejected:    '#EF4444',   // red
};

// Crea el tile layer de CartoDB Positron (estilo claro y profesional)
export function addTileLayer(map) {
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }
  ).addTo(map);
}

// Ícono de pin personalizado para un reporte
export function createReportIcon(color = '#94A3B8') {
  return L.divIcon({
    html: `
      <div style="
        width:16px; height:16px; border-radius:50%;
        background:${color}; border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      "></div>`,
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
    className:  '',
  });
}

// Ícono de pin de ubicación (para el formulario de crear reporte)
export function createLocationIcon() {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-100%)">
        <div style="
          width:22px; height:22px; border-radius:50%;
          background:#1B3A6B; border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>
        <div style="
          width:2px; height:10px;
          background:#1B3A6B; margin-top:-1px;
        "></div>
      </div>`,
    iconSize:   [22, 32],
    iconAnchor: [11, 32],
    className:  '',
  });
}

// Hook para inicializar un mapa Leaflet en un contenedor
export function useLeafletMap(containerRef, { center, zoom = 13 }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });
    addTileLayer(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return mapRef;
}

export { L };