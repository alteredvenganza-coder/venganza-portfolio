import { motion } from 'framer-motion';
import { STAGES, STAGE_LABELS, STAGE_BG, STAGE_TEXT } from '../lib/constants';

export default function StageStepper({ current, onChange, disabled = false }) {
  const currentIdx = STAGES.indexOf(current);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STAGES.map((stage, idx) => {
        const isActive  = stage === current;
        const isDone    = idx < currentIdx;
        const isNext    = idx === currentIdx + 1;

        return (
          <div key={stage} className="flex items-center">
            <motion.button
              whileTap={{ scale: disabled ? 1 : 0.96 }}
              onClick={() => !disabled && onChange(stage)}
              disabled={disabled}
              title={STAGE_LABELS[stage]}
              className={[
                'relative px-2 sm:px-4 py-2 text-xs font-mono font-medium tracking-wide rounded transition-colors',
                'focus:outline-none',
                isActive
                  ? 'ring-1 ring-offset-1'
                  : isDone
                    ? 'opacity-60 hover:opacity-90'
                    : isNext
                      ? 'hover:opacity-80'
                      : 'opacity-40 hover:opacity-60',
                disabled ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
              style={{
                backgroundColor: isActive ? STAGE_BG[stage] : isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                color:           isActive ? STAGE_TEXT[stage] : isDone ? '#b0acaa' : '#8c8884',
                ringColor:       isActive ? STAGE_TEXT[stage] : 'transparent',
                border: isActive ? `1px solid ${STAGE_TEXT[stage]}33` : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {STAGE_LABELS[stage]}
              {isActive && (
                <motion.div
                  layoutId="stage-active"
                  className="absolute inset-0 rounded"
                  style={{
                    backgroundColor: STAGE_BG[stage],
                    zIndex: -1,
                  }}
                />
              )}
            </motion.button>

            {idx < STAGES.length - 1 && (
              <div
                className="w-3 sm:w-5 h-px shrink-0"
                style={{ backgroundColor: idx < currentIdx ? '#c9888b' : 'rgba(255,255,255,0.12)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
