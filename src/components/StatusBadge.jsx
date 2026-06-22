import { humanize } from '../lib/format';

const tones = {
  paid: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  delivered: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  sent: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  work_in_progress: 'border-blue-700/20 bg-blue-50 text-blue-800',
  draft_submitted: 'border-cyan-700/20 bg-cyan-50 text-cyan-800',
  awaiting_revision: 'border-rose-700/20 bg-rose-50 text-rose-800',
  final_delivered: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  completed: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  assigned: 'border-amber-700/20 bg-amber-50 text-amber-900',
  pending: 'border-amber-700/20 bg-amber-50 text-amber-900',
  queued: 'border-amber-700/20 bg-amber-50 text-amber-900',
  skipped: 'border-slate-500/20 bg-slate-100 text-slate-700',
  unassigned: 'border-amber-700/20 bg-amber-50 text-amber-900',
  revision: 'border-orange-700/20 bg-orange-50 text-orange-800',
  failed: 'border-red-700/20 bg-red-50 text-red-800',
  refunded: 'border-slate-500/20 bg-slate-100 text-slate-700',
};

export default function StatusBadge({ status }) {
  return <span className={`status-pill ${tones[status] || 'border-slate-400/20 bg-slate-100 text-slate-700'}`}>{humanize(status)}</span>;
}
