import axios from 'axios';
import { runtimeConfig } from './runtimeConfig';

const API_PREFIX = '/api/v1';
export const AUTH_TOKEN_KEY = 'nerdyfren_auth_token';

export const API_ENDPOINTS = Object.freeze({
  services: `${API_PREFIX}/services`,
  siteContent: `${API_PREFIX}/site-content`,
  bookings: `${API_PREFIX}/bookings`,
  bookingTracking: (token) => `${API_PREFIX}/bookings/track/${encodeURIComponent(token)}`,
  applications: `${API_PREFIX}/applications`,
  authSignup: `${API_PREFIX}/auth/signup`,
  authLogin: `${API_PREFIX}/auth/login`,
  authForgotPassword: `${API_PREFIX}/auth/forgot-password`,
  authResetPassword: `${API_PREFIX}/auth/reset-password`,
  authLogout: `${API_PREFIX}/auth/logout`,
  authMe: `${API_PREFIX}/auth/me`,
  authSwitchRole: `${API_PREFIX}/auth/switch-role`,
  userBookings: `${API_PREFIX}/user/bookings`,
  userBooking: (id) => `${API_PREFIX}/user/bookings/${id}`,
  userBookingRevision: (id) => `${API_PREFIX}/user/bookings/${id}/revision`,
  paymentNotify: `${API_PREFIX}/payments/notify`,
  clientApprove: `${API_PREFIX}/client/approve`,
  clientRevision: `${API_PREFIX}/client/revision`,
  adminForgotPassword: `${API_PREFIX}/admin/forgot-password`,
  adminResetPassword: `${API_PREFIX}/admin/reset-password`,
  editorForgotPassword: `${API_PREFIX}/editor/forgot-password`,
  editorResetPassword: `${API_PREFIX}/editor/reset-password`,
  editorProfile: `${API_PREFIX}/editor/me`,
  editorProjects: `${API_PREFIX}/editor/projects`,
  editorProject: (id) => `${API_PREFIX}/editor/projects/${id}`,
  editorProjectStatus: (id) => `${API_PREFIX}/editor/projects/${id}/status`,
  editorProjectDelivery: (id) => `${API_PREFIX}/editor/projects/${id}/delivery`,
  editorDelivery: `${API_PREFIX}/editor/delivery`,
  adminStats: `${API_PREFIX}/admin/stats`,
  adminPayments: `${API_PREFIX}/admin/payments`,
  adminPaymentVerify: `${API_PREFIX}/admin/payments/verify`,
  adminReports: `${API_PREFIX}/admin/reports`,
  adminOperations: `${API_PREFIX}/admin/operations`,
  adminWorkload: `${API_PREFIX}/admin/workload`,
  adminLeads: `${API_PREFIX}/admin/leads`,
  adminLead: (id) => `${API_PREFIX}/admin/leads/${id}`,
  adminExport: (type) => `${API_PREFIX}/admin/exports/${type}`,
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
  superAdminForgotPassword: `${API_PREFIX}/super-admin/forgot-password`,
  superAdminResetPassword: `${API_PREFIX}/super-admin/reset-password`,
  superAdminCms: `${API_PREFIX}/super-admin/cms`,
  superAdminSetting: (key) => `${API_PREFIX}/super-admin/settings/${key}`,
  superAdminHomepage: (key) => `${API_PREFIX}/super-admin/homepage/${key}`,
  superAdminContent: (type, key) => `${API_PREFIX}/super-admin/content/${type}/${key}`,
  superAdminSocial: (key) => `${API_PREFIX}/super-admin/social/${key}`,
  superAdminFooterLinks: `${API_PREFIX}/super-admin/footer-links`,
  superAdminFooterLink: (id) => `${API_PREFIX}/super-admin/footer-links/${id}`,
  superAdminAdmins: `${API_PREFIX}/super-admin/admins`,
  superAdminAdmin: (id) => `${API_PREFIX}/super-admin/admins/${id}`,
  superAdminEditors: `${API_PREFIX}/super-admin/editors`,
  superAdminEditor: (id) => `${API_PREFIX}/super-admin/editors/${id}`,
  superAdminAuditLogs: `${API_PREFIX}/super-admin/audit-logs`,
  superAdminAuditExport: `${API_PREFIX}/super-admin/exports/audit`,
  superAdminUsers: `${API_PREFIX}/super-admin/users`,
  superAdminUser: (id) => `${API_PREFIX}/super-admin/users/${id}`,
  superAdminUserRoles: (id) => `${API_PREFIX}/super-admin/users/${id}/roles`,
  superAdminUserRole: (id, role) => `${API_PREFIX}/super-admin/users/${id}/roles/${role}`,
});

export const api = axios.create({
  baseURL: runtimeConfig.apiOrigin,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  for (const role of ['user', 'client', 'editor', 'admin', 'super_admin']) {
    localStorage.removeItem(`nerdyfren_${role}_token`);
    localStorage.removeItem(`nerdyfren_${role}_roles`);
    localStorage.removeItem(`nerdyfren_${role}_profile`);
  }
  window.dispatchEvent(new Event('nerdyfren:auth-cleared'));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.response?.data?.code === 'ROLE_REVOKED') {
        window.dispatchEvent(new Event('nerdyfren:role-revoked'));
      } else {
        clearAuthSession();
      }
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const code = error.response?.data?.code;
  const status = error.response?.status;
  const friendlyMessages = {
    ACCOUNT_EXISTS: 'An account already exists with those details.',
    ACCOUNT_INACTIVE: 'This account is unavailable. Contact NerdyFren support.',
    ALREADY_ASSIGNED: 'This project is already assigned. Refresh and try again.',
    APPLICATION_ALREADY_REVIEWED: 'This application has already been reviewed.',
    APPLICATION_NOT_FOUND: 'That application could not be found.',
    AUTH_INVALID: 'Your sign-in details are incorrect or your session has expired.',
    AUTH_REQUIRED: 'Please sign in to continue.',
    BOOKING_NOT_FOUND: 'We could not find a request with that ID.',
    DELIVERY_NOTES_REQUIRED: 'Add delivery notes before submitting.',
    EDITOR_NOT_FOUND: 'That editor is unavailable.',
    EMAIL_EXISTS: 'An account already exists with that email.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    ROLE_NOT_ASSIGNED: 'That workspace is not assigned to your account.',
    ROLE_REVOKED: 'That workspace is no longer assigned to your account.',
    EDITOR_PROFILE_INCOMPLETE: 'Complete your Nerd profile before opening the editor workspace.',
    LAST_SUPER_ADMIN: 'The last active Super Admin cannot be removed.',
    INVALID_ROLE: 'Select a valid role.',
    INVALID_CREDENTIALS: 'Your email or password is incorrect.',
    INVALID_SERVICE: 'That service is currently unavailable.',
    INVALID_STATUS_TRANSITION: 'This project is not ready for that action.',
    LEAD_NOT_FOUND: 'That lead could not be found.',
    MISSING_BRIEF: 'Add a project brief before continuing.',
    NOT_ASSIGNED: 'Assign this project before continuing.',
    PAYMENT_ALREADY_VERIFIED: 'This payment has already been verified.',
    PAYMENT_REFERENCE_REQUIRED: 'A payment reference is required.',
    PAYMENT_REQUIRED: 'Payment must be confirmed before assignment.',
    PROJECT_NOT_FOUND: 'That project is unavailable or is not assigned to you.',
    RATE_LIMITED: 'Too many attempts. Wait a few minutes and try again.',
    RESET_TOKEN_EXPIRED: 'This reset link has expired. Request a new one.',
    RESET_TOKEN_INVALID: 'This reset link is invalid or has already been used.',
    REVISION_NOTES_REQUIRED: 'Add revision notes before submitting.',
    SAME_EDITOR: 'This project is already assigned to that editor.',
    SELF_DISABLE: 'You cannot disable your own account.',
    USER_NOT_FOUND: 'That account could not be found.',
    VALIDATION_ERROR: 'Check the information you entered and try again.',
  };

  if (runtimeConfig.isDevelopment) {
    const endpoint = (error.config?.url || '')
      .split('?')[0]
      .replace(/\/bookings\/track\/[^/]+$/, '/bookings/track/[redacted]');
    console.warn('[NerdyFren API]', {
      code: code || error.code || 'REQUEST_FAILED',
      status: status || null,
      endpoint: endpoint || null,
    });
  }
  if (friendlyMessages[code]) return friendlyMessages[code];
  if (error.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (!error.response) return 'We could not reach NerdyFren. Check your connection and try again.';
  if (status >= 500) return 'NerdyFren is temporarily unavailable. Please try again shortly.';
  return fallback;
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

export const siteContentApi = {
  get: () => api.get(API_ENDPOINTS.siteContent).then((r) => expectObject(r.data, 'site content')),
};

export const bookingsApi = {
  create: (data) => api.post(API_ENDPOINTS.bookings, data).then((r) => expectObject(r.data, 'booking')),
  track: (token) => api.get(API_ENDPOINTS.bookingTracking(token)).then((r) => expectObject(r.data, 'tracking')),
};

export const paymentsApi = {
  notify: (data) => api.post(API_ENDPOINTS.paymentNotify, data).then((r) => expectObject(r.data, 'payment notification')),
};

export const clientApi = {
  approve: (data) => api.post(API_ENDPOINTS.clientApprove, data).then((r) => expectObject(r.data, 'delivery approval')),
  requestRevision: (data) => api.post(API_ENDPOINTS.clientRevision, data).then((r) => expectObject(r.data, 'revision request')),
};

export const applicationsApi = {
  create: (data) => api.post(API_ENDPOINTS.applications, data).then((r) => expectObject(r.data, 'application')),
};

export const authApi = {
  signup: (data) => api.post(API_ENDPOINTS.authSignup, data).then((r) => expectObject(r.data, 'signup')),
  login: (data) => api.post(API_ENDPOINTS.authLogin, data).then((r) => expectObject(r.data, 'login')),
  forgotPassword: (data) => api.post(API_ENDPOINTS.authForgotPassword, data).then((r) => expectObject(r.data, 'password reset request')),
  resetPassword: (data) => api.post(API_ENDPOINTS.authResetPassword, data).then((r) => expectObject(r.data, 'password reset')),
  logout: () => api.post(API_ENDPOINTS.authLogout).then((r) => r.data),
  me: () => api.get(API_ENDPOINTS.authMe).then((r) => expectObject(r.data, 'profile')),
  switchRole: (role) => api.post(API_ENDPOINTS.authSwitchRole, { role }).then((r) => expectObject(r.data, 'role switch')),
};

export const userApi = {
  bookings: () => api.get(API_ENDPOINTS.userBookings).then((r) => expectObject(r.data, 'bookings')),
  booking: (id) => api.get(API_ENDPOINTS.userBooking(id)).then((r) => expectObject(r.data, 'booking')),
  requestRevision: (id, message) => api.post(API_ENDPOINTS.userBookingRevision(id), { message }).then((r) => r.data),
};

export const editorApi = {
  forgotPassword: (data) => api.post(API_ENDPOINTS.editorForgotPassword, data).then((r) => r.data),
  resetPassword: (data) => api.post(API_ENDPOINTS.editorResetPassword, data).then((r) => r.data),
  profile: () => api.get(API_ENDPOINTS.editorProfile).then((r) => r.data),
  projects: () => api.get(API_ENDPOINTS.editorProjects).then((r) => r.data),
  project: (id) => api.get(API_ENDPOINTS.editorProject(id)).then((r) => r.data),
  updateStatus: (id, status) => api.patch(API_ENDPOINTS.editorProjectStatus(id), { status }).then((r) => r.data),
  submitDelivery: (id, data) => api.post(API_ENDPOINTS.editorProjectDelivery(id), data).then((r) => r.data),
  submitFinalDelivery: (data) => api.post(API_ENDPOINTS.editorDelivery, data).then((r) => r.data),
};

export const adminApi = {
  forgotPassword: (data) => api.post(API_ENDPOINTS.adminForgotPassword, data).then((r) => r.data),
  resetPassword: (data) => api.post(API_ENDPOINTS.adminResetPassword, data).then((r) => r.data),
  stats: () => api.get(API_ENDPOINTS.adminStats).then((r) => r.data),
  payments: () => api.get(API_ENDPOINTS.adminPayments).then((r) => expectArray(r.data, 'payments')),
  verifyPayment: (data) => api.post(API_ENDPOINTS.adminPaymentVerify, data).then((r) => r.data),
  reports: (params) => api.get(API_ENDPOINTS.adminReports, { params }).then((r) => r.data),
  operations: (params) => api.get(API_ENDPOINTS.adminOperations, { params }).then((r) => r.data),
  workload: (params) => api.get(API_ENDPOINTS.adminWorkload, { params }).then((r) => r.data),
  leads: (params) => api.get(API_ENDPOINTS.adminLeads, { params }).then((r) => r.data),
  createLead: (data) => api.post(API_ENDPOINTS.adminLeads, data).then((r) => r.data),
  updateLead: (id, data) => api.put(API_ENDPOINTS.adminLead(id), data).then((r) => r.data),
  exportCsv: (type, params) => api.get(API_ENDPOINTS.adminExport(type), { params, responseType: 'blob' }),
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

export const superAdminApi = {
  forgotPassword: (data) => api.post(API_ENDPOINTS.superAdminForgotPassword, data).then((r) => r.data),
  resetPassword: (data) => api.post(API_ENDPOINTS.superAdminResetPassword, data).then((r) => r.data),
  cms: () => api.get(API_ENDPOINTS.superAdminCms).then((r) => r.data),
  updateSetting: (key, value) => api.put(API_ENDPOINTS.superAdminSetting(key), { value }).then((r) => r.data),
  updateHomepage: (key, data) => api.put(API_ENDPOINTS.superAdminHomepage(key), data).then((r) => r.data),
  upsertContent: (type, key, data) => api.put(API_ENDPOINTS.superAdminContent(type, key), data).then((r) => r.data),
  deleteContent: (type, key) => api.delete(API_ENDPOINTS.superAdminContent(type, key)).then((r) => r.data),
  updateSocial: (key, data) => api.put(API_ENDPOINTS.superAdminSocial(key), data).then((r) => r.data),
  upsertFooterLink: (data) => api.put(API_ENDPOINTS.superAdminFooterLinks, data).then((r) => r.data),
  deleteFooterLink: (id) => api.delete(API_ENDPOINTS.superAdminFooterLink(id)).then((r) => r.data),
  createAdmin: (data) => api.post(API_ENDPOINTS.superAdminAdmins, data).then((r) => r.data),
  updateAdmin: (id, isActive) => api.patch(API_ENDPOINTS.superAdminAdmin(id), { is_active: isActive }).then((r) => r.data),
  createEditor: (data) => api.post(API_ENDPOINTS.superAdminEditors, data).then((r) => r.data),
  updateEditor: (id, isActive) => api.patch(API_ENDPOINTS.superAdminEditor(id), { is_active: isActive }).then((r) => r.data),
  auditLogs: (params) => api.get(API_ENDPOINTS.superAdminAuditLogs, { params }).then((r) => r.data),
  exportAudit: (params) => api.get(API_ENDPOINTS.superAdminAuditExport, { params, responseType: 'blob' }),
  users: (params) => api.get(API_ENDPOINTS.superAdminUsers, { params }).then((r) => r.data),
  user: (id) => api.get(API_ENDPOINTS.superAdminUser(id)).then((r) => r.data),
  grantRole: (id, role) => api.post(API_ENDPOINTS.superAdminUserRoles(id), { role }).then((r) => r.data),
  revokeRole: (id, role) => api.delete(API_ENDPOINTS.superAdminUserRole(id, role)).then((r) => r.data),
};
