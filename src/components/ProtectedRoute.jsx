import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const token = localStorage.getItem(`nerdyfren_${role}_token`);
  const loginPath = role === 'editor' ? '/editor/signin' : `/${role}/login`;
  return token ? <Outlet /> : <Navigate to={loginPath} state={{ from: location }} replace />;
}
