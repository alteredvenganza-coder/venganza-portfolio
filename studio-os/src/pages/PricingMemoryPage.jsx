import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Filter, Sparkles, ArrowUpRight } from 'lucide-react';
import Panel from '../components/Panel';
import Badge from '../components/Badge';
import { useProjects, useClients } from '../hooks/useStore';
import {
  PROJECT_TYPES, TYPE_LABELS, TYPE_BG, TYPE_TEXT,
} from '../lib/constants';
import { formatEur, formatDate } from '../lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysBetween(a, b) {
  if (!a || !b) return null;
  const d = Math.round((new Date(b) - new Date(a)) / 86400000);
  return d > 0 ? d : null;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypeCard({ stat, active, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={`glass rounded-xl p-4 text-left transition-all ${
        active ? 'border-burgundy/60 ring-1 ring-burgundy/40' : 'hover:border-white/25'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: TYPE_BG[stat.type], color: TYPE_TEXT[stat.type] }}
        >
          {TYPE_LABELS[stat.type]}
        </span>
        <span className="label-meta">{stat.count} proj</span>
      </div>

      <p className="text-xl font-display font-bold text-ink mb-0.5">{formatEur(stat.avg)}</p>
      <p className="text-[11px] font-mono text-muted">
        {formatEur(stat.min)} – {formatEur(stat.max)}
      </p>

      {stat.avgDays != null && (
        <p className="text-[10px] font-mono text-subtle mt-1.5 flex items-center gap-1">
          <Clock size={10} /> ~{stat.avgDays}gg durata media
        </p>
      )}
      {stat.medianPrice !== stat.avg && (
        <p className="text-[10px] font-mono text-subtle flex items-center gap-1">
          <TrendingUp size={10} /> Mediana: {formatEur(stat.medianPrice)}
        </p>
      )}
    </motion.button>
  );
}

function HistoryRow({ project, clientName }) {
  const duration = daysBetween(project.createdAt, project.completedAt);
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 border border-white/8 hover:border-white/18 transition-colors group"
    >
      <div
        className="w-1.5 h-8 rounded-full shrink-0"
        style={{ background: TYPE_TEXT[project.type] }}
      />
      <div className="flex-1 min-w-0">
        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-medium text-ink hover:text-burgundy-muted transition-colors truncate block"
        >
          {project.title}
          <ArrowUpRight size={11} className="inline ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-subtle mt-0.5">
          {clientName && <span>{clientName}</span>}
          {duration && <span>· {duration}gg</span>}
          {project.completedAt && <span>· {formatDate(project.completedAt)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          label={TYPE_LABELS[project.type]}
          bg={TYPE_BG[project.type]}
          color={TYPE_TEXT[project.type]}
        />
        <span className="text-sm font-mono font-bold text-ink min-w-[60px] text-right">
          {formatEur(project.price)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingMemoryPage() {
  const { projects }         = useProjects();
  const { clients }          = useClients();
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Pricing history = completed/delivered/archived with a price, excl. retainers
  const history = useMemo(() =>
    projects.filter(p =>
      ['completed', 'delivered', 'archived'].includes(p.stage) &&
      p.price != null && p.price > 0 &&
      p.type !== 'retainer'
    ).sort((a, b) => {
      const da = a.completedAt ?? a.createdAt;
      const db_ = b.completedAt ?? b.createdAt;
      return new Date(db_) - new Date(da);
    }),
    [projects]
  );

  // Per-type stats
  const typeStats = useMemo(() =>
    PROJECT_TYPES
      .filter(t => t !== 'retainer')
      .map(type => {
        const tp = history.filter(p => p.type === type);
        if (tp.length === 0) return null;
        const prices   = tp.map(p => p.price);
        const avg      = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
        const durations = tp.map(p => daysBetween(p.createdAt, p.completedAt)).filter(Boolean);
        return {
          type,
          count:       tp.length,
          avg,
          min:         Math.min(...prices),
          max:         Math.max(...prices),
          medianPrice: median(prices),
          avgDays:     durations.length
            ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
            : null,
        };
      })
      .filter(Boolean),
    [history]
  );

  // Filtered list
  const filtered = useMemo(() =>
    history
      .filter(p => typeFilter   === 'all' || p.type     === typeFilter)
      .filter(p => clientFilter === 'all' || p.clientId === clientFilter),
    [history, typeFilter, clientFilter]
  );

  // Clients with history
  const clientsWithHistory = useMemo(() =>
    clients.filter(c => history.some(p => p.clientId === c.id)),
    [clients, history]
  );

  function clientName(clientId) {
    return clients.find(c => c.id === clientId)?.name ?? '';
  }

  const overallAvg = history.length
    ? Math.round(history.map(p => p.price).reduce((s, v) => s + v, 0) / history.length)
    : 0;

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-burgundy-muted" />
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Smart Pricing Memory
            </h1>
          </div>
          <p className="text-sm text-muted">
            {history.length === 0
              ? 'Completa i tuoi primi progetti per costruire lo storico prezzi.'
              : `${history.length} progetti completati · Media generale: ${formatEur(overallAvg)}`}
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        /* ── Empty state ── */
        <div className="glass rounded-xl p-12 text-center">
          <Sparkles size={32} className="text-burgundy-muted mx-auto mb-4 opacity-40" />
          <p className="text-base font-display font-semibold text-ink mb-2">
            Nessun dato ancora
          </p>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Quando un progetto viene completato (stage → Completed / Delivered),
            il prezzo e la durata vengono salvati automaticamente qui.
          </p>
        </div>
      ) : (
        <>
          {/* ── Type stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {typeStats.map(stat => (
              <TypeCard
                key={stat.type}
                stat={stat}
                active={typeFilter === stat.type}
                onClick={() => setTypeFilter(f => f === stat.type ? 'all' : stat.type)}
              />
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Filter size={14} />
              <span className="label-meta">Filtra</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="text-sm py-1.5 w-auto"
                style={{ width: 'auto' }}
              >
                <option value="all">Tutti i tipi</option>
                {PROJECT_TYPES.filter(t => t !== 'retainer').map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="text-sm py-1.5 w-auto"
                style={{ width: 'auto' }}
              >
                <option value="all">Tutti i clienti</option>
                {clientsWithHistory.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {(typeFilter !== 'all' || clientFilter !== 'all') && (
                <button
                  onClick={() => { setTypeFilter('all'); setClientFilter('all'); }}
                  className="text-xs text-muted hover:text-ink transition-colors font-mono px-2 py-1 rounded border border-white/10 hover:border-white/25"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ── History list ── */}
          <Panel title="Storico progetti" count={filtered.length}>
            {filtered.length === 0 ? (
              <p className="text-sm text-subtle py-2">Nessun risultato per i filtri selezionati.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(p => (
                  <HistoryRow
                    key={p.id}
                    project={p}
                    clientName={clientName(p.clientId)}
                  />
                ))}
              </div>
            )}
          </Panel>

          {/* ── Insight footer ── */}
          {filtered.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-4 px-1">
              {(() => {
                const prices = filtered.map(p => p.price);
                const avg    = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
                const durations = filtered
                  .map(p => daysBetween(p.createdAt, p.completedAt))
                  .filter(Boolean);
                const avgD = durations.length
                  ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
                  : null;
                return (
                  <>
                    <p className="text-xs font-mono text-muted">
                      Media selezione: <span className="text-ink font-semibold">{formatEur(avg)}</span>
                    </p>
                    <p className="text-xs font-mono text-muted">
                      Mediana: <span className="text-ink font-semibold">{formatEur(median(prices))}</span>
                    </p>
                    {avgD && (
                      <p className="text-xs font-mono text-muted">
                        Durata media: <span className="text-ink font-semibold">{avgD}gg</span>
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}
    </>
  );
}
