import { Activity, MousePointerClick, ReceiptIndianRupee, RefreshCw, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { adminApi } from '../lib/api';
import { formatDateTime, humanize } from '../lib/format';
import { ErrorState, LoadingState } from './PageState';
import StatusBadge from './StatusBadge';

export default function AdminInsightsPanel() {
  const [range, setRange] = useState('7d');
  const [busy, setBusy] = useState('');
  const { data, loading, error, reload } = useFetch(async () => {
    const [summary, notifications] = await Promise.all([
      adminApi.analytics(range),
      adminApi.notifications(200),
    ]);
    return { summary, notifications };
  }, [range]);

  if (loading) return <LoadingState label="Loading analytics" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const metrics = [
    [Activity, 'Visits', data.summary.total_visits],
    [UsersRound, 'Unique sessions', data.summary.unique_sessions],
    [MousePointerClick, 'Booking starts', data.summary.booking_starts],
    [ReceiptIndianRupee, 'Payment successes', data.summary.payment_successes],
  ];
  const retry = async (id) => {
    setBusy(`retry-${id}`);
    try {
      await adminApi.retryNotification(id);
      await reload();
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Traffic and actions</h2><p className="mt-1 text-xs text-slate-500">Minimal, privacy-conscious product events.</p></div>
        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {['7d', '30d'].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${range === item ? 'bg-amber-100 text-amber-900' : 'text-slate-500'}`}>{item}</button>)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([Icon, label, value]) => <div key={label} className="panel p-5"><Icon size={18} className="text-violet-400" /><p className="mt-4 text-2xl font-bold">{value || 0}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="font-semibold">Conversion signals</h3>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Book Editor clicks', data.summary.book_editor_clicks],
              ['Signup completions', data.summary.signup_completions],
              ['Login completions', data.summary.login_completions],
              ['Booking completions', data.summary.booking_completions],
              ['Payment starts', data.summary.payment_starts],
              ['Payment failures', data.summary.payment_failures],
              ['WhatsApp clicks', data.summary.whatsapp_clicks],
              ['Tracking opens', data.summary.track_request_opens],
            ].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.03] p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value || 0}</dd></div>)}
          </dl>
        </section>
        <section className="panel p-5">
          <h3 className="font-semibold">Top pages</h3>
          <div className="mt-4 space-y-2">
            {data.summary.top_pages?.length ? data.summary.top_pages.map((page) => <div key={page.page_path} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm"><span>{page.page_path}</span><strong>{page.visits}</strong></div>) : <p className="text-sm text-slate-500">No page views recorded for this range.</p>}
          </div>
        </section>
      </div>

      <section className="panel overflow-x-auto">
        <div className="border-b border-white/[0.07] p-5"><h3 className="font-semibold">Notification delivery log</h3><p className="mt-1 text-xs text-slate-500">Email and WhatsApp attempts never block project updates.</p></div>
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Request ID</th><th className="px-4 py-3">Channel</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody>
            {data.notifications.map((item) => <tr key={item.id} className="border-t border-white/[0.06]"><td className="px-4 py-3 text-xs">{formatDateTime(item.created_at)}</td><td className="px-4 py-3 font-mono text-xs">{item.request_id || '-'}</td><td className="px-4 py-3">{humanize(item.channel)}</td><td className="px-4 py-3">{humanize(item.event_type || item.notification_type)}</td><td className="px-4 py-3 text-xs">{item.recipient_email || item.recipient_phone || item.recipient_role || '-'}</td><td className="px-4 py-3">{humanize(item.provider)}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="max-w-xs px-4 py-3 text-xs text-slate-500">{item.failure_reason || item.error_message || item.provider_message_id || '-'}</td><td className="px-4 py-3">{['failed', 'skipped'].includes(item.status) ? <button className="btn-secondary !px-3 !py-2 text-xs" disabled={busy === `retry-${item.id}`} onClick={() => retry(item.id)}>{busy === `retry-${item.id}` ? 'Retrying' : <><RefreshCw size={13} /> Retry</>}</button> : '-'}</td></tr>)}
          </tbody>
        </table>
      </section>
    </div>
  );
}
