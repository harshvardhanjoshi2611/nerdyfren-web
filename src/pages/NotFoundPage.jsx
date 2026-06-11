import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFoundPage() {
  return <div className="aurora grid min-h-screen place-items-center bg-canvas p-5"><div className="text-center"><div className="flex justify-center"><Logo /></div><p className="mt-16 font-mono text-sm text-violet-400">404</p><h1 className="mt-4 text-4xl font-bold">This page wandered off.</h1><p className="mt-3 text-slate-500">The route does not exist or has moved.</p><Link to="/" className="btn-secondary mt-7"><ArrowLeft size={16} /> Back home</Link></div></div>;
}
