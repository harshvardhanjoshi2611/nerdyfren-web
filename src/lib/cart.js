import { getPriceBreakdown, serviceMeta } from './format.js';

export const CART_STORAGE_KEY = 'nerdyfren_cart_v1';
export const MAX_CART_QUANTITY = 99;

/**
 * @typedef {Object} CartItem
 * @property {string} serviceId Stable service or package identifier.
 * @property {string} name Display name captured when the item was added.
 * @property {number} price Base unit price in INR.
 * @property {number} quantity Number of matching deliverables requested.
 * @property {Object} metadata Checkout-preparation data captured from the catalog.
 */

function normalizedQuantity(value) {
  const quantity = Math.floor(Number(value));
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, quantity));
}

/** @returns {CartItem|null} */
export function normalizeCartItem(value) {
  const serviceId = String(value?.serviceId || '').trim();
  const name = String(value?.name || '').trim();
  const price = Number(value?.price);
  if (!serviceId || !name || !Number.isFinite(price) || price < 0) return null;
  return {
    serviceId,
    name,
    price,
    quantity: normalizedQuantity(value.quantity),
    metadata: value.metadata && typeof value.metadata === 'object' && !Array.isArray(value.metadata)
      ? value.metadata
      : {},
  };
}

/** Build a cart item from the same catalog object used by booking and service cards. */
export function createCartItem(service, quantity = 1) {
  const serviceId = String(service?.id || '').trim();
  const meta = serviceMeta[serviceId] || {};
  const pricing = getPriceBreakdown(service || 0);
  return normalizeCartItem({
    serviceId,
    name: service?.name || meta.name || serviceId,
    price: pricing.base_amount,
    quantity,
    metadata: {
      serviceType: serviceId,
      pricing: {
        baseAmount: pricing.base_amount,
        gstRate: pricing.gst_rate,
        gstAmount: pricing.gst_amount,
        totalAmount: pricing.total_amount,
      },
      timeline: service?.timeline || meta.timeline || '',
      revisionCycles: service?.revision_cycles ?? meta.revisionCycles ?? null,
    },
  });
}

export function readStoredCart(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(CART_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

export function cartSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function cartItemCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
