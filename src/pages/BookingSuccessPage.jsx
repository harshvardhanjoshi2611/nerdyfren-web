import { ArrowRight, Check, Copy, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { formatMoney } from '../lib/format';

export default function BookingSuccessPage() {
  const location = useLocation();
  const stored = JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  const booking = location.state || stored;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!booking?.tracking_token) return;
    await navigator.clipboard.writeText(booking.tracking_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  if (!booking) return <div className="grid min-h-screen place-items-center bg-canvas p-5"><div className="panel max-w-md p-8 text-center"><h1 className="text-xl font-semibold">No recent booking found</h1><p className="mt-2 text-sm text-slate-500">Start a project to receive a private tracking token.</p><Link to="/book" className="btn-primary mt-6">Start a project</Link></div></div>;
  return (
    <div className="aurora min-h-screen bg-canvas px-5 py-8">
      <div className="mx-auto max-w-xl"><div className="flex justify-center"><Logo /></div>
        <div className="panel mt-14 overflow-hidden p-7 sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"><Check size={25} /></div>
          <div className="mt-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Brief received</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Your project is in.</h1><p className="mt-3 text-sm leading-6 text-slate-400">We’ll review the brief, confirm payment and match the right specialist. Keep the private token below.</p></div>
          <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><ShieldCheck size={15} /> Private tracking token</div>
            <code className="mt-4 block break-all rounded-xl bg-black/25 p-4 text-xs leading-5 text-slate-300">{booking.tracking_token}</code>
            <button onClick={copy} className="btn-secondary mt-3 w-full !py-2.5"><Copy size={15} /> {copied ? 'Copied' : 'Copy token'}</button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-600">Reference</p><p className="mt-2 text-sm font-medium">{booking.booking_ref}</p></div>
            <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-600">Project total</p><p className="mt-2 text-sm font-medium">{formatMoney(booking.amount)}</p></div>
          </div>
          <Link to={`/track?token=${booking.tracking_token}`} className="btn-primary mt-7 w-full">Track project <ArrowRight size={17} /></Link>
        </div>
      </div>
    </div>
  );
}
