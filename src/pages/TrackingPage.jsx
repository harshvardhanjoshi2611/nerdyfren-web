import { ArrowRight, Check, Circle, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';
import { bookingsApi, getApiError } from '../lib/api';
import { formatDate, getProjectName, humanize, serviceMeta } from '../lib/format';

const journey = [
  ['📩', 'Brief Received'],
  ['🤓', 'Nerd Assigned'],
  ['🧠', 'Brainstorm Mode On'],
  ['✨', 'Ready to Review'],
  ['🔧', 'Feedback Round 1'],
  ['🔧', 'Feedback Round 2'],
  ['🔧', 'Final Feedback Round'],
  ['🏆', 'Mission Complete'],
];

function getJourneyIndex(booking) {
  const revisionCount = Number(
    booking.revision_count
    || booking.revisions?.length
    || booking.revision_requests?.length
    || 0,
  );
  const statusIndexes = {
    pending: 0,
    unassigned: 0,
    assigned: 1,
    work_in_progress: 2,
    draft_submitted: revisionCount ? Math.min(3 + revisionCount, 6) : 3,
    awaiting_revision: Math.min(4 + Math.max(revisionCount - 1, 0), 6),
    final_delivered: 6,
    completed: 7,
    cancelled: 0,
  };
  return statusIndexes[booking.status] ?? 0;
}

export default function TrackingPage() {
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const requestedToken = params.get('token');
  const [token, setToken] = useState(requestedToken || '');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && isAuthenticated && !requestedToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const track = async (event) => {
    event?.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const result = await bookingsApi.track(token.trim());
      setBooking(result);
      setParams({ token: token.trim() });
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not find a project for that Tracking ID.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-canvas/85 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link to="/" className="text-xs text-slate-400 transition hover:text-white sm:text-sm">Home</Link>
            <Link to="/book" className="text-xs text-slate-400 transition hover:text-white sm:text-sm">Start Project</Link>
            <Link to="/track" className="text-xs font-medium text-white sm:text-sm">Track Project</Link>
          </nav>
        </div>
      </header>

      <main className="aurora min-h-[820px] pb-24 pt-32">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><ShieldCheck size={13} /> Private project tracking</span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Know exactly where your project stands.</h1>
            <p className="mt-4 text-slate-400">Enter the secure Tracking ID from your booking confirmation.</p>
          </div>

          <form onSubmit={track} className="panel mx-auto mt-10 flex max-w-2xl flex-col gap-3 p-3 sm:flex-row">
            <input value={token} onChange={(event) => setToken(event.target.value)} className="input border-0 !bg-transparent" placeholder="Enter your Tracking ID" />
            <button disabled={loading} className="btn-primary shrink-0"><Search size={16} /> {loading ? 'Checking...' : 'Track project'}</button>
          </form>

          {error && <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-center text-sm text-red-300">{error}</div>}

          {booking && (
            <div className="panel mx-auto mt-8 max-w-4xl overflow-hidden">
              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Project Name</p><p className="mt-2 font-semibold">{getProjectName(booking)}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Service</p><p className="mt-2 font-semibold">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Status</p><div className="mt-2"><StatusBadge status={booking.status} /></div></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Created Date</p><p className="mt-2 font-semibold">{formatDate(booking.created_at)}</p></div>
              </div>

              {booking.delivery && (
                <div className="border-t border-white/[0.07] p-6">
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Delivery ready</p>
                    {booking.delivery.delivery_note && <p className="mt-3 text-sm leading-6 text-slate-400">{booking.delivery.delivery_note}</p>}
                    <a href={booking.delivery.delivery_link} target="_blank" rel="noreferrer" className="btn-primary mt-4">Open delivery <ExternalLink size={15} /></a>
                  </div>
                </div>
              )}

              <div className="border-t border-white/[0.07] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Project journey</p>
                <div className="mt-6 space-y-0">
                  {journey.map(([icon, label], index) => {
                    const currentIndex = getJourneyIndex(booking);
                    const complete = index < currentIndex;
                    const active = index === currentIndex;
                    return (
                      <div key={label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {complete
                            ? <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7C3AED] text-white"><Check size={14} /></span>
                            : active
                              ? <span className="grid h-8 w-8 place-items-center rounded-full border border-violet-300/40 bg-violet-500/20 text-base">{icon}</span>
                              : <span className="grid h-8 w-8 place-items-center"><Circle size={28} className="text-slate-800" /></span>}
                          {index < journey.length - 1 && <div className={`h-9 w-px ${complete ? 'bg-[#7C3AED]' : 'bg-white/10'}`} />}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${active || complete ? 'text-slate-200' : 'text-slate-600'}`}>{icon} {label}</p>
                          {active && <p className="mt-1 text-xs text-slate-500">{booking.editor_name ? `${booking.editor_name} is handling your project.` : 'Our team is moving this forward.'}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!booking && !error && <div className="mx-auto mt-12 max-w-lg text-center text-sm text-slate-600">No Tracking ID yet? <Link to="/book" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">Start a project <ArrowRight size={14} /></Link></div>}
        </div>
      </main>
    </div>
  );
}
