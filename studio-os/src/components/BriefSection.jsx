import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Upload, X, ChevronDown, ChevronUp, Image } from 'lucide-react';
import Btn from './Btn';
import { genId } from '../lib/utils';
import { uploadProjectFile, deleteProjectFile } from '../lib/db';

/*
  brief = {
    notes:  string,
    images: [{ id, url, path, caption }],
    steps:  [{ id, label, done }],
  }
*/

function emptyBrief() {
  return { notes: '', images: [], steps: [] };
}

export default function BriefSection({ brief: rawBrief, projectId, onUpdate }) {
  const brief   = { ...emptyBrief(), ...rawBrief };
  const [open,  setOpen]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newStep, setNewStep]     = useState('');
  const fileRef = useRef(null);

  function update(patch) {
    onUpdate({ ...brief, ...patch });
  }

  // ── Steps ──────────────────────────────────────────────────────────────────
  function addStep(e) {
    e.preventDefault();
    if (!newStep.trim()) return;
    update({ steps: [...brief.steps, { id: genId(), label: newStep.trim(), done: false }] });
    setNewStep('');
  }

  function toggleStep(id) {
    update({ steps: brief.steps.map(s => s.id === id ? { ...s, done: !s.done } : s) });
  }

  function deleteStep(id) {
    update({ steps: brief.steps.filter(s => s.id !== id) });
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async file => {
          const { url, path } = await uploadProjectFile(projectId, file);
          return { id: genId(), url, path, caption: '' };
        })
      );
      update({ images: [...brief.images, ...uploaded] });
    } catch (err) {
      console.error('Upload error', err);
      alert('Errore upload: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function removeImage(img) {
    update({ images: brief.images.filter(i => i.id !== img.id) });
    if (img.path) {
      try { await deleteProjectFile(img.path); } catch (_) {}
    }
  }

  function updateCaption(id, caption) {
    update({ images: brief.images.map(i => i.id === id ? { ...i, caption } : i) });
  }

  const doneCount = brief.steps.filter(s => s.done).length;

  return (
    <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
      {/* Header — click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-paper transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-base font-semibold text-ink">Brief & Referenze</span>
          {brief.steps.length > 0 && (
            <span className="text-[11px] font-mono text-subtle">
              {doneCount}/{brief.steps.length} step
            </span>
          )}
          {brief.images.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-subtle">
              <Image size={11} /> {brief.images.length}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-subtle" /> : <ChevronDown size={16} className="text-subtle" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 sm:px-5 pb-5 flex flex-col gap-5 border-t border-border pt-4">

              {/* ── Note generali ── */}
              <div>
                <p className="label-meta mb-2">Note / Brief</p>
                <textarea
                  rows={4}
                  placeholder="Descrizione del progetto, obiettivi, tone of voice, riferimenti…"
                  value={brief.notes}
                  onChange={e => update({ notes: e.target.value })}
                  className="text-sm resize-none"
                />
              </div>

              {/* ── Immagini reference ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="label-meta">Immagini & Reference</p>
                  <label className="cursor-pointer">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFiles}
                    />
                    <Btn
                      as="span"
                      variant="secondary"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={13} />
                      {uploading ? 'Caricamento…' : 'Carica'}
                    </Btn>
                  </label>
                </div>

                {brief.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {brief.images.map(img => (
                      <div key={img.id} className="group relative rounded-md overflow-hidden border border-border bg-paper aspect-square">
                        <img
                          src={img.url}
                          alt={img.caption || 'reference'}
                          className="w-full h-full object-cover"
                        />
                        {/* Caption overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-ink/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <input
                            type="text"
                            value={img.caption}
                            onChange={e => updateCaption(img.id, e.target.value)}
                            placeholder="Didascalia…"
                            className="w-full bg-transparent border-none text-white text-[11px] p-0 outline-none placeholder-white/50"
                            style={{ background: 'transparent', borderRadius: 0, padding: 0 }}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={() => removeImage(img)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-burgundy"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-burgundy-muted transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Image size={24} className="text-subtle mx-auto mb-2" />
                    <p className="text-xs text-subtle">Clicca o trascina immagini di reference</p>
                  </div>
                )}
              </div>

              {/* ── Step creativi ── */}
              <div>
                <p className="label-meta mb-3">Step del progetto</p>

                {/* Progress bar */}
                {brief.steps.length > 0 && (
                  <div className="h-1 bg-paper rounded-full mb-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-burgundy rounded-full"
                      animate={{ width: `${(doneCount / brief.steps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Steps list — numbered circles */}
                <div className="flex flex-col gap-2 mb-3">
                  <AnimatePresence>
                    {brief.steps.map((step, i) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="flex items-center gap-3 group"
                      >
                        {/* Circle number */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all text-[11px] font-mono font-semibold"
                          style={{
                            borderColor: step.done ? '#7b1f24' : '#e8e4dc',
                            background:  step.done ? '#7b1f24' : '#fff',
                            color:       step.done ? '#fff'    : '#9e9690',
                          }}
                        >
                          {step.done ? <Check size={12} /> : i + 1}
                        </button>

                        {/* Label */}
                        <span className={`text-sm flex-1 transition-colors ${step.done ? 'line-through text-subtle' : 'text-ink'}`}>
                          {step.label}
                        </span>

                        {/* Delete */}
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="opacity-0 group-hover:opacity-100 text-subtle hover:text-burgundy transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add step */}
                <form onSubmit={addStep} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Aggiungi step (es. Raccolta materiali, Bozza, Revisione…)"
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Btn type="submit" variant="secondary" size="sm" disabled={!newStep.trim()}>
                    <Plus size={14} />
                  </Btn>
                </form>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
