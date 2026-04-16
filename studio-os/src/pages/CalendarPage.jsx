import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Badge from '../components/Badge';
import { useProjects, useClients } from '../hooks/useStore';
import {
  TYPE_LABELS, TYPE_BG, TYPE_TEXT,
  STAGE_LABELS, STAGE_BG, STAGE_TEXT,
} from '../lib/constants';
import { formatDate } from '../lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Build array of calendar cells for a month grid (Mon-start). */
function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  // Day of week: JS 0=Sun..6=Sat -> Mon-start: Mon=0..Sun=6
  let startDow = first.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells = [];

  // Previous month padding
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d, outside: true });
  }

  // Current month
  for (let day = 1; day <= last.getDate(); day++) {
    cells.push({ date: new Date(year, month, day), outside: false });
  }

  // Next month padding to fill 6 rows (42 cells) or at least complete the row
  const remainder = cells.length % 7;
  const pad = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 1; i <= pad; i++) {
    cells.push({ date: new Date(year, month + 1, i), outside: true });
  }

  return cells;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { projects }  = useProjects();
  const { getClient } = useClients();

  const today = useMemo(() => startOfDay(new Date()), []);

  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null); // Date or null

  // ── Derived data ──────────────────────────────────────────────────────────

  // Only active projects (not archived) with a deadline
  const activeProjects = useMemo(
    () => projects.filter(p => p.deadline && p.stage !== 'archived'),
    [projects],
  );

  // Map: "YYYY-MM-DD" -> [project, ...]
  const byDate = useMemo(() => {
    const map = {};
    for (const p of activeProjects) {
      const key = p.deadline.slice(0, 10); // ISO date part
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [activeProjects]);

  // Overdue projects (deadline < today, not completed/delivered)
  const overdue = useMemo(() => {
    const closedStages = ['completed', 'delivered', 'archived'];
    return activeProjects.filter(p => {
      const dl = startOfDay(new Date(p.deadline));
      return dl < today && !closedStages.includes(p.stage);
    });
  }, [activeProjects, today]);

  // Calendar grid
  const cells = useMemo(() => buildGrid(year, month), [year, month]);

  // Projects for the selected day
  const selectedProjects = useMemo(() => {
    if (!selectedDay) return [];
    return byDate[toKey(selectedDay)] ?? [];
  }, [selectedDay, byDate]);

  // ── Navigation ────────────────────────────────────────────────────────────

  function prevMonth() {
    setMonth(m => {
      if (m === 0) { setYear(y => y - 1); return 11; }
      return m - 1;
    });
    setSelectedDay(null);
  }

  function nextMonth() {
    setMonth(m => {
      if (m === 11) { setYear(y => y + 1); return 0; }
      return m + 1;
    });
    setSelectedDay(null);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(null);
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="font-display text-lg font-semibold text-ink tracking-tight">
        Calendario
      </h1>

      {/* Overdue section */}
      {overdue.length > 0 && (
        <div className="glass rounded-lg p-4 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="label-meta text-red-400">
              Scaduti ({overdue.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overdue.map(p => {
              const type = p.type ?? 'other';
              return (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <Badge
                    label={`${p.title} - ${formatDate(p.deadline)}`}
                    bg="rgba(180,50,50,0.25)"
                    color="#f5a0a3"
                    className="hover:brightness-125 transition-all cursor-pointer"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Calendar grid ── */}
        <div className="glass rounded-lg p-4 sm:p-5 flex-1">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded hover:bg-white/8 text-muted hover:text-ink transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-3">
              <h2 className="font-display text-base font-semibold text-ink">
                {MONTHS_IT[month]} {year}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToday}
                  className="text-[11px] font-mono uppercase tracking-wider text-burgundy-muted hover:text-burgundy transition-colors px-2 py-0.5 rounded border border-burgundy/20 hover:border-burgundy/40"
                >
                  Oggi
                </button>
              )}
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded hover:bg-white/8 text-muted hover:text-ink transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-mono uppercase tracking-wider text-subtle py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px">
            {cells.map((cell, i) => {
              const key    = toKey(cell.date);
              const isToday = isSameDay(cell.date, today);
              const isSelected = selectedDay && isSameDay(cell.date, selectedDay);
              const dayProjects = byDate[key] ?? [];
              const hasProjects = dayProjects.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(cell.date)}
                  className={`
                    relative min-h-[60px] sm:min-h-[72px] p-1.5 rounded-md text-left transition-colors
                    ${cell.outside ? 'opacity-30' : ''}
                    ${isSelected ? 'bg-burgundy/15 ring-1 ring-burgundy/30' : 'hover:bg-white/6'}
                    ${isToday && !isSelected ? 'bg-white/8' : ''}
                  `}
                >
                  {/* Day number */}
                  <span className={`
                    text-xs font-mono block
                    ${isToday
                      ? 'text-burgundy-muted font-bold bg-burgundy/20 w-5 h-5 rounded-full flex items-center justify-center'
                      : 'text-muted'}
                  `}>
                    {cell.date.getDate()}
                  </span>

                  {/* Project dots */}
                  {hasProjects && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayProjects.slice(0, 3).map(p => {
                        const type = p.type ?? 'other';
                        return (
                          <div
                            key={p.id}
                            className="truncate text-[9px] sm:text-[10px] font-mono leading-tight rounded px-1 py-px"
                            style={{
                              backgroundColor: TYPE_BG[type] ?? TYPE_BG.other,
                              color: TYPE_TEXT[type] ?? TYPE_TEXT.other,
                            }}
                            title={p.title}
                          >
                            {p.title}
                          </div>
                        );
                      })}
                      {dayProjects.length > 3 && (
                        <span className="text-[9px] font-mono text-subtle">
                          +{dayProjects.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        <div className="glass rounded-lg p-4 sm:p-5 lg:w-72 xl:w-80 shrink-0">
          <h3 className="label-meta mb-3">
            {selectedDay
              ? selectedDay.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Seleziona un giorno'}
          </h3>

          {selectedDay && selectedProjects.length === 0 && (
            <p className="text-sm text-subtle">Nessun progetto in scadenza.</p>
          )}

          {selectedProjects.length > 0 && (
            <div className="space-y-3">
              {selectedProjects.map(p => {
                const type   = p.type ?? 'other';
                const stage  = p.stage ?? 'lead';
                const client = getClient(p.clientId);
                const dl     = startOfDay(new Date(p.deadline));
                const isPast = dl < today;

                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block glass rounded-md p-3 hover:bg-white/8 transition-colors group"
                  >
                    <p className="text-sm font-medium text-ink group-hover:text-burgundy-muted transition-colors truncate">
                      {p.title}
                    </p>
                    {client && (
                      <p className="text-xs text-subtle mt-0.5">{client.name}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge
                        label={TYPE_LABELS[type] ?? type}
                        bg={TYPE_BG[type] ?? TYPE_BG.other}
                        color={TYPE_TEXT[type] ?? TYPE_TEXT.other}
                      />
                      <Badge
                        label={STAGE_LABELS[stage] ?? stage}
                        bg={STAGE_BG[stage] ?? STAGE_BG.lead}
                        color={STAGE_TEXT[stage] ?? STAGE_TEXT.lead}
                      />
                      {isPast && (
                        <Badge
                          label="Scaduto"
                          bg="rgba(180,50,50,0.25)"
                          color="#f5a0a3"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!selectedDay && (
            <p className="text-sm text-subtle">
              Clicca su un giorno per vedere i progetti in scadenza.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
