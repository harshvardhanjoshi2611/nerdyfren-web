import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import EditorDashboard from './pages/EditorDashboard';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ServicesPage from './pages/ServicesPage';
import TrackingPage from './pages/TrackingPage';
import UserAuthPage from './pages/UserAuthPage';
import UserDashboard from './pages/UserDashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import LegalPage from './pages/LegalPage';
import Seo from './components/Seo';

export default function App() {
  return (
    <>
      <Seo />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/booking/success" element={<BookingSuccessPage />} />
      <Route path="/track" element={<TrackingPage />} />
      <Route path="/privacy" element={<LegalPage type="privacy" />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/cancellation-policy" element={<LegalPage type="cancellation" />} />
      <Route path="/refund" element={<Navigate to="/cancellation-policy" replace />} />
      <Route path="/signin" element={<UserAuthPage mode="signin" />} />
      <Route path="/signup" element={<UserAuthPage mode="signup" />} />
      <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
      <Route path="/reset-password" element={<PasswordRecoveryPage mode="reset" />} />
      <Route element={<ProtectedRoute role="client" />}>
        <Route path="/dashboard/client" element={<UserDashboard />} />
      </Route>
      <Route path="/dashboard" element={<Navigate to="/dashboard/client" replace />} />
      <Route path="/editor/signin" element={<Navigate to="/signin" replace />} />
      <Route path="/editor/login" element={<Navigate to="/signin" replace />} />
      <Route path="/editor/forgot-password" element={<PasswordRecoveryPage role="editor" />} />
      <Route path="/editor/reset-password" element={<PasswordRecoveryPage role="editor" mode="reset" />} />
      <Route element={<ProtectedRoute role="editor" />}>
        <Route path="/dashboard/editor" element={<EditorDashboard />} />
        <Route path="/dashboard/editor/projects/:id" element={<ProjectDetailsPage />} />
      </Route>
      <Route path="/editor/dashboard" element={<Navigate to="/dashboard/editor" replace />} />
      <Route path="/editor" element={<Navigate to="/dashboard/editor" replace />} />
      <Route path="/editor/projects/:id" element={<EditorProjectRedirect />} />
      <Route path="/admin/signin" element={<Navigate to="/signin" replace />} />
      <Route path="/admin/login" element={<Navigate to="/signin" replace />} />
      <Route path="/admin/forgot-password" element={<PasswordRecoveryPage role="admin" />} />
      <Route path="/admin/reset-password" element={<PasswordRecoveryPage role="admin" mode="reset" />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
      <Route path="/super-admin/signin" element={<Navigate to="/signin" replace />} />
      <Route path="/superadmin/signin" element={<Navigate to="/signin" replace />} />
      <Route path="/super-admin/forgot-password" element={<PasswordRecoveryPage role="super_admin" />} />
      <Route path="/super-admin/reset-password" element={<PasswordRecoveryPage role="super_admin" mode="reset" />} />
      <Route element={<ProtectedRoute role="super_admin" />}>
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
      </Route>
      <Route path="/super-admin" element={<Navigate to="/dashboard/super-admin" replace />} />
      <Route path="/superadmin" element={<Navigate to="/dashboard/super-admin" replace />} />
      <Route path="/super-admin/dashboard" element={<Navigate to="/dashboard/super-admin" replace />} />
      <Route path="/superadmin/dashboard" element={<Navigate to="/dashboard/super-admin" replace />} />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <FloatingWhatsApp />
    </>
  );
}

function EditorProjectRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/editor/projects/${id}`} replace />;
}
