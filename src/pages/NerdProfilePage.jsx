import { useEffect, useState } from 'react';
import { LayoutDashboard, Save } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import { authApi, editorApi, getApiError } from '../lib/api';
import { useFetch } from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';

const links = [
  { label: 'Overview', to: '/dashboard/editor', icon: LayoutDashboard },
  { label: 'Nerd Profile', to: '/dashboard/editor/profile', icon: LayoutDashboard },
];

export default function NerdProfilePage() {
  const { data, loading, error, reload } = useFetch(() => editorApi.profileSetup(), []);
  const { startSession } = useAuth();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    skills: '',
    portfolio_url: '',
    availability_status: 'available',
    payout_notes: '',
  });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name || '',
      mobile: data.mobile || '',
      skills: (data.skills || []).join(', '),
      portfolio_url: data.portfolio_url || '',
      availability_status: data.availability_status || 'available',
      payout_notes: data.payout_notes || '',
    });
  }, [data]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      await editorApi.saveProfile({
        ...form,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
      });
      const session = await authApi.me();
      startSession(session);
      setNotice('Nerd profile saved. You are now ready for project assignment.');
      await reload();
    } catch (requestError) {
      setNotice(getApiError(requestError, 'Could not save Nerd profile.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell role="editor" links={links}>
      {loading ? <LoadingState label="Loading Nerd profile" /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-cyan-400">Nerd onboarding</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Complete your Nerd Profile.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This information is saved to NerdyFren’s database and controls whether Admin can assign projects to you.
          </p>

          {notice && <div className={`mt-6 rounded-xl border p-3 text-sm ${notice.toLowerCase().includes('could not') ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'}`}>{notice}</div>}

          <form onSubmit={save} className="panel mt-8 space-y-5 p-6">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Name</span>
              <input className="input mt-2" required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Mobile</span>
              <input className="input mt-2" required value={form.mobile} onChange={(event) => update('mobile', event.target.value)} placeholder="+91 98765 43210" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Skills / services</span>
              <input className="input mt-2" value={form.skills} onChange={(event) => update('skills', event.target.value)} placeholder="Reels, thumbnails, podcast edits" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Portfolio link</span>
              <input className="input mt-2" type="url" value={form.portfolio_url} onChange={(event) => update('portfolio_url', event.target.value)} placeholder="https://..." />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Availability</span>
              <select className="input mt-2" value={form.availability_status} onChange={(event) => update('availability_status', event.target.value)}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">Payout notes</span>
              <textarea className="input mt-2 min-h-24" value={form.payout_notes} onChange={(event) => update('payout_notes', event.target.value)} placeholder="Optional payout/admin notes" />
            </label>
            <button disabled={busy} className="btn-primary">
              <Save size={16} /> {busy ? 'Saving...' : 'Save Nerd Profile'}
            </button>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
