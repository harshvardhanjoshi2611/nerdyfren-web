import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getApiError } from '../lib/api';
import { getRolePath, roleWorkspaces } from '../lib/roleNavigation';

export default function RoleSwitcher({ className = '' }) {
  const navigate = useNavigate();
  const { activeRole, roles, switchRole } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (roles.length < 2) return null;

  const changeRole = async (role) => {
    if (role === activeRole) return;
    setBusy(true);
    setError('');
    try {
      const result = await switchRole(role);
      navigate(getRolePath(result.activeRole));
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <label className="inline-flex items-center gap-2 text-xs text-slate-500">
        <span className="hidden sm:inline">Workspace</span>
        <select
          value={activeRole || ''}
          disabled={busy}
          onChange={(event) => changeRole(event.target.value)}
          className="max-w-44 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-violet-400/60"
          aria-label="Switch workspace"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleWorkspaces[role]?.label || role}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="mt-1 max-w-52 text-right text-[10px] text-red-300">{error}</p>}
    </div>
  );
}
