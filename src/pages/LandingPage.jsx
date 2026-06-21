import {
  ArrowRight,
  Captions,
  CheckCircle2,
  FileDown,
  Film,
  MessageCircle,
  Music2,
  Scissors,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import useSiteContent from '../hooks/useSiteContent';
import { buildWhatsAppLink } from '../lib/contactConfig';

const services = [
  {
    id: 'trend-hopper',
    name: 'Trend Hopper',
    tag: 'Trend Hopper',
    description: 'Quick-turnaround trend-based reel edit for creators who want to jump on what is currently working.',
    bullets: ['Trend-style cut', 'Hook + pacing optimized', 'Captions / beat sync included', 'Fast delivery'],
    price: 'Starting ₹3,500',
    icon: TrendingUp,
  },
  {
    id: 'video-reel',
    name: 'Video Editing',
    tag: 'Reels & Shorts / Short Reel',
    description: 'Under 90 seconds, cut for the scroll. Fast, clean, effective.',
    bullets: ['Under 90 seconds', 'Max 2 revisions', 'Upload files or share links', 'Audio & edit references'],
    price: '₹2,500',
    icon: Smartphone,
  },
  {
    id: 'video-copy',
    name: 'Video + Copy / Text',
    tag: 'Reel + Text',
    description: 'Up to 1 minute with punchy on-screen copy that keeps them watching.',
    bullets: ['Up to 1 minute', 'Copy & text overlay included', 'Max 2 revisions', 'Upload files or share links'],
    price: '₹3,000',
    icon: Captions,
    popular: true,
  },
  {
    id: 'podcast',
    name: 'Podcast Editing',
    tag: 'Podcast / Full Package',
    description: 'Full episode edit + 1 reel. The complete podcast drop, handled.',
    bullets: ['Up to 45 min episode edit', '1 promotional reel', 'Precap included', 'Basic animation'],
    price: '₹5,000',
    icon: Music2,
  },
];

const pipeline = [
  { label: 'RAW', detail: 'Source files imported', icon: FileDown },
  { label: 'RAW', detail: 'Selects pulled & trimmed', icon: Scissors },
  { label: '▶ wait for it…', detail: 'Colour, pacing & cuts in motion', icon: Film, state: 'active' },
  { label: '▶ on the beat', detail: 'Synced to music, captions locked', icon: Music2, state: 'active' },
  { label: '▶ ready to post', detail: 'Delivered to your inbox', icon: CheckCircle2, state: 'done' },
];

const processSteps = [
  ['Choose package', 'Pick the edit type that fits your project — trend reel, short, video + copy, or a full podcast drop.'],
  ['Upload raw footage or links', 'Drop your raw files or share a Drive / WeTransfer link. Any format works.'],
  ['NerdyFren editor cuts it', 'A real human editor takes your footage and turns it into something people actually watch.'],
  ['Final content delivered', 'Get the finished file in 48 hours, ready to upload. Up to 2 revision rounds included.'],
];

function getCmsSocialUrl(content, platform) {
  const match = (content.social_links || []).find((item) => (
    item.is_active !== false
    && String(item.platform || item.label || '').toLowerCase().includes(platform)
  ));
  return match?.url || '';
}

export default function LandingPage() {
  const { content } = useSiteContent();
  const whatsappHref = getCmsSocialUrl(content, 'whatsapp')
    || buildWhatsAppLink('Hi NerdyFren, I am not sure which editing package is right for me.');

  return (
    <div className="nf-public nf-home min-h-screen">
      <Navbar />
      <main id="top">
        <section className="nf-hero">
          <div className="nf-hero-grain" />
          <div className="nf-container nf-hero-inner">
            <p className="nf-hero-eyebrow">Post production studio</p>
            <h1 className="nf-hero-title">You shoot.<br /><span>We edit.</span></h1>
            <p className="nf-hero-sub">Reels, text overlays &amp; podcast editing — send the raw footage, we&apos;ll send back content that lands.</p>
            <div className="nf-hero-cta">
              <Link to="/booking" className="nf-button-primary">Book Editor <ArrowRight size={17} /></Link>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="nf-hero-whatsapp">
                  <span><MessageCircle size={12} /></span> Not sure yet? Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="nf-stats-wrap">
          <div className="nf-stats-card">
            {[
              ['48h', 'Turnaround'],
              ['2×', 'Revision rounds'],
              ['100%', 'Human editors'],
              ['Ready', 'To post, every cut'],
            ].map(([number, label]) => (
              <div className="nf-stat" key={label}>
                <p className="nf-stat-number">{number}</p>
                <p className="nf-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <section id="services" className="nf-services">
          <div className="nf-container nf-section-heading">
            <p className="nf-eyebrow">Post production</p>
            <h2>What we do</h2>
            <p>Pick your package, send the footage, get back the final cut.</p>
          </div>
          <div className="nf-container nf-service-grid">
            {services.map(({ id, name, tag, description, bullets, price, icon: Icon, popular }) => (
              <article key={id} className={`nf-service-card ${popular ? 'is-featured' : ''}`}>
                {popular && <span className="nf-service-badge">Most Popular</span>}
                <div className="nf-service-icon"><Icon size={27} strokeWidth={1.8} /></div>
                <p className="nf-service-tag">{tag}</p>
                <h3>{name}</h3>
                <p className="nf-service-description">{description}</p>
                <ul>
                  {bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
                <div className="nf-service-foot">
                  <p className="nf-service-price">{price}<span>one-time · INR</span></p>
                  <Link to={`/booking?service=${id}`} className="nf-button-small">Book Now</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nf-pipeline">
          <div className="nf-container nf-section-heading">
            <p className="nf-eyebrow">From raw to ready</p>
            <h2>Raw footage in. Ready-to-post out.</h2>
            <p>A quick visual flow of how your rough clips become scroll-stopping edits.</p>
          </div>
          <div className="nf-container">
            <div className="nf-pipeline-row">
              {pipeline.map(({ label, detail, icon: Icon, state }) => (
                <div key={`${label}-${detail}`} className={`nf-pipeline-card ${state ? `is-${state}` : ''}`}>
                  <div className="nf-pipeline-icon"><Icon size={32} strokeWidth={1.7} /></div>
                  <p className="nf-pipeline-label">{label}</p>
                  <p className="nf-pipeline-detail">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="nf-process">
          <div className="nf-container nf-section-heading">
            <p className="nf-eyebrow">The process</p>
            <h2>Four cuts. No back-and-forth.</h2>
          </div>
          <div className="nf-container nf-process-track">
            <div className="nf-process-line" />
            {processSteps.map(([title, description], index) => (
              <article className="nf-process-step" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nf-human-note">
          <div className="nf-container">
            <Sparkles size={18} /> Your Nerdy Fren turns raw footage into ready-to-post content. <strong>100% human editors.</strong>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
