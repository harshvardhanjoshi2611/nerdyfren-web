import { ArrowRight, Check, Clock3, Layers3, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import CmsMedia from '../components/CmsMedia';
import { useFetch } from '../hooks/useFetch';
import useSiteContent from '../hooks/useSiteContent';
import { servicesApi } from '../lib/api';
import { fallbackServices, formatMoney, serviceMeta } from '../lib/format';

export default function ServicesPage() {
  const {
    data: services,
    loading,
    error,
    reload,
  } = useFetch(servicesApi.list, []);
  const { content } = useSiteContent();
  const cards = Array.isArray(services) ? services : fallbackServices;
  const servicesVisual = content.homepage?.visuals || {};
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="aurora pb-24 pt-32">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow"><Layers3 size={13} /> Creative services</span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl">Built for the content you need to ship next.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">Choose a focused package. Verified human editors handle the creative context while NerdyFren manages the workflow and quality control.</p>
          </div>
          {servicesVisual.services_media_url && <CmsMedia url={servicesVisual.services_media_url} type={servicesVisual.services_media_type} alt="NerdyFren services" className="panel mt-12 aspect-[21/8] w-full rounded-2xl object-cover p-2" />}
          {error && (
            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>Live pricing could not be refreshed. Showing the latest built-in service information.</span>
              <button type="button" onClick={reload} className="btn-secondary !px-3 !py-2">Retry</button>
            </div>
          )}
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {cards.map((service, index) => {
              const meta = serviceMeta[service.id] || { name: service.name || service.id, short: 'A custom creative service.', timeline: 'Custom' };
              const comingSoon = service.coming_soon || meta.comingSoon || service.bookable === false;
              const requirements = service.requirements || meta.requirements || [];
              const includes = service.includes || meta.includes || [];
              const revisionCycles = service.revision_cycles ?? meta.revisionCycles;
              return (
                <article key={service.id} className={`panel group relative overflow-hidden p-7 transition hover:-translate-y-1 hover:border-violet-400/20 ${index === 1 ? 'shadow-glow' : ''}`}>
                  {service.media_url && <CmsMedia url={service.media_url} type={service.media_type} alt={service.name} className="-mx-7 -mt-7 mb-7 aspect-video w-[calc(100%+3.5rem)] object-cover" />}
                  {index === 1 && <span className="absolute right-5 top-5 rounded-full bg-[#7C3AED] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Most popular</span>}
                  {comingSoon && <span className="absolute right-5 top-5 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Coming Soon</span>}
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 font-mono text-sm text-violet-300">0{index + 1}</div>
                  <h2 className="mt-8 text-2xl font-bold">{service.name || meta.name}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{service.description || meta.short}</p>
                  <div className="mt-7 flex items-end justify-between border-t border-white/[0.07] pt-6">
                    <div><p className="text-xs text-slate-600">{comingSoon ? 'Pricing' : 'Starting at'}</p><p className="mt-1 text-2xl font-bold">{loading ? <LoaderCircle className="animate-spin" size={20} /> : comingSoon ? 'Surge pricing applies' : formatMoney(service.amount)}</p></div>
                    <div className="max-w-44 text-right"><p className="flex items-center justify-end gap-1.5 text-xs text-slate-500"><Clock3 size={13} /> {service.timeline || meta.timeline}</p></div>
                  </div>
                  <div className="mt-6 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    {revisionCycles > 0 && <span className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> {revisionCycles} Revision Cycles</span>}
                    {[...includes, ...requirements].map((item) => <span key={item} className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> {item}</span>)}
                  </div>
                  {comingSoon
                    ? <button disabled className="btn-secondary mt-7 w-full cursor-not-allowed opacity-60">Booking opens soon</button>
                    : <Link to={`/booking?service=${service.id}`} className="btn-secondary mt-7 w-full group-hover:border-violet-400/30 group-hover:text-white">Book this service <ArrowRight size={16} /></Link>}
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
