import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CART_STORAGE_KEY,
  MAX_CART_QUANTITY,
  cartItemCount,
  cartSubtotal,
  normalizeCartItem,
  readStoredCart,
} from '../lib/cart';
import { CartContext } from './cartState';

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // A disabled or full localStorage should not block browsing or booking.
    }
  }, [items]);

  useEffect(() => {
    const syncCart = (event) => {
      if (event.key === CART_STORAGE_KEY) setItems(readStoredCart());
    };
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  const addItem = useCallback((value) => {
    const item = normalizeCartItem(value);
    if (!item) return;
    setItems((current) => {
      const existing = current.find((entry) => entry.serviceId === item.serviceId);
      if (!existing) return [...current, item];
      return current.map((entry) => entry.serviceId === item.serviceId
        ? { ...entry, ...item, quantity: Math.min(MAX_CART_QUANTITY, entry.quantity + item.quantity) }
        : entry);
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((serviceId) => {
    setItems((current) => current.filter((item) => item.serviceId !== serviceId));
  }, []);

  const updateQuantity = useCallback((serviceId, quantity) => {
    const nextQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(nextQuantity)) return;
    if (nextQuantity <= 0) {
      removeItem(serviceId);
      return;
    }
    setItems((current) => current.map((item) => item.serviceId === serviceId
      ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, nextQuantity) }
      : item));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({
    items,
    itemCount: cartItemCount(items),
    subtotal: cartSubtotal(items),
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [addItem, clearCart, isOpen, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
