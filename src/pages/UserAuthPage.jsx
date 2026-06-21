import { ArrowRight, Check, LoaderCircle, Mail, Smartphone, UserRound } from 'lucide-react';
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
      const returnLocation = location.state?.from;
      const returnPath = returnLocation?.pathname
        ? `${returnLocation.pathname}${returnLocation.search || ''}${returnLocation.hash || ''}`
        : '';
      navigate(
        returnPath || getRolePath(result.activeRole),
        { replace: true },
      );
    } catch (requestError) {
      setError(getApiError(requestError, isSignup ? 'Account creation failed.' : 'Sign in failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nf-auth-page">
      <div className="nf-auth-shell">
        <section className="nf-auth-main">
          <Logo tone="surface" />
          <div className="nf-auth-form-wrap">
            <p className="nf-auth-eyebrow"><UserRound size={13} /> One NerdyFren account</p>
            <h1>{isSignup ? 'Create your NerdyFren account.' : 'Welcome back.'}</h1>
            <p className="nf-auth-intro">
              {isSignup
                ? 'Book editors, track requests, manage revisions, and keep your content moving.'
                : 'Sign in to manage your bookings, payments, edits, and workspace access.'}
            </p>

            <div className="nf-auth-tabs">
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
                  className={contactType === value ? 'is-active' : ''}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="nf-auth-form">
              {isSignup && (
                <label>
                  <span>Name</span>
                  <input required minLength={2} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" />
                </label>
              )}
              <label>
                <span>{contactType === 'email' ? 'Email address' : 'Mobile number'}</span>
                <input
                  required
                  type={contactType === 'email' ? 'email' : 'tel'}
                  autoComplete={contactType === 'email' ? 'email' : 'tel'}
                  value={form.identifier}
                  onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                  placeholder={contactType === 'email' ? 'alex@creator.com' : '+91 98765 43210'}
                />
              </label>
              <label>
                <span>Password</span>
                <input required minLength={isSignup ? 8 : 1} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} />
              </label>
              {!isSignup && <div className="nf-auth-forgot"><Link to="/forgot-password">Forgot password?</Link></div>}
              {error && <p className="nf-auth-error">{error}</p>}
              <button disabled={loading} className="nf-auth-submit">
                {loading ? <LoaderCircle className="animate-spin" size={17} /> : <>{isSignup ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></>}
              </button>
            </form>

            <p className="nf-auth-switch">
              {isSignup ? 'Already have an account?' : 'New to NerdyFren?'}{' '}
              <Link to={isSignup ? '/signin' : '/signup'} state={location.state}>{isSignup ? 'Sign in' : 'Create an account'}</Link>
            </p>
            <Link to="/" className="nf-auth-home">Back to NerdyFren.com</Link>
          </div>
        </section>

        <aside className="nf-auth-aside">
          <div className="nf-auth-aside-grain" />
          <div className="nf-auth-aside-content">
            <p className="nf-auth-aside-eyebrow">A clearer creative pipeline</p>
            <h2>One login.<br /><span>Every NerdyFren workspace.</span></h2>
            <p>Briefs, bookings, payments, and delivery - all in one place.</p>
            <ul>
              {['100% human editors', 'Request tracking in one place', 'Client, Nerd and admin access'].map((item) => (
                <li key={item}><Check size={16} /> {item}</li>
              ))}
            </ul>
            <p className="nf-auth-aside-tagline">You shoot. We edit.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
