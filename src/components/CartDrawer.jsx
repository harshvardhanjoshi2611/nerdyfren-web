import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatMoney } from '../lib/format';

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeCart, isOpen]);

  return (
    <div className={`nf-cart-drawer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <button type="button" className="nf-cart-backdrop" onClick={closeCart} aria-label="Close cart" />
      <aside className="nf-cart-panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="nf-cart-head">
          <div><p className="nf-eyebrow">Your selection</p><h2>Cart</h2></div>
          <button type="button" onClick={closeCart} className="nf-cart-close" aria-label="Close cart"><X size={21} /></button>
        </div>

        {items.length === 0 ? (
          <div className="nf-cart-empty">
            <span><ShoppingBag size={25} /></span>
            <h3>Your cart is empty.</h3>
            <p>Add a service package and it will stay here when you refresh.</p>
            <a href="/#services" onClick={closeCart} className="nf-button-primary">Browse services</a>
          </div>
        ) : (
          <>
            <div className="nf-cart-items">
              {items.map((item) => (
                <article key={item.serviceId} className="nf-cart-item">
                  <div className="nf-cart-item-copy">
                    <p>Service package</p><h3>{item.name}</h3><strong>{formatMoney(item.price)}</strong>
                  </div>
                  <button type="button" onClick={() => removeItem(item.serviceId)} className="nf-cart-remove" aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
                  <div className="nf-cart-quantity" aria-label={`${item.name} quantity`}>
                    <button type="button" onClick={() => updateQuantity(item.serviceId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={14} /></button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.serviceId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button>
                  </div>
                  <strong className="nf-cart-line-total">{formatMoney(item.price * item.quantity)}</strong>
                </article>
              ))}
            </div>
            <div className="nf-cart-summary">
              <button type="button" onClick={clearCart} className="nf-cart-clear">Clear cart</button>
              <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              <p>Taxes and the final payable amount will be confirmed at checkout.</p>
              {items.length === 1 && items[0].quantity === 1 ? (
                <Link to={`/booking?service=${items[0].serviceId}`} onClick={closeCart} className="nf-button-primary">Book this service</Link>
              ) : (
                <button type="button" disabled className="nf-button-primary nf-cart-checkout-disabled">Cart checkout in Phase 2</button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
