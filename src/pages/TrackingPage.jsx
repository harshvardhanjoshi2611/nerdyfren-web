import {
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { buildCoordinatorMessage, buildWhatsAppLink } from '../lib/contactConfig';
import { trackEvent } from '../lib/analytics';

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

const privateTokenPattern = /^[A-Za-z0-9_-]{43}$/;

function recentBooking() {
  try {
    return JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  } catch {
    return null;
  }
}

function getPrivateLookup(identifier) {
  if (privateTokenPattern.test(identifier)) return identifier;
  const recent = recentBooking();
  const recentRequestId = recent?.request_id || recent?.booking_ref;
  return recentRequestId?.toUpperCase() === identifier.toUpperCase()
    ? recent?.tracking_token || ''
    : '';
}

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
  const { isAuthenticated } = useAuth();
  const requestedIdentifier = params.get('requestId') || params.get('id') || params.get('request_id') || params.get('token');
  const [identifier, setIdentifier] = useState(requestedIdentifier || '');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [privateToken, setPrivateToken] = useState('');
  const autoLoadedRef = useRef('');

  const loadBooking = useCallback(async (lookup, updateUrl = false) => {
    const privateLookup = getPrivateLookup(lookup);
    if (privateLookup) setPrivateToken(privateLookup);
    const result = await bookingsApi.track(privateLookup || lookup);
    const requestId = result.request_id || result.booking_ref;
    setBooking(result);
    setIdentifier(requestId || lookup);
    autoLoadedRef.current = requestId || lookup;
    if (updateUrl && requestId) setParams({ requestId });
    if (requestId) trackEvent('track_request_opened', {}, { requestId });
    return result;
  }, [setParams]);

  useEffect(() => {
    if (!requestedIdentifier || autoLoadedRef.current === requestedIdentifier) return;
    autoLoadedRef.current = requestedIdentifier;
    setIdentifier(requestedIdentifier);
    setLoading(true);
    setError('');
    loadBooking(requestedIdentifier, true)
      .catch((requestError) => {
        setBooking(null);
        setError(getApiError(requestError, 'We could not find a project for that Request ID.'));
      })
      .finally(() => setLoading(false));
  }, [loadBooking, requestedIdentifier]);

  const track = async (event) => {
    event?.preventDefault();
    const lookup = identifier.trim();
    if (!lookup) {
      setError('Enter your Request ID to track the project.');
      return;
    }
    setLoading(true);
    setError('');
    setNotice('');
    setBooking(null);
    setPrivateToken('');
    try {
      await loadBooking(lookup, true);
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not find a project for that Request ID.'));
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    setAction('approve');
    setActionError('');
    setNotice('');
    try {
      const requestId = booking?.request_id || booking?.booking_ref;
      await clientApi.approve(privateToken
        ? { tracking_token: privateToken }
        : { request_id: requestId });
      await loadBooking(requestId || identifier.trim());
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
      const requestId = booking?.request_id || booking?.booking_ref;
      await clientApi.requestRevision({
        ...(privateToken ? { tracking_token: privateToken } : { request_id: requestId }),
        revision_notes: revisionNotes.trim(),
      });
      await loadBooking(requestId || identifier.trim());
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
  const canManage = Boolean(booking?.can_manage && (isAuthenticated || privateToken));
  const canApprove = canManage
    && delivery
    && !booking?.client_approved
    && ['draft_submitted', 'final_delivered', 'delivered'].includes(booking.status);
  const canRevise = canManage
    && delivery
    && ['draft_submitted', 'final_delivered', 'delivered', 'completed'].includes(booking.status);
  const requestId = booking?.request_id || booking?.booking_ref;
  const coordinatorHref = booking && buildWhatsAppLink(buildCoordinatorMessage({
    requestId,
    service: serviceMeta[booking.service_type]?.name || humanize(booking.service_type),
    context: `Tracking page; status ${humanize(booking.status)}`,
  }));

  return (
    <div className="nf-operational nf-track-page min-h-screen">
      <header className="nf-track-header fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link to="/booking" className="text-xs text-slate-400 transition hover:text-white sm:text-sm">Start Project</Link>
            <Link to="/track" className="text-xs font-medium text-white sm:text-sm">Track Project</Link>
            <Link to={isAuthenticated ? '/dashboard' : '/signin'} className="text-xs font-medium text-slate-500 sm:text-sm">{isAuthenticated ? 'Dashboard' : 'Sign In'}</Link>
          </nav>
        </div>
      </header>

      <main className="nf-track-main min-h-[820px] pb-24 pt-32">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><ShieldCheck size={13} /> Request ID tracking</span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Track your edit</h1>
            <p className="mt-4 text-slate-400">Enter your Request ID to see where your project stands.</p>
          </div>

          <form onSubmit={track} className="panel mx-auto mt-10 flex max-w-2xl flex-col gap-3 p-3 sm:flex-row">
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="input border-0 !bg-transparent uppercase" placeholder="Enter your Request ID" aria-label="Request ID" />
            <button disabled={loading} className="btn-primary shrink-0"><Search size={16} /> {loading ? 'Checking...' : 'Track project'}</button>
          </form>

          {error && <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-center text-sm text-red-300">{error}</div>}

          {booking && (
            <div className="panel mx-auto mt-8 max-w-4xl overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[.14em] text-slate-600">Project</p>
                  <h2 className="mt-2 text-xl font-semibold">{getProjectName(booking)}</h2>
                </div>
                {coordinatorHref && (
                  <a href={coordinatorHref} target="_blank" rel="noreferrer" className="btn-secondary !px-4 !py-2.5">
                    <MessageCircle size={16} /> Talk to Coordinator
                  </a>
                )}
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Request ID</p><p className="mt-2 break-all font-mono text-sm font-semibold">{requestId}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Service</p><p className="mt-2 font-semibold">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Status</p><div className="mt-2"><StatusBadge status={booking.status} /></div></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Payment</p><div className="mt-2"><StatusBadge status={booking.payment_status || 'pending'} /></div></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Created Date</p><p className="mt-2 font-semibold">{formatDate(booking.created_at)}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-600">Latest update</p><p className="mt-2 font-semibold">{booking.latest_update || humanize(booking.status)}</p></div>
              </div>

              {notice && <div className="mx-6 mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div>}
              {actionError && <div className="mx-6 mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">{actionError}</div>}
              {booking.status === 'cancelled' && (
                <div className="mx-6 mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                  <p className="font-semibold">This request has been cancelled.</p>
                  {booking.cancellation?.reason && <p className="mt-2">Reason: {booking.cancellation.reason}</p>}
                  {booking.cancellation?.refund_status && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-slate-300">Refund status:</span>
                      <StatusBadge status={booking.cancellation.refund_status} />
                    </div>
                  )}
                </div>
              )}
              {booking.access_level === 'status' && (
                <div className="mx-6 mb-6 rounded-xl border border-violet-400/20 bg-violet-500/[0.07] p-4 text-sm leading-6 text-violet-200">
                  This Request ID shows status only. Sign in as the booking owner or open the original booking confirmation to view delivery details and take action.
                </div>
              )}

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
                      <div key={`${revision.revision_number}-${revision.requested_at}`} className="rounded-xl bg-white/[0.03] p-4">
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

          {!booking && !error && <div className="mx-auto mt-12 max-w-lg text-center text-sm text-slate-600">No Request ID yet? <Link to="/booking" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">Start a project <ArrowRight size={14} /></Link></div>}
        </div>
      </main>

      {revisionOpen && (
        <Modal title="Request a revision" eyebrow={requestId} onClose={() => setRevisionOpen(false)}>
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
