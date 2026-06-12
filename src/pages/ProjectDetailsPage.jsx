import { ArrowLeft, CheckCircle2, ExternalLink, LayoutDashboard, Link2, LoaderCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { editorApi, getApiError } from '../lib/api';
import { formatDate, humanize, serviceMeta } from '../lib/format';

const links = [{ label: 'Overview', to: '/editor/dashboard', icon: LayoutDashboard }];
const allowed = {
  assigned: ['work_in_progress'],
  awaiting_revision: ['work_in_progress'],
  draft_submitted: ['final_delivered'],
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { data: project, loading, error, reload, setData } = useFetch(() => editorApi.project(id), [id]);
  const [updating, setUpdating] = useState('');
  const [actionError, setActionError] = useState('');
  const [delivery, setDelivery] = useState({ delivery_link: '', delivery_note: '' });

  const updateStatus = async (status) => {
    setUpdating(status);
    setActionError('');
    try {
      await editorApi.updateStatus(id, status);
      setData({ ...project, status });
    } catch (requestError) {
      setActionError(getApiError(requestError));
    } finally {
      setUpdating('');
    }
  };

  const submitDelivery = async (event) => {
    event.preventDefault();
    setUpdating('delivery');
    setActionError('');
    try {
      await editorApi.submitDelivery(id, delivery);
      setDelivery({ delivery_link: '', delivery_note: '' });
      await reload();
    } catch (requestError) {
      setActionError(getApiError(requestError));
    } finally {
      setUpdating('');
    }
  };

  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-6xl">
          <Link to="/editor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft size={16} /> All projects</Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3"><span className="text-xs text-slate-600">{project.booking_ref}</span><StatusBadge status={project.status} /></div>
              <h1 className="mt-3 text-3xl font-bold">{serviceMeta[project.service_type]?.name || humanize(project.service_type)}</h1>
              <p className="mt-2 text-sm text-slate-500">For {project.client_name} · Assigned {formatDate(project.assigned_at)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Creative brief</p>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{project.brief || 'No written brief was provided.'}</p>
              </section>
              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Attachments and references</p>
                <div className="mt-5 space-y-2">
                  {project.ref_links?.length ? project.ref_links.map((item) => (
                    <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-slate-300 hover:border-cyan-400/30">
                      <span>{item.label || 'Reference link'}</span><ExternalLink size={15} />
                    </a>
                  )) : <p className="text-sm text-slate-600">No reference links attached.</p>}
                </div>
              </section>

              {project.revision_requests?.length > 0 && (
                <section className="panel border-pink-400/15 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-pink-400">Revision requests</p>
                  <div className="mt-5 space-y-3">
                    {project.revision_requests.map((revision) => (
                      <div key={revision.id} className="rounded-xl bg-pink-500/[0.06] p-4">
                        <p className="text-sm leading-6 text-slate-300">{revision.message}</p>
                        <p className="mt-2 text-xs text-slate-600">{formatDate(revision.requested_at)} · {revision.resolved_at ? 'Resolved' : 'Action needed'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {project.deliveries?.length > 0 && (
                <section className="panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Delivery history</p>
                  <div className="mt-5 space-y-3">
                    {project.deliveries.map((item) => (
                      <a key={item.id} href={item.delivery_link} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 hover:border-cyan-400/30">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-cyan-300">Open delivery</span><ExternalLink size={15} /></div>
                        {item.delivery_note && <p className="mt-2 text-sm text-slate-400">{item.delivery_note}</p>}
                        <p className="mt-2 text-xs text-slate-600">{formatDate(item.submitted_at)}</p>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5">
              <div className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Move project forward</p>
                <div className="mt-5 space-y-3">
                  {(allowed[project.status] || []).map((status) => (
                    <button key={status} disabled={!!updating} onClick={() => updateStatus(status)} className={status === 'final_delivered' ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                      {updating === status ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Mark {humanize(status)}
                    </button>
                  ))}
                  {!allowed[project.status]?.length && !['work_in_progress', 'draft_submitted'].includes(project.status) && (
                    <p className="rounded-xl bg-white/[0.03] p-4 text-sm leading-6 text-slate-500">No manual editor transition is available at this stage.</p>
                  )}
                </div>
              </div>

              {['work_in_progress', 'awaiting_revision', 'draft_submitted'].includes(project.status) && (
                <form onSubmit={submitDelivery} className="panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Submit delivery</p>
                  <label className="mt-5 block"><span className="label">Delivery link</span><div className="relative"><Link2 size={16} className="absolute left-4 top-3.5 text-slate-600" /><input required type="url" className="input !pl-11" value={delivery.delivery_link} onChange={(event) => setDelivery({ ...delivery, delivery_link: event.target.value })} placeholder="https://drive.google.com/..." /></div></label>
                  <label className="mt-4 block"><span className="label">Delivery note</span><textarea className="input min-h-28 resize-y" value={delivery.delivery_note} onChange={(event) => setDelivery({ ...delivery, delivery_note: event.target.value })} placeholder="What changed, what to review, and any context for the client." /></label>
                  <button disabled={!!updating} className="btn-primary mt-4 w-full">{updating === 'delivery' ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />} Submit delivery</button>
                </form>
              )}

              {actionError && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-300">{actionError}</p>}
              <div className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Timeline</p>
                <dl className="mt-5 space-y-4 text-xs">
                  <div className="flex justify-between"><dt className="text-slate-600">Created</dt><dd className="text-slate-300">{formatDate(project.created_at)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-600">Assigned</dt><dd className="text-slate-300">{formatDate(project.assigned_at)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-600">Updated</dt><dd className="text-slate-300">{formatDate(project.updated_at)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-600">Editor</dt><dd className="text-slate-300">{project.editor_name}</dd></div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
