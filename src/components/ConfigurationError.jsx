import { AlertTriangle } from 'lucide-react';

export default function ConfigurationError({ message }) {
  return (
    <div className="aurora grid min-h-screen place-items-center bg-canvas p-5">
      <div className="panel w-full max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto text-amber-300" size={28} />
        <h1 className="mt-5 text-2xl font-bold">NerdyFren is not configured yet.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
        <p className="mt-4 text-xs leading-5 text-slate-600">
          The deployment owner must update the environment settings before public traffic is enabled.
        </p>
      </div>
    </div>
  );
}
