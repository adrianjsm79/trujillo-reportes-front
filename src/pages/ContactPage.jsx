import { useState } from 'react';
import {
  Phone, Mail, MapPin, Clock, ExternalLink, MessageCircle,
  Shield, Wrench, Leaf, Droplets, Zap, AlertTriangle,
  Send, CheckCircle, ChevronRight, Building2, HelpCircle
} from 'lucide-react';

const CONTACTS = [
  {
    area: 'Serenazgo / Seguridad Ciudadana',
    icon: Shield,
    color: 'bg-blue-600',
    light: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    phones: ['(044) 294-300 anexo 111', '942 000 001'],
    email: 'serenazgo@munitrujillo.gob.pe',
    hours: 'Lunes a Domingo, 24 horas',
    whatsapp: '51942000001',
    description: 'Robos, peleas, vehículos abandonados, personas en situación de calle.',
  },
  {
    area: 'Gerencia de Obras Públicas',
    icon: Wrench,
    color: 'bg-orange-600',
    light: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    phones: ['(044) 294-300 anexo 220'],
    email: 'obras@munitrujillo.gob.pe',
    hours: 'Lunes a Viernes, 8:00 AM – 5:00 PM',
    whatsapp: '51944000002',
    description: 'Baches, pistas deterioradas, veredas rotas, semáforos dañados.',
  },
  {
    area: 'Gerencia de Medio Ambiente',
    icon: Leaf,
    color: 'bg-emerald-600',
    light: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    phones: ['(044) 294-300 anexo 310'],
    email: 'medioambiente@munitrujillo.gob.pe',
    hours: 'Lunes a Viernes, 8:00 AM – 5:00 PM',
    whatsapp: '51944000003',
    description: 'Basura acumulada, parques descuidados, árboles peligrosos, contaminación.',
  },
  {
    area: 'SEDALIB — Agua y Alcantarillado',
    icon: Droplets,
    color: 'bg-cyan-600',
    light: 'bg-cyan-50 border-cyan-200',
    text: 'text-cyan-700',
    phones: ['(044) 480-000', '0800-10-730'],
    email: 'atencionalcliente@sedalib.com.pe',
    hours: 'Lunes a Viernes, 8:00 AM – 6:00 PM',
    whatsapp: '51944000004',
    description: 'Fugas de agua, tubería rota, alcantarillado bloqueado, corte de servicio.',
    external: 'https://www.sedalib.com.pe',
  },
  {
    area: 'Hidrandina — Alumbrado Público',
    icon: Zap,
    color: 'bg-yellow-500',
    light: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-700',
    phones: ['0800-10-006'],
    email: 'alcaldiacl@hidrandina.com.pe',
    hours: 'Lunes a Viernes, 8:00 AM – 5:00 PM',
    whatsapp: null,
    description: 'Postes sin luz, cables caídos, alumbrado público deficiente.',
    external: 'https://www.distriluz.com.pe/hidrandina/',
  },
  {
    area: 'Gerencia de Transporte',
    icon: AlertTriangle,
    color: 'bg-purple-600',
    light: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    phones: ['(044) 294-300 anexo 415'],
    email: 'transporte@munitrujillo.gob.pe',
    hours: 'Lunes a Viernes, 8:00 AM – 5:00 PM',
    whatsapp: '51944000005',
    description: 'Señalización vial, paraderos informales, invasión de vías.',
  },
];

function ContactCard({ contact }) {
  const Icon = contact.icon;
  return (
    <div className={`bg-white rounded-2xl border ${contact.light} overflow-hidden shadow-sm`}>
      {/* Header de la tarjeta */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${contact.color} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{contact.area}</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{contact.description}</p>
          </div>
        </div>

        {/* Horario */}
        <div className={`flex items-center gap-1.5 text-xs ${contact.text} mb-4 font-medium`}>
          <Clock size={11} />
          {contact.hours}
        </div>

        {/* Teléfonos */}
        <div className="space-y-2">
          {contact.phones.map((phone, i) => (
            <a key={i} href={`tel:${phone.replace(/\s|\(|\)|-/g, '')}`}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary-600 transition-colors">
              <Phone size={13} className="text-slate-400 flex-shrink-0" />
              <span className="font-medium">{phone}</span>
            </a>
          ))}
        </div>

        {/* Email */}
        {contact.email && (
          <a href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary-600 transition-colors mt-2">
            <Mail size={12} className="flex-shrink-0" />
            {contact.email}
          </a>
        )}
      </div>

      {/* Acciones */}
      <div className="border-t border-slate-100 px-5 py-3 flex gap-2">
        {contact.whatsapp && (
          <a href={`https://wa.me/${contact.whatsapp}?text=Hola, tengo un reporte ciudadano sobre: `}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        {contact.external && (
          <a href={contact.external} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-colors">
            <ExternalLink size={12} /> Portal web
          </a>
        )}
        {!contact.whatsapp && !contact.external && (
          <a href={`tel:${contact.phones[0].replace(/\s|\(|\)|-/g, '')}`}
            className={`flex-1 flex items-center justify-center gap-1.5 ${contact.color} hover:opacity-90 text-white text-xs font-semibold py-2 rounded-lg transition-colors`}>
            <Phone size={12} /> Llamar ahora
          </a>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setSending(true);
    // Abre cliente de correo como mecanismo de soporte
    const subject = encodeURIComponent(`[TrujiReporta] Soporte - ${form.name}`);
    const body    = encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\n\nMensaje:\n${form.message}`);
    window.location.href = `mailto:soporte@trujilloreporta.pe?subject=${subject}&body=${body}`;
    setTimeout(() => { setSent(true); setSending(false); }, 800);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className="bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/25 rounded-full px-3.5 py-1.5 mb-5">
              <Building2 size={12} className="text-primary-400" />
              <span className="text-primary-300 text-xs font-semibold tracking-wide uppercase">
                Directorio Municipal
              </span>
            </div>
            <h1 className="text-white font-bold text-3xl sm:text-4xl leading-tight mb-3">
              Contacta a las<br />
              <span className="text-primary-400">autoridades directamente</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Aquí encontrarás los canales oficiales para reportar problemas
              urgentes que requieren atención inmediata de la Municipalidad de
              Trujillo y sus entidades vinculadas.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Directorio de áreas */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-bold text-slate-800 text-xl">Directorio por área</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {CONTACTS.length} áreas
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTACTS.map((c, i) => <ContactCard key={i} contact={c} />)}
          </div>
        </div>

        {/* Info general Municipalidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Municipalidad Provincial de Trujillo</h3>
                <p className="text-xs text-slate-500">Sede Central</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Jr. Diego de Almagro 525, Centro Histórico, Trujillo</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <a href="tel:+5144294300" className="hover:text-primary-600 transition-colors">(044) 294-300</a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-400 flex-shrink-0" />
                <span>Lunes a Viernes, 8:00 AM – 5:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ExternalLink size={14} className="text-slate-400 flex-shrink-0" />
                <a href="https://www.munitrujillo.gob.pe" target="_blank" rel="noopener noreferrer"
                  className="text-primary-600 hover:underline">munitrujillo.gob.pe</a>
              </div>
            </div>
          </div>

          {/* Consejos */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-primary-200" />
              <h3 className="font-bold">¿Cuándo llamar vs. reportar?</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { icon: '📞', text: 'Llama directamente para emergencias activas (peleas, accidentes, fugas).' },
                { icon: '📱', text: 'Usa TrujiReporta para problemas de infraestructura que necesitan seguimiento.' },
                { icon: '📸', text: 'Sube fotos en tu reporte para que las autoridades vean la evidencia.' },
                { icon: '🗳️', text: 'Invita a vecinos a apoyar tu reporte para que suba en prioridad.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-base">{item.icon}</span>
                  <span className="text-primary-100 leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Formulario de soporte de la plataforma */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Send size={16} className="text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Soporte de la plataforma</h3>
                <p className="text-xs text-slate-500">¿Problemas técnicos o sugerencias para TrujiReporta?</p>
              </div>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-800">¡Mensaje enviado!</p>
                <p className="text-sm text-slate-500 mt-1">Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      className="input"
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="Para responderте"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Mensaje *</label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Describe tu problema o sugerencia..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" disabled={sending || !form.name || !form.message} className="btn-primary w-full justify-center">
                  <Send size={14} />
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
