import { BadgeIndianRupee, BriefcaseBusiness, Check, ExternalLink, LayoutDashboard, LoaderCircle, RefreshCw, UsersRound } from 'lucide-react';
import { useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { adminApi, getApiError } from '../lib/api';
import { formatDateTime, formatMoney, getProjectName, humanize, serviceMeta } from '../lib/format';
import { AuditPanel, ExportPanel, LeadsPanel, OperationsPanel, ReportsPanel, WorkloadPanel } from '../components/OperationsPanels';
import { servicesApi } from '../lib/api';

const links = [{ label: 'Operations', to: '/admin', icon: LayoutDashboard }];
const projectStatuses = ['unassigned', 'assigned', 'work_in_progress', 'draft_submitted', 'awaiting_revision', 'final_delivered', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Projects');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const isSuperAdmin = Boolean(localStorage.getItem('nerdyfren_super_admin_token'));
  const tabs = ['Reports', 'Operations', 'Projects', 'Workload', 'Leads', 'Editors', 'Exports', ...(isSuperAdmin ? ['Audit Trail'] : [])];
  const { data, loading, error, reload } = useFetch(async () => {
    const [stats, bookings, editors, services] = await Promise.all([
      adminApi.stats(),
      adminApi.bookings(),
      adminApi.editors(),
      servicesApi.list(),
    ]);
    return { stats, bookings, editors, services };
  }, []);

  const action = async (key, work, success) => {
    setBusy(key);
    setNotice('');
    try {
      await work();
      setNotice(success);
      await reload();
    } catch (requestError) {
      setNotice(getApiError(requestError));
    } finally {
      setBusy('');
    }
  };

  return (
    <DashboardShell role={isSuperAdmin ? 'super_admin' : 'admin'} links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-violet-400">Marketplace operations</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Keep every project moving.</h1>
              <p className="mt-2 text-sm text-slate-500">Project status, payments, Nerd assignments and activity in one command center.</p>
            </div>
            <button onClick={reload} className="btn-secondary !px-4 !py-2.5"><RefreshCw size={15} /> Refresh</button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [BriefcaseBusiness, 'Total projects', data.stats.total_bookings],
              [BadgeIndianRupee, 'Paid revenue', formatMoney(data.stats.total_revenue)],
              [UsersRound, 'Active Nerds', data.stats.active_editors],
              [BriefcaseBusiness, 'Unassigned', data.stats.unassigned],
            ].map(([Icon, label, value]) => (
              <div key={label} className="panel p-5">
                <Icon className="text-violet-400" size={18} />
                <p className="mt-5 text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {notice && <div className={`mt-6 rounded-xl border p-3 text-sm ${notice.toLowerCase().includes('could not') || notice.toLowerCase().includes('required') || notice.toLowerCase().includes('invalid') ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-violet-400/20 bg-violet-500/10 text-violet-200'}`}>{notice}</div>}

          <div className="mt-10 flex gap-1 overflow-x-auto border-b border-white/[0.07]">
            {tabs.map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 pb-3 text-sm font-medium transition ${tab === item ? 'border-violet-400 text-white' : 'border-transparent text-slate-600 hover:text-slate-300'}`}>
                {item}
                {(item === 'Projects' || item === 'Editors') && <span className="ml-2 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px]">{item === 'Projects' ? data.bookings.length : data.editors.length}</span>}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === 'Reports' && <ReportsPanel editors={data.editors} services={data.services} />}
            {tab === 'Operations' && <OperationsPanel editors={data.editors} services={data.services} />}
            {tab === 'Projects' && <ProjectsTable items={data.bookings} editors={data.editors} busy={busy} action={action} />}
            {tab === 'Workload' && <WorkloadPanel editors={data.editors} services={data.services} />}
            {tab === 'Leads' && <LeadsPanel services={data.services} />}
            {tab === 'Editors' && <EditorsTable items={data.editors} busy={busy} action={action} />}
            {tab === 'Exports' && <ExportPanel isSuperAdmin={isSuperAdmin} />}
            {tab === 'Audit Trail' && <AuditPanel />}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function ProjectsTable({ items, editors, busy, action }) {
  const [assignments, setAssignments] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});

  if (!items.length) return <div className="panel"><Empty label="No projects yet" /></div>;

  return (
    <div className="panel overflow-x-auto">
      <table className="min-w-[1500px] w-full text-left text-sm">
        <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-4 py-4">Project Name</th>
            <th className="px-4 py-4">Client/User Name</th>
            <th className="px-4 py-4">Service</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">Payment Status</th>
            <th className="px-4 py-4">Assigned Nerd</th>
            <th className="px-4 py-4">Booking Date & Time</th>
            <th className="px-4 py-4">Activity Log / Timeline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {items.map((booking) => {
            const latest = booking.latest_activity || {
              activity_label: 'Booking Created',
              created_at: booking.created_at,
            };
            return (
              <tr key={booking.id} className="align-top transition hover:bg-white/[0.015]">
                <td className="px-4 py-5">
                  <p className="font-semibold text-white">{getProjectName(booking)}</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-600">{booking.booking_ref}</p>
                  {booking.delivery && <a href={booking.delivery.delivery_link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-300">View delivery <ExternalLink size={12} /></a>}
                </td>
                <td className="px-4 py-5">
                  <p className="text-slate-200">{booking.client_name}</p>
                  <p className="mt-1 text-xs text-slate-600">{booking.client_email}</p>
                </td>
                <td className="px-4 py-5 text-slate-300">{serviceMeta[booking.service_type]?.name || humanize(booking.service_type)}</td>
                <td className="px-4 py-5">
                  <StatusBadge status={booking.status} />
                  <div className="mt-3 flex gap-2">
                    <select value={statusOverrides[booking.id] || booking.status} onChange={(event) => setStatusOverrides({ ...statusOverrides, [booking.id]: event.target.value })} className="input min-w-40 !py-2 text-xs">
                      {projectStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
                    </select>
                    <button disabled={!!busy} onClick={() => action(`status-${booking.id}`, () => adminApi.updateStatus(booking.id, statusOverrides[booking.id] || booking.status), 'Project status updated.')} className="btn-secondary !px-3 !py-2 text-xs">Update</button>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <StatusBadge status={booking.payment_status} />
                  {booking.payment_status !== 'paid' && (
                    <button disabled={!!busy} onClick={() => action(`pay-${booking.id}`, () => adminApi.updatePayment(booking.id, { payment_status: 'paid', payment_id: `manual-${Date.now()}` }), 'Payment marked as received.')} className="btn-secondary mt-3 !px-3 !py-2 text-xs">
                      {busy === `pay-${booking.id}` ? <LoaderCircle className="animate-spin" size={13} /> : <Check size={13} />} Mark paid
                    </button>
                  )}
                </td>
                <td className="px-4 py-5">
                  <p className="text-slate-300">{booking.editor_name || 'Unassigned'}</p>
                  <div className="mt-3 flex gap-2">
                    <select value={assignments[booking.id] || ''} onChange={(event) => setAssignments({ ...assignments, [booking.id]: event.target.value })} className="input min-w-40 !py-2 text-xs">
                      <option value="">Choose Nerd</option>
                      {editors.filter((editor) => editor.is_active).map((editor) => <option key={editor.id} value={editor.id}>{editor.name}</option>)}
                    </select>
                    <button disabled={!assignments[booking.id] || booking.payment_status !== 'paid' || !!busy} onClick={() => action(`assign-${booking.id}`, () => booking.assigned_to ? adminApi.reassign(booking.id, Number(assignments[booking.id])) : adminApi.assign(booking.id, Number(assignments[booking.id])), booking.assigned_to ? 'Project reassigned.' : 'Nerd assigned.')} className="btn-primary !px-3 !py-2 text-xs">
                      {booking.assigned_to ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                  {booking.payment_status !== 'paid' && <p className="mt-2 text-[10px] text-slate-600">Confirm payment before assignment.</p>}
                </td>
                <td className="px-4 py-5 text-xs text-slate-400">{formatDateTime(booking.created_at)}</td>
                <td className="px-4 py-5">
                  <p className="font-medium text-violet-300">{latest.activity_label}</p>
                  <p className="mt-1 text-xs text-slate-600">{formatDateTime(latest.created_at)}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-slate-400 hover:text-white">View full timeline</summary>
                    <div className="mt-3 min-w-64 space-y-3 border-l border-violet-400/20 pl-3">
                      {(booking.activity_history || []).map((activity) => (
                        <div key={activity.id}>
                          <p className="text-xs font-medium text-slate-300">{activity.activity_label}</p>
                          <p className="mt-0.5 text-[10px] text-slate-600">{formatDateTime(activity.created_at)}</p>
                          {activity.details && <p className="mt-1 max-w-64 truncate text-[10px] text-slate-500">{activity.details}</p>}
                        </div>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditorsTable({ items, busy, action }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((editor) => (
        <div key={editor.id} className="panel p-5">
          <div className="flex items-start justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold">{editor.name.slice(0, 2).toUpperCase()}</div>
            <StatusBadge status={editor.is_active ? 'paid' : 'failed'} />
          </div>
          <h3 className="mt-5 font-medium">{editor.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{editor.email}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">{(editor.skills || []).map((skill) => <span key={skill} className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">{skill}</span>)}</div>
          <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
            <span className="text-xs text-slate-600">Rating {editor.rating?.toFixed(1)}</span>
            {editor.is_active ? <button disabled={!!busy} onClick={() => action(`deactivate-${editor.id}`, () => adminApi.deactivate(editor.id), 'Nerd deactivated.')} className="text-xs text-red-400 hover:text-red-300">Deactivate</button> : <span className="text-xs text-slate-600">Inactive</span>}
          </div>
        </div>
      ))}
      {!items.length && <div className="md:col-span-2 xl:col-span-3"><Empty label="No Nerds yet" /></div>}
    </div>
  );
}

function Empty({ label }) {
  return <div className="py-16 text-center text-sm text-slate-600">{label}</div>;
}
