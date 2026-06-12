import axios from 'axios';

const API_PREFIX = '/api/v1';
const developmentApiOrigin = `${window.location.protocol}//${window.location.hostname}:3001`;

function normalizeApiOrigin(value) {
  return value
    ?.trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '');
}

const apiOrigin = normalizeApiOrigin(import.meta.env.VITE_API_URL)
  || (import.meta.env.DEV ? developmentApiOrigin : window.location.origin);

export const API_ENDPOINTS = Object.freeze({
  services: `${API_PREFIX}/services`,
  bookings: `${API_PREFIX}/bookings`,
  bookingTracking: (token) => `${API_PREFIX}/bookings/track/${encodeURIComponent(token)}`,
  applications: `${API_PREFIX}/applications`,
  authSignup: `${API_PREFIX}/auth/signup`,
  authLogin: `${API_PREFIX}/auth/login`,
  authLogout: `${API_PREFIX}/auth/logout`,
  authMe: `${API_PREFIX}/auth/me`,
  userBookings: `${API_PREFIX}/user/bookings`,
  userBooking: (id) => `${API_PREFIX}/user/bookings/${id}`,
  userBookingRevision: (id) => `${API_PREFIX}/user/bookings/${id}/revision`,
  adminLogin: `${API_PREFIX}/admin/login`,
  editorLogin: `${API_PREFIX}/editor/login`,
  editorProfile: `${API_PREFIX}/editor/me`,
  editorProjects: `${API_PREFIX}/editor/projects`,
  editorProject: (id) => `${API_PREFIX}/editor/projects/${id}`,
  editorProjectStatus: (id) => `${API_PREFIX}/editor/projects/${id}/status`,
  editorProjectDelivery: (id) => `${API_PREFIX}/editor/projects/${id}/delivery`,
  adminStats: `${API_PREFIX}/admin/stats`,
  adminProjects: `${API_PREFIX}/admin/projects`,
  adminEditors: `${API_PREFIX}/admin/editors`,
  adminApplications: `${API_PREFIX}/admin/applications`,
  adminBookingPayment: (id) => `${API_PREFIX}/admin/bookings/${id}/payment`,
  adminProjectAssignment: (id) => `${API_PREFIX}/admin/projects/${id}/assign`,
  adminProjectReassignment: (id) => `${API_PREFIX}/admin/projects/${id}/reassign`,
  adminProjectStatus: (id) => `${API_PREFIX}/admin/projects/${id}/status`,
  adminApplicationApproval: (id) => `${API_PREFIX}/admin/applications/${id}/approve`,
  adminApplicationRejection: (id) => `${API_PREFIX}/admin/applications/${id}/reject`,
  adminEditorDeactivation: (id) => `${API_PREFIX}/admin/editors/${id}/deactivate`,
});

export const api = axios.create({
  baseURL: apiOrigin,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const isUserRequest = config.url === API_ENDPOINTS.bookings
    || config.url === API_ENDPOINTS.authLogout
    || config.url === API_ENDPOINTS.authMe
    || config.url?.startsWith(`${API_PREFIX}/user`);
  const area = config.url?.startsWith(`${API_PREFIX}/admin`)
    ? 'admin'
    : config.url?.startsWith(`${API_PREFIX}/editor`)
      ? 'editor'
      : isUserRequest
        ? 'user'
        : null;
  const token = area ? localStorage.getItem(`nerdyfren_${area}_token`) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.startsWith(`${API_PREFIX}/admin`)) localStorage.removeItem('nerdyfren_admin_token');
      if (error.config?.url?.startsWith(`${API_PREFIX}/editor`)) localStorage.removeItem('nerdyfren_editor_token');
      if (
        error.config?.url === API_ENDPOINTS.authLogout
        || error.config?.url === API_ENDPOINTS.authMe
        || error.config?.url?.startsWith(`${API_PREFIX}/user`)
      ) localStorage.removeItem('nerdyfren_user_token');
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.error || (error.code === 'ECONNABORTED' ? 'The request timed out.' : fallback);
}

function expectArray(data, resource) {
  if (!Array.isArray(data)) throw new Error(`Invalid ${resource} response from the API`);
  return data;
}

function expectObject(data, resource) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Invalid ${resource} response from the API`);
  }
  return data;
}

export const servicesApi = {
  list: () => api.get(API_ENDPOINTS.services).then((r) => expectArray(r.data, 'services')),
};

export const bookingsApi = {
  create: (data) => api.post(API_ENDPOINTS.bookings, data).then((r) => expectObject(r.data, 'booking')),
  track: (token) => api.get(API_ENDPOINTS.bookingTracking(token)).then((r) => expectObject(r.data, 'tracking')),
};

export const applicationsApi = {
  create: (data) => api.post(API_ENDPOINTS.applications, data).then((r) => expectObject(r.data, 'application')),
};

export const authApi = {
  signup: (data) => api.post(API_ENDPOINTS.authSignup, data).then((r) => expectObject(r.data, 'signup')),
  login: (data) => api.post(API_ENDPOINTS.authLogin, data).then((r) => expectObject(r.data, 'login')),
  logout: () => api.post(API_ENDPOINTS.authLogout).then((r) => r.data),
  me: () => api.get(API_ENDPOINTS.authMe).then((r) => expectObject(r.data, 'profile')),
};

export const userApi = {
  bookings: () => api.get(API_ENDPOINTS.userBookings).then((r) => expectObject(r.data, 'bookings')),
  booking: (id) => api.get(API_ENDPOINTS.userBooking(id)).then((r) => expectObject(r.data, 'booking')),
  requestRevision: (id, message) => api.post(API_ENDPOINTS.userBookingRevision(id), { message }).then((r) => r.data),
};

export const editorApi = {
  login: (data) => api.post(API_ENDPOINTS.editorLogin, data).then((r) => r.data),
  profile: () => api.get(API_ENDPOINTS.editorProfile).then((r) => r.data),
  projects: () => api.get(API_ENDPOINTS.editorProjects).then((r) => r.data),
  project: (id) => api.get(API_ENDPOINTS.editorProject(id)).then((r) => r.data),
  updateStatus: (id, status) => api.patch(API_ENDPOINTS.editorProjectStatus(id), { status }).then((r) => r.data),
  submitDelivery: (id, data) => api.post(API_ENDPOINTS.editorProjectDelivery(id), data).then((r) => r.data),
};

export const adminApi = {
  login: (data) => api.post(API_ENDPOINTS.adminLogin, data).then((r) => r.data),
  stats: () => api.get(API_ENDPOINTS.adminStats).then((r) => r.data),
  bookings: () => api.get(API_ENDPOINTS.adminProjects).then((r) => r.data),
  editors: () => api.get(API_ENDPOINTS.adminEditors).then((r) => r.data),
  applications: () => api.get(API_ENDPOINTS.adminApplications).then((r) => r.data),
  updatePayment: (id, data) => api.patch(API_ENDPOINTS.adminBookingPayment(id), data).then((r) => r.data),
  assign: (id, editorId) => api.post(API_ENDPOINTS.adminProjectAssignment(id), { editor_id: editorId }).then((r) => r.data),
  reassign: (id, editorId) => api.post(API_ENDPOINTS.adminProjectReassignment(id), { editor_id: editorId }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(API_ENDPOINTS.adminProjectStatus(id), { status }).then((r) => r.data),
  approve: (id, data) => api.post(API_ENDPOINTS.adminApplicationApproval(id), data).then((r) => r.data),
  reject: (id, notes) => api.post(API_ENDPOINTS.adminApplicationRejection(id), { notes }).then((r) => r.data),
  deactivate: (id) => api.patch(API_ENDPOINTS.adminEditorDeactivation(id)).then((r) => r.data),
};
