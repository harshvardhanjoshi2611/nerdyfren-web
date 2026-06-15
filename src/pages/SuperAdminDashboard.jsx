import { FileText, Gauge, Image, LayoutPanelTop, Link2, MessageCircleQuestion, Search, Settings, Share2, Star, Users, Video } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import { ErrorState, LoadingState } from '../components/PageState';
import { useFetch } from '../hooks/useFetch';
import useSiteContent from '../hooks/useSiteContent';
import { getApiError, superAdminApi } from '../lib/api';
import CmsEditors from '../components/CmsEditors';

const tabs = [
  ['Site Settings', Settings],
  ['Homepage CMS', LayoutPanelTop],
  ['Media Library', Video],
  ['Portfolio CMS', Image],
  ['Testimonials CMS', Star],
  ['Services CMS', Gauge],
  ['FAQs CMS', MessageCircleQuestion],
  ['Banners CMS', Image],
  ['Footer CMS', Link2],
  ['Social Links CMS', Share2],
  ['SEO Settings', Search],
  ['Roles & Users', Users],
];

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState('Site Settings');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const { reload: reloadPublic } = useSiteContent();
  const { data, loading, error, reload } = useFetch(superAdminApi.cms, []);

  const save = async (work, message = 'Changes saved.') => {
    setBusy(true);
    setNotice('');
    try {
      await work();
      setNotice(message);
      await Promise.all([reload(), reloadPublic()]);
    } catch (requestError) {
      setNotice(getApiError(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell role="super_admin" links={[{ label: 'CMS Control', to: '/dashboard/super-admin', icon: FileText }]}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm text-violet-400">Super Admin control center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage NerdyFren without a deployment.</h1>
            <p className="mt-2 text-sm text-slate-500">Content, services, links, SEO and operator access are stored in the database.</p>
            <Link to="/dashboard/admin" className="btn-secondary mt-5">Open Admin Operations & Reports</Link>
          </div>
          {notice && <div className="mt-6 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-sm text-violet-200">{notice}</div>}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {tabs.map(([label, Icon]) => <button key={label} onClick={() => setTab(label)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${tab === label ? 'bg-violet-500 text-white' : 'border border-white/10 bg-white/[0.03] text-slate-400'}`}><Icon size={15} />{label}</button>)}
          </div>
          <div className="mt-6">
            {tab === 'Site Settings' && <SettingsEditor settings={data.settings} busy={busy} save={save} />}
            {tab === 'Homepage CMS' && <HomepageEditor homepage={data.homepage} busy={busy} save={save} />}
            {tab === 'Media Library' && <CmsEditors type="media" items={data.media} busy={busy} save={save} />}
            {tab === 'Portfolio CMS' && <CmsEditors type="portfolio" items={data.portfolio} busy={busy} save={save} />}
            {tab === 'Testimonials CMS' && <CmsEditors type="testimonial" items={data.testimonials} busy={busy} save={save} />}
            {tab === 'Services CMS' && <CmsEditors type="service" items={data.services} busy={busy} save={save} />}
            {tab === 'FAQs CMS' && <StructuredContentEditor type="faq" items={data.faqs} fields={['question', 'answer']} busy={busy} save={save} />}
            {tab === 'Banners CMS' && <StructuredContentEditor type="banner" items={data.banners} fields={['title', 'subtitle', 'button_text', 'button_url']} busy={busy} save={save} />}
            {tab === 'Footer CMS' && <FooterEditor items={data.footer_links} busy={busy} save={save} />}
            {tab === 'Social Links CMS' && <SocialEditor items={data.social_links} busy={busy} save={save} />}
            {tab === 'SEO Settings' && <SeoEditor seo={data.seo} busy={busy} save={save} />}
            {tab === 'Roles & Users' && <RoleManagement />}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function SettingsEditor({ settings, busy, save }) {
  const fields = [
    ['brand_name', 'Brand Name'], ['support_email', 'Support Email'], ['support_phone', 'Support Phone'],
    ['whatsapp_number', 'WhatsApp Number'], ['instagram_url', 'Instagram URL'], ['facebook_url', 'Facebook URL'],
    ['youtube_url', 'YouTube URL'], ['linkedin_url', 'LinkedIn URL'],
  ];
  return <div className="panel grid gap-5 p-6 md:grid-cols-2">{fields.map(([key, label]) => <SettingField key={key} settingKey={key} label={label} initial={settings[key] || ''} busy={busy} save={save} />)}</div>;
}

function SettingField({ settingKey, label, initial, busy, save }) {
  const [value, setValue] = useState(initial);
  return <label><span className="label">{label}</span><div className="flex gap-2"><input className="input" value={value} onChange={(event) => setValue(event.target.value)} /><button disabled={busy} onClick={() => save(() => superAdminApi.updateSetting(settingKey, value))} className="btn-secondary !px-4">Save</button></div></label>;
}

function HomepageEditor({ homepage, busy, save }) {
  return <div className="space-y-5">{Object.entries(homepage).map(([key, section]) => <HomepageSection key={key} sectionKey={key} section={section} busy={busy} save={save} />)}</div>;
}

function HomepageSection({ sectionKey, section, busy, save }) {
  const { is_active: active, display_order: order, ...content } = section;
  const [value, setValue] = useState(content);
  const [stepsText, setStepsText] = useState(content.steps ? JSON.stringify(content.steps, null, 2) : '');
  const [stepsInvalid, setStepsInvalid] = useState(false);
  const simpleFields = Object.keys(content).filter((key) => typeof content[key] === 'string');
  const booleanFields = Object.keys(content).filter((key) => typeof content[key] === 'boolean');
  const submit = () => {
    let next = value;
    if (content.steps) {
      try {
        next = { ...value, steps: JSON.parse(stepsText) };
        setStepsInvalid(false);
      } catch {
        setStepsInvalid(true);
        return;
      }
    }
    save(() => superAdminApi.updateHomepage(sectionKey, { content: next, is_active: active !== false, display_order: order || 0 }));
  };
  return <div className="panel p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold capitalize">{sectionKey.replaceAll('_', ' ')}</h2><span className="text-xs text-slate-600">Database section</span></div><div className="mt-5 grid gap-4 md:grid-cols-2">{simpleFields.map((field) => <label key={field} className={field === 'subtitle' ? 'md:col-span-2' : ''}><span className="label capitalize">{field.replaceAll('_', ' ')}</span><textarea className="input min-h-20" value={value[field]} onChange={(event) => setValue({ ...value, [field]: event.target.value })} /></label>)}{booleanFields.map((field) => <label key={field} className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-sm text-slate-300"><input type="checkbox" checked={value[field]} onChange={(event) => setValue({ ...value, [field]: event.target.checked })} />{field.replaceAll('_', ' ')}</label>)}</div>{content.steps && <label className="mt-4 block"><span className="label">How It Works steps (JSON)</span><textarea className="input min-h-44 font-mono text-xs" value={stepsText} onChange={(event) => setStepsText(event.target.value)} />{stepsInvalid && <span className="mt-2 block text-xs text-red-300">Enter valid JSON before saving.</span>}</label>}<button disabled={busy} onClick={submit} className="btn-primary mt-5">Save section</button></div>;
}

function StructuredContentEditor({ type, items, fields, busy, save }) {
  const empty = Object.fromEntries(fields.map((field) => [field, '']));
  const [draft, setDraft] = useState({ key: '', content: empty, is_active: true, display_order: items.length * 10 + 10 });
  return <div className="space-y-4">{items.map((item) => <ContentCard key={item.content_key} type={type} item={item} fields={fields} busy={busy} save={save} />)}<div className="panel p-6"><h2 className="font-semibold">Add {type}</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><input className="input" placeholder="Unique key" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />{fields.map((field) => <input key={field} className="input" placeholder={field.replaceAll('_', ' ')} value={draft.content[field]} onChange={(event) => setDraft({ ...draft, content: { ...draft.content, [field]: event.target.value } })} />)}</div><button disabled={busy || !draft.key} onClick={() => save(() => superAdminApi.upsertContent(type, draft.key, { content: draft.content, is_active: draft.is_active, display_order: draft.display_order }), `${type} created.`)} className="btn-primary mt-4">Create</button></div></div>;
}

function ContentCard({ type, item, fields, busy, save }) {
  const [content, setContent] = useState(item.content);
  const [active, setActive] = useState(Boolean(item.is_active));
  return <div className="panel p-6"><div className="flex items-center justify-between"><h3 className="font-semibold">{item.content_key}</h3><label className="text-xs text-slate-500"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="mr-2" />Active</label></div><div className="mt-4 grid gap-4 md:grid-cols-2">{fields.map((field) => <label key={field}><span className="label capitalize">{field.replaceAll('_', ' ')}</span><textarea className="input min-h-20" value={content[field] || ''} onChange={(event) => setContent({ ...content, [field]: event.target.value })} /></label>)}</div><div className="mt-4 flex gap-2"><button disabled={busy} onClick={() => save(() => superAdminApi.upsertContent(type, item.content_key, { content, is_active: active, display_order: item.display_order }))} className="btn-primary">Save</button><button disabled={busy} onClick={() => save(() => superAdminApi.deleteContent(type, item.content_key), `${type} deleted.`)} className="btn-secondary text-red-300">Delete</button></div></div>;
}

function FooterEditor({ items, busy, save }) {
  const [draft, setDraft] = useState({ label: '', url: '', is_active: true, display_order: items.length * 10 + 10 });
  return <div className="space-y-4">{items.map((item) => <FooterCard key={item.id} item={item} busy={busy} save={save} />)}<div className="panel grid gap-3 p-5 md:grid-cols-[1fr_2fr_auto]"><input className="input" placeholder="Link label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /><input className="input" placeholder="URL or /route" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /><button disabled={busy || !draft.label || !draft.url} onClick={() => save(() => superAdminApi.upsertFooterLink(draft), 'Footer link created.')} className="btn-primary">Add link</button></div></div>;
}

function FooterCard({ item, busy, save }) {
  const [value, setValue] = useState({ ...item, is_active: Boolean(item.is_active) });
  return <div className="panel grid gap-3 p-5 md:grid-cols-[1fr_2fr_auto_auto]"><input className="input" value={value.label} onChange={(e) => setValue({ ...value, label: e.target.value })} /><input className="input" value={value.url} onChange={(e) => setValue({ ...value, url: e.target.value })} /><label className="flex items-center text-xs text-slate-500"><input type="checkbox" checked={value.is_active} onChange={(e) => setValue({ ...value, is_active: e.target.checked })} className="mr-2" />Active</label><div className="flex gap-2"><button disabled={busy} onClick={() => save(() => superAdminApi.upsertFooterLink(value))} className="btn-secondary">Save</button><button disabled={busy} onClick={() => save(() => superAdminApi.deleteFooterLink(item.id), 'Footer link deleted.')} className="btn-secondary text-red-300">Delete</button></div></div>;
}

function SocialEditor({ items, busy, save }) {
  return <div className="panel grid gap-5 p-6 md:grid-cols-2">{items.map((item) => <SocialField key={item.platform} item={item} busy={busy} save={save} />)}</div>;
}

function SocialField({ item, busy, save }) {
  const [url, setUrl] = useState(item.url);
  const [active, setActive] = useState(Boolean(item.is_active));
  return <label><span className="label capitalize">{item.platform}</span><input className="input" value={url} onChange={(e) => setUrl(e.target.value)} /><div className="mt-2 flex items-center justify-between"><label className="text-xs text-slate-500"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="mr-2" />Enabled</label><button disabled={busy} onClick={() => save(() => superAdminApi.updateSocial(item.platform, { url, is_active: active }))} className="btn-secondary !px-3 !py-2">Save</button></div></label>;
}

function SeoEditor({ seo, busy, save }) {
  const [value, setValue] = useState(seo);
  const fields = ['title', 'description', 'og_title', 'og_description', 'og_image_url'];
  return <div className="panel p-6"><div className="grid gap-4 md:grid-cols-2">{fields.map((field) => <label key={field} className={field.includes('description') ? 'md:col-span-2' : ''}><span className="label capitalize">{field.replaceAll('_', ' ')}</span><textarea className="input min-h-20" value={value[field] || ''} onChange={(e) => setValue({ ...value, [field]: e.target.value })} /></label>)}</div><button disabled={busy} onClick={() => save(() => superAdminApi.upsertContent('seo', 'homepage', { content: value, is_active: true, display_order: 0 }), 'SEO settings saved.')} className="btn-primary mt-5">Save SEO</button></div>;
}

const assignableRoles = ['client', 'editor', 'admin', 'super_admin'];

function RoleManagement() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newRole, setNewRole] = useState('client');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const search = useCallback(async (term) => {
    setLoading(true);
    setError('');
    try {
      const result = await superAdminApi.users({ search: term });
      setUsers(result.users || []);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const openUser = async (id) => {
    setBusy(`open-${id}`);
    setError('');
    try {
      const result = await superAdminApi.user(id);
      setSelected(result.user);
      setNewRole(assignableRoles.find((role) => !result.user.roles.includes(role)) || 'client');
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load that user.'));
    } finally {
      setBusy('');
    }
  };

  const changeRole = async (work, key) => {
    setBusy(key);
    setError('');
    try {
      const result = await work();
      setSelected(result.user);
      await search(query);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setBusy('');
    }
  };

  useEffect(() => {
    search('');
  }, [search]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1.2fr)]">
      <section className="panel p-5">
        <h2 className="font-semibold">Find an existing user</h2>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            search(query);
          }}
        >
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email or mobile"
          />
          <button className="btn-secondary" disabled={loading}>Search</button>
        </form>
        {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="mt-5 max-h-[620px] space-y-2 overflow-y-auto pr-1">
          {loading ? <LoadingState label="Loading users" /> : users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => openUser(user.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected?.id === user.id
                  ? 'border-violet-400/40 bg-violet-500/10'
                  : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{user.email || user.mobile}</p>
                </div>
                <span className="text-[10px] text-slate-600">
                  {busy === `open-${user.id}` ? 'Loading...' : `#${user.id}`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <span key={role} className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] text-slate-300">
                    {role.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {!loading && !users.length && <p className="py-10 text-center text-sm text-slate-600">No users found.</p>}
        </div>
      </section>

      <section className="panel p-5">
        {!selected ? (
          <div className="grid min-h-80 place-items-center text-center">
            <div>
              <Users className="mx-auto text-slate-700" />
              <p className="mt-4 text-sm text-slate-500">Select a user to manage roles and view history.</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-violet-400">Unified account</p>
              <h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{selected.email || 'No email'} - {selected.mobile || 'No mobile'}</p>
            </div>

            <div className="mt-6">
              <p className="label">Active roles</p>
              <div className="mt-2 space-y-2">
                {selected.roles.map((role) => (
                  <div key={role} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <div>
                      <p className="text-sm font-medium capitalize">{role.replaceAll('_', ' ')}</p>
                      {selected.role_profiles?.[role] === 'incomplete' && (
                        <p className="mt-1 text-xs text-amber-300">Profile incomplete</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => changeRole(
                        () => superAdminApi.revokeRole(selected.id, role),
                        `revoke-${role}`,
                      )}
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 disabled:opacity-40"
                    >
                      {busy === `revoke-${role}` ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="label">Grant another role</p>
              <div className="mt-2 flex gap-2">
                <select className="input" value={newRole} onChange={(event) => setNewRole(event.target.value)}>
                  {assignableRoles.filter((role) => !selected.roles.includes(role)).map((role) => (
                    <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={Boolean(busy) || selected.roles.length === assignableRoles.length}
                  onClick={() => changeRole(
                    () => superAdminApi.grantRole(selected.id, newRole),
                    `grant-${newRole}`,
                  )}
                  className="btn-primary"
                >
                  {busy === `grant-${newRole}` ? 'Granting...' : 'Grant'}
                </button>
              </div>
            </div>

            <div className="mt-7">
              <p className="label">Role history</p>
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto border-l border-violet-400/20 pl-4">
                {selected.role_history.map((item) => (
                  <div key={item.id}>
                    <p className="text-sm text-slate-300">
                      <span className="capitalize">{item.role.replaceAll('_', ' ')}</span> {item.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(item.created_at).toLocaleString()} - {item.changed_by_name || item.changed_by_email || 'System migration'}
                    </p>
                  </div>
                ))}
                {!selected.role_history.length && <p className="text-sm text-slate-600">No role changes recorded.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
