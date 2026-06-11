import { ArrowLeft, CheckCircle2, ExternalLink, LayoutDashboard, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { editorApi, getApiError } from '../lib/api';
import { formatDate, formatMoney, humanize, serviceMeta } from '../lib/format';

const links = [{ label: 'Overview', to: '/editor', icon: LayoutDashboard }];
const allowed = { assigned: ['in_progress'], in_progress: ['revision', 'delivered'], revision: ['in_progress', 'delivered'] };

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { data: project, loading, error, reload, setData } = useFetch(() => editorApi.project(id), [id]);
  const [updating, setUpdating] = useState('');
  const [actionError, setActionError] = useState('');
  const updateStatus = async (status) => {
    setUpdating(status); setActionError('');
    try { await editorApi.updateStatus(id, status); setData({ ...project, status }); }
    catch (requestError) { setActionError(getApiError(requestError)); }
    finally { setUpdating(''); }
  };
  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-5xl">
          <Link to="/editor" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft size={16} /> All projects</Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-3"><span className="text-xs text-slate-600">{project.booking_ref}</span><StatusBadge status={project.status} /></div><h1 className="mt-3 text-3xl font-bold">{serviceMeta[project.service_type]?.name || humanize(project.service_type)}</h1><p className="mt-2 text-sm text-slate-500">For {project.client_name} · Assigned {formatDate(project.assigned_at)}</p></div><p className="text-xl font-semibold">{formatMoney(project.amount)}</p></div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <section className="panel p-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Creative brief</p><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{project.brief || 'No written brief was provided.'}</p></section>
              <section className="panel p-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">References</p><div className="mt-5 space-y-2">{project.ref_links?.length ? project.ref_links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-slate-300 hover:border-violet-400/30"><span>{link.label || 'Reference link'}</span><ExternalLink size={15} /></a>) : <p className="text-sm text-slate-600">No reference links attached.</p>}</div></section>
            </div>
            <aside><div className="panel p-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Move project forward</p><div className="mt-5 space-y-3">{(allowed[project.status] || []).map((status) => <button key={status} disabled={!!updating} onClick={() => updateStatus(status)} className={status === 'delivered' ? 'btn-primary w-full' : 'btn-secondary w-full'}>{updating === status ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Mark {humanize(status)}</button>)}{!allowed[project.status]?.length && <p className="rounded-xl bg-white/[0.03] p-4 text-sm leading-6 text-slate-500">This project is complete. Contact NerdyFren operations if its status needs to change.</p>}</div>{actionError && <p className="mt-4 text-xs text-red-300">{actionError}</p>}<div className="my-6 h-px bg-white/[0.07]" /><dl className="space-y-4 text-xs"><div className="flex justify-between"><dt className="text-slate-600">Created</dt><dd className="text-slate-300">{formatDate(project.created_at)}</dd></div><div className="flex justify-between"><dt className="text-slate-600">Editor</dt><dd className="text-slate-300">{project.editor_name}</dd></div></dl></div></aside>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
