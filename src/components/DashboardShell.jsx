import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import RoleSwitcher from './RoleSwitcher';
import useAuth from '../hooks/useAuth';

const roleLabels = {
  editor: 'Nerd',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export default function DashboardShell({ role, links, children }) {
  const navigate = useNavigate();
  const { endSession } = useAuth();
  const logout = async () => {
    await endSession();
    navigate('/signin');
  };
  return (
    <div className="nf-operational min-h-screen">
      <aside className="nf-ops-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 border-r px-5 py-6 lg:block">
        <Logo />
        <p className="mb-5 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">{roleLabels[role] || role} workspace</p>
        <nav className="space-y-1">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'nf-ops-nav-active' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-white/[0.04] hover:text-white"><LogOut size={17} /> Sign out</button>
      </aside>
      <div className="lg:pl-64">
        <header className="nf-ops-header sticky top-0 z-20 flex h-16 items-center justify-between border-b px-5 backdrop-blur-xl lg:px-8">
          <div className="lg:hidden"><Logo compact /></div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-slate-600 sm:block">NerdyFren / {roleLabels[role] || role}</p>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <button onClick={logout} className="text-sm text-slate-500 hover:text-white lg:hidden">Sign out</button>
          </div>
          <span className="hidden h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)] lg:block" />
        </header>
        <main className="px-5 py-8 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
