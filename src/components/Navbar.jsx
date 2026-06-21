import { LogOut, Menu, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildWhatsAppLink } from '../lib/contactConfig';
import { getRolePath } from '../lib/roleNavigation';

function getCmsWhatsApp(content) {
  return (content.social_links || []).find((item) => (
    item.is_active !== false
    && String(item.platform || item.label || '').toLowerCase().includes('whatsapp')
  ))?.url || buildWhatsAppLink('Hi NerdyFren, I would like to know more about your editing services.');
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { activeRole, isAuthenticated, endSession } = useAuth();
  const { content } = useSiteContent();
  const dashboardPath = getRolePath(activeRole);
  const whatsappHref = getCmsWhatsApp(content);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-canvas/80 backdrop-blur-xl">
      <div className="container-shell flex min-h-[72px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          <a href="/#services" className="text-sm text-slate-400 transition hover:text-white">Services</a>
          <a href="/#process" className="text-sm text-slate-400 transition hover:text-white">How it works</a>
          <a href="/#services" className="text-sm text-slate-400 transition hover:text-white">Get Started</a>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-secondary !px-4 !py-2.5">Dashboard</Link>
              {activeRole === 'client' && <Link to="/dashboard/client#bookings" className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white">Track Project</Link>}
              <button type="button" onClick={endSession} className="rounded-lg p-2.5 text-slate-500 hover:text-white" aria-label="Sign out"><LogOut size={17} /></button>
            </>
          ) : (
            <>
              <Link to="/signin" className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white">Sign In</Link>
              <Link to="/signup" className="btn-secondary !px-4 !py-2.5">Sign Up</Link>
            </>
          )}
        </div>
        <button type="button" className="rounded-lg p-2 text-slate-300 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu size={23} />
        </button>
      </div>
      </header>

      <div className={`fixed inset-0 z-[60] transition lg:hidden ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
        <button type="button" className={`absolute inset-0 bg-black/70 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={close} aria-label="Close menu" />
        <aside className={`absolute right-0 top-0 flex h-dvh w-[min(88vw,390px)] flex-col border-l border-white/10 bg-canvas p-6 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={close} className="rounded-lg p-2 text-slate-300" aria-label="Close menu"><X size={23} /></button>
          </div>
          <nav className="mt-10 flex flex-col" aria-label="Mobile navigation">
            {[
              ['Services', '/#services'],
              ['How it works', '/#process'],
              ['Get Started', '/#services'],
            ].map(([label, href]) => <a key={label} href={href} onClick={close} className="border-b border-white/[0.07] py-4 text-lg font-semibold text-slate-200">{label}</a>)}
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} onClick={close} className="border-b border-white/[0.07] py-4 text-lg font-semibold text-slate-200">Dashboard</Link>
                <button type="button" onClick={() => { endSession(); close(); }} className="border-b border-white/[0.07] py-4 text-left text-lg font-semibold text-slate-200">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={close} className="border-b border-white/[0.07] py-4 text-lg font-semibold text-slate-200">Sign In</Link>
                <Link to="/signup" onClick={close} className="border-b border-white/[0.07] py-4 text-lg font-semibold text-slate-200">Sign Up</Link>
                <Link to="/editor/login" onClick={close} className="border-b border-white/[0.07] py-4 text-lg font-semibold text-slate-200">Login as Nerd</Link>
              </>
            )}
          </nav>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary mt-auto w-full" onClick={close}><MessageCircle size={18} /> Chat on WhatsApp</a>
          ) : (
            <button type="button" disabled className="btn-secondary mt-auto w-full cursor-not-allowed opacity-60"><MessageCircle size={18} /> Chat on WhatsApp</button>
          )}
        </aside>
      </div>
    </>
  );
}
