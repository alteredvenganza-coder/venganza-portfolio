import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Save, Upload, Image as ImageIcon, Package, Eye, EyeOff } from 'lucide-react';
import { fetchSitePremades, createSitePremade, updateSitePremade, deleteSitePremade, uploadSiteAsset } from '../../lib/db';
import { formatEur } from '../../lib/utils';
import { Field, ErrorBanner, StatusBadge } from './_shared';

const EMPTY = { title: '', description: '', price: '', image: '', status: 'draft', slug: '', position: 0 };

export default function PremadesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  async function reload() {
    setLoading(true);
    try { setItems(await fetchSitePremades()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this premade?')) return;
    try { await deleteSitePremade(id); reload(); }
    catch (e) { setError(e.message); }
  }

  async function toggleStatus(item) {
    try {
      await updateSitePremade(item.id, { status: item.status === 'published' ? 'draft' : 'published' });
      reload();
    } catch (e) { setError(e.message); }
  }

  return (
    <div>
      <ErrorBanner error={error} onClose={() => setError(null)} />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{items.length} premade{items.length === 1 ? '' : 's'}</p>
        <button onClick={() => setEditing({ ...EMPTY, position: items.length })} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors">
          <Plus size={14} /> New premade
        </button>
      </div>

      {loading ? (
        <p className="label-meta">Caricamento…</p>
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card
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
          <Editor item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Empty() {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <Package size={32} className="mx-auto mb-3 text-subtle" />
      <p className="text-sm text-muted mb-1">Nessuna premade.</p>
      <p className="label-meta">Click <em>New premade</em> to add the first one.</p>
    </div>
  );
}

function Card({ item, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col">
      <div className="aspect-square bg-white/5 relative">
        {item.image ? (
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-subtle">
            <ImageIcon size={28} />
          </div>
        )}
        <div className="absolute top-2 left-2"><StatusBadge status={item.status} /></div>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <p className="text-sm font-medium text-ink line-clamp-1">{item.title || 'Untitled'}</p>
        {item.price != null && <p className="text-sm font-display font-bold text-burgundy-muted">{formatEur(Number(item.price))}</p>}
        <div className="flex gap-1.5 mt-auto pt-2">
          <button onClick={onEdit} className="flex-1 px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">Edit</button>
          <button onClick={onToggleStatus} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">
            {item.status === 'published' ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button onClick={onDelete} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-burgundy-muted hover:bg-white/10 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Editor({ item, onClose, onSaved }) {
  const [draft, setDraft] = useState({
    title: item.title || '',
    description: item.description || '',
    price: item.price ?? '',
    image: item.image || '',
    status: item.status || 'draft',
    slug: item.slug || '',
    position: item.position ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  async function handleImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true); setError(null);
    try { const { url } = await uploadSiteAsset(f, 'premades'); set('image', url); }
    catch (err) { setError(err.message); }
    finally { setUploading(false); e.target.value = ''; }
  }

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const payload = {
        title:       draft.title.trim(),
        description: draft.description.trim() || null,
        price:       draft.price === '' ? null : Number(draft.price),
        image:       draft.image || null,
        status:      draft.status,
        slug:        draft.slug.trim() || null,
        position:    Number(draft.position) || 0,
      };
      if (item.id) await updateSitePremade(item.id, payload);
      else         await createSitePremade(payload);
      onSaved();
    } catch (e) { setError(e.message); setSaving(false); }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-semibold text-ink">{item.id ? 'Edit premade' : 'New premade'}</h2>
          <button onClick={onClose} className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="Title">
            <input value={draft.title} onChange={e => set('title', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="e.g. Skull Print Hoodie" />
          </Field>
          <Field label="Description" hint="Short copy shown on the premade card.">
            <textarea rows={3} value={draft.description} onChange={e => set('description', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Optional" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (€)">
              <input type="number" step="0.01" value={draft.price} onChange={e => set('price', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="200" />
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <Field label="Image">
            {draft.image ? (
              <div className="aspect-square bg-white/5 border border-white/8 rounded-lg overflow-hidden relative max-w-xs">
                <img src={draft.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => set('image', '')} className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white hover:bg-burgundy transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full max-w-xs aspect-square bg-white/5 border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center text-subtle hover:text-ink hover:border-white/30 transition-colors">
                <Upload size={20} className="mb-2" />
                <span className="text-xs">{uploading ? 'Uploading…' : 'Upload image'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug" hint="Optional. URL-friendly identifier.">
              <input value={draft.slug} onChange={e => set('slug', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" />
            </Field>
            <Field label="Position">
              <input type="number" value={draft.position} onChange={e => set('position', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
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
