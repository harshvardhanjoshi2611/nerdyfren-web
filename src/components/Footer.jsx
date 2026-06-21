import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';
import { publicContactConfig } from '../lib/contactConfig';
import { getRolePath } from '../lib/roleNavigation';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function isSafePublicLink(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (url.startsWith('/')) return true;
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function FooterLink({ label, url, badge }) {
  if (!isSafePublicLink(url)) {
    return badge ? <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">{label}<span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{badge}</span></span> : null;
  }
  const className = "inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-white";
  const content = <>{label}{badge && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{badge}</span>}</>;
  return url.startsWith('/')
    ? <Link to={url} className={className}>{content}</Link>
    : <a href={url} target="_blank" rel="noreferrer" className={className}>{content}<ArrowUpRight size={12} /></a>;
}

export default function Footer() {
  const { activeRole, isAuthenticated } = useAuth();
  const { content } = useSiteContent();
  const managedLinks = content.footer_links || [];
  const socialLinks = content.social_links || [];
  const findManaged = (label, fallback) => managedLinks.find((item) => normalize(item.label) === normalize(label) && item.is_active !== false)?.url || fallback;
  const findSocial = (platform, managedLabel, fallback) => socialLinks.find((item) => normalize(item.platform || item.label).includes(platform) && item.is_active !== false)?.url || findManaged(managedLabel, fallback);
  const knownLabels = new Set(['services', 'track request', 'track order', 'become an editor', 'login as nerd', 'privacy', 'terms', 'cancellation policy', 'refund policy', 'instagram', 'our mothership', 'nerd merchandise', 'whatsapp']);
  const additional = managedLinks.filter((item) => item.is_active !== false && !knownLabels.has(normalize(item.label)) && isSafePublicLink(item.url));
  const supportEmail = content?.settings?.support_email || publicContactConfig.supportEmail;

  const groups = [
    ['Main', [
      ['Services', findManaged('Services', '/#services')],
      ['Track Request', isAuthenticated ? getRolePath(activeRole) : findManaged('Track Request', '/track')],
      ...additional.map((item) => [item.label, item.url]),
    ]],
    ['Career', [
      ['Become an Editor', findManaged('Become an Editor', '/signup')],
      ['Login as Nerd', findManaged('Login as Nerd', '/editor/login')],
    ]],
    ['Legal', [
      ['Privacy', findManaged('Privacy', '/privacy')],
      ['Terms', findManaged('Terms', '/terms')],
      ['Cancellation Policy', findManaged('Cancellation Policy', '/cancellation-policy')],
    ]],
    ['Social', [
      ['Instagram', findSocial('instagram', 'Instagram', publicContactConfig.instagramUrl)],
      ['Our Mothership', findSocial('mothership', 'Our Mothership', publicContactConfig.mothershipUrl)],
      ['Nerd Merchandise', findSocial('merch', 'Nerd Merchandise', publicContactConfig.merchUrl), 'Coming soon'],
    ]],
  ];

  return (
    <footer className="border-t border-white/[0.07] bg-black/20 py-14 sm:py-16">
      <div className="container-shell grid gap-12 lg:grid-cols-[1.35fr_2fr]">
        <div>
          <Logo />
          <p className="mt-5 text-xl font-semibold tracking-tight text-slate-300">You shoot. We edit.</p>
          {supportEmail && <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm text-slate-600 transition hover:text-white">{supportEmail}</a>}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {groups.map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">{title}</p>
              <div className="mt-5 flex flex-col items-start gap-3.5">
                {links.map(([label, url, badge]) => <FooterLink key={label} label={label} url={url} badge={badge} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container-shell mt-12 border-t border-white/[0.07] pt-6 text-xs text-slate-700">© {new Date().getFullYear()} NerdyFren.com</div>
    </footer>
  );
}
