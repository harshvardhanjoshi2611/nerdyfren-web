import { useState } from 'react';
import { superAdminApi } from '../lib/api';

const configurations = {
  media: {
    title: 'Media',
    fields: [
      ['title', 'Title'], ['media_url', 'Media URL'], ['media_type', 'Media Type', 'select', ['image', 'video']],
      ['alt_text', 'Alt Text'],
    ],
  },
  portfolio: {
    title: 'Portfolio Item',
    fields: [
      ['title', 'Title'], ['service_type', 'Service Type'], ['media_type', 'Media Type', 'select', ['image', 'video']],
      ['media_url', 'Media URL'], ['thumbnail_url', 'Thumbnail URL'], ['description', 'Description', 'textarea'],
      ['featured', 'Featured', 'checkbox'],
    ],
  },
  testimonial: {
    title: 'Testimonial',
    fields: [
      ['client_name', 'Client Name'], ['client_role_brand', 'Client Role / Brand'],
      ['rating', 'Rating', 'number'], ['testimonial_text', 'Testimonial Text', 'textarea'],
      ['client_image_url', 'Client Image URL'], ['featured', 'Featured', 'checkbox'],
    ],
  },
  service: {
    title: 'Service',
    fields: [
      ['name', 'Service Name'], ['amount', 'Price', 'number'], ['timeline', 'Timeline'],
      ['revision_cycles', 'Revision Cycles', 'number'], ['requirements', 'Requirements', 'list'],
      ['includes', 'Includes', 'list'], ['description', 'Description', 'textarea'],
      ['media_url', 'Image / Video URL'], ['media_type', 'Media Type', 'select', ['image', 'video']],
      ['coming_soon', 'Coming Soon', 'checkbox'], ['bookable', 'Bookable', 'checkbox'],
    ],
  },
};

function initialContent(type) {
  if (type === 'service') return { name: '', amount: 0, timeline: '', revision_cycles: 0, requirements: [], includes: [], description: '', media_url: '', media_type: 'image', coming_soon: false, bookable: true };
  if (type === 'media') return { title: '', media_url: '', media_type: 'image', alt_text: '' };
  if (type === 'portfolio') return { title: '', service_type: '', media_type: 'image', media_url: '', thumbnail_url: '', description: '', featured: false };
  return { client_name: '', client_role_brand: '', rating: 5, testimonial_text: '', client_image_url: '', featured: false };
}

export default function CmsEditors({ type, items = [], busy, save }) {
  const config = configurations[type];
  const [draft, setDraft] = useState({
    key: '',
    content: initialContent(type),
    is_active: true,
    display_order: items.length * 10 + 10,
  });
  const create = () => {
    const content = type === 'service' ? { ...draft.content, id: draft.key } : draft.content;
    return save(
      () => superAdminApi.upsertContent(type, draft.key, {
        content,
        is_active: draft.is_active,
        display_order: draft.display_order,
      }),
      `${config.title} created.`,
    );
  };
  return <div className="space-y-4">
    {items.map((item) => <CmsCard key={item.content_key} type={type} item={item} config={config} busy={busy} save={save} />)}
    <div className="panel p-6">
      <h2 className="font-semibold">Add {config.title}</h2>
      <input className="input mt-4" placeholder="Unique key, e.g. launch-reel" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
      <FieldGrid fields={config.fields} content={draft.content} setContent={(content) => setDraft({ ...draft, content })} />
      <label className="mt-4 flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} /> Active</label>
      <button disabled={busy || !draft.key} onClick={create} className="btn-primary mt-5">Create {config.title}</button>
    </div>
  </div>;
}

function CmsCard({ type, item, config, busy, save }) {
  const [content, setContent] = useState(item.content);
  const [active, setActive] = useState(Boolean(item.is_active));
  const submit = () => save(
    () => superAdminApi.upsertContent(type, item.content_key, {
      content,
      is_active: active,
      display_order: item.display_order,
    }),
    `${config.title} saved.`,
  );
  return <div className="panel p-6">
    <div className="flex items-center justify-between">
      <div><h3 className="font-semibold">{content.name || content.title || content.client_name || item.content_key}</h3><p className="mt-1 text-xs text-slate-600">{item.content_key}</p></div>
      <label className="text-xs text-slate-500"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="mr-2" />Active</label>
    </div>
    <FieldGrid fields={config.fields} content={content} setContent={setContent} lockSurge={type === 'service' && item.content_key === 'surge-reel'} />
    <div className="mt-5 flex gap-2"><button disabled={busy} onClick={submit} className="btn-primary">Save</button><button disabled={busy} onClick={() => save(() => superAdminApi.deleteContent(type, item.content_key), `${config.title} deleted.`)} className="btn-secondary text-red-300">Delete</button></div>
  </div>;
}

function FieldGrid({ fields, content, setContent, lockSurge = false }) {
  return <div className="mt-5 grid gap-4 md:grid-cols-2">{fields.map(([key, label, kind = 'text', options]) => {
    const disabled = lockSurge && ['coming_soon', 'bookable'].includes(key);
    if (kind === 'checkbox') return <label key={key} className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-sm text-slate-300"><input disabled={disabled} type="checkbox" checked={Boolean(content[key])} onChange={(event) => setContent({ ...content, [key]: event.target.checked })} />{label}{disabled && <span className="text-xs text-cyan-300">(locked)</span>}</label>;
    if (kind === 'select') return <label key={key}><span className="label">{label}</span><select className="input" value={content[key] || options[0]} onChange={(event) => setContent({ ...content, [key]: event.target.value })}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
    if (kind === 'list') return <label key={key} className="md:col-span-2"><span className="label">{label} (one per line)</span><textarea className="input min-h-24" value={(content[key] || []).join('\n')} onChange={(event) => setContent({ ...content, [key]: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean) })} /></label>;
    if (kind === 'textarea') return <label key={key} className="md:col-span-2"><span className="label">{label}</span><textarea className="input min-h-24" value={content[key] || ''} onChange={(event) => setContent({ ...content, [key]: event.target.value })} /></label>;
    return <label key={key}><span className="label">{label}</span><input type={kind} min={kind === 'number' ? 0 : undefined} max={key === 'rating' ? 5 : undefined} className="input" value={content[key] ?? ''} onChange={(event) => setContent({ ...content, [key]: kind === 'number' ? Number(event.target.value) : event.target.value })} /></label>;
  })}</div>;
}
