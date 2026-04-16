# Calendar Task: Client & Project Association — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow calendar tasks to be optionally linked to a client and/or project, with smart auto-fill, visual badges in the calendar, and a "Task Calendario" section on the client detail page.

**Architecture:** Add `client_id` and `project_id` nullable FK columns to `calendar_tasks`. Update the task form with two optional select dropdowns that auto-fill intelligently. Render a small badge below the task title in the calendar. Add a new section to ClientDetail that queries tasks by client.

**Tech Stack:** React, Supabase (Postgres), Tailwind CSS, Lucide icons

---

### Task 1: Database Migration — Add FK Columns

**Files:**
- Modify: `supabase/migration.sql:172-193`

- [ ] **Step 1: Add the ALTER TABLE statements to migration.sql**

Append after line 193 (after the RLS policy for calendar_tasks):

```sql
-- ── Calendar Tasks: client/project association ──────────────
alter table public.calendar_tasks
  add column if not exists client_id  uuid references public.clients(id)  on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null;
```

- [ ] **Step 2: Run the migration on Supabase**

Execute the ALTER TABLE via the Supabase MCP `apply_migration` tool or SQL Editor.

- [ ] **Step 3: Verify columns exist**

Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'calendar_tasks' AND column_name IN ('client_id', 'project_id');`

Expected: Two rows returned.

- [ ] **Step 4: Commit**

```bash
git add supabase/migration.sql
git commit -m "feat(db): add client_id and project_id FK to calendar_tasks"
```

---

### Task 2: Data Layer — Update db.js Mappings

**Files:**
- Modify: `src/lib/db.js:157-217`

- [ ] **Step 1: Update calTaskFromDb to include clientId and projectId**

In `src/lib/db.js`, replace the `calTaskFromDb` function (lines 157-171):

```javascript
function calTaskFromDb(row) {
  return {
    id:              row.id,
    userId:          row.user_id,
    title:           row.title,
    description:     row.description,
    date:            row.date,
    timeStart:       row.time_start,
    timeEnd:         row.time_end,
    color:           row.color,
    isDone:          row.is_done,
    reminderMinutes: row.reminder_minutes,
    clientId:        row.client_id ?? null,
    projectId:       row.project_id ?? null,
    createdAt:       row.created_at,
  };
}
```

- [ ] **Step 2: Update calTaskToDb to include client_id and project_id**

In `src/lib/db.js`, replace the `calTaskToDb` function (lines 173-184):

```javascript
function calTaskToDb(t) {
  const row = {};
  if ('title'           in t) row.title            = t.title;
  if ('description'     in t) row.description      = t.description;
  if ('date'            in t) row.date             = t.date;
  if ('timeStart'       in t) row.time_start       = t.timeStart ?? null;
  if ('timeEnd'         in t) row.time_end         = t.timeEnd ?? null;
  if ('color'           in t) row.color            = t.color;
  if ('isDone'          in t) row.is_done          = t.isDone;
  if ('reminderMinutes' in t) row.reminder_minutes = t.reminderMinutes ?? null;
  if ('clientId'        in t) row.client_id        = t.clientId || null;
  if ('projectId'       in t) row.project_id       = t.projectId || null;
  return row;
}
```

- [ ] **Step 3: Add fetchCalendarTasksByClient function**

Add after the `removeCalendarTask` function (after line 217):

```javascript
export async function fetchCalendarTasksByClient(clientId) {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(calTaskFromDb);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.js
git commit -m "feat(db): add clientId/projectId to calendar task mappings"
```

---

### Task 3: Calendar Form — Add Client & Project Selects

**Files:**
- Modify: `src/pages/CalendarPage.jsx`

- [ ] **Step 1: Add User icon import**

In `src/pages/CalendarPage.jsx` line 4, add `User` and `Briefcase` to the lucide-react import:

```javascript
import {
  ChevronLeft, ChevronRight, AlertTriangle,
  Plus, Check, Clock, Trash2, Edit2, Bell, Calendar,
  User, Briefcase,
} from 'lucide-react';
```

- [ ] **Step 2: Add clientId and projectId to EMPTY_FORM**

Replace the `EMPTY_FORM` constant (lines 45-53):

```javascript
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
```

- [ ] **Step 3: Extract clients and projects from hooks**

In the component body (around line 105-106), update to also get `clients` and `projects`:

```javascript
const { projects }       = useProjects();
const { clients, getClient } = useClients();
const { calendarTasks, addCalendarTask, updateCalendarTask, deleteCalendarTask } = useCalendarTasks();
```

- [ ] **Step 4: Compute activeProjectsList for the select dropdown**

Add a `useMemo` after the existing `activeProjects` memo (after line 126):

```javascript
const activeProjectsList = useMemo(
  () => projects.filter(p => !['archived', 'completed', 'delivered'].includes(p.stage)),
  [projects],
);
```

- [ ] **Step 5: Compute filtered projects based on selected client**

Add another `useMemo` right after `activeProjectsList`:

```javascript
const filteredProjects = useMemo(() => {
  if (!form.clientId) return activeProjectsList;
  return activeProjectsList.filter(p => p.clientId === form.clientId);
}, [activeProjectsList, form.clientId]);
```

- [ ] **Step 6: Add auto-fill logic for client/project interaction**

Add two handler functions after `setField` (after line 236):

```javascript
function handleClientChange(clientId) {
  setForm(prev => {
    const next = { ...prev, clientId: clientId || '' };
    // If current project doesn't belong to new client, reset it
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
    // Auto-fill client from project
    if (projectId) {
      const proj = activeProjectsList.find(p => p.id === projectId);
      if (proj?.clientId) {
        next.clientId = proj.clientId;
      }
    }
    return next;
  });
}
```

- [ ] **Step 7: Update openEditModal to include clientId and projectId**

Replace the `openEditModal` function (lines 214-226):

```javascript
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
```

- [ ] **Step 8: Update handleSave to include clientId and projectId in payload**

Replace the payload construction in `handleSave` (lines 242-249):

```javascript
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
```

- [ ] **Step 9: Add Client and Project select fields to the modal**

In the modal JSX, add the two selects **after the color picker `</Field>` and before the reminder `<Field>`** (between lines 700 and 702):

```jsx
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
```

- [ ] **Step 10: Verify the form renders correctly**

Run: `npm run dev` and open the calendar. Click "Nuova task", verify:
- Client dropdown shows all clients
- Project dropdown shows active projects
- Selecting a project auto-fills the client
- Selecting a client filters the project list
- Saving with client/project works

- [ ] **Step 11: Commit**

```bash
git add src/pages/CalendarPage.jsx
git commit -m "feat(calendar): add client and project selects to task form"
```

---

### Task 4: Calendar Badges — Show Client/Project on Tasks

**Files:**
- Modify: `src/pages/CalendarPage.jsx`

- [ ] **Step 1: Add a helper to get the badge label for a task**

Add after the `formatTimeRange` helper (after line 100):

```javascript
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
```

- [ ] **Step 2: Add badge to task pills in calendar grid cells**

In the task pills rendering (around line 425-439), add the badge after the title. Replace the task pill `<div>`:

```jsx
{dayTasks.slice(0, dayProjects.length > 0 ? 1 : 2).map(t => {
  const c = TASK_COLORS[t.color] ?? TASK_COLORS.burgundy;
  const badge = taskBadgeLabel(t, getClient, projects);
  return (
    <div
      key={t.id}
      className={`truncate text-[9px] sm:text-[10px] font-mono leading-tight rounded px-1 py-px ${t.isDone ? 'line-through opacity-50' : ''}`}
      style={{ backgroundColor: c.bg, color: c.text }}
      title={`${t.title}${badge ? ` — ${badge}` : ''}`}
    >
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
        {t.title}
      </span>
    </div>
  );
})}
```

- [ ] **Step 3: Add badge to tasks in the day detail panel**

In the day detail task list (around line 506-531), add the badge label after the time/reminder row. Insert this after the time/reminder `<div>` (after the closing `</div>` at what was line 526):

```jsx
{(() => {
  const badge = taskBadgeLabel(task, getClient, projects);
  return badge ? (
    <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
      {task.clientId && <User size={10} className="inline mr-1 -mt-px" />}
      {badge}
    </span>
  ) : null;
})()}
```

- [ ] **Step 4: Verify badges render**

Run dev server, create a task with a client/project. Verify:
- Calendar grid shows the task title (badge is in tooltip on grid since space is tight)
- Day detail panel shows the badge text below time

- [ ] **Step 5: Commit**

```bash
git add src/pages/CalendarPage.jsx
git commit -m "feat(calendar): show client/project badge on tasks"
```

---

### Task 5: Client Detail — Task Calendario Section

**Files:**
- Modify: `src/pages/ClientDetail.jsx`

- [ ] **Step 1: Add imports**

At the top of `src/pages/ClientDetail.jsx`, add the needed imports. Update line 1-4:

```javascript
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, Plus, Mail, Phone, Globe, FileText, Check, Clock, Calendar } from 'lucide-react';
```

Add the db import after the existing imports (after line 12):

```javascript
import * as db from '../lib/db';
```

Also import `useCalendarTasks` from the store hook — update line 11:

```javascript
import { useClients, useProjects, useCalendarTasks } from '../hooks/useStore';
```

- [ ] **Step 2: Add state and data fetching for client calendar tasks**

Inside the `ClientDetail` component, after the existing hooks (after line 21), add:

```javascript
const { updateCalendarTask } = useCalendarTasks();
const [clientTasks, setClientTasks] = useState([]);

useEffect(() => {
  if (!id) return;
  db.fetchCalendarTasksByClient(id).then(setClientTasks).catch(console.error);
}, [id]);
```

- [ ] **Step 3: Add the "Task Calendario" section in the JSX**

Insert this section after the projects section closing tag (before the edit modal, before line 166 `{/* Edit modal */}`):

```jsx
{/* Calendar tasks for this client */}
<div className="mt-6">
  <h2 className="font-display text-lg sm:text-xl font-semibold text-ink mb-3 sm:mb-4">
    Task Calendario <span className="text-muted font-sans text-base font-normal">({clientTasks.length})</span>
  </h2>

  {clientTasks.length === 0 ? (
    <div className="glass rounded-lg p-6 text-center">
      <Calendar size={24} className="text-subtle mx-auto mb-2" />
      <p className="text-sm text-muted">Nessuna task collegata a questo cliente.</p>
    </div>
  ) : (
    <div className="glass rounded-lg divide-y divide-border">
      {clientTasks.map(task => {
        const TASK_COLORS = {
          burgundy: '#c9888b', blue: '#7bb3ff', green: '#6dd49e',
          yellow: '#f5e0a0', purple: '#c4a5ff',
        };
        const dotColor = TASK_COLORS[task.color] ?? TASK_COLORS.burgundy;
        return (
          <div key={task.id} className="flex items-center gap-3 px-4 py-3">
            {/* Checkbox */}
            <button
              onClick={async () => {
                const newVal = !task.isDone;
                await updateCalendarTask(task.id, { isDone: newVal });
                setClientTasks(prev => prev.map(t => t.id === task.id ? { ...t, isDone: newVal } : t));
              }}
              className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                task.isDone ? 'bg-white/20 border-white/30' : 'border-white/20 hover:border-white/40'
              }`}
            >
              {task.isDone && <Check size={10} className="text-muted" />}
            </button>

            {/* Color dot */}
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm text-ink truncate block ${task.isDone ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </span>
            </div>

            {/* Time */}
            {task.timeStart && (
              <span className="text-[11px] font-mono text-subtle flex items-center gap-1 shrink-0">
                <Clock size={10} />
                {task.timeStart}{task.timeEnd ? ` - ${task.timeEnd}` : ''}
              </span>
            )}

            {/* Date */}
            <span className="text-[11px] font-mono text-subtle shrink-0">
              {task.date}
            </span>
          </div>
        );
      })}
    </div>
  )}
</div>
```

- [ ] **Step 4: Verify the section renders on the client detail page**

Run dev server, go to a client detail page. Verify:
- "Task Calendario" section appears below projects
- Shows empty state if no tasks linked
- Create a task in calendar linked to this client, refresh client page, verify it appears
- Checkbox toggle works

- [ ] **Step 5: Commit**

```bash
git add src/pages/ClientDetail.jsx
git commit -m "feat(client): show linked calendar tasks on client detail page"
```

---

### Task 6: Final Verification

- [ ] **Step 1: End-to-end test**

1. Open calendar, create a new task
2. Select a project → verify client auto-fills
3. Save → verify badge shows in day detail panel
4. Go to client detail page → verify the task appears in "Task Calendario"
5. Toggle done on client page → verify it updates
6. Edit the task from calendar → verify client/project are pre-populated
7. Create a task with only a client (no project) → verify badge shows just client name
8. Create a task with no client/no project → verify no badge, everything works as before

- [ ] **Step 2: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: polish calendar task client/project feature"
```
