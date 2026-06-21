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
    return badge ? <span className="nf-footer-link is-muted">{label}<span className="nf-footer-badge">{badge}</span></span> : null;
  }
  const className = 'nf-footer-link';
  const content = <>{label}{badge && <span className="nf-footer-badge">{badge}</span>}</>;
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
    <footer className="nf-footer">
      <div className="nf-container">
        <div className="nf-footer-grid">
          <div className="nf-footer-brand">
            <Logo tone="inverse" />
            <p>You shoot. We edit.<br />Post-production built for creators.</p>
            {supportEmail && <a href={`mailto:${supportEmail}`} className="nf-footer-email">{supportEmail}</a>}
          </div>
          {groups.map(([title, links]) => (
            <div className="nf-footer-column" key={title}>
              <h2>{title}</h2>
              <div>
                {links.map(([label, url, badge]) => <FooterLink key={label} label={label} url={url} badge={badge} />)}
              </div>
            </div>
          ))}
        </div>
        <div className="nf-footer-bottom">
          <span>© {new Date().getFullYear()} NerdyFren.com · All rights reserved</span>
          <span>Made for creators who just want to post.</span>
        </div>
      </div>
    </footer>
  );
}
