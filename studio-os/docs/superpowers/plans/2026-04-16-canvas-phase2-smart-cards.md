# Canvas Integration — Phase 2: Smart Cards & Client Hub

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisites:** Phase 1 (`2026-04-16-canvas-phase1-foundation.md`) complete and merged.

**Goal:** Add four "smart" card types that read/write live CRM data (budget, tasks, files, project overview). Replace `ClientDetail.jsx` with `ClientCanvasHub.jsx` — a dark-themed list of canvases per client with a "+ New Canvas" CTA.

**Architecture:** Smart cards subscribe to `useStore()` and use existing `useProjects()`/`useCalendarTasks()` hooks for live data. Their `canvas_cards.ref_id` field points to a `projects.id`. Updates from smart cards flow through existing CRUD, so CashflowPage / CalendarPage stay in sync automatically.

**End state of Phase 2:** From a client page (still dark theme), you see all of that client's canvases as tiles, can create a new one, and inside any canvas you can place "Budget", "Tasks", "Files", "Project Overview" cards bound to specific projects. Editing a budget card updates `projects` table, immediately visible in CashflowPage.

---

### Task 1: Smart Card — BudgetCard

**Files:**
- Create: `src/canvas/cards/BudgetCard.jsx`
- Modify: `src/canvas/cards/index.js`

- [ ] **Step 1: Create BudgetCard**

Create `src/canvas/cards/BudgetCard.jsx`:

```javascript
import { useState } from 'react';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';

export default function BudgetCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;
  const [editing, setEditing] = useState(false);

  // If no project linked, show picker
  if (!project) {
    return (
      <CardShell
        card={card}
        title="💰 Budget"
        onTitleChange={() => {}}
        {...ctx}
      >
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>
          Collega un progetto:
        </div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ refId: e.target.value })}
          defaultValue=""
          style={{
            width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5,
            padding: '5px 8px', fontSize: 11, background: 'var(--cv-white)',
          }}
        >
          <option value="">— Scegli progetto —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </CardShell>
    );
  }

  const total     = Number(project.price)      || 0;
  const paid      = Number(project.paidAmount) || 0;
  const remaining = Math.max(0, total - paid);
  const pct       = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <CardShell
      card={card}
      title={`💰 ${project.title}`}
      onTitleChange={() => {}}
      {...ctx}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row label="Totale" value={fmtEur(total)} />
        <Row label="Pagato" value={fmtEur(paid)} bold />
        <Row label="Resto"  value={fmtEur(remaining)} muted />

        <div style={{ height: 6, background: 'var(--cv-bg)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
          <div style={{
            height: '100%', width: pct + '%',
            background: pct >= 100 ? 'var(--cv-sage)' : 'var(--cv-gold)',
            borderRadius: 3, transition: 'width .3s',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--cv-muted2)', textAlign: 'right' }}>{pct}%</div>

        {editing ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <input
              type="number"
              defaultValue={paid}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateProject(project.id, { paidAmount: Number(e.target.value) || 0 });
                  setEditing(false);
                }
              }}
              placeholder="Nuovo pagato"
              style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--cv-border)' }}
            />
            <button onClick={() => setEditing(false)} style={miniBtn}>×</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{
            ...miniBtn, marginTop: 6, alignSelf: 'flex-start',
          }}>Aggiorna pagato</button>
        )}
      </div>
    </CardShell>
  );
}

function Row({ label, value, bold, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
      <span style={{ color: 'var(--cv-muted)' }}>{label}</span>
      <span style={{ fontWeight: bold ? 600 : 400, color: muted ? 'var(--cv-muted2)' : 'var(--cv-text)' }}>{value}</span>
    </div>
  );
}

function fmtEur(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
}

const miniBtn = {
  padding: '4px 10px', fontSize: 10.5, borderRadius: 4,
  border: '1px solid var(--cv-border)', background: 'var(--cv-white)',
  color: 'var(--cv-text)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
};
```

- [ ] **Step 2: Register in card registry**

In `src/canvas/cards/index.js`, add import and entry:

```javascript
import BudgetCard from './BudgetCard';

export const CARD_COMPONENTS = {
  note:    NoteCard,
  heading: HeadingCard,
  image:   ImageCard,
  link:    LinkCard,
  todo:    TodoCard,
  board:   BoardCard,
  budget:  BudgetCard,
};
```

- [ ] **Step 3: Verify**

In the preview, navigate to an existing canvas. Use console:

```javascript
// preview_eval (name studio-os)
// Replace <canvasId> with the current id (visible in URL)
const cId = window.location.pathname.split('/').pop();
fetch('https://kgxiaaikytuosyzaxfhm.supabase.co/rest/v1/canvas_cards', {
  method: 'POST',
  headers: {
    apikey: import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (await window.__supa?.auth.getSession()).data.session.access_token,
  },
  body: JSON.stringify({ canvas_id: cId, type: 'budget', x: 3000, y: 3000, w: 240 }),
});
```

Easier: temporarily add a button in the sidebar with `onClick={() => addCard({ type: 'budget', x: 3000, y: 3000, w: 240 })}` and click it. Verify the card renders, shows project picker. Pick a project — card renders budget. Click "Aggiorna pagato", enter a value, press Enter. Reload page — value persists in `projects.paid_amount`.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/BudgetCard.jsx src/canvas/cards/index.js
git commit -m "feat(canvas): smart BudgetCard reads/writes projects.paidAmount"
```

---

### Task 2: Smart Card — TasksCard

**Files:**
- Create: `src/canvas/cards/TasksCard.jsx`
- Modify: `src/canvas/cards/index.js`

- [ ] **Step 1: Create TasksCard**

Create `src/canvas/cards/TasksCard.jsx`:

```javascript
import { useState } from 'react';
import CardShell from './CardShell';
import { useCalendarTasks, useStore, useProjects } from '../../hooks/useStore';

/**
 * Smart card showing calendar_tasks scoped to a project (refId = projectId)
 * OR to a client (data.clientId) — picker shown if neither set.
 * Edits flow through useCalendarTasks().
 */
export default function TasksCard({ card, ctx, onUpdate }) {
  const { calendarTasks, updateCalendarTask, addCalendarTask } = useCalendarTasks();
  const { projects } = useProjects();
  const { clients } = useStore();
  const data = card.data || {};
  const filter = data.filter || 'open'; // 'open' | 'all' | 'done'
  const [draft, setDraft] = useState('');

  // Scope: refId == projectId OR data.clientId
  const scoped = calendarTasks.filter(t => {
    if (card.refId && t.projectId !== card.refId) return false;
    if (data.clientId && t.clientId !== data.clientId) return false;
    if (filter === 'open' && t.isDone) return false;
    if (filter === 'done' && !t.isDone) return false;
    return true;
  });

  const titleLabel = card.refId
    ? `✓ Tasks · ${projects.find(p => p.id === card.refId)?.title ?? '?'}`
    : data.clientId
      ? `✓ Tasks · ${clients.find(c => c.id === data.clientId)?.name ?? '?'}`
      : '✓ Tasks';

  // No scope set — show picker
  if (!card.refId && !data.clientId) {
    return (
      <CardShell card={card} title={titleLabel} onTitleChange={() => {}} {...ctx}>
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>
          Scegli scope:
        </div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith('p:')) onUpdate({ refId: v.slice(2) });
            else if (v.startsWith('c:')) onUpdate({ data: { ...data, clientId: v.slice(2) } });
          }}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli —</option>
          <optgroup label="Progetti">
            {projects.map(p => <option key={p.id} value={'p:' + p.id}>{p.title}</option>)}
          </optgroup>
          <optgroup label="Clienti">
            {clients.map(c => <option key={c.id} value={'c:' + c.id}>{c.name}</option>)}
          </optgroup>
        </select>
      </CardShell>
    );
  }

  async function add() {
    if (!draft.trim()) return;
    const today = new Date().toISOString().slice(0,10);
    await addCalendarTask({
      title: draft.trim(),
      date: today,
      isDone: false,
      color: '#6B5EA8',
      projectId: card.refId || null,
      clientId: data.clientId || null,
    });
    setDraft('');
  }

  return (
    <CardShell card={card} title={titleLabel} onTitleChange={() => {}} {...ctx}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {['open','all','done'].map(f => (
          <button key={f} onClick={() => onUpdate({ data: { ...data, filter: f } })}
            style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: filter === f ? 'var(--cv-text)' : 'transparent',
              color:      filter === f ? '#fff' : 'var(--cv-muted)',
              border: '1px solid var(--cv-border)', cursor: 'pointer',
            }}>{f === 'open' ? 'Aperti' : f === 'done' ? 'Fatti' : 'Tutti'}</button>
        ))}
      </div>

      <div>
        {scoped.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--cv-muted2)', padding: '6px 0' }}>Nessun task.</div>
        )}
        {scoped.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
            <div onClick={(e) => { e.stopPropagation(); updateCalendarTask(t.id, { isDone: !t.isDone }); }}
              style={{
                width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                border: '1.5px solid ' + (t.isDone ? 'var(--cv-sage)' : 'var(--cv-border)'),
                background: t.isDone ? 'var(--cv-sage)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 8,
              }}
            >{t.isDone ? '✓' : ''}</div>
            <span style={{
              fontSize: 11.5, color: 'var(--cv-text)',
              textDecoration: t.isDone ? 'line-through' : 'none',
              opacity: t.isDone ? 0.5 : 1, flex: 1,
            }}>{t.title}</span>
            <span style={{ fontSize: 9.5, color: 'var(--cv-muted2)' }}>{t.date?.slice(5)}</span>
          </div>
        ))}
      </div>

      <input
        placeholder="+ Nuovo task" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
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

- [ ] **Step 2: Register**

In `src/canvas/cards/index.js`:

```javascript
import TasksCard from './TasksCard';

export const CARD_COMPONENTS = {
  note: NoteCard, heading: HeadingCard, image: ImageCard,
  link: LinkCard, todo: TodoCard, board: BoardCard,
  budget: BudgetCard, tasks: TasksCard,
};
```

- [ ] **Step 3: Verify**

Add a `tasks` card via console (or temporary button). Pick a client, see existing tasks, add a new one, mark one done. Open `/calendario` in another tab — verify the new task appears there too.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/TasksCard.jsx src/canvas/cards/index.js
git commit -m "feat(canvas): smart TasksCard wired to calendar_tasks"
```

---

### Task 3: Smart Card — FilesCard

**Files:**
- Create: `src/canvas/cards/FilesCard.jsx`
- Modify: `src/canvas/cards/index.js`

- [ ] **Step 1: Create FilesCard**

Create `src/canvas/cards/FilesCard.jsx`:

```javascript
import { useRef, useState } from 'react';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';
import * as db from '../../lib/db';

export default function FilesCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  if (!project) {
    return (
      <CardShell card={card} title="📎 Files" onTitleChange={() => {}} {...ctx}>
        <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>Collega progetto:</div>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => onUpdate({ refId: e.target.value })}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </CardShell>
    );
  }

  const files = project.files || [];

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const meta = await db.uploadProjectFile(project.id, file);
      await updateProject(project.id, { files: [...files, meta] });
    } catch (err) {
      alert('Upload fallito: ' + err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <CardShell card={card} title={`📎 ${project.title}`} onTitleChange={() => {}} {...ctx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {files.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--cv-muted2)' }}>Nessun file.</div>
        )}
        {files.map((f, i) => (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
             onClick={(e) => e.stopPropagation()}
             style={{
               display: 'flex', alignItems: 'center', gap: 6,
               padding: '4px 6px', background: 'var(--cv-bg)', borderRadius: 4,
               fontSize: 11, color: 'var(--cv-text)', textDecoration: 'none',
             }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            <span style={{ fontSize: 9, color: 'var(--cv-muted2)' }}>{Math.round((f.size || 0) / 1024)}KB</span>
          </a>
        ))}
      </div>
      <button onClick={() => fileRef.current?.click()} disabled={busy}
        style={{
          marginTop: 8, padding: '5px 10px', fontSize: 11, borderRadius: 5,
          border: '1px dashed var(--cv-border)', background: 'transparent',
          color: 'var(--cv-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%',
        }}>{busy ? 'Caricamento…' : '+ Aggiungi file'}</button>
      <input ref={fileRef} type="file" onChange={onUpload} style={{ display: 'none' }} />
    </CardShell>
  );
}
```

- [ ] **Step 2: Register**

In `src/canvas/cards/index.js`, add `import FilesCard from './FilesCard';` and entry `files: FilesCard,`.

- [ ] **Step 3: Verify**

Add a files card, link to a project, upload a file. Open `/projects/<id>` in another tab — file appears in project's files list.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/FilesCard.jsx src/canvas/cards/index.js
git commit -m "feat(canvas): smart FilesCard with upload to project storage"
```

---

### Task 4: Smart Card — ProjectOverviewCard

**Files:**
- Create: `src/canvas/cards/ProjectOverviewCard.jsx`
- Modify: `src/canvas/cards/index.js`

- [ ] **Step 1: Create ProjectOverviewCard**

Create `src/canvas/cards/ProjectOverviewCard.jsx`:

```javascript
import { Link } from 'react-router-dom';
import CardShell from './CardShell';
import { useProjects } from '../../hooks/useStore';
import { STAGE_LABELS, PAYMENT_LABELS } from '../../lib/constants';

export default function ProjectOverviewCard({ card, ctx, onUpdate }) {
  const { getProject, updateProject, projects } = useProjects();
  const project = card.refId ? getProject(card.refId) : null;

  if (!project) {
    return (
      <CardShell card={card} title="📋 Project" onTitleChange={() => {}} {...ctx}>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          defaultValue=""
          onChange={(e) => onUpdate({ refId: e.target.value })}
          style={{ width: '100%', border: '1px solid var(--cv-border)', borderRadius: 5, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">— Scegli progetto —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </CardShell>
    );
  }

  return (
    <CardShell card={card} title={`📋 ${project.title}`} onTitleChange={() => {}} {...ctx}>
      <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
        <Row label="Stage" >
          <select
            value={project.stage || ''}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => updateProject(project.id, { stage: e.target.value })}
            style={selectStyle}
          >
            {Object.entries(STAGE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
        <Row label="Pagamento" >
          <select
            value={project.paymentStatus || 'unpaid'}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => updateProject(project.id, { paymentStatus: e.target.value })}
            style={selectStyle}
          >
            {Object.entries(PAYMENT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
        {project.deadline && <Row label="Deadline"><span>{project.deadline}</span></Row>}
        <Link
          to={`/projects/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 6, fontSize: 11, color: 'var(--cv-purple)',
            textDecoration: 'none', alignSelf: 'flex-start',
          }}
        >Apri scheda completa →</Link>
      </div>
    </CardShell>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:6 }}>
      <span style={{ color:'var(--cv-muted)' }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

const selectStyle = {
  border: '1px solid var(--cv-border)', borderRadius: 4,
  padding: '2px 5px', fontSize: 11, background: 'var(--cv-white)',
  color: 'var(--cv-text)',
};
```

- [ ] **Step 2: Register**

In `src/canvas/cards/index.js`, add `import ProjectOverviewCard from './ProjectOverviewCard';` and entry `'project-overview': ProjectOverviewCard,`.

- [ ] **Step 3: Verify**

Add a `project-overview` card, link a project, change its stage from the dropdown. Open `/` (Dashboard Kanban) — project should have moved to the new stage column.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/cards/ProjectOverviewCard.jsx src/canvas/cards/index.js
git commit -m "feat(canvas): smart ProjectOverviewCard editable stage/payment"
```

---

### Task 5: Add Smart Cards to Sidebar + AddPopup

**Files:**
- Modify: `src/canvas/CanvasSidebar.jsx`
- Modify: `src/canvas/AddPopup.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Extend sidebar with smart-card section**

In `src/canvas/CanvasSidebar.jsx`, after the static `ITEMS` constant add:

```javascript
const SMART_ITEMS = [
  { type: 'budget',           label: 'Budget',  icon: '💰' },
  { type: 'tasks',            label: 'Tasks',   icon: '✓' },
  { type: 'files',            label: 'Files',   icon: '📎' },
  { type: 'project-overview', label: 'Project', icon: '📋' },
];
```

In the JSX, after the `<div style={{ width: 32, ...separator}} />` and before the Templates button, add:

```javascript
{SMART_ITEMS.map(it => (
  <SideBtn key={it.type} icon={it.icon} label={it.label} draggable type={it.type} />
))}
<div style={{ width: 32, height: 1, background: 'var(--cv-border2)', margin: '6px 0' }} />
```

- [ ] **Step 2: Extend AddPopup**

In `src/canvas/AddPopup.jsx`, replace the `ITEMS` constant with:

```javascript
const ITEMS = [
  { type: 'note',    label: 'Note',  icon: '📝' },
  { type: 'image',   label: 'Image', icon: '🖼' },
  { type: 'board',   label: 'Board', icon: '▦' },
  { type: 'todo',    label: 'To-Do', icon: '✓' },
  { type: 'heading', label: 'Title', icon: 'T' },
  { type: 'link',    label: 'Link',  icon: '🔗' },
  { type: 'budget',           label: 'Budget',  icon: '💰' },
  { type: 'tasks',            label: 'Tasks',   icon: '✓' },
  { type: 'files',            label: 'Files',   icon: '📎' },
  { type: 'project-overview', label: 'Project', icon: '📋' },
];
```

- [ ] **Step 3: Extend defaults map in CanvasView**

In `src/pages/CanvasView.jsx`, find both `defaults` objects (the one in `onDrop` and in `AddPopup onPick`) and append entries:

```javascript
budget:             { data: {} },
tasks:              { data: { filter: 'open' } },
files:              { data: {} },
'project-overview': { data: {} },
```

- [ ] **Step 4: Verify**

Reload the canvas. Sidebar now shows smart icons below the divider. Drag "Budget" onto canvas, link a project. Reload — smart card persists with linked project.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/CanvasSidebar.jsx src/canvas/AddPopup.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): smart cards in sidebar and add popup"
```

---

### Task 6: ClientCanvasHub — New Client Page

**Files:**
- Create: `src/pages/ClientCanvasHub.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ClientCanvasHub**

Create `src/pages/ClientCanvasHub.jsx`:

```javascript
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useClients, useCanvases, useProjects } from '../hooks/useStore';
import { Plus, ArrowLeft, FolderOpen, Trash2, Pencil } from 'lucide-react';

export default function ClientCanvasHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClient } = useClients();
  const { canvases, addCanvas, deleteCanvas, updateCanvasMeta, getCanvasesByClient } = useCanvases();
  const { getProjectsByClient } = useProjects();

  const client = getClient(id);
  const clientCanvases = getCanvasesByClient(id);
  const clientProjects = getProjectsByClient(id);
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-sm text-ink/60">Cliente non trovato.</p>
        <Link to="/clients" className="text-burgundy text-sm">← Torna ai clienti</Link>
      </div>
    );
  }

  async function newCanvas() {
    const c = await addCanvas({ name: 'Untitled Canvas', clientId: id });
    navigate(`/clients/${id}/canvas/${c.id}`);
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/clients" className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink mb-2">
            <ArrowLeft size={12} /> Tutti i clienti
          </Link>
          <h1 className="text-3xl font-display tracking-wide">{client.name}</h1>
          {client.brand && <p className="text-sm text-ink/60 mt-1">{client.brand}</p>}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink/60">
            {client.email && <span>📧 {client.email}</span>}
            {client.phone && <span>📞 {client.phone}</span>}
            {client.language && <span>🗣 {client.language}</span>}
          </div>
        </div>
        <button onClick={newCanvas}
          className="bg-burgundy text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-burgundy/90">
          <Plus size={14} /> Nuovo Canvas
        </button>
      </div>

      {/* Canvases grid */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3">Canvases</h2>
        {clientCanvases.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center">
            <FolderOpen size={32} className="mx-auto mb-2 text-ink/30" />
            <p className="text-sm text-ink/60 mb-3">Nessun canvas per questo cliente.</p>
            <button onClick={newCanvas} className="bg-burgundy text-white px-4 py-2 rounded-md text-xs">
              Crea il primo canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clientCanvases.map(cv => (
              <div key={cv.id} className="glass rounded-lg overflow-hidden hover:shadow-card transition group">
                <Link to={`/clients/${id}/canvas/${cv.id}`} className="block">
                  <div className="h-28 bg-gradient-to-br from-cream/10 to-paper/5 flex items-center justify-center text-ink/30">
                    <FolderOpen size={28} />
                  </div>
                  <div className="p-3">
                    {renameId === cv.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onClick={(e) => e.preventDefault()}
                        onBlur={() => {
                          if (renameVal.trim()) updateCanvasMeta(cv.id, { name: renameVal.trim() });
                          setRenameId(null);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setRenameId(null); }}
                        className="text-sm font-medium bg-transparent border-b border-ink/30 outline-none w-full"
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">{cv.name}</p>
                    )}
                    <p className="text-[10px] text-ink/40 mt-1">
                      {new Date(cv.updatedAt || cv.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </Link>
                <div className="px-3 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => { setRenameId(cv.id); setRenameVal(cv.name); }}
                    className="text-[10px] text-ink/50 hover:text-ink flex items-center gap-1">
                    <Pencil size={10} /> Rinomina
                  </button>
                  <button
                    onClick={() => { if (confirm('Eliminare questo canvas?')) deleteCanvas(cv.id); }}
                    className="text-[10px] text-burgundy/70 hover:text-burgundy flex items-center gap-1 ml-auto">
                    <Trash2 size={10} /> Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
          Progetti ({clientProjects.length})
        </h2>
        {clientProjects.length === 0 ? (
          <p className="text-sm text-ink/40">Nessun progetto.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {clientProjects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="glass rounded-md p-3 hover:shadow-card transition flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-[10px] text-ink/40 mt-1">
                    {p.stage} · {p.paymentStatus || 'unpaid'}
                  </p>
                </div>
                {p.price && <span className="text-xs text-ink/60">€{p.price}</span>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Replace ClientDetail in routes**

In `src/App.jsx`, change the import:

```javascript
// before
import ClientDetail from './pages/ClientDetail';
// after
import ClientCanvasHub from './pages/ClientCanvasHub';
```

And in `AdminContent` Routes, change:

```javascript
<Route path="/clients/:id"   element={<ClientCanvasHub />} />
```

- [ ] **Step 3: Verify**

Navigate to `/clients`, click any client. Expect dark-themed page with the client name large, list of canvases (initially empty), "+ Nuovo Canvas" button, and projects below. Click "+ Nuovo Canvas" → creates a canvas and redirects to `/clients/<clientId>/canvas/<canvasId>` with the clean canvas full-screen.

In the canvas, click "Home" in the sidebar → returns to ClientCanvasHub. Refresh — canvas appears in the grid. Hover canvas tile → "Rinomina"/"Elimina" buttons appear.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ClientCanvasHub.jsx src/App.jsx
git commit -m "feat: ClientCanvasHub replaces ClientDetail with canvas grid"
```

---

### Task 7: Phase 2 Cleanup — Remove ClientDetail.jsx

**Files:**
- Delete: `src/pages/ClientDetail.jsx`

- [ ] **Step 1: Verify nothing imports it anymore**

Use grep to check:
```
grep -r "from.*ClientDetail" studio-os/src/ || echo "No imports left"
```
Expected: "No imports left".

- [ ] **Step 2: Delete the file**

```bash
rm studio-os/src/pages/ClientDetail.jsx
```

- [ ] **Step 3: Verify build still works**

In the preview, navigate around: `/`, `/clients`, click a client (`/clients/:id`), `/projects/:id`, `/calendario`, `/cashflow`. Expected: no broken routes, no console errors.

- [ ] **Step 4: Commit**

```bash
git add -A studio-os/src/pages/ClientDetail.jsx
git commit -m "chore: remove obsolete ClientDetail.jsx (replaced by ClientCanvasHub)"
```

---

### Task 8: TemplatePanel — Smart-Card-Aware Apply

**Files:**
- Modify: `src/canvas/TemplatePanel.jsx`
- Modify: `src/pages/CanvasView.jsx`

When a template includes smart cards (e.g., budget), they need a `refId` to function. We add a quick "ref selector" overlay if any applied card is a smart type without a refId.

- [ ] **Step 1: Make `applyTemplate` in CanvasView smarter**

Replace the `onApply` prop body in CanvasView with:

```javascript
onApply={(tmpl) => {
  const z  = canvas?.zoom ?? 1;
  const px = canvas?.panX ?? 0;
  const py = canvas?.panY ?? 0;
  const centerWorldX = (window.innerWidth  / 2 - px) / z;
  const centerWorldY = (window.innerHeight / 2 - py) / z;
  const dx = centerWorldX - 3000;
  const dy = centerWorldY - 3000;

  const SMART = ['budget', 'tasks', 'files', 'project-overview'];

  tmpl.cards.forEach((c) => {
    const { type, x, y, w, ...rest } = c;
    const isSmart = SMART.includes(type);
    const data    = isSmart ? (rest.data || {}) : rest;
    const refId   = isSmart ? (rest.refId || null) : undefined;
    addCard({
      type,
      x: x + dx,
      y: y + dy,
      w: w || 230,
      ...(refId !== undefined ? { refId } : {}),
      data,
    });
  });
  setShowTemplates(false);
}}
```

This change ensures both static (data inline like `text`/`title`) and smart (data + refId) template entries apply correctly.

- [ ] **Step 2: Verify**

Apply Moodboard template (static) — works as before. Confirm smart template paths don't crash even when refId is null (cards show their picker).

- [ ] **Step 3: Commit**

```bash
git add src/pages/CanvasView.jsx
git commit -m "feat(canvas): template apply handles smart vs static cards"
```

---

### Task 9: Quick-Action — "Open Default Canvas" from Project Page

**Files:**
- Modify: `src/pages/ProjectDetail.jsx`

Goal: from any project, jump to a canvas with a `project-overview` card pre-linked. We'll find the client's first canvas (or create one) and open it.

- [ ] **Step 1: Add a button to ProjectDetail**

Open `src/pages/ProjectDetail.jsx`. Find the project header area (near the top of the JSX where title is rendered). Add inside the appropriate header container:

```javascript
import { useNavigate } from 'react-router-dom';
import { useCanvases } from '../hooks/useStore';
// inside component:
const navigate = useNavigate();
const { getCanvasesByClient, addCanvas } = useCanvases();

async function openCanvas() {
  if (!project?.clientId) return alert('Progetto senza cliente — assegnane uno per usare il canvas.');
  const existing = getCanvasesByClient(project.clientId);
  let target = existing[0];
  if (!target) {
    target = await addCanvas({ name: project.title + ' — Canvas', clientId: project.clientId });
  }
  navigate(`/clients/${project.clientId}/canvas/${target.id}`);
}
```

In the JSX, near other action buttons, add:

```jsx
<button onClick={openCanvas}
  className="text-xs px-3 py-1.5 rounded-md border border-ink/15 hover:bg-ink/5">
  Apri Canvas
</button>
```

(Don't break existing layout — match the pattern of nearby buttons.)

- [ ] **Step 2: Verify**

Open any project (`/projects/:id`), click "Apri Canvas". If client has no canvas, one is created and you land in it. If existing canvas, you land in it directly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProjectDetail.jsx
git commit -m "feat(project): quick action to open client canvas from project page"
```

---

## Phase 2 Completion Checklist

- [ ] All 4 smart cards (`budget`, `tasks`, `files`, `project-overview`) render and edit
- [ ] Edits in smart cards reflect in CashflowPage / CalendarPage / Dashboard
- [ ] Smart cards visible in left sidebar and AddPopup
- [ ] `/clients/:id` opens `ClientCanvasHub` with canvas grid + project list
- [ ] `+ Nuovo Canvas` from hub creates and opens a canvas
- [ ] Hover canvas tile shows Rinomina/Elimina
- [ ] `ClientDetail.jsx` deleted, no broken imports
- [ ] Project page has "Apri Canvas" button
- [ ] Templates with smart card placeholders apply without crashing

**Next:** Phase 3 plan (`docs/superpowers/plans/2026-04-16-canvas-phase3-home-and-ai.md`) — new HomePage replacing Dashboard, MAT AI panel, polish.
