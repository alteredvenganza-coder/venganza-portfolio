import { useState, useEffect, useRef } from 'react';
import { FileText, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Btn from '../components/Btn';
import { PROJECT_TYPES, TYPE_LABELS } from '../lib/constants';

const EMPTY_CLIENT = { name: '', brand: '', email: '', phone: '', language: '', notes: '' };
const EMPTY_PROJECT = { title: '', description: '', type: 'fashion', price: '', deadline: '', nextAction: '' };

export default function ClientForm({ open, onClose, onSave, initialValues }) {
  const [form,        setForm]        = useState(EMPTY_CLIENT);
  const [errors,      setErrors]      = useState({});
  const [project,     setProject]     = useState(null);   // extracted project data
  const [includeProj, setIncludeProj] = useState(true);
  const [projOpen,    setProjOpen]    = useState(true);
  const [scanning,    setScanning]    = useState(false);
  const [scanError,   setScanError]   = useState('');
  const [aiFields,    setAiFields]    = useState(new Set()); // fields filled by AI
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...EMPTY_CLIENT, ...initialValues } : EMPTY_CLIENT);
      setErrors({});
      setProject(null);
      setAiFields(new Set());
      setScanError('');
    }
  }, [open, initialValues]);

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  function setProjField(key, value) {
    setProject(p => ({ ...p, [key]: value }));
  }

  // ── Contract analysis ──────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';

    setScanError('');
    setScanning(true);

    try {
      // Read file as base64
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]); // strip data: prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/extract-contract', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ fileData, mimeType: file.type }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Errore analisi');

      // Pre-fill client fields
      const { client = {}, project: proj = {} } = data;
      const filled = new Set();
      const newForm = { ...EMPTY_CLIENT };
      for (const key of ['name','brand','email','phone','language','notes']) {
        if (client[key]) { newForm[key] = client[key]; filled.add(key); }
      }
      setForm(f => ({ ...f, ...newForm }));
      setAiFields(filled);

      // Store extracted project
      if (proj.title) {
        setProject({ ...EMPTY_PROJECT, ...proj, price: proj.price ?? '' });
        setIncludeProj(true);
        setProjOpen(true);
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setScanning(false);
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const projData = (project && includeProj && project.title.trim())
      ? { ...project, price: project.price !== '' ? Number(project.price) : null, deadline: project.deadline || null }
      : null;
    onSave(form, projData);
  }

  const isEdit = Boolean(initialValues);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifica cliente' : 'Nuovo cliente'} width="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">

        {/* ── AI contract upload (only on new client) ── */}
        {!isEdit && (
          <div className="rounded-lg border border-dashed border-border bg-paper p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-burgundy shrink-0" />
                <div>
                  <p className="text-xs font-medium text-ink">Analisi contratto con AI</p>
                  <p className="text-[11px] text-subtle">Carica una foto o PDF del contratto e compilo io</p>
                </div>
              </div>
              <label>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                <Btn as="span" variant="secondary" size="sm" disabled={scanning} onClick={() => fileRef.current?.click()}>
                  <FileText size={13} />
                  {scanning ? 'Analisi…' : 'Carica'}
                </Btn>
              </label>
            </div>
            {scanError && <p className="text-xs text-burgundy mt-2">{scanError}</p>}
            {aiFields.size > 0 && !scanning && (
              <p className="text-[11px] text-[#276749] mt-2 flex items-center gap-1">
                <Sparkles size={10} /> Campi compilati automaticamente — controlla e modifica se necessario
              </p>
            )}
          </div>
        )}

        {/* ── Client fields ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Nome" required error={errors.name}>
            <input
              type="text" placeholder="Mario Rossi"
              value={form.name} onChange={e => setField('name', e.target.value)}
              autoFocus className={aiFields.has('name') ? 'border-[#276749]' : ''}
            />
          </Field>
          <Field label="Brand / Studio">
            <input
              type="text" placeholder="Nome del brand"
              value={form.brand} onChange={e => setField('brand', e.target.value)}
              className={aiFields.has('brand') ? 'border-[#276749]' : ''}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Email">
            <input
              type="email" placeholder="mail@esempio.com"
              value={form.email} onChange={e => setField('email', e.target.value)}
              className={aiFields.has('email') ? 'border-[#276749]' : ''}
            />
          </Field>
          <Field label="Telefono">
            <input
              type="tel" placeholder="+39 333 000 0000"
              value={form.phone} onChange={e => setField('phone', e.target.value)}
              className={aiFields.has('phone') ? 'border-[#276749]' : ''}
            />
          </Field>
        </div>

        <Field label="Lingua">
          <select value={form.language} onChange={e => setField('language', e.target.value)}>
            <option value="">— Seleziona —</option>
            <option value="Italiano">Italiano</option>
            <option value="English">English</option>
            <option value="Español">Español</option>
            <option value="Français">Français</option>
            <option value="Deutsch">Deutsch</option>
          </select>
        </Field>

        <Field label="Note">
          <textarea
            rows={2} placeholder="Note libere sul cliente…"
            value={form.notes} onChange={e => setField('notes', e.target.value)}
            className={`resize-none sm:resize-y ${aiFields.has('notes') ? 'border-[#276749]' : ''}`}
          />
        </Field>

        {/* ── Extracted project ── */}
        {project && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setProjOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-paper hover:bg-[#ede9e1] transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeProj}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setIncludeProj(e.target.checked)}
                  className="w-4 h-4 accent-[#7b1f24]"
                />
                <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                  <Sparkles size={12} className="text-burgundy" />
                  Progetto estratto dal contratto
                </span>
              </div>
              {projOpen ? <ChevronUp size={14} className="text-subtle" /> : <ChevronDown size={14} className="text-subtle" />}
            </button>

            {projOpen && (
              <div className="p-4 flex flex-col gap-3">
                <Field label="Titolo progetto">
                  <input type="text" value={project.title} onChange={e => setProjField('title', e.target.value)} />
                </Field>
                <Field label="Descrizione">
                  <textarea rows={2} value={project.description} onChange={e => setProjField('description', e.target.value)} className="resize-none" />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Tipo">
                    <select value={project.type} onChange={e => setProjField('type', e.target.value)}>
                      {PROJECT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                  </Field>
                  <Field label="Prezzo €">
                    <input type="number" placeholder="0" value={project.price} onChange={e => setProjField('price', e.target.value)} />
                  </Field>
                  <Field label="Deadline">
                    <input type="date" value={project.deadline} onChange={e => setProjField('deadline', e.target.value)} />
                  </Field>
                </div>
                <Field label="Prima azione">
                  <input type="text" placeholder="Cosa fare adesso?" value={project.nextAction} onChange={e => setProjField('nextAction', e.target.value)} />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 sm:pt-4 border-t border-border">
          <Btn variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">Annulla</Btn>
          <Btn variant="primary" type="submit" className="w-full sm:w-auto">
            {isEdit ? 'Salva modifiche' : project && includeProj ? 'Crea cliente + progetto' : 'Aggiungi cliente'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
