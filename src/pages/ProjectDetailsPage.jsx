import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import DeliveryModal from '../components/DeliveryModal';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { editorApi, getApiError } from '../lib/api';
import { formatDate, formatDateTime, humanize, serviceMeta } from '../lib/format';
import { getProjectLinkLabel } from '../lib/projectLinks';

const links = [{ label: 'Overview', to: '/editor/dashboard', icon: LayoutDashboard }];
const allowed = {
  assigned: ['work_in_progress'],
  awaiting_revision: ['work_in_progress'],
};
const deliveryStatuses = ['assigned', 'work_in_progress', 'awaiting_revision', 'draft_submitted'];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { data: project, loading, error, reload, setData } = useFetch(() => editorApi.project(id), [id]);
  const [updating, setUpdating] = useState('');
  const [actionError, setActionError] = useState('');
  const [deliveryOpen, setDeliveryOpen] = useState(false);

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

  const revisions = project?.revisions || project?.revision_requests || [];
  const deliveries = project?.deliveries || [];

  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-6xl">
          <Link to="/editor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft size={16} /> All projects</Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3"><span className="text-xs text-slate-600">{project.booking_ref}</span><StatusBadge status={project.status} /></div>
              <h1 className="mt-3 text-3xl font-bold">{serviceMeta[project.service_type]?.name || humanize(project.service_type)}</h1>
              <p className="mt-2 text-sm text-slate-500">For {project.client_name} - Assigned {formatDate(project.assigned_at)}</p>
            </div>
            {deliveryStatuses.includes(project.status) && (
              <button type="button" onClick={() => setDeliveryOpen(true)} className="btn-primary">
                <Send size={16} /> Submit Delivery
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Creative brief</p>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{project.brief || 'No written brief was provided.'}</p>
              </section>
              <section className="panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Project links</p>
                <div className="mt-5 space-y-2">
                  {project.ref_links?.length ? project.ref_links.map((item) => (
                    <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-slate-300 hover:border-cyan-400/30">
                      <span className="min-w-0 break-words">{getProjectLinkLabel(item.label)}</span><ExternalLink size={15} className="shrink-0" />
                    </a>
                  )) : <p className="text-sm text-slate-600">No source or reference links were shared.</p>}
                </div>
              </section>

              {revisions.length > 0 && (
                <section className="panel border-pink-400/15 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-pink-400">Revision history</p>
                  <div className="mt-5 space-y-3">
                    {revisions.map((revision) => (
                      <div key={revision.id} className="rounded-xl bg-pink-500/[0.06] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">Revision {revision.revision_number || ''}</p>
                          <StatusBadge status={revision.status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{revision.notes || revision.message}</p>
                        <p className="mt-2 text-xs text-slate-600">{formatDateTime(revision.requested_at)} - {revision.resolved_at ? 'Resolved' : 'Action needed'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {deliveries.length > 0 && (
                <section className="panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">Delivery history</p>
                  <div className="mt-5 space-y-3">
                    {deliveries.map((item) => (
                      <a key={item.id} href={item.delivery_link} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 hover:border-cyan-400/30">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-cyan-300">Open delivery link</span><ExternalLink size={15} /></div>
                        {item.delivery_note && <p className="mt-2 text-sm text-slate-400">{item.delivery_note}</p>}
                        <p className="mt-2 text-xs text-slate-600">{formatDateTime(item.submitted_at)}</p>
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
                    <button key={status} disabled={!!updating} onClick={() => updateStatus(status)} className="btn-secondary w-full">
                      {updating === status ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Mark {humanize(status)}
                    </button>
                  ))}
                  {!allowed[project.status]?.length && (
                    <p className="rounded-xl bg-white/[0.03] p-4 text-sm leading-6 text-slate-500">
                      {deliveryStatuses.includes(project.status)
                        ? 'Submit the authorized delivery link when the review files are ready.'
                        : 'No manual editor transition is available at this stage.'}
                    </p>
                  )}
                </div>
              </div>

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

      {deliveryOpen && project && (
        <DeliveryModal
          project={project}
          onClose={() => setDeliveryOpen(false)}
          onSubmitted={reload}
        />
      )}
    </DashboardShell>
  );
}
