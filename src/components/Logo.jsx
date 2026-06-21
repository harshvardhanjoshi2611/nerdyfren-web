import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="group inline-flex items-center" aria-label="NerdyFren.com home">
      {compact ? (
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-sm font-extrabold tracking-tight text-violet-200 shadow-lg shadow-violet-950/40">NF</span>
      ) : (
        <span className="text-xl font-extrabold tracking-[-0.055em] sm:text-[22px]">
          <span className="text-violet-300">Nerdy</span><span className="text-white">Fren</span><span className="text-slate-500">.com</span>
        </span>
      )}
    </Link>
  );
}
