import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/15 shadow-lg shadow-violet-950/40">
        <span className="text-sm font-extrabold tracking-tight text-violet-200">NF</span>
      </span>
      {!compact && <span className="text-[17px] font-bold tracking-[-0.03em] text-white">NerdyFren</span>}
    </Link>
  );
}
