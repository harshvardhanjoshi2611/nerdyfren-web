import { Link } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';
import useSiteContent from '../hooks/useSiteContent';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { content } = useSiteContent();
  const links = content?.footer_links || [];
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">{content?.settings?.support_email}</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-500">
          <Link to="/services" className="hover:text-white">Services</Link>
          <Link to={isAuthenticated ? '/dashboard' : '/track'} className="hover:text-white">Track order</Link>
          {links.map((item) => item.url.startsWith('/') ? <Link key={item.id} to={item.url} className="hover:text-white">{item.label}</Link> : <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="hover:text-white">{item.label}</a>)}
          <Link to="/admin/login" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
