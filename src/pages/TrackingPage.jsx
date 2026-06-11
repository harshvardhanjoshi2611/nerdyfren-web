import { ArrowRight, Check, Circle, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { bookingsApi, getApiError } from '../lib/api';
import { formatDate, formatMoney, humanize, serviceMeta } from '../lib/format';

const stages = ['unassigned', 'assigned', 'in_progress', 'revision', 'delivered'];

export default function TrackingPage() {
  const [params, setParams] = useSearchParams();
  const [token, setToken] = useState(params.get('token') || '');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async (event) => {
    event?.preventDefault();
    if (!token.trim()) return;
    setLoading(true); setError(''); setBooking(null);
    try {
      const result = await bookingsApi.track(token.trim());
      setBooking(result); setParams({ token: token.trim() });
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not find a project for that token.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-canvas"><Navbar />
      <main className="aurora min-h-[820px] pb-24 pt-32">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center"><span className="eyebrow"><ShieldCheck size={13} /> Private project tracking</span><h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Know exactly where your project stands.</h1><p className="mt-4 text-slate-400">Enter the secure token from your booking confirmation.</p></div>
          <form onSubmit={track} className="panel mx-auto mt-10 flex max-w-2xl flex-col gap-3 p-3 sm:flex-row">
            <input value={token} onChange={(e) => setToken(e.target.value)} className="input border-0 !bg-transparent" placeholder="Paste your 43-character tracking token" />
            <button disabled={loading} className="btn-primary shrink-0"><Search size={16} /> {loading ? 'Checking...' : 'Track project'}</button>
          </form>
          {error && <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-center text-sm text-red-300">{error}</div>}
          {booking && (
            <div className="panel mx-auto mt-8 max-w-3xl overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-wider text-slate-600">{booking.booking_ref}</p><h2 className="mt-2 text-xl font-semibold">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</h2></div><StatusBadge status={booking.status} /></div>
              <div className="grid gap-3 p-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Project total</p><p className="mt-2 font-semibold">{formatMoney(booking.amount)}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Payment</p><div className="mt-2"><StatusBadge status={booking.payment_status} /></div></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Created</p><p className="mt-2 font-semibold">{formatDate(booking.created_at)}</p></div>
              </div>
              <div className="border-t border-white/[0.07] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Progress</p>
                <div className="mt-6 space-y-0">
                  {stages.filter((s) => s !== 'revision' || booking.status === 'revision').map((stage, index, list) => {
                    const currentIndex = stages.indexOf(booking.status);
                    const stageIndex = stages.indexOf(stage);
                    const complete = stageIndex < currentIndex || booking.status === 'delivered';
                    const active = stage === booking.status;
                    return <div key={stage} className="flex gap-4"><div className="flex flex-col items-center">{complete ? <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7C3AED] text-white"><Check size={14} /></span> : active ? <span className="grid h-7 w-7 place-items-center rounded-full border-4 border-violet-400/30 bg-violet-400" /> : <Circle size={27} className="text-slate-800" />}{index < list.length - 1 && <div className={`h-9 w-px ${complete ? 'bg-[#7C3AED]' : 'bg-white/10'}`} />}</div><div className="pt-1"><p className={`text-sm font-medium capitalize ${active || complete ? 'text-slate-200' : 'text-slate-600'}`}>{humanize(stage)}</p>{active && <p className="mt-1 text-xs text-slate-500">{booking.editor_name ? `${booking.editor_name} is handling your project.` : 'Our team is moving this forward.'}</p>}</div></div>;
                  })}
                </div>
              </div>
            </div>
          )}
          {!booking && !error && <div className="mx-auto mt-12 max-w-lg text-center text-sm text-slate-600">No token yet? <Link to="/book" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">Start a project <ArrowRight size={14} /></Link></div>}
        </div>
      </main><Footer />
    </div>
  );
}
