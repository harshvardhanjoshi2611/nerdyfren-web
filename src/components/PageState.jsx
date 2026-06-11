import { AlertCircle, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading your workspace' }) {
  return <div className="grid min-h-[300px] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-violet-400" /><p className="mt-3 text-sm text-slate-500">{label}</p></div></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="panel mx-auto max-w-lg p-8 text-center">
      <AlertCircle className="mx-auto text-red-400" />
      <h3 className="mt-4 font-semibold text-white">We hit a snag</h3>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary mt-5">Try again</button>}
    </div>
  );
}
