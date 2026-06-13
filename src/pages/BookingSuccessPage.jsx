import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Check,
  Clock3,
  LoaderCircle,
  MessageCircle,
  ReceiptIndianRupee,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CopyButton from '../components/CopyButton';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import useAuth from '../hooks/useAuth';
import { getApiError, paymentsApi, userApi } from '../lib/api';
import { formatMoney, serviceMeta } from '../lib/format';
import { paymentConfig } from '../lib/paymentConfig';

export default function BookingSuccessPage() {
  const location = useLocation();
  const { user } = useAuth();
  const stored = JSON.parse(sessionStorage.getItem('nerdyfren_last_booking') || 'null');
  const booking = location.state || stored;
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [numericBookingId, setNumericBookingId] = useState(
    booking?.booking_id || booking?.id || '',
  );
  const [payment, setPayment] = useState({ payment_reference: '', screenshot_url: '' });
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!user || !booking?.booking_ref || numericBookingId) return;
    userApi.bookings()
      .then((result) => {
        const owned = result.bookings?.find((item) => item.booking_ref === booking.booking_ref);
        if (owned?.id) setNumericBookingId(owned.id);
      })
      .catch(() => {});
  }, [booking?.booking_ref, numericBookingId, user]);

  const whatsappMessage = useMemo(() => encodeURIComponent(
    `Hi NerdyFren, I started project ${booking?.booking_ref || ''}.`,
  ), [booking?.booking_ref]);
  const whatsappHref = paymentConfig.whatsappNumber
    ? `https://wa.me/${paymentConfig.whatsappNumber}?text=${whatsappMessage}`
    : 'https://wa.me/';

  const evidenceHref = useMemo(() => {
    const text = [
      `Hi NerdyFren, payment notification submitted for ${booking?.booking_ref || ''}.`,
      payment.payment_reference ? `Reference: ${payment.payment_reference}` : '',
      payment.screenshot_url ? `Screenshot: ${payment.screenshot_url}` : '',
    ].filter(Boolean).join('\n');
    return paymentConfig.whatsappNumber
      ? `https://wa.me/${paymentConfig.whatsappNumber}?text=${encodeURIComponent(text)}`
      : 'https://wa.me/';
  }, [booking?.booking_ref, payment.payment_reference, payment.screenshot_url]);

  if (!booking) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-5">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">No recent booking found</h1>
          <p className="mt-2 text-sm text-slate-500">Start a project to receive your Booking ID.</p>
          <Link to="/book" className="btn-primary mt-6">Start a project</Link>
        </div>
      </div>
    );
  }

  const submitPayment = async (event) => {
    event.preventDefault();
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const result = await paymentsApi.notify({
        booking_id: Number(numericBookingId),
        payment_amount: Number(booking.amount),
        payment_reference: payment.payment_reference.trim(),
      });
      if (payment.screenshot_url) {
        sessionStorage.setItem(
          `nerdyfren_payment_evidence_${booking.booking_ref}`,
          payment.screenshot_url,
        );
      }
      setPaymentResult(result);
    } catch (requestError) {
      setPaymentError(getApiError(requestError, 'Could not submit the payment notification.'));
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className="aurora min-h-screen bg-canvas px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-center"><Logo /></div>
        <div className="panel mt-12 overflow-hidden p-7 sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"><Check size={25} /></div>
          <div className="mt-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Brief received</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Your project is booked.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Complete payment, notify the team, and keep your private Tracking ID nearby.</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <IdentifierCard
              icon={ReceiptIndianRupee}
              label="Booking ID"
              value={booking.booking_ref}
            />
            <IdentifierCard
              icon={ShieldCheck}
              label="Private Tracking ID"
              value={booking.tracking_token}
            />
          </div>

          <div className="mt-6 rounded-xl bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600"><Clock3 size={14} /> Expected timeline</p>
                <p className="mt-2 text-sm font-medium">{serviceMeta[booking.service_type]?.timeline || '2-5 business days'}</p>
              </div>
              <p className="text-2xl font-bold">{formatMoney(booking.amount)}</p>
            </div>
          </div>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">Payment instructions</p>
                <h2 className="mt-2 text-xl font-semibold">Choose your payment method</h2>
              </div>
              <BadgeIndianRupee className="text-violet-400" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <PaymentInstruction icon={Smartphone} label="UPI ID" value={paymentConfig.upiId} />
              <PaymentInstruction icon={Building2} label="Bank transfer" value={paymentConfig.bankTransfer} />
              <PaymentInstruction
                icon={MessageCircle}
                label="WhatsApp"
                value={paymentConfig.whatsappNumber ? `+${paymentConfig.whatsappNumber}` : 'Open WhatsApp'}
                href={whatsappHref}
              />
            </div>
          </section>

          <button onClick={() => setPaymentOpen(true)} className="btn-primary mt-7 w-full">
            <ReceiptIndianRupee size={17} /> I Have Paid
          </button>
          <Link to={`/track?token=${encodeURIComponent(booking.tracking_token)}`} className="btn-secondary mt-3 w-full">Track Project <ArrowRight size={17} /></Link>
        </div>
      </div>

      {paymentOpen && (
        <Modal
          title={paymentResult ? 'Payment notification sent' : 'Notify payment'}
          eyebrow={booking.booking_ref}
          onClose={() => setPaymentOpen(false)}
        >
          {paymentResult ? (
            <div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="font-medium text-emerald-300">Your payment is awaiting admin verification.</p>
                <p className="mt-2 text-sm text-slate-400">Reference {paymentResult.payment_reference}</p>
              </div>
              {payment.screenshot_url && (
                <a href={evidenceHref} target="_blank" rel="noreferrer" className="btn-secondary mt-4 w-full">
                  <MessageCircle size={16} /> Share screenshot evidence on WhatsApp
                </a>
              )}
              <button onClick={() => setPaymentOpen(false)} className="btn-primary mt-3 w-full">Done</button>
            </div>
          ) : (
            <form onSubmit={submitPayment} className="space-y-4">
              <label>
                <span className="label">Numeric Booking ID</span>
                <input
                  required
                  min="1"
                  type="number"
                  className="input"
                  value={numericBookingId}
                  onChange={(event) => setNumericBookingId(event.target.value)}
                  placeholder={user ? 'Resolving your booking...' : 'Enter the numeric ID shared by the team'}
                />
                <span className="mt-2 block text-xs text-slate-600">
                  Signed-in bookings resolve automatically. Guest bookings can use the numeric ID shared by the coordinator.
                </span>
              </label>
              <label>
                <span className="label">Payment Reference</span>
                <input
                  required
                  minLength={6}
                  maxLength={100}
                  className="input"
                  value={payment.payment_reference}
                  onChange={(event) => setPayment({ ...payment, payment_reference: event.target.value })}
                  placeholder="UPI / UTR / transaction reference"
                />
              </label>
              <label>
                <span className="label">Screenshot URL <span className="text-slate-600">(optional)</span></span>
                <input
                  type="url"
                  className="input"
                  value={payment.screenshot_url}
                  onChange={(event) => setPayment({ ...payment, screenshot_url: event.target.value })}
                  placeholder="https://drive.google.com/..."
                />
                <span className="mt-2 block text-xs text-slate-600">Saved in this browser and available to share with the coordinator after submission.</span>
              </label>
              {paymentError && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{paymentError}</p>}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setPaymentOpen(false)} className="btn-secondary">Cancel</button>
                <button disabled={paymentBusy || !numericBookingId} className="btn-primary">
                  {paymentBusy ? <LoaderCircle className="animate-spin" size={16} /> : <ReceiptIndianRupee size={16} />}
                  Submit notification
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

function IdentifierCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Icon size={15} /> {label}</div>
      <p className="mt-4 break-all rounded-xl bg-black/25 p-4 font-mono text-sm text-slate-200">{value}</p>
      <CopyButton value={value} className="mt-3" />
    </div>
  );
}

function PaymentInstruction({ icon: Icon, label, value, href }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <Icon size={18} className="text-violet-400" />
      <p className="mt-4 text-xs uppercase tracking-[.12em] text-slate-600">{label}</p>
      <p className="mt-2 min-h-10 break-words text-sm text-slate-300">{value}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton value={value} />
        {href && <a href={href} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-2 text-xs">Open</a>}
      </div>
    </div>
  );
}
