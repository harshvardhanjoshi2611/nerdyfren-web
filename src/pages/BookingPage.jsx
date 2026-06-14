import { ArrowLeft, ArrowRight, Check, Link2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { bookingsApi, getApiError, servicesApi } from '../lib/api';
import { fallbackServices, formatMoney, serviceMeta } from '../lib/format';
import useAuth from '../hooks/useAuth';

function isWebUrl(value) {
  if (!value.trim()) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validateBooking(form) {
  if (form.client_name.trim().length < 2) return 'Please add your name so we know who to contact.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email.trim())) {
    return 'Please enter an email address we can use for project updates.';
  }
  if (form.client_phone.replace(/\D/g, '').length < 7) {
    return 'Please enter a valid phone or WhatsApp number.';
  }
  if (!form.service_type) return 'Please choose the service that best fits your project.';
  if (form.brief.trim().length < 3) return 'Tell us a little about what you would like us to create.';
  if (![form.referenceAudioUrl, form.referenceVideoUrl, form.rawFootageUrl].every(isWebUrl)) {
    return 'One of the optional links does not look right. Use a full link beginning with http:// or https://.';
  }
  return '';
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState(fallbackServices);
  const requestedService = searchParams.get('service');
  const initialService = fallbackServices.some((service) => service.id === requestedService && service.bookable !== false) ? requestedService : '';
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: initialService,
    brief: '',
    referenceAudioUrl: '',
    referenceVideoUrl: '',
    rawFootageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    servicesApi.list().then((items) => {
      if (!active) return;
      const bookableItems = items.filter((item) => item.bookable !== false && !item.coming_soon);
      setServices(items);
      setForm((current) => current.service_type || !bookableItems[0]
        ? current
        : { ...current, service_type: bookableItems[0].id });
    }).catch(() => {
      if (!active) return;
      setServices(fallbackServices);
      setError('Live pricing is temporarily unavailable. The booking form is still available, but submission requires the API connection.');
      setForm((current) => current.service_type
        ? current
        : { ...current, service_type: fallbackServices[0].id });
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

  const selected = services.find((item) => item.id === form.service_type);
  const selectedMeta = serviceMeta[form.service_type] || {};
  const needsAudioVideo = ['trend-hopper', 'video-reel', 'video-copy'].includes(form.service_type);
  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationError = validateBooking(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        service_type: form.service_type,
        brief: form.brief,
        ref_links: [
          ...(form.referenceAudioUrl ? [{ url: form.referenceAudioUrl, label: 'Reference Audio' }] : []),
          ...(form.referenceVideoUrl ? [{ url: form.referenceVideoUrl, label: 'Reference Video' }] : []),
          ...(form.rawFootageUrl ? [{ url: form.rawFootageUrl, label: 'Raw Footage' }] : []),
        ],
      };
      const booking = await bookingsApi.create(payload);
      const bookingContext = {
        ...booking,
        customer_name: form.client_name.trim(),
        service_name: selected?.name || selectedMeta.name || form.service_type,
      };
      sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(bookingContext));
      navigate('/booking/success', { state: bookingContext });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora min-h-screen bg-canvas">
      <header className="container-shell flex h-20 items-center justify-between"><Logo /><Link to="/services" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft size={16} /> Services</Link></header>
      <main className="container-shell grid gap-10 pb-20 pt-8 lg:grid-cols-[1fr_380px]">
        <div className="max-w-2xl">
          <span className="eyebrow">Project brief</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Tell us what you're making.</h1>
          <p className="mt-4 text-slate-400">You will receive a simple Request ID, payment instructions, and private project tracking after submission.</p>
          {user && (
            <p className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-200">
              Your account details are filled in below. You can edit them for this request.
            </p>
          )}
          <form noValidate onSubmit={submit} className="mt-10 space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label><span className="label">Your name</span><input required name="client_name" value={form.client_name} onChange={update} className="input" placeholder="Alex Morgan" /></label>
              <label><span className="label">Phone / WhatsApp</span><input required name="client_phone" value={form.client_phone} onChange={update} className="input" placeholder="+91 98765 43210" /></label>
            </div>
            <label><span className="label">Email address</span><input required type="email" name="client_email" value={form.client_email} onChange={update} className="input" placeholder="alex@creator.com" /></label>
            <fieldset>
              <legend className="label">Choose a service</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const active = form.service_type === service.id;
                  const unavailable = service.bookable === false || service.coming_soon;
                  return <label key={service.id} className={`rounded-xl border p-4 transition ${unavailable ? 'cursor-not-allowed border-white/5 bg-white/[0.015] opacity-55' : active ? 'cursor-pointer border-violet-400/60 bg-violet-500/10' : 'cursor-pointer border-white/10 bg-white/[0.025] hover:border-white/20'}`}><input disabled={unavailable} type="radio" name="service_type" value={service.id} checked={active} onChange={update} className="sr-only" /><span className="flex items-center justify-between"><span className="text-sm font-medium">{service.name || serviceMeta[service.id]?.name || service.id}</span>{unavailable ? <span className="text-[10px] uppercase text-cyan-300">Coming soon</span> : active && <Check size={15} className="text-violet-300" />}</span><span className="mt-2 block text-xs text-slate-500">{unavailable ? 'Surge pricing applies' : formatMoney(service.amount)}</span></label>;
                })}
              </div>
            </fieldset>
            <label><span className="label">What should we create?</span><textarea required name="brief" value={form.brief} onChange={update} className="input min-h-36 resize-y" placeholder="Share the goal, audience, desired tone, raw footage and anything that would help your specialist nail the first cut." /></label>
            {needsAudioVideo && <label><span className="label">Reference audio link <span className="text-slate-600">(optional)</span></span><div className="relative"><Link2 size={16} className="absolute left-4 top-3.5 text-slate-600" /><input type="url" name="referenceAudioUrl" value={form.referenceAudioUrl} onChange={update} className="input !pl-11" placeholder="https://..." /></div></label>}
            {needsAudioVideo && <label><span className="label">Reference video link <span className="text-slate-600">(optional)</span></span><div className="relative"><Link2 size={16} className="absolute left-4 top-3.5 text-slate-600" /><input type="url" name="referenceVideoUrl" value={form.referenceVideoUrl} onChange={update} className="input !pl-11" placeholder="https://..." /></div></label>}
            <label>
              <span className="label">Raw file link (Google Drive) <span className="text-slate-600">(optional)</span></span>
              <div className="relative"><Link2 size={16} className="absolute left-4 top-3.5 text-slate-600" /><input type="url" name="rawFootageUrl" value={form.rawFootageUrl} onChange={update} className="input !pl-11" placeholder="https://drive.google.com/..." /></div>
              <span className="mt-2 block text-xs leading-5 text-slate-600">You can submit now and share an authorized Drive link with your coordinator later.</span>
            </label>
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={loading || !selected} className="btn-primary w-full sm:w-auto">{loading ? <LoaderCircle className="animate-spin" size={17} /> : <>Submit project <ArrowRight size={17} /></>}</button>
          </form>
        </div>
        <aside className="lg:pt-24">
          <div className="panel sticky top-8 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Order summary</p>
            <h2 className="mt-5 text-xl font-semibold">{selectedMeta.name || 'Select a service'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{selectedMeta.short || 'Choose the best package for your next upload.'}</p>
            {selectedMeta.revisionCycles > 0 && <p className="mt-3 text-xs font-medium text-violet-300">{selectedMeta.revisionCycles} Revision Cycles</p>}
            <div className="my-6 h-px bg-white/[0.07]" />
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Project total</span><span className="text-2xl font-bold">{selected ? formatMoney(selected.amount) : '-'}</span></div>
            <p className="mt-2 text-xs text-slate-600">Payment instructions and the notification form appear after booking.</p>
            <div className="mt-6 rounded-xl bg-white/[0.03] p-4 text-xs leading-5 text-slate-500"><ShieldCheck className="mb-3 text-emerald-400" size={19} />Keep your Request ID private and share it only with people who should see the project.</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
