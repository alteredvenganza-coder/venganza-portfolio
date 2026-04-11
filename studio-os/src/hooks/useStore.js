import { useLocalStorage } from './useLocalStorage';
import { STORAGE_CLIENTS, STORAGE_PROJECTS } from '../lib/constants';
import { genId } from '../lib/utils';

// ─── Clients ──────────────────────────────────────────────────────────────────
export function useClients() {
  const [clients, setClients] = useLocalStorage(STORAGE_CLIENTS, []);

  function addClient(data) {
    const client = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setClients(prev => [client, ...prev]);
    return client;
  }

  function updateClient(id, patch) {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id));
  }

  function getClient(id) {
    return clients.find(c => c.id === id) ?? null;
  }

  return { clients, addClient, updateClient, deleteClient, getClient };
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjects() {
  const [projects, setProjects] = useLocalStorage(STORAGE_PROJECTS, []);

  function addProject(data) {
    const project = {
      tasks: [],
      isPaused: false,
      pausedReason: '',
      paymentStatus: 'unpaid',
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [project, ...prev]);
    return project;
  }

  function updateProject(id, patch) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  function getProject(id) {
    return projects.find(p => p.id === id) ?? null;
  }

  function getProjectsByClient(clientId) {
    return projects.filter(p => p.clientId === clientId);
  }

  // Tasks
  function addTask(projectId, text) {
    updateProject(projectId, {});
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: [...(p.tasks ?? []), { id: genId(), text, done: false }],
        };
      })
    );
  }

  function toggleTask(projectId, taskId) {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        };
      })
    );
  }

  function deleteTask(projectId, taskId) {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
      })
    );
  }

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    getProjectsByClient,
    addTask,
    toggleTask,
    deleteTask,
  };
}
