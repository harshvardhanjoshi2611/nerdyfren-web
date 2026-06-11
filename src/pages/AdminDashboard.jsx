import { BadgeIndianRupee, BriefcaseBusiness, Check, CircleUserRound, LayoutDashboard, LoaderCircle, RefreshCw, UserRoundCheck, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { adminApi, getApiError } from '../lib/api';
import { formatDate, formatMoney, humanize, serviceMeta } from '../lib/format';

const links = [{ label: 'Operations', to: '/admin', icon: LayoutDashboard }];
const tabs = ['Bookings', 'Applications', 'Editors'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Bookings');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const { data, loading, error, reload } = useFetch(async () => {
    const [stats, bookings, applications, editors] = await Promise.all([adminApi.stats(), adminApi.bookings(), adminApi.applications(), adminApi.editors()]);
    return { stats, bookings, applications, editors };
  }, []);

  const action = async (key, work, success) => {
    setBusy(key); setNotice('');
    try { await work(); setNotice(success); setModal(null); await reload(); }
    catch (requestError) { setNotice(getApiError(requestError)); }
    finally { setBusy(''); }
  };

  return (
    <DashboardShell role="admin" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-violet-400">Marketplace operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Keep every project moving.</h1><p className="mt-2 text-sm text-slate-500">Bookings, talent and approvals in one command center.</p></div><button onClick={reload} className="btn-secondary !px-4 !py-2.5"><RefreshCw size={15} /> Refresh</button></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[[BriefcaseBusiness, 'Total bookings', data.stats.total_bookings], [BadgeIndianRupee, 'Paid revenue', formatMoney(data.stats.total_revenue)], [UsersRound, 'Active editors', data.stats.active_editors], [UserRoundCheck, 'Pending applications', data.stats.pending_applications]].map(([Icon, label, value]) => <div key={label} className="panel p-5"><div className="flex items-center justify-between"><Icon className="text-violet-400" size={18} /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></div><p className="mt-5 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
          </div>
          {notice && <div className={`mt-6 rounded-xl border p-3 text-sm ${notice.toLowerCase().includes('failed') || notice.toLowerCase().includes('error') ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-violet-400/20 bg-violet-500/10 text-violet-200'}`}>{notice}</div>}
          <div className="mt-10 flex gap-1 overflow-x-auto border-b border-white/[0.07]">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 pb-3 text-sm font-medium transition ${tab === item ? 'border-violet-400 text-white' : 'border-transparent text-slate-600 hover:text-slate-300'}`}>{item}<span className="ml-2 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px]">{data[item.toLowerCase()].length}</span></button>)}</div>
          <div className="mt-5">
            {tab === 'Bookings' && <BookingsTable items={data.bookings} editors={data.editors} busy={busy} action={action} />}
            {tab === 'Applications' && <ApplicationsTable items={data.applications} busy={busy} action={action} setModal={setModal} />}
            {tab === 'Editors' && <EditorsTable items={data.editors} busy={busy} action={action} />}
          </div>
        </div>
      )}
      {modal?.type === 'approve' && <ApproveModal application={modal.application} busy={busy} onClose={() => setModal(null)} onSubmit={(payload) => action(`approve-${modal.application.id}`, () => adminApi.approve(modal.application.id, payload), 'Editor account created.')} />}
    </DashboardShell>
  );
}

function BookingsTable({ items, editors, busy, action }) {
  const [assignments, setAssignments] = useState({});
  return <div className="panel overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-[.14em] text-slate-600"><tr>{['Project', 'Customer', 'Payment', 'Status', 'Editor', 'Created', 'Action'].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.055]">{items.map((booking) => <tr key={booking.id} className="hover:bg-white/[0.018]"><td className="px-5 py-4"><p className="font-medium">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</p><p className="mt-1 text-xs text-slate-600">{booking.booking_ref}</p></td><td className="px-5 py-4"><p className="text-slate-300">{booking.client_name}</p><p className="mt-1 text-xs text-slate-600">{booking.client_email}</p></td><td className="px-5 py-4"><StatusBadge status={booking.payment_status} /></td><td className="px-5 py-4"><StatusBadge status={booking.status} /></td><td className="px-5 py-4 text-slate-400">{booking.editor_name || 'Unassigned'}</td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(booking.created_at)}</td><td className="px-5 py-4">
    {booking.payment_status !== 'paid' ? <button disabled={!!busy} onClick={() => action(`pay-${booking.id}`, () => adminApi.updatePayment(booking.id, { payment_status: 'paid', payment_id: `manual-${Date.now()}` }), 'Payment marked as paid.')} className="btn-secondary !px-3 !py-2 text-xs">{busy === `pay-${booking.id}` ? <LoaderCircle className="animate-spin" size={14} /> : <Check size={14} />} Mark paid</button> :
      booking.status === 'unassigned' ? <div className="flex gap-2"><select value={assignments[booking.id] || ''} onChange={(e) => setAssignments({ ...assignments, [booking.id]: e.target.value })} className="input !w-36 !py-2 text-xs"><option value="">Choose editor</option>{editors.filter((e) => e.is_active).map((editor) => <option key={editor.id} value={editor.id}>{editor.name}</option>)}</select><button disabled={!assignments[booking.id] || !!busy} onClick={() => action(`assign-${booking.id}`, () => adminApi.assign(booking.id, Number(assignments[booking.id])), 'Project assigned.')} className="btn-primary !px-3 !py-2 text-xs">Assign</button></div> : <span className="text-xs text-slate-600">In workflow</span>}
  </td></tr>)}</tbody></table>{!items.length && <Empty label="No bookings yet" />}</div>;
}

function ApplicationsTable({ items, busy, action, setModal }) {
  return <div className="grid gap-4 lg:grid-cols-2">{items.map((application) => <div key={application.id} className="panel p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-300">{application.name.slice(0, 2).toUpperCase()}</div><div><h3 className="font-medium">{application.name}</h3><p className="mt-1 text-xs text-slate-600">{application.mobile}</p></div></div><StatusBadge status={application.status} /></div>{application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="mt-5 block truncate rounded-xl bg-white/[0.03] p-3 text-xs text-violet-300 hover:text-violet-200">{application.portfolio_url}</a>}<p className="mt-4 text-xs text-slate-600">Applied {formatDate(application.created_at)}</p>{application.status === 'pending' && <div className="mt-5 flex gap-2"><button onClick={() => setModal({ type: 'approve', application })} className="btn-primary flex-1 !py-2.5">Approve</button><button disabled={!!busy} onClick={() => action(`reject-${application.id}`, () => adminApi.reject(application.id, 'Not a fit for current marketplace needs.'), 'Application rejected.')} className="btn-secondary !px-4 !py-2.5"><X size={16} /></button></div>}</div>)}{!items.length && <div className="lg:col-span-2"><Empty label="No applications yet" /></div>}</div>;
}

function EditorsTable({ items, busy, action }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((editor) => <div key={editor.id} className="panel p-5"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold">{editor.name.slice(0, 2).toUpperCase()}</div><StatusBadge status={editor.is_active ? 'paid' : 'failed'} /></div><h3 className="mt-5 font-medium">{editor.name}</h3><p className="mt-1 text-xs text-slate-500">{editor.email}</p><div className="mt-4 flex flex-wrap gap-1.5">{(editor.skills || []).map((skill) => <span key={skill} className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">{skill}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-xs text-slate-600">Rating {editor.rating?.toFixed(1)}</span>{editor.is_active ? <button disabled={!!busy} onClick={() => action(`deactivate-${editor.id}`, () => adminApi.deactivate(editor.id), 'Editor deactivated.')} className="text-xs text-red-400 hover:text-red-300">Deactivate</button> : <span className="text-xs text-slate-600">Inactive</span>}</div></div>)}{!items.length && <div className="md:col-span-2 xl:col-span-3"><Empty label="No editors yet" /></div>}</div>;
}

function ApproveModal({ application, busy, onClose, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '', skills: '' });
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm"><form onSubmit={(e) => { e.preventDefault(); onSubmit({ email: form.email, password: form.password, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }); }} className="panel w-full max-w-md p-6"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-violet-400">Approve application</p><h2 className="mt-2 text-xl font-semibold">{application.name}</h2></div><button type="button" onClick={onClose} className="text-slate-600 hover:text-white"><X size={19} /></button></div><div className="mt-6 space-y-4"><label><span className="label">Login email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label><span className="label">Temporary password</span><input required minLength={12} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label><span className="label">Skills <span className="text-slate-600">(comma-separated)</span></span><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Premiere Pro, Motion graphics" /></label></div><button disabled={!!busy} className="btn-primary mt-6 w-full">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <CircleUserRound size={16} />} Create editor account</button></form></div>;
}

function Empty({ label }) { return <div className="py-16 text-center text-sm text-slate-600">{label}</div>; }
