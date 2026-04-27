import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Image as ImageIcon, Package, FileText, Upload, Trash2, ExternalLink, Plus, Save, X, Check } from 'lucide-react';
import {
  fetchSiteSettings, updateSiteSettings,
  fetchSitePremades, createSitePremade, updateSitePremade, deleteSitePremade,
  uploadSiteAsset,
} from '../lib/db';
import { formatEur } from '../lib/utils';

const TABS = [
  { id: 'theme',    label: 'Theme',    icon: ImageIcon },
  { id: 'premades', label: 'Premades', icon: Package },
  { id: 'content',  label: 'Content',  icon: FileText },
];

const SITE_URL = 'https://alteredvenganza.com';

export default function SitePage() {
  const [tab, setTab] = useState('theme');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 relative z-10">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Sito</h1>
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="label-meta hover:text-burgundy-muted inline-flex items-center gap-1 transition-colors">
            alteredvenganza.com <ExternalLink size={11} />
          </a>
        </div>
        <p className="text-sm text-muted">Manage the public site — hero, case studies, premades.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors whitespace-nowrap relative ${
              tab === id ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {tab === id && (
              <motion.span layoutId="site-tab-underline" className="absolute bottom-0 left-0 right-0 h-px bg-burgundy" />
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="min-h-[400px]">
        {tab === 'theme'    && <ThemeTab />}
        {tab === 'premades' && <PremadesTab />}
        {tab === 'content'  && <ContentTab />}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// THEME TAB — image slots for hero + case studies
// ───────────────────────────────────────────────────────────────────────────

const IMAGE_SLOTS = [
  { key: 'hero_image',             label: 'Hero image',             hint: 'Right side of the homepage hero. Portrait orientation works best.' },
  { key: 'case_study_maali_image', label: 'MAALI — case study',     hint: 'Featured 4:5 image for the MAALI case study block.' },
  { key: 'case_study_04_image',    label: '[04] STUDIOS — case study', hint: 'Square image for the secondary case study block.' },
];

function ThemeTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings()
      .then(s => { if (!cancelled) setSettings(s); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleUpload(key, file) {
    setSavingKey(key);
    setError(null);
    try {
      const { url } = await uploadSiteAsset(file, 'theme');
      await updateSiteSettings({ [key]: url });
      setSettings(s => ({ ...s, [key]: url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingKey(null);
    }
  }

  async function handleClear(key) {
    if (!window.confirm('Remove this image?')) return;
    setSavingKey(key);
    try {
      await updateSiteSettings({ [key]: null });
      setSettings(s => ({ ...s, [key]: null }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return <p className="label-meta">Caricamento…</p>;
  }

  return (
    <div>
      {error && (
        <div className="glass rounded-lg p-4 mb-4 border-burgundy/40">
          <p className="text-sm text-burgundy-muted">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {IMAGE_SLOTS.map(slot => (
          <ImageSlotCard
            key={slot.key}
            slot={slot}
            value={settings?.[slot.key]}
            saving={savingKey === slot.key}
            onUpload={file => handleUpload(slot.key, file)}
            onClear={() => handleClear(slot.key)}
          />
        ))}
      </div>

      <p className="label-meta mt-6">Changes are public on alteredvenganza.com immediately.</p>
    </div>
  );
}

function ImageSlotCard({ slot, value, saving, onUpload, onClear }) {
  const fileRef = useRef(null);

  function pick() {
    fileRef.current?.click();
  }

  function onChange(e) {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
    e.target.value = '';
  }

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-ink">{slot.label}</p>
        <p className="label-meta mt-1">{slot.hint}</p>
      </div>

      <div className="aspect-[4/5] rounded-lg overflow-hidden bg-white/5 border border-white/8 relative">
        {value ? (
          <img src={value} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-subtle">
            <ImageIcon size={32} />
          </div>
        )}
        {saving && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <p className="label-meta text-ink">Saving…</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={pick}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-xs bg-burgundy/15 text-burgundy-muted hover:bg-burgundy/25 transition-colors disabled:opacity-50"
        >
          <Upload size={12} />
          {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button
            onClick={onClear}
            disabled={saving}
            className="px-3 py-2 rounded text-xs bg-white/5 text-muted hover:text-burgundy-muted hover:bg-white/8 transition-colors disabled:opacity-50"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onChange} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// PREMADES TAB — CRUD list of premade items
// ───────────────────────────────────────────────────────────────────────────

function PremadesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  async function reload() {
    setLoading(true);
    try {
      const list = await fetchSitePremades();
      setItems(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  function startNew() {
    setEditing({ title: '', description: '', price: '', image: '', status: 'draft', position: items.length });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this premade? This cannot be undone.')) return;
    try {
      await deleteSitePremade(id);
      reload();
    } catch (e) {
      setError(e.message);
    }
  }

  async function togglePublish(item) {
    try {
      await updateSitePremade(item.id, { status: item.status === 'published' ? 'draft' : 'published' });
      reload();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      {error && (
        <div className="glass rounded-lg p-4 mb-4 border-burgundy/40">
          <p className="text-sm text-burgundy-muted">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{items.length} premade{items.length === 1 ? '' : 's'}</p>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors"
        >
          <Plus size={14} /> New premade
        </button>
      </div>

      {loading ? (
        <p className="label-meta">Caricamento…</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Package size={32} className="mx-auto mb-3 text-subtle" />
          <p className="text-sm text-muted mb-1">Nessuna premade.</p>
          <p className="label-meta">Click <em>New premade</em> to add the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <PremadeCard
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onTogglePublish={() => togglePublish(item)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <PremadeEditor
            item={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PremadeCard({ item, onEdit, onDelete, onTogglePublish }) {
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
        <span className={`absolute top-2 left-2 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
          item.status === 'published'
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-white/10 text-muted'
        }`}>
          {item.status}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <p className="text-sm font-medium text-ink line-clamp-1">{item.title || 'Untitled'}</p>
        {item.price != null && <p className="text-sm font-display font-bold text-burgundy-muted">{formatEur(Number(item.price))}</p>}
        <div className="flex gap-1.5 mt-auto pt-2">
          <button onClick={onEdit} className="flex-1 px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">Edit</button>
          <button onClick={onTogglePublish} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors" title={item.status === 'published' ? 'Unpublish' : 'Publish'}>
            <Check size={12} />
          </button>
          <button onClick={onDelete} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-burgundy-muted hover:bg-white/10 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PremadeEditor({ item, onClose, onSaved }) {
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
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadSiteAsset(f, 'premades');
      set('image', url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
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
      if (item.id) {
        await updateSitePremade(item.id, payload);
      } else {
        await createSitePremade(payload);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-semibold text-ink">{item.id ? 'Edit premade' : 'New premade'}</h2>
          <button onClick={onClose} className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          <Field label="Title">
            <input type="text" value={draft.title} onChange={e => set('title', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="e.g. Skull Print Hoodie" />
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
                <button
                  onClick={() => set('image', '')}
                  className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white hover:bg-burgundy transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full max-w-xs aspect-square bg-white/5 border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center text-subtle hover:text-ink hover:border-white/30 transition-colors"
              >
                <Upload size={20} className="mb-2" />
                <span className="text-xs">{uploading ? 'Uploading…' : 'Upload image'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug" hint="Optional. URL-friendly identifier.">
              <input type="text" value={draft.slug} onChange={e => set('slug', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" placeholder="skull-print-hoodie" />
            </Field>
            <Field label="Position">
              <input type="number" value={draft.position} onChange={e => set('position', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
            </Field>
          </div>

          {error && <p className="text-xs text-burgundy-muted">{error}</p>}

        </div>

        <div className="sticky bottom-0 glass-strong border-t border-white/10 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded text-sm text-muted hover:text-ink hover:bg-white/8 transition-colors disabled:opacity-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !draft.title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block label-meta mt-1">{hint}</span>}
    </label>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// CONTENT TAB — copy management (placeholder for now)
// ───────────────────────────────────────────────────────────────────────────

function ContentTab() {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <FileText size={32} className="mx-auto mb-3 text-subtle" />
      <p className="text-sm text-muted mb-1">Content management coming soon.</p>
      <p className="label-meta">Hero copy, services and pricing will be editable here.</p>
    </div>
  );
}
