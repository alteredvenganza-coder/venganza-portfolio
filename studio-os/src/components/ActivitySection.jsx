import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Activity,
  ArrowRightLeft, CheckCircle2, ListPlus, CreditCard, Pause, Play,
} from 'lucide-react';
import Btn from './Btn';

const ICONS = {
  stage_change:   ArrowRightLeft,
  task_added:     ListPlus,
  task_completed: CheckCircle2,
  payment_change: CreditCard,
  paused:         Pause,
  resumed:        Play,
};

const ICON_COLORS = {
  stage_change:   '#7bb3ff',
  task_added:     '#f5c563',
  task_completed: '#6dd49e',
  payment_change: '#c4a5ff',
  paused:         '#f5e0a0',
  resumed:        '#6dd49e',
};

function relativeTime(iso) {
  if (!iso) return '';
  const now  = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return 'adesso';
  if (mins < 60)  return `${mins} min fa`;
  if (hours < 24) return hours === 1 ? '1 ora fa' : `${hours} ore fa`;
  if (days === 1)  return 'ieri';
  if (days < 7)   return `${days} giorni fa`;
  if (days < 30)  return `${Math.floor(days / 7)} settimane fa`;
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const INITIAL_COUNT = 20;

export default function ActivitySection({ activity = [] }) {
  const [open, setOpen]     = useState(false);
  const [showAll, setShowAll] = useState(false);

  const sorted  = [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);
  const hasMore = sorted.length > INITIAL_COUNT;

  return (
    <div className="glass rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-paper transition-colors"
      >
        <div className="flex items-center gap-3">
          <Activity size={15} className="text-subtle" />
          <span className="font-display text-base font-semibold text-ink">Attivit&agrave;</span>
          {sorted.length > 0 && (
            <span className="text-[11px] font-mono text-subtle">
              {sorted.length} {sorted.length === 1 ? 'evento' : 'eventi'}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp size={16} className="text-subtle" />
          : <ChevronDown size={16} className="text-subtle" />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              {sorted.length === 0 ? (
                <p className="text-sm text-subtle italic py-3">
                  Nessuna attivit&agrave; registrata.
                </p>
              ) : (
                <div className="relative ml-3 border-l border-border">
                  {visible.map((entry) => {
                    const Icon  = ICONS[entry.type] ?? Activity;
                    const color = ICON_COLORS[entry.type] ?? '#b0acaa';

                    return (
                      <div key={entry.id} className="relative pl-5 sm:pl-6 pb-4 last:pb-0 min-w-0">
                        {/* dot on timeline */}
                        <div
                          className="absolute -left-[7px] top-[3px] w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${color}22`, border: `1.5px solid ${color}` }}
                        >
                          <Icon size={8} style={{ color }} />
                        </div>

                        <p className="text-xs sm:text-sm text-ink leading-snug break-words">{entry.text}</p>
                        <p className="text-[10px] sm:text-[11px] text-subtle font-mono mt-0.5">
                          {relativeTime(entry.timestamp)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasMore && !showAll && (
                <div className="mt-3 text-center">
                  <Btn variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                    Mostra tutto ({sorted.length})
                  </Btn>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
