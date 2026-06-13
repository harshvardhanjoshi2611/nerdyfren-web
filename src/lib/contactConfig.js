import { runtimeConfig } from './runtimeConfig';

export const publicContactConfig = Object.freeze({
  whatsappNumber: runtimeConfig.whatsappNumber,
  instagramUrl: runtimeConfig.publicLinks.instagram,
  mothershipUrl: runtimeConfig.publicLinks.mothership,
  merchUrl: runtimeConfig.publicLinks.merch,
});

export function buildWhatsAppLink(message = '') {
  if (!publicContactConfig.whatsappNumber) return '';
  const query = message.trim()
    ? `?text=${encodeURIComponent(message.trim())}`
    : '';
  return `https://wa.me/${publicContactConfig.whatsappNumber}${query}`;
}
