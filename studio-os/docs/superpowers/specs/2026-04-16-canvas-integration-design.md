# Canvas Integration — Design Spec

**Date:** 2026-04-16
**Status:** Approved for planning
**Author:** Brainstorming session

## Summary

Integrate a Milanote-style infinite canvas into Studio-OS as the new primary interface for client work. Each client gets multiple canvases, each canvas can hold creative cards (notes, images, moodboards) AND "smart" cards that read/write live data from existing Supabase tables (projects budget, calendar tasks, files). The canvas replaces the current `ClientDetail` page. Other CRM pages (Cashflow, Calendar, Pricing, Send File) remain unchanged.

## Goals

- One canvas-based workspace per client containing budget, tasks, files, moodboards, tech packs — everything connected to live CRM data
- Multiple canvases per client (e.g. "Moodboard SS26", "Tech Pack Jacket", "Social Plan March") so creative work is organized by theme
- Pre-built templates (18+) covering fashion, production, social, branding, planning workflows
- Single source of truth: canvas changes to budget/tasks update the same Supabase records the rest of the CRM uses
- Visual coherence: CRM stays dark glassmorphic burgundy, canvas itself is clean beige (Milanote-style) for clarity while working

## Non-Goals

- No replacement of `CashflowPage`, `CalendarPage`, `PricingMemoryPage`, `SendFilePage`, `LoginPage`, `DeliveryPage`, `TransferPage`
- No replacement of `ProjectForm`, `ClientForm`, AI contract scanning, Stripe webhooks, push notifications
- No real-time multi-user collaboration (single-user local tool)
- No mobile-first canvas UX (desktop primary; basic responsive ok)
- No "Mat-Ideas Renders" or "Altered Tech Packs" feature implementation in this scope — only their launcher tiles on home (linked to placeholder/disabled)

## Architecture Overview

### Approach: Canvas as a view of existing data

Canvas cards split into two kinds:

- **Static cards** — content lives entirely in `canvas_cards.data` jsonb (note, image, link, todo, board, heading)
- **Smart cards** — content is a live view of an existing record. `canvas_cards.ref_id` points to a row in `projects`, `calendar_tasks`, etc. The card renders that record's data and edits write back to the source table

Result: budget changes in a canvas card update the same `projects` row that `CashflowPage` reads. No data duplication, no sync issues.

## Database Schema

Three new tables. Existing tables (`clients`, `projects`, `calendar_tasks`, `cashflow_entries`, `deliveries`) untouched.

```sql
-- Each canvas belongs to a user, optionally tied to a client
create table public.canvases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  client_id uuid references public.clients on delete cascade,  -- null = studio-wide canvas
  name text not null,
  template text,                    -- 'moodboard'|'techpack'|'blank'|null
  thumbnail text,                   -- preview dataURL or svg snippet
  pan_x int default 0,
  pan_y int default 0,
  zoom numeric default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cards inside a canvas
create table public.canvas_cards (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.canvases on delete cascade not null,
  type text not null,               -- static: 'note'|'image'|'link'|'todo'|'board'|'heading'
                                    -- smart:  'budget'|'tasks'|'files'|'project-overview'
  x int not null,
  y int not null,
  w int default 230,
  h int,
  data jsonb default '{}',          -- type-specific content (text, items, url, imgUrl, ...)
  ref_id uuid,                      -- for smart cards: FK to projects/tasks/etc
  z_index int default 0,
  created_at timestamptz default now()
);

-- Connections between cards
create table public.canvas_connections (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.canvases on delete cascade not null,
  from_card uuid references public.canvas_cards on delete cascade not null,
  to_card uuid references public.canvas_cards on delete cascade not null
);

-- Indexes
create index canvases_user_idx on public.canvases(user_id);
create index canvases_client_idx on public.canvases(client_id);
create index canvas_cards_canvas_idx on public.canvas_cards(canvas_id);
create index canvas_connections_canvas_idx on public.canvas_connections(canvas_id);

-- RLS (owner-only, mirrors existing pattern)
alter table public.canvases enable row level security;
alter table public.canvas_cards enable row level security;
alter table public.canvas_connections enable row level security;

create policy "canvases_owner" on public.canvases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "canvas_cards_via_canvas" on public.canvas_cards
  for all using (exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid()));

create policy "canvas_connections_via_canvas" on public.canvas_connections
  for all using (exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid()));
```

### Smart card data shape

| type              | ref_id points to     | data jsonb            | renders                                       |
|-------------------|----------------------|-----------------------|-----------------------------------------------|
| `budget`          | `projects.id`        | `{}`                  | total budget, paid, remaining, progress bar; editable inline |
| `tasks`           | `projects.id` or null| `{filter: 'open'}`    | live calendar_tasks for that project/client   |
| `files`           | `projects.id`        | `{}`                  | list of project-files storage objects         |
| `project-overview`| `projects.id`        | `{}`                  | stage, type, payment status, links to detail  |

## Routing & Navigation

| Route                                | Page                  | Layout       | Notes |
|--------------------------------------|-----------------------|--------------|-------|
| `/`                                  | `HomePage` (new)      | dark CRM     | Replaces `Dashboard.jsx` |
| `/clients`                           | `ClientsPage`         | dark CRM     | Unchanged |
| `/clients/:id`                       | `ClientCanvasHub` (new)| dark CRM    | Replaces `ClientDetail.jsx`. Lists client's canvases. |
| `/clients/:id/canvas/:canvasId`      | `CanvasView` (new)    | full-screen, clean palette | Canvas tied to a client |
| `/canvas/:canvasId`                  | `CanvasView` (new)    | full-screen, clean palette | Studio-wide canvas |
| `/projects/:id`                      | `ProjectDetail`       | dark CRM     | Kept for full edit form, accessible from smart cards |
| `/cashflow`, `/calendario`, `/pricing`, `/send` | unchanged | dark CRM | All preserved |
| `/login`, `/consegna/:t`, `/transfer/:t` | unchanged         | as-is        | Preserved |

`Layout.jsx` wraps all routes EXCEPT canvas routes (canvas is full-screen). Sidebar gets new entry "Canvas Studio" linking to a default studio canvas.

## Component Architecture

```
src/
├── pages/
│   ├── HomePage.jsx               (new — replaces Dashboard.jsx)
│   ├── ClientCanvasHub.jsx        (new — replaces ClientDetail.jsx)
│   └── CanvasView.jsx             (new — full-screen canvas page)
├── canvas/                        (new module)
│   ├── CanvasEngine.jsx           (pan/zoom/drag, render cards, SVG connections)
│   ├── CanvasSidebar.jsx          (left toolbar with draggable element types)
│   ├── CanvasToolbar.jsx          (bottom toolbar: select/pan/connect/zoom/fit)
│   ├── CanvasMinimap.jsx
│   ├── TemplatePanel.jsx          (right slide-in template picker)
│   ├── AddPopup.jsx               (popup triggered by "+" on a card)
│   ├── ContextMenu.jsx            (right-click menu)
│   ├── AiPanel.jsx                (right slide-in MAT AI chat + plugins)
│   └── cards/
│       ├── NoteCard.jsx
│       ├── ImageCard.jsx
│       ├── LinkCard.jsx
│       ├── TodoCard.jsx
│       ├── BoardCard.jsx
│       ├── HeadingCard.jsx
│       ├── BudgetCard.jsx          (smart)
│       ├── TasksCard.jsx           (smart)
│       ├── FilesCard.jsx           (smart)
│       └── ProjectOverviewCard.jsx (smart)
├── hooks/
│   ├── useCanvas.js               (new — load + CRUD canvas/cards/connections)
│   └── useStore.js                (existing — extended with canvases)
└── lib/
    ├── db.js                      (existing — add canvas CRUD + mappers)
    └── canvas-templates.js        (new — 18+ template definitions, static)
```

### State management

`useCanvas(canvasId)` loads a single canvas: its cards array, connections, viewport. Mutations debounced (150ms) before hitting Supabase to avoid write storms during drag. Pan/zoom state local-only; persisted on `mouseup`.

Smart cards subscribe to `useStore()` for their underlying data (projects, calendar_tasks). Updates flow: canvas card edit → `updateProject(id, data)` from existing hook → `useStore` re-renders → all subscribed cards (and CashflowPage etc.) reflect the change.

### Visual scoping

Canvas pages render inside a `<div className="canvas-root">` that scopes a CSS variables block redefining the palette to clean beige (`--bg: #EDEAE3`, etc.) only within that subtree. The dark CRM theme remains the default everywhere else. No global CSS changes.

## HomePage Layout

Stays in dark CRM theme. Sections (top to bottom):

1. **Greeting header** — time-based greeting + tagline + "Nuovo Canvas" button (creates studio canvas)
2. **Module launcher** — 3 large feature cards:
   - Mat-Ideas Renders (placeholder, disabled)
   - Altered Tech Packs (placeholder, disabled)
   - Mat Ideas Canvas (active → opens new studio canvas)
   - Expandable "+" reveals 6 "Coming Soon" tools (decorative, copied from prototype)
3. **Guide section** — 6-step onboarding, progress bar, dismissible, state in localStorage
4. **Recent Canvases** — top 6 canvases by `updated_at desc`, thumbnail + name + client + relative time, click opens canvas
5. **Recent Clients** — top 6 clients by recent activity, click → `ClientCanvasHub`

## ClientCanvasHub Layout

Stays in dark CRM theme. Replaces current `ClientDetail.jsx`.

- Compact client header (name, brand, contact info, edit button)
- Quick-action row (email templates from existing logic, new project, etc.)
- Canvases grid (thumbnails) + "+ New Canvas" tile that opens template picker overlay
- (Optional) Compact list of client's projects below — for quick jump if user wants raw project edit

## Templates System

Stored in `src/lib/canvas-templates.js` as a static array. 18+ templates from the prototype HTML, organized in 6 categories: Fashion, Social Media, Production, Planning, Branding, Vendita. Each template defines: id, cat, accent color, name, description, tags, cards array (relative coords).

**Apply flow**: open `TemplatePanel` from canvas toolbar → search/filter → click "Applica" → cards are inserted at canvas viewport center (relative coords translated to absolute). Template is additive, never destructive. Applied template name stored in `canvases.template` field for reference.

Smart-card templates (e.g. "Project Overview") prompt user to pick a project on apply, populate `ref_id`.

## File Changes Summary

| File                                | Action      |
|-------------------------------------|-------------|
| `src/pages/Dashboard.jsx`           | DELETE      |
| `src/pages/ClientDetail.jsx`        | DELETE      |
| `src/App.jsx`                       | MODIFY (routes) |
| `src/components/Layout.jsx`         | MODIFY (sidebar entry, exclude canvas routes) |
| `src/lib/db.js`                     | MODIFY (canvas CRUD + mappers) |
| `src/hooks/useStore.js`             | MODIFY (add `canvases`) |
| `src/index.css`                     | MODIFY (add `.canvas-root` scoped palette) |
| `src/pages/HomePage.jsx`            | NEW |
| `src/pages/ClientCanvasHub.jsx`     | NEW |
| `src/pages/CanvasView.jsx`          | NEW |
| `src/canvas/*`                      | NEW (module) |
| `src/hooks/useCanvas.js`            | NEW |
| `src/lib/canvas-templates.js`       | NEW |
| `supabase/migrations/YYYYMMDD_canvas_tables.sql` | NEW |

Untouched: `ProjectDetail.jsx`, `CashflowPage.jsx`, `CalendarPage.jsx`, `PricingMemoryPage.jsx`, `SendFilePage.jsx`, `LoginPage.jsx`, `DeliveryPage.jsx`, `TransferPage.jsx`, `ClientsPage.jsx`, all forms (`ClientForm`, `ProjectForm`), all `/api/*`, all auth and integration logic.

## Implementation Order (for planning phase)

1. **DB migration** — 3 tables + RLS, run on Supabase
2. **Data layer** — `db.js` canvas CRUD + mappers, `useCanvas` hook, `useStore` extension
3. **Canvas engine** — `CanvasEngine.jsx` with pan/zoom/drag/select, scoped clean palette via `canvas-root`
4. **Static cards** — note, image, link, todo, board, heading components + `CanvasSidebar` drag, `CanvasToolbar`, `AddPopup`, `ContextMenu`, `Minimap`
5. **Templates** — `canvas-templates.js` with all 18+ defs, `TemplatePanel` UI
6. **Smart cards** — Budget, Tasks, Files, ProjectOverview wired to existing `useStore` data
7. **ClientCanvasHub** — new client page replacing `ClientDetail`
8. **HomePage** — new home replacing `Dashboard`
9. **AI panel** — MAT AI chat + plugin grid using existing Claude API endpoints
10. **Polish** — undo/redo, keyboard shortcuts, fit-zoom, save-on-drop debounce, thumbnail generation

## Open Questions

None at design time. To revisit during plan:

- Thumbnail generation strategy (canvas-to-image on save vs deferred render)
- Migration of any in-flight ClientDetail features (email templates inline)
- Whether smart "tasks" card writes back support task creation or only edit/complete
