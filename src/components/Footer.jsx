import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">A sharper creative team, exactly when you need one.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-500">
          <Link to="/services" className="hover:text-white">Services</Link>
          <Link to={isAuthenticated ? '/dashboard' : '/track'} className="hover:text-white">Track order</Link>
          <Link to="/editor/login" className="hover:text-white">Editor portal</Link>
          <Link to="/admin/login" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
