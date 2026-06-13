import { Download, Filter, LoaderCircle, Plus, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { adminApi, getApiError, superAdminApi } from '../lib/api';
import { downloadRowsCsv } from '../lib/csv';
import { formatDateTime, formatMoney, humanize, serviceMeta } from '../lib/format';
import StatusBadge from './StatusBadge';
import { ErrorState, LoadingState } from './PageState';

const statuses = ['', 'unassigned', 'assigned', 'work_in_progress', 'draft_submitted', 'awaiting_revision', 'final_delivered', 'completed', 'cancelled'];
const paymentStatuses = ['', 'pending', 'paid', 'failed', 'refunded'];
const leadStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];
const emptyFilters = { date_from: '', date_to: '', service: '', status: '', payment_status: '', editor_id: '', client: '', source: '' };

function clean(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
}

async function downloadCsv(type, params = {}, isAudit = false) {
  const response = isAudit ? await superAdminApi.exportAudit(params) : await adminApi.exportCsv(type, params);
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nerdyfren-${type}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportFilters({ value, onChange, editors = [], services = [] }) {
  const update = (key, next) => onChange({ ...value, [key]: next });
  return <div className="panel grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
    <label><span className="label">From</span><input type="date" className="input" value={value.date_from} onChange={(event) => update('date_from', event.target.value)} /></label>
    <label><span className="label">To</span><input type="date" className="input" value={value.date_to} onChange={(event) => update('date_to', event.target.value)} /></label>
    <Select label="Service" value={value.service} onChange={(next) => update('service', next)} options={services.map((item) => [item.id, item.name])} />
    <Select label="Status" value={value.status} onChange={(next) => update('status', next)} options={statuses.slice(1).map((item) => [item, humanize(item)])} />
    <Select label="Payment" value={value.payment_status} onChange={(next) => update('payment_status', next)} options={paymentStatuses.slice(1).map((item) => [item, humanize(item)])} />
    <Select label="Assigned Nerd" value={value.editor_id} onChange={(next) => update('editor_id', next)} options={editors.map((item) => [String(item.id), item.name])} />
    <label><span className="label">Client / User</span><input className="input" value={value.client} onChange={(event) => update('client', event.target.value)} placeholder="Name or email" /></label>
    <label><span className="label">Source</span><input className="input" value={value.source} onChange={(event) => update('source', event.target.value)} placeholder="website, referral..." /></label>
    <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4"><button onClick={() => onChange(emptyFilters)} className="btn-secondary"><Filter size={15} /> Clear filters</button>{['bookings', 'reports', 'workload'].map((type) => <button key={type} onClick={() => downloadCsv(type, clean(value))} className="btn-secondary"><Download size={15} /> {humanize(type)} CSV</button>)}</div>
  </div>;
}

function Select({ label, value, onChange, options }) {
  return <label><span className="label">{label}</span><select className="input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">All</option>{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>;
}

export function ReportsPanel({ editors, services }) {
  const [filters, setFilters] = useState(emptyFilters);
  const query = useMemo(() => clean(filters), [filters]);
  const { data, loading, error, reload } = useFetch(() => adminApi.reports(query), [JSON.stringify(query)]);
  if (loading) return <LoadingState label="Building reports" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const cards = [
    ['Total Bookings', data.summary.total_bookings],
    ['Total Revenue', formatMoney(data.summary.total_revenue)],
    ['Pending Revenue', formatMoney(data.summary.pending_revenue)],
    ['Completed', data.summary.completed_projects],
    ['Active', data.summary.active_projects],
    ['Cancelled', data.summary.cancelled_projects],
    ['Avg Delivery', `${data.summary.average_delivery_hours} hrs`],
    ['Avg Feedback', data.summary.average_feedback_count],
  ];
  return <div className="space-y-6"><ReportFilters value={filters} onChange={setFilters} editors={editors} services={services} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="panel p-5"><p className="text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-500">{label}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-2"><Breakdown title="Service performance" headers={['Service', 'Bookings', 'Revenue']} rows={data.service_breakdown.map((item) => [serviceMeta[item.service]?.name || humanize(item.service), item.booking_count, formatMoney(item.revenue)])} /><Breakdown title="Nerd performance" headers={['Nerd', 'Projects', 'Completed']} rows={data.nerd_breakdown.map((item) => [item.editor_name, item.project_count, item.completion_count])} /></div></div>;
}

function Breakdown({ title, headers, rows }) {
  return <div className="panel overflow-x-auto"><div className="border-b border-white/[0.07] p-5"><h3 className="font-semibold">{title}</h3></div><table className="w-full min-w-[440px] text-left text-sm"><thead className="text-xs text-slate-600"><tr>{headers.map((item) => <th key={item} className="px-5 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((item, cell) => <td key={cell} className="px-5 py-4 text-slate-300">{item}</td>)}</tr>)}{!rows.length && <tr><td colSpan={headers.length} className="px-5 py-12 text-center text-slate-600">No matching data.</td></tr>}</tbody></table></div>;
}

export function OperationsPanel({ editors, services }) {
  const [filters, setFilters] = useState(emptyFilters);
  const query = useMemo(() => clean(filters), [filters]);
  const { data, loading, error, reload } = useFetch(() => adminApi.operations(query), [JSON.stringify(query)]);
  if (loading) return <LoadingState label="Loading operations" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return <div className="space-y-6"><ReportFilters value={filters} onChange={setFilters} editors={editors} services={services} /><div className="panel overflow-x-auto"><table className="w-full min-w-[1500px] text-left text-sm"><thead className="border-b border-white/[0.07] text-[10px] uppercase text-slate-600"><tr>{['Project', 'Client', 'Service', 'Status', 'Payment', 'Nerd', 'Booked', 'Latest Activity', 'Due Date', 'Source'].map((item) => <th key={item} className="px-4 py-4">{item}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{data.map((item) => <tr key={item.id}><td className="px-4 py-4"><p className="font-medium">{item.booking_ref}</p></td><td className="px-4 py-4"><p>{item.client_name}</p><p className="text-xs text-slate-600">{item.client_email}</p></td><td className="px-4 py-4">{serviceMeta[item.service_type]?.name || humanize(item.service_type)}</td><td className="px-4 py-4"><StatusBadge status={item.status} /></td><td className="px-4 py-4"><StatusBadge status={item.payment_status} /></td><td className="px-4 py-4">{item.editor_name || 'Unassigned'}</td><td className="px-4 py-4 text-xs">{formatDateTime(item.created_at)}</td><td className="px-4 py-4"><p>{item.latest_activity || 'Booking Created'}</p><p className="text-xs text-slate-600">{formatDateTime(item.activity_timestamp || item.created_at)}</p></td><td className="px-4 py-4"><p className={item.is_overdue ? 'font-medium text-red-300' : ''}>{formatDateTime(item.due_at)}</p>{Boolean(item.is_overdue) && <span className="mt-1 inline-block rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-300">Overdue</span>}</td><td className="px-4 py-4">{item.source}</td></tr>)}{!data.length && <tr><td colSpan="10" className="py-16 text-center text-slate-600">No projects match these filters.</td></tr>}</tbody></table></div></div>;
}

export function WorkloadPanel({ editors, services }) {
  const [filters, setFilters] = useState(emptyFilters);
  const query = useMemo(() => clean(filters), [filters]);
  const { data, loading, error, reload } = useFetch(() => adminApi.workload(query), [JSON.stringify(query)]);
  if (loading) return <LoadingState label="Calculating Nerd workload" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return <div className="space-y-6"><ReportFilters value={filters} onChange={setFilters} editors={editors} services={services} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((item) => <div key={item.id} className="panel p-5"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-slate-600">{item.email}</p></div><span className={`rounded-full px-2.5 py-1 text-xs ${item.workload_percent >= 80 ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{item.workload_percent}%</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${item.workload_percent}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Metric label="Active" value={item.active_projects} /><Metric label="Complete" value={item.completed_projects} /><Metric label="Overdue" value={item.overdue_projects} /></div><div className="mt-5 border-t border-white/[0.07] pt-4 text-xs text-slate-500"><p>Last assigned: {formatDateTime(item.last_assigned_date)}</p><p className="mt-2">Avg completion: {item.average_completion_hours} hrs</p></div></div>)}</div></div>;
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-white/[0.025] p-3"><p className="font-semibold text-white">{value}</p><p className="mt-1 text-[10px] text-slate-600">{label}</p></div>;
}

const emptyLead = { lead_name: '', phone: '', email: '', source: 'manual', service_interest: '', notes: '', follow_up_date: '', status: 'new' };

export function LeadsPanel({ services }) {
  const [filters, setFilters] = useState({ status: '', source: '', service: '', search: '' });
  const [draft, setDraft] = useState(emptyLead);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const query = useMemo(() => clean(filters), [filters]);
  const { data, loading, error, reload } = useFetch(() => adminApi.leads(query), [JSON.stringify(query)]);
  const save = async () => {
    setBusy(true); setNotice('');
    try {
      const payload = { ...draft, follow_up_date: draft.follow_up_date ? new Date(draft.follow_up_date).toISOString() : '' };
      await (draft.id ? adminApi.updateLead(draft.id, payload) : adminApi.createLead(payload));
      setDraft(emptyLead); setNotice('Lead saved.'); await reload();
    } catch (requestError) { setNotice(getApiError(requestError)); } finally { setBusy(false); }
  };
  if (loading) return <LoadingState label="Loading leads" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return <div className="grid gap-6 xl:grid-cols-[380px_1fr]"><div className="panel h-fit p-5"><h3 className="font-semibold">{draft.id ? 'Edit lead' : 'Create lead'}</h3><div className="mt-4 space-y-3"><input className="input" placeholder="Lead name" value={draft.lead_name} onChange={(event) => setDraft({ ...draft, lead_name: event.target.value })} /><input className="input" placeholder="Phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /><input type="email" className="input" placeholder="Email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /><input className="input" placeholder="Source" value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} /><select className="input" value={draft.service_interest} onChange={(event) => setDraft({ ...draft, service_interest: event.target.value })}><option value="">Service interest</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><textarea className="input min-h-24" placeholder="Notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /><input type="datetime-local" className="input" value={draft.follow_up_date} onChange={(event) => setDraft({ ...draft, follow_up_date: event.target.value })} /><select className="input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{leadStatuses.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></div>{notice && <p className="mt-3 text-xs text-violet-300">{notice}</p>}<button disabled={busy || !draft.lead_name} onClick={save} className="btn-primary mt-4 w-full">{busy ? <LoaderCircle className="animate-spin" size={15} /> : draft.id ? <Save size={15} /> : <Plus size={15} />}{draft.id ? 'Update lead' : 'Create lead'}</button></div><div><div className="panel grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4"><input className="input" placeholder="Search leads" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><Select label="Status" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={leadStatuses.map((item) => [item, humanize(item)])} /><input className="input self-end" placeholder="Source" value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })} /><Select label="Service" value={filters.service} onChange={(service) => setFilters({ ...filters, service })} options={services.map((item) => [item.id, item.name])} /></div><div className="mt-4 space-y-3">{data.map((item) => <button key={item.id} onClick={() => setDraft({ ...item, follow_up_date: item.follow_up_date ? item.follow_up_date.slice(0, 16) : '' })} className="panel w-full p-5 text-left transition hover:border-violet-400/20"><div className="flex items-start justify-between"><div><h3 className="font-medium">{item.lead_name}</h3><p className="mt-1 text-xs text-slate-600">{item.email || item.phone || 'No contact details'}</p></div><StatusBadge status={item.status} /></div><p className="mt-4 text-sm text-slate-400">{item.notes || 'No notes yet.'}</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600"><span>Source: {item.source}</span><span>Follow-up: {formatDateTime(item.follow_up_date)}</span><span>{serviceMeta[item.service_interest]?.name || humanize(item.service_interest)}</span></div></button>)}{!data.length && <div className="panel py-16 text-center text-sm text-slate-600">No leads match these filters.</div>}</div></div></div>;
}

export function AuditPanel() {
  const [filters, setFilters] = useState({ action: '', actor_role: '', entity_type: '', date_from: '', date_to: '' });
  const query = useMemo(() => clean(filters), [filters]);
  const { data, loading, error, reload } = useFetch(() => superAdminApi.auditLogs(query), [JSON.stringify(query)]);
  if (loading) return <LoadingState label="Loading audit trail" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return <div className="space-y-5"><div className="panel grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(filters).map(([key, value]) => <label key={key}><span className="label">{humanize(key)}</span><input type={key.startsWith('date_') ? 'date' : 'text'} className="input" value={value} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} /></label>)}</div><div className="panel overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="text-xs text-slate-600"><tr>{['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Details'].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{data.map((item) => <tr key={item.id}><td className="px-5 py-4 text-xs">{formatDateTime(item.created_at)}</td><td className="px-5 py-4">{item.actor_name}</td><td className="px-5 py-4">{item.actor_role}</td><td className="px-5 py-4 text-violet-300">{humanize(item.action)}</td><td className="px-5 py-4">{item.entity_type} {item.entity_id || ''}</td><td className="max-w-sm truncate px-5 py-4 text-xs text-slate-500">{item.details ? JSON.stringify(item.details) : '-'}</td></tr>)}</tbody></table></div></div>;
}

export function ExportPanel({ isSuperAdmin, bookings = [], payments = [] }) {
  const [busy, setBusy] = useState('');
  const download = async (type) => {
    setBusy(type);
    try {
      const response = type === 'audit' ? await superAdminApi.exportAudit({}) : await adminApi.exportCsv(type, {});
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url; link.download = `nerdyfren-${type}.csv`; link.click();
      URL.revokeObjectURL(url);
    } finally { setBusy(''); }
  };
  const types = ['bookings', 'reports', 'leads', 'workload', ...(isSuperAdmin ? ['audit'] : [])];
  const localExports = [
    {
      type: 'payments',
      label: 'Payments CSV',
      rows: bookings.map((booking) => ({
        booking_id: booking.id,
        booking_reference: booking.booking_ref,
        payment_reference: booking.payment_reference || '',
        amount: booking.payment_amount ?? booking.amount,
        status: booking.payment_status,
        payment_date: booking.payment_date || '',
      })),
    },
    {
      type: 'revenue',
      label: 'Revenue CSV',
      rows: bookings.filter((booking) => booking.payment_status === 'paid').map((booking) => ({
        booking_id: booking.id,
        booking_reference: booking.booking_ref,
        client: booking.client_name,
        amount: booking.payment_amount ?? booking.amount,
        payment_reference: booking.payment_reference || '',
        payment_date: booking.payment_date || '',
      })),
    },
    {
      type: 'completed-projects',
      label: 'Completed Projects CSV',
      rows: bookings.filter((booking) => booking.status === 'completed').map((booking) => ({
        booking_id: booking.id,
        booking_reference: booking.booking_ref,
        client: booking.client_name,
        service: booking.service_type,
        amount: booking.amount,
        completed_at: booking.completed_at || '',
        revision_count: booking.revision_count || 0,
      })),
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {localExports.map(({ type, label, rows }) => (
        <div key={type} className="panel p-6">
          <Download className="text-cyan-400" size={20} />
          <h3 className="mt-5 text-lg font-semibold">{label}</h3>
          <p className="mt-2 text-sm text-slate-500">
            Built from the current dashboard data. {type === 'payments' ? `${payments.length} notifications awaiting verification.` : `${rows.length} records available.`}
          </p>
          <button disabled={!rows.length} onClick={() => downloadRowsCsv(`nerdyfren-${type}.csv`, rows)} className="btn-secondary mt-5">
            <Download size={15} /> Download CSV
          </button>
        </div>
      ))}
      {types.map((type) => <div key={type} className="panel p-6"><Download className="text-violet-400" size={20} /><h3 className="mt-5 text-lg font-semibold capitalize">{type} CSV</h3><p className="mt-2 text-sm text-slate-500">Export the current operational dataset for offline analysis.</p><button disabled={!!busy} onClick={() => download(type)} className="btn-secondary mt-5">{busy === type ? <LoaderCircle className="animate-spin" size={15} /> : <Download size={15} />} Download CSV</button></div>)}
    </div>
  );
}
