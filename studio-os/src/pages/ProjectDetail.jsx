import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit2, Trash2, Pause, Play, Plus, Check,
  X, AlertCircle, Calendar, DollarSign, MessageSquare, Info, ImagePlus,
} from 'lucide-react';
import StageStepper from '../components/StageStepper';
import Badge from '../components/Badge';
import Btn from '../components/Btn';
import Field from '../components/Field';
import Modal from '../components/Modal';
import BriefSection from '../components/BriefSection';
import DeliverySection from '../components/DeliverySection';
import ProjectForm from '../forms/ProjectForm';
import { uploadProjectFile } from '../lib/db';
import { useClients, useProjects } from '../hooks/useStore';
import {
  STAGE_LABELS, STAGE_BG, STAGE_TEXT,
  TYPE_LABELS, TYPE_BG, TYPE_TEXT,
  PAYMENT_LABELS, PAYMENT_BG, PAYMENT_TEXT,
  PAYMENT_STATUSES,
} from '../lib/constants';
import { formatDate, formatEur, isOverdue, daysUntil } from '../lib/utils';
import { genId } from '../lib/utils';

export default function ProjectDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();

  const { getClient, clients }                                           = useClients();
  const { getProject, updateProject, deleteProject, addTask, toggleTask, deleteTask } = useProjects();

  const project = getProject(id);
  const client  = project ? getClient(project.clientId) : null;

  const [editOpen,    setEditOpen]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [pauseOpen,   setPauseOpen]   = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  // Local price state — salva solo onBlur per evitare race conditions DB
  const [priceLocal,       setPriceLocal]       = useState('');
  const [paidLocal,        setPaidLocal]        = useState('');
  const [retainerFeeLocal, setRetainerFeeLocal] = useState('');
  const [coverUploading,   setCoverUploading]   = useState(false);
  const coverRef = useRef(null);
  const [newTask,     setNewTask]     = useState('');

  // Sync local price fields when project loads or changes from outside
  const prevId = useRef(null);
  if (prevId.current !== id) {
    prevId.current = id;
    // can't call setState in render; will sync via useEffect below
  }

  useEffect(() => {
    if (project) {
      setPriceLocal(project.price ?? '');
      setPaidLocal(project.paidAmount ?? '');
      setRetainerFeeLocal(project.retainerFee ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">Progetto non trovato.</p>
        <Link to="/" className="text-burgundy text-sm hover:underline">← Dashboard</Link>
      </div>
    );
  }

  const overdue = isOverdue(project.deadline);
  const days    = daysUntil(project.deadline);
  const tasks   = project.tasks ?? [];
  const doneCnt = tasks.filter(t => t.done).length;

  function handleStageChange(stage) {
    updateProject(id, { stage });
  }

  function handlePause() {
    updateProject(id, { isPaused: true, pausedReason: pauseReason.trim() });
    setPauseOpen(false);
    setPauseReason('');
  }

  function handleResume() {
    updateProject(id, { isPaused: false, pausedReason: '' });
  }

  function handleAddTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(id, newTask.trim());
    setNewTask('');
  }

  function handleDelete() {
    deleteProject(id);
    navigate('/');
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const { url } = await uploadProjectFile(id, file);
      await updateProject(id, { coverImage: url });
    } catch (err) {
      alert('Errore upload: ' + err.message);
    } finally {
      setCoverUploading(false);
      if (coverRef.current) coverRef.current.value = '';
    }
  }

  function handlePaymentCycle() {
    const order = PAYMENT_STATUSES;
    const next  = order[(order.indexOf(project.paymentStatus) + 1) % order.length];
    updateProject(id, { paymentStatus: next });
  }

  return (
    <>
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        {client ? (
          <Link
            to={`/clients/${client.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} /> {client.name}
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
        )}
      </div>

      {/* Stage stepper */}
      <div className="bg-white border border-border rounded-lg shadow-card px-3 sm:px-5 py-3 sm:py-4 mb-5">
        <StageStepper
          current={project.stage}
          onChange={handleStageChange}
          disabled={project.isPaused}
        />
        {project.isPaused && (
          <p className="text-xs text-[#7a6010] font-mono mt-2 flex items-center gap-1">
            <Pause size={11} />
            In pausa{project.pausedReason ? `: ${project.pausedReason}` : ''}
          </p>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-5">
        {/* ── Left column (main info) ── */}
        <div className="lg:col-span-2 flex flex-col gap-3 lg:gap-5">

          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border rounded-lg shadow-card overflow-hidden"
          >
            {project.coverImage ? (
              <div className="relative group">
                <img src={project.coverImage} alt={project.title} className="w-full h-48 sm:h-64 object-cover" />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer">
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    <Btn as="span" variant="secondary" size="sm" onClick={() => coverRef.current?.click()}>
                      <ImagePlus size={13} /> {coverUploading ? 'Caricamento…' : 'Cambia'}
                    </Btn>
                  </label>
                  <Btn variant="secondary" size="sm" onClick={() => updateProject(id, { coverImage: null })}>
                    <X size={13} /> Rimuovi
                  </Btn>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <div
                  onClick={() => coverRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 text-xs text-muted hover:text-ink hover:bg-paper transition-colors"
                >
                  <ImagePlus size={14} />
                  {coverUploading ? 'Caricamento…' : 'Aggiungi immagine copertina'}
                </div>
              </label>
            )}
          </motion.div>

          {/* Title card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    label={TYPE_LABELS[project.type] ?? project.type}
                    bg={TYPE_BG[project.type] ?? '#f3efe8'}
                    color={TYPE_TEXT[project.type] ?? '#6b6460'}
                  />
                  {client && (
                    <Link to={`/clients/${client.id}`} className="label-meta hover:text-burgundy transition-colors">
                      {client.name}
                      {client.brand && ` · ${client.brand}`}
                    </Link>
                  )}
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink leading-tight">
                  {project.title}
                </h1>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Btn variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <Edit2 size={13} /> <span className="hidden sm:inline">Modifica</span>
                </Btn>
                {project.isPaused ? (
                  <Btn variant="secondary" size="sm" onClick={handleResume}>
                    <Play size={13} /> <span className="hidden sm:inline">Riprendi</span>
                  </Btn>
                ) : (
                  <Btn variant="ghost" size="sm" onClick={() => setPauseOpen(true)}>
                    <Pause size={13} /> <span className="hidden sm:inline">Pausa</span>
                  </Btn>
                )}
                <Btn variant="danger" size="sm" onClick={() => setConfirmDel(true)}>
                  <Trash2 size={13} />
                </Btn>
              </div>
            </div>

            {project.description && (
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            )}
          </motion.div>

          {/* Tasks */}
          <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-ink">Checklist</h3>
              {tasks.length > 0 && (
                <span className="label-meta">
                  {doneCnt}/{tasks.length} completati
                </span>
              )}
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div className="h-1.5 bg-paper rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-burgundy rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCnt / tasks.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}

            {/* Task list */}
            <div className="flex flex-col gap-1 mb-4">
              <AnimatePresence>
                {tasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 group py-1"
                  >
                    <button
                      onClick={() => toggleTask(id, task.id)}
                      className={[
                        'w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                        task.done
                          ? 'bg-burgundy border-burgundy text-white'
                          : 'border-border hover:border-burgundy-muted',
                      ].join(' ')}
                      style={{ width: 18, height: 18 }}
                    >
                      {task.done && <Check size={11} />}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        task.done ? 'line-through text-subtle' : 'text-ink'
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(id, task.id)}
                      className="opacity-0 group-hover:opacity-100 text-subtle hover:text-burgundy transition-all"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add task */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Aggiungi task…"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="text-sm flex-1"
              />
              <Btn type="submit" variant="secondary" size="sm" disabled={!newTask.trim()}>
                <Plus size={14} />
              </Btn>
            </form>
          </div>

          {/* Next action + missing info */}
          <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            <div>
              <p className="label-meta mb-2 flex items-center gap-1">
                <MessageSquare size={11} /> Prossima azione
              </p>
              <EditableText
                value={project.nextAction ?? ''}
                placeholder="Definisci la prossima azione…"
                onSave={v => updateProject(id, { nextAction: v })}
              />
            </div>
            <div>
              <p className="label-meta mb-2 flex items-center gap-1">
                <Info size={11} /> Info mancanti
              </p>
              <EditableText
                value={project.missingInfo ?? ''}
                placeholder="Cosa manca dal cliente?"
                onSave={v => updateProject(id, { missingInfo: v })}
              />
            </div>
          </div>
        </div>

        {/* ── Right column (meta) ── */}
        <div className="flex flex-col gap-3 lg:gap-4">

          {/* Deadline */}
          <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5">
            <p className="label-meta mb-3 flex items-center gap-1">
              <Calendar size={11} /> Deadline
            </p>
            {project.deadline ? (
              <div>
                <p
                  className={`text-sm font-medium ${
                    overdue ? 'text-burgundy' : 'text-ink'
                  }`}
                >
                  {formatDate(project.deadline)}
                </p>
                {overdue ? (
                  <p className="text-xs text-burgundy flex items-center gap-1 mt-1">
                    <AlertCircle size={11} /> Scaduto
                  </p>
                ) : days !== null && days <= 7 ? (
                  <p className="text-xs text-[#7a6010] mt-1">tra {days} giorni</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-subtle">Non impostata</p>
            )}
            <input
              type="date"
              value={project.deadline ?? ''}
              onChange={e => updateProject(id, { deadline: e.target.value || null })}
              className="mt-3 text-sm"
            />
          </div>

          {/* Price + payment */}
          <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="label-meta flex items-center gap-1">
                <DollarSign size={11} /> Pagamento
              </p>
              <button onClick={handlePaymentCycle} title="Cambia stato pagamento">
                <Badge
                  label={PAYMENT_LABELS[project.paymentStatus]}
                  bg={PAYMENT_BG[project.paymentStatus]}
                  color={PAYMENT_TEXT[project.paymentStatus]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            </div>

            {project.type === 'retainer' ? (
              /* ── Retainer fields ── */
              <>
                <div>
                  <p className="text-[11px] text-subtle font-mono mb-1">Fee mensile (€/mese)</p>
                  <input
                    type="number"
                    placeholder="€ 0"
                    value={retainerFeeLocal}
                    onChange={e => setRetainerFeeLocal(e.target.value)}
                    onBlur={e => updateProject(id, { retainerFee: e.target.value ? Number(e.target.value) : null })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-subtle font-mono mb-1">Ricevuto (mese corrente)</p>
                  <input
                    type="number"
                    placeholder="€ 0"
                    value={paidLocal}
                    onChange={e => setPaidLocal(e.target.value)}
                    onBlur={e => updateProject(id, { paidAmount: e.target.value ? Number(e.target.value) : null })}
                    className="text-sm"
                  />
                </div>
                {project.retainerFee != null && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-[11px] text-subtle font-mono">MRR</p>
                    <p className="text-sm font-semibold font-mono text-[#5b21b6]">
                      {formatEur(project.retainerFee)}/mese
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* ── One-off project fields ── */
              <>
                <div>
                  <p className="text-[11px] text-subtle font-mono mb-1">Budget totale</p>
                  <input
                    type="number"
                    placeholder="€ 0"
                    value={priceLocal}
                    onChange={e => setPriceLocal(e.target.value)}
                    onBlur={e => updateProject(id, { price: e.target.value ? Number(e.target.value) : null })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-subtle font-mono mb-1">Ricevuto (acconto / totale)</p>
                  <input
                    type="number"
                    placeholder="€ 0"
                    value={paidLocal}
                    onChange={e => setPaidLocal(e.target.value)}
                    onBlur={e => updateProject(id, { paidAmount: e.target.value ? Number(e.target.value) : null })}
                    className="text-sm"
                  />
                </div>
                {project.price != null && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-[11px] text-subtle font-mono">Da incassare</p>
                    <p className={`text-sm font-semibold font-mono ${(project.price - (project.paidAmount ?? 0)) > 0 ? 'text-burgundy' : 'text-[#276749]'}`}>
                      {formatEur(project.price - (project.paidAmount ?? 0))}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Contratto inviato */}
            <button
              onClick={() => updateProject(id, { contractSent: !project.contractSent })}
              className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono transition-colors ${
                project.contractSent
                  ? 'bg-[#e6f4ea] border-[#276749] text-[#276749]'
                  : 'bg-paper border-border text-muted hover:border-ink/30'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${project.contractSent ? 'bg-[#276749] border-[#276749]' : 'border-border'}`}>
                {project.contractSent && <Check size={10} className="text-white" />}
              </span>
              Contratto inviato
            </button>
          </div>

          {/* Stage shortcut */}
          <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5">
            <p className="label-meta mb-3">Stage attuale</p>
            <Badge
              label={STAGE_LABELS[project.stage]}
              bg={STAGE_BG[project.stage]}
              color={STAGE_TEXT[project.stage]}
              className="text-sm"
            />
            <p className="text-xs text-subtle mt-2">
              Creato il {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Brief & Referenze ── */}
      <div className="mt-5">
        <BriefSection
          brief={project.brief ?? {}}
          projectId={id}
          onUpdate={(brief) => updateProject(id, { brief })}
        />
      </div>

      {/* ── Consegna ── */}
      <div className="mt-3">
        <DeliverySection
          files={project.files ?? []}
          projectId={id}
          onUpdate={(files) => updateProject(id, { files })}
        />
      </div>

      {/* ── Edit modal ── */}
      <ProjectForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        clients={clients}
        initialValues={project}
        onSave={(data) => { updateProject(id, data); setEditOpen(false); }}
      />

      {/* ── Pause modal ── */}
      <Modal open={pauseOpen} onClose={() => setPauseOpen(false)} title="Metti in pausa" width="max-w-sm">
        <Field label="Motivo (opzionale)" className="mb-4">
          <input
            type="text"
            placeholder="Es. In attesa di materiali, feedback, pagamento…"
            value={pauseReason}
            onChange={e => setPauseReason(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setPauseOpen(false)}>Annulla</Btn>
          <Btn variant="primary" onClick={handlePause}>Metti in pausa</Btn>
        </div>
      </Modal>

      {/* ── Delete confirm ── */}
      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Elimina progetto" width="max-w-sm">
        <p className="text-sm text-muted mb-6">
          Sei sicuro di voler eliminare <strong className="text-ink">"{project.title}"</strong>?
          L'azione è irreversibile.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setConfirmDel(false)}>Annulla</Btn>
          <Btn variant="danger" onClick={handleDelete}>Elimina</Btn>
        </div>
      </Modal>
    </>
  );
}

// ── Inline editable text ──────────────────────────────────────────────────────
function EditableText({ value, placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);

  function commit() {
    onSave(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        <textarea
          rows={3}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          className="text-sm resize-none"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="w-full text-left text-sm text-muted hover:text-ink transition-colors min-h-[2.5rem] block"
    >
      {value || <span className="text-subtle italic">{placeholder}</span>}
    </button>
  );
}
