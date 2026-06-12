import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, Film, MessageSquareText, Play, Send, Sparkles, Upload, UserRoundCheck, WandSparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const steps = [
  [Send, '01', 'Start Project', 'Choose your service and tell us what you are creating.'],
  [Upload, '02', 'Share Brief & Raw Footage', 'Send the context, source files, references, and goals your Nerd needs.'],
  [UserRoundCheck, '03', 'Nerd Assigned', 'We match your project with a real editor who understands the format.'],
  [Film, '04', 'Draft Delivered', 'Your first polished cut arrives through your private project workspace.'],
  [MessageSquareText, '05', 'Feedback Rounds', 'Share clear revision notes and follow every updated delivery.'],
  [CheckCircle2, '06', 'Final Ready-To-Post Content', 'Receive the finished content, approved and ready for your feed.'],
];

const signals = [
  [BadgeCheck, 'Vetted talent', 'Every specialist is reviewed before joining.'],
  [Clock3, 'Fast turnaround', 'Clear delivery windows, without agency drag.'],
  [WandSparkles, 'Founder-managed', 'A human stays accountable for the outcome.'],
];

export default function LandingPage() {
  return (
    <div className="noise min-h-screen overflow-hidden bg-canvas">
      <Navbar />
      <main>
        <section className="aurora relative flex min-h-[850px] items-center overflow-hidden pb-24 pt-32">
          <div className="absolute inset-0 bg-grid bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="container-shell relative grid items-center gap-16 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <span className="eyebrow"><Sparkles size={13} /> The creative operating system for creators</span>
              <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-[78px]">
                Make content that <span className="text-gradient">earns attention.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
                Get matched with vetted editors and creative specialists who understand internet culture, your voice, and the pace you need to publish.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/book" className="btn-primary !px-6 !py-3.5">Start your project <ArrowRight size={17} /></Link>
                <Link to="/services" className="btn-secondary !px-6 !py-3.5"><Play size={16} /> Explore services</Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-500">
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> No retainers</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Human quality control</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Clear pricing</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -inset-14 rounded-full bg-violet-600/20 blur-[90px]" />
              <div className="panel relative overflow-hidden p-4 shadow-glow">
                <div className="rounded-xl border border-white/[0.07] bg-[#0c111c] p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs font-medium text-slate-500">PROJECT OVERVIEW</p><h3 className="mt-1 font-semibold">Launch story reel</h3></div>
                    <span className="status-pill border-blue-400/20 bg-blue-500/10 text-blue-300">In progress</span>
                  </div>
                  <div className="my-6 h-px bg-white/[0.07]" />
                  <div className="grid grid-cols-3 gap-3">
                    {[['Format', 'Vertical 9:16'], ['Turnaround', '48 hours'], ['Specialist', 'Matched']].map(([a, b]) => (
                      <div key={a} className="rounded-xl bg-white/[0.035] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">{a}</p><p className="mt-2 text-xs font-medium text-slate-300">{b}</p></div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-blue-500 text-sm font-semibold">AK</div>
                      <div className="flex-1"><p className="text-sm font-medium">Aarav is editing</p><p className="mt-0.5 text-xs text-slate-500">Hook structure and first cut</p></div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] text-slate-500"><span>Progress</span><span>68%</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#7C3AED] to-blue-400" /></div>
                  </div>
                </div>
              </div>
              <div className="panel absolute -bottom-9 -left-5 hidden w-52 p-4 sm:block">
                <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300"><Zap size={17} /></span><div><p className="text-xs font-medium">Brief approved</p><p className="text-[11px] text-slate-600">2 minutes ago</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015] py-8">
          <div className="container-shell grid gap-6 sm:grid-cols-3">
            {signals.map(([Icon, title, body]) => <div key={title} className="flex gap-4"><Icon className="mt-0.5 text-violet-400" size={20} /><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></div></div>)}
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[90px]" />
          <div className="container-shell relative">
            <div className="panel mx-auto max-w-4xl overflow-hidden p-8 text-center sm:p-12">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-pink-400/20 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-pink-300"><UserRoundCheck size={27} /></div>
              <span className="eyebrow mt-6">People, not prompts</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">100% Human Editors</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">No AI shortcuts. Real Nerds edit your content with taste, context, and creator instinct.</p>
            </div>
          </div>
        </section>

        <section className="py-28">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">How It Works</span><h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">From raw footage to ready to post.</h2><p className="mt-5 text-slate-400">Your Nerdy Fren turns raw footage into ready-to-post content.</p></div>
            <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {steps.map(([Icon, number, title, body]) => <div key={number} className="panel group p-7 transition hover:border-cyan-400/20"><div className="flex items-center justify-between"><span className="font-mono text-xs text-violet-400">{number}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-cyan-300"><Icon size={18} /></span></div><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{body}</p></div>)}
            </div>
          </div>
        </section>

        <section className="pb-28">
          <div className="container-shell">
            <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-[#111827] to-blue-600/10 px-7 py-16 text-center sm:px-14">
              <div className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-50" />
              <div className="relative"><h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Your next great upload starts here.</h2><p className="mx-auto mt-5 max-w-xl text-slate-400">One clear brief. One accountable team. Better content on your calendar.</p><Link to="/book" className="btn-primary mt-8">Start a project <ArrowRight size={17} /></Link></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
