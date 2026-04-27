import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Save, Upload, Image as ImageIcon, Star, Briefcase, Eye, EyeOff } from 'lucide-react';
import { fetchSiteCaseStudies, createSiteCaseStudy, updateSiteCaseStudy, deleteSiteCaseStudy, uploadSiteAsset } from '../../lib/db';
import { Field, ErrorBanner, StatusBadge } from './_shared';

const EMPTY = {
  title: '', subtitle: '', type_label: 'Case study',
  brief: '', approach: '', result: '',
  hero_image: '', gallery: [], tags: [], year: '',
  slug: '', status: 'draft', is_featured: false, position: 0,
};

export default function CaseStudiesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  async function reload() {
    setLoading(true);
    try { setItems(await fetchSiteCaseStudies()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this case study? This cannot be undone.')) return;
    try { await deleteSiteCaseStudy(id); reload(); }
    catch (e) { setError(e.message); }
  }

  async function toggle(item, key) {
    try {
      const patch = key === 'status'
        ? { status: item.status === 'published' ? 'draft' : 'published' }
        : { is_featured: !item.is_featured };
      await updateSiteCaseStudy(item.id, patch);
      reload();
    } catch (e) { setError(e.message); }
  }

  return (
    <div>
      <ErrorBanner error={error} onClose={() => setError(null)} />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{items.length} case stud{items.length === 1 ? 'y' : 'ies'}</p>
        <button onClick={() => setEditing({ ...EMPTY, position: items.length })} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors">
          <Plus size={14} /> New case study
        </button>
      </div>

      {loading ? (
        <p className="label-meta">Caricamento…</p>
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <CaseStudyCard
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleStatus={() => toggle(item, 'status')}
              onToggleFeatured={() => toggle(item, 'is_featured')}
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
      <Briefcase size={32} className="mx-auto mb-3 text-subtle" />
      <p className="text-sm text-muted mb-1">Nessun case study.</p>
      <p className="label-meta">Click <em>New case study</em> to add MAALI, [04]-STUDIOS or others.</p>
    </div>
  );
}

function CaseStudyCard({ item, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col">
      <div className="aspect-[16/10] bg-white/5 relative">
        {item.hero_image ? (
          <img src={item.hero_image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-subtle">
            <ImageIcon size={28} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <StatusBadge status={item.status} />
          {item.is_featured && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 inline-flex items-center gap-1">
              <Star size={9} /> Featured
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <p className="text-base font-display font-semibold text-ink line-clamp-1">{item.title || 'Untitled'}</p>
          {item.year && <span className="label-meta">{item.year}</span>}
        </div>
        {item.subtitle && <p className="text-xs text-muted line-clamp-1">{item.subtitle}</p>}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {item.tags.slice(0, 4).map(t => (
              <span key={t} className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-muted">{t}</span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 mt-auto pt-2">
          <button onClick={onEdit} className="flex-1 px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">Edit</button>
          <button onClick={onToggleStatus} className="px-2 py-1.5 rounded text-[11px] bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors" title={item.status === 'published' ? 'Unpublish' : 'Publish'}>
            {item.status === 'published' ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button onClick={onToggleFeatured} className={`px-2 py-1.5 rounded text-[11px] hover:bg-white/10 transition-colors ${item.is_featured ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-muted hover:text-ink'}`} title="Featured on homepage">
            <Star size={12} />
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
  const [draft, setDraft] = useState(() => ({
    ...EMPTY, ...item,
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    tags:    Array.isArray(item.tags)    ? item.tags    : [],
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState(null);
  const heroRef = useRef(null);
  const galleryRef = useRef(null);

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  async function handleHero(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingHero(true); setError(null);
    try { const { url } = await uploadSiteAsset(f, 'case-studies'); set('hero_image', url); }
    catch (err) { setError(err.message); }
    finally { setUploadingHero(false); e.target.value = ''; }
  }

  async function handleGallery(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true); setError(null);
    try {
      const urls = [];
      for (const f of files) {
        const { url } = await uploadSiteAsset(f, 'case-studies');
        urls.push(url);
      }
      set('gallery', [...draft.gallery, ...urls]);
    } catch (err) { setError(err.message); }
    finally { setUploadingGallery(false); e.target.value = ''; }
  }

  function removeGallery(idx) {
    set('gallery', draft.gallery.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const payload = {
        title:        draft.title.trim(),
        subtitle:     draft.subtitle.trim() || null,
        type_label:   draft.type_label.trim() || null,
        brief:        draft.brief.trim() || null,
        approach:     draft.approach.trim() || null,
        result:       draft.result.trim() || null,
        hero_image:   draft.hero_image || null,
        gallery:      draft.gallery,
        tags:         draft.tags,
        year:         draft.year.trim() || null,
        slug:         draft.slug.trim() || null,
        status:       draft.status,
        is_featured:  !!draft.is_featured,
        position:     Number(draft.position) || 0,
      };
      if (item.id) await updateSiteCaseStudy(item.id, payload);
      else         await createSiteCaseStudy(payload);
      onSaved();
    } catch (e) { setError(e.message); setSaving(false); }
  }

  function tagsString() {
    return draft.tags.join(', ');
  }
  function setTagsFromString(s) {
    set('tags', s.split(',').map(t => t.trim()).filter(Boolean));
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative glass-strong rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-semibold text-ink">{item.id ? 'Edit case study' : 'New case study'}</h2>
          <button onClick={onClose} className="p-2 rounded text-muted hover:text-ink hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Title">
              <input value={draft.title} onChange={e => set('title', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="MAALI" />
            </Field>
            <Field label="Year">
              <input value={draft.year} onChange={e => set('year', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="2025" />
            </Field>
            <Field label="Type label" hint="Shows above the title.">
              <input value={draft.type_label} onChange={e => set('type_label', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Primary case study" />
            </Field>
          </div>

          <Field label="Subtitle" hint="One-liner under the title.">
            <input value={draft.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" placeholder="Logo system · brand identity · apparel" />
          </Field>

          <Field label="Brief" hint="What was the starting point.">
            <textarea rows={3} value={draft.brief} onChange={e => set('brief', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
          </Field>

          <Field label="Approach" hint="How we worked through it.">
            <textarea rows={3} value={draft.approach} onChange={e => set('approach', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
          </Field>

          <Field label="Result" hint="The outcome shipped.">
            <textarea rows={3} value={draft.result} onChange={e => set('result', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
          </Field>

          {/* Hero image */}
          <Field label="Hero image" hint="Main visual on the homepage block.">
            {draft.hero_image ? (
              <div className="aspect-[4/5] max-w-xs bg-white/5 border border-white/8 rounded-lg overflow-hidden relative">
                <img src={draft.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => set('hero_image', '')} className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white hover:bg-burgundy transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => heroRef.current?.click()} disabled={uploadingHero} className="w-full max-w-xs aspect-[4/5] bg-white/5 border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center text-subtle hover:text-ink hover:border-white/30 transition-colors">
                <Upload size={20} className="mb-2" />
                <span className="text-xs">{uploadingHero ? 'Uploading…' : 'Upload hero'}</span>
              </button>
            )}
            <input ref={heroRef} type="file" accept="image/*" hidden onChange={handleHero} />
          </Field>

          {/* Gallery */}
          <Field label="Gallery" hint="Process / final shots. Multiple files supported.">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {draft.gallery.map((url, i) => (
                <div key={i} className="aspect-square bg-white/5 border border-white/8 rounded overflow-hidden relative group">
                  <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button onClick={() => removeGallery(i)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => galleryRef.current?.click()} disabled={uploadingGallery} className="aspect-square bg-white/5 border border-dashed border-white/15 rounded flex items-center justify-center text-subtle hover:text-ink hover:border-white/30 transition-colors">
                {uploadingGallery ? <span className="text-[10px]">Up…</span> : <Plus size={16} />}
              </button>
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={handleGallery} />
          </Field>

          <Field label="Tags" hint="Comma-separated. E.g. Identity, Apparel, Production">
            <input value={tagsString()} onChange={e => setTagsFromString(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
          </Field>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <Field label="Slug">
              <input value={draft.slug} onChange={e => set('slug', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm font-mono" placeholder="maali" />
            </Field>
            <Field label="Position">
              <input type="number" value={draft.position} onChange={e => set('position', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-md text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Featured">
              <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/8 text-sm cursor-pointer">
                <input type="checkbox" checked={!!draft.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                <span className="text-muted">On homepage</span>
              </label>
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
