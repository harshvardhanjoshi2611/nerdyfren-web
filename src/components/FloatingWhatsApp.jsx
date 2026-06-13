import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { buildWhatsAppLink } from '../lib/contactConfig';

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

  const href = buildWhatsAppLink('Hi NerdyFren, I would like to talk to a coordinator.');

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
