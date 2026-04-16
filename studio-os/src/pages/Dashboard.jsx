import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Clock, Zap, CalendarClock } from 'lucide-react';
import {
  DndContext, PointerSensor, useSensor, useSensors,
  DragOverlay, useDraggable, useDroppable,
} from '@dnd-kit/core';
import Panel from '../components/Panel';
import ProjectCard from '../components/ProjectCard';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import { useClients, useProjects, useGoals } from '../hooks/useStore';
import { STAGES, STAGE_LABELS, STAGE_BG, STAGE_TEXT, PROJECT_TYPES, TYPE_LABELS } from '../lib/constants';
import { isOverdue, daysUntil, formatEur, formatDate } from '../lib/utils';

import ProjectForm from '../forms/ProjectForm';
import ClientForm from '../forms/ClientForm';

// ── Draggable card wrapper ─────────────────────────────────────────────────────
function DraggableCard({ project, clientName }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: project.id,
    data: { project },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.35 : 1, cursor: 'grab', touchAction: 'none' }}
    >
      <ProjectCard project={project} clientName={clientName} compact />
    </div>
  );
}

// ── Droppable column ───────────────────────────────────────────────────────────
function DroppableColumn({ stage, projects, clientName }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className="min-h-32 flex flex-col gap-2 p-2 border rounded-b-md transition-colors"
      style={{
        borderColor: `${STAGE_TEXT[stage]}44`,
        borderTopColor: 'transparent',
        background: isOver ? 'rgba(123,31,36,0.25)' : 'rgba(255,255,255,0.03)',
      }}
    >
      {projects.map(p => (
        <DraggableCard key={p.id} project={p} clientName={clientName(p.clientId)} />
      ))}
      {projects.length === 0 && (
        <p className="text-[11px] text-subtle text-center py-4 font-mono">—</p>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { clients, addClient }              = useClients();
  const { projects, addProject, updateProject } = useProjects();
  const { goals }                           = useGoals();

  const [typeFilter, setTypeFilter]         = useState('all');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddClient,  setShowAddClient]  = useState(false);
  const [activeProject,  setActiveProject]  = useState(null);

  // ── Finance calculations ───────────────────────────────────────────────────
  const activeProjects  = projects.filter(p => p.stage !== 'completed' && p.type !== 'retainer' && p.type !== 'premade');
  const incassato       = activeProjects.reduce((s, p) => s + (p.paidAmount ?? 0), 0);
  const fatturato       = activeProjects.reduce((s, p) => s + (p.price ?? 0), 0);
  const pipeline        = projects.filter(p => ['lead','onboarding'].includes(p.stage) && p.type !== 'retainer' && p.type !== 'premade').reduce((s, p) => s + (p.price ?? 0), 0);
  const daIncassare     = activeProjects.filter(p => p.paymentStatus !== 'paid').reduce((s, p) => s + Math.max(0, (p.price ?? 0) - (p.paidAmount ?? 0)), 0);
  const mrr             = projects.filter(p => p.type === 'retainer' && p.stage !== 'completed').reduce((s, p) => s + (p.retainerFee ?? 0), 0);
  const premadeRev      = projects.filter(p => p.type === 'premade').reduce((s, p) => s + ((p.price ?? 0) * (p.salesCount ?? 0)), 0);
  const goalPct         = goals.monthly > 0 ? Math.min(100, Math.round(((incassato + mrr + premadeRev) / goals.monthly) * 100)) : 0;
  const mancaAlGoal     = Math.max(0, goals.monthly - incassato - mrr - premadeRev);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filtered = typeFilter === 'all'
    ? projects
    : projects.filter(p => p.type === typeFilter);

  const active = filtered.filter(p => p.stage !== 'completed');

  const urgent = active.filter(p => {
    const days = daysUntil(p.deadline);
    return isOverdue(p.deadline) || (days !== null && days <= 3);
  });

  // ── Deadline alerts ─────────────────────────────────────────────────────────
  const deadlineAlerts = active
    .filter(p => p.deadline)
    .map(p => {
      const days = daysUntil(p.deadline);
      const overdue = isOverdue(p.deadline);
      let severity = null;
      if (overdue) severity = 'overdue';
      else if (days !== null && days <= 3) severity = 'urgent';
      else if (days !== null && days <= 7) severity = 'warning';
      return severity ? { ...p, days, overdue, severity } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.days ?? -Infinity) - (b.days ?? -Infinity));

  const overdue         = active.filter(p => p.deadline && isOverdue(p.deadline) && !['completed','delivered','archived'].includes(p.stage));
  const waiting         = active.filter(p => p.stage === 'waiting');
  const withNextAction  = active.filter(p => p.nextAction?.trim() && !p.isPaused);

  function projectsForStage(stage) {
    return filtered.filter(p => p.stage === stage && !p.isPaused);
  }
  const paused = filtered.filter(p => p.isPaused);

  function clientName(clientId) {
    return clients.find(c => c.id === clientId)?.name ?? '';
  }

  function handleDragStart({ active: a }) {
    setActiveProject(projects.find(p => p.id === a.id) ?? null);
  }

  function handleDragEnd({ active: a, over }) {
    setActiveProject(null);
    if (!over) return;
    const newStage = over.id;
    if (STAGES.includes(newStage) && a.id) {
      updateProject(a.id, { stage: newStage, isPaused: false });
    }
    if (over.id === '__paused__') {
      updateProject(a.id, { isPaused: true });
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {active.length} {active.length === 1 ? 'progetto attivo' : 'progetti attivi'}
            {clients.length > 0 && ` · ${clients.length} clienti`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Btn variant="secondary" size="sm" onClick={() => setShowAddClient(true)}>
            <Plus size={14} /> <span className="hidden sm:inline">Cliente</span>
          </Btn>
          <Btn variant="primary" size="sm" onClick={() => setShowAddProject(true)}>
            <Plus size={14} /> <span className="hidden sm:inline">Progetto</span>
          </Btn>
        </div>
      </div>

      {/* ── Deadline alerts ── */}
      {deadlineAlerts.length > 0 && (
        <div className="glass rounded-lg shadow-card p-4 sm:p-5 mb-6 sm:mb-8 border border-burgundy/30">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={18} className="text-burgundy" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Progetti in scadenza
            </h2>
            <Badge
              label={`${deadlineAlerts.length}`}
              bg="rgba(123,31,36,0.25)"
              color="#f5a0a3"
            />
          </div>

          <div className="flex flex-col gap-2">
            {deadlineAlerts.map(p => {
              const severityConfig = {
                overdue: {
                  bg:    'rgba(180,50,50,0.18)',
                  text:  '#f5a0a3',
                  label: `Scaduto da ${Math.abs(p.days)} ${Math.abs(p.days) === 1 ? 'giorno' : 'giorni'}`,
                },
                urgent: {
                  bg:    'rgba(180,50,50,0.18)',
                  text:  '#f5a0a3',
                  label: p.days === 0 ? 'Scade oggi' : `${p.days} ${p.days === 1 ? 'giorno' : 'giorni'} rimasti`,
                },
                warning: {
                  bg:    'rgba(194,160,40,0.18)',
                  text:  '#f5e0a0',
                  label: `${p.days} giorni rimasti`,
                },
              };
              const cfg = severityConfig[p.severity];

              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-md border border-white/10 bg-white/5 hover:border-burgundy-muted transition-colors group"
                >
                  {p.severity === 'overdue' && (
                    <AlertCircle size={16} className="shrink-0" style={{ color: cfg.text }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate group-hover:text-burgundy-muted transition-colors">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {clientName(p.clientId) || 'Nessun cliente'} &middot; {formatDate(p.deadline)}
                    </p>
                  </div>
                  <Badge label={cfg.label} bg={cfg.bg} color={cfg.text} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Finance widget ── */}
      <div className="glass rounded-lg shadow-card p-4 sm:p-5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <p className="label-meta">Obiettivo mensile — {new Date().toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</p>
          <p className="text-xs font-mono text-subtle">{formatEur(incassato + mrr)} / {formatEur(goals.monthly)}</p>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full mb-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: goalPct >= 100 ? '#276749' : goalPct >= 60 ? '#7a6010' : '#7b1f24' }}
            initial={{ width: 0 }}
            animate={{ width: `${goalPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-[11px] font-mono text-subtle mb-4">
          {goalPct >= 100 ? '🎯 Obiettivo raggiunto!' : `Mancano ${formatEur(mancaAlGoal)} al goal (${formatEur(goals.monthly)})`}
        </p>

        {/* Stat boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white/8 rounded-lg p-3 border border-white/8">
            <p className="label-meta mb-1">Incassato</p>
            <p className="text-base font-display font-semibold text-ink">{formatEur(incassato)}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3 border border-white/8">
            <p className="label-meta mb-1">Fatturato attivo</p>
            <p className="text-base font-display font-semibold text-ink">{formatEur(fatturato)}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3 border border-white/8">
            <p className="label-meta mb-1">Pipeline totale</p>
            <p className="text-base font-display font-semibold text-ink">{formatEur(pipeline)}</p>
          </div>
          <div className="bg-white/8 rounded-lg p-3 border border-white/8">
            <p className="label-meta mb-1">Da incassare</p>
            <p className={`text-base font-display font-semibold ${daIncassare > 0 ? 'text-burgundy' : 'text-ink'}`}>
              {formatEur(daIncassare)}
            </p>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/20 rounded-lg p-3">
            <p className="label-meta mb-1" style={{ color: '#a78bfa' }}>MRR Retainer</p>
            <p className="text-base font-display font-semibold" style={{ color: '#a78bfa' }}>
              {formatEur(mrr)}<span className="text-xs font-mono font-normal opacity-60">/mese</span>
            </p>
          </div>
          <div className="bg-orange-950/40 border border-orange-500/20 rounded-lg p-3">
            <p className="label-meta mb-1" style={{ color: '#fb923c' }}>Premade venduti</p>
            <p className="text-base font-display font-semibold" style={{ color: '#fb923c' }}>
              {formatEur(premadeRev)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Type filter ── */}
      <div className="flex items-center gap-1 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-2 sm:py-1.5 text-xs font-mono rounded border transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 ${
            typeFilter === 'all'
              ? 'bg-burgundy text-white border-burgundy'
              : 'bg-white/8 text-muted border-white/15 hover:border-white/30 hover:text-ink'
          }`}
        >
          Tutti
        </button>
        {PROJECT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-2 sm:py-1.5 text-xs font-mono rounded border transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 ${
              typeFilter === t
                ? 'bg-burgundy text-white border-burgundy'
                : 'bg-white/8 text-muted border-white/15 hover:border-white/30 hover:text-ink'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="glass rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(180,50,50,0.18)' }}>
            <AlertCircle size={18} className="text-burgundy" />
          </div>
          <div>
            <p className="label-meta mb-0.5">Da incassare</p>
            <p className={`text-lg font-display font-semibold ${daIncassare > 0 ? 'text-burgundy' : 'text-ink'}`}>
              {formatEur(daIncassare)}
            </p>
          </div>
        </div>

        <div className="glass rounded-lg p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(194,130,40,0.18)' }}>
            <CalendarClock size={18} style={{ color: '#f5c563' }} />
          </div>
          <div>
            <p className="label-meta mb-0.5">Progetti in ritardo</p>
            <p className={`text-lg font-display font-semibold ${overdue.length > 0 ? 'text-[#f5c563]' : 'text-ink'}`}>
              {overdue.length}
            </p>
          </div>
        </div>

        <div className="glass rounded-lg p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(56,120,220,0.18)' }}>
            <Zap size={18} style={{ color: '#7bb3ff' }} />
          </div>
          <div>
            <p className="label-meta mb-0.5">Azioni pendenti</p>
            <p className="text-lg font-display font-semibold text-ink">{withNextAction.length}</p>
          </div>
        </div>
      </div>

      {/* ── Info panels ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Panel title="Urgenti" count={urgent.length || undefined} action={<AlertCircle size={16} className="text-burgundy" />}>
          {urgent.length === 0 ? (
            <p className="text-xs text-subtle">Nessun progetto urgente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {urgent.map(p => <ProjectCard key={p.id} project={p} clientName={clientName(p.clientId)} compact />)}
            </div>
          )}
        </Panel>

        <Panel title="In ritardo" count={overdue.length || undefined} action={<CalendarClock size={16} style={{ color: '#f5c563' }} />}>
          {overdue.length === 0 ? (
            <p className="text-xs text-subtle">Nessun progetto in ritardo.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {overdue.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded border border-white/10 bg-white/5 hover:border-burgundy-muted transition-colors">
                  <p className="text-xs font-medium text-ink mb-0.5 line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-muted">
                    {clientName(p.clientId) && <span className="text-subtle">{clientName(p.clientId)} · </span>}
                    Scadenza: {formatDate(p.deadline)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="In attesa del cliente" count={waiting.length || undefined} action={<Clock size={16} className="text-[#7a6010]" />}>
          {waiting.length === 0 ? (
            <p className="text-xs text-subtle">Nessun progetto in attesa.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {waiting.map(p => <ProjectCard key={p.id} project={p} clientName={clientName(p.clientId)} compact />)}
            </div>
          )}
        </Panel>

        <Panel title="Prossime azioni" count={withNextAction.length || undefined} action={<Zap size={16} className="text-[#1a56db]" />}>
          {withNextAction.length === 0 ? (
            <p className="text-xs text-subtle">Nessuna azione definita.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {withNextAction.slice(0, 5).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded border border-white/10 bg-white/5 hover:border-burgundy-muted transition-colors">
                  <p className="text-xs font-medium text-ink mb-0.5 line-clamp-1">{p.title}</p>
                  {clientName(p.clientId) && <p className="text-[11px] text-subtle mb-0.5">{clientName(p.clientId)}</p>}
                  <p className="text-xs text-muted line-clamp-2">{p.nextAction}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Kanban con drag & drop ── */}
      <div>
        <h2 className="font-display text-lg sm:text-xl font-semibold text-ink mb-1">Kanban</h2>
        <p className="text-xs text-subtle mb-4 font-mono">Trascina le card per cambiare stage</p>

        {projects.length === 0 ? (
          <div className="glass rounded-lg p-10 text-center">
            <p className="text-sm text-muted mb-4">Nessun progetto ancora.</p>
            <Btn variant="primary" onClick={() => setShowAddProject(true)}>
              <Plus size={14} /> Aggiungi il primo progetto
            </Btn>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {STAGES.map(stage => {
                  const col = projectsForStage(stage);
                  return (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-52 sm:w-72 shrink-0"
                    >
                      {/* Column header */}
                      <div
                        className="flex items-center justify-between px-3 py-2 rounded-t-md border border-b-0"
                        style={{ backgroundColor: `${STAGE_TEXT[stage]}22`, borderColor: `${STAGE_TEXT[stage]}44` }}
                      >
                        <span className="text-[11px] font-mono font-medium tracking-wide" style={{ color: STAGE_TEXT[stage] }}>
                          {STAGE_LABELS[stage]}
                        </span>
                        <span className="text-[11px] font-mono" style={{ color: STAGE_TEXT[stage] }}>
                          {col.length}
                        </span>
                      </div>
                      <DroppableColumn stage={stage} projects={col} clientName={clientName} />
                    </motion.div>
                  );
                })}

                {/* Paused column */}
                {paused.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-40 sm:w-52 shrink-0"
                  >
                    <div className="flex items-center justify-between px-3 py-2 rounded-t-md border border-b-0 bg-white/8 border-white/15">
                      <span className="text-[11px] font-mono font-medium tracking-wide text-muted">In pausa</span>
                      <span className="text-[11px] font-mono text-muted">{paused.length}</span>
                    </div>
                    <div
                      className="min-h-32 flex flex-col gap-2 p-2 border border-white/15 border-t-0 rounded-b-md"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      {paused.map(p => (
                        <DraggableCard key={p.id} project={p} clientName={clientName(p.clientId)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Drag overlay — ghost card while dragging */}
            <DragOverlay>
              {activeProject && (
                <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
                  <ProjectCard project={activeProject} clientName={clientName(activeProject.clientId)} compact />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* ── Modals ── */}
      <ProjectForm
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        clients={clients}
        onSave={(data) => { addProject(data); setShowAddProject(false); }}
      />
      <ClientForm
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onSave={async (clientData, projectData) => {
          const client = await addClient(clientData);
          if (projectData && client?.id) addProject({ ...projectData, clientId: client.id });
          setShowAddClient(false);
        }}
      />
    </>
  );
}
