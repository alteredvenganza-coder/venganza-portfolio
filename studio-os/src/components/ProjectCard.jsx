import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pause, AlertCircle } from 'lucide-react';
import Badge from './Badge';
import {
  STAGE_BG, STAGE_TEXT, STAGE_LABELS,
  TYPE_BG, TYPE_TEXT, TYPE_LABELS,
  PAYMENT_BG, PAYMENT_TEXT, PAYMENT_LABELS,
} from '../lib/constants';
import { formatDate, isOverdue } from '../lib/utils';

function useCountdown(deadline) {
  const [diff, setDiff] = useState(() => deadline ? new Date(deadline) - Date.now() : null);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline);
    // set to end of day
    target.setHours(23, 59, 59, 999);
    const tick = () => setDiff(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return diff;
}

function formatCountdown(ms) {
  if (ms <= 0) return null; // overdue
  const totalSec = Math.floor(ms / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  if (days > 30)  return `${days}g`;
  if (days >= 1)  return `${days}g ${String(hours).padStart(2,'0')}h`;
  if (hours >= 1) return `${hours}h ${String(mins).padStart(2,'0')}m`;
  return `${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`;
}

function CountdownPill({ deadline }) {
  const diff = useCountdown(deadline);
  if (!deadline) return null;

  const overdue = diff !== null && diff <= 0;
  const label   = overdue ? 'Scaduto' : formatCountdown(diff ?? 0);

  const days = diff ? Math.floor(diff / 86400000) : 0;
  let bg, color;
  if (overdue)         { bg = 'rgba(123,31,36,0.4)';  color = '#f5b8b8'; }
  else if (days <= 3)  { bg = 'rgba(192,57,43,0.3)';  color = '#f5b8b8'; }
  else if (days <= 7)  { bg = 'rgba(122,96,16,0.3)';  color = '#f5e0a0'; }
  else if (days <= 30) { bg = 'rgba(255,255,255,0.08)'; color = '#b0acaa'; }
  else                 { bg = 'rgba(255,255,255,0.06)'; color = '#8c8884'; }

  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tabular-nums border border-white/10"
      style={{ background: bg, color }}
    >
      {overdue && <AlertCircle size={9} />}
      {label}
    </span>
  );
}

export default function ProjectCard({ project, clientName, compact = false }) {
  const diff   = useCountdown(project.deadline);
  const overdue = diff !== null && diff <= 0;
  const urgent  = diff !== null && diff > 0 && diff < 3 * 86400000;

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Link
        to={`/projects/${project.id}`}
        className={[
          'block glass rounded-lg shadow-card hover:border-burgundy-muted transition-colors overflow-hidden',
          project.isPaused ? 'opacity-70' : '',
          overdue ? 'border-l-2 border-l-burgundy' : '',
        ].join(' ')}
      >
        {project.coverImage && (
          <div className="w-full h-28 overflow-hidden bg-white/5">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className={compact ? 'p-3' : 'p-4'}>
          {/* Top row: type + stage + countdown */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <Badge
              label={TYPE_LABELS[project.type] ?? project.type}
              bg={TYPE_BG[project.type] ?? '#f3efe8'}
              color={TYPE_TEXT[project.type] ?? '#6b6460'}
            />
            {!compact && (
              <Badge
                label={STAGE_LABELS[project.stage] ?? project.stage}
                bg={STAGE_BG[project.stage] ?? '#faf8f5'}
                color={STAGE_TEXT[project.stage] ?? '#6b6460'}
              />
            )}
            {project.isPaused && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-yellow-300/70">
                <Pause size={9} /> Pausa
              </span>
            )}
            <CountdownPill deadline={project.deadline} />
          </div>

          {/* Title */}
          <p className="font-medium text-xs sm:text-sm text-ink leading-snug mb-1 line-clamp-2">
            {project.title}
          </p>

          {clientName && (
            <p className="label-meta mb-2">{clientName}</p>
          )}

          {/* Next action */}
          {project.nextAction && !compact && (
            <p className="text-xs text-muted mt-2 border-t border-white/10 pt-2 line-clamp-2">
              → {project.nextAction}
            </p>
          )}

          {/* Footer: deadline + payment */}
          {!compact && (
            <div className="flex flex-wrap items-center justify-between mt-2 sm:mt-3 gap-1">
              <div>
                {project.deadline ? (
                  <span
                    className={[
                      'flex items-center gap-1 text-[11px] font-mono',
                      overdue ? 'text-red-300 font-medium' : urgent ? 'text-yellow-300/80' : 'text-subtle',
                    ].join(' ')}
                  >
                    {overdue && <AlertCircle size={11} />}
                    {formatDate(project.deadline)}
                    {overdue && ' · scaduto'}
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-subtle">Nessuna deadline</span>
                )}
              </div>
              <Badge
                label={PAYMENT_LABELS[project.paymentStatus] ?? project.paymentStatus}
                bg={PAYMENT_BG[project.paymentStatus] ?? '#faf8f5'}
                color={PAYMENT_TEXT[project.paymentStatus] ?? '#6b6460'}
              />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
