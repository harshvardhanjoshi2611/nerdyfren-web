import { ArrowRight, BriefcaseBusiness, Clock3, FolderKanban, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { editorApi } from '../lib/api';
import { formatDate, formatMoney, serviceMeta } from '../lib/format';

const links = [{ label: 'Overview', to: '/editor', icon: LayoutDashboard }];

export default function EditorDashboard() {
  const { data, loading, error, reload } = useFetch(async () => {
    const [profile, projects] = await Promise.all([editorApi.profile(), editorApi.projects()]);
    return { profile, projects };
  }, []);
  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-violet-400">Editor workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Good to see you, {data.profile.name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-500">Here’s what needs your creative attention.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[[FolderKanban, 'Assigned projects', data.projects.length], [BriefcaseBusiness, 'In progress', data.projects.filter((p) => p.status === 'in_progress').length], [Clock3, 'Awaiting start', data.projects.filter((p) => p.status === 'assigned').length]].map(([Icon, label, value]) => <div key={label} className="panel p-5"><Icon className="text-violet-400" size={19} /><p className="mt-5 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
          </div>
          <div className="mt-10 flex items-center justify-between"><h2 className="text-lg font-semibold">Your projects</h2><span className="text-xs text-slate-600">{data.projects.length} total</span></div>
          <div className="mt-4 space-y-3">
            {data.projects.length === 0 ? <div className="panel py-16 text-center"><BriefcaseBusiness className="mx-auto text-slate-700" /><h3 className="mt-4 font-medium">No projects assigned yet</h3><p className="mt-2 text-sm text-slate-600">New work will appear here after assignment.</p></div> :
              data.projects.map((project) => <Link key={project.id} to={`/editor/projects/${project.id}`} className="panel group flex flex-col gap-5 p-5 transition hover:border-violet-400/20 sm:flex-row sm:items-center">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-sm font-semibold text-violet-300">{project.booking_ref.slice(-2)}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="font-medium">{serviceMeta[project.service_type]?.name || project.service_type}</h3><StatusBadge status={project.status} /></div><p className="mt-1 truncate text-sm text-slate-500">{project.client_name} · {formatDate(project.created_at)}</p></div>
                <div className="flex items-center justify-between gap-5 sm:justify-end"><span className="text-sm font-medium">{formatMoney(project.amount)}</span><ArrowRight size={17} className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-violet-400" /></div>
              </Link>)}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
