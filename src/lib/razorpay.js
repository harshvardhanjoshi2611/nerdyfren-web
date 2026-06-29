import { paymentsApi } from './api';
import { runtimeConfig } from './runtimeConfig';

let checkoutScriptPromise;

export class PaymentCancelledError extends Error {
  constructor(message = 'Payment was cancelled.') {
    super(message);
    this.name = 'PaymentCancelledError';
  }
}

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (checkoutScriptPromise) return checkoutScriptPromise;
  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => window.Razorpay
      ? resolve(window.Razorpay)
      : reject(new Error('Razorpay Checkout did not load.'));
    script.onerror = () => {
      checkoutScriptPromise = undefined;
      reject(new Error('Secure checkout could not be loaded. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return checkoutScriptPromise;
}

export async function startRazorpayCheckout({ booking, user }) {
  const requestId = booking.request_id || booking.booking_ref;
  const trackingToken = booking.tracking_token || booking.trackingToken;
  const order = await paymentsApi.createRazorpayOrder(requestId, trackingToken);
  const key = order.key_id || runtimeConfig.razorpayKeyId;
  if (!key) throw new Error('Razorpay is not configured for this site.');
  const Razorpay = await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };
    const checkout = new Razorpay({
      key,
      order_id: order.order_id,
      amount: order.amount_subunits,
      currency: order.currency,
      name: 'NerdyFren.com',
      description: booking.service_name || 'Creator editing service',
      prefill: {
        name: order.prefill?.name || booking.customer_name || user?.name || '',
        email: order.prefill?.email || booking.customer_email || user?.email || '',
        contact: order.prefill?.contact || booking.customer_phone || user?.mobile || '',
      },
      notes: { request_id: requestId },
      theme: { color: '#F2A93B' },
      handler: async (response) => {
        try {
          const verified = await paymentsApi.verifyRazorpay({
            requestId,
            ...(trackingToken ? { tracking_token: trackingToken } : {}),
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          finish(resolve, verified);
        } catch (error) {
          finish(reject, error);
        }
      },
      modal: {
        ondismiss: () => finish(reject, new PaymentCancelledError()),
      },
    });
    checkout.on('payment.failed', () => {
      finish(reject, new Error('Payment failed. Your booking has not been marked paid.'));
    });
    checkout.open();
  });
}
