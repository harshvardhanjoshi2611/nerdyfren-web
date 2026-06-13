import { Check, Download, LoaderCircle, ReceiptIndianRupee } from 'lucide-react';
import { adminApi } from '../lib/api';
import { downloadRowsCsv } from '../lib/csv';
import { formatDateTime, formatMoney, humanize } from '../lib/format';
import StatusBadge from './StatusBadge';

function paymentRows(bookings) {
  return bookings.map((booking) => ({
    booking_id: booking.id,
    booking_reference: booking.booking_ref,
    client: booking.client_name,
    payment_reference: booking.payment_reference || '',
    amount: booking.payment_amount ?? booking.amount,
    status: booking.payment_status,
    payment_date: booking.payment_date || '',
    booking_date: booking.created_at,
  }));
}

export default function PaymentsPanel({ pending, bookings, busy, action }) {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Awaiting verification</h2>
            <p className="mt-1 text-sm text-slate-500">Payment references submitted by clients.</p>
          </div>
          <button
            type="button"
            onClick={() => downloadRowsCsv('nerdyfren-payments.csv', paymentRows(bookings))}
            disabled={!bookings.length}
            className="btn-secondary"
          >
            <Download size={15} /> Payments CSV
          </button>
        </div>
        {pending.length ? (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {pending.map((payment) => (
              <article key={payment.notification_id} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <ReceiptIndianRupee size={20} />
                  </div>
                  <StatusBadge status={payment.processing_status || payment.payment_status} />
                </div>
                <p className="mt-5 font-semibold">{payment.client_name}</p>
                <p className="mt-1 font-mono text-xs text-slate-600">{payment.booking_ref}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
                  <div><dt className="text-slate-600">Amount</dt><dd className="mt-1 text-sm font-medium text-slate-200">{formatMoney(payment.payment_amount)}</dd></div>
                  <div><dt className="text-slate-600">Submitted</dt><dd className="mt-1 text-slate-300">{formatDateTime(payment.submitted_at)}</dd></div>
                  <div className="col-span-2"><dt className="text-slate-600">Payment reference</dt><dd className="mt-1 break-all rounded-lg bg-black/20 p-3 font-mono text-sm text-cyan-300">{payment.payment_reference}</dd></div>
                </dl>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => action(
                    `verify-${payment.notification_id}`,
                    () => adminApi.verifyPayment({ notification_id: payment.notification_id }),
                    `Payment ${payment.payment_reference} verified.`,
                  )}
                  className="btn-primary mt-5 w-full"
                >
                  {busy === `verify-${payment.notification_id}`
                    ? <LoaderCircle className="animate-spin" size={15} />
                    : <Check size={15} />}
                  Mark Paid / Verify Payment
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel py-14 text-center text-sm text-slate-600">No payment notifications are awaiting verification.</div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">All payment records</h2>
          <p className="mt-1 text-sm text-slate-500">Current payment state for every booking.</p>
        </div>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-4">Booking</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Payment date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-white/[0.015]">
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{booking.booking_ref}</td>
                  <td className="px-5 py-4"><p className="text-slate-200">{booking.client_name}</p><p className="mt-1 text-xs text-slate-600">{booking.client_email}</p></td>
                  <td className="max-w-56 break-all px-5 py-4 font-mono text-xs text-cyan-300">{booking.payment_reference || '-'}</td>
                  <td className="px-5 py-4">{formatMoney(booking.payment_amount ?? booking.amount)}</td>
                  <td className="px-5 py-4"><StatusBadge status={booking.payment_status} /></td>
                  <td className="px-5 py-4 text-xs text-slate-400">{booking.payment_date ? formatDateTime(booking.payment_date) : humanize(booking.payment_status)}</td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan="6" className="px-5 py-14 text-center text-slate-600">No payment records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
