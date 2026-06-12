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
          <Link to="/editor/signin" className="hover:text-white">Login as Nerd</Link>
          <a href="https://allboutcommunication.com" target="_blank" rel="noreferrer" className="hover:text-white">Our Mothership</a>
          <a href={import.meta.env.VITE_MERCH_URL || 'https://allboutcommunication.com'} target="_blank" rel="noreferrer" className="hover:text-white">Nerd Merchandise</a>
          <a href={import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/nerdyfren/'} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
          <Link to="/admin/login" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
