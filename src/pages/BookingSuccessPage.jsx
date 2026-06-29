import { ArrowRight, CheckCircle2, CreditCard, LoaderCircle, MessageCircle, ReceiptIndianRupee } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildCoordinatorMessage, buildWhatsAppLink } from '../lib/contactConfig';
import { formatMoney, getPriceBreakdown, serviceMeta } from '../lib/format';
import { getApiError, paymentsApi } from '../lib/api';
import { PaymentCancelledError, startRazorpayCheckout } from '../lib/razorpay';

function recentBooking() {
  try {
    return JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  } catch {
    return null;
  }
}

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { content } = useSiteContent();
  const storedBooking = location.state || recentBooking();
  const requestId = params.get('requestId') || storedBooking?.request_id || storedBooking?.booking_ref || '';
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const booking = storedBooking || (requestId ? { request_id: requestId } : null);

  useEffect(() => {
    if (!requestId) return;
    paymentsApi.status(requestId, storedBooking?.tracking_token)
      .then(setPaymentStatus)
      .catch(() => {});
  }, [requestId, storedBooking?.tracking_token]);
  const serviceName = booking?.service_name
    || serviceMeta[booking?.service_type]?.name
    || booking?.service_type;
  const cmsWhatsApp = (content.social_links || []).find((item) => (
    item.is_active !== false
    && String(item.platform || item.label || '').toLowerCase().includes('whatsapp')
  ))?.url;
  const whatsappHref = cmsWhatsApp || buildWhatsAppLink(buildCoordinatorMessage({
    requestId,
    customerName: booking?.customer_name || user?.name,
    service: serviceName,
    context: booking?.payment_status === 'paid' ? 'Razorpay payment confirmed' : 'Payment support',
  }));

  if (!booking || !requestId) {
    return (
      <main className="nf-public nf-success-page">
        <div className="nf-success-card">
          <Logo tone="surface" />
          <h1>No recent booking found.</h1>
          <p>Open your client dashboard to view account-owned requests.</p>
          <Link to="/dashboard/client" className="nf-button-primary">Open dashboard</Link>
        </div>
      </main>
    );
  }

  const paymentState = params.get('payment') || booking.payment_state || booking.payment_status;
  const paid = paymentStatus?.payment_status === 'paid'
    || (booking.payment_status === 'paid' && paymentState === 'success');
  const cancelled = paymentState === 'cancelled';
  const pricing = getPriceBreakdown(booking);
  const retryPayment = async () => {
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const verified = await startRazorpayCheckout({ booking, user });
      const paidBooking = { ...booking, ...verified, payment_status: 'paid' };
      sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(paidBooking));
      setPaymentStatus({ payment_status: 'paid', payable: false });
      navigate(`/booking/success?requestId=${encodeURIComponent(requestId)}&payment=success`, {
        replace: true,
        state: paidBooking,
      });
    } catch (requestError) {
      setPaymentError(requestError instanceof PaymentCancelledError
        ? 'Payment was not completed. Try again or contact WhatsApp support.'
        : getApiError(requestError, 'Payment was not completed. Try again or contact WhatsApp support.'));
    } finally {
      setPaymentBusy(false);
    }
  };
  return (
    <main className="nf-public nf-success-page">
      <div className="nf-success-card">
        <Logo tone="surface" />
        <div className={`nf-success-icon ${paid ? '' : 'is-pending'}`}>
          {paid ? <CheckCircle2 size={32} /> : <ReceiptIndianRupee size={30} />}
        </div>
        <p className="nf-eyebrow">{paid ? 'Payment successful' : cancelled ? 'Payment cancelled' : 'Payment failed'}</p>
        <h1>{paid ? 'Your editor request is confirmed.' : 'Your request is safe.'}</h1>
        <p className="nf-success-intro">
          {paid
            ? 'The Razorpay signature was verified by NerdyFren. Your project is ready for assignment.'
            : `${cancelled ? 'Checkout was cancelled' : 'Payment was not completed'}. Your booking remains Payment Pending and nothing was marked paid.`}
        </p>

        <dl className="nf-success-summary">
          <div><dt>Request ID</dt><dd>{requestId}</dd></div>
          <div><dt>Service</dt><dd>{serviceName}</dd></div>
          <div><dt>Base price</dt><dd>{formatMoney(pricing.base_amount)}</dd></div>
          <div><dt>GST @ {pricing.gst_rate}%</dt><dd>{formatMoney(pricing.gst_amount)}</dd></div>
          <div><dt>{paid ? 'Total paid' : 'Total payable'}</dt><dd>{formatMoney(pricing.total_amount)}</dd></div>
          <div><dt>Payment status</dt><dd>{paid ? 'Paid' : 'Payment Pending'}</dd></div>
        </dl>

        {paymentError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{paymentError}</p>}

        <div className="nf-success-actions">
          {!paid && (paymentStatus?.payable || booking.tracking_token) && (
            <button disabled={paymentBusy} onClick={retryPayment} className="nf-button-primary">
              {paymentBusy ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
              Pay securely with Razorpay
            </button>
          )}
          <Link to={`/track?requestId=${encodeURIComponent(requestId)}`} className="nf-button-primary">Track Project <ArrowRight size={17} /></Link>
          <Link to="/booking" className="nf-booking-secondary">Book another edit</Link>
          <Link to="/" className="nf-booking-secondary">Go to home</Link>
          <Link to="/dashboard/client" className="nf-booking-secondary">{paid ? 'Go to Dashboard' : 'Retry from Dashboard'}</Link>
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="nf-booking-secondary"><MessageCircle size={16} /> WhatsApp support</a>}
        </div>
      </div>
    </main>
  );
}
