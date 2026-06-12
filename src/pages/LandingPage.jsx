import { ArrowRight, CheckCircle2, Film, MessageSquareText, Send, Sparkles, Star, Upload, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import CmsMedia from '../components/CmsMedia';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import useSiteContent from '../hooks/useSiteContent';

const stepIcons = [Send, Upload, UserRoundCheck, Film, MessageSquareText, CheckCircle2];

export default function LandingPage() {
  const { content } = useSiteContent();
  const hero = content.homepage?.hero || {};
  const human = content.homepage?.human_editors || {};
  const how = content.homepage?.how_it_works || {};
  const visuals = content.homepage?.visuals || {};

  return (
    <div className="noise min-h-screen overflow-hidden bg-canvas">
      <Navbar />
      <main>
        <section className="aurora relative flex min-h-[760px] items-center overflow-hidden pb-24 pt-32">
          <div className="absolute inset-0 bg-grid bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="container-shell relative">
            <div className="mx-auto max-w-5xl text-center">
              {hero.eyebrow && <span className="eyebrow"><Sparkles size={13} /> {hero.eyebrow}</span>}
              <h1 className="mt-7 text-5xl font-extrabold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-[78px]">{hero.title}</h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">{hero.subtitle}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={hero.cta_url || '/book'} className="btn-primary !px-6 !py-3.5">{hero.cta_text} <ArrowRight size={17} /></Link>
                <Link to="/services" className="btn-secondary !px-6 !py-3.5">Explore services</Link>
              </div>
              {visuals.hero_media_url && <div className="panel mx-auto mt-14 max-w-4xl overflow-hidden p-2"><CmsMedia url={visuals.hero_media_url} type={visuals.hero_media_type} alt={hero.title} className="aspect-video w-full rounded-xl object-cover" /></div>}
            </div>
          </div>
        </section>

        {content.banners?.length > 0 && <section className="border-y border-white/[0.06] bg-white/[0.015] py-8"><div className="container-shell grid gap-4 md:grid-cols-3">{content.banners.map((banner) => <div key={banner.id} className="panel p-5"><h2 className="font-semibold">{banner.content.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{banner.content.subtitle}</p>{banner.content.button_text && <Link to={banner.content.button_url || '/'} className="mt-4 inline-flex items-center gap-1 text-sm text-violet-300">{banner.content.button_text} <ArrowRight size={14} /></Link>}</div>)}</div></section>}

        <section className="relative overflow-hidden py-24">
          <div className="container-shell relative">
            <div className="panel mx-auto max-w-4xl overflow-hidden p-8 text-center sm:p-12">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-pink-400/20 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-pink-300"><UserRoundCheck size={27} /></div>
              <span className="eyebrow mt-6">{human.eyebrow}</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">{human.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">{human.subtitle}</p>
              {visuals.human_editors_media_url && <CmsMedia url={visuals.human_editors_media_url} type={visuals.human_editors_media_type} alt={human.title} className="mx-auto mt-8 max-h-96 w-full rounded-2xl object-cover" />}
            </div>
          </div>
        </section>

        <section className="py-28">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">{how.eyebrow}</span><h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">{how.title}</h2><p className="mt-5 text-slate-400">{how.subtitle}</p></div>
            <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(how.steps || []).map((step, index) => {
                const Icon = stepIcons[index] || Sparkles;
                return <div key={`${step.title}-${index}`} className="panel p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs text-violet-400">{String(index + 1).padStart(2, '0')}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-cyan-300"><Icon size={18} /></span></div><h3 className="mt-8 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{step.body}</p></div>;
              })}
            </div>
            {visuals.how_it_works_media_url && <CmsMedia url={visuals.how_it_works_media_url} type={visuals.how_it_works_media_type} alt={how.title} className="panel mt-12 aspect-video w-full rounded-2xl object-cover p-2" />}
          </div>
        </section>

        {visuals.portfolio_visible !== false && content.portfolio?.length > 0 && <section className="pb-28"><div className="container-shell"><div className="flex items-end justify-between gap-5"><div><span className="eyebrow">Selected work</span><h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Made by real Nerds.</h2></div><Link to="/services" className="hidden text-sm text-violet-300 sm:inline-flex">Explore services <ArrowRight className="ml-2" size={16} /></Link></div><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{content.portfolio.map((item) => <article key={item.id} className="panel overflow-hidden"><CmsMedia url={item.content.thumbnail_url || item.content.media_url} type={item.content.thumbnail_url ? 'image' : item.content.media_type} alt={item.content.title} className="aspect-video w-full object-cover" /><div className="p-6"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{item.content.title}</h3>{item.content.featured && <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase text-violet-300">Featured</span>}</div><p className="mt-3 text-sm leading-6 text-slate-500">{item.content.description}</p></div></article>)}</div></div></section>}

        {visuals.testimonials_visible !== false && content.testimonials?.length > 0 && <section className="border-y border-white/[0.06] bg-white/[0.015] py-24"><div className="container-shell"><div className="text-center"><span className="eyebrow">Creator stories</span><h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">The work lands. So does the feeling.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{content.testimonials.map((item) => <figure key={item.id} className="panel p-7"><div className="flex gap-1 text-amber-300">{Array.from({ length: Math.min(5, Math.max(1, item.content.rating || 5)) }, (_, index) => <Star key={index} size={15} fill="currentColor" />)}</div><blockquote className="mt-6 text-base leading-7 text-slate-300">“{item.content.testimonial_text}”</blockquote><figcaption className="mt-7 flex items-center gap-3">{item.content.client_image_url && <img src={item.content.client_image_url} alt="" className="h-11 w-11 rounded-full object-cover" />}<div><p className="font-medium">{item.content.client_name}</p><p className="text-xs text-slate-600">{item.content.client_role_brand}</p></div></figcaption></figure>)}</div></div></section>}

        {content.faqs?.length > 0 && <section className="pb-28"><div className="container-shell max-w-4xl"><div className="text-center"><span className="eyebrow">FAQs</span></div><div className="mt-10 space-y-3">{content.faqs.map((faq) => <details key={faq.id} className="panel p-5"><summary className="cursor-pointer font-semibold">{faq.content.question}</summary><p className="mt-3 text-sm leading-6 text-slate-400">{faq.content.answer}</p></details>)}</div></div></section>}
      </main>
      <Footer />
    </div>
  );
}
