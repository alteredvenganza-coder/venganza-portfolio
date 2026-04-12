import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pause, AlertCircle } from 'lucide-react';
import Badge from './Badge';
import {
  STAGE_BG, STAGE_TEXT, STAGE_LABELS,
  TYPE_BG, TYPE_TEXT, TYPE_LABELS,
  PAYMENT_BG, PAYMENT_TEXT, PAYMENT_LABELS,
} from '../lib/constants';
import { formatDate, isOverdue, daysUntil } from '../lib/utils';

function CountdownPill({ deadline }) {
  if (!deadline) return null;
  const overdue = isOverdue(deadline);
  const days    = daysUntil(deadline);

  let bg, color, label;
  if (overdue) {
    bg = '#f5e8e8'; color = '#7b1f24'; label = 'Scaduto';
  } else if (days <= 3) {
    bg = '#fce8e6'; color = '#c0392b'; label = `${days}g`;
  } else if (days <= 7) {
    bg = '#fff8e1'; color = '#7a6010'; label = `${days}g`;
  } else if (days <= 14) {
    bg = '#fff8e1'; color = '#7a6010'; label = `${days}g`;
  } else {
    return null; // non invasivo: non mostrare se manca ancora molto
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
      style={{ background: bg, color }}
    >
      {overdue && <AlertCircle size={9} />}
      {label}
    </span>
  );
}

export default function ProjectCard({ project, clientName, compact = false }) {
  const overdue = isOverdue(project.deadline);
  const days    = daysUntil(project.deadline);
  const urgent  = days !== null && days <= 3 && days >= 0;

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Link
        to={`/projects/${project.id}`}
        className={[
          'block bg-white border rounded-lg shadow-card hover:border-burgundy-muted transition-colors',
          project.isPaused ? 'border-[#e8e4dc] opacity-80' : 'border-border',
          overdue ? 'border-l-2 border-l-burgundy' : '',
        ].join(' ')}
      >
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
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-[#7a6010]">
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
            <p className="text-xs text-muted mt-2 border-t border-border pt-2 line-clamp-2">
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
                      overdue
                        ? 'text-burgundy font-medium'
                        : urgent
                          ? 'text-[#7a6010]'
                          : 'text-subtle',
                    ].join(' ')}
                  >
                    {overdue && <AlertCircle size={11} />}
                    {formatDate(project.deadline)}
                    {overdue && ' · scaduto'}
                    {!overdue && urgent && ` · ${days}gg`}
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
