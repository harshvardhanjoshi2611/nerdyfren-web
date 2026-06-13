import { X } from 'lucide-react';

export default function Modal({ title, eyebrow, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className={`panel relative z-10 w-full ${maxWidth} p-6 shadow-glow sm:p-7`}>
        <div className="flex items-start justify-between gap-5">
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">{eyebrow}</p>}
            <h2 className={`${eyebrow ? 'mt-2' : ''} text-xl font-semibold`}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
