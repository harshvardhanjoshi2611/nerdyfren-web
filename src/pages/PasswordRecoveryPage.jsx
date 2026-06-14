import {
  ArrowLeft,
  Check,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  adminApi,
  authApi,
  editorApi,
  getApiError,
  superAdminApi,
} from '../lib/api';
import { isStrongPassword, passwordRules } from '../lib/passwordPolicy';

const genericSuccess = 'If an account exists for this email, reset instructions have been sent.';

const roleSettings = {
  user: {
    label: 'Creator account',
    forgotPath: '/forgot-password',
    loginPath: '/signin',
    workspace: 'your creator account',
    api: authApi,
  },
  editor: {
    label: 'Nerd workspace',
    forgotPath: '/editor/forgot-password',
    loginPath: '/editor/signin',
    workspace: 'your Nerd workspace',
    api: editorApi,
  },
  admin: {
    label: 'Operations access',
    forgotPath: '/admin/forgot-password',
    loginPath: '/admin/login',
    workspace: 'the admin workspace',
    api: adminApi,
  },
  super_admin: {
    label: 'System access',
    forgotPath: '/super-admin/forgot-password',
    loginPath: '/super-admin',
    workspace: 'the super-admin workspace',
    api: superAdminApi,
  },
};

export default function PasswordRecoveryPage({ role = 'user', mode = 'forgot' }) {
  const settings = roleSettings[role];
  const resetting = mode === 'reset';
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (resetting) {
      if (!token) {
        setError('This reset link is missing its secure token. Request a new link.');
        return;
      }
      if (!isStrongPassword(password)) {
        setError('Choose a password that meets every requirement below.');
        return;
      }
      if (password !== confirmation) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (resetting) {
        await settings.api.resetPassword({ token, password });
        setSuccess('Password reset successful. You can now sign in.');
      } else {
        await settings.api.forgotPassword({ email: email.trim() });
        setSuccess(genericSuccess);
      }
    } catch (requestError) {
      setError(getApiError(
        requestError,
        resetting
          ? 'This reset link could not be used. Request a new one and try again.'
          : 'We could not process the request. Please try again.',
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-7 sm:px-10">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <span className="eyebrow">
            {resetting ? <KeyRound size={13} /> : <Mail size={13} />}
            {settings.label}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            {resetting ? 'Set a new password.' : 'Recover your password.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {resetting
              ? `Choose a strong password for ${settings.workspace}.`
              : 'Enter the email linked to your account. For privacy, the response is the same whether or not an account exists.'}
          </p>
          {resetting && !token && (
            <p className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
              This reset link is missing its secure token.{' '}
              <Link to={settings.forgotPath} className="font-semibold underline underline-offset-4">
                Request a new link
              </Link>
              .
            </p>
          )}

          {success ? (
            <div className="mt-8">
              <div className="panel border-emerald-400/20 bg-emerald-500/[0.06] p-5">
                <ShieldCheck className="text-emerald-300" size={22} />
                <p className="mt-3 text-sm leading-6 text-emerald-100">{success}</p>
                {!resetting && <p className="mt-2 text-xs leading-5 text-slate-500">Check your inbox and spam folder. The link expires in 15 minutes and works once.</p>}
              </div>
              <Link to={settings.loginPath} className="btn-primary mt-5 w-full">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              {!resetting ? (
                <label>
                  <span className="label">Email address</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              ) : (
                <>
                  <label>
                    <span className="label">New password</span>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      className="input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a strong password"
                    />
                  </label>
                  <label>
                    <span className="label">Confirm new password</span>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      className="input"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      placeholder="Repeat the new password"
                    />
                  </label>
                  <div className="grid gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 sm:grid-cols-2">
                    {passwordRules.map(([label, validate]) => {
                      const valid = validate(password);
                      return (
                        <p key={label} className={`flex items-center gap-2 text-xs ${valid ? 'text-emerald-300' : 'text-slate-600'}`}>
                          <Check size={13} /> {label}
                        </p>
                      );
                    })}
                  </div>
                </>
              )}

              {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
              <button disabled={loading || (resetting && !token)} className="btn-primary w-full">
                {loading
                  ? <LoaderCircle className="animate-spin" size={17} />
                  : resetting ? 'Reset password' : 'Send reset instructions'}
              </button>
            </form>
          )}

          {!success && (
            <Link to={settings.loginPath} className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          )}
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#0e1320] lg:block">
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[105px]" />
        <div className="relative flex h-full items-center justify-center p-16">
          <div className="panel max-w-lg p-8">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Secure account recovery</p>
            <blockquote className="mt-6 text-2xl font-semibold leading-9 tracking-tight">
              Reset links expire quickly, work only once, and never reveal whether an email is registered.
            </blockquote>
            <p className="mt-6 text-sm text-slate-500">NerdyFren account protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
