import { ArrowLeft, ArrowRight, Check, Link2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { bookingsApi, getApiError, servicesApi } from '../lib/api';
import { fallbackServices, formatMoney, serviceMeta } from '../lib/format';
import useAuth from '../hooks/useAuth';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState(fallbackServices);
  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', service_type: searchParams.get('service') || '', brief: '', referenceUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    servicesApi.list().then((items) => {
      if (!active) return;
      setServices(items);
      setForm((current) => current.service_type || !items[0]
        ? current
        : { ...current, service_type: items[0].id });
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
  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        service_type: form.service_type,
        brief: form.brief,
        ...(form.referenceUrl ? { ref_links: [{ url: form.referenceUrl, label: 'Creative reference' }] } : {}),
      };
      const booking = await bookingsApi.create(payload);
      sessionStorage.setItem('nerdyfren_last_booking', JSON.stringify(booking));
      navigate('/booking/success', { state: booking });
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
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Tell us what you’re making.</h1>
          <p className="mt-4 text-slate-400">You’ll receive a secure tracking link after submission. Payment is confirmed separately by our team.</p>
          <form onSubmit={submit} className="mt-10 space-y-7">
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
                  return <label key={service.id} className={`cursor-pointer rounded-xl border p-4 transition ${active ? 'border-violet-400/60 bg-violet-500/10' : 'border-white/10 bg-white/[0.025] hover:border-white/20'}`}><input type="radio" name="service_type" value={service.id} checked={active} onChange={update} className="sr-only" /><span className="flex items-center justify-between"><span className="text-sm font-medium">{serviceMeta[service.id]?.name || service.id}</span>{active && <Check size={15} className="text-violet-300" />}</span><span className="mt-2 block text-xs text-slate-500">{formatMoney(service.amount)}</span></label>;
                })}
              </div>
            </fieldset>
            <label><span className="label">What should we create?</span><textarea required name="brief" value={form.brief} onChange={update} className="input min-h-36 resize-y" placeholder="Share the goal, audience, desired tone, raw footage and anything that would help your specialist nail the first cut." /></label>
            <label><span className="label">Reference link <span className="text-slate-600">(optional)</span></span><div className="relative"><Link2 size={16} className="absolute left-4 top-3.5 text-slate-600" /><input type="url" name="referenceUrl" value={form.referenceUrl} onChange={update} className="input !pl-11" placeholder="https://drive.google.com/..." /></div></label>
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={loading || !selected} className="btn-primary w-full sm:w-auto">{loading ? <LoaderCircle className="animate-spin" size={17} /> : <>Submit project <ArrowRight size={17} /></>}</button>
          </form>
        </div>
        <aside className="lg:pt-24">
          <div className="panel sticky top-8 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Order summary</p>
            <h2 className="mt-5 text-xl font-semibold">{serviceMeta[form.service_type]?.name || 'Select a service'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{serviceMeta[form.service_type]?.short || 'Choose the best package for your next upload.'}</p>
            <div className="my-6 h-px bg-white/[0.07]" />
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Project total</span><span className="text-2xl font-bold">{selected ? formatMoney(selected.amount) : '-'}</span></div>
            <p className="mt-2 text-xs text-slate-600">Payment is collected manually after the brief is reviewed.</p>
            <div className="mt-6 rounded-xl bg-white/[0.03] p-4 text-xs leading-5 text-slate-500"><ShieldCheck className="mb-3 text-emerald-400" size={19} />Your tracking token is private. Keep it safe and only share it with people who should see project status.</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
