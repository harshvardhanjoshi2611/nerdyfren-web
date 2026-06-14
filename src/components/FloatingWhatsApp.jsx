import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { buildCoordinatorMessage, buildWhatsAppLink } from '../lib/contactConfig';
import { serviceMeta } from '../lib/format';

const visiblePaths = new Set([
  '/',
  '/services',
  '/book',
  '/booking',
  '/booking/success',
  '/dashboard',
  '/track',
]);

export default function FloatingWhatsApp() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
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
    '/track': 'Project tracking',
  };
  const href = buildWhatsAppLink(buildCoordinatorMessage({
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
        className="fixed bottom-5 right-5 z-[90] inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-500 opacity-80 shadow-2xl sm:bottom-7 sm:right-7"
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
      className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-emerald-950/40 transition hover:-translate-y-1 hover:bg-emerald-400 sm:bottom-7 sm:right-7"
      aria-label="Talk to Coordinator on WhatsApp"
    >
      <MessageCircle size={19} />
      <span className="hidden sm:inline">Talk to Coordinator</span>
    </a>
  );
}
