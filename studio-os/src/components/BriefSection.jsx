import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Upload, X, ChevronDown, ChevronUp, Image, Sparkles } from 'lucide-react';
import Btn from './Btn';
import { genId } from '../lib/utils';
import { uploadProjectFile, deleteProjectFile } from '../lib/db';
import { fireWebhook } from '../lib/webhook';

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

export default function BriefSection({ brief: rawBrief, projectId, onUpdate, onProjectUpdate }) {
  const brief   = { ...emptyBrief(), ...rawBrief };
  const [open,       setOpen]      = useState(false);
  const [uploading,  setUploading] = useState(false);
  const [analyzing,  setAnalyzing] = useState(false);
  const [analyzeErr, setAnalyzeErr]= useState('');
  const [newStep,    setNewStep]   = useState('');
  const [aiExtras,   setAiExtras]  = useState(null); // enriched AI extraction results
  const fileRef    = useRef(null);
  const aiFileRef  = useRef(null);

  function update(patch) {
    onUpdate({ ...brief, ...patch });
  }

  // ── Steps ──────────────────────────────────────────────────────────────────
  function addStep(e) {
    e.preventDefault();
    if (!newStep.trim()) return;
    const label = newStep.trim();
    update({ steps: [...brief.steps, { id: genId(), label, done: false }] });
    fireWebhook({ event: 'step_added', projectId, step: label });
    setNewStep('');
  }

  function toggleStep(id) {
    update({ steps: brief.steps.map(s => s.id === id ? { ...s, done: !s.done } : s) });
  }

  function deleteStep(id) {
    update({ steps: brief.steps.filter(s => s.id !== id) });
  }

  // ── AI analysis of chat screenshots / documents ───────────────────────────
  async function handleAiFiles(e) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (aiFileRef.current) aiFileRef.current.value = '';

    setAnalyzeErr('');
    setAnalyzing(true);

    try {
      const filesData = await Promise.all(
        files.map(file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve({ fileData: reader.result.split(',')[1], mimeType: file.type });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );

      const res  = await fetch('/api/analyze-brief', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ files: filesData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Errore analisi');

      const { notes: aiNotes, steps: aiSteps, budget, deadline, projectType, clientInfo, materials, toneOfVoice, references } = data;

      // Append notes — include extras inline
      let fullNotes = aiNotes || '';
      if (toneOfVoice) fullNotes += `\n\n🎨 Tone of voice: ${toneOfVoice}`;
      if (references)  fullNotes += `\n📌 Reference: ${references}`;
      if (materials?.length) fullNotes += `\n📦 Materiali: ${materials.join(', ')}`;

      const newNotes = brief.notes
        ? brief.notes + '\n\n— Estratto dall\'AI —\n' + fullNotes
        : fullNotes;

      // Append steps
      const newSteps = [
        ...brief.steps,
        ...aiSteps.map(label => ({ id: genId(), label, done: false })),
      ];

      update({ notes: newNotes, steps: newSteps });

      // Auto-fill project fields if extracted
      if (onProjectUpdate) {
        const patch = {};
        if (budget)      patch.price    = budget;
        if (deadline)    patch.deadline = deadline;
        if (projectType) patch.type     = projectType;
        if (Object.keys(patch).length) onProjectUpdate(patch);
      }

      // Store extras for display
      setAiExtras({ budget, deadline, projectType, clientInfo, materials, toneOfVoice, references });
    } catch (err) {
      setAnalyzeErr(err.message);
    } finally {
      setAnalyzing(false);
    }
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
    <div className="glass rounded-lg overflow-hidden">
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

              {/* ── AI analysis ── */}
              <div className="rounded-lg border border-dashed border-border bg-paper p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-burgundy shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink">Analizza con AI</p>
                      <p className="text-[11px] text-subtle">Carica screenshot di chat, email o documenti — l'AI genera note e step</p>
                    </div>
                  </div>
                  <label>
                    <input
                      ref={aiFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleAiFiles}
                    />
                    <Btn as="span" variant="secondary" size="sm" disabled={analyzing} onClick={() => aiFileRef.current?.click()}>
                      <Sparkles size={12} />
                      {analyzing ? 'Analisi…' : 'Analizza'}
                    </Btn>
                  </label>
                </div>
                {analyzeErr && <p className="text-xs text-burgundy mt-2">{analyzeErr}</p>}
                {aiExtras && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {aiExtras.budget && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(52,168,83,0.18)] text-[#6dd49e]">
                        💰 {aiExtras.budget}€ → aggiornato
                      </span>
                    )}
                    {aiExtras.deadline && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(56,120,220,0.18)] text-[#7bb3ff]">
                        📅 {aiExtras.deadline} → aggiornato
                      </span>
                    )}
                    {aiExtras.projectType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(124,58,237,0.18)] text-[#c4a5ff]">
                        🏷️ {aiExtras.projectType} → aggiornato
                      </span>
                    )}
                    {aiExtras.clientInfo?.name && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(255,255,255,0.08)] text-muted">
                        👤 {aiExtras.clientInfo.name}{aiExtras.clientInfo.brand ? ` · ${aiExtras.clientInfo.brand}` : ''}
                      </span>
                    )}
                    {aiExtras.toneOfVoice && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(200,60,120,0.18)] text-[#f5a0c8]">
                        🎨 {aiExtras.toneOfVoice}
                      </span>
                    )}
                  </div>
                )}
              </div>

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
                            borderColor: step.done ? '#7b1f24' : 'rgba(255,255,255,0.15)',
                            background:  step.done ? '#7b1f24' : 'rgba(255,255,255,0.07)',
                            color:       step.done ? '#fff'    : '#b0acaa',
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
