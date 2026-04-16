import { createContext, useContext, useEffect, useState } from 'react';
import { genId } from '../lib/utils';
import * as db from '../lib/db';
import { useAuth } from './useAuth';
import { fireWebhook } from '../lib/webhook';
import { STAGE_LABELS, PAYMENT_LABELS } from '../lib/constants';

// ── Activity log helpers ─────────────────────────────────────────────────────

function logEntry(type, text) {
  return { id: genId(), type, text, timestamp: new Date().toISOString() };
}

/** Compare current project with incoming patch and return activity entries */
function detectActivities(current, patch) {
  const entries = [];

  // Stage change
  if (patch.stage && patch.stage !== current.stage) {
    const from = STAGE_LABELS[current.stage] ?? current.stage;
    const to   = STAGE_LABELS[patch.stage]   ?? patch.stage;
    entries.push(logEntry('stage_change', `Stage cambiato da ${from} a ${to}`));
  }

  // Payment status change
  if (patch.paymentStatus && patch.paymentStatus !== current.paymentStatus) {
    const label = PAYMENT_LABELS[patch.paymentStatus] ?? patch.paymentStatus;
    entries.push(logEntry('payment_change', `Pagamento aggiornato: ${label}`));
  }

  // Paused / resumed
  if ('isPaused' in patch) {
    if (patch.isPaused && !current.isPaused) {
      entries.push(logEntry('paused', 'Progetto messo in pausa'));
    } else if (!patch.isPaused && current.isPaused) {
      entries.push(logEntry('resumed', 'Progetto ripreso'));
    }
  }

  return entries;
}

const GOALS_KEY      = 'venganza-goals';
const GOALS_DEFAULTS = { monthly: 10000, yearly: 120000, byType: {}, appBackground: null };

// ── Store context ──────────────────────────────────────────────────────────────

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [clients,  setClients]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [goals, setGoals] = useState(() => {
    try {
      const s = localStorage.getItem(GOALS_KEY);
      if (!s) return GOALS_DEFAULTS;
      const p = JSON.parse(s);
      return { ...GOALS_DEFAULTS, ...p, byType: { ...GOALS_DEFAULTS.byType, ...(p.byType ?? {}) } };
    } catch { return GOALS_DEFAULTS; }
  });

  function updateGoals(patch) {
    setGoals(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(GOALS_KEY, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    Promise.all([db.fetchClients(user.id), db.fetchProjects(user.id), db.fetchCalendarTasks(user.id)])
      .then(([c, p, ct]) => { setClients(c); setProjects(p); setCalendarTasks(ct); })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <StoreContext.Provider value={{ clients, setClients, projects, setProjects, calendarTasks, setCalendarTasks, loading, user, goals, updateGoals }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export function useGoals() {
  const { goals, updateGoals } = useStore();
  return { goals, updateGoals };
}

// ── Clients ────────────────────────────────────────────────────────────────────

export function useClients() {
  const { clients, setClients, user } = useStore();

  async function addClient(data) {
    const client = await db.insertClient(user.id, data);
    setClients(prev => [client, ...prev]);
    return client;
  }

  async function updateClient(id, patch) {
    const current = clients.find(c => c.id === id);
    const merged  = { ...current, ...patch };
    setClients(prev => prev.map(c => c.id === id ? merged : c)); // optimistic
    await db.patchClient(id, patch);
  }

  async function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id)); // optimistic
    await db.removeClient(id);
  }

  function getClient(id) {
    return clients.find(c => c.id === id) ?? null;
  }

  return { clients, addClient, updateClient, deleteClient, getClient };
}

// ── Projects ───────────────────────────────────────────────────────────────────

export function useProjects() {
  const { projects, setProjects, user } = useStore();

  async function addProject(data) {
    const payload = {
      tasks: [], isPaused: false, pausedReason: '', paymentStatus: 'unpaid',
      ...data,
    };
    const project = await db.insertProject(user.id, payload);
    setProjects(prev => [project, ...prev]);
    return project;
  }

  async function updateProject(id, patch) {
    const current = projects.find(p => p.id === id);
    // Auto-stamp completedAt when project first reaches a closed stage
    const closedStages = ['completed', 'delivered', 'archived'];
    if (patch.stage && closedStages.includes(patch.stage) && !current?.completedAt) {
      patch = { ...patch, completedAt: new Date().toISOString() };
    }
    // Auto-log activity
    const newEntries = detectActivities(current, patch);
    if (newEntries.length > 0) {
      const prev = current.activity ?? [];
      patch = { ...patch, activity: [...prev, ...newEntries] };
    }
    const merged  = { ...current, ...patch };
    setProjects(prev => prev.map(p => p.id === id ? merged : p)); // optimistic
    try {
      await db.patchProject(id, patch);
    } catch (err) {
      console.error('[db] patchProject failed:', err);
      // revert optimistic update
      setProjects(prev => prev.map(p => p.id === id ? current : p));
      alert('Errore salvataggio: ' + (err?.message ?? err));
    }
  }

  async function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id)); // optimistic
    await db.removeProject(id);
  }

  function getProject(id) {
    return projects.find(p => p.id === id) ?? null;
  }

  function getProjectsByClient(clientId) {
    return projects.filter(p => p.clientId === clientId);
  }

  async function addTask(projectId, text) {
    const project  = projects.find(p => p.id === projectId);
    const tasks    = [...(project.tasks ?? []), { id: genId(), text, done: false }];
    const entry    = logEntry('task_added', `Task aggiunto: ${text}`);
    const activity = [...(project.activity ?? []), entry];
    await updateProject(projectId, { tasks, activity });
    fireWebhook({ event: 'task_added', project: project.title, task: text });
  }

  async function toggleTask(projectId, taskId) {
    const project = projects.find(p => p.id === projectId);
    const task    = project.tasks.find(t => t.id === taskId);
    const tasks   = project.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    // Log only when marking as completed (not when un-completing)
    const extras  = {};
    if (task && !task.done) {
      const entry = logEntry('task_completed', `Task completato: ${task.text}`);
      extras.activity = [...(project.activity ?? []), entry];
    }
    await updateProject(projectId, { tasks, ...extras });
  }

  async function deleteTask(projectId, taskId) {
    const project = projects.find(p => p.id === projectId);
    const tasks   = project.tasks.filter(t => t.id !== taskId);
    await updateProject(projectId, { tasks });
  }

  return {
    projects,
    addProject, updateProject, deleteProject,
    getProject, getProjectsByClient,
    addTask, toggleTask, deleteTask,
  };
}

// ── Calendar Tasks ────────────────────────────────────────────────────────────

export function useCalendarTasks() {
  const { calendarTasks, setCalendarTasks, user } = useStore();

  async function addCalendarTask(data) {
    const task = await db.insertCalendarTask(user.id, data);
    setCalendarTasks(prev => [...prev, task]);
    return task;
  }

  async function updateCalendarTask(id, patch) {
    const current = calendarTasks.find(t => t.id === id);
    const merged = { ...current, ...patch };
    setCalendarTasks(prev => prev.map(t => t.id === id ? merged : t));
    try {
      await db.patchCalendarTask(id, patch);
    } catch (err) {
      console.error('[db] patchCalendarTask failed:', err);
      setCalendarTasks(prev => prev.map(t => t.id === id ? current : t));
    }
  }

  async function deleteCalendarTask(id) {
    setCalendarTasks(prev => prev.filter(t => t.id !== id));
    await db.removeCalendarTask(id);
  }

  return { calendarTasks, addCalendarTask, updateCalendarTask, deleteCalendarTask };
}
