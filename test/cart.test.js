import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cartItemCount,
  cartSubtotal,
  createCartItem,
  normalizeCartItem,
  readStoredCart,
} from '../src/lib/cart.js';

test('creates a Phase 2-ready cart item from canonical catalog pricing', () => {
  const item = createCartItem({
    id: 'video-reel',
    name: 'Video Editing',
    amount: 2500,
    gst_rate: 18,
    gst_amount: 450,
    total_amount: 2950,
  });

  assert.equal(item.serviceId, 'video-reel');
  assert.equal(item.price, 2500);
  assert.equal(item.quantity, 1);
  assert.deepEqual(item.metadata.pricing, {
    baseAmount: 2500,
    gstRate: 18,
    gstAmount: 450,
    totalAmount: 2950,
  });
});

test('calculates quantities and subtotal', () => {
  const item = normalizeCartItem({ serviceId: 'video-reel', name: 'Video Editing', price: 2500, quantity: 2 });
  assert.equal(cartItemCount([item]), 2);
  assert.equal(cartSubtotal([item]), 5000);
});

test('safely ignores invalid persisted cart data', () => {
  assert.deepEqual(readStoredCart({ getItem: () => '{invalid' }), []);
  assert.deepEqual(readStoredCart({ getItem: () => JSON.stringify([{ name: 'Missing ID', price: 10 }]) }), []);
});
