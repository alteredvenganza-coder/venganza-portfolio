# Canvas Integration — Phase 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Milanote-style canvas engine with all static cards (note, image, link, todo, board, heading), templates system, drag-from-sidebar, toolbar, minimap, and connections — accessible at `/canvas/:canvasId`. No CRM data integration yet (Phase 2). No HomePage replacement (Phase 3).

**Architecture:** Three new Supabase tables (`canvases`, `canvas_cards`, `canvas_connections`) with RLS. New `src/canvas/` React module with engine + card components. New `useCanvas` hook for single-canvas state with debounced sync. Clean beige palette scoped to `.canvas-root` so dark CRM theme is untouched.

**Tech Stack:** React 19, Supabase, Tailwind CSS, react-router-dom v7. No new dependencies.

**End state of Phase 1:** From the existing app you can navigate to `/canvas/test` (or any id), get auto-created canvas, drag elements from sidebar, edit them, apply templates, save changes. CRM (Dashboard, Clients, etc.) unchanged.

---

### Task 1: Database Migration — Canvas Tables

**Files:**
- Modify: `supabase/migration.sql` (append to end)

- [ ] **Step 1: Append the migration SQL to `supabase/migration.sql`**

Append at the end of the file:

```sql
-- ── Canvas tables ─────────────────────────────────────────────

create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id) on delete cascade,
  name text not null default 'Untitled Canvas',
  template text,
  thumbnail text,
  pan_x int default 0,
  pan_y int default 0,
  zoom numeric default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.canvas_cards (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.canvases(id) on delete cascade not null,
  type text not null,
  x int not null,
  y int not null,
  w int default 230,
  h int,
  data jsonb default '{}'::jsonb,
  ref_id uuid,
  z_index int default 0,
  created_at timestamptz default now()
);

create table if not exists public.canvas_connections (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.canvases(id) on delete cascade not null,
  from_card uuid references public.canvas_cards(id) on delete cascade not null,
  to_card uuid references public.canvas_cards(id) on delete cascade not null
);

create index if not exists canvases_user_idx        on public.canvases(user_id);
create index if not exists canvases_client_idx      on public.canvases(client_id);
create index if not exists canvas_cards_canvas_idx  on public.canvas_cards(canvas_id);
create index if not exists canvas_connections_canvas_idx on public.canvas_connections(canvas_id);

alter table public.canvases            enable row level security;
alter table public.canvas_cards        enable row level security;
alter table public.canvas_connections  enable row level security;

create policy "canvases_owner" on public.canvases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "canvas_cards_via_canvas" on public.canvas_cards
  for all using (
    exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid())
  );

create policy "canvas_connections_via_canvas" on public.canvas_connections
  for all using (
    exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.canvases c where c.id = canvas_id and c.user_id = auth.uid())
  );
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with name `canvas_tables` and the SQL block from Step 1 above.

- [ ] **Step 3: Verify tables exist**

Run via `mcp__supabase__execute_sql`:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'canvas%';
```

Expected: 3 rows returned (`canvases`, `canvas_cards`, `canvas_connections`).

- [ ] **Step 4: Commit**

```bash
git add supabase/migration.sql
git commit -m "feat(db): add canvas tables (canvases, canvas_cards, canvas_connections)"
```

---

### Task 2: Data Layer — Canvas Mappers and CRUD in db.js

**Files:**
- Modify: `src/lib/db.js` (append at end)

- [ ] **Step 1: Append canvas section to `src/lib/db.js`**

Append at the very end of the file:

```javascript
// ── Canvases ──────────────────────────────────────────────────────────────────

function canvasFromDb(row) {
  return {
    id:        row.id,
    clientId:  row.client_id,
    name:      row.name,
    template:  row.template,
    thumbnail: row.thumbnail,
    panX:      row.pan_x ?? 0,
    panY:      row.pan_y ?? 0,
    zoom:      row.zoom != null ? Number(row.zoom) : 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function canvasToDb(c) {
  const row = {};
  if ('clientId'  in c) row.client_id = c.clientId || null;
  if ('name'      in c) row.name      = c.name;
  if ('template'  in c) row.template  = c.template;
  if ('thumbnail' in c) row.thumbnail = c.thumbnail;
  if ('panX'      in c) row.pan_x     = Math.round(Number(c.panX) || 0);
  if ('panY'      in c) row.pan_y     = Math.round(Number(c.panY) || 0);
  if ('zoom'      in c) row.zoom      = Number(c.zoom) || 1;
  return row;
}

export async function fetchCanvases(userId) {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(canvasFromDb);
}

export async function fetchCanvasById(id) {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return canvasFromDb(data);
}

export async function insertCanvas(userId, data) {
  const { data: row, error } = await supabase
    .from('canvases')
    .insert({ user_id: userId, ...canvasToDb(data) })
    .select()
    .single();
  if (error) throw error;
  return canvasFromDb(row);
}

export async function patchCanvas(id, patch) {
  const row = { ...canvasToDb(patch), updated_at: new Date().toISOString() };
  const { error } = await supabase.from('canvases').update(row).eq('id', id);
  if (error) throw error;
}

export async function removeCanvas(id) {
  const { error } = await supabase.from('canvases').delete().eq('id', id);
  if (error) throw error;
}

// ── Canvas cards ──────────────────────────────────────────────────────────────

function cardFromDb(row) {
  return {
    id:       row.id,
    canvasId: row.canvas_id,
    type:     row.type,
    x:        row.x,
    y:        row.y,
    w:        row.w ?? 230,
    h:        row.h,
    data:     row.data ?? {},
    refId:    row.ref_id,
    zIndex:   row.z_index ?? 0,
  };
}

function cardToDb(c) {
  const row = {};
  if ('canvasId' in c) row.canvas_id = c.canvasId;
  if ('type'     in c) row.type      = c.type;
  if ('x'        in c) row.x         = Math.round(c.x);
  if ('y'        in c) row.y         = Math.round(c.y);
  if ('w'        in c) row.w         = Math.round(c.w);
  if ('h'        in c) row.h         = c.h != null ? Math.round(c.h) : null;
  if ('data'     in c) row.data      = c.data ?? {};
  if ('refId'    in c) row.ref_id    = c.refId || null;
  if ('zIndex'   in c) row.z_index   = c.zIndex ?? 0;
  return row;
}

export async function fetchCanvasCards(canvasId) {
  const { data, error } = await supabase
    .from('canvas_cards')
    .select('*')
    .eq('canvas_id', canvasId)
    .order('z_index', { ascending: true });
  if (error) throw error;
  return data.map(cardFromDb);
}

export async function insertCanvasCard(canvasId, data) {
  const { data: row, error } = await supabase
    .from('canvas_cards')
    .insert({ canvas_id: canvasId, ...cardToDb({ ...data, canvasId }) })
    .select()
    .single();
  if (error) throw error;
  return cardFromDb(row);
}

export async function patchCanvasCard(id, patch) {
  const { error } = await supabase
    .from('canvas_cards')
    .update(cardToDb(patch))
    .eq('id', id);
  if (error) throw error;
}

export async function removeCanvasCard(id) {
  const { error } = await supabase.from('canvas_cards').delete().eq('id', id);
  if (error) throw error;
}

// ── Canvas connections ────────────────────────────────────────────────────────

function connFromDb(row) {
  return {
    id:       row.id,
    canvasId: row.canvas_id,
    fromCard: row.from_card,
    toCard:   row.to_card,
  };
}

export async function fetchCanvasConnections(canvasId) {
  const { data, error } = await supabase
    .from('canvas_connections')
    .select('*')
    .eq('canvas_id', canvasId);
  if (error) throw error;
  return data.map(connFromDb);
}

export async function insertCanvasConnection(canvasId, fromCard, toCard) {
  const { data: row, error } = await supabase
    .from('canvas_connections')
    .insert({ canvas_id: canvasId, from_card: fromCard, to_card: toCard })
    .select()
    .single();
  if (error) throw error;
  return connFromDb(row);
}

export async function removeCanvasConnection(id) {
  const { error } = await supabase.from('canvas_connections').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Verify the file parses (no syntax errors)**

Run: `cd studio-os && node --check src/lib/db.js`
Expected: no output (success). If error, fix syntax.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.js
git commit -m "feat(db): canvas mappers and CRUD functions"
```

---

### Task 3: useCanvas Hook — Single Canvas State with Debounced Sync

**Files:**
- Create: `src/hooks/useCanvas.js`

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useCanvas.js` with this content:

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';
import * as db from '../lib/db';

/**
 * Single-canvas hook. Loads canvas metadata + cards + connections by id,
 * exposes mutations with debounced Supabase sync.
 */
export function useCanvas(canvasId) {
  const [canvas, setCanvas]           = useState(null);
  const [cards, setCards]             = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Pending patches keyed by entity id. Flushed on debounce timer.
  const pendingCardPatches    = useRef(new Map());
  const pendingCanvasPatch    = useRef(null);
  const flushTimer            = useRef(null);

  // ─── Load on mount / id change ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      db.fetchCanvasById(canvasId),
      db.fetchCanvasCards(canvasId),
      db.fetchCanvasConnections(canvasId),
    ]).then(([cv, cs, cn]) => {
      if (cancelled) return;
      setCanvas(cv);
      setCards(cs);
      setConnections(cn);
    }).catch(err => {
      if (!cancelled) setError(err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [canvasId]);

  // ─── Debounced flush ───────────────────────────────────────────────────────
  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(async () => {
      flushTimer.current = null;
      // Cards
      const entries = Array.from(pendingCardPatches.current.entries());
      pendingCardPatches.current.clear();
      for (const [id, patch] of entries) {
        try { await db.patchCanvasCard(id, patch); }
        catch (e) { console.error('[useCanvas] patchCard failed', e); }
      }
      // Canvas metadata
      const cvPatch = pendingCanvasPatch.current;
      pendingCanvasPatch.current = null;
      if (cvPatch && canvasId) {
        try { await db.patchCanvas(canvasId, cvPatch); }
        catch (e) { console.error('[useCanvas] patchCanvas failed', e); }
      }
    }, 300);
  }, [canvasId]);

  // Flush on unmount
  useEffect(() => () => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      // Fire-and-forget final flush
      const entries = Array.from(pendingCardPatches.current.entries());
      pendingCardPatches.current.clear();
      entries.forEach(([id, patch]) =>
        db.patchCanvasCard(id, patch).catch(e => console.error(e)));
      const cvPatch = pendingCanvasPatch.current;
      pendingCanvasPatch.current = null;
      if (cvPatch && canvasId) db.patchCanvas(canvasId, cvPatch).catch(e => console.error(e));
    }
  }, [canvasId]);

  // ─── Card mutations ────────────────────────────────────────────────────────
  async function addCard(partial) {
    const created = await db.insertCanvasCard(canvasId, partial);
    setCards(prev => [...prev, created]);
    return created;
  }

  function updateCard(id, patch) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    const merged = { ...(pendingCardPatches.current.get(id) || {}), ...patch };
    pendingCardPatches.current.set(id, merged);
    scheduleFlush();
  }

  async function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(cn => cn.fromCard !== id && cn.toCard !== id));
    pendingCardPatches.current.delete(id);
    try { await db.removeCanvasCard(id); }
    catch (e) { console.error('[useCanvas] deleteCard failed', e); }
  }

  // ─── Connection mutations ──────────────────────────────────────────────────
  async function addConnection(fromCard, toCard) {
    if (fromCard === toCard) return null;
    const exists = connections.some(cn => cn.fromCard === fromCard && cn.toCard === toCard);
    if (exists) return null;
    const created = await db.insertCanvasConnection(canvasId, fromCard, toCard);
    setConnections(prev => [...prev, created]);
    return created;
  }

  async function deleteConnection(id) {
    setConnections(prev => prev.filter(c => c.id !== id));
    try { await db.removeCanvasConnection(id); }
    catch (e) { console.error('[useCanvas] deleteConnection failed', e); }
  }

  // ─── Canvas metadata mutations ─────────────────────────────────────────────
  function updateCanvas(patch) {
    setCanvas(prev => prev ? { ...prev, ...patch } : prev);
    pendingCanvasPatch.current = { ...(pendingCanvasPatch.current || {}), ...patch };
    scheduleFlush();
  }

  return {
    canvas, cards, connections,
    loading, error,
    addCard, updateCard, deleteCard,
    addConnection, deleteConnection,
    updateCanvas,
  };
}
```

- [ ] **Step 2: Verify file parses**

Run: `cd studio-os && node --check src/hooks/useCanvas.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCanvas.js
git commit -m "feat(canvas): useCanvas hook with debounced Supabase sync"
```

---

### Task 4: useStore Extension — Add Canvases List

**Files:**
- Modify: `src/hooks/useStore.jsx`

- [ ] **Step 1: Add canvases state and CRUD to StoreProvider**

In `src/hooks/useStore.jsx`, locate the `StoreProvider` function (around line 50). After the line:

```javascript
const [calendarTasks, setCalendarTasks] = useState([]);
```

add:

```javascript
const [canvases, setCanvases] = useState([]);
```

Then locate the `useEffect` that does `Promise.all(...)` (around line 78) and replace it with:

```javascript
useEffect(() => {
  if (!user) { setLoading(false); return; }

  setLoading(true);
  Promise.all([
    db.fetchClients(user.id),
    db.fetchProjects(user.id),
    db.fetchCalendarTasks(user.id),
    db.fetchCanvases(user.id),
  ])
    .then(([c, p, ct, cv]) => {
      setClients(c); setProjects(p); setCalendarTasks(ct); setCanvases(cv);
    })
    .finally(() => setLoading(false));
}, [user]);
```

Then update the StoreContext.Provider value (around line 84). Replace the value object with:

```javascript
value={{
  clients, setClients,
  projects, setProjects,
  calendarTasks, setCalendarTasks,
  canvases, setCanvases,
  loading, user,
  goals, updateGoals,
}}
```

- [ ] **Step 2: Add `useCanvases` hook at the end of the file**

Append at the very end of `src/hooks/useStore.jsx`:

```javascript
// ── Canvases ──────────────────────────────────────────────────────────────────

export function useCanvases() {
  const { canvases, setCanvases, user } = useStore();

  async function addCanvas(data) {
    const canvas = await db.insertCanvas(user.id, data);
    setCanvases(prev => [canvas, ...prev]);
    return canvas;
  }

  async function updateCanvasMeta(id, patch) {
    const current = canvases.find(c => c.id === id);
    const merged  = { ...current, ...patch };
    setCanvases(prev => prev.map(c => c.id === id ? merged : c));
    await db.patchCanvas(id, patch);
  }

  async function deleteCanvas(id) {
    setCanvases(prev => prev.filter(c => c.id !== id));
    await db.removeCanvas(id);
  }

  function getCanvas(id) {
    return canvases.find(c => c.id === id) ?? null;
  }

  function getCanvasesByClient(clientId) {
    return canvases.filter(c => c.clientId === clientId);
  }

  function getStudioCanvases() {
    return canvases.filter(c => !c.clientId);
  }

  return {
    canvases,
    addCanvas, updateCanvasMeta, deleteCanvas,
    getCanvas, getCanvasesByClient, getStudioCanvases,
  };
}
```

- [ ] **Step 3: Verify file parses**

Run: `cd studio-os && node --check src/hooks/useStore.jsx`
Expected: may fail because of JSX — instead start the dev server (already running on port 52337 as `studio-os`) and check the preview console. Use `mcp__Claude_Preview__preview_console_logs` with name `studio-os`. Expected: no parse errors related to useStore.jsx.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useStore.jsx
git commit -m "feat(store): canvases state + useCanvases hook"
```

---

### Task 5: Scoped Clean Palette CSS

**Files:**
- Modify: `src/index.css` (append at end)

- [ ] **Step 1: Append `.canvas-root` scoped palette to `src/index.css`**

Append at the very end of `src/index.css`:

```css
/* ────────────────────────────────────────────────────────────────────────────
   Canvas — clean Milanote-style palette (scoped to .canvas-root subtree)
   The dark CRM theme remains the global default.
   ──────────────────────────────────────────────────────────────────────────── */

.canvas-root {
  --cv-bg:       #EDEAE3;
  --cv-bg2:     #E5E1D8;
  --cv-surface: #F4F1EB;
  --cv-white:   #FFFFFF;
  --cv-border:  #DEDAD2;
  --cv-border2: #E8E4DC;
  --cv-text:    #1A1816;
  --cv-muted:   #8C8880;
  --cv-muted2:  #B0ACA4;
  --cv-dot:     #C8C3B8;
  --cv-red:     #B83025;
  --cv-gold:    #9A7310;
  --cv-gold2:   #D4B870;
  --cv-orange:  #B04820;
  --cv-sage:    #4A6A4A;
  --cv-purple:  #6B5EA8;
  --cv-shadow:  0 2px 14px rgba(26,24,22,.07);
  --cv-shadow-lg: 0 6px 28px rgba(26,24,22,.11);

  position: fixed;
  inset: 0;
  background: var(--cv-bg);
  color: var(--cv-text);
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  z-index: 100;
}

.canvas-root *, .canvas-root *::before, .canvas-root *::after {
  box-sizing: border-box;
}

.canvas-root input,
.canvas-root textarea,
.canvas-root select {
  background: transparent;
  border: 1px solid var(--cv-border);
  color: var(--cv-text);
  border-radius: 5px;
  padding: 6px 9px;
  font-size: 12px;
}
.canvas-root input::placeholder,
.canvas-root textarea::placeholder {
  color: var(--cv-muted2);
}
.canvas-root input:focus,
.canvas-root textarea:focus,
.canvas-root select:focus {
  border-color: var(--cv-gold2);
  outline: none;
}

.canvas-root ::-webkit-scrollbar { width: 4px; height: 4px; }
.canvas-root ::-webkit-scrollbar-track { background: transparent; }
.canvas-root ::-webkit-scrollbar-thumb { background: var(--cv-border); border-radius: 2px; }
```

- [ ] **Step 2: Visual sanity check**

Use `mcp__Claude_Preview__preview_eval` with name `studio-os`:

```javascript
const el = document.createElement('div');
el.className = 'canvas-root';
el.innerHTML = '<p style="padding:20px">Canvas palette test</p>';
document.body.appendChild(el);
const cs = getComputedStyle(el);
const ok = cs.backgroundColor === 'rgb(237, 234, 227)';
el.remove();
return { backgroundOk: ok, bg: cs.backgroundColor };
```

Expected: `{ backgroundOk: true, bg: "rgb(237, 234, 227)" }`. If false, the CSS isn't loading — verify the append and HMR fired.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(canvas): scoped clean palette CSS variables"
```

---

### Task 6: Routing — Add Canvas Routes (Layout Excluded)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import the new CanvasView page (placeholder for now)**

In `src/App.jsx`, after the existing page imports (around line 41), add:

```javascript
import CanvasView from './pages/CanvasView';
```

- [ ] **Step 2: Restructure AdminContent to render canvas full-screen (no Layout)**

Replace the entire `AdminContent` function (lines 65-85) with:

```javascript
function AdminContent() {
  const { loading } = useStore();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* Full-screen canvas routes — NO Layout wrapper */}
      <Route path="/canvas/:canvasId"                 element={<CanvasView />} />
      <Route path="/clients/:id/canvas/:canvasId"     element={<CanvasView />} />

      {/* All other routes wrapped in Layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/clients"       element={<ClientsPage />} />
            <Route path="/clients/:id"   element={<ClientDetail />} />
            <Route path="/projects/:id"  element={<ProjectDetail />} />
            <Route path="/pricing"       element={<PricingMemoryPage />} />
            <Route path="/cashflow"      element={<CashflowPage />} />
            <Route path="/calendario"    element={<CalendarPage />} />
            <Route path="/send"          element={<SendFilePage />} />
            <Route path="/inviti"        element={<AdminInvitesPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}
```

- [ ] **Step 3: Create the placeholder CanvasView page**

Create `src/pages/CanvasView.jsx`:

```javascript
import { useParams } from 'react-router-dom';

export default function CanvasView() {
  const { canvasId } = useParams();
  return (
    <div className="canvas-root">
      <div style={{ padding: 40 }}>
        <p>Canvas placeholder. id = {canvasId}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Use `mcp__Claude_Preview__preview_start` if not already running, then `mcp__Claude_Preview__preview_eval`:

```javascript
window.location.href = '/canvas/test123';
```

Wait 1s, then take a screenshot via `mcp__Claude_Preview__preview_screenshot` (name `studio-os`). Expected: clean beige page with text "Canvas placeholder. id = test123".

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): routing + placeholder CanvasView"
```

---

### Task 7: Canvas Engine — Pan/Zoom/Drag Foundation

**Files:**
- Create: `src/canvas/CanvasEngine.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create the engine component**

Create `src/canvas/CanvasEngine.jsx`:

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';

const WORLD_SIZE = 6000;
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 4;

/**
 * Stateless canvas viewport: handles pan/zoom and renders children
 * (cards, connections, etc.) inside a transformed world.
 *
 * Props:
 * - panX, panY, zoom: viewport state (controlled)
 * - onViewportChange({ panX, panY, zoom })
 * - tool: 'select' | 'pan' | 'connect'
 * - onBackgroundClick(worldX, worldY) — called on left-click on empty space
 * - onContextMenu(clientX, clientY, worldX, worldY)
 * - children — rendered inside the transformed world
 * - svgChildren — rendered inside the SVG layer (connections)
 */
export default function CanvasEngine({
  panX, panY, zoom, onViewportChange,
  tool = 'select',
  onBackgroundClick, onContextMenu,
  children, svgChildren,
}) {
  const wrapRef = useRef(null);
  const [isPanning, setIsPanning]   = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ─── Wheel: zoom (with ctrl/meta) or pan ──────────────────────────────────
  const onWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = wrapRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
      const newPanX = cx - (cx - panX) * (newZoom / zoom);
      const newPanY = cy - (cy - panY) * (newZoom / zoom);
      onViewportChange({ panX: newPanX, panY: newPanY, zoom: newZoom });
    } else {
      onViewportChange({ panX: panX - e.deltaX, panY: panY - e.deltaY, zoom });
    }
  }, [panX, panY, zoom, onViewportChange]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.addEventListener('wheel', onWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ─── Mouse: pan on background or pan tool ─────────────────────────────────
  function onMouseDown(e) {
    if (e.button !== 0) return;
    const target = e.target;
    const isBackground = target === wrapRef.current || target.dataset.canvasBg === '1';
    if (tool === 'pan' || isBackground) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      e.preventDefault();
    }
  }

  useEffect(() => {
    if (!isPanning) return;
    function move(e) {
      onViewportChange({
        panX: panStart.current.panX + (e.clientX - panStart.current.x),
        panY: panStart.current.panY + (e.clientY - panStart.current.y),
        zoom,
      });
    }
    function up() { setIsPanning(false); }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isPanning, zoom, onViewportChange]);

  function onClick(e) {
    if (e.target !== wrapRef.current && e.target.dataset.canvasBg !== '1') return;
    if (!onBackgroundClick) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const wx = (e.clientX - rect.left - panX) / zoom;
    const wy = (e.clientY - rect.top  - panY) / zoom;
    onBackgroundClick(wx, wy);
  }

  function onContextMenuLocal(e) {
    e.preventDefault();
    if (!onContextMenu) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const wx = (e.clientX - rect.left - panX) / zoom;
    const wy = (e.clientY - rect.top  - panY) / zoom;
    onContextMenu(e.clientX, e.clientY, wx, wy);
  }

  const cursor = isPanning ? 'grabbing' : tool === 'pan' ? 'grab' : tool === 'connect' ? 'crosshair' : 'default';

  return (
    <div
      ref={wrapRef}
      data-canvas-bg="1"
      onMouseDown={onMouseDown}
      onClick={onClick}
      onContextMenu={onContextMenuLocal}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--cv-bg)',
        backgroundImage: 'radial-gradient(circle, var(--cv-dot) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        cursor,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: WORLD_SIZE, height: WORLD_SIZE,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}>
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
        >
          {svgChildren}
        </svg>
        {children}
      </div>
    </div>
  );
}

export { WORLD_SIZE, MIN_ZOOM, MAX_ZOOM };
```

- [ ] **Step 2: Wire CanvasView to use the engine and useCanvas hook**

Replace `src/pages/CanvasView.jsx` with:

```javascript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvases } from '../hooks/useStore';
import CanvasEngine from '../canvas/CanvasEngine';

export default function CanvasView() {
  const { canvasId, id: clientId } = useParams();
  const navigate = useNavigate();
  const { addCanvas } = useCanvases();
  const [resolvedId, setResolvedId] = useState(canvasId === 'new' ? null : canvasId);

  // If canvasId is "new", create a fresh canvas and redirect
  useEffect(() => {
    if (canvasId !== 'new' || resolvedId) return;
    addCanvas({ name: 'Untitled Canvas', clientId: clientId || null })
      .then(c => {
        const target = clientId
          ? `/clients/${clientId}/canvas/${c.id}`
          : `/canvas/${c.id}`;
        navigate(target, { replace: true });
        setResolvedId(c.id);
      });
  }, [canvasId, clientId, addCanvas, navigate, resolvedId]);

  const { canvas, cards, loading, updateCanvas } = useCanvas(resolvedId);

  if (!resolvedId || loading) {
    return (
      <div className="canvas-root" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color: 'var(--cv-muted)', fontSize: 12 }}>Caricamento canvas…</p>
      </div>
    );
  }

  return (
    <div className="canvas-root">
      <CanvasEngine
        panX={canvas?.panX ?? 0}
        panY={canvas?.panY ?? 0}
        zoom={canvas?.zoom ?? 1}
        onViewportChange={({ panX, panY, zoom }) => updateCanvas({ panX, panY, zoom })}
      >
        {cards.map(c => (
          <div key={c.id} style={{
            position: 'absolute',
            left: c.x, top: c.y, width: c.w,
            background: 'var(--cv-white)',
            border: '1px solid var(--cv-border)',
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
          }}>
            [{c.type}] {c.data?.title || c.id.slice(0,6)}
          </div>
        ))}
      </CanvasEngine>
      {/* Top-left back button */}
      <button
        onClick={() => navigate(clientId ? `/clients/${clientId}` : '/')}
        style={{
          position:'absolute', top:14, left:14, zIndex:50,
          padding:'6px 12px', border:'1px solid var(--cv-border)',
          borderRadius:6, background:'var(--cv-white)', color:'var(--cv-text)',
          fontSize:11, fontFamily:'DM Sans', cursor:'pointer',
        }}
      >← Indietro</button>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

In `mcp__Claude_Preview__preview_eval` (name `studio-os`):

```javascript
window.location.href = '/canvas/new';
```

Wait 2s, take screenshot. Expected: clean beige canvas with dotted background, "← Indietro" button top-left. The URL should have changed from `/canvas/new` to `/canvas/<uuid>`.

Try wheel-zoom (Ctrl+wheel) and middle/background pan: visually the dot grid should move and scale. Take a second screenshot after panning manually if possible.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/CanvasEngine.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): engine with pan/zoom/wheel + auto-create on /canvas/new"
```

---

### Task 8: Card Shell — Reusable Card Wrapper with Drag & Resize

**Files:**
- Create: `src/canvas/cards/CardShell.jsx`

- [ ] **Step 1: Create the shell component**

Create `src/canvas/cards/CardShell.jsx`:

```javascript
import { useEffect, useRef, useState } from 'react';

const STRIP_COLORS = {
  note:    'var(--cv-gold2)',
  image:   '#6B8FA8',
  link:    'var(--cv-sage)',
  todo:    'var(--cv-purple)',
  board:   'var(--cv-orange)',
  heading: 'var(--cv-text)',
};

/**
 * Reusable wrapper for all cards.
 * Handles drag, resize, selection, action buttons (connect/duplicate/delete)
 * and the "+" button. Children render the type-specific body.
 *
 * Props:
 * - card: { id, type, x, y, w, ... }
 * - zoom: current canvas zoom (used for delta math)
 * - selected: boolean
 * - onSelect()
 * - onMove(x, y)         — fires while dragging (positions are world coords)
 * - onMoveEnd()          — fires on mouseup (good time for save)
 * - onResize(w)          — fires while resizing
 * - onResizeEnd()
 * - onDelete()
 * - onDuplicate()
 * - onConnectStart()
 * - onPlusClick(clientX, clientY)
 * - tool: current tool ('select'|'pan'|'connect')
 * - onConnectFinish() — called when this card is the target of a connect
 * - children: card body
 * - title: shown in header (string)
 * - onTitleChange(value)
 * - showStrip: whether to render the colored strip top
 */
export default function CardShell({
  card, zoom, selected, tool,
  onSelect, onMove, onMoveEnd,
  onResize, onResizeEnd,
  onDelete, onDuplicate, onConnectStart, onConnectFinish,
  onPlusClick,
  title, onTitleChange,
  showStrip = true,
  children,
}) {
  const ref = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  function onHeaderMouseDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (tool === 'connect') {
      onConnectStart && onConnectStart();
      e.stopPropagation();
      return;
    }
    onSelect && onSelect();
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: card.x,
      startY: card.y,
    };
    e.stopPropagation();
    e.preventDefault();
  }

  function onCardClick(e) {
    if (tool === 'connect') {
      onConnectFinish && onConnectFinish();
      e.stopPropagation();
    }
  }

  useEffect(() => {
    function move(e) {
      if (!dragRef.current) return;
      const dx = (e.clientX - dragRef.current.startClientX) / zoom;
      const dy = (e.clientY - dragRef.current.startClientY) / zoom;
      onMove && onMove(dragRef.current.startX + dx, dragRef.current.startY + dy);
    }
    function up() {
      if (dragRef.current) {
        dragRef.current = null;
        onMoveEnd && onMoveEnd();
      }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [zoom, onMove, onMoveEnd]);

  function onResizeMouseDown(e) {
    resizeRef.current = { startClientX: e.clientX, startW: card.w };
    e.stopPropagation();
    e.preventDefault();
  }

  useEffect(() => {
    function move(e) {
      if (!resizeRef.current) return;
      const dx = (e.clientX - resizeRef.current.startClientX) / zoom;
      onResize && onResize(Math.max(180, resizeRef.current.startW + dx));
    }
    function up() {
      if (resizeRef.current) {
        resizeRef.current = null;
        onResizeEnd && onResizeEnd();
      }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [zoom, onResize, onResizeEnd]);

  const isHeading = card.type === 'heading';
  const stripColor = STRIP_COLORS[card.type] || 'var(--cv-muted)';

  return (
    <div
      id={card.id}
      ref={ref}
      onClick={onCardClick}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.w,
        background: isHeading ? 'transparent' : 'var(--cv-white)',
        border: isHeading ? 'none' : `1px solid ${selected ? 'var(--cv-gold2)' : 'var(--cv-border)'}`,
        borderRadius: 9,
        boxShadow: isHeading ? 'none' : 'var(--cv-shadow)',
        outline: selected && !isHeading ? '2px solid var(--cv-gold2)' : 'none',
        outlineOffset: 1,
        zIndex: 10,
      }}
      className="cv-card"
    >
      {showStrip && !isHeading && (
        <div style={{ height: 3, background: stripColor, borderRadius: '8px 8px 0 0' }} />
      )}

      {/* Action buttons (visible on hover via parent CSS) */}
      <div
        className="cv-card-actions"
        style={{
          position: 'absolute', top: -34, right: 0,
          background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
          borderRadius: 7, boxShadow: 'var(--cv-shadow)',
          display: 'none', gap: 2, padding: 3,
        }}
      >
        <button onClick={onConnectStart} title="Connect" style={actBtn}>↔</button>
        <button onClick={onDuplicate}    title="Duplicate" style={actBtn}>⎘</button>
        <button onClick={onDelete}       title="Delete" style={{...actBtn, color:'var(--cv-red)'}}>×</button>
      </div>

      {/* Header / title */}
      <div onMouseDown={onHeaderMouseDown}
        style={{
          padding: isHeading ? '0' : '9px 11px 5px',
          cursor: 'grab',
          userSelect: 'none',
        }}>
        {title !== undefined && (
          <input
            value={title}
            onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: isHeading ? 'Bebas Neue, sans-serif' : 'DM Sans, sans-serif',
              fontWeight: isHeading ? 400 : 600,
              fontSize: isHeading ? 28 : 12.5,
              letterSpacing: isHeading ? '2px' : 'normal',
              color: 'var(--cv-text)', width: '100%',
            }}
          />
        )}
      </div>

      {/* Body */}
      {!isHeading && (
        <div style={{ padding: '6px 11px 11px' }}>
          {children}
        </div>
      )}

      {/* Resize handle */}
      {!isHeading && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 14, height: 14, cursor: 'se-resize',
          }}
        >
          <div style={{
            position: 'absolute', bottom: 3, right: 3,
            width: 7, height: 7,
            borderRight: '2px solid var(--cv-muted)',
            borderBottom: '2px solid var(--cv-muted)',
          }} />
        </div>
      )}

      {/* + button */}
      {onPlusClick && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlusClick(e.clientX, e.clientY); }}
          className="cv-card-plus"
          style={{
            position: 'absolute', bottom: -10, right: -10,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--cv-white)', border: '1.5px solid var(--cv-border)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: 'var(--cv-muted)',
            boxShadow: 'var(--cv-shadow)', lineHeight: 1, zIndex: 20,
          }}
        >+</button>
      )}
    </div>
  );
}

const actBtn = {
  width: 24, height: 24, borderRadius: 5,
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--cv-muted)', fontSize: 14,
};
```

- [ ] **Step 2: Add the hover CSS that reveals action buttons and "+"**

In `src/index.css`, append at the very end:

```css
.canvas-root .cv-card:hover .cv-card-actions { display: flex !important; }
.canvas-root .cv-card:hover .cv-card-plus    { display: flex !important; }
```

- [ ] **Step 3: Commit**

```bash
git add src/canvas/cards/CardShell.jsx src/index.css
git commit -m "feat(canvas): CardShell wrapper with drag/resize/actions"
```

---

### Task 9: Static Cards — Note, Heading, Image

**Files:**
- Create: `src/canvas/cards/NoteCard.jsx`
- Create: `src/canvas/cards/HeadingCard.jsx`
- Create: `src/canvas/cards/ImageCard.jsx`

- [ ] **Step 1: NoteCard**

Create `src/canvas/cards/NoteCard.jsx`:

```javascript
import CardShell from './CardShell';

export default function NoteCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'Note'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <textarea
        value={data.text ?? ''}
        placeholder="Scrivi qui…"
        onChange={(e) => onUpdate({ data: { ...data, text: e.target.value } })}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', resize: 'none',
          width: '100%', minHeight: 60, fontFamily: 'DM Sans, sans-serif',
          fontSize: 12.5, fontWeight: 300, color: 'var(--cv-text)',
          outline: 'none', lineHeight: 1.55,
        }}
      />
    </CardShell>
  );
}
```

- [ ] **Step 2: HeadingCard**

Create `src/canvas/cards/HeadingCard.jsx`:

```javascript
import CardShell from './CardShell';

export default function HeadingCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'NEW HEADING'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      showStrip={false}
      {...ctx}
    />
  );
}
```

- [ ] **Step 3: ImageCard**

Create `src/canvas/cards/ImageCard.jsx`:

```javascript
import { useRef } from 'react';
import CardShell from './CardShell';

export default function ImageCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ data: { ...data, imgUrl: ev.target.result } });
    reader.readAsDataURL(file);
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'Image'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      {data.imgUrl ? (
        <img src={data.imgUrl} alt="" style={{ width: '100%', borderRadius: 5, display: 'block' }} />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', background: 'var(--cv-bg)', borderRadius: 5,
            cursor: 'pointer', color: 'var(--cv-muted)', fontSize: 11,
            gap: 6, minHeight: 80, padding: 16,
          }}
        >
          <span>📷</span>
          Clicca per aggiungere immagine
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </CardShell>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/NoteCard.jsx src/canvas/cards/HeadingCard.jsx src/canvas/cards/ImageCard.jsx
git commit -m "feat(canvas): NoteCard, HeadingCard, ImageCard"
```

---

### Task 10: Static Cards — Link, Todo, Board

**Files:**
- Create: `src/canvas/cards/LinkCard.jsx`
- Create: `src/canvas/cards/TodoCard.jsx`
- Create: `src/canvas/cards/BoardCard.jsx`

- [ ] **Step 1: LinkCard**

Create `src/canvas/cards/LinkCard.jsx`:

```javascript
import CardShell from './CardShell';

export default function LinkCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  return (
    <CardShell
      card={card}
      title={data.title ?? 'Link'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <input
        type="text" placeholder="https://"
        value={data.url ?? ''}
        onChange={(e) => onUpdate({ data: { ...data, url: e.target.value } })}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'var(--cv-bg)', borderRadius: 5,
          padding: '5px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11,
          color: 'var(--cv-text)', outline: 'none', marginBottom: 8, width: '100%',
        }}
      />
      {data.url && (
        <a href={data.url} target="_blank" rel="noopener noreferrer"
           onClick={(e) => e.stopPropagation()}
           style={{ fontSize: 11, color: 'var(--cv-sage)', wordBreak: 'break-all' }}>
          Apri →
        </a>
      )}
    </CardShell>
  );
}
```

- [ ] **Step 2: TodoCard**

Create `src/canvas/cards/TodoCard.jsx`:

```javascript
import { useState } from 'react';
import CardShell from './CardShell';

export default function TodoCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const items = data.items || [];
  const [draft, setDraft] = useState('');

  function setItems(next) { onUpdate({ data: { ...data, items: next } }); }
  function addItem() {
    if (!draft.trim()) return;
    setItems([...items, { text: draft.trim(), done: false }]);
    setDraft('');
  }
  function toggle(i) {
    setItems(items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it));
  }
  function update(i, text) {
    setItems(items.map((it, idx) => idx === i ? { ...it, text } : it));
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'To-do'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div
              onClick={(e) => { e.stopPropagation(); toggle(i); }}
              style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                border: '1.5px solid ' + (it.done ? 'var(--cv-sage)' : 'var(--cv-border)'),
                background: it.done ? 'var(--cv-sage)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9,
              }}
            >{it.done ? '✓' : ''}</div>
            <input
              type="text" value={it.text}
              onChange={(e) => update(i, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12, flex: 1,
                color: 'var(--cv-text)',
                textDecoration: it.done ? 'line-through' : 'none',
                opacity: it.done ? 0.55 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <input
        type="text" placeholder="+ Aggiungi elemento"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 11.5, color: 'var(--cv-muted)', marginTop: 6,
          fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}
      />
    </CardShell>
  );
}
```

- [ ] **Step 3: BoardCard**

Create `src/canvas/cards/BoardCard.jsx`:

```javascript
import { useState } from 'react';
import CardShell from './CardShell';

export default function BoardCard({ card, ctx, onUpdate }) {
  const data = card.data || {};
  const subCards = data.subCards || [];
  const [draft, setDraft] = useState('');

  function add() {
    if (!draft.trim()) return;
    onUpdate({ data: { ...data, subCards: [...subCards, draft.trim()] } });
    setDraft('');
  }

  return (
    <CardShell
      card={card}
      title={data.title ?? 'Board'}
      onTitleChange={(v) => onUpdate({ data: { ...data, title: v } })}
      {...ctx}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {subCards.map((s, i) => (
          <div key={i} style={{
            background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
            padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 500,
            color: 'var(--cv-text)',
          }}>{s}</div>
        ))}
      </div>
      <input
        type="text" placeholder="+ chip"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 11, color: 'var(--cv-muted)', marginTop: 8,
          fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}
      />
    </CardShell>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/LinkCard.jsx src/canvas/cards/TodoCard.jsx src/canvas/cards/BoardCard.jsx
git commit -m "feat(canvas): LinkCard, TodoCard, BoardCard"
```

---

### Task 11: Card Renderer Registry + Wire to CanvasView

**Files:**
- Create: `src/canvas/cards/index.js`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create the registry**

Create `src/canvas/cards/index.js`:

```javascript
import NoteCard from './NoteCard';
import HeadingCard from './HeadingCard';
import ImageCard from './ImageCard';
import LinkCard from './LinkCard';
import TodoCard from './TodoCard';
import BoardCard from './BoardCard';

export const CARD_COMPONENTS = {
  note:    NoteCard,
  heading: HeadingCard,
  image:   ImageCard,
  link:    LinkCard,
  todo:    TodoCard,
  board:   BoardCard,
};

export function renderCard(card, ctx) {
  const Comp = CARD_COMPONENTS[card.type];
  if (!Comp) {
    return (
      <div key={card.id} style={{ position:'absolute', left:card.x, top:card.y, padding:8,
        background:'#fee', border:'1px solid #f99', borderRadius:6, fontSize:11 }}>
        Unknown card type: {card.type}
      </div>
    );
  }
  return <Comp key={card.id} card={card} {...ctx} />;
}
```

- [ ] **Step 2: Replace the inline render in CanvasView with the registry**

In `src/pages/CanvasView.jsx`, change the imports — add at top:

```javascript
import { renderCard } from '../canvas/cards';
```

Replace the `cards.map(...)` block inside `<CanvasEngine>` with:

```javascript
{cards.map(c => renderCard(c, {
  ctx: {
    zoom: canvas?.zoom ?? 1,
    selected: false,
    tool: 'select',
    onSelect: () => {},
    onMove: (x, y) => updateCard(c.id, { x, y }),
    onMoveEnd: () => {},
    onResize: (w) => updateCard(c.id, { w }),
    onResizeEnd: () => {},
    onDelete: () => deleteCard(c.id),
    onDuplicate: () => addCard({
      type: c.type, x: c.x + 20, y: c.y + 20, w: c.w, data: c.data,
    }),
    onConnectStart: () => {},
    onConnectFinish: () => {},
    onPlusClick: () => {},
  },
  onUpdate: (patch) => updateCard(c.id, patch),
}))}
```

Also extend the destructure of `useCanvas` at the top of CanvasView to include `addCard`, `updateCard`, `deleteCard`:

```javascript
const { canvas, cards, loading, updateCanvas, addCard, updateCard, deleteCard } = useCanvas(resolvedId);
```

- [ ] **Step 3: Add a temporary "Add Note" button to verify cards work**

In `CanvasView.jsx`, add another button next to the back button:

```javascript
<button
  onClick={() => addCard({ type: 'note', x: 3000, y: 3000, w: 230, data: { title: 'Note', text: '' } })}
  style={{
    position:'absolute', top:14, left:120, zIndex:50,
    padding:'6px 12px', border:'1px solid var(--cv-border)',
    borderRadius:6, background:'var(--cv-white)', color:'var(--cv-text)',
    fontSize:11, fontFamily:'DM Sans', cursor:'pointer',
  }}
>+ Note</button>
```

- [ ] **Step 4: Verify in browser**

Use `mcp__Claude_Preview__preview_eval` (name `studio-os`):

```javascript
window.location.reload();
```

Then click "+ Note", drag the new card, type in title and body, take screenshot. Expected: card appears at 3000,3000 in world coords (probably off-screen — pan to find it, OR change x/y to current viewport center). After interactions, refresh page — card should persist.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/cards/index.js src/pages/CanvasView.jsx
git commit -m "feat(canvas): card registry + wire all 6 static cards in CanvasView"
```

---

### Task 12: Tool State + Bottom Toolbar

**Files:**
- Create: `src/canvas/CanvasToolbar.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create the toolbar component**

Create `src/canvas/CanvasToolbar.jsx`:

```javascript
import { MIN_ZOOM, MAX_ZOOM } from './CanvasEngine';

const ICONS = {
  select:  '↖',
  pan:     '✋',
  connect: '→',
  fit:     '⛶',
};

export default function CanvasToolbar({ tool, onToolChange, zoom, onZoomChange, onFit }) {
  const z = Math.round(zoom * 100);
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
      borderRadius: 12, boxShadow: 'var(--cv-shadow-lg)',
      display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', zIndex: 30,
    }}>
      <ToolBtn active={tool==='select'}  onClick={() => onToolChange('select')}  title="Select (V)" >{ICONS.select}</ToolBtn>
      <ToolBtn active={tool==='pan'}     onClick={() => onToolChange('pan')}     title="Pan (H)"    >{ICONS.pan}</ToolBtn>
      <ToolBtn active={tool==='connect'} onClick={() => onToolChange('connect')} title="Connect (C)">{ICONS.connect}</ToolBtn>

      <div style={{ width: 1, height: 20, background: 'var(--cv-border2)', margin: '0 2px' }} />

      <div style={{ display:'flex', alignItems:'center', gap:1, background:'var(--cv-surface)', borderRadius:6, padding:'0 3px' }}>
        <ZoomBtn onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - 0.1))}>−</ZoomBtn>
        <span style={{ fontSize:11, fontWeight:500, color:'var(--cv-muted)', width:34, textAlign:'center' }}>{z}%</span>
        <ZoomBtn onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + 0.1))}>+</ZoomBtn>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--cv-border2)', margin: '0 2px' }} />
      <ToolBtn onClick={onFit} title="Fit">{ICONS.fit}</ToolBtn>
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 32, height: 32, borderRadius: 7,
        border: 'none', background: active ? 'var(--cv-purple)' : 'transparent',
        color: active ? '#fff' : 'var(--cv-muted)',
        cursor: 'pointer', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >{children}</button>
  );
}

function ZoomBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        width: 24, height: 24, border: 'none', background: 'transparent',
        cursor: 'pointer', borderRadius: 4, color: 'var(--cv-muted)',
        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >{children}</button>
  );
}
```

- [ ] **Step 2: Add tool state and toolbar to CanvasView**

In `src/pages/CanvasView.jsx`, add at top:

```javascript
import CanvasToolbar from '../canvas/CanvasToolbar';
```

Inside the component, add state:

```javascript
const [tool, setTool] = useState('select');
```

Pass `tool` to `<CanvasEngine>`:

```javascript
<CanvasEngine
  panX={canvas?.panX ?? 0}
  panY={canvas?.panY ?? 0}
  zoom={canvas?.zoom ?? 1}
  tool={tool}
  onViewportChange={({ panX, panY, zoom }) => updateCanvas({ panX, panY, zoom })}
>
```

Also pass `tool` into each card's ctx (replace the existing `tool: 'select'` with `tool`).

After `<CanvasEngine>...</CanvasEngine>`, render the toolbar and remove the temporary "← Indietro" / "+ Note" buttons (we'll re-add a back button properly later):

```javascript
<CanvasToolbar
  tool={tool}
  onToolChange={setTool}
  zoom={canvas?.zoom ?? 1}
  onZoomChange={(z) => updateCanvas({ zoom: z })}
  onFit={() => {
    if (!cards.length) return;
    const minX = Math.min(...cards.map(c => c.x));
    const minY = Math.min(...cards.map(c => c.y));
    const maxX = Math.max(...cards.map(c => c.x + c.w));
    const maxY = Math.max(...cards.map(c => c.y + 220));
    const pad = 120;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const z = Math.min(window.innerWidth / w, window.innerHeight / h, 1);
    updateCanvas({
      zoom: z,
      panX: (window.innerWidth  - w * z) / 2 - minX * z + pad * z,
      panY: (window.innerHeight - h * z) / 2 - minY * z + pad * z,
    });
  }}
/>
```

- [ ] **Step 3: Add keyboard shortcuts (V/H/C/Escape)**

Inside CanvasView add a useEffect:

```javascript
useEffect(() => {
  function onKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'v' || e.key === 'V') setTool('select');
    if (e.key === 'h' || e.key === 'H') setTool('pan');
    if (e.key === 'c' || e.key === 'C') setTool('connect');
    if (e.key === 'Escape') setTool('select');
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, []);
```

Also import `useEffect` from React if not already.

- [ ] **Step 4: Verify**

Reload the preview, click toolbar tool buttons, press V/H/C, verify cursor changes; press Fit when there are cards; verify zoom persists across page reloads.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/CanvasToolbar.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): bottom toolbar + tool state + keyboard shortcuts"
```

---

### Task 13: Left Sidebar — Drag to Add

**Files:**
- Create: `src/canvas/CanvasSidebar.jsx`
- Modify: `src/pages/CanvasView.jsx`
- Modify: `src/canvas/CanvasEngine.jsx`

- [ ] **Step 1: Add drop handling to CanvasEngine**

In `src/canvas/CanvasEngine.jsx`, accept new props `onDrop` and add handlers to the wrapper div:

In the function signature add `onDrop` to the destructured props:
```javascript
export default function CanvasEngine({
  panX, panY, zoom, onViewportChange,
  tool = 'select',
  onBackgroundClick, onContextMenu, onDrop,
  children, svgChildren,
}) {
```

In the returned wrapper div, add these handlers BEFORE `style`:
```javascript
onDragOver={(e) => e.preventDefault()}
onDrop={(e) => {
  e.preventDefault();
  if (!onDrop) return;
  const type = e.dataTransfer.getData('cardType');
  if (!type) return;
  const rect = wrapRef.current.getBoundingClientRect();
  const wx = (e.clientX - rect.left - panX) / zoom;
  const wy = (e.clientY - rect.top  - panY) / zoom;
  onDrop(type, wx, wy);
}}
```

- [ ] **Step 2: Create the sidebar component**

Create `src/canvas/CanvasSidebar.jsx`:

```javascript
const ITEMS = [
  { type: 'note',    label: 'Note',  icon: '📝' },
  { type: 'image',   label: 'Image', icon: '🖼' },
  { type: 'link',    label: 'Link',  icon: '🔗' },
  { type: 'todo',    label: 'To-do', icon: '✓' },
  { type: 'board',   label: 'Board', icon: '▦' },
  { type: 'heading', label: 'Title', icon: 'T' },
];

export default function CanvasSidebar({ onHome, onTemplates }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: 60,
      background: 'var(--cv-white)', borderRight: '1px solid var(--cv-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 2, zIndex: 40,
    }}>
      {ITEMS.map(it => (
        <SideBtn key={it.type} icon={it.icon} label={it.label} draggable type={it.type} />
      ))}
      <div style={{ width: 32, height: 1, background: 'var(--cv-border2)', margin: '6px 0' }} />
      <SideBtn icon="▦" label="Templ" onClick={onTemplates} />
      <div style={{ flex: 1 }} />
      <SideBtn icon="⌂" label="Home" onClick={onHome} />
    </div>
  );
}

function SideBtn({ icon, label, onClick, draggable, type }) {
  return (
    <button
      onClick={onClick}
      draggable={!!draggable}
      onDragStart={draggable ? (e) => e.dataTransfer.setData('cardType', type) : undefined}
      style={{
        width: 44, minHeight: 38, borderRadius: 7, border: 'none',
        background: 'transparent', cursor: draggable ? 'grab' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2.5, color: 'var(--cv-muted2)',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 8.5, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
```

- [ ] **Step 3: Wire sidebar into CanvasView**

In `src/pages/CanvasView.jsx`, add import:

```javascript
import CanvasSidebar from '../canvas/CanvasSidebar';
```

Add `<CanvasSidebar>` inside `.canvas-root`, BEFORE `<CanvasEngine>`:

```javascript
<CanvasSidebar
  onHome={() => navigate(clientId ? `/clients/${clientId}` : '/')}
  onTemplates={() => {/* TODO: open template panel */}}
/>
```

Pass `onDrop` to `<CanvasEngine>`:

```javascript
onDrop={(type, x, y) => {
  const defaults = {
    note:    { data: { title: 'Note',  text: '' } },
    image:   { data: { title: 'Image' } },
    link:    { data: { title: 'Link',  url: '' } },
    todo:    { data: { title: 'To-do', items: [] } },
    board:   { data: { title: 'Board', subCards: [] } },
    heading: { data: { title: 'NEW HEADING' } },
  };
  addCard({ type, x: x - 110, y: y - 30, w: 230, ...(defaults[type] || {}) });
}}
```

Also add `paddingLeft: 60` to the engine wrapper container so the sidebar doesn't overlap. Actually since `CanvasEngine` is positioned `inset:0`, instead change the engine's internal wrapper to start at `left: 60`. Easiest: pass an `inset` style. Modify `CanvasEngine.jsx` to accept a `leftOffset` prop and apply `left: leftOffset` instead of `inset: 0`:

In `CanvasEngine.jsx`, change the outer div style:
```javascript
style={{
  position: 'absolute',
  top: 0, left: 60, right: 0, bottom: 0,
  overflow: 'hidden',
  /* ...rest unchanged... */
}}
```

(Hardcoding 60 is fine — it matches the sidebar width.)

- [ ] **Step 4: Verify**

Reload, drag "Note" from sidebar onto canvas, type in it. Expected: card appears at drop position. Then click "Home" in sidebar — should navigate back.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/CanvasSidebar.jsx src/canvas/CanvasEngine.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): left sidebar with draggable element types"
```

---

### Task 14: Connections — SVG Layer + Connect Tool Flow

**Files:**
- Create: `src/canvas/Connections.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create Connections component**

Create `src/canvas/Connections.jsx`:

```javascript
import { useEffect, useState } from 'react';

/**
 * Renders SVG paths for each connection. Reads card positions from the DOM
 * (since cards are absolute-positioned by id) so it's always in sync.
 */
export default function Connections({ connections, cards, refresh }) {
  const [tick, setTick] = useState(0);

  // Re-render when refresh changes (called on drag/zoom)
  useEffect(() => { setTick(t => t + 1); }, [refresh]);

  // Build paths from card x/y/w in props (more reliable than DOM)
  const paths = connections.map(conn => {
    const a = cards.find(c => c.id === conn.fromCard);
    const b = cards.find(c => c.id === conn.toCard);
    if (!a || !b) return null;
    const ax = a.x + a.w / 2;
    const ay = a.y + 60;
    const bx = b.x + b.w / 2;
    const by = b.y + 60;
    const cx = (ax + bx) / 2;
    return (
      <path
        key={conn.id}
        d={`M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`}
        fill="none"
        stroke="rgba(154,115,16,0.5)"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        markerEnd="url(#cv-arr)"
      />
    );
  }).filter(Boolean);

  return (
    <>
      <defs>
        <marker id="cv-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(154,115,16,0.6)" />
        </marker>
      </defs>
      {paths}
    </>
  );
}
```

- [ ] **Step 2: Add connect-flow state and wiring in CanvasView**

In `src/pages/CanvasView.jsx`, import Connections at top:

```javascript
import Connections from '../canvas/Connections';
```

Inside the component, destructure `addConnection` and `connections` from `useCanvas`:

```javascript
const { canvas, cards, connections, loading, updateCanvas, addCard, updateCard, deleteCard, addConnection } = useCanvas(resolvedId);
```

Add connect-flow state:

```javascript
const [connectFrom, setConnectFrom] = useState(null);
```

When the tool is set to non-connect, reset connectFrom. Add to the useEffect that handles keyboard, OR add this dedicated effect:

```javascript
useEffect(() => { if (tool !== 'connect') setConnectFrom(null); }, [tool]);
```

In the card ctx, replace the `onConnectStart`/`onConnectFinish` no-ops with:

```javascript
onConnectStart: () => { setTool('connect'); setConnectFrom(c.id); },
onConnectFinish: () => {
  if (connectFrom && connectFrom !== c.id) {
    addConnection(connectFrom, c.id);
    setConnectFrom(null);
    setTool('select');
  }
},
```

Pass `<Connections>` as `svgChildren` to CanvasEngine:

```javascript
<CanvasEngine
  /* ...existing props... */
  svgChildren={<Connections connections={connections} cards={cards} refresh={cards} />}
>
```

- [ ] **Step 3: Verify**

Reload, drop two notes. Press C (connect tool). Click first note then second. Expected: dashed gold curve with arrow appears between them. Drag a card — connection should follow because Connections re-renders with `cards`.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/Connections.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): connections with connect tool flow"
```

---

### Task 15: Templates — Static Definitions

**Files:**
- Create: `src/lib/canvas-templates.js`

- [ ] **Step 1: Create the templates file**

Create `src/lib/canvas-templates.js`. The full TEMPLATES array is large (18+ entries). Copy verbatim from the prototype HTML the user provided in the brainstorming chat — specifically the `const TEMPLATES = [...]` block in the inline `<script>` near the bottom (search for `// ── FASHION ──`).

Wrap it as ES module:

```javascript
// Canvas templates — ported from prototype HTML.
// Coordinates are absolute world coords centered around (3000, 3000).
// applyTemplate() in TemplatePanel translates them to the current viewport center.

export const TEMPLATES = [
  // ── FASHION ──
  {
    id: 'moodboard', cat: 'fashion', accent: '#D4B870',
    name: 'Moodboard SS/AW',
    desc: 'Board ispirativa con immagini, note colori e riferimenti stagionali.',
    tags: ['Mood', 'Visivo'],
    cards: [
      { type:'heading', x:2920, y:2870, w:300, title:'MOODBOARD SS26' },
      { type:'image',   x:2720, y:2950, w:220 },
      { type:'image',   x:2960, y:2950, w:220 },
      { type:'image',   x:3200, y:2950, w:220 },
      { type:'note',    x:2720, y:3140, w:220, text:'Toni sabbia, terracotta e off-white. Tessuti leggeri — lino, seta, organza.' },
      { type:'board',   x:2960, y:3140, w:460, title:'Palette Colori', subCards:['Sabbia #C9B99A','Terracotta #B04820','Off-white #F4F1EB','Salvia #4A6A4A'] },
    ]
  },

  {
    id: 'techpack', cat: 'production', accent: '#B04820',
    name: 'Tech Pack',
    desc: 'Scheda tecnica completa con misure, materiali e note.',
    tags: ['Produzione', 'Factory'],
    cards: [
      { type:'heading', x:2880, y:2860, w:380, title:'TECH PACK — JACKET AW25' },
      { type:'image',   x:2720, y:2940, w:260, title:'Vista Frontale' },
      { type:'image',   x:3000, y:2940, w:260, title:'Vista Retro' },
      { type:'note',    x:2720, y:3160, w:260, title:'Materiali', text:'Shell: 100% Wool Tweed\nLining: 100% Viscosa\nButton: Corozo 20mm' },
      { type:'note',    x:3000, y:3160, w:260, title:'Misure Base (IT 42)', text:'Chest: 96cm\nWaist: 82cm\nLength: 68cm\nSleeve: 62cm' },
      { type:'todo',    x:2720, y:3360, w:540, title:'Checklist Produzione', items:[{text:'Approvazione campione colore',done:false},{text:'Conferma fornitore bottoni',done:false},{text:'Grading taglie 38→46',done:false},{text:'Invio file al factory',done:false}] },
    ]
  },
  {
    id: 'brainstorm', cat: 'planning', accent: '#9A7310',
    name: 'Brainstorm Board',
    desc: 'Canvas libero per sessioni creative con note, cluster e connessioni.',
    tags: ['Ideation', 'Creative'],
    cards: [
      { type:'heading', x:2930, y:2870, w:280, title:'BRAINSTORM' },
      { type:'note',    x:2720, y:2960, w:220, text:'Idea 01\n\nScrivi qui la tua prima idea...' },
      { type:'note',    x:2960, y:2960, w:220, text:'Idea 02' },
      { type:'note',    x:3200, y:2960, w:220, text:'Idea 03' },
      { type:'note',    x:2720, y:3170, w:220, text:'Idea 04' },
      { type:'note',    x:2960, y:3170, w:220, text:'Idea 05' },
      { type:'note',    x:3200, y:3170, w:220, text:'Idea 06' },
    ]
  },
  {
    id: 'instagram', cat: 'social', accent: '#B83025',
    name: 'Instagram Content Plan',
    desc: 'Piano editoriale settimanale con copy, visual e hashtag per IG.',
    tags: ['Social', 'Content'],
    cards: [
      { type:'heading', x:2880, y:2860, w:360, title:'IG CONTENT PLAN — MARZO' },
      { type:'note',    x:2720, y:2950, w:260, title:'Post Lunedì', text:'🎨 Palette della settimana\nHook: "Il colore che definirà questa stagione..."\n#fashioncolor #moodoftheweek' },
      { type:'note',    x:3000, y:2950, w:260, title:'Post Mercoledì', text:'👗 Behind the scenes\nHook: "Dal bozzetto al prodotto finale"\n#behindthescenes #fashiondesign' },
      { type:'note',    x:3280, y:2950, w:260, title:'Post Venerdì', text:'✨ Product spotlight\nHook: "Un solo pezzo, infinite combinazioni"\n#ootd #slowfashion' },
      { type:'board',   x:2720, y:3190, w:820, title:'Hashtag Core', subCards:['#slowfashion','#fashiondesign','#madeinitaly','#sustainablefashion','#ootd'] },
    ]
  },
  {
    id: 'brandid', cat: 'branding', accent: '#1A1816',
    name: 'Brand Identity',
    desc: 'Definisce posizionamento, tono di voce, palette e valori del brand.',
    tags: ['Brand', 'Strategy'],
    cards: [
      { type:'heading', x:2880, y:2850, w:380, title:'BRAND IDENTITY' },
      { type:'note',    x:2720, y:2940, w:280, title:'Brand Positioning', text:'Target: ___\nFascia: ___\nValori: ___\nAnti: ___' },
      { type:'note',    x:3020, y:2940, w:280, title:'Tone of Voice', text:'• Sofisticato ma accessibile\n• Storie autentiche sul processo' },
      { type:'board',   x:2720, y:3170, w:280, title:'Palette Brand', subCards:['Écru #F4F1EB','Sabbia #C9B99A','Terracotta #B04820','Grafite #3A3633'] },
      { type:'board',   x:3020, y:3170, w:280, title:'Reference Brand', subCards:['The Row','Toteme','Loro Piana','Lemaire','Auralee'] },
    ]
  },
  // ── Optional: 14 additional templates from the user's prototype HTML can be
  // added later (collection, dropplan, tiktok, lookbook, naming, season,
  // supplier, sample-tracker, cogs, linea-sheet, showroom, order-form,
  // press-kit, collab-brief, competitor, pricing-strategy, trend-board,
  // newsletter-fashion). Same shape — id, cat, accent, name, desc, tags, cards.
  // The 5 starter templates above cover all categories so the picker is
  // immediately useful in Phase 1.
];

export const TEMPLATE_CATEGORIES = [
  { key: 'all',        label: 'Tutti' },
  { key: 'fashion',    label: 'Fashion' },
  { key: 'social',     label: 'Social Media' },
  { key: 'production', label: 'Produzione' },
  { key: 'planning',   label: 'Planning' },
  { key: 'branding',   label: 'Branding' },
];
```

**Note**: Phase 1 ships with 5 starter templates (moodboard, techpack, brainstorm, instagram, brandid) covering all 5 categories. Adding the remaining 14 templates from the user's prototype HTML is a separate, optional task — append more entries to the `TEMPLATES` array using the same shape. The picker is immediately functional with these 5.

- [ ] **Step 2: Verify templates load**

Run: `cd studio-os && node --check src/lib/canvas-templates.js`
Expected: no output.

Also run a quick sanity in the preview:

```javascript
// preview_eval (name studio-os)
import('/src/lib/canvas-templates.js').then(m => ({
  count: m.TEMPLATES.length,
  cats: [...new Set(m.TEMPLATES.map(t => t.cat))],
}));
```

Expected: `count >= 5` (Phase 1 starter set) and `cats` contains at least `['fashion','social','production','planning','branding']`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/canvas-templates.js
git commit -m "feat(canvas): static template definitions (18+ templates)"
```

---

### Task 16: Template Panel — Slide-in Picker

**Files:**
- Create: `src/canvas/TemplatePanel.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create the panel**

Create `src/canvas/TemplatePanel.jsx`:

```javascript
import { useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/canvas-templates';

export default function TemplatePanel({ open, onClose, onApply }) {
  const [cat, setCat] = useState('all');
  const [q, setQ]     = useState('');

  const filtered = TEMPLATES.filter(t =>
    (cat === 'all' || t.cat === cat) &&
    (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.desc.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 280,
      background: 'var(--cv-surface)', borderLeft: '1px solid var(--cv-border)',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .32s cubic-bezier(.4,0,.2,1)',
      zIndex: 38, display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(26,24,22,.09)',
    }}>
      <div style={{ padding: '16px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2 }}>Templates</div>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--cv-muted)',
        }}>×</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--cv-muted)', padding: '5px 16px 10px' }}>
        Scegli un template per inserirlo nel canvas
      </div>

      <input
        placeholder="Cerca template…"
        value={q} onChange={(e) => setQ(e.target.value)}
        style={{
          margin: '0 12px 10px', padding: '7px 10px',
          border: '1px solid var(--cv-border)', borderRadius: 7,
          background: 'var(--cv-white)', fontSize: 12, color: 'var(--cv-text)',
          outline: 'none', width: 'calc(100% - 24px)',
        }}
      />

      <div style={{ display:'flex', gap:4, padding:'0 12px 10px', overflowX:'auto', flexShrink:0 }}>
        {TEMPLATE_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{
              height: 24, padding: '0 10px',
              border: '1px solid ' + (cat === c.key ? 'var(--cv-text)' : 'var(--cv-border)'),
              borderRadius: 20, fontSize: 10.5, fontWeight: 500,
              background: cat === c.key ? 'var(--cv-text)' : 'transparent',
              color: cat === c.key ? '#fff' : 'var(--cv-muted)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{c.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 12px 16px', display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--cv-muted2)', fontSize:12, padding:'30px 0' }}>
            Nessun template trovato
          </div>
        ) : filtered.map(t => (
          <div key={t.id}
            style={{
              background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
              borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
            }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--cv-border2)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--cv-muted)', lineHeight: 1.4, marginBottom: 7 }}>{t.desc}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      height: 16, padding: '0 6px', borderRadius: 3,
                      background: 'var(--cv-bg)', border: '1px solid var(--cv-border)',
                      fontSize: 9, fontWeight: 500, color: 'var(--cv-muted2)',
                      display: 'inline-flex', alignItems: 'center',
                    }}>{tag}</span>
                  ))}
                </div>
                <button onClick={() => onApply(t)}
                  style={{
                    height: 24, padding: '0 10px', background: 'var(--cv-text)',
                    color: '#fff', border: 'none', borderRadius: 5, fontSize: 10.5,
                    fontWeight: 600, cursor: 'pointer',
                  }}>Applica →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire panel into CanvasView**

In `src/pages/CanvasView.jsx`, add import:

```javascript
import TemplatePanel from '../canvas/TemplatePanel';
```

Add state:

```javascript
const [showTemplates, setShowTemplates] = useState(false);
```

Update the sidebar's `onTemplates` prop to open the panel:

```javascript
onTemplates={() => setShowTemplates(true)}
```

After `<CanvasToolbar>`, render the panel:

```javascript
<TemplatePanel
  open={showTemplates}
  onClose={() => setShowTemplates(false)}
  onApply={(tmpl) => {
    // Translate template coords from (3000,3000) origin to current viewport center
    const z = canvas?.zoom ?? 1;
    const px = canvas?.panX ?? 0;
    const py = canvas?.panY ?? 0;
    const centerWorldX = (window.innerWidth  / 2 - px) / z;
    const centerWorldY = (window.innerHeight / 2 - py) / z;
    const dx = centerWorldX - 3000;
    const dy = centerWorldY - 3000;
    tmpl.cards.forEach((c) => {
      const { type, x, y, w, ...rest } = c;
      addCard({
        type,
        x: x + dx,
        y: y + dy,
        w: w || 230,
        data: rest, // title, text, items, subCards, etc.
      });
    });
    setShowTemplates(false);
  }}
/>
```

- [ ] **Step 3: Verify**

Reload, click "Templ" in sidebar. Panel slides in from right. Search "tech" — only matching templates appear. Click "Applica" on Moodboard — cards appear in the current viewport area. Reload page — cards persist.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/TemplatePanel.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): template panel with search/category/apply"
```

---

### Task 17: Add Popup ("+" on cards) and Context Menu

**Files:**
- Create: `src/canvas/AddPopup.jsx`
- Create: `src/canvas/ContextMenu.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: AddPopup component**

Create `src/canvas/AddPopup.jsx`:

```javascript
const ITEMS = [
  { type: 'note',    label: 'Note',  icon: '📝' },
  { type: 'image',   label: 'Image', icon: '🖼' },
  { type: 'board',   label: 'Board', icon: '▦' },
  { type: 'todo',    label: 'To-Do', icon: '✓' },
  { type: 'heading', label: 'Title', icon: 'T' },
  { type: 'link',    label: 'Link',  icon: '🔗' },
];

export default function AddPopup({ x, y, onPick, onClose }) {
  if (x == null) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999 }} />
      <div style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 215), top: Math.min(y, window.innerHeight - 200),
        background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
        borderRadius: 10, boxShadow: 'var(--cv-shadow-lg)',
        padding: 8, zIndex: 1000, width: 196,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--cv-muted2)',
          padding: '2px 4px 6px',
        }}>Aggiungi Elemento</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }}>
          {ITEMS.map(it => (
            <button key={it.type} onClick={() => onPick(it.type)}
              style={{
                border: 'none', background: 'transparent', borderRadius: 6,
                padding: '7px 3px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 14 }}>{it.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--cv-muted)' }}>{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: ContextMenu component**

Create `src/canvas/ContextMenu.jsx`:

```javascript
export default function ContextMenu({ x, y, onAdd, onFit, onClear, onClose }) {
  if (x == null) return null;
  return (
    <>
      <div onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}
           style={{ position:'fixed', inset:0, zIndex:999 }} />
      <div style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 170), top: Math.min(y, window.innerHeight - 250),
        background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
        borderRadius: 9, boxShadow: 'var(--cv-shadow-lg)',
        padding: 5, zIndex: 1000, minWidth: 155,
      }}>
        <Item onClick={() => onAdd('note')}>📝 Note</Item>
        <Item onClick={() => onAdd('image')}>🖼 Image</Item>
        <Item onClick={() => onAdd('todo')}>✓ To-do</Item>
        <Item onClick={() => onAdd('board')}>▦ Board</Item>
        <Item onClick={() => onAdd('heading')}>T Title</Item>
        <Sep />
        <Item onClick={onFit}>⛶ Zoom Fit</Item>
        <Item onClick={onClear} danger>✕ Clear Canvas</Item>
      </div>
    </>
  );
}

function Item({ children, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      padding: '7px 11px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
      borderRadius: 5, color: danger ? 'var(--cv-red)' : 'var(--cv-text)',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cv-bg)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >{children}</div>
  );
}

function Sep() {
  return <div style={{ height: 1, background: 'var(--cv-border)', margin: '3px 0' }} />;
}
```

- [ ] **Step 3: Wire popups into CanvasView**

In `src/pages/CanvasView.jsx`, import:

```javascript
import AddPopup from '../canvas/AddPopup';
import ContextMenu from '../canvas/ContextMenu';
```

Add state:

```javascript
const [addPopup, setAddPopup] = useState(null); // { x, y, refCard? }
const [ctxMenu,  setCtxMenu]  = useState(null); // { x, y, worldX, worldY }
```

Pass `onContextMenu` to CanvasEngine:

```javascript
onContextMenu={(cx, cy, wx, wy) => setCtxMenu({ x: cx, y: cy, worldX: wx, worldY: wy })}
```

Update each card's ctx `onPlusClick`:

```javascript
onPlusClick: (cx, cy) => setAddPopup({ x: cx, y: cy, refCard: c }),
```

Render the popups at the end of the `.canvas-root`:

```javascript
<AddPopup
  x={addPopup?.x} y={addPopup?.y}
  onClose={() => setAddPopup(null)}
  onPick={(type) => {
    const ref = addPopup.refCard;
    const x = ref ? ref.x + ref.w + 20 : 3000;
    const y = ref ? ref.y : 3000;
    const defaults = {
      note:    { data: { title: 'Note',  text: '' } },
      image:   { data: { title: 'Image' } },
      link:    { data: { title: 'Link',  url: '' } },
      todo:    { data: { title: 'To-do', items: [] } },
      board:   { data: { title: 'Board', subCards: [] } },
      heading: { data: { title: 'NEW HEADING' } },
    };
    addCard({ type, x, y, w: 230, ...(defaults[type] || {}) });
    setAddPopup(null);
  }}
/>

<ContextMenu
  x={ctxMenu?.x} y={ctxMenu?.y}
  onClose={() => setCtxMenu(null)}
  onAdd={(type) => {
    const defaults = {
      note: { data: { title:'Note', text:'' } },
      image: { data: { title:'Image' } },
      todo: { data: { title:'To-do', items:[] } },
      board: { data: { title:'Board', subCards:[] } },
      heading: { data: { title:'NEW HEADING' } },
    };
    addCard({ type, x: ctxMenu.worldX - 110, y: ctxMenu.worldY - 30, w: 230, ...(defaults[type] || {}) });
    setCtxMenu(null);
  }}
  onFit={() => { setCtxMenu(null); /* fit handled by toolbar */ }}
  onClear={() => {
    if (confirm('Svuotare il canvas?')) {
      cards.forEach(c => deleteCard(c.id));
    }
    setCtxMenu(null);
  }}
/>
```

- [ ] **Step 4: Verify**

Reload. Hover a card — "+" appears bottom-right. Click "+" → popup with 6 element types. Right-click on empty canvas → context menu. Pick "Note" → card appears at click position.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/AddPopup.jsx src/canvas/ContextMenu.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): + popup on cards and right-click context menu"
```

---

### Task 18: Minimap

**Files:**
- Create: `src/canvas/CanvasMinimap.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create minimap**

Create `src/canvas/CanvasMinimap.jsx`:

```javascript
import { WORLD_SIZE } from './CanvasEngine';

export default function CanvasMinimap({ panX, panY, zoom, cards }) {
  const W = 120, H = 80;
  const scaleX = W / WORLD_SIZE;
  const scaleY = H / WORLD_SIZE;

  // Viewport rect in world coords
  const vw = window.innerWidth  / zoom;
  const vh = window.innerHeight / zoom;
  const vx = (-panX / zoom);
  const vy = (-panY / zoom);

  return (
    <div style={{
      position: 'absolute', bottom: 18, right: 16, width: W, height: H,
      background: 'var(--cv-white)', border: '1px solid var(--cv-border)',
      borderRadius: 7, boxShadow: 'var(--cv-shadow)', zIndex: 30, overflow: 'hidden',
    }}>
      {cards.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: c.x * scaleX, top: c.y * scaleY,
          width: Math.max(2, c.w * scaleX), height: 4,
          background: 'var(--cv-muted2)', borderRadius: 1,
        }} />
      ))}
      <div style={{
        position: 'absolute',
        left: vx * scaleX, top: vy * scaleY,
        width:  Math.max(4, vw * scaleX),
        height: Math.max(4, vh * scaleY),
        border: '1.5px solid var(--cv-gold2)',
        background: 'rgba(212,184,112,.08)', pointerEvents: 'none',
      }} />
    </div>
  );
}
```

- [ ] **Step 2: Wire into CanvasView**

In `src/pages/CanvasView.jsx`, import and render below the toolbar:

```javascript
import CanvasMinimap from '../canvas/CanvasMinimap';

// inside the JSX
<CanvasMinimap
  panX={canvas?.panX ?? 0}
  panY={canvas?.panY ?? 0}
  zoom={canvas?.zoom ?? 1}
  cards={cards}
/>
```

- [ ] **Step 3: Verify**

Reload. Minimap visible bottom-right. Cards show as gray rectangles. Pan the canvas — gold viewport indicator moves.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/CanvasMinimap.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): minimap with viewport indicator"
```

---

### Task 19: Selection + Delete Key + Undo Stub

**Files:**
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Add selection state and Delete key handling**

In `src/pages/CanvasView.jsx`, add state:

```javascript
const [selectedId, setSelectedId] = useState(null);
```

Update each card's ctx:

```javascript
selected: selectedId === c.id,
onSelect: () => setSelectedId(c.id),
```

Extend the keyboard useEffect to handle Delete/Backspace:

```javascript
useEffect(() => {
  function onKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'v' || e.key === 'V') setTool('select');
    if (e.key === 'h' || e.key === 'H') setTool('pan');
    if (e.key === 'c' || e.key === 'C') setTool('connect');
    if (e.key === 'Escape') { setTool('select'); setSelectedId(null); setAddPopup(null); setCtxMenu(null); }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      deleteCard(selectedId);
      setSelectedId(null);
    }
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [selectedId, deleteCard]);
```

Also add background-click clears selection. Pass to CanvasEngine:

```javascript
onBackgroundClick={() => setSelectedId(null)}
```

- [ ] **Step 2: Verify**

Reload. Click a card — gold outline. Click background — outline clears. Press Delete with card selected — card disappears. Press Esc — selection cleared.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CanvasView.jsx
git commit -m "feat(canvas): selection state + Delete key + Esc clears"
```

---

### Task 20: Phase 1 Smoke Test + README Note

**Files:**
- Modify: `CLAUDE.md` (root) — add canvas section if not present, OR create `studio-os/docs/canvas-quickstart.md`

- [ ] **Step 1: Run a full smoke test in the browser**

Use `mcp__Claude_Preview__preview_eval` (name `studio-os`):

```javascript
window.location.href = '/canvas/new';
```

Manually verify the following work end-to-end:
1. Auto-create canvas — URL changes from `/canvas/new` to `/canvas/<uuid>`
2. Drag "Note" from sidebar onto canvas → editable
3. Pan with H tool, zoom with Ctrl+wheel
4. Apply Moodboard template — cards appear
5. Connect tool: link two cards, dashed curve appears
6. Right-click empty space → context menu → add Heading
7. Reload page — everything persists
8. Click "Home" in sidebar — navigates to `/`

Take a final screenshot via `mcp__Claude_Preview__preview_screenshot`.

- [ ] **Step 2: Document quickstart**

Create `studio-os/docs/canvas-quickstart.md`:

```markdown
# Canvas — Quickstart

The canvas lives at `/canvas/:canvasId` (studio-wide) or `/clients/:clientId/canvas/:canvasId`.

## Routes
- `/canvas/new` — auto-creates a fresh studio canvas, redirects to its id
- `/canvas/:id` — opens existing canvas
- `/clients/:clientId/canvas/:id` — canvas tied to a client

## Keyboard
- `V` — select | `H` — pan | `C` — connect | `Esc` — clear | `Delete` — remove selected

## Tools
- Drag elements from the left sidebar onto the canvas
- "+" button on each card adds related card to the right
- Right-click empty space for the context menu
- Bottom toolbar: tool switch, zoom, fit-to-content
- "Templ" in sidebar opens the template picker (18+ templates)

## Phase 2 (next): smart cards (budget, tasks, files) tied to live CRM data.
## Phase 3 (next): new HomePage replacing Dashboard, AI panel.
```

- [ ] **Step 3: Commit**

```bash
git add docs/canvas-quickstart.md
git commit -m "docs(canvas): phase 1 quickstart"
```

---

## Phase 1 Completion Checklist

After all tasks:

- [ ] Migration applied, 3 tables visible in Supabase
- [ ] `/canvas/new` auto-creates and redirects to UUID route
- [ ] All 6 static card types render and edit correctly
- [ ] Drag from sidebar adds cards at drop position
- [ ] Tool switching works (mouse + V/H/C keys)
- [ ] Templates panel applies template cards into viewport center
- [ ] Connections render as gold dashed curves with arrows
- [ ] Right-click context menu works
- [ ] Minimap shows cards + viewport indicator
- [ ] Page reload preserves canvas/cards/connections
- [ ] CRM untouched: `/`, `/clients`, `/cashflow`, `/calendario`, `/pricing`, `/send` work as before
- [ ] No console errors during normal use

**Next:** Phase 2 plan (`docs/superpowers/plans/2026-04-16-canvas-phase2-smart-cards.md`) — smart cards (budget/tasks/files), `ClientCanvasHub` page replacing `ClientDetail`.

