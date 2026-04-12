import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Clock, Zap } from 'lucide-react';
import Panel from '../components/Panel';
import ProjectCard from '../components/ProjectCard';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import { useClients, useProjects } from '../hooks/useStore';
import { STAGES, STAGE_LABELS, STAGE_BG, STAGE_TEXT, PROJECT_TYPES, TYPE_LABELS } from '../lib/constants';
import { isOverdue, daysUntil } from '../lib/utils';
import ProjectForm from '../forms/ProjectForm';
import ClientForm from '../forms/ClientForm';

export default function Dashboard() {
  const { clients, addClient }   = useClients();
  const { projects, addProject } = useProjects();

  const [typeFilter, setTypeFilter]       = useState('all');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddClient,  setShowAddClient]  = useState(false);

  // ── Filtered projects ────────────────────────────────────────────────────
  const filtered = typeFilter === 'all'
    ? projects
    : projects.filter(p => p.type === typeFilter);

  const active = filtered.filter(p => p.stage !== 'completed');

  // ── Dashboard panels ──────────────────────────────────────────────────────
  const urgent = active.filter(p => {
    const days = daysUntil(p.deadline);
    return (isOverdue(p.deadline) || (days !== null && days <= 3));
  });

  const waiting = active.filter(p => p.stage === 'waiting');

  const withNextAction = active.filter(
    p => p.nextAction && p.nextAction.trim() && !p.isPaused
  );

  // ── Kanban columns ────────────────────────────────────────────────────────
  function projectsForStage(stage) {
    return filtered.filter(p => p.stage === stage && !p.isPaused);
  }

  const paused = filtered.filter(p => p.isPaused);

  function clientName(clientId) {
    return clients.find(c => c.id === clientId)?.name ?? '';
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

      {/* ── Type filter ── */}
      <div className="flex items-center gap-1 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-2 sm:px-3 py-1.5 text-xs font-mono rounded border transition-colors whitespace-nowrap ${
            typeFilter === 'all'
              ? 'bg-ink text-white border-ink'
              : 'bg-white text-muted border-border hover:border-ink/30'
          }`}
        >
          Tutti
        </button>
        {PROJECT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2 sm:px-3 py-1.5 text-xs font-mono rounded border transition-colors whitespace-nowrap ${
              typeFilter === t
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-muted border-border hover:border-ink/30'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── 3 Info panels ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Urgent */}
        <Panel
          title="Urgenti"
          count={urgent.length || undefined}
          action={<AlertCircle size={16} className="text-burgundy" />}
        >
          {urgent.length === 0 ? (
            <p className="text-xs text-subtle">Nessun progetto urgente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {urgent.map(p => (
                <ProjectCard key={p.id} project={p} clientName={clientName(p.clientId)} compact />
              ))}
            </div>
          )}
        </Panel>

        {/* Waiting on client */}
        <Panel
          title="In attesa del cliente"
          count={waiting.length || undefined}
          action={<Clock size={16} className="text-[#7a6010]" />}
        >
          {waiting.length === 0 ? (
            <p className="text-xs text-subtle">Nessun progetto in attesa.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {waiting.map(p => (
                <ProjectCard key={p.id} project={p} clientName={clientName(p.clientId)} compact />
              ))}
            </div>
          )}
        </Panel>

        {/* Next actions */}
        <Panel
          title="Prossime azioni"
          count={withNextAction.length || undefined}
          action={<Zap size={16} className="text-[#1a56db]" />}
        >
          {withNextAction.length === 0 ? (
            <p className="text-xs text-subtle">Nessuna azione definita.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {withNextAction.slice(0, 4).map(p => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block p-2 rounded border border-border bg-paper hover:border-burgundy-muted transition-colors"
                >
                  <p className="text-xs font-medium text-ink mb-0.5 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted line-clamp-2">→ {p.nextAction}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Kanban ── */}
      <div>
        <h2 className="font-display text-lg sm:text-xl font-semibold text-ink mb-4">Kanban</h2>

        {projects.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-10 text-center">
            <p className="text-sm text-muted mb-4">Nessun progetto ancora.</p>
            <Btn variant="primary" onClick={() => setShowAddProject(true)}>
              <Plus size={14} /> Aggiungi il primo progetto
            </Btn>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 sm:gap-4 min-w-max">
              {STAGES.map(stage => {
                const col = projectsForStage(stage);
                return (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-40 sm:w-52 shrink-0"
                  >
                    {/* Column header */}
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-t-md border border-b-0"
                      style={{
                        backgroundColor: STAGE_BG[stage],
                        borderColor: `${STAGE_TEXT[stage]}22`,
                      }}
                    >
                      <span
                        className="text-[11px] font-mono font-medium tracking-wide"
                        style={{ color: STAGE_TEXT[stage] }}
                      >
                        {STAGE_LABELS[stage]}
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: STAGE_TEXT[stage] }}
                      >
                        {col.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div
                      className="min-h-32 flex flex-col gap-2 p-2 border rounded-b-md"
                      style={{ borderColor: `${STAGE_TEXT[stage]}22`, borderTopColor: 'transparent' }}
                    >
                      {col.map(p => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          clientName={clientName(p.clientId)}
                          compact
                        />
                      ))}
                      {col.length === 0 && (
                        <p className="text-[11px] text-subtle text-center py-4 font-mono">—</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Paused column */}
              {paused.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-52 shrink-0"
                >
                  <div className="flex items-center justify-between px-3 py-2 rounded-t-md border border-b-0 bg-paper border-border">
                    <span className="text-[11px] font-mono font-medium tracking-wide text-muted">
                      In pausa
                    </span>
                    <span className="text-[11px] font-mono text-muted">{paused.length}</span>
                  </div>
                  <div className="min-h-32 flex flex-col gap-2 p-2 border border-border border-t-0 rounded-b-md">
                    {paused.map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        clientName={clientName(p.clientId)}
                        compact
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
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
        onSave={(data) => { addClient(data); setShowAddClient(false); }}
      />
    </>
  );
}
