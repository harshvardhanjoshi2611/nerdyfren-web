import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderKanban,
  LayoutDashboard,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import DeliveryModal from '../components/DeliveryModal';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { editorApi } from '../lib/api';
import { formatDate, formatMoney, serviceMeta } from '../lib/format';

const links = [{ label: 'Overview', to: '/editor/dashboard', icon: LayoutDashboard }];
const deliveryStatuses = ['assigned', 'work_in_progress', 'awaiting_revision', 'draft_submitted'];

export default function EditorDashboard() {
  const [deliveryProject, setDeliveryProject] = useState(null);
  const { data, loading, error, reload } = useFetch(async () => {
    const [profile, projects] = await Promise.all([editorApi.profile(), editorApi.projects()]);
    return { profile, projects };
  }, []);

  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-cyan-400">Nerd workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Good to see you, {data.profile.name.split(' ')[0]}.</h1>
          <p className="mt-2 text-sm text-slate-500">Only projects assigned to you appear here.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              [FolderKanban, 'Assigned', data.projects.filter((p) => p.status === 'assigned').length, 'text-violet-400'],
              [Clock3, 'In progress', data.projects.filter((p) => p.status === 'work_in_progress').length, 'text-blue-400'],
              [FileCheck2, 'Awaiting revision', data.projects.filter((p) => p.status === 'awaiting_revision').length, 'text-pink-400'],
              [CheckCircle2, 'Delivered', data.projects.filter((p) => p.status === 'final_delivered').length, 'text-cyan-400'],
              [CheckCircle2, 'Completed', data.projects.filter((p) => p.status === 'completed').length, 'text-emerald-400'],
            ].map(([Icon, label, value, tone]) => (
              <div key={label} className="panel p-5">
                <Icon className={tone} size={19} />
                <p className="mt-5 text-3xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your projects</h2>
            <span className="text-xs text-slate-600">{data.projects.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.projects.length === 0 ? (
              <div className="panel py-16 text-center">
                <FolderKanban className="mx-auto text-slate-700" />
                <h3 className="mt-4 font-medium">No projects assigned yet</h3>
                <p className="mt-2 text-sm text-slate-600">New work will appear here after assignment.</p>
              </div>
            ) : data.projects.map((project) => (
              <article key={project.id} className="panel flex flex-col gap-5 p-5 transition hover:border-cyan-400/20 sm:flex-row sm:items-center">
                <Link to={`/editor/projects/${project.id}`} className="contents group">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-sm font-semibold text-cyan-300">{project.booking_ref.slice(-2)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium">{serviceMeta[project.service_type]?.name || project.service_type}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{project.client_name} - {formatDate(project.updated_at)}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <span className="text-sm font-medium">{formatMoney(project.amount)}</span>
                  {deliveryStatuses.includes(project.status) && (
                    <button type="button" onClick={() => setDeliveryProject(project)} className="btn-primary !px-3 !py-2 text-xs">
                      <Send size={14} /> Submit Delivery
                    </button>
                  )}
                  <Link to={`/editor/projects/${project.id}`} aria-label="Open project" className="rounded-lg p-2 text-slate-700 transition hover:bg-white/5 hover:text-cyan-400">
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {deliveryProject && (
        <DeliveryModal
          project={deliveryProject}
          onClose={() => setDeliveryProject(null)}
          onSubmitted={reload}
        />
      )}
    </DashboardShell>
  );
}
