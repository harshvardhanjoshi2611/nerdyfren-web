import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

const links = [['Services', '/services'], ['Track order', '/track'], ['For editors', '/editor/login']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-canvas/75 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `text-sm transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link to="/book" className="btn-primary !px-4 !py-2.5">Start a project</Link>
        </div>
        <button className="rounded-lg p-2 text-slate-300 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/[0.06] bg-canvas px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map(([label, href]) => <Link key={href} to={href} onClick={() => setOpen(false)} className="text-sm text-slate-300">{label}</Link>)}
            <Link to="/book" onClick={() => setOpen(false)} className="btn-primary">Start a project</Link>
          </div>
        </div>
      )}
    </header>
  );
}
