// ============================================================
// API CLIENT - Centraliza todas las peticiones al backend
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data.data;
}

// ── Auth ──────────────────────────────────────────────────
export const api = {
  auth: {
    register: (body)           => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login:    (body)           => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
    me:       ()               => request('/api/auth/me'),
    changePassword: (body)     => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },

  // ── Reportes ────────────────────────────────────────────
  reports: {
    list:   (params = {}) => request('/api/reports?' + new URLSearchParams(params)),
    map:    (params = {}) => request('/api/reports/map?' + new URLSearchParams(params)),
    get:    (id)          => request(`/api/reports/${id}`),
    create: (body)        => request('/api/reports', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body)    => request(`/api/reports/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id)          => request(`/api/reports/${id}`, { method: 'DELETE' }),
    uploadMedia: (id, files) => {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append('media', files[i]);
      }
      const token = getToken();
      return fetch(`${BASE_URL}/api/reports/${id}/media`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.error); return d.data; });
    },
  },

  // ── Comentarios ─────────────────────────────────────────
  comments: {
    list:   (reportId, params = {}) => request(`/api/comments/${reportId}?` + new URLSearchParams(params)),
    create: (reportId, body)        => request(`/api/comments/${reportId}`, { method: 'POST', body: JSON.stringify(body) }),
    delete: (id)                    => request(`/api/comments/${id}`, { method: 'DELETE' }),
  },

  // ── Votos ────────────────────────────────────────────────
  votes: {
    vote:   (reportId) => request(`/api/votes/${reportId}`, { method: 'POST' }),
    unvote: (reportId) => request(`/api/votes/${reportId}`, { method: 'DELETE' }),
  },

  // ── Categorías ───────────────────────────────────────────
  categories: {
    list: () => request('/api/categories'),
  },

  // ── Admin ────────────────────────────────────────────────
  admin: {
    stats:         ()           => request('/api/admin/stats'),
    reports:       (params={})  => request('/api/admin/reports?' + new URLSearchParams(params)),
    setStatus:     (id, body)   => request(`/api/admin/reports/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
    assign:        (id, body)   => request(`/api/admin/reports/${id}/assign`, { method: 'PUT', body: JSON.stringify(body) }),
    history:       (id)         => request(`/api/admin/reports/${id}/history`),
    users:         (params={})  => request('/api/admin/users?' + new URLSearchParams(params)),
    setRole:       (id, role)   => request(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    setActive:     (id, active) => request(`/api/admin/users/${id}/active`, { method: 'PUT', body: JSON.stringify({ is_active: active }) }),
    areas:         ()           => request('/api/admin/areas'),
  },
};