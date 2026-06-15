export const roleWorkspaces = Object.freeze({
  client: { label: 'Client Dashboard', path: '/dashboard/client' },
  editor: { label: 'Editor Workspace', path: '/dashboard/editor' },
  admin: { label: 'Admin Console', path: '/dashboard/admin' },
  super_admin: { label: 'Super Admin Console', path: '/dashboard/super-admin' },
});

export function getRolePath(role) {
  return roleWorkspaces[role]?.path || '/signin';
}
