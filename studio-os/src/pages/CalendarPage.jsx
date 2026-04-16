import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, AlertTriangle,
  Plus, Check, Clock, Trash2, Edit2, Bell, Calendar,
  User, Briefcase, ChevronDown, TrendingUp, TrendingDown, Wallet,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Btn from '../components/Btn';
import Field from '../components/Field';
import { useProjects, useClients, useCalendarTasks } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { fetchEntries } from '../lib/cashflow';
import {
  TYPE_LABELS, TYPE_BG, TYPE_TEXT,
  STAGE_LABELS, STAGE_BG, STAGE_TEXT,
} from '../lib/constants';
import { formatDate } from '../lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const DAYS_IT = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];

const TASK_COLORS = {
  burgundy: { bg: 'rgba(180,50,50,0.18)', text: '#f5a0a3', dot: '#c9888b' },
  blue:     { bg: 'rgba(56,120,220,0.18)', text: '#7bb3ff', dot: '#7bb3ff' },
  green:    { bg: 'rgba(52,168,83,0.18)',  text: '#6dd49e', dot: '#6dd49e' },
  yellow:   { bg: 'rgba(194,160,40,0.18)', text: '#f5e0a0', dot: '#f5e0a0' },
  purple:   { bg: 'rgba(124,58,237,0.18)', text: '#c4a5ff', dot: '#c4a5ff' },
};

const REMINDER_OPTIONS = [
  { value: '', label: 'Nessuno' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 ora' },
  { value: '1440', label: '1 giorno' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  timeStart: '',
  timeEnd: '',
  color: 'burgundy',
  reminderMinutes: '',
  clientId: '',
  projectId: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  let startDow = first.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells = [];

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), outside: true });
  }

  for (let day = 1; day <= last.getDate(); day++) {
    cells.push({ date: new Date(year, month, day), outside: false });
  }

  const remainder = cells.length % 7;
  const pad = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 1; i <= pad; i++) {
    cells.push({ date: new Date(year, month + 1, i), outside: true });
  }

  return cells;
}

function formatTimeRange(start, end) {
  if (!start) return 'Tutto il giorno';
  return end ? `${start} - ${end}` : start;
}

function taskBadgeLabel(task, getClient, projects) {
  const parts = [];
  if (task.clientId) {
    const client = getClient(task.clientId);
    if (client) parts.push(client.name);
  }
  if (task.projectId) {
    const proj = projects.find(p => p.id === task.projectId);
    if (proj) parts.push(proj.title);
  }
  return parts.join(' · ');
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { projects, addTask, toggleTask } = useProjects();
  const { clients, getClient } = useClients();
  const { calendarTasks, addCalendarTask, updateCalendarTask, deleteCalendarTask } = useCalendarTasks();
  const { user } = useAuth();

  // ── Cashflow entries ──────────────────────────────────────────────────────
  const [cashflowEntries, setCashflowEntries] = useState([]);
  useEffect(() => {
    if (!user) return;
    fetchEntries(user.id).then(setCashflowEntries).catch(console.error);
  }, [user]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = add, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Project to-do state
  const [expandedProjects, setExpandedProjects] = useState({});
  const [newTaskText, setNewTaskText] = useState({});

  // ── Derived data ──────────────────────────────────────────────────────────

  const activeProjects = useMemo(
    () => projects.filter(p => p.deadline && p.stage !== 'archived'),
    [projects],
  );

  const activeProjectsList = useMemo(
    () => projects.filter(p => !['archived', 'completed', 'delivered'].includes(p.stage)),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    if (!form.clientId) return activeProjectsList;
    return activeProjectsList.filter(p => p.clientId === form.clientId);
  }, [activeProjectsList, form.clientId]);

  // Map: "YYYY-MM-DD" -> [project, ...]
  const projectsByDate = useMemo(() => {
    const map = {};
    for (const p of activeProjects) {
      const key = p.deadline.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [activeProjects]);

  // Map: "YYYY-MM-DD" -> [task, ...]
  const tasksByDate = useMemo(() => {
    const map = {};
    for (const t of calendarTasks) {
      const key = t.date;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [calendarTasks]);

  // Map: "YYYY-MM-DD" -> [cashflow entry, ...]
  const cashflowByDate = useMemo(() => {
    const map = {};
    for (const e of cashflowEntries) {
      const key = e.date;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [cashflowEntries]);

  // Overdue projects
  const overdue = useMemo(() => {
    const closedStages = ['completed', 'delivered', 'archived'];
    return activeProjects.filter(p => {
      const dl = startOfDay(new Date(p.deadline));
      return dl < today && !closedStages.includes(p.stage);
    });
  }, [activeProjects, today]);

  const cells = useMemo(() => buildGrid(year, month), [year, month]);

  // Selected day data
  const selectedKey = selectedDay ? toKey(selectedDay) : null;
  const selectedProjects = useMemo(
    () => selectedKey ? (projectsByDate[selectedKey] ?? []) : [],
    [selectedKey, projectsByDate],
  );
  const selectedTasks = useMemo(() => {
    if (!selectedKey) return [];
    const tasks = tasksByDate[selectedKey] ?? [];
    // Sort: all-day first, then by time_start
    return [...tasks].sort((a, b) => {
      if (!a.timeStart && b.timeStart) return -1;
      if (a.timeStart && !b.timeStart) return 1;
      if (a.timeStart && b.timeStart) return a.timeStart.localeCompare(b.timeStart);
      return 0;
    });
  }, [selectedKey, tasksByDate]);

  const selectedCashflow = useMemo(
    () => selectedKey ? (cashflowByDate[selectedKey] ?? []) : [],
    [selectedKey, cashflowByDate],
  );

  // ── Navigation ────────────────────────────────────────────────────────────

  function prevMonth() {
    setMonth(m => {
      if (m === 0) { setYear(y => y - 1); return 11; }
      return m - 1;
    });
  }

  function nextMonth() {
    setMonth(m => {
      if (m === 11) { setYear(y => y + 1); return 0; }
      return m + 1;
    });
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today);
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // ── Task Modal ────────────────────────────────────────────────────────────

  function openAddModal() {
    setEditingTask(null);
    setForm({
      ...EMPTY_FORM,
      date: selectedDay ? toKey(selectedDay) : toKey(today),
    });
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      date: task.date,
      timeStart: task.timeStart ?? '',
      timeEnd: task.timeEnd ?? '',
      color: task.color ?? 'burgundy',
      reminderMinutes: task.reminderMinutes != null ? String(task.reminderMinutes) : '',
      clientId: task.clientId ?? '',
      projectId: task.projectId ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
  }

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleClientChange(clientId) {
    setForm(prev => {
      const next = { ...prev, clientId: clientId || '' };
      if (clientId && prev.projectId) {
        const proj = activeProjectsList.find(p => p.id === prev.projectId);
        if (proj && proj.clientId && proj.clientId !== clientId) {
          next.projectId = '';
        }
      }
      return next;
    });
  }

  function handleProjectChange(projectId) {
    setForm(prev => {
      const next = { ...prev, projectId: projectId || '' };
      if (projectId) {
        const proj = activeProjectsList.find(p => p.id === projectId);
        if (proj?.clientId) {
          next.clientId = proj.clientId;
        }
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        date: form.date,
        timeStart: form.timeStart || null,
        timeEnd: form.timeEnd || null,
        color: form.color,
        reminderMinutes: form.reminderMinutes ? Number(form.reminderMinutes) : null,
        clientId: form.clientId || null,
        projectId: form.projectId || null,
      };
      if (editingTask) {
        await updateCalendarTask(editingTask.id, payload);
      } else {
        await addCalendarTask(payload);
      }
      closeModal();
    } catch (err) {
      console.error('Save calendar task failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingTask) return;
    setSaving(true);
    try {
      await deleteCalendarTask(editingTask.id);
      closeModal();
    } catch (err) {
      console.error('Delete calendar task failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const handleToggleDone = useCallback(async (task) => {
    await updateCalendarTask(task.id, { isDone: !task.isDone });
  }, [updateCalendarTask]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-ink tracking-tight">
          Calendario
        </h1>
        <Btn size="sm" variant="primary" onClick={openAddModal}>
          <Plus size={14} /> Nuova task
        </Btn>
      </div>

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
            {overdue.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Badge
                  label={`${p.title} - ${formatDate(p.deadline)}`}
                  bg="rgba(180,50,50,0.25)"
                  color="#f5a0a3"
                  className="hover:brightness-125 transition-all cursor-pointer"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Calendar grid ── */}
        <div className="glass rounded-lg p-4 sm:p-5 flex-1 min-w-0">
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
              const dayProjects = projectsByDate[key] ?? [];
              const dayTasks = tasksByDate[key] ?? [];
              const dayCashflow = cashflowByDate[key] ?? [];
              const totalItems = dayProjects.length + dayTasks.length;

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
                  {/* Day number + task count */}
                  <div className="flex items-center justify-between">
                    <span className={`
                      text-xs font-mono block
                      ${isToday
                        ? 'text-burgundy-muted font-bold bg-burgundy/20 w-5 h-5 rounded-full flex items-center justify-center'
                        : 'text-muted'}
                    `}>
                      {cell.date.getDate()}
                    </span>
                    {totalItems > 0 && !cell.outside && (
                      <span className="text-[9px] font-mono text-subtle bg-white/8 rounded-full w-4 h-4 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>

                  {/* Project pills */}
                  {dayProjects.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayProjects.slice(0, 2).map(p => {
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
                    </div>
                  )}

                  {/* Task pills */}
                  {dayTasks.length > 0 && (
                    <div className="mt-0.5 flex flex-col gap-0.5">
                      {dayTasks.slice(0, dayProjects.length > 0 ? 1 : 2).map(t => {
                        const c = TASK_COLORS[t.color] ?? TASK_COLORS.burgundy;
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center gap-1 truncate text-[9px] sm:text-[10px] font-mono leading-tight rounded px-1 py-px ${t.isDone ? 'line-through opacity-50' : ''}`}
                            style={{ backgroundColor: c.bg, color: c.text }}
                            title={t.title + (taskBadgeLabel(t, getClient, projects) ? ` — ${taskBadgeLabel(t, getClient, projects)}` : '')}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                            {t.title}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Cashflow badges */}
                  {dayCashflow.length > 0 && !cell.outside && (() => {
                    const entrateSum = dayCashflow.filter(e => e.type === 'entrata').reduce((s, e) => s + e.amount, 0);
                    const usciteSum  = dayCashflow.filter(e => e.type === 'uscita').reduce((s, e) => s + e.amount, 0);
                    return (
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        {entrateSum > 0 && (
                          <span
                            className="text-[9px] font-mono rounded px-0.5 leading-tight"
                            style={{ backgroundColor: 'rgba(52,168,83,0.18)', color: '#6dd49e' }}
                          >
                            +€{entrateSum >= 1000 ? Math.round(entrateSum / 1000) + 'k' : Math.round(entrateSum)}
                          </span>
                        )}
                        {usciteSum > 0 && (
                          <span
                            className="text-[9px] font-mono rounded px-0.5 leading-tight"
                            style={{ backgroundColor: 'rgba(180,50,50,0.18)', color: '#f5a0a3' }}
                          >
                            -€{usciteSum >= 1000 ? Math.round(usciteSum / 1000) + 'k' : Math.round(usciteSum)}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Overflow indicator */}
                  {totalItems > 3 && (
                    <span className="text-[9px] font-mono text-subtle mt-0.5 block">
                      +{totalItems - 3}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        <div className="glass rounded-lg p-4 sm:p-5 lg:w-80 xl:w-96 shrink-0">
          {selectedDay ? (
            <>
              {/* Date header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink capitalize">
                    {DAYS_IT[selectedDay.getDay()]}
                  </h3>
                  <p className="text-sm text-muted">
                    {selectedDay.getDate()} {MONTHS_IT[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                  </p>
                </div>
                <Btn size="sm" variant="ghost" onClick={openAddModal} title="Aggiungi task">
                  <Plus size={14} />
                </Btn>
              </div>

              {/* Tasks timeline */}
              {selectedTasks.length > 0 && (
                <div className="mb-5">
                  <p className="label-meta mb-2 flex items-center gap-1.5">
                    <Check size={12} /> Task ({selectedTasks.length})
                  </p>
                  <div className="space-y-1.5">
                    {selectedTasks.map(task => {
                      const c = TASK_COLORS[task.color] ?? TASK_COLORS.burgundy;
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 glass rounded-md p-2.5 hover:bg-white/8 transition-colors group"
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleDone(task)}
                            className={`
                              mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors
                              ${task.isDone
                                ? 'bg-white/20 border-white/30'
                                : 'border-white/20 hover:border-white/40'}
                            `}
                            style={task.isDone ? {} : { borderColor: c.dot + '60' }}
                          >
                            {task.isDone && <Check size={10} className="text-muted" />}
                          </button>

                          {/* Content */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => openEditModal(task)}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: c.dot }}
                              />
                              <span className={`text-sm text-ink truncate ${task.isDone ? 'line-through opacity-50' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {task.timeStart && (
                                <span className="text-[11px] font-mono text-subtle flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatTimeRange(task.timeStart, task.timeEnd)}
                                </span>
                              )}
                              {task.reminderMinutes != null && (
                                <span className="text-[11px] font-mono text-subtle flex items-center gap-1">
                                  <Bell size={10} />
                                </span>
                              )}
                            </div>
                            {taskBadgeLabel(task, getClient, projects) && (
                              <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
                                {task.clientId ? <User size={10} className="inline mr-1 -mt-px" /> : <Briefcase size={10} className="inline mr-1 -mt-px" />}
                                {taskBadgeLabel(task, getClient, projects)}
                              </span>
                            )}
                            {task.description && (
                              <p className="text-[11px] text-subtle mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>

                          {/* Edit icon */}
                          <button
                            onClick={() => openEditModal(task)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-subtle hover:text-ink"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Project deadlines */}
              {selectedProjects.length > 0 && (
                <div className="mb-4">
                  <p className="label-meta mb-2 flex items-center gap-1.5">
                    <Calendar size={12} /> Scadenze ({selectedProjects.length})
                  </p>
                  <div className="space-y-2">
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
                </div>
              )}

              {/* Cashflow entries */}
              {selectedCashflow.length > 0 && (
                <div className="mb-4">
                  <p className="label-meta mb-2 flex items-center gap-1.5">
                    <Wallet size={12} /> Finanze ({selectedCashflow.length})
                  </p>
                  <div className="space-y-1.5">
                    {selectedCashflow.map(entry => {
                      const isEntrata = entry.type === 'entrata';
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2.5 glass rounded-md p-2.5"
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isEntrata ? 'rgba(52,168,83,0.18)' : 'rgba(180,50,50,0.18)',
                            }}
                          >
                            {isEntrata
                              ? <TrendingUp size={13} style={{ color: '#6dd49e' }} />
                              : <TrendingDown size={13} style={{ color: '#f5a0a3' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-ink truncate leading-tight">
                              {entry.description || entry.category || '—'}
                            </p>
                            {entry.category && (
                              <span className="text-[10px] text-subtle">{entry.category}</span>
                            )}
                          </div>
                          <span
                            className="font-mono text-sm font-semibold shrink-0"
                            style={{ color: isEntrata ? '#6dd49e' : '#f5a0a3' }}
                          >
                            {isEntrata ? '+' : '-'}€{Math.round(entry.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    to="/cashflow"
                    className="text-[11px] text-burgundy-muted hover:text-burgundy transition-colors mt-2 inline-block"
                  >
                    Vai a Finanze →
                  </Link>
                </div>
              )}

              {/* Empty state */}
              {selectedTasks.length === 0 && selectedProjects.length === 0 && selectedCashflow.length === 0 && (
                <p className="text-sm text-subtle text-center py-6">
                  Nessun impegno per questo giorno.
                </p>
              )}

              {/* Add task button at bottom */}
              <Btn size="sm" variant="secondary" onClick={openAddModal} className="w-full justify-center mt-2">
                <Plus size={14} /> Aggiungi task
              </Btn>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar size={28} className="text-subtle mb-3" />
              <p className="text-sm text-subtle">
                Seleziona un giorno per vedere<br />task e scadenze.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Project To-Do List ── */}
      {activeProjectsList.length > 0 && (
        <div className="glass rounded-lg p-4 sm:p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-muted" />
            Progetti attivi
            <span className="text-muted font-sans text-sm font-normal">({activeProjectsList.length})</span>
          </h2>

          <div className="space-y-1">
            {activeProjectsList.map(project => {
              const isExpanded = expandedProjects[project.id] ?? false;
              const tasks = project.tasks ?? [];
              const doneCount = tasks.filter(t => t.done).length;
              const client = project.clientId ? getClient(project.clientId) : null;
              const type = project.type ?? 'other';
              const stage = project.stage ?? 'lead';

              return (
                <div key={project.id} className="rounded-lg overflow-hidden">
                  {/* Project header — clickable to expand */}
                  <button
                    onClick={() => setExpandedProjects(prev => ({ ...prev, [project.id]: !prev[project.id] }))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/6 transition-colors text-left"
                  >
                    <ChevronDown
                      size={14}
                      className={`text-subtle shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink truncate">{project.title}</span>
                        {client && (
                          <span className="text-[11px] text-subtle truncate hidden sm:inline">— {client.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tasks.length > 0 && (
                        <span className="text-[11px] font-mono text-subtle">
                          {doneCount}/{tasks.length}
                        </span>
                      )}
                      <Badge
                        label={STAGE_LABELS[stage] ?? stage}
                        bg={STAGE_BG[stage] ?? STAGE_BG.lead}
                        color={STAGE_TEXT[stage] ?? STAGE_TEXT.lead}
                      />
                    </div>
                  </button>

                  {/* Expanded: task list + add input */}
                  {isExpanded && (
                    <div className="pl-8 pr-3 pb-3">
                      {tasks.length > 0 ? (
                        <div className="space-y-1">
                          {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 group">
                              <button
                                onClick={() => toggleTask(project.id, task.id)}
                                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                  task.done ? 'bg-white/20 border-white/30' : 'border-white/20 hover:border-white/40'
                                }`}
                              >
                                {task.done && <Check size={10} className="text-muted" />}
                              </button>
                              <span className={`text-sm ${task.done ? 'text-subtle line-through' : 'text-ink'}`}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-subtle mb-2">Nessuna task</p>
                      )}

                      {/* Add task inline */}
                      <form
                        className="flex items-center gap-2 mt-2"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const text = (newTaskText[project.id] ?? '').trim();
                          if (!text) return;
                          await addTask(project.id, text);
                          setNewTaskText(prev => ({ ...prev, [project.id]: '' }));
                        }}
                      >
                        <input
                          type="text"
                          className="input text-sm flex-1 py-1.5"
                          placeholder="Aggiungi task..."
                          value={newTaskText[project.id] ?? ''}
                          onChange={e => setNewTaskText(prev => ({ ...prev, [project.id]: e.target.value }))}
                        />
                        <Btn type="submit" size="sm" variant="ghost" disabled={!(newTaskText[project.id] ?? '').trim()}>
                          <Plus size={14} />
                        </Btn>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add / Edit Task Modal ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTask ? 'Modifica task' : 'Nuova task'}
        width="max-w-md"
      >
        <div className="space-y-4">
          {/* Title */}
          <Field label="Titolo" required>
            <input
              type="text"
              className="input"
              placeholder="Cosa devi fare?"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              autoFocus
            />
          </Field>

          {/* Date */}
          <Field label="Data" required>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={e => setField('date', e.target.value)}
            />
          </Field>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ora inizio">
              <input
                type="time"
                className="input"
                value={form.timeStart}
                onChange={e => setField('timeStart', e.target.value)}
              />
            </Field>
            <Field label="Ora fine">
              <input
                type="time"
                className="input"
                value={form.timeEnd}
                onChange={e => setField('timeEnd', e.target.value)}
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Descrizione">
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="Note aggiuntive..."
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={2}
            />
          </Field>

          {/* Color picker */}
          <Field label="Colore">
            <div className="flex items-center gap-2">
              {Object.entries(TASK_COLORS).map(([name, c]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setField('color', name)}
                  className={`
                    w-7 h-7 rounded-full transition-all
                    ${form.color === name ? 'ring-2 ring-white/40 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}
                  `}
                  style={{ backgroundColor: c.dot }}
                  title={name}
                />
              ))}
            </div>
          </Field>

          {/* Client select */}
          <Field label="Cliente">
            <select
              className="input"
              value={form.clientId}
              onChange={e => handleClientChange(e.target.value)}
            >
              <option value="">Nessuno</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.brand ? ` (${c.brand})` : ''}</option>
              ))}
            </select>
          </Field>

          {/* Project select */}
          <Field label="Progetto">
            <select
              className="input"
              value={form.projectId}
              onChange={e => handleProjectChange(e.target.value)}
            >
              <option value="">Nessuno</option>
              {filteredProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          {/* Reminder */}
          <Field label="Promemoria">
            <select
              className="input"
              value={form.reminderMinutes}
              onChange={e => setField('reminderMinutes', e.target.value)}
            >
              {REMINDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {editingTask && (
                <Btn variant="danger" size="sm" onClick={handleDelete} disabled={saving}>
                  <Trash2 size={14} /> Elimina
                </Btn>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" onClick={closeModal} disabled={saving}>
                Annulla
              </Btn>
              <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? 'Salvataggio...' : (editingTask ? 'Salva' : 'Crea')}
              </Btn>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
