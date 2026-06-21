import {
  ArrowRight,
  Captions,
  Check,
  Clapperboard,
  Film,
  MessageCircle,
  MousePointerClick,
  Play,
  Send,
  Sparkles,
  Upload,
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
    tag: 'Fast-turn trend edit',
    description: 'Quick-turnaround trend-based reel edit for creators who want to jump on what is currently working.',
    bullets: ['Trend-style cut', 'Hook + pacing optimized', 'Captions / beat sync included', 'Fast delivery'],
    price: 'Starting ₹3,500',
  },
  {
    id: 'video-reel',
    name: 'Video Editing',
    tag: 'Reels & Shorts / Short Reel',
    description: 'Under 90 seconds, cut for the scroll. Fast, clean, effective.',
    bullets: ['Under 90 seconds', 'Max 2 revisions', 'Upload files or share links', 'Audio & edit references'],
    price: '₹2,500',
  },
  {
    id: 'video-copy',
    name: 'Video + Copy / Text',
    tag: 'Reel + Text',
    description: 'Up to 1 minute with punchy on-screen copy that keeps them watching.',
    bullets: ['Up to 1 minute', 'Copy & text overlay included', 'Max 2 revisions', 'Upload files or share links'],
    price: '₹3,000',
    popular: true,
  },
  {
    id: 'podcast',
    name: 'Podcast Editing',
    tag: 'Podcast / Full Package',
    description: 'Full episode edit + 1 reel. The complete podcast drop, handled.',
    bullets: ['Up to 45 min episode edit', '1 promotional reel', 'Precap included', 'Basic animation'],
    price: '₹5,000',
  },
];

const pipeline = [
  { label: 'RAW', detail: 'camera roll', icon: Film },
  { label: 'RAW', detail: 'rough clip', icon: Clapperboard },
  { label: '▶ wait for it…', detail: 'hook added', icon: Play },
  { label: '▶ on the beat', detail: 'cut + captions', icon: Captions },
  { label: '▶ ready to post', detail: 'final export', icon: Sparkles },
];

const processSteps = [
  { title: 'Choose package', icon: MousePointerClick },
  { title: 'Upload raw footage or links', icon: Upload },
  { title: 'NerdyFren editor cuts it', icon: Clapperboard },
  { title: 'Final content delivered', icon: Send },
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
    <div className="noise min-h-screen overflow-x-hidden bg-canvas">
      <Navbar />
      <main>
        <section className="aurora relative flex min-h-[680px] items-center overflow-hidden pb-20 pt-32 sm:min-h-[760px] lg:pt-36">
          <div className="absolute inset-0 bg-grid bg-[size:52px_52px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
          <div className="pointer-events-none absolute -right-32 top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="container-shell relative">
            <div className="max-w-5xl">
              <span className="eyebrow"><Sparkles size={13} /> Post production studio</span>
              <h1 className="mt-7 text-[clamp(4rem,12vw,9.5rem)] font-extrabold leading-[0.82] tracking-[-0.075em] text-white">
                You shoot.<br /><span className="text-gradient">We edit.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
                Reels, text overlays &amp; podcast editing — send the raw footage, we&apos;ll send back content that lands.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/booking" className="btn-primary !px-7 !py-3.5">Book Editor <ArrowRight size={18} /></Link>
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary !px-7 !py-3.5">
                    <MessageCircle size={18} /> Not sure yet? Chat on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="NerdyFren highlights" className="border-y border-white/[0.08] bg-white/[0.025]">
          <div className="container-shell grid divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ['100%', 'human editors'],
              ['4', 'focused packages'],
              ['2', 'revisions on core edits'],
            ].map(([number, label]) => (
              <div key={label} className="px-4 py-7 text-center">
                <p className="text-3xl font-extrabold tracking-tight text-white">{number}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="scroll-mt-20 py-24">
          <div className="container-shell">
            <div className="max-w-3xl">
              <span className="eyebrow">Services</span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl">Pick the edit. Send the footage.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Focused packages for the content creators need to ship most.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service, index) => (
                <article key={service.id} className={`panel relative flex min-w-0 flex-col overflow-hidden p-6 transition hover:-translate-y-1 hover:border-violet-400/30 ${service.popular ? 'border-violet-400/40 shadow-glow' : ''}`}>
                  {service.popular && <span className="absolute right-4 top-4 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Most Popular</span>}
                  <span className="font-mono text-xs text-violet-300">0{index + 1}</span>
                  <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">{service.tag}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{service.name}</h3>
                  <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-400">{service.description}</p>
                  <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-6">
                    {service.bullets.map((bullet) => <li key={bullet} className="flex gap-2.5 text-sm text-slate-300"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />{bullet}</li>)}
                  </ul>
                  <div className="mt-auto pt-8">
                    <p className="text-2xl font-extrabold tracking-tight text-white">{service.price}</p>
                    <p className="mt-1 text-xs text-slate-600">one-time · INR</p>
                    <Link to={`/booking?service=${service.id}`} className="btn-primary mt-5 w-full">Book Now <ArrowRight size={16} /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.018] py-24">
          <div className="container-shell">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">From raw to ready</span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl">Raw footage in. Ready-to-post out.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">A quick visual flow of how your rough clips become scroll-stopping edits.</p>
            </div>
            <div className="relative mt-12 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="absolute left-[8%] right-[8%] top-1/2 hidden h-px bg-gradient-to-r from-violet-500/20 via-cyan-400/50 to-emerald-400/20 lg:block" />
              {pipeline.map(({ label, detail, icon: Icon }, index) => (
                <div key={`${label}-${index}`} className={`panel relative min-w-0 p-5 ${index === pipeline.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                  <div className="grid aspect-[4/3] place-items-center rounded-xl border border-white/[0.07] bg-black/20">
                    <Icon size={28} className={index > 1 ? 'text-cyan-300' : 'text-violet-300'} />
                  </div>
                  <p className="mt-4 break-words text-sm font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-20 py-24">
          <div className="container-shell">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">The process</span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl">Four cuts. No back-and-forth.</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map(({ title, icon: Icon }, index) => (
                <article key={title} className="panel p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-violet-300">0{index + 1}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-cyan-300"><Icon size={19} /></span>
                  </div>
                  <h3 className="mt-10 text-lg font-bold">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
