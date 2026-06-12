import { ArrowUpRight, CalendarDays, CreditCard, FolderKanban, LogOut, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';
import { getApiError, userApi } from '../lib/api';
import { formatDate, formatMoney, serviceMeta } from '../lib/format';

export default function UserDashboard() {
  const { user, endSession } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = () => {
    setLoading(true);
    setError('');
    userApi.bookings()
      .then((result) => setBookings(result.bookings || []))
      .catch((requestError) => setError(getApiError(requestError, 'Could not load your bookings.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-white/[0.06] bg-canvas/80 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/book" className="btn-primary !px-4 !py-2"><Plus size={16} /> New project</Link>
            <button onClick={endSession} className="rounded-lg p-2.5 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="container-shell py-10 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Creator dashboard</span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {user?.name?.split(' ')[0]}.</h1>
            <p className="mt-2 text-sm text-slate-500">Every account-owned project and its private tracking link.</p>
          </div>
          <p className="text-sm text-slate-600">{user?.email || user?.mobile}</p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            [FolderKanban, 'Total projects', bookings.length],
            [CreditCard, 'Paid', bookings.filter((item) => item.payment_status === 'paid').length],
            [CalendarDays, 'In progress', bookings.filter((item) => ['assigned', 'in_progress', 'revision'].includes(item.status)).length],
          ].map(([Icon, label, value]) => (
            <div key={label} className="panel p-5">
              <Icon className="text-violet-300" size={19} />
              <p className="mt-5 text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[.14em] text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-10">
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
              <Link to="/book" className="btn-primary mt-6">Start a project</Link>
            </div>
          )}
          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article key={booking.id} className="panel p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{serviceMeta[booking.service_type]?.name || booking.service_type}</h3>
                        <StatusBadge status={booking.status} />
                        <StatusBadge status={booking.payment_status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>{booking.booking_ref}</span>
                        <span>{formatDate(booking.created_at)}</span>
                        <span>{formatMoney(booking.amount)}</span>
                      </div>
                    </div>
                    <Link to={`/track?token=${encodeURIComponent(booking.tracking_token)}`} className="btn-secondary !px-4 !py-2.5">
                      Open tracking <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
