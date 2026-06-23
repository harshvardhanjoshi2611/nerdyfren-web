import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Link2,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import { bookingsApi, getApiError, servicesApi } from '../lib/api';
import { fallbackServices, formatMoney, getPriceBreakdown, serviceMeta } from '../lib/format';
import { PaymentCancelledError, startRazorpayCheckout } from '../lib/razorpay';
import { trackEvent } from '../lib/analytics';

const steps = ['Choose service', 'Submit brief', 'Review & pay'];
const supportedServices = ['trend-hopper', 'video-reel', 'video-copy', 'podcast'];

function isWebUrl(value) {
  if (!value.trim()) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function buildBrief(form) {
  return [
    `Project goal: ${form.projectGoal.trim()}`,
    form.audioNotes.trim() && `Audio/reference notes: ${form.audioNotes.trim()}`,
    form.captionRequirement.trim() && `Caption/copy requirement: ${form.captionRequirement.trim()}`,
    form.deadline.trim() && `Deadline preference: ${form.deadline.trim()}`,
    form.additionalInstructions.trim() && `Additional instructions: ${form.additionalInstructions.trim()}`,
  ].filter(Boolean).join('\n\n');
}

function validateBrief(form) {
  if (form.client_name.trim().length < 2) return 'Please add your name so we know who to contact.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email.trim())) {
    return 'Please enter an email address we can use for project updates.';
  }
  if (form.client_phone.replace(/\D/g, '').length < 7) {
    return 'Please enter a valid WhatsApp number.';
  }
  if (form.projectGoal.trim().length < 3) return 'Tell us a little about what you would like us to create.';
  if (![form.rawFootageUrl, form.referenceEditUrl].every(isWebUrl)) {
    return 'One of the optional links does not look right. Use a full http:// or https:// link.';
  }
  return '';
}

function Field({ label, hint, children }) {
  return (
    <label className="nf-booking-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestedService = searchParams.get('service');
  const initialService = supportedServices.includes(requestedService)
    ? requestedService
    : 'trend-hopper';
  const [step, setStep] = useState(1);
  const [services, setServices] = useState(fallbackServices);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: initialService,
    projectGoal: '',
    rawFootageUrl: '',
    referenceEditUrl: '',
    audioNotes: '',
    captionRequirement: '',
    deadline: '',
    additionalInstructions: '',
    termsAccepted: false,
    cancellationAccepted: false,
  });
  const [bookingContext, setBookingContext] = useState(null);
  const [error, setError] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    let active = true;
    servicesApi.list()
      .then((items) => {
        if (active) setServices(items);
      })
      .catch(() => {
        if (active) setServices(fallbackServices);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      client_name: current.client_name || user.name || '',
      client_email: current.client_email || user.email || '',
      client_phone: current.client_phone || user.mobile || '',
    }));
  }, [user]);

  useEffect(() => {
    trackEvent('booking_started', { service: initialService });
  }, [initialService]);

  const displayServices = useMemo(() => supportedServices.map((id) => {
    const live = services.find((service) => service.id === id);
    const fallback = fallbackServices.find((service) => service.id === id);
    return {
      id,
      amount: live?.amount ?? fallback?.amount,
      bookable: live?.bookable !== false,
      ...serviceMeta[id],
    };
  }), [services]);
  const selected = displayServices.find((service) => service.id === form.service_type);
  const selectedPricing = getPriceBreakdown(selected || 0);

  const update = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const nextFromService = () => {
    if (!selected?.bookable) {
      setError('Please choose an available service.');
      return;
    }
    setError('');
    setStep(2);
  };

  const nextFromBrief = (event) => {
    event.preventDefault();
    const validationError = validateBrief(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(3);
  };

  const pay = async () => {
    if (!form.termsAccepted || !form.cancellationAccepted) {
      setError('Please agree to the Terms and Cancellation Policy before payment.');
      return;
    }
    setPaymentBusy(true);
    setPaymentMessage('');
    setError('');
    let context = bookingContext;
    try {
      if (!context) {
        const booking = await bookingsApi.create({
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          client_phone: form.client_phone.trim(),
          service_type: form.service_type,
          brief: buildBrief(form),
          ref_links: [
            ...(form.rawFootageUrl.trim()
              ? [{ url: form.rawFootageUrl.trim(), label: 'Raw Footage' }]
              : []),
            ...(form.referenceEditUrl.trim()
              ? [{ url: form.referenceEditUrl.trim(), label: 'Reference Video' }]
              : []),
          ],
        });
        context = {
          ...booking,
          customer_name: form.client_name.trim(),
          customer_email: form.client_email.trim(),
          customer_phone: form.client_phone.trim(),
          service_name: selected.name,
          brief: buildBrief(form),
        };
        setBookingContext(context);
        sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(context));
        trackEvent('booking_submitted', { service: form.service_type }, { requestId: booking.request_id });
      }

      setPaymentMessage('Opening secure Razorpay Checkout...');
      trackEvent('payment_started', { service: form.service_type }, { requestId: context.request_id });
      const verified = await startRazorpayCheckout({ booking: context, user });
      const paidContext = {
        ...context,
        ...verified,
        amount: verified.total_amount ?? verified.amount,
        payment_status: 'paid',
      };
      sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(paidContext));
      trackEvent('payment_success', { service: form.service_type }, { requestId: paidContext.request_id });
      navigate(`/booking/success?requestId=${encodeURIComponent(paidContext.request_id)}&payment=success`, { state: paidContext });
    } catch (requestError) {
      if (requestError instanceof PaymentCancelledError) {
        trackEvent('payment_failed', { reason: 'cancelled' }, { requestId: context?.request_id });
        const cancelledContext = { ...context, payment_status: 'pending', payment_state: 'cancelled' };
        sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(cancelledContext));
        navigate(`/booking/success?requestId=${encodeURIComponent(context.request_id)}&payment=cancelled`, { state: cancelledContext });
      } else {
        trackEvent('payment_failed', { reason: 'checkout_error' }, { requestId: context?.request_id });
        if (context?.request_id) {
          const failedContext = { ...context, payment_status: 'pending', payment_state: 'failed' };
          sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(failedContext));
          navigate(`/booking/success?requestId=${encodeURIComponent(context.request_id)}&payment=failed`, { state: failedContext });
        } else {
          setPaymentMessage('');
          setError(requestError?.response
            ? getApiError(requestError, 'Payment could not be completed.')
            : requestError.message || 'Payment could not be completed.');
        }
      }
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className="nf-public nf-booking-page">
      <header className="nf-booking-header">
        <div className="nf-container">
          <Logo tone="surface" />
          <Link to="/" className="nf-booking-back"><ArrowLeft size={16} /> Homepage</Link>
        </div>
      </header>

      <main className="nf-container nf-booking-main">
        <div className="nf-booking-heading">
          <p className="nf-eyebrow">Self-service booking</p>
          <h1>Book your NerdyFren editor.</h1>
          <p>Choose a service, share the brief, review the order, and pay securely with Razorpay.</p>
        </div>

        <ol className="nf-booking-steps" aria-label="Booking progress">
          {steps.map((label, index) => {
            const number = index + 1;
            return (
              <li key={label} className={step >= number ? 'is-active' : ''}>
                <span>{step > number ? <Check size={15} /> : number}</span>
                <p>{label}</p>
              </li>
            );
          })}
        </ol>

        {step === 1 && (
          <section className="nf-booking-panel">
            <div className="nf-booking-panel-heading">
              <p className="nf-eyebrow">Step 1</p>
              <h2>Choose your service</h2>
              <p>You can change this before creating the payment order.</p>
            </div>
            <div className="nf-booking-service-grid">
              {displayServices.map((service) => {
                const active = form.service_type === service.id;
                return (
                  <label key={service.id} className={`nf-booking-service ${active ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="service_type"
                      value={service.id}
                      checked={active}
                      onChange={(event) => {
                        update(event);
                        trackEvent('service_selected', { service: service.id });
                      }}
                    />
                    <span className="nf-booking-service-check">{active && <Check size={15} />}</span>
                    <h3>{service.name}</h3>
                    <p>{service.short}</p>
                    <strong>{formatMoney(service.amount)}</strong>
                  </label>
                );
              })}
            </div>
            {error && <p className="nf-booking-error">{error}</p>}
            <div className="nf-booking-actions is-end">
              <button type="button" onClick={nextFromService} className="nf-button-primary">Continue to brief <ArrowRight size={17} /></button>
            </div>
          </section>
        )}

        {step === 2 && (
          <form onSubmit={nextFromBrief} className="nf-booking-panel">
            <div className="nf-booking-panel-heading">
              <p className="nf-eyebrow">Step 2</p>
              <h2>Submit your brief</h2>
              <p>Links are supported for Google Drive, WeTransfer, Dropbox, YouTube, and Instagram.</p>
            </div>
            <div className="nf-booking-form-grid">
              <Field label="Customer name"><input required name="client_name" value={form.client_name} onChange={update} placeholder="Alex Morgan" /></Field>
              <Field label="WhatsApp number" hint="WhatsApp updates will be sent to this number where available."><input required name="client_phone" value={form.client_phone} onChange={update} placeholder="+91 98765 43210" /></Field>
              <Field label="Email address"><input required type="email" name="client_email" value={form.client_email} onChange={update} placeholder="alex@creator.com" /></Field>
              <Field label="Deadline preference"><input name="deadline" value={form.deadline} onChange={update} placeholder="For example: Friday evening" /></Field>
            </div>
            <Field label="What are we making?"><textarea required name="projectGoal" value={form.projectGoal} onChange={update} placeholder="Describe the platform, audience, goal, tone, and desired final output." /></Field>
            <div className="nf-booking-form-grid">
              <Field label="Raw footage link" hint="Optional now; you can share the authorized link later.">
                <div className="nf-booking-link-input"><Link2 size={16} /><input type="url" name="rawFootageUrl" value={form.rawFootageUrl} onChange={update} placeholder="https://drive.google.com/..." /></div>
              </Field>
              <Field label="Reference edit link" hint="Optional - no reference is required.">
                <div className="nf-booking-link-input"><Link2 size={16} /><input type="url" name="referenceEditUrl" value={form.referenceEditUrl} onChange={update} placeholder="https://youtube.com/..." /></div>
              </Field>
            </div>
            <div className="nf-booking-form-grid">
              <Field label="Audio/reference notes"><textarea name="audioNotes" value={form.audioNotes} onChange={update} placeholder="Music, pacing, hook, or inspiration notes." /></Field>
              <Field label="Caption/copy requirement"><textarea name="captionRequirement" value={form.captionRequirement} onChange={update} placeholder="On-screen copy, caption style, spelling, or CTA." /></Field>
            </div>
            <Field label="Additional instructions"><textarea name="additionalInstructions" value={form.additionalInstructions} onChange={update} placeholder="Anything else your editor should know?" /></Field>
            {error && <p className="nf-booking-error">{error}</p>}
            <div className="nf-booking-actions">
              <button type="button" onClick={() => { setError(''); setStep(1); }} className="nf-booking-secondary"><ArrowLeft size={16} /> Back</button>
              <button className="nf-button-primary">Review order <ArrowRight size={17} /></button>
            </div>
          </form>
        )}

        {step === 3 && selected && (
          <section className="nf-booking-panel">
            <div className="nf-booking-panel-heading">
              <p className="nf-eyebrow">Step 3</p>
              <h2>Review your order</h2>
              <p>Razorpay will handle the secure payment screen. NerdyFren marks the booking paid only after backend verification.</p>
            </div>
            <div className="nf-booking-review-grid">
              <div className="nf-booking-review-card">
                <p>Service</p>
                <h3>{selected.name}</h3>
                <strong>{formatMoney(selectedPricing.base_amount)}</strong>
                <ul>
                  {(selected.includes || []).map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}
                </ul>
                <dl>
                  <div><dt>Revision rounds</dt><dd>{selected.revisionCycles}</dd></div>
                  <div><dt>Delivery expectation</dt><dd>{selected.timeline}</dd></div>
                  <div><dt>Service price</dt><dd>{formatMoney(selectedPricing.base_amount)}</dd></div>
                  <div><dt>GST @ {selectedPricing.gst_rate}%</dt><dd>{formatMoney(selectedPricing.gst_amount)}</dd></div>
                  <div><dt>Total payable</dt><dd>{formatMoney(selectedPricing.total_amount)}</dd></div>
                </dl>
              </div>
              <div className="nf-booking-review-card">
                <p>Customer & brief</p>
                <h3>{form.client_name}</h3>
                <p className="nf-booking-review-copy">{form.client_email}<br />{form.client_phone}</p>
                <p className="nf-booking-review-copy">{form.projectGoal}</p>
                {form.rawFootageUrl && <p className="nf-booking-review-copy">Raw footage link added</p>}
                {form.referenceEditUrl && <p className="nf-booking-review-copy">Reference edit link added</p>}
              </div>
            </div>

            <div className="nf-booking-consents">
              <label><input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={update} /> <span>I agree to the <Link to="/terms" target="_blank">Terms</Link>.</span></label>
              <label><input type="checkbox" name="cancellationAccepted" checked={form.cancellationAccepted} onChange={update} /> <span>I agree to the <Link to="/cancellation-policy" target="_blank">Cancellation Policy</Link>.</span></label>
            </div>

            {bookingContext && (
              <p className="nf-booking-saved"><ShieldCheck size={17} /> Request saved as <strong>{bookingContext.request_id}</strong>. Payment is still pending.</p>
            )}
            {paymentMessage && <p className="nf-booking-payment-message">{paymentMessage}</p>}
            {error && <p className="nf-booking-error">{error}</p>}
            <div className="nf-booking-actions">
              {!bookingContext && <button type="button" onClick={() => { setError(''); setStep(2); }} className="nf-booking-secondary"><ArrowLeft size={16} /> Edit brief</button>}
              <button
                type="button"
                disabled={paymentBusy || !form.termsAccepted || !form.cancellationAccepted}
                onClick={pay}
                className="nf-button-primary"
              >
                {paymentBusy ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
                {bookingContext ? `Try payment again - ${formatMoney(selectedPricing.total_amount)}` : `Pay ${formatMoney(selectedPricing.total_amount)} with Razorpay`}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
