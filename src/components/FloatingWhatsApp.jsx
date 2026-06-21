import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildCoordinatorMessage, buildWhatsAppLink } from '../lib/contactConfig';
import { serviceMeta } from '../lib/format';

const visiblePaths = new Set([
  '/',
  '/services',
  '/book',
  '/booking',
  '/booking/success',
  '/dashboard',
  '/dashboard/client',
  '/track',
]);

export default function FloatingWhatsApp() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const { content } = useSiteContent();
  if (!visiblePaths.has(pathname)) return null;

  const params = new URLSearchParams(search);
  let recentBooking = null;
  try {
    recentBooking = JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  } catch {
    recentBooking = null;
  }
  const useRecentBooking = pathname === '/booking/success';
  const requestId = params.get('id')
    || params.get('request_id')
    || (useRecentBooking ? recentBooking?.request_id || recentBooking?.booking_ref : '');
  const serviceType = useRecentBooking ? recentBooking?.service_type : '';
  const contextLabels = {
    '/': 'Homepage',
    '/services': 'Services',
    '/book': 'Booking form',
    '/booking': 'Booking form',
    '/booking/success': 'Booking confirmed',
    '/dashboard': 'Creator dashboard',
    '/dashboard/client': 'Creator dashboard',
    '/track': 'Project tracking',
  };
  const cmsWhatsAppUrl = (content.social_links || []).find((item) => (
    item.is_active !== false
    && String(item.platform || item.label || '').toLowerCase().includes('whatsapp')
  ))?.url;
  const href = cmsWhatsAppUrl || buildWhatsAppLink(buildCoordinatorMessage({
    requestId,
    customerName: user?.name || (useRecentBooking ? recentBooking?.customer_name : ''),
    service: useRecentBooking
      ? recentBooking?.service_name || serviceMeta[serviceType]?.name
      : '',
    context: contextLabels[pathname],
  }));

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className="nf-whatsapp-float is-disabled"
        aria-label="Coordinator chat is temporarily unavailable"
        title="WhatsApp support is temporarily unavailable"
      >
        <MessageCircle size={19} />
        <span className="hidden sm:inline">Coordinator unavailable</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="nf-whatsapp-float"
      aria-label="Chat with NerdyFren on WhatsApp"
    >
      <MessageCircle size={19} />
      <span>Chat on WhatsApp</span>
    </a>
  );
}
