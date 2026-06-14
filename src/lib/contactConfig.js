import { runtimeConfig } from './runtimeConfig';

export const publicContactConfig = Object.freeze({
  whatsappNumber: runtimeConfig.whatsappNumber,
  instagramUrl: runtimeConfig.publicLinks.instagram,
  mothershipUrl: runtimeConfig.publicLinks.mothership,
  merchUrl: runtimeConfig.publicLinks.merch,
  supportEmail: runtimeConfig.supportEmail,
});

export function buildWhatsAppLink(message = '') {
  if (!publicContactConfig.whatsappNumber) return '';
  const query = message.trim()
    ? `?text=${encodeURIComponent(message.trim())}`
    : '';
  return `https://wa.me/${publicContactConfig.whatsappNumber}${query}`;
}

export function buildCoordinatorMessage({
  requestId,
  customerName,
  service,
  context,
} = {}) {
  return [
    'Hi NerdyFren, I would like to talk to a coordinator.',
    requestId ? `Request ID: ${requestId}` : '',
    customerName ? `Customer: ${customerName}` : '',
    service ? `Service: ${service}` : '',
    context ? `Context: ${context}` : '',
  ].filter(Boolean).join('\n');
}
