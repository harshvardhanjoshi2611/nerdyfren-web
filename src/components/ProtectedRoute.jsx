import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const token = localStorage.getItem(`nerdyfren_${role}_token`);
  return token ? <Outlet /> : <Navigate to={`/${role}/login`} state={{ from: location }} replace />;
}
