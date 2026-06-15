import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildWhatsAppLink, publicContactConfig } from '../lib/contactConfig';
import { getRolePath } from '../lib/roleNavigation';

const managedLabels = new Set([
  'instagram',
  'login as nerd',
  'nerd merchandise',
  'our mothership',
  'privacy',
  'refund policy',
  'terms',
  'whatsapp',
]);

function isSafePublicLink(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (url.startsWith('/')) return true;
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export default function Footer() {
  const { activeRole, isAuthenticated } = useAuth();
  const { content } = useSiteContent();
  const links = (content?.footer_links || []).filter((item) => (
    isSafePublicLink(item.url)
    && !managedLabels.has((item.label || '').trim().toLowerCase())
  ));
  const contactLinks = [
    ['WhatsApp', buildWhatsAppLink('Hi NerdyFren, I need help with a project.')],
    ['Instagram', publicContactConfig.instagramUrl],
    ['Our Mothership', publicContactConfig.mothershipUrl],
    ['Nerd Merchandise', publicContactConfig.merchUrl],
  ].filter(([, url]) => Boolean(url));
  const supportEmail = publicContactConfig.supportEmail || content?.settings?.support_email;
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          {supportEmail && <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm text-slate-500 hover:text-white">{supportEmail}</a>}
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-500">
          <Link to="/services" className="hover:text-white">Services</Link>
          <Link to={isAuthenticated ? getRolePath(activeRole) : '/track'} className="hover:text-white">Track order</Link>
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/refund" className="hover:text-white">Refund policy</Link>
          {contactLinks.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="hover:text-white">{label}</a>
          ))}
          {links.map((item) => item.url.startsWith('/') ? <Link key={`${item.label}-${item.url}`} to={item.url} className="hover:text-white">{item.label}</Link> : <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="hover:text-white">{item.label}</a>)}
          <Link to="/signin" className="hover:text-white">Login as Nerd</Link>
          <Link to="/signin" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
