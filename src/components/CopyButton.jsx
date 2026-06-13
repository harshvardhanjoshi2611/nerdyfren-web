import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CopyButton({ value, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(String(value));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-white disabled:opacity-40 ${className}`}
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
