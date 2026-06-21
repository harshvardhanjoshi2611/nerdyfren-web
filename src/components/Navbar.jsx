import { LogOut, Menu, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildWhatsAppLink } from '../lib/contactConfig';
import { getRolePath } from '../lib/roleNavigation';
import Logo from './Logo';

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
      <header className="nf-navbar">
        <div className="nf-container nf-navbar-inner">
          <Logo tone="surface" />
          <nav className="nf-navbar-links" aria-label="Primary navigation">
            <a href="/#services">Services</a>
            <a href="/#process">How it works</a>
          </nav>
          <div className="nf-navbar-actions">
            <a href="/#services" className="nf-nav-cta">Get Started</a>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="nf-nav-ghost">Dashboard</Link>
                <button type="button" onClick={endSession} className="nf-nav-icon" aria-label="Sign out"><LogOut size={17} /></button>
              </>
            ) : (
              <>
                <Link to="/signin" className="nf-nav-ghost">Sign In</Link>
                <Link to="/signup" className="nf-nav-solid">Sign Up</Link>
              </>
            )}
            <button type="button" className="nf-menu-button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className={`nf-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button type="button" className="nf-drawer-backdrop" onClick={close} aria-label="Close menu" />
        <aside className="nf-drawer-panel">
          <div className="nf-drawer-head">
            <Logo tone="inverse" />
            <button type="button" onClick={close} className="nf-drawer-close" aria-label="Close menu"><X size={21} /></button>
          </div>
          <nav className="nf-drawer-links" aria-label="Mobile navigation">
            {[
              ['Services', '/#services'],
              ['How it works', '/#process'],
              ['Get Started', '/#services'],
            ].map(([label, href]) => <a key={label} href={href} onClick={close}>{label}</a>)}
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} onClick={close}>Dashboard</Link>
                <button type="button" onClick={() => { endSession(); close(); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={close}>Sign In</Link>
                <Link to="/signup" onClick={close}>Sign Up</Link>
                <Link to="/editor/login" onClick={close}>Login as Nerd</Link>
              </>
            )}
          </nav>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="nf-drawer-whatsapp" onClick={close}><MessageCircle size={18} /> Chat on WhatsApp</a>
          ) : (
            <button type="button" disabled className="nf-drawer-whatsapp is-disabled"><MessageCircle size={18} /> Chat on WhatsApp</button>
          )}
        </aside>
      </div>
    </>
  );
}
