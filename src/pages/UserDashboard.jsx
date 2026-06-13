import { CalendarDays, CheckCircle2, ExternalLink, FolderKanban, LoaderCircle, LogOut, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';
import { getApiError, userApi } from '../lib/api';
import { formatDate, getProjectName, serviceMeta } from '../lib/format';
import { getProjectLinkLabel } from '../lib/projectLinks';

export default function UserDashboard() {
  const { user, endSession } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState({ bookingId: null, message: '' });
  const [revisionBusy, setRevisionBusy] = useState(false);
  const sortedBookings = [...bookings].sort(
    (first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0),
  );

  const loadBookings = () => {
    setLoading(true);
    setError('');
    userApi.bookings()
      .then((result) => setBookings(result.bookings || []))
      .catch((requestError) => setError(getApiError(requestError, 'Could not load your bookings.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  const requestRevision = async (bookingId) => {
    setRevisionBusy(true);
    setError('');
    try {
      await userApi.requestRevision(bookingId, revision.message);
      setRevision({ bookingId: null, message: '' });
      loadBookings();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not submit your revision request.'));
    } finally {
      setRevisionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-white/[0.06] bg-canvas/80 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/booking" className="btn-primary !px-4 !py-2"><Plus size={16} /> New project</Link>
            <button onClick={endSession} className="rounded-lg p-2.5 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="container-shell py-10 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">User Dashboard</span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {user?.name?.split(' ')[0]}.</h1>
            <p className="mt-2 text-sm text-slate-500">Every account-owned project and its private tracking link.</p>
          </div>
          <p className="text-sm text-slate-600">{user?.email || user?.mobile}</p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            [FolderKanban, 'Total projects', bookings.length],
            [CalendarDays, 'In progress', bookings.filter((item) => ['assigned', 'work_in_progress', 'awaiting_revision'].includes(item.status)).length],
            [CheckCircle2, 'Completed', bookings.filter((item) => item.status === 'completed').length],
          ].map(([Icon, label, value]) => (
            <div key={label} className="panel p-5">
              <Icon className="text-violet-300" size={19} />
              <p className="mt-5 text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[.14em] text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <section id="bookings" className="mt-10 scroll-mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My bookings</h2>
            <span className="text-xs text-slate-600">{bookings.length} total</span>
          </div>
          {loading && <LoadingState label="Loading your bookings" />}
          {!loading && error && <ErrorState message={error} onRetry={loadBookings} />}
          {!loading && !error && bookings.length === 0 && (
            <div className="panel p-10 text-center">
              <FolderKanban className="mx-auto text-slate-600" />
              <h3 className="mt-4 font-semibold">No account bookings yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">New projects created while signed in will appear here. Existing guest bookings remain available through their private tracking links.</p>
              <Link to="/booking" className="btn-primary mt-6">Start a project</Link>
            </div>
          )}
          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {sortedBookings.map((booking) => (
                <article key={booking.id} className="panel p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid flex-1 gap-4 sm:grid-cols-4">
                      <div><p className="text-[10px] uppercase tracking-wider text-slate-600">Project Name</p><Link to={`/track?token=${encodeURIComponent(booking.tracking_token)}`} className="mt-2 block font-semibold text-white hover:text-violet-300">{getProjectName(booking)}</Link></div>
                      <div><p className="text-[10px] uppercase tracking-wider text-slate-600">Service</p><p className="mt-2 text-sm text-slate-300">{serviceMeta[booking.service_type]?.name || booking.service_type}</p></div>
                      <div><p className="text-[10px] uppercase tracking-wider text-slate-600">Status</p><div className="mt-2"><StatusBadge status={booking.status} /></div></div>
                      <div><p className="text-[10px] uppercase tracking-wider text-slate-600">Date Created</p><p className="mt-2 text-sm text-slate-300">{formatDate(booking.created_at)}</p></div>
                    </div>
                  </div>
                  {booking.ref_links?.length > 0 && (
                    <details className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <summary className="cursor-pointer text-sm font-medium text-slate-300">Project links ({booking.ref_links.length})</summary>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {booking.ref_links.map((item) => (
                          <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2 text-xs text-cyan-300">
                            <span className="truncate">{getProjectLinkLabel(item.label)}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ))}
                      </div>
                    </details>
                  )}
                  {booking.delivery && (
                    <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan-300">Delivery ready</p>
                          {booking.delivery.delivery_note && <p className="mt-2 text-sm text-slate-400">{booking.delivery.delivery_note}</p>}
                        </div>
                        <a href={booking.delivery.delivery_link} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2.5">Open delivery link <ExternalLink size={15} /></a>
                      </div>
                    </div>
                  )}
                  {['draft_submitted', 'final_delivered'].includes(booking.status) && (
                    <div className="mt-4">
                      {revision.bookingId === booking.id ? (
                        <div className="rounded-xl border border-pink-400/15 bg-pink-500/[0.05] p-4">
                          <label><span className="label">Revision notes</span><textarea className="input min-h-24 resize-y" value={revision.message} onChange={(event) => setRevision({ bookingId: booking.id, message: event.target.value })} placeholder="Be specific about what should change." /></label>
                          <div className="mt-3 flex gap-2">
                            <button disabled={revisionBusy || revision.message.trim().length < 3} onClick={() => requestRevision(booking.id)} className="btn-primary !px-4 !py-2.5">{revisionBusy ? <LoaderCircle className="animate-spin" size={15} /> : <RotateCcw size={15} />} Send request</button>
                            <button onClick={() => setRevision({ bookingId: null, message: '' })} className="btn-secondary !px-4 !py-2.5">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRevision({ bookingId: booking.id, message: '' })} className="text-sm font-medium text-pink-300 hover:text-pink-200">Request a revision</button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
