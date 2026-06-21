import { Link } from 'react-router-dom';

export default function Logo({ compact = false, tone = 'app' }) {
  const wordmarkTone = {
    app: ['text-violet-300', 'text-white', 'text-slate-500'],
    surface: ['text-[#D98C1F]', 'text-[#16141C]', 'text-[#5B5866]'],
    inverse: ['text-[#F2A93B]', 'text-white', 'text-white/55'],
  }[tone] || ['text-violet-300', 'text-white', 'text-slate-500'];

  return (
    <Link to="/" className="group inline-flex items-center" aria-label="NerdyFren.com home">
      {compact ? (
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-sm font-extrabold tracking-tight text-violet-200 shadow-lg shadow-violet-950/40">NF</span>
      ) : (
        <span className="font-heading text-xl font-bold tracking-[-0.04em] sm:text-[22px]">
          <span className={wordmarkTone[0]}>Nerdy</span><span className={wordmarkTone[1]}>Fren</span><span className={`${wordmarkTone[2]} font-medium`}>.com</span>
        </span>
      )}
    </Link>
  );
}
