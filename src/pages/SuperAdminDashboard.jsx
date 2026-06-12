import { FileText, Gauge, Image, LayoutPanelTop, Link2, MessageCircleQuestion, Search, Settings, Share2, Star, Users, Video } from 'lucide-react';
import { useState } from 'react';
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
  ['User Management', Users],
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
    <DashboardShell role="super_admin" links={[{ label: 'CMS Control', to: '/super-admin', icon: FileText }]}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm text-violet-400">Super Admin control center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage NerdyFren without a deployment.</h1>
            <p className="mt-2 text-sm text-slate-500">Content, services, links, SEO and operator access are stored in the database.</p>
            <Link to="/admin" className="btn-secondary mt-5">Open Admin Operations & Reports</Link>
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
            {tab === 'User Management' && <UserManagement admins={data.admins} editors={data.editors} busy={busy} save={save} />}
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

function UserManagement({ admins, editors, busy, save }) {
  const [admin, setAdmin] = useState({ email: '', password: '' });
  const [editor, setEditor] = useState({ name: '', email: '', mobile: '', password: '', skills: '' });
  return <div className="grid gap-6 xl:grid-cols-2"><div className="space-y-4"><div className="panel p-5"><h2 className="font-semibold">Create Admin</h2><div className="mt-4 space-y-3"><input className="input" placeholder="Email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} /><input type="password" className="input" placeholder="Temporary password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} /></div><button disabled={busy} onClick={() => save(() => superAdminApi.createAdmin(admin), 'Admin created.')} className="btn-primary mt-4">Create Admin</button></div>{admins.map((item) => <AccountCard key={item.id} name={item.email} subtitle={item.role} active={Boolean(item.is_active)} disabled={item.role === 'super_admin'} onToggle={(active) => save(() => superAdminApi.updateAdmin(item.id, active))} />)}</div><div className="space-y-4"><div className="panel p-5"><h2 className="font-semibold">Create Nerd</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input className="input" placeholder="Name" value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} /><input className="input" placeholder="Email" value={editor.email} onChange={(e) => setEditor({ ...editor, email: e.target.value })} /><input className="input" placeholder="Mobile" value={editor.mobile} onChange={(e) => setEditor({ ...editor, mobile: e.target.value })} /><input type="password" className="input" placeholder="Temporary password" value={editor.password} onChange={(e) => setEditor({ ...editor, password: e.target.value })} /><input className="input sm:col-span-2" placeholder="Skills, comma separated" value={editor.skills} onChange={(e) => setEditor({ ...editor, skills: e.target.value })} /></div><button disabled={busy} onClick={() => save(() => superAdminApi.createEditor({ ...editor, skills: editor.skills.split(',').map((skill) => skill.trim()).filter(Boolean) }), 'Nerd created.')} className="btn-primary mt-4">Create Nerd</button></div>{editors.map((item) => <AccountCard key={item.id} name={item.name} subtitle={item.email} active={Boolean(item.is_active)} onToggle={(active) => save(() => superAdminApi.updateEditor(item.id, active))} />)}</div></div>;
}

function AccountCard({ name, subtitle, active, disabled = false, onToggle }) {
  return <div className="panel flex items-center justify-between p-4"><div><p className="font-medium">{name}</p><p className="mt-1 text-xs text-slate-600">{subtitle}</p></div><button disabled={disabled} onClick={() => onToggle(!active)} className={`rounded-lg px-3 py-2 text-xs font-medium ${active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'} disabled:opacity-40`}>{active ? 'Active' : 'Disabled'}</button></div>;
}
