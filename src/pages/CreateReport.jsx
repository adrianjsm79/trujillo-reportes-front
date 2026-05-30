import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Eye, EyeOff, Info } from 'lucide-react';
import { api } from '../api/client';
import { useLeafletMap, addTileLayer, createLocationIcon } from '../hooks/useLeafletMap';

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
  const [image,      setImage]   = useState(null);
  const [preview,    setPreview] = useState(null);
  const [categories, setCategs]  = useState([]);
  const [loading,    setLoading] = useState(false);
  const [errors,     setErrors]  = useState({});
  const [step,       setStep]    = useState(1);

  useEffect(() => {
    api.categories.list().then(d => setCategs(d.categories || [])).catch(() => {});
  }, []);

  // Registrar click en el mapa una vez que el paso 2 esté activo
  useEffect(() => {
    if (step !== 2) return;
    const map = mapRef.current;
    if (!map || !window.L) return;

    const onClick = (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = window.L.marker([lat, lng], {
          icon: createLocationIcon(),
        }).addTo(map);
      }

      setForm(f => ({ ...f, latitude: lat, longitude: lng }));
    };

    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [step]);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate() {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)         e.title       = 'Mínimo 5 caracteres';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Mínimo 10 caracteres';
    if (!form.category_id)                                   e.category_id = 'Selecciona una categoría';
    return e;
  }

  async function submit() {
    if (!form.latitude || !form.longitude) {
      alert('Por favor marca la ubicación del problema en el mapa');
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const report = await api.reports.create(form);
      if (image) {
        try { await api.reports.uploadImage(report.id, image); } catch {}
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
        {[['1','Información'],['2','Ubicación'],['3','Foto']].map(([n, label], i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all
                ${step === i+1 ? 'bg-navy-800 text-white' : step > i+1 ? 'bg-emerald-500 text-white' : 'bg-navy-800/10 text-navy-800/40'}`}
            >
              {step > i + 1 ? '✓' : n}
            </button>
            <span className={`text-xs font-display font-semibold hidden sm:block
              ${step === i+1 ? 'text-navy-800' : 'text-navy-800/40'}`}>
              {label}
            </span>
            {i < 2 && (
              <div className={`flex-1 h-px ${step > i+1 ? 'bg-emerald-400' : 'bg-navy-800/10'}`} />
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
                    className={`p-3 rounded-xl border text-center transition-all
                      ${form.category_id === c.id.toString()
                        ? 'bg-navy-800 border-navy-800 text-white'
                        : 'bg-white border-navy-800/15 hover:border-navy-800/40 text-navy-800'}`}>
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className="text-xs font-display font-semibold leading-tight">{c.name}</div>
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
              <p className="text-xs text-navy-800/30 mt-1 text-right">{form.description.length}/2000</p>
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
              <div className="flex items-start gap-3">
                {form.is_anonymous
                  ? <EyeOff size={16} className="text-navy-700 mt-0.5 flex-shrink-0" />
                  : <Eye    size={16} className="text-navy-700 mt-0.5 flex-shrink-0" />
                }
                <div>
                  <p className="font-display font-semibold text-sm text-navy-800">Reporte anónimo</p>
                  <p className="text-xs text-navy-800/50 font-body">Tu nombre no aparecerá en el reporte</p>
                </div>
              </div>
              <button type="button" onClick={() => set('is_anonymous', !form.is_anonymous)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0
                  ${form.is_anonymous ? 'bg-navy-800' : 'bg-navy-800/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all
                  ${form.is_anonymous ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: Mapa Leaflet ──────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
              <Info size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-body">
                Haz clic en el mapa para marcar la ubicación exacta del problema
              </p>
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
        )}

        {/* ── PASO 3: Foto ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <label className="label">
              Foto del problema{' '}
              <span className="text-navy-800/40 font-normal">(opcional)</span>
            </label>
            {!preview ? (
              <label className="block w-full border-2 border-dashed border-navy-800/20 rounded-xl p-10 text-center cursor-pointer hover:border-navy-800/40 transition-colors">
                <Upload size={24} className="text-navy-800/30 mx-auto mb-3" />
                <p className="font-display font-semibold text-sm text-navy-800/60">
                  Sube una foto del problema
                </p>
                <p className="text-xs text-navy-800/40 mt-1 font-body">
                  JPG, PNG o WebP · Máx 5MB
                </p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                <button
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-navy-900/70 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
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
            <button onClick={submit} disabled={loading} className="btn-gold disabled:opacity-50">
              {loading ? 'Publicando…' : '📢 Publicar reporte'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}