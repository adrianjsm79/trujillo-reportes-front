# 🏙️ TrujiReporta — Frontend

Frontend de la plataforma ciudadana de denuncias de Trujillo.
Construido con **React + Vite + Tailwind CSS**, desplegable en **Cloudflare Pages**.

---

## 📁 Estructura del proyecto

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── client.js          ← Todas las llamadas al backend
│   ├── context/
│   │   └── AuthContext.jsx    ← Estado global de autenticación
│   ├── components/
│   │   ├── Navbar.jsx         ← Barra de navegación
│   │   ├── ReportCard.jsx     ← Tarjeta del feed
│   │   ├── Badges.jsx         ← StatusBadge y CategoryBadge
│   │   ├── CommentSection.jsx ← Sección de comentarios
│   │   ├── FilterBar.jsx      ← Filtros y búsqueda
│   │   └── Pagination.jsx     ← Paginación
│   ├── pages/
│   │   ├── Home.jsx           ← Feed/Blog principal
│   │   ├── MapPage.jsx        ← Mapa Google Maps
│   │   ├── ReportDetail.jsx   ← Detalle de un reporte
│   │   ├── CreateReport.jsx   ← Formulario de nuevo reporte
│   │   ├── Login.jsx          ← Inicio de sesión
│   │   ├── Register.jsx       ← Registro
│   │   ├── MyReports.jsx      ← Mis reportes
│   │   └── AdminPanel.jsx     ← Panel admin y autoridad
│   ├── App.jsx                ← Router principal
│   ├── main.jsx               ← Entry point
│   └── index.css              ← Estilos globales + Tailwind
├── index.html                 ← HTML con Google Fonts + Maps script
├── vite.config.js
├── tailwind.config.js
├── .env.example               ← Variables de entorno
└── package.json
```

---

## 🚀 Instalación local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear archivo de entorno
```bash
cp .env.example .env
# Edita .env con la URL de tu backend
```

### 3. Configurar Google Maps
En `index.html`, reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&...">
```
Y en `ReportDetail.jsx`, busca `YOUR_GOOGLE_MAPS_API_KEY` y reemplázalo también.

### 4. Desarrollo local
```bash
npm run dev
# App disponible en http://localhost:5173
```

---

## 🌐 Despliegue en Cloudflare Pages

### 1. Build de producción
```bash
npm run build
```

### 2. Desplegar con Wrangler
```bash
npx wrangler pages deploy dist --project-name=trujillo-reportes
```

### 3. O conectar el repo en el dashboard de Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL` = URL de tu Worker

---

## 📱 Páginas de la aplicación

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Feed principal con reportes | Público |
| `/mapa` | Mapa de Trujillo con pines | Público |
| `/reporte/:id` | Detalle de un reporte | Público |
| `/nuevo` | Crear nuevo reporte | Autenticado |
| `/login` | Inicio de sesión | Público |
| `/registro` | Registro de cuenta | Público |
| `/mis-reportes` | Historial de mis reportes | Autenticado |
| `/admin` | Panel de administración | Authority / Admin |

---

## 🔐 Roles del sistema

| Rol | Acceso |
|-----|--------|
| `citizen` | Feed, mapa, crear reportes, comentar, votar |
| `authority` | Todo lo anterior + panel admin (gestión de reportes y stats) |
| `admin` | Todo lo anterior + gestión de usuarios y categorías |

---

## 🎨 Sistema de diseño

**Fuentes**:
- Display/Headings: `Sora`
- Body: `Plus Jakarta Sans`

**Colores principales**:
- Navy 900 (`#0F2241`) — color primario, navbar
- Gold 500 (`#E8A820`) — acento, CTAs
- Surface (`#F7F5F0`) — fondo general
- Card (`#FFFFFF`) — tarjetas

**Clases de utilidad custom**:
- `.btn-primary` / `.btn-secondary` / `.btn-gold` — botones
- `.input` — campos de formulario
- `.label` — etiquetas
- `.card` / `.card-hover` — tarjetas
- `.badge` — badges pequeños
- `.animate-fade-up` / `.animate-fade-in` — animaciones de entrada