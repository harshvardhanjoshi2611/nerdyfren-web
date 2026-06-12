import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { LoadingState } from './PageState';

export default function UserProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-canvas pt-24"><LoadingState label="Restoring your session" /></div>;
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/signin" state={{ from: location }} replace />;
}
