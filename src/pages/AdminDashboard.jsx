import { BadgeIndianRupee, BriefcaseBusiness, Check, CircleUserRound, ExternalLink, LayoutDashboard, LoaderCircle, RefreshCw, UserRoundCheck, UsersRound, X } from 'lucide-react';
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
    try {
      const result = await work();
      setNotice(typeof success === 'function' ? success(result) : success);
      setModal(null);
      await reload();
      return result;
    }
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
      {modal?.type === 'approve' && <ApproveModal application={modal.application} busy={busy} onClose={() => setModal(null)} onSubmit={(payload) => action(`approve-${modal.application.id}`, () => adminApi.approve(modal.application.id, payload), (result) => `Editor created. Temporary password: ${result.temporary_password}`)} />}
    </DashboardShell>
  );
}

function BookingsTable({ items, editors, busy, action }) {
  const [assignments, setAssignments] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});
  const statuses = ['unassigned', 'assigned', 'work_in_progress', 'draft_submitted', 'awaiting_revision', 'final_delivered', 'completed', 'cancelled'];
  return <div className="space-y-4">{items.map((booking) => <article key={booking.id} className="panel p-5"><div className="grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr]">
    <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</h3><StatusBadge status={booking.status} /><StatusBadge status={booking.payment_status} /></div><p className="mt-2 text-xs text-slate-600">{booking.booking_ref} · {booking.client_name} · {formatDate(booking.created_at)}</p><p className="mt-1 text-xs text-slate-600">{booking.client_email}</p>
      {booking.delivery && <a href={booking.delivery.delivery_link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200">View latest delivery <ExternalLink size={14} /></a>}
      {booking.revision_requests?.length > 0 && <details className="mt-3 text-xs text-pink-300"><summary className="cursor-pointer">{booking.revision_requests.length} revision request(s)</summary><div className="mt-2 space-y-2">{booking.revision_requests.map((revision) => <p key={revision.id} className="rounded-lg bg-pink-500/[0.06] p-3 text-slate-400">{revision.message}</p>)}</div></details>}
      {booking.assignment_history?.length > 0 && <details className="mt-3 text-xs text-violet-300"><summary className="cursor-pointer">Assignment history</summary><div className="mt-2 space-y-1 text-slate-500">{booking.assignment_history.map((entry) => <p key={entry.id}>{entry.editor_name} · {humanize(entry.assignment_type)} · {formatDate(entry.assigned_at)}</p>)}</div></details>}
    </div>
    <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Assignment</p><p className="mt-2 text-sm text-slate-300">{booking.editor_name || 'Unassigned'}</p>{booking.payment_status !== 'paid' ? <button disabled={!!busy} onClick={() => action(`pay-${booking.id}`, () => adminApi.updatePayment(booking.id, { payment_status: 'paid', payment_id: `manual-${Date.now()}` }), 'Payment marked as paid.')} className="btn-secondary mt-3 !px-3 !py-2 text-xs">{busy === `pay-${booking.id}` ? <LoaderCircle className="animate-spin" size={14} /> : <Check size={14} />} Mark paid</button> : <div className="mt-3 flex gap-2"><select value={assignments[booking.id] || ''} onChange={(event) => setAssignments({ ...assignments, [booking.id]: event.target.value })} className="input !py-2 text-xs"><option value="">Choose editor</option>{editors.filter((editor) => editor.is_active).map((editor) => <option key={editor.id} value={editor.id}>{editor.name}</option>)}</select><button disabled={!assignments[booking.id] || !!busy} onClick={() => action(`assign-${booking.id}`, () => booking.assigned_to ? adminApi.reassign(booking.id, Number(assignments[booking.id])) : adminApi.assign(booking.id, Number(assignments[booking.id])), booking.assigned_to ? 'Project reassigned.' : 'Project assigned.')} className="btn-primary !px-3 !py-2 text-xs">{booking.assigned_to ? 'Reassign' : 'Assign'}</button></div>}</div>
    <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Admin override</p><div className="mt-3 flex gap-2"><select value={statusOverrides[booking.id] || booking.status} onChange={(event) => setStatusOverrides({ ...statusOverrides, [booking.id]: event.target.value })} className="input !py-2 text-xs">{statuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select><button disabled={!!busy} onClick={() => { const status = statusOverrides[booking.id] || booking.status; action(`status-${booking.id}`, () => adminApi.updateStatus(booking.id, status), 'Project status updated.'); }} className="btn-secondary !px-3 !py-2 text-xs">Update</button></div></div>
  </div></article>)}{!items.length && <div className="panel"><Empty label="No bookings yet" /></div>}</div>;
}

function ApplicationsTable({ items, busy, action, setModal }) {
  return <div className="grid gap-4 lg:grid-cols-2">{items.map((application) => <div key={application.id} className="panel p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-300">{application.name.slice(0, 2).toUpperCase()}</div><div><h3 className="font-medium">{application.name}</h3><p className="mt-1 text-xs text-slate-600">{application.mobile}</p></div></div><StatusBadge status={application.status} /></div>{application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="mt-5 block truncate rounded-xl bg-white/[0.03] p-3 text-xs text-violet-300 hover:text-violet-200">{application.portfolio_url}</a>}<p className="mt-4 text-xs text-slate-600">Applied {formatDate(application.created_at)}</p>{application.status === 'pending' && <div className="mt-5 flex gap-2"><button onClick={() => setModal({ type: 'approve', application })} className="btn-primary flex-1 !py-2.5">Approve</button><button disabled={!!busy} onClick={() => action(`reject-${application.id}`, () => adminApi.reject(application.id, 'Not a fit for current marketplace needs.'), 'Application rejected.')} className="btn-secondary !px-4 !py-2.5"><X size={16} /></button></div>}</div>)}{!items.length && <div className="lg:col-span-2"><Empty label="No applications yet" /></div>}</div>;
}

function EditorsTable({ items, busy, action }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((editor) => <div key={editor.id} className="panel p-5"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold">{editor.name.slice(0, 2).toUpperCase()}</div><StatusBadge status={editor.is_active ? 'paid' : 'failed'} /></div><h3 className="mt-5 font-medium">{editor.name}</h3><p className="mt-1 text-xs text-slate-500">{editor.email}</p><div className="mt-4 flex flex-wrap gap-1.5">{(editor.skills || []).map((skill) => <span key={skill} className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">{skill}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-xs text-slate-600">Rating {editor.rating?.toFixed(1)}</span>{editor.is_active ? <button disabled={!!busy} onClick={() => action(`deactivate-${editor.id}`, () => adminApi.deactivate(editor.id), 'Editor deactivated.')} className="text-xs text-red-400 hover:text-red-300">Deactivate</button> : <span className="text-xs text-slate-600">Inactive</span>}</div></div>)}{!items.length && <div className="md:col-span-2 xl:col-span-3"><Empty label="No editors yet" /></div>}</div>;
}

function ApproveModal({ application, busy, onClose, onSubmit }) {
  const [form, setForm] = useState({ email: '', skills: '' });
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm"><form onSubmit={(e) => { e.preventDefault(); onSubmit({ email: form.email, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }); }} className="panel w-full max-w-md p-6"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-violet-400">Approve application</p><h2 className="mt-2 text-xl font-semibold">{application.name}</h2></div><button type="button" onClick={onClose} className="text-slate-600 hover:text-white"><X size={19} /></button></div><div className="mt-6 space-y-4"><label><span className="label">Login email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><p className="rounded-xl bg-white/[0.03] p-3 text-xs leading-5 text-slate-500">A secure temporary password will be generated once and shown after approval.</p><label><span className="label">Skills <span className="text-slate-600">(comma-separated)</span></span><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Premiere Pro, Motion graphics" /></label></div><button disabled={!!busy} className="btn-primary mt-6 w-full">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <CircleUserRound size={16} />} Create editor account</button></form></div>;
}

function Empty({ label }) { return <div className="py-16 text-center text-sm text-slate-600">{label}</div>; }
