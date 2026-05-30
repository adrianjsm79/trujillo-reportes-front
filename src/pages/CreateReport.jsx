import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Eye, EyeOff, Info, LocateFixed } from 'lucide-react';
import { api } from '../api/client';
import { useLeafletMap, createLocationIcon, L } from '../hooks/useLeafletMap';
import { getCategoryIcon } from '../utils/categoryIcons';

const DISTRICTS = [
  'Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco',
  'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 
  'Simbal', 'Victor Larco Herrera'
];

const TRUJILLO = [-8.1119, -79.0282];

export default function CreateReport() {
  const navigate     = useNavigate();
  const containerRef = useRef(null);
  const mapRef       = useLeafletMap(containerRef, { center: TRUJILLO, zoom: 14 });
  const markerRef    = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    district: 'Trujillo', address: '',
    latitude: null, longitude: null, is_anonymous: false,
  });
  const [files,        setFiles]       = useState([]);
  const [previews,     setPreviews]    = useState([]);
  const [categories,   setCategs]      = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [isLocating,   setIsLocating]  = useState(false);
  const [errors,       setErrors]      = useState({});
  const [step,         setStep]        = useState(1);
  const [imageError,   setImageError]  = useState('');

  useEffect(() => {
    api.categories.list().then(d => setCategs(d.categories || [])).catch(() => {});
  }, []);

  // Cuando el usuario llega al paso 2, forzar repintado del mapa
  // (el contenedor estaba oculto y Leaflet no conocía su tamaño real)
  useEffect(() => {
    if (step !== 2) return;
    const map = mapRef.current;
    if (!map) return;

    setTimeout(() => map.invalidateSize(), 50);

    const onClick = (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: createLocationIcon(),
        }).addTo(map);
      }

      setForm(f => ({ ...f, latitude: lat, longitude: lng }));
    };

    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [step]);

  function handleFiles(e) {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    
    // Check total limit (max 4 files)
    if (files.length + selected.length > 4) {
      alert('Puedes subir un máximo de 4 archivos');
      return;
    }

    setFiles(prev => [...prev, ...selected]);
    
    const newPreviews = selected.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image'
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)         e.title       = 'Mínimo 5 caracteres';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Mínimo 10 caracteres';
    if (!form.category_id)                                   e.category_id = 'Selecciona una categoría';
    return e;
  }

  function getUserLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setForm(f => ({ ...f, latitude, longitude }));
        
        const map = mapRef.current;
        if (map) {
          map.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude], {
              icon: createLocationIcon(),
            }).addTo(map);
          }
        }
      },
      (err) => {
        setIsLocating(false);
        alert('No se pudo obtener tu ubicación: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit() {
    if (!form.latitude || !form.longitude) {
      alert('Por favor marca la ubicación del problema en el mapa');
      setStep(2);
      return;
    }
    setLoading(true);
    setImageError('');
    try {
      const report = await api.reports.create(form);
      if (files.length > 0) {
        try {
          await api.reports.uploadMedia(report.id, files);
        } catch (imgErr) {
          console.error('Error subiendo multimedia:', imgErr.message);
          // El reporte ya fue creado, navegamos pero mostramos el error
          setImageError(imgErr.message);
          setLoading(false);
          navigate(`/reporte/${report.id}`);
          return;
        }
      }
      navigate(`/reporte/${report.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step === 1) {
      const e = validate();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
    }
    setStep(s => s + 1);
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">Nuevo Reporte</h1>
        <p className="text-sm text-navy-800/60 font-body">
          Reporta un problema en tu comunidad. Puede ser anónimo.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[['1','Información'],['2','Ubicación'],['3','Evidencias']].map(([n, label], i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all
                ${step === i+1 ? 'bg-primary-600 text-white' : step > i+1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
              {step > i + 1 ? '✓' : n}
            </button>
            <span className={`text-xs font-display font-semibold hidden sm:block
              ${step === i+1 ? 'text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < 2 && (
              <div className={`flex-1 h-px ${step > i+1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-5">

        {/* ── PASO 1: Info ─────────────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <label className="label">Título <span className="text-red-500">*</span></label>
              <input
                className={`input ${errors.title ? 'border-red-400' : ''}`}
                placeholder="Ej: Bache peligroso en Av. España"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="label">Categoría <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => set('category_id', c.id.toString())}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1
                      ${form.category_id === c.id.toString()
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                    <div className="mb-1">{getCategoryIcon(c.name, 24)}</div>
                    <div className="text-xs font-display font-medium leading-tight">{c.name}</div>
                  </button>
                ))}
              </div>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
            </div>

            <div>
              <label className="label">Descripción <span className="text-red-500">*</span></label>
              <textarea
                className={`input min-h-28 resize-y ${errors.description ? 'border-red-400' : ''}`}
                placeholder="Describe el problema: desde cuándo existe, qué tan grave es, cómo afecta a la comunidad..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                maxLength={2000}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/2000</p>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Distrito</label>
                <select className="input" value={form.district} onChange={e => set('district', e.target.value)}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Dirección referencial</label>
                <input className="input" placeholder="Ej: Av. España 1200"
                  value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
            </div>

            {/* Toggle anonimato */}
            <div className="flex items-center justify-between p-4 bg-navy-800/4 rounded-xl">
              <div className="flex items-center gap-3">
                {form.is_anonymous
                  ? <EyeOff size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  : <Eye    size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                }
                <div>
                  <p className="font-display font-medium text-sm text-slate-800">Reporte anónimo</p>
                  <p className="text-xs text-slate-500 font-body">Tu nombre no aparecerá en el reporte</p>
                </div>
              </div>
              <button type="button" onClick={() => set('is_anonymous', !form.is_anonymous)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0
                  ${form.is_anonymous ? 'bg-primary-600' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all
                  ${form.is_anonymous ? 'left-6' : 'left-1 shadow-sm'}`} />
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: Mapa Leaflet ──────────────────────────── */}
        {/* El contenedor del mapa SIEMPRE está en el DOM para que Leaflet
            pueda inicializarse; se oculta visualmente cuando no es el paso 2 */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <Info size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-body">
                Haz clic en el mapa para marcar la ubicación exacta del problema
              </p>
            </div>
            <button 
              type="button" 
              onClick={getUserLocation}
              disabled={isLocating}
              className="btn-secondary whitespace-nowrap justify-center"
            >
              <LocateFixed size={14} className={isLocating ? 'animate-pulse' : ''} />
              {isLocating ? 'Ubicando...' : 'Usar mi ubicación'}
            </button>
          </div>

          {/* Contenedor del mapa Leaflet */}
          <div
            ref={containerRef}
            className="w-full rounded-xl overflow-hidden border border-navy-800/10"
            style={{ height: 380 }}
          />

          {form.latitude && (
            <p className="text-xs text-emerald-600 font-body mt-2 flex items-center gap-1">
              ✓ Ubicación marcada: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
            </p>
          )}
          {!form.latitude && (
            <p className="text-xs text-navy-800/40 font-body mt-2 flex items-center gap-1">
              <MapPin size={11} /> Ninguna ubicación marcada aún
            </p>
          )}
        </div>

        {/* ── PASO 3: Multimedia ────────────────────────────── */}
        {step === 3 && (
          <div>
            <label className="label">
              Fotos o Videos del problema{' '}
              <span className="text-slate-400 font-normal">(opcional, máx 4)</span>
            </label>
            
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {previews.map((p, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                    {p.type === 'video' ? (
                      <video src={p.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-slate-900/70 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 4 && (
              <label className="block w-full border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="font-display font-medium text-sm text-slate-600">
                  Subir fotos o videos
                </p>
                <p className="text-xs text-slate-400 mt-1 font-body">
                  JPG, PNG, WebP o MP4 · Máx 20MB c/u
                </p>
                <input type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={handleFiles} />
              </label>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-between pt-2 border-t border-navy-800/6">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            className="btn-secondary"
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          {step < 3 ? (
            <button onClick={nextStep} className="btn-primary">Continuar →</button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Publicando…' : 'Publicar reporte'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}