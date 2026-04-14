import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useProjects } from '../hooks/useStore';
import { formatEur } from '../lib/utils';

function daysBetween(a, b) {
  if (!a || !b) return null;
  const d = Math.round((new Date(b) - new Date(a)) / 86400000);
  return d > 0 ? d : null;
}

export default function PricingSuggestion({ type, clientId, onApply }) {
  const { projects } = useProjects();

  // All completed/delivered/archived projects of the same type with a price
  const pool = useMemo(() =>
    projects.filter(p =>
      p.type === type &&
      ['completed', 'delivered', 'archived'].includes(p.stage) &&
      p.price != null && p.price > 0
    ),
    [projects, type]
  );

  // Same client, same type
  const clientPool = useMemo(() =>
    clientId ? pool.filter(p => p.clientId === clientId) : [],
    [pool, clientId]
  );

  if (pool.length === 0) return null;

  const prices   = pool.map(p => p.price);
  const avg      = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
  const min      = Math.min(...prices);
  const max      = Math.max(...prices);

  const durations = pool
    .map(p => daysBetween(p.createdAt, p.completedAt))
    .filter(Boolean);
  const avgDays = durations.length
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : null;

  const clientAvg = clientPool.length >= 2
    ? Math.round(clientPool.map(p => p.price).reduce((s, v) => s + v, 0) / clientPool.length)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-burgundy/25 bg-burgundy/8 p-3.5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles size={13} className="text-burgundy-muted shrink-0" />
        <p className="text-xs font-semibold text-ink">Smart Pricing</p>
        <span className="label-meta ml-1">
          {pool.length} progett{pool.length === 1 ? 'o' : 'i'} simili
        </span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3">
        <div>
          <span className="text-[10px] text-subtle uppercase tracking-wider font-mono block mb-0.5">Media</span>
          <span className="text-base font-display font-bold text-ink">{formatEur(avg)}</span>
        </div>
        <div>
          <span className="text-[10px] text-subtle uppercase tracking-wider font-mono block mb-0.5">Range</span>
          <span className="text-sm font-mono text-muted">{formatEur(min)} – {formatEur(max)}</span>
        </div>
        {avgDays != null && (
          <div>
            <span className="text-[10px] text-subtle uppercase tracking-wider font-mono block mb-0.5">Durata media</span>
            <span className="text-sm font-mono text-muted flex items-center gap-0.5">
              <Clock size={11} /> {avgDays}gg
            </span>
          </div>
        )}
        {clientAvg != null && (
          <div>
            <span className="text-[10px] text-subtle uppercase tracking-wider font-mono block mb-0.5">Questo cliente</span>
            <span className="text-sm font-mono text-muted flex items-center gap-0.5">
              <TrendingUp size={11} /> {formatEur(clientAvg)}
            </span>
          </div>
        )}
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={() => onApply(avg)}
        className="text-xs font-semibold text-burgundy-muted hover:text-ink transition-colors border border-burgundy/25 hover:border-burgundy-muted bg-burgundy/10 hover:bg-burgundy/15 px-3 py-1.5 rounded"
      >
        Usa {formatEur(avg)} →
      </button>
    </motion.div>
  );
}
