import { ArrowRight, CheckCircle2, MessageCircle, ReceiptIndianRupee } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildCoordinatorMessage, buildWhatsAppLink } from '../lib/contactConfig';
import { formatMoney, serviceMeta } from '../lib/format';

function recentBooking() {
  try {
    return JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  } catch {
    return null;
  }
}

export default function BookingSuccessPage() {
  const location = useLocation();
  const { user } = useAuth();
  const { content } = useSiteContent();
  const booking = location.state || recentBooking();
  const requestId = booking?.request_id || booking?.booking_ref || '';
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

  if (!booking) {
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

  const paid = booking.payment_status === 'paid';
  return (
    <main className="nf-public nf-success-page">
      <div className="nf-success-card">
        <Logo tone="surface" />
        <div className={`nf-success-icon ${paid ? '' : 'is-pending'}`}>
          {paid ? <CheckCircle2 size={32} /> : <ReceiptIndianRupee size={30} />}
        </div>
        <p className="nf-eyebrow">{paid ? 'Payment successful' : 'Payment pending'}</p>
        <h1>{paid ? 'Your editor request is confirmed.' : 'Your request is saved.'}</h1>
        <p className="nf-success-intro">
          {paid
            ? 'The Razorpay signature was verified by NerdyFren. Your project is ready for assignment.'
            : 'No payment has been confirmed yet. You can safely continue from your dashboard.'}
        </p>

        <dl className="nf-success-summary">
          <div><dt>Request ID</dt><dd>{requestId}</dd></div>
          <div><dt>Service</dt><dd>{serviceName}</dd></div>
          <div><dt>{paid ? 'Amount paid' : 'Amount due'}</dt><dd>{formatMoney(booking.amount)}</dd></div>
          <div><dt>Payment</dt><dd>{paid ? 'Verified' : 'Pending'}</dd></div>
        </dl>

        <div className="nf-success-actions">
          <Link to={`/track?id=${encodeURIComponent(requestId)}`} className="nf-button-primary">Track Request <ArrowRight size={17} /></Link>
          <Link to="/dashboard/client" className="nf-booking-secondary">Client dashboard</Link>
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="nf-booking-secondary"><MessageCircle size={16} /> WhatsApp support</a>}
        </div>
      </div>
    </main>
  );
}
