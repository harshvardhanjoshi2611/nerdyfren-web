import { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default class AppErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('NerdyFren render error', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="aurora grid min-h-screen place-items-center bg-canvas p-5">
        <div className="panel w-full max-w-lg p-8 text-center">
          <div className="flex justify-center"><Logo /></div>
          <h1 className="mt-8 text-2xl font-bold">This page could not load.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Refresh the page or return home. The error has been contained instead of leaving an empty screen.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => window.location.reload()} className="btn-primary">Refresh page</button>
            <Link to="/" className="btn-secondary">Return home</Link>
          </div>
        </div>
      </div>
    );
  }
}
