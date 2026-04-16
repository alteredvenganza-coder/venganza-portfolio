# Calendar Task: Client & Project Association

## Summary

Add optional client and project selection to calendar tasks, with smart auto-fill and visual badges. Tasks linked to a client also appear in the client detail page.

## Database

**Migration:** Add 2 nullable FK columns to `calendar_tasks`:

```sql
ALTER TABLE public.calendar_tasks
  ADD COLUMN client_id  uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
```

- `ON DELETE SET NULL` ensures tasks survive if a client/project is deleted.
- No index needed yet (small dataset per user, RLS already filters by user_id).

## Task Creation Form (CalendarPage.jsx)

### New Fields

Add two select dropdowns **after the color picker, before the reminder**:

1. **Cliente** — lists all user's clients from `useClients()`
   - Default: "Nessuno" (null)
   - Searchable if 5+ clients (type-to-filter in dropdown)

2. **Progetto** — lists active projects (stage NOT in `archived`, `completed`, `delivered`)
   - Default: "Nessuno" (null)
   - When a client is selected, filters to only that client's projects
   - When no client selected, shows all active projects

### Smart Auto-Fill Behavior

- **Select a project that has a client_id** → client field auto-fills with that project's client
- **Select a client** → project dropdown filters to that client's projects; if current project doesn't belong to new client, project resets to "Nessuno"
- **Clear client** → project filter resets to show all; current project stays if it has no client_id, otherwise resets
- **Clear project** → client stays (you can have a client-only task)

### Edit Mode

When editing an existing task, pre-populate client/project selects from the task data.

## Calendar Visualization

### Task Badge (in calendar grid + day detail panel)

When a task has a client and/or project:

- Show a small badge below the task title
- Format: `ClientName` or `ClientName · ProjectTitle` (if both)
- If only project (no client): show `ProjectTitle`
- Badge styling: `text-xs text-zinc-500 truncate` (subtle, doesn't compete with task color)
- Max width: truncate with ellipsis if too long

### Day Detail Panel

In the right sidebar task list, same badge appears under each task title.

## Client Detail Page (ClientDetail.jsx)

### New Section: "Task Calendario"

- Position: after existing project list section
- Shows all `calendar_tasks` where `client_id` matches, ordered by `date DESC`
- Each row: checkbox (isDone toggle), title, date, time range (if set), color dot
- Clicking a task opens the calendar page scrolled to that task's date (optional, can be v2)
- Empty state: "Nessuna task collegata a questo cliente"

### Data Fetching

- New function in `db.js`: `fetchCalendarTasksByClient(clientId)` — simple select with filter
- Called in ClientDetail on mount

## Data Layer Changes

### db.js

- `calTaskFromDb()`: add `clientId` ← `client_id`, `projectId` ← `project_id`
- `calTaskToDb()`: add `client_id` ← `clientId`, `project_id` ← `projectId`
- New: `fetchCalendarTasksByClient(clientId)` — returns tasks for a specific client

### useStore.jsx

- `useCalendarTasks()`: no structural changes, just passes new fields through existing CRUD
- Needs access to `clients` and `projects` lists (already available via `useClients()` and `useProjects()`)

## Files to Modify

| File | Change |
|------|--------|
| `supabase/migration.sql` | Add client_id, project_id columns |
| `src/lib/db.js` | Update field mappings + new fetch function |
| `src/pages/CalendarPage.jsx` | Form fields + badge rendering |
| `src/pages/ClientDetail.jsx` | New "Task Calendario" section |
| `src/hooks/useStore.jsx` | Minor: ensure new fields flow through |

## Out of Scope

- Clicking task in ClientDetail to navigate to calendar date (v2)
- Filtering calendar view by client/project (v2)
- Notifications/reminders tied to client context
- Project detail page showing calendar tasks (user only asked for client detail)
