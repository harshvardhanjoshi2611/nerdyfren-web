import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import EditorDashboard from './pages/EditorDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ServicesPage from './pages/ServicesPage';
import TrackingPage from './pages/TrackingPage';
import UserAuthPage from './pages/UserAuthPage';
import UserDashboard from './pages/UserDashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="/booking/success" element={<BookingSuccessPage />} />
      <Route path="/track" element={<TrackingPage />} />
      <Route path="/signin" element={<UserAuthPage mode="signin" />} />
      <Route path="/signup" element={<UserAuthPage mode="signup" />} />
      <Route element={<UserProtectedRoute />}>
        <Route path="/dashboard" element={<UserDashboard />} />
      </Route>
      <Route path="/editor/signin" element={<LoginPage role="editor" />} />
      <Route path="/editor/login" element={<LoginPage role="editor" />} />
      <Route element={<ProtectedRoute role="editor" />}>
        <Route path="/editor/dashboard" element={<EditorDashboard />} />
        <Route path="/editor" element={<EditorDashboard />} />
        <Route path="/editor/projects/:id" element={<ProjectDetailsPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage role="admin" />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/super-admin" element={<LoginPage role="super_admin" />} />
      <Route path="/superadmin" element={<LoginPage role="super_admin" />} />
      <Route element={<ProtectedRoute role="super_admin" />}>
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <FloatingWhatsApp />
    </>
  );
}
