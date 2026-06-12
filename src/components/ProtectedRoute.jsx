import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const token = role === 'admin'
    ? localStorage.getItem('nerdyfren_admin_token') || localStorage.getItem('nerdyfren_super_admin_token')
    : localStorage.getItem(`nerdyfren_${role}_token`);
  const loginPath = role === 'editor' ? '/editor/signin' : role === 'super_admin' ? '/super-admin' : `/${role}/login`;
  return token ? <Outlet /> : <Navigate to={loginPath} state={{ from: location }} replace />;
}
