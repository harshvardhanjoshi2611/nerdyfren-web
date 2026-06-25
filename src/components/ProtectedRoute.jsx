import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import { LoadingState } from './PageState';

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const { activeRole, isAuthenticated, loading, roles, user } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-canvas pt-24"><LoadingState label="Restoring your session" /></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (activeRole !== role) {
    return <AccessDeniedPage requiredRole={role} canSwitch={roles.includes(role)} />;
  }
  if (
    role === 'editor'
    && user?.canAccessNerd
    && !user?.nerdAssignable
    && !location.pathname.includes('/profile')
  ) {
    return <Navigate to="/dashboard/editor/profile" replace />;
  }
  return <Outlet />;
}
