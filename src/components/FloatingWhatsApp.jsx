import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const visiblePaths = new Set([
  '/',
  '/services',
  '/book',
  '/booking/success',
  '/dashboard',
  '/track',
]);

export default function FloatingWhatsApp() {
  const { pathname } = useLocation();
  if (!visiblePaths.has(pathname)) return null;

  const number = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const message = encodeURIComponent('Hi NerdyFren, I would like to talk to a coordinator.');
  const href = number ? `https://wa.me/${number}?text=${message}` : 'https://wa.me/';

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
