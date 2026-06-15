import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import { getApiError } from '../lib/api';
import { getRolePath, roleWorkspaces } from '../lib/roleNavigation';
import { useState } from 'react';

export default function AccessDeniedPage({ requiredRole, canSwitch = false }) {
  const navigate = useNavigate();
  const { activeRole, switchRole } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const workspace = roleWorkspaces[requiredRole];

  const activate = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await switchRole(requiredRole);
      navigate(getRolePath(result.activeRole), { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aurora min-h-screen px-5 py-7">
      <Logo />
      <main className="mx-auto flex min-h-[75vh] max-w-lg items-center">
        <div className="panel w-full p-7 text-center sm:p-10">
          <ShieldAlert className="mx-auto text-amber-300" size={28} />
          <h1 className="mt-5 text-3xl font-bold">This workspace is restricted.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {canSwitch
              ? `${workspace.label} belongs to your account, but it is not your active role.`
              : `${workspace.label} is not assigned to your account.`}
          </p>
          {error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          {canSwitch ? (
            <button disabled={busy} onClick={activate} className="btn-primary mt-7 w-full">
              {busy ? 'Switching...' : `Switch to ${workspace.label}`}
            </button>
          ) : (
            <Link to={getRolePath(activeRole)} className="btn-primary mt-7 w-full">
              Return to your dashboard
            </Link>
          )}
          <Link to="/" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white">
            <ArrowLeft size={15} /> Back to NerdyFren
          </Link>
        </div>
      </main>
    </div>
  );
}
