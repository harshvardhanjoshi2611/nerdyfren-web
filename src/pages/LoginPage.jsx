import { ArrowRight, LockKeyhole, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { adminApi, editorApi, getApiError, superAdminApi } from '../lib/api';

export default function LoginPage({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = role === 'admin';
  const isSuperAdmin = role === 'super_admin';
  const isOperations = isAdmin || isSuperAdmin;
  const forgotPath = isSuperAdmin
    ? '/super-admin/forgot-password'
    : isAdmin
      ? '/admin/forgot-password'
      : '/editor/forgot-password';

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const result = await (isSuperAdmin ? superAdminApi.login(form) : isAdmin ? adminApi.login(form) : editorApi.login(form));
      if (isSuperAdmin) {
        localStorage.removeItem('nerdyfren_admin_token');
        localStorage.removeItem('nerdyfren_admin_roles');
        localStorage.removeItem('nerdyfren_admin_profile');
      } else if (isAdmin) {
        localStorage.removeItem('nerdyfren_super_admin_token');
        localStorage.removeItem('nerdyfren_super_admin_roles');
        localStorage.removeItem('nerdyfren_super_admin_profile');
      }
      localStorage.setItem(`nerdyfren_${role}_token`, result.token);
      if (result.editor) localStorage.setItem('nerdyfren_editor_profile', JSON.stringify(result.editor));
      if (result.admin) localStorage.setItem(`nerdyfren_${role}_profile`, JSON.stringify(result.admin));
      localStorage.setItem(`nerdyfren_${role}_roles`, JSON.stringify(result.roles || [role]));
      navigate(location.state?.from?.pathname || (role === 'editor' ? '/editor/dashboard' : isSuperAdmin ? '/super-admin/dashboard' : '/admin'));
    } catch (requestError) { setError(getApiError(requestError, 'Login failed.')); }
    finally { setLoading(false); }
  };

  return (
    <div className="aurora grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-7 sm:px-10">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-16">
          <span className="eyebrow"><LockKeyhole size={13} /> {isSuperAdmin ? 'System access' : isAdmin ? 'Operations access' : 'Nerd workspace'}</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">{isSuperAdmin ? 'Shape the entire NerdyFren system.' : isAdmin ? 'Run the marketplace.' : 'Welcome back, creator of creators.'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{isSuperAdmin ? 'Manage content, accounts, services and global settings.' : isAdmin ? 'Manage projects, payments and Nerd assignments from one place.' : 'Access assigned projects and keep every delivery moving.'}</p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            <label><span className="label">Email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={isOperations ? 'you@company.com' : 'you@example.com'} /></label>
            <label><span className="label">Password</span><input required type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your secure password" /></label>
            <div className="-mt-2 text-right"><Link to={forgotPath} className="text-sm text-violet-300 hover:text-violet-200">Forgot password?</Link></div>
            {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">{loading ? <LoaderCircle className="animate-spin" size={17} /> : <>Sign in <ArrowRight size={17} /></>}</button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-600">{isOperations ? 'Restricted to authorized NerdyFren operators.' : 'Accounts are created after your application is approved.'}</p>
          {!isOperations && <p className="mt-2 text-center text-xs text-slate-700">Mobile sign-in and OTP are reserved for a future authentication phase.</p>}
          <Link to="/" className="mt-8 block text-center text-sm text-slate-500 hover:text-white">Back to NerdyFren</Link>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#0e1320] lg:block">
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-70" /><div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="relative flex h-full items-center justify-center p-16"><div className="panel max-w-lg p-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">One focused workspace</p><blockquote className="mt-6 text-2xl font-semibold leading-9 tracking-tight">{isSuperAdmin ? 'Change the product surface without waiting for another deployment.' : isAdmin ? 'Move every project from brief to delivery with less operational noise.' : 'Great editing is invisible. Great collaboration should feel the same.'}</blockquote><p className="mt-6 text-sm text-slate-500">NerdyFren operating principle</p></div></div>
      </div>
    </div>
  );
}
