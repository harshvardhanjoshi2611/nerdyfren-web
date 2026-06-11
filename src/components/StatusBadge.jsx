import { humanize } from '../lib/format';

const tones = {
  paid: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  delivered: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  in_progress: 'border-blue-400/20 bg-blue-500/10 text-blue-300',
  assigned: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
  pending: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  unassigned: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  revision: 'border-orange-400/20 bg-orange-500/10 text-orange-300',
  failed: 'border-red-400/20 bg-red-500/10 text-red-300',
  refunded: 'border-slate-400/20 bg-slate-500/10 text-slate-300',
};

export default function StatusBadge({ status }) {
  return <span className={`status-pill ${tones[status] || 'border-white/10 bg-white/5 text-slate-300'}`}>{humanize(status)}</span>;
}
