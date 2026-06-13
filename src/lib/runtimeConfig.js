const isDevelopment = import.meta.env.DEV;
const currentOrigin = window.location.origin;
const developmentApiOrigin = `${window.location.protocol}//${window.location.hostname}:3001`;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeHttpOrigin(value) {
  const candidate = clean(value)
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '');
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : '';
  } catch {
    return '';
  }
}

function normalizePublicUrl(value, variableName) {
  const candidate = clean(value);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    if (['http:', 'https:'].includes(url.protocol)) return url.toString();
  } catch {
    // Report the invalid optional value below in development.
  }
  if (isDevelopment) {
    console.warn(`[NerdyFren config] ${variableName} is invalid and will be hidden.`);
  }
  return '';
}

function warn(message) {
  if (isDevelopment) console.warn(`[NerdyFren config] ${message}`);
}

const configuredApiOrigin = normalizeHttpOrigin(import.meta.env.VITE_API_URL);
const apiOrigin = configuredApiOrigin
  || (isDevelopment ? developmentApiOrigin : currentOrigin);
const configuredSiteUrl = normalizeHttpOrigin(import.meta.env.VITE_SITE_URL);
const siteUrl = configuredSiteUrl || currentOrigin;
const whatsappNumber = clean(import.meta.env.VITE_WHATSAPP_NUMBER).replace(/\D/g, '');
const validWhatsAppNumber = /^\d{8,15}$/.test(whatsappNumber) ? whatsappNumber : '';
const configuredSupportEmail = clean(import.meta.env.VITE_SUPPORT_EMAIL).toLowerCase();
const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredSupportEmail)
  ? configuredSupportEmail
  : 'support@nerdyfren.com';

if (!configuredApiOrigin) {
  warn(`VITE_API_URL is missing or invalid; using ${apiOrigin}.`);
}
if (!validWhatsAppNumber) {
  warn('VITE_WHATSAPP_NUMBER is missing or invalid; WhatsApp actions will be disabled.');
}
if (!configuredSiteUrl) {
  warn(`VITE_SITE_URL is missing or invalid; using ${siteUrl} for canonical links.`);
}
if (configuredSupportEmail && configuredSupportEmail !== supportEmail) {
  warn('VITE_SUPPORT_EMAIL is invalid; using the public support fallback.');
}

export const runtimeConfig = Object.freeze({
  apiOrigin,
  configurationError: !isDevelopment && !configuredApiOrigin
    ? 'VITE_API_URL is missing or invalid. Configure the production API origin and redeploy.'
    : '',
  isDevelopment,
  ogImageUrl: normalizePublicUrl(import.meta.env.VITE_OG_IMAGE_URL, 'VITE_OG_IMAGE_URL'),
  publicLinks: Object.freeze({
    instagram: normalizePublicUrl(import.meta.env.VITE_INSTAGRAM_URL, 'VITE_INSTAGRAM_URL'),
    merch: normalizePublicUrl(import.meta.env.VITE_MERCH_URL, 'VITE_MERCH_URL'),
    mothership: normalizePublicUrl(import.meta.env.VITE_MOTHERSHIP_URL, 'VITE_MOTHERSHIP_URL'),
  }),
  siteUrl,
  supportEmail,
  whatsappNumber: validWhatsAppNumber,
});
