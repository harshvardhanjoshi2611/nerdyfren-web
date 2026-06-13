import {
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';
import { bookingsApi, clientApi, getApiError } from '../lib/api';
import {
  formatDate,
  formatDateTime,
  getProjectName,
  humanize,
  serviceMeta,
} from '../lib/format';

const journey = [
  'Brief Received',
  'Nerd Assigned',
  'Brainstorm Mode On',
  'Ready to Review',
  'Feedback Round 1',
  'Feedback Round 2',
  'Final Feedback Round',
  'Mission Complete',
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
    editing: 2,
    draft_submitted: revisionCount ? Math.min(3 + revisionCount, 6) : 3,
    awaiting_revision: Math.min(4 + Math.max(revisionCount - 1, 0), 6),
    final_delivered: 6,
    delivered: 6,
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
  const [action, setAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  if (!authLoading && isAuthenticated && !requestedToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadBooking = async (trackingToken, updateUrl = false) => {
    const result = await bookingsApi.track(trackingToken);
    setBooking(result);
    if (updateUrl) setParams({ token: trackingToken });
    return result;
  };

  const track = async (event) => {
    event?.preventDefault();
    const trackingToken = token.trim();
    if (!trackingToken) return;
    setLoading(true);
    setError('');
    setNotice('');
    setBooking(null);
    try {
      await loadBooking(trackingToken, true);
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not find a project for that Tracking ID.'));
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    setAction('approve');
    setActionError('');
    setNotice('');
    try {
      await clientApi.approve({ tracking_id: token.trim() });
      await loadBooking(token.trim());
      setNotice('Delivery approved. This project is now complete.');
    } catch (requestError) {
      setActionError(getApiError(requestError, 'Could not approve this delivery.'));
    } finally {
      setAction('');
    }
  };

  const requestRevision = async (event) => {
    event.preventDefault();
    setAction('revision');
    setActionError('');
    setNotice('');
    try {
      await clientApi.requestRevision({
        tracking_id: token.trim(),
        revision_notes: revisionNotes.trim(),
      });
      await loadBooking(token.trim());
      setRevisionNotes('');
      setRevisionOpen(false);
      setNotice('Revision requested. Your editor can now see the feedback.');
    } catch (requestError) {
      setActionError(getApiError(requestError, 'Could not request this revision.'));
    } finally {
      setAction('');
    }
  };

  const delivery = booking?.delivery || (
    booking?.delivery_link
      ? {
        delivery_link: booking.delivery_link,
        delivery_note: booking.delivery_notes,
        submitted_at: booking.delivery_date,
      }
      : null
  );
  const canApprove = delivery
    && !booking?.client_approved
    && ['draft_submitted', 'final_delivered', 'delivered'].includes(booking.status);
  const canRevise = delivery
    && ['draft_submitted', 'final_delivered', 'delivered', 'completed'].includes(booking.status);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-canvas/85 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link to="/" className="text-xs text-slate-400 transition hover:text-white sm:text-sm">Home</Link>
            <Link to="/booking" className="text-xs text-slate-400 transition hover:text-white sm:text-sm">Start Project</Link>
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

              {notice && <div className="mx-6 mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div>}
              {actionError && <div className="mx-6 mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">{actionError}</div>}

              {delivery && (
                <div className="border-t border-white/[0.07] p-6">
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Delivery ready</p>
                    <p className="mt-3 text-xs text-slate-600">{formatDateTime(delivery.submitted_at || booking.delivery_date)}</p>
                    {(delivery.delivery_note || booking.delivery_notes) && <p className="mt-3 text-sm leading-6 text-slate-400">{delivery.delivery_note || booking.delivery_notes}</p>}
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <a href={delivery.delivery_link || booking.delivery_link} target="_blank" rel="noreferrer" className="btn-primary">Open delivery link <ExternalLink size={15} /></a>
                      {canApprove && (
                        <button disabled={!!action} onClick={approve} className="btn-secondary">
                          {action === 'approve' ? <LoaderCircle className="animate-spin" size={15} /> : <ThumbsUp size={15} />}
                          Approve Delivery
                        </button>
                      )}
                      {canRevise && (
                        <button disabled={!!action} onClick={() => setRevisionOpen(true)} className="btn-secondary">
                          <RotateCcw size={15} /> Request Revision
                        </button>
                      )}
                    </div>
                    {booking.client_approved ? <p className="mt-4 text-xs font-medium text-emerald-300">Approved by client</p> : null}
                  </div>
                </div>
              )}

              {booking.revisions?.length > 0 && (
                <div className="border-t border-white/[0.07] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Revision history</p>
                  <div className="mt-4 space-y-3">
                    {booking.revisions.map((revision) => (
                      <div key={revision.id} className="rounded-xl bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">Revision {revision.revision_number}</p>
                          <StatusBadge status={revision.status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{revision.notes}</p>
                        <p className="mt-2 text-xs text-slate-600">{formatDateTime(revision.requested_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-white/[0.07] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Project journey</p>
                <div className="mt-6 space-y-0">
                  {journey.map((label, index) => {
                    const currentIndex = getJourneyIndex(booking);
                    const complete = index < currentIndex;
                    const active = index === currentIndex;
                    return (
                      <div key={label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {complete
                            ? <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7C3AED] text-white"><Check size={14} /></span>
                            : active
                              ? <span className="grid h-8 w-8 place-items-center rounded-full border border-violet-300/40 bg-violet-500/20"><Circle size={13} className="fill-violet-300 text-violet-300" /></span>
                              : <span className="grid h-8 w-8 place-items-center"><Circle size={28} className="text-slate-800" /></span>}
                          {index < journey.length - 1 && <div className={`h-9 w-px ${complete ? 'bg-[#7C3AED]' : 'bg-white/10'}`} />}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${active || complete ? 'text-slate-200' : 'text-slate-600'}`}>{label}</p>
                          {active && <p className="mt-1 text-xs text-slate-500">{booking.editor_name ? `${booking.editor_name} is handling your project.` : 'Our team is moving this forward.'}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!booking && !error && <div className="mx-auto mt-12 max-w-lg text-center text-sm text-slate-600">No Tracking ID yet? <Link to="/booking" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">Start a project <ArrowRight size={14} /></Link></div>}
        </div>
      </main>

      {revisionOpen && (
        <Modal title="Request a revision" eyebrow={booking?.booking_ref} onClose={() => setRevisionOpen(false)}>
          <form onSubmit={requestRevision}>
            <label>
              <span className="label">Revision notes</span>
              <textarea
                required
                minLength={1}
                maxLength={5000}
                value={revisionNotes}
                onChange={(event) => setRevisionNotes(event.target.value)}
                className="input min-h-36 resize-y"
                placeholder="Describe exactly what should change in the next version."
              />
            </label>
            {actionError && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRevisionOpen(false)} className="btn-secondary">Cancel</button>
              <button disabled={action === 'revision' || !revisionNotes.trim()} className="btn-primary">
                {action === 'revision' ? <LoaderCircle className="animate-spin" size={15} /> : <RotateCcw size={15} />}
                Send revision
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
