import { ArrowRight, Check, Clock3, Layers3, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useFetch } from '../hooks/useFetch';
import { servicesApi } from '../lib/api';
import { formatMoney, serviceMeta } from '../lib/format';

export default function ServicesPage() {
  const { data: services, loading } = useFetch(servicesApi.list, []);
  const cards = services || Object.keys(serviceMeta).map((id) => ({ id, amount: null }));
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="aurora pb-24 pt-32">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow"><Layers3 size={13} /> Creative services</span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.045em] sm:text-6xl">Built for the content you need to ship next.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">Choose a focused package. We handle the match, creative context and quality control.</p>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {cards.map((service, index) => {
              const meta = serviceMeta[service.id] || { name: service.id, short: 'A custom creative service.', timeline: 'Custom' };
              return (
                <article key={service.id} className={`panel group relative overflow-hidden p-7 transition hover:-translate-y-1 hover:border-violet-400/20 ${index === 1 ? 'shadow-glow' : ''}`}>
                  {index === 1 && <span className="absolute right-5 top-5 rounded-full bg-[#7C3AED] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Most popular</span>}
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 font-mono text-sm text-violet-300">0{index + 1}</div>
                  <h2 className="mt-8 text-2xl font-bold">{meta.name}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{meta.short}</p>
                  <div className="mt-7 flex items-end justify-between border-t border-white/[0.07] pt-6">
                    <div><p className="text-xs text-slate-600">Starting at</p><p className="mt-1 text-2xl font-bold">{loading ? <LoaderCircle className="animate-spin" size={20} /> : service.amount != null ? formatMoney(service.amount) : 'Custom'}</p></div>
                    <div className="text-right"><p className="flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={13} /> {meta.timeline}</p></div>
                  </div>
                  <div className="mt-6 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    {['Vetted specialist', 'Founder quality check', 'Clear project tracking', 'One revision cycle'].map((item) => <span key={item} className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> {item}</span>)}
                  </div>
                  <Link to={`/book?service=${service.id}`} className="btn-secondary mt-7 w-full group-hover:border-violet-400/30 group-hover:text-white">Book this service <ArrowRight size={16} /></Link>
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
