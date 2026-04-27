import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Save, Layers, Eye, EyeOff } from 'lucide-react';
import { fetchSiteServices, createSiteService, updateSiteService, deleteSiteService } from '../../lib/db';
import { Field, ErrorBanner, StatusBadge } from './_shared';

const EMPTY = {
  category: 'strategic',
  num: '',
  title: '',
  subtitle: '',
  description: '',
  price_label: '',
  delivery: '',
  link_to: '/brand-identity',
  status: 'published',
  position: 0,
};

export default function ServicesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  async function reload() {
    setLoading(true);
    try { setItems(await fetchSiteServices()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this service?')) return;
    try { await deleteSiteService(id); reload(); }
    catch (e) { setError(e.message); }
  }

  async function toggleStatus(item) {
    try {
      await updateSiteService(item.id, { status: item.status === 'published' ? 'draft' : 'published' });
      reload();
    } catch (e) { setError(e.message); }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div>
      <ErrorBanner error={error} onClose={() => setError(null)} />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
          {['all', 'strategic', 'quick'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors ${
                filter === f ? 'bg-burgundy/20 text-burgundy-muted' : 'text-muted hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing({ ...EMPTY, position: items.length })} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors">
          <Plus size={14} /> New service
        </button>
      </div>

      {loading ? (
        <p className="label-meta">Caricamento…</p>
      ) : filtered.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ServiceRow
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleStatus={() => toggleStatus(item)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <Editor
            item={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Empty() {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <Layers size={32} className="mx-auto mb-3 text-subtle" />
      <p className="text-sm text-muted mb-1">Nessun servizio.</p>
      <p className="label-meta">Add Brand System, Drop Starter, Tech Pack, etc.</p>
    </div>
  );
}

function ServiceRow({ item, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="glass rounded-lg p-4 grid grid-cols-12 gap-3 items-center">
      <div className="col-span-2 sm:col-span-1">
        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
          item.category === 'strategic' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'
        }`}>
          {item.category}
        </span>
      </div>
      <div className="col-span-10 sm:col-span-5">
        <p className="text-sm font-medium text-ink line-clamp-1">
          {item.num && <span className="text-muted font-mono mr-2">{item.num}</span>}
          {item.title || 'Untitled'}
        </p>
        {item.subtitle && <p className="label-meta line-clamp-1">{item.subtitle}</p>}
      </div>
      <div className="col-span-6 sm:col-span-3 text-right sm:text-left">
        {item.price_label && <p className="text-xs text-burgundy-muted font-mono">{item.price_label}</p>}
        {item.delivery && <p className="label-meta">{item.delivery}</p>}
      </div>
      <div className="col-span-3 sm:col-span-1">
        <StatusBadge status={item.status} />
      </div>
      <div className="col-span-3 sm:col-span-2 flex justify-end gap-1.5">
        <button onClick={onEdit} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">Edit</button>
        <button onClick={onToggleStatus} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors" title={item.status === 'published' ? 'Unpublish' : 'Publish'}>
          {item.status === 'published' ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        <button onClick={onDelete} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-burgundy-muted hover:bg-white/10 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function Editor({ item, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => ({ ...EMPTY, ...item }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const payload = {
        category:    draft.category,
        num:         draft.num.trim() || null,
        title:       draft.title.trim(),
        subtitle:    draft.subtitle.trim() || null,
        description: draft.description.trim() || null,
        price_label: draft.price_label.trim() || null,
        delivery:    draft.delivery.trim() || null,
        link_to:     draft.link_to.trim() || null,
        status:      draft.status,
        position:    Number(draft.position) || 0,
      };
      if (item.id) await updateSiteService(item.id, payload);
      else         await createSiteService(payload);
      onSaved();
    } catch (e) { setError(e.message); setSaving(false); }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-semibold text-ink">{item.id ? 'Edit service' : 'New service'}</h2>
          <button onClick={onClose} className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Category">
              <select value={draft.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm">
                <option value="strategic">Strategic</option>
                <option value="quick">Quick</option>
              </select>
            </Field>
            <Field label="Number" hint="01, 02… for display.">
              <input value={draft.num} onChange={e => set('num', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" placeholder="01" />
            </Field>
            <Field label="Position">
              <input type="number" value={draft.position} onChange={e => set('position', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
            </Field>
          </div>

          <Field label="Title">
            <input value={draft.title} onChange={e => set('title', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Brand System" />
          </Field>

          <Field label="Subtitle">
            <input value={draft.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Balanced identity system" />
          </Field>

          <Field label="Description">
            <textarea rows={3} value={draft.description} onChange={e => set('description', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Complete identity for clothing brands…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price label">
              <input value={draft.price_label} onChange={e => set('price_label', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" placeholder="€3,500 – €5,500" />
            </Field>
            <Field label="Delivery">
              <input value={draft.delivery} onChange={e => set('delivery', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" placeholder="3–4 weeks" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Link route" hint="Where the card opens. E.g. /brand-identity">
              <input value={draft.link_to} onChange={e => set('link_to', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" />
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          {error && <p className="text-xs text-burgundy-muted">{error}</p>}
        </div>

        <div className="sticky bottom-0 glass-strong border-t border-white/10 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded text-sm text-muted hover:text-ink hover:bg-white/8 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !draft.title.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
