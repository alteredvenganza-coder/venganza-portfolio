import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, TrendingUp, Edit3, Check, X, Info } from 'lucide-react';
import { useProjects } from '../hooks/useStore';
import { useGoals } from '../hooks/useStore';
import { formatEur } from '../lib/utils';
import { PROJECT_TYPES, TYPE_LABELS, TYPE_TEXT } from '../lib/constants';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inMonth(isoDate, year, month) {
  const d = new Date(isoDate);
  return d.getFullYear() === year && d.getMonth() === month;
}
function inYear(isoDate, year) {
  return new Date(isoDate).getFullYear() === year;
}

function ProgressBar({ pct }) {
  const color =
    pct >= 100 ? '#4ade80' :
    pct >= 70  ? '#facc15' :
    pct >= 40  ? '#c9888b' :
                 '#7b1f24';
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Inline editable goal value ────────────────────────────────────────────────

function EditableGoal({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');

  function start() { setDraft(String(value)); setEditing(true); }
  function save() {
    const v = parseFloat(draft.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(v) && v > 0) onSave(v);
    setEditing(false);
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-28 text-xs py-0.5 px-2"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button onClick={save}      className="text-green-400 hover:text-green-300 transition-colors"><Check size={13} /></button>
        <button onClick={() => setEditing(false)} className="text-subtle hover:text-ink transition-colors"><X size={13} /></button>
      </span>
    );
  }

  return (
    <button
      onClick={start}
      className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors group"
    >
      {formatEur(value)}
      <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ── Single goal card (monthly or annual) ─────────────────────────────────────

function GoalCard({ icon: Icon, period, label, incassato, fatturato, pipeline, goal, onSaveGoal }) {
  const pct      = goal > 0 ? Math.round((incassato / goal) * 100) : 0;
  const mancano  = Math.max(0, goal - incassato);
  const exceeded = incassato >= goal && goal > 0;

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-burgundy/20 flex items-center justify-center">
            <Icon size={17} className="text-burgundy-muted" />
          </div>
          <div>
            <p className="label-meta">{period}</p>
            <p className="text-sm font-semibold text-ink">{label}</p>
          </div>
        </div>
        <span className={`text-lg font-display font-bold tabular-nums ${
          exceeded ? 'text-green-400' : pct >= 70 ? 'text-yellow-300' : 'text-ink'
        }`}>
          {pct}%
        </span>
      </div>

      {/* Amounts */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xl font-display font-bold text-ink">{formatEur(incassato)}</span>
          <span className="text-xs text-muted">
            obiettivo: <EditableGoal value={goal} onSave={onSaveGoal} />
          </span>
        </div>
        <ProgressBar pct={pct} />
        <p className="text-[11px] font-mono text-subtle mt-1.5">
          {exceeded
            ? `🎯 Obiettivo superato di ${formatEur(incassato - goal)}`
            : `Mancano ${formatEur(mancano)} all'obiettivo`}
        </p>
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
        <div>
          <p className="label-meta mb-1">Incassato</p>
          <p className="text-sm font-semibold text-ink">{formatEur(incassato)}</p>
        </div>
        <div>
          <p className="label-meta mb-1">Fatturato</p>
          <p className="text-sm font-semibold text-ink">{formatEur(fatturato)}</p>
        </div>
        <div>
          <p className="label-meta mb-1">Pipeline</p>
          <p className="text-sm font-semibold text-ink">{formatEur(pipeline)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GoalsSection() {
  const { projects }          = useProjects();
  const { goals, updateGoals } = useGoals();

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthsElapsed = currentMonth + 1;
  const monthLabel   = now.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  // ── Retainer MRR (always monthly regardless of creation date) ──────────────
  const activeRetainers = projects.filter(
    p => p.type === 'retainer' && !['completed', 'archived', 'delivered'].includes(p.stage)
  );
  const mrr = activeRetainers.reduce((s, p) => s + (p.retainerFee ?? 0), 0);

  // ── Monthly ────────────────────────────────────────────────────────────────
  const monthProjects = projects.filter(p => inMonth(p.createdAt, currentYear, currentMonth));

  const incassatoMese =
    monthProjects.filter(p => p.type !== 'retainer' && p.type !== 'premade')
      .reduce((s, p) => s + (p.paidAmount ?? 0), 0) +
    monthProjects.filter(p => p.type === 'premade')
      .reduce((s, p) => s + ((p.price ?? 0) * (p.salesCount ?? 0)), 0) +
    mrr;

  const fatturatoMese =
    monthProjects.filter(p => p.type !== 'retainer')
      .reduce((s, p) => s + (p.price ?? 0), 0) + mrr;

  const pipelineMese = monthProjects
    .filter(p => ['lead', 'onboarding'].includes(p.stage))
    .reduce((s, p) => s + (p.price ?? 0), 0);

  // ── Yearly ─────────────────────────────────────────────────────────────────
  const yearProjects = projects.filter(p => inYear(p.createdAt, currentYear));

  const incassatoAnno =
    yearProjects.filter(p => p.type !== 'retainer' && p.type !== 'premade')
      .reduce((s, p) => s + (p.paidAmount ?? 0), 0) +
    yearProjects.filter(p => p.type === 'premade')
      .reduce((s, p) => s + ((p.price ?? 0) * (p.salesCount ?? 0)), 0) +
    mrr * monthsElapsed;

  const fatturatoAnno =
    yearProjects.filter(p => p.type !== 'retainer')
      .reduce((s, p) => s + (p.price ?? 0), 0) + mrr * monthsElapsed;

  const pipelineAnno = yearProjects
    .filter(p => ['lead', 'onboarding'].includes(p.stage))
    .reduce((s, p) => s + (p.price ?? 0), 0);

  // ── Per-type breakdown (this year) ────────────────────────────────────────
  const [editingType, setEditingType] = useState(null);
  const [typeDraft,   setTypeDraft]   = useState('');

  const typeRows = PROJECT_TYPES
    .filter(t => t !== 'retainer')
    .map(type => {
      const tp = yearProjects.filter(p => p.type === type);
      const incassato = type === 'premade'
        ? tp.reduce((s, p) => s + ((p.price ?? 0) * (p.salesCount ?? 0)), 0)
        : tp.reduce((s, p) => s + (p.paidAmount ?? 0), 0);
      const fatturato = tp.reduce((s, p) => s + (p.price ?? 0), 0);
      const typeGoal  = goals.byType?.[type] ?? 0;
      return { type, incassato, fatturato, typeGoal, count: tp.length };
    })
    .filter(r => r.count > 0 || r.typeGoal > 0);

  function saveTypeGoal(type, raw) {
    const v = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(v)) updateGoals({ byType: { ...goals.byType, [type]: v > 0 ? v : undefined } });
    setEditingType(null);
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Monthly goal card ── */}
      <GoalCard
        icon={Target}
        period={monthLabel}
        label="Obiettivo mensile"
        incassato={incassatoMese}
        fatturato={fatturatoMese}
        pipeline={pipelineMese}
        goal={goals.monthly}
        onSaveGoal={v => updateGoals({ monthly: v })}
      />

      {/* ── Annual goal card ── */}
      <GoalCard
        icon={Award}
        period={String(currentYear)}
        label="Obiettivo annuale"
        incassato={incassatoAnno}
        fatturato={fatturatoAnno}
        pipeline={pipelineAnno}
        goal={goals.yearly}
        onSaveGoal={v => updateGoals({ yearly: v })}
      />

      {/* ── MRR badge ── */}
      {mrr > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-950/40 border border-purple-500/20">
          <TrendingUp size={15} className="text-purple-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-purple-300">MRR incluso nei calcoli</p>
            <p className="text-[11px] text-purple-400/70 font-mono">
              {formatEur(mrr)}/mese · {activeRetainers.length} retainer attivi
            </p>
          </div>
        </div>
      )}

      {/* ── Per-type breakdown ── */}
      <div>
        <p className="label-meta mb-3">Breakdown per tipo — {currentYear}</p>
        {typeRows.length === 0 ? (
          <p className="text-xs text-subtle">Nessun progetto creato quest'anno.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {typeRows.map(({ type, incassato, fatturato, typeGoal, count }) => {
              const pct = typeGoal > 0 ? Math.min(100, Math.round((incassato / typeGoal) * 100)) : null;
              const isEditing = editingType === type;

              return (
                <div key={type} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/8 group">
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{ background: TYPE_TEXT[type] }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-ink">{TYPE_LABELS[type]}</span>
                      <span className="text-[10px] text-subtle font-mono">{count} progett{count === 1 ? 'o' : 'i'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                      <span className="text-ink">{formatEur(incassato)}</span>
                      {fatturato > incassato && (
                        <span className="text-subtle">/ {formatEur(fatturato)} fatt.</span>
                      )}
                      {pct !== null && (
                        <span className={pct >= 100 ? 'text-green-400' : 'text-burgundy-muted'}>
                          ({pct}%)
                        </span>
                      )}
                    </div>
                    {typeGoal > 0 && pct !== null && (
                      <div className="mt-1.5">
                        <ProgressBar pct={pct} />
                      </div>
                    )}
                  </div>

                  {/* Inline edit for type goal */}
                  <div className="shrink-0 min-w-[80px] text-right">
                    {isEditing ? (
                      <span className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          value={typeDraft}
                          onChange={e => setTypeDraft(e.target.value)}
                          className="w-20 text-xs py-0.5 px-2"
                          placeholder="Goal €"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveTypeGoal(type, typeDraft);
                            if (e.key === 'Escape') setEditingType(null);
                          }}
                        />
                        <button onClick={() => saveTypeGoal(type, typeDraft)} className="text-green-400 hover:text-green-300 transition-colors">
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingType(null)} className="text-subtle hover:text-ink transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => { setTypeDraft(typeGoal ? String(typeGoal) : ''); setEditingType(type); }}
                        className="text-[10px] font-mono text-subtle hover:text-ink opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 ml-auto"
                      >
                        <Edit3 size={10} />
                        {typeGoal ? formatEur(typeGoal) : 'Obiettivo'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Nota metodologica ── */}
      <div className="flex items-start gap-2 text-[11px] text-subtle font-mono bg-white/3 rounded-lg px-3 py-2.5 border border-white/8">
        <Info size={12} className="shrink-0 mt-0.5" />
        <span>
          I dati si basano sulla data di creazione del progetto. MRR annuale = {formatEur(mrr)} × {monthsElapsed} mesi trascorsi.
          Clicca su un obiettivo per modificarlo.
        </span>
      </div>
    </div>
  );
}
