import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const workspaces = {
  user: { label: 'Creator', path: '/dashboard', token: 'nerdyfren_user_token' },
  editor: { label: 'Nerd', path: '/editor/dashboard', token: 'nerdyfren_editor_token' },
  admin: { label: 'Admin', path: '/admin', token: 'nerdyfren_admin_token' },
  super_admin: {
    label: 'Super Admin',
    path: '/super-admin/dashboard',
    token: 'nerdyfren_super_admin_token',
  },
};

export default function RoleSwitcher({ currentRole, user, className = '' }) {
  const navigate = useNavigate();
  const availableRoles = useMemo(() => {
    const roles = new Set(user?.roles || []);
    if (user?.role === 'user') roles.add('user');
    roles.add(currentRole);

    Object.entries(workspaces).forEach(([role, workspace]) => {
      const hasSessionMetadata = localStorage.getItem(`nerdyfren_${role}_roles`);
      if (localStorage.getItem(workspace.token) && (role === currentRole || hasSessionMetadata)) {
        roles.add(role);
      }
    });
    if (roles.has('super_admin')) roles.add('admin');

    return Object.keys(workspaces).filter((role) => roles.has(role));
  }, [currentRole, user]);

  if (availableRoles.length < 2) return null;

  return (
    <label className={`inline-flex items-center gap-2 text-xs text-slate-500 ${className}`}>
      <span className="hidden sm:inline">Workspace</span>
      <select
        value={currentRole}
        onChange={(event) => navigate(workspaces[event.target.value].path)}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-violet-400/60"
        aria-label="Switch workspace"
      >
        {availableRoles.map((role) => (
          <option key={role} value={role}>{workspaces[role].label}</option>
        ))}
      </select>
    </label>
  );
}
