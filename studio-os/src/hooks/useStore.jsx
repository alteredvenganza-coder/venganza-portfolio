import { createContext, useContext, useEffect, useState } from 'react';
import { genId } from '../lib/utils';
import * as db from '../lib/db';
import { useAuth } from './useAuth';
import { fireWebhook } from '../lib/webhook';

// ── Store context ──────────────────────────────────────────────────────────────

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [clients,  setClients]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    Promise.all([db.fetchClients(user.id), db.fetchProjects(user.id)])
      .then(([c, p]) => { setClients(c); setProjects(p); })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <StoreContext.Provider value={{ clients, setClients, projects, setProjects, loading, user }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
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
    const project = projects.find(p => p.id === projectId);
    const tasks   = [...(project.tasks ?? []), { id: genId(), text, done: false }];
    await updateProject(projectId, { tasks });
    fireWebhook({ event: 'task_added', project: project.title, task: text });
  }

  async function toggleTask(projectId, taskId) {
    const project = projects.find(p => p.id === projectId);
    const tasks   = project.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    await updateProject(projectId, { tasks });
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
