import axios from 'axios';

const developmentApiUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/v1`;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? developmentApiUrl : '/api/v1'),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const area = config.url?.startsWith('/admin') ? 'admin' : config.url?.startsWith('/editors') ? 'editor' : null;
  const token = area ? localStorage.getItem(`nerdyfren_${area}_token`) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.startsWith('/admin')) localStorage.removeItem('nerdyfren_admin_token');
      if (error.config?.url?.startsWith('/editors')) localStorage.removeItem('nerdyfren_editor_token');
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.error || (error.code === 'ECONNABORTED' ? 'The request timed out.' : fallback);
}

export const servicesApi = {
  list: () => api.get('/services').then((r) => r.data),
};

export const bookingsApi = {
  create: (data) => api.post('/bookings', data).then((r) => r.data),
  track: (token) => api.get(`/bookings/track/${encodeURIComponent(token)}`).then((r) => r.data),
};

export const editorApi = {
  login: (data) => api.post('/editors/login', data).then((r) => r.data),
  profile: () => api.get('/editors/me').then((r) => r.data),
  projects: () => api.get('/editors/projects').then((r) => r.data),
  project: (id) => api.get(`/editors/projects/${id}`).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/editors/projects/${id}/status`, { status }).then((r) => r.data),
};

export const adminApi = {
  login: (data) => api.post('/admin/login', data).then((r) => r.data),
  stats: () => api.get('/admin/stats').then((r) => r.data),
  bookings: () => api.get('/admin/bookings').then((r) => r.data),
  editors: () => api.get('/admin/editors').then((r) => r.data),
  applications: () => api.get('/admin/applications').then((r) => r.data),
  updatePayment: (id, data) => api.patch(`/admin/bookings/${id}/payment`, data).then((r) => r.data),
  assign: (id, editorId) => api.post(`/admin/projects/${id}/assign`, { editor_id: editorId }).then((r) => r.data),
  approve: (id, data) => api.post(`/admin/applications/${id}/approve`, data).then((r) => r.data),
  reject: (id, notes) => api.post(`/admin/applications/${id}/reject`, { notes }).then((r) => r.data),
  deactivate: (id) => api.patch(`/admin/editors/${id}/deactivate`).then((r) => r.data),
};
