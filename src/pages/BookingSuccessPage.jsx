import { ArrowRight, Check, Clock3, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { serviceMeta } from '../lib/format';

export default function BookingSuccessPage() {
  const location = useLocation();
  const stored = JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  const booking = location.state || stored;
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(`Hi NerdyFren, I just started project ${booking?.booking_ref || ''}.`);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : 'https://wa.me/';

  if (!booking) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-5">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">No recent booking found</h1>
          <p className="mt-2 text-sm text-slate-500">Start a project to receive your Tracking ID.</p>
          <Link to="/book" className="btn-primary mt-6">Start a project</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="aurora min-h-screen bg-canvas px-5 py-8">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-center"><Logo /></div>
        <div className="panel mt-14 overflow-hidden p-7 sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"><Check size={25} /></div>
          <div className="mt-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Brief received</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Project Assigned Successfully</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Your brief is safely with NerdyFren. Use your Tracking ID to follow the project journey.</p>
          </div>

          <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><ShieldCheck size={15} /> Tracking ID</div>
            <p className="mt-4 break-all rounded-xl bg-black/25 p-4 font-mono text-sm text-slate-200">{booking.tracking_token}</p>
          </div>

          <div className="mt-6 rounded-xl bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600"><Clock3 size={14} /> Expected Timeline</p>
            <p className="mt-2 text-sm font-medium">{serviceMeta[booking.service_type]?.timeline || '2-5 business days'}</p>
          </div>

          <Link to={`/track?token=${encodeURIComponent(booking.tracking_token)}`} className="btn-primary mt-7 w-full">Track Project <ArrowRight size={17} /></Link>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary mt-3 w-full"><MessageCircle size={17} /> WhatsApp Coordinator</a>
        </div>
      </div>
    </div>
  );
}
