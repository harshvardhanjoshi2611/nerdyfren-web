import { ArrowRight, LoaderCircle, Mail, Smartphone, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import { authApi, getApiError } from '../lib/api';
import { getRolePath } from '../lib/roleNavigation';

export default function UserAuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession } = useAuth();
  const [contactType, setContactType] = useState('email');
  const [form, setForm] = useState({ name: '', identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const contact = { [contactType]: form.identifier.trim() };
      const result = isSignup
        ? await authApi.signup({ name: form.name, password: form.password, ...contact })
        : await authApi.login({ identifier: form.identifier, password: form.password });
      startSession(result);
      navigate(
        location.state?.from?.pathname || getRolePath(result.activeRole),
        { replace: true },
      );
    } catch (requestError) {
      setError(getApiError(requestError, isSignup ? 'Account creation failed.' : 'Sign in failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-7 sm:px-10">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <span className="eyebrow"><UserRound size={13} /> One NerdyFren account</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            {isSignup ? 'Your projects, in one place.' : 'Welcome back.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {isSignup
              ? 'Create an account to keep every booking and Request ID together.'
              : 'Sign in once, then move between every workspace assigned to your account.'}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {[
              ['email', Mail, 'Email'],
              ['mobile', Smartphone, 'Mobile'],
            ].map(([value, Icon, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setContactType(value);
                  setForm((current) => ({ ...current, identifier: '' }));
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  contactType === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            {isSignup && (
              <label>
                <span className="label">Name</span>
                <input required minLength={2} className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" />
              </label>
            )}
            <label>
              <span className="label">{contactType === 'email' ? 'Email address' : 'Mobile number'}</span>
              <input
                required
                type={contactType === 'email' ? 'email' : 'tel'}
                className="input"
                value={form.identifier}
                onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                placeholder={contactType === 'email' ? 'alex@creator.com' : '+91 98765 43210'}
              />
            </label>
            <label>
              <span className="label">Password</span>
              <input required minLength={isSignup ? 8 : 1} type="password" className="input" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} />
            </label>
            {!isSignup && <div className="-mt-2 text-right"><Link to="/forgot-password" className="text-sm text-violet-300 hover:text-violet-200">Forgot password?</Link></div>}
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? <LoaderCircle className="animate-spin" size={17} /> : <>{isSignup ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : 'New to NerdyFren?'}{' '}
            <Link to={isSignup ? '/signin' : '/signup'} className="font-medium text-violet-300 hover:text-violet-200">
              {isSignup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <Link to="/" className="mt-6 block text-center text-sm text-slate-600 hover:text-white">Back to NerdyFren</Link>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#0e1320] lg:block">
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="relative flex h-full items-center justify-center p-16">
          <div className="panel max-w-lg p-8">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">A clearer creative pipeline</p>
            <blockquote className="mt-6 text-2xl font-semibold leading-9 tracking-tight">
              Brief, payment, production and delivery status. No hunting through old messages.
            </blockquote>
            <p className="mt-6 text-sm text-slate-500">Built for creators who would rather keep creating.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
