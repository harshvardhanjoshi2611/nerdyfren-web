import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { buildWhatsAppLink, publicContactConfig } from '../lib/contactConfig';

const managedLabels = new Set([
  'instagram',
  'nerd merchandise',
  'our mothership',
  'whatsapp',
]);

function isSafePublicLink(url) {
  if (url.startsWith('/')) return true;
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { content } = useSiteContent();
  const links = (content?.footer_links || []).filter((item) => (
    isSafePublicLink(item.url)
    && !managedLabels.has(item.label.trim().toLowerCase())
  ));
  const contactLinks = [
    ['WhatsApp', buildWhatsAppLink('Hi NerdyFren, I need help with a project.')],
    ['Instagram', publicContactConfig.instagramUrl],
    ['Our Mothership', publicContactConfig.mothershipUrl],
    ['Nerd Merchandise', publicContactConfig.merchUrl],
  ].filter(([, url]) => Boolean(url));
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">{content?.settings?.support_email}</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-500">
          <Link to="/services" className="hover:text-white">Services</Link>
          <Link to={isAuthenticated ? '/dashboard' : '/track'} className="hover:text-white">Track order</Link>
          {contactLinks.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="hover:text-white">{label}</a>
          ))}
          {links.map((item) => item.url.startsWith('/') ? <Link key={item.id} to={item.url} className="hover:text-white">{item.label}</Link> : <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="hover:text-white">{item.label}</a>)}
          <Link to="/admin/login" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
