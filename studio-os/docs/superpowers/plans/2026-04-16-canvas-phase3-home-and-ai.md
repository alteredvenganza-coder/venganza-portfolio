# Canvas Integration — Phase 3: HomePage & AI Panel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisites:** Phase 1 and Phase 2 complete and merged.

**Goal:** Replace `Dashboard.jsx` with a new `HomePage.jsx` (dark CRM theme) styled around canvas-first workflow: greeting, module launcher, recent canvases, recent clients, guide. Add the MAT AI side panel inside the canvas (chat + plugins). Polish: undo/redo, fit-on-load, canvas thumbnail generation.

**Architecture:** HomePage stays in dark CRM theme (no `.canvas-root`). It uses `useCanvases` + `useClients` for live data. AI panel reuses the existing `/api/extract-contract`-style endpoints to call Claude (or a new lightweight endpoint).

---

### Task 1: HomePage — Greeting + Module Launcher

**Files:**
- Create: `src/pages/HomePage.jsx`

- [ ] **Step 1: Create the page**

Create `src/pages/HomePage.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvases, useClients } from '../hooks/useStore';
import { Plus, FolderOpen, Users, Sparkles, Layers, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { canvases, addCanvas } = useCanvases();
  const { clients } = useClients();
  const [showSoon, setShowSoon] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno ☀️' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera 🌙';

  async function newStudioCanvas() {
    const c = await addCanvas({ name: 'Untitled Canvas', clientId: null });
    navigate(`/canvas/${c.id}`);
  }

  const recentCanvases = canvases.slice(0, 6);
  const recentClients  = clients.slice(0, 6);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">{greeting}</p>
          <h1 className="text-4xl sm:text-5xl font-display tracking-wide">ALTERED STUDIOS</h1>
          <p className="text-sm text-ink/50 mt-1">Materializing Ideas — il tuo creative OS.</p>
        </div>
        <button onClick={newStudioCanvas}
          className="bg-burgundy text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-burgundy/90">
          <Plus size={14} /> Nuovo Canvas
        </button>
      </div>

      {/* Module launcher */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FCard color="burgundy" icon={Sparkles} name="MAT-IDEAS RENDERS"
            desc="Hyper-realistic 3D garment rendering. (In arrivo)" cta="Coming soon" disabled />
          <FCard color="burgundy" icon={Layers} name="ALTERED TECH PACKS"
            desc="Generate technical CAD flats and factory PDFs. (In arrivo)" cta="Coming soon" disabled />
          <FCard color="burgundy" icon={FolderOpen} name="MAT IDEAS CANVAS"
            desc="Infinite creative workspace per cliente, con template e AI."
            cta="Apri Canvas →" onClick={newStudioCanvas} />
        </div>

        <button onClick={() => setShowSoon(s => !s)}
          className="mt-3 text-xs text-ink/50 hover:text-ink flex items-center gap-2">
          <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full border border-ink/20 transition ${showSoon ? 'rotate-45 bg-ink text-white border-ink' : ''}`}>+</span>
          {showSoon ? 'Nascondi tool in arrivo' : 'Tool in arrivo'}
        </button>

        {showSoon && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {['Pattern AI','Fit Simulator','Fabric Sourcing','Pricing AI','Campaign Builder','Size Grading'].map(name => (
              <div key={name} className="glass rounded-md p-3 opacity-70">
                <p className="text-[10px] uppercase tracking-wider text-ink/40 mb-1">In sviluppo</p>
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent canvases */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-ink/50">Canvases recenti</h2>
        </div>
        {recentCanvases.length === 0 ? (
          <div className="glass rounded-lg p-6 text-center">
            <p className="text-sm text-ink/60 mb-3">Nessun canvas ancora.</p>
            <button onClick={newStudioCanvas} className="bg-burgundy text-white px-4 py-2 rounded-md text-xs">
              Crea il primo canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentCanvases.map(cv => {
              const client = clients.find(c => c.id === cv.clientId);
              const target = cv.clientId ? `/clients/${cv.clientId}/canvas/${cv.id}` : `/canvas/${cv.id}`;
              return (
                <button key={cv.id} onClick={() => navigate(target)}
                  className="glass rounded-lg overflow-hidden hover:shadow-card transition text-left">
                  <div className="h-20 bg-gradient-to-br from-cream/10 to-paper/5 flex items-center justify-center text-ink/30">
                    <FolderOpen size={22} />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{cv.name}</p>
                    <p className="text-[9px] text-ink/40 mt-0.5 truncate">
                      {client?.name || 'Studio'} · {timeAgo(cv.updatedAt || cv.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent clients */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-ink/50">Clienti recenti</h2>
          <button onClick={() => navigate('/clients')} className="text-xs text-ink/50 hover:text-ink">Vedi tutti →</button>
        </div>
        {recentClients.length === 0 ? (
          <p className="text-sm text-ink/40">Nessun cliente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentClients.map(c => (
              <button key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
                className="glass rounded-lg p-3 hover:shadow-card transition text-left">
                <div className="w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center text-burgundy text-xs font-medium mb-2">
                  {(c.name || '?').slice(0,1).toUpperCase()}
                </div>
                <p className="text-xs font-medium truncate">{c.name}</p>
                {c.brand && <p className="text-[10px] text-ink/40 truncate">{c.brand}</p>}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FCard({ color, icon: Icon, name, desc, cta, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`glass rounded-lg p-4 text-left transition relative ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-card hover:-translate-y-0.5'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-${color}`} />
      <Icon size={20} className={`text-${color} mb-3`} />
      <p className="text-[10px] uppercase tracking-wider font-bold mb-1">{name}</p>
      <p className="text-[11px] text-ink/55 leading-snug mb-3">{desc}</p>
      <p className={`text-[10px] uppercase tracking-wider font-semibold text-${color}`}>{cta}</p>
    </button>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'ora';
  if (diff < 3600) return Math.floor(diff/60) + 'm fa';
  if (diff < 86400) return Math.floor(diff/3600) + 'h fa';
  if (diff < 86400*7) return Math.floor(diff/86400) + 'g fa';
  return new Date(iso).toLocaleDateString('it-IT');
}
```

**Note on Tailwind dynamic classes**: the template uses `bg-${color}` and `text-${color}`. Tailwind's JIT requires safelist. Add to `tailwind.config.js` (in `safelist` array, create if missing):

```javascript
safelist: ['bg-burgundy', 'text-burgundy'],
```

If `safelist` already exists, append these two. If the project relies on direct class names elsewhere (search `bg-burgundy` in src), no change needed since they appear literally somewhere. Verify with `grep -r "bg-burgundy" studio-os/src/` — if non-zero, JIT will already include them and the safelist edit is unnecessary.

- [ ] **Step 2: Replace Dashboard route**

In `src/App.jsx`, change:

```javascript
// before
import Dashboard from './pages/Dashboard';
// after
import HomePage from './pages/HomePage';
```

And in `AdminContent`:

```javascript
<Route path="/" element={<HomePage />} />
```

- [ ] **Step 3: Verify**

Navigate to `/`. Expect dark glassmorphic page with:
- Greeting + ALTERED STUDIOS title + "Nuovo Canvas" button
- 3 module cards (2 disabled, 1 active)
- Recent canvases grid (empty state if first run)
- Recent clients grid

Click "Nuovo Canvas" → creates studio canvas, navigates to `/canvas/<uuid>`. Click "Home" in canvas sidebar → returns to HomePage. New canvas now appears in "Canvases recenti".

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.jsx src/App.jsx tailwind.config.js
git commit -m "feat: HomePage replaces Dashboard with canvas-first launcher"
```

---

### Task 2: Cleanup — Remove Dashboard.jsx

**Files:**
- Delete: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Verify nothing imports it**

Grep:
```
grep -r "from.*Dashboard" studio-os/src/ || echo "No imports"
```
Expected: "No imports".

- [ ] **Step 2: Delete and commit**

```bash
rm studio-os/src/pages/Dashboard.jsx
git add -A studio-os/src/pages/Dashboard.jsx
git commit -m "chore: remove obsolete Dashboard.jsx (replaced by HomePage)"
```

---

### Task 3: Sidebar — Add "Canvas Studio" Quick-Link

**Files:**
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Add nav entry**

Open `src/components/Layout.jsx`. Find the navigation list (links to `/`, `/clients`, etc.). Add a new entry between Clients and Calendario:

```jsx
<NavLink to="/canvas/new" /* match the className pattern of siblings */>
  <FolderOpen size={14} />
  <span>Canvas Studio</span>
</NavLink>
```

If `FolderOpen` isn't imported yet, add to lucide imports at top: `FolderOpen`.

The exact JSX pattern depends on the existing Layout markup — match siblings (className, icon size, ordering). The `/canvas/new` route auto-creates a fresh studio canvas (logic from Phase 1 Task 7) and redirects to its UUID.

- [ ] **Step 2: Verify**

Reload `/`. Sidebar shows "Canvas Studio" entry. Click it → creates a new studio canvas and opens it.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.jsx
git commit -m "feat(layout): Canvas Studio quick-link in sidebar"
```

---

### Task 4: AI Panel — Shell + Tabs

**Files:**
- Create: `src/canvas/AiPanel.jsx`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Create panel shell**

Create `src/canvas/AiPanel.jsx`:

```javascript
import { useState } from 'react';
import AiChat    from './ai/AiChat';
import AiPlugins from './ai/AiPlugins';

export default function AiPanel({ open, onClose, onAddCard }) {
  const [tab, setTab] = useState('chat');
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 320,
      background: 'var(--cv-surface)', borderLeft: '1px solid var(--cv-border)',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
      zIndex: 35, display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(26,24,22,.07)',
    }}>
      <div style={{ padding: '14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2 }}>MAT AI</div>
        <button onClick={onClose}
          style={{ width: 26, height: 26, borderRadius: 6, border: 'none',
                   background: 'transparent', cursor: 'pointer', color: 'var(--cv-muted)' }}>×</button>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--cv-border)', padding:'10px 16px 0' }}>
        {['chat','plugins'].map(t => (
          <div key={t} onClick={() => setTab(t)}
            style={{
              padding:'8px 14px', fontSize:11.5, fontWeight:600, cursor:'pointer',
              borderBottom:'2px solid ' + (tab === t ? 'var(--cv-gold2)' : 'transparent'),
              color: tab === t ? 'var(--cv-text)' : 'var(--cv-muted)',
            }}>{t === 'chat' ? 'Chat' : 'Plugins'}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'chat'    ? <AiChat onAddCard={onAddCard} />
                           : <AiPlugins onAddCard={onAddCard} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire AI button in CanvasView**

In `src/pages/CanvasView.jsx`, import:

```javascript
import AiPanel from '../canvas/AiPanel';
```

Add state:

```javascript
const [showAi, setShowAi] = useState(false);
```

Render the panel near the bottom of `.canvas-root`:

```javascript
<AiPanel
  open={showAi}
  onClose={() => setShowAi(false)}
  onAddCard={(partial) => addCard({
    type: 'note', x: 3000, y: 3000, w: 280, ...partial,
  })}
/>
```

Add a floating "MAT AI" button bottom-right (next to minimap):

```javascript
<button onClick={() => setShowAi(s => !s)}
  style={{
    position:'absolute', bottom:106, right:16, zIndex:40,
    padding:'8px 14px', borderRadius:20, border:'none',
    background:'var(--cv-text)', color:'#fff',
    fontSize:11.5, fontWeight:600, cursor:'pointer',
    boxShadow:'var(--cv-shadow)',
  }}>✨ MAT AI</button>
```

(Position above the minimap which is at bottom 18, height 80, so 106 leaves a small gap.)

- [ ] **Step 3: Commit (panel renders empty until next tasks)**

```bash
git add src/canvas/AiPanel.jsx src/pages/CanvasView.jsx
git commit -m "feat(canvas): AI panel shell with Chat/Plugins tabs"
```

---

### Task 5: AI Chat — Streaming Conversation

**Files:**
- Create: `src/canvas/ai/AiChat.jsx`

- [ ] **Step 1: Create AiChat**

Create `src/canvas/ai/AiChat.jsx`:

```javascript
import { useState, useRef, useEffect } from 'react';

export default function AiChat({ onAddCard }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Ciao! Sono MAT AI. Come posso aiutarti con la tua collezione oggi?' },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, 1e9); }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setDraft('');
    setBusy(true);
    try {
      const reply = await callAI(text);
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', text: 'Errore: ' + (e.message || e) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, padding:'12px 14px', gap:8, minHeight:0 }}>
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '88%', padding:'8px 12px', borderRadius: 9,
            background: m.role === 'user' ? 'var(--cv-border2)' : 'var(--cv-text)',
            color:      m.role === 'user' ? 'var(--cv-text)' : 'var(--cv-white)',
            fontSize: 12.5, lineHeight: 1.5,
            borderBottomRightRadius: m.role === 'user' ? 3 : 9,
            borderBottomLeftRadius:  m.role === 'user' ? 9 : 3,
            position: 'relative',
          }}>
            {m.text}
            {m.role === 'bot' && i > 0 && (
              <button onClick={() => onAddCard({ data: { title: '✨ MAT AI', text: m.text } })}
                style={{
                  display:'block', marginTop:6, fontSize:10, padding:'3px 8px',
                  background:'transparent', color:'inherit', opacity:0.7,
                  border:'1px solid currentColor', borderRadius:4, cursor:'pointer',
                }}>+ Aggiungi al canvas</button>
            )}
          </div>
        ))}
        {busy && <div style={{ fontSize: 11, color: 'var(--cv-muted)' }}>MAT AI sta pensando…</div>}
      </div>

      <div style={{ display:'flex', gap:6 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Scrivi a MAT AI…"
          rows={2}
          style={{
            flex:1, resize:'none', border:'1px solid var(--cv-border)', borderRadius:7,
            padding:'7px 9px', fontSize:12, background:'var(--cv-white)',
            color:'var(--cv-text)', outline:'none',
          }}
        />
        <button onClick={send} disabled={busy} style={{
          width:32, height:32, alignSelf:'flex-end',
          background:'var(--cv-gold2)', border:'none', borderRadius:7,
          cursor:'pointer', fontSize:14, color:'var(--cv-text)',
        }}>↑</button>
      </div>
    </div>
  );
}

async function callAI(prompt) {
  // Try the existing analyze-brief endpoint as a generic Claude proxy.
  // If unavailable, fall back to a stubbed response.
  try {
    const res = await fetch('/api/analyze-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: prompt,
        system: 'Sei MAT AI, assistente creativo per brand di moda. Rispondi in italiano, conciso e ispirazionale. Massimo 3 frasi salvo richiesta esplicita.',
      }),
    });
    if (!res.ok) throw new Error('AI endpoint ' + res.status);
    const data = await res.json();
    return data.text || data.response || data.analysis || '(risposta vuota)';
  } catch (e) {
    return `[MAT AI offline] Risposta simulata per: "${prompt.slice(0, 60)}…"`;
  }
}
```

**Note**: the actual `/api/analyze-brief` endpoint signature may differ. Before merging, open `api/analyze-brief.js` and verify the request shape. If it returns under a different field, adjust `data.text || ...` accordingly. If the endpoint enforces a specific request schema (e.g., requires `briefData` with structured fields), create a new endpoint `/api/canvas-chat.js` mirroring the project's existing Claude integration pattern (check `api/extract-contract.js` for the call template — same `Anthropic` SDK and `claude-sonnet-4-20250514` model). The fallback simulated response keeps Phase 3 unblocked.

- [ ] **Step 2: Verify**

Open canvas, click "✨ MAT AI", type "Suggerisci 3 nomi per una collezione invernale". A response appears. Click "+ Aggiungi al canvas" — a note appears with the AI text.

- [ ] **Step 3: Commit**

```bash
git add src/canvas/ai/AiChat.jsx
git commit -m "feat(canvas): AI chat panel with add-to-canvas button"
```

---

### Task 6: AI Plugins — Render / Copy / Palette

**Files:**
- Create: `src/canvas/ai/AiPlugins.jsx`

- [ ] **Step 1: Create the plugins panel**

Create `src/canvas/ai/AiPlugins.jsx`:

```javascript
import { useState } from 'react';

const PLUGINS = [
  { id:'render',  icon:'📸', color:'#FFF3E0', name:'MAT Render',   desc:'Visual concept descriptions', styles:['Foto Prodotto','Editorial','Sketch','Moodboard'] },
  { id:'copy',    icon:'✍️', color:'#F3E5F5', name:'Copy Creator', desc:'Marketing copy & captions',  styles:['Instagram','Prodotto','Email','TikTok'] },
  { id:'palette', icon:'🎨', color:'#E8F5E9', name:'Palette AI',   desc:'Palette colori con HEX',     styles:['Abbigliamento','Branding','Digital'] },
  { id:'naming',  icon:'🏷️', color:'#FCE4EC', name:'Naming AI',   desc:'Naming brand / prodotto',    styles:['Collection','Product','Campaign'] },
];

export default function AiPlugins({ onAddCard }) {
  const [open, setOpen]     = useState(null);
  const [busy, setBusy]     = useState(null);
  const [styleSel, setStyle] = useState({});
  const [prompts, setPrompts] = useState({});

  async function run(plug) {
    const p = (prompts[plug.id] || '').trim();
    if (!p) return alert('Inserisci una descrizione.');
    setBusy(plug.id);
    try {
      const sys = `Sei MAT AI. Genera contenuto plugin=${plug.id}, stile=${styleSel[plug.id] || plug.styles[0]}. Sii conciso e creativo. Italiano.`;
      const res = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: p, system: sys }),
      });
      const data = await res.json().catch(() => ({}));
      const text = data?.text || data?.response || data?.analysis
        || `[MAT AI offline] Plugin ${plug.name} su: "${p.slice(0,60)}"`;
      onAddCard({ data: { title: `${plug.icon} ${plug.name}`, text } });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
      {PLUGINS.map(plug => (
        <div key={plug.id} style={{
          border: '1px solid var(--cv-border)', borderRadius: 8,
          background: 'var(--cv-white)', overflow: 'hidden',
        }}>
          <div onClick={() => setOpen(o => o === plug.id ? null : plug.id)}
            style={{
              padding: '10px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'space-between',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 5, background: plug.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
              }}>{plug.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{plug.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--cv-muted)' }}>{plug.desc}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--cv-muted2)' }}>{open === plug.id ? '−' : '+'}</span>
          </div>

          {open === plug.id && (
            <div style={{ padding: '0 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              <select
                value={styleSel[plug.id] || plug.styles[0]}
                onChange={(e) => setStyle(s => ({ ...s, [plug.id]: e.target.value }))}
                style={{
                  padding: '6px 8px', border: '1px solid var(--cv-border)', borderRadius: 5,
                  fontSize: 11.5, background: 'var(--cv-bg)', color: 'var(--cv-text)',
                }}>
                {plug.styles.map(s => <option key={s}>{s}</option>)}
              </select>
              <textarea
                value={prompts[plug.id] || ''}
                onChange={(e) => setPrompts(p => ({ ...p, [plug.id]: e.target.value }))}
                placeholder="Descrivi la tua idea…"
                style={{
                  padding: '6px 8px', border: '1px solid var(--cv-border)', borderRadius: 5,
                  fontSize: 11.5, background: 'var(--cv-bg)', color: 'var(--cv-text)',
                  resize: 'vertical', minHeight: 52,
                }}
              />
              <button onClick={() => run(plug)} disabled={busy === plug.id}
                style={{
                  background: 'var(--cv-text)', color: '#fff', border: 'none', borderRadius: 6,
                  padding: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                }}>{busy === plug.id ? 'Generazione…' : 'Genera con MAT AI →'}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Open AI panel → Plugins tab. Expand "Copy Creator", pick style "Instagram", type prompt, click Genera. A note card appears at canvas center with the result.

- [ ] **Step 3: Commit**

```bash
git add src/canvas/ai/AiPlugins.jsx
git commit -m "feat(canvas): AI plugins panel (render/copy/palette/naming)"
```

---

### Task 7: Polish — Undo/Redo

**Files:**
- Modify: `src/hooks/useCanvas.js`
- Modify: `src/pages/CanvasView.jsx`

- [ ] **Step 1: Add history to useCanvas**

In `src/hooks/useCanvas.js`, add at the top of the hook function (after the `useState` declarations):

```javascript
const history    = useRef([]);   // array of { cards, connections } snapshots
const historyIdx = useRef(-1);

function snapshot() {
  // Slice forward redo branch when new action happens after undo
  history.current = history.current.slice(0, historyIdx.current + 1);
  history.current.push({
    cards:       JSON.parse(JSON.stringify(cards)),
    connections: JSON.parse(JSON.stringify(connections)),
  });
  historyIdx.current = history.current.length - 1;
  // Cap at 50
  if (history.current.length > 50) {
    history.current.shift();
    historyIdx.current--;
  }
}
```

After `setCards(cs)` etc. inside the load `.then()`, push initial snapshot:
```javascript
history.current = [{ cards: cs, connections: cn }];
historyIdx.current = 0;
```

In `addCard`, after `setCards(prev => [...prev, created])` add: `setTimeout(snapshot, 0);`
In `deleteCard`, before the optimistic removal, add `snapshot();`
In `addConnection` after success: `setTimeout(snapshot, 0);`
In `deleteConnection` before removal: `snapshot();`

(updateCard fires too often — skip snapshotting on every keystroke; instead snapshot on `onMoveEnd`/`onResizeEnd` from CanvasView in Step 2.)

Expose:
```javascript
function undo() {
  if (historyIdx.current <= 0) return;
  historyIdx.current--;
  const s = history.current[historyIdx.current];
  setCards(s.cards);
  setConnections(s.connections);
  // Best-effort: re-sync DB for changed cards is complex — for v1 we treat undo as local-only,
  // and the next mutation will overwrite DB. Acceptable trade-off for solo-user tool.
}
function redo() {
  if (historyIdx.current >= history.current.length - 1) return;
  historyIdx.current++;
  const s = history.current[historyIdx.current];
  setCards(s.cards);
  setConnections(s.connections);
}
```

Add to the return: `undo, redo,`.

- [ ] **Step 2: Wire keyboard shortcuts**

In `src/pages/CanvasView.jsx`, destructure `undo, redo` from `useCanvas`. Extend the keyboard useEffect:

```javascript
if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
```

Snapshot on drag end. Update each card's ctx:
```javascript
onMoveEnd: () => { /* future: trigger snapshot via callback exposed by useCanvas */ },
```

For simplicity in v1, also expose a `forceSnapshot()` from useCanvas and call it from `onMoveEnd`/`onResizeEnd`:

In `useCanvas.js` add:
```javascript
function forceSnapshot() { snapshot(); }
// add to return
```

In CanvasView card ctx:
```javascript
onMoveEnd: () => forceSnapshot(),
onResizeEnd: () => forceSnapshot(),
```

- [ ] **Step 3: Verify**

Add 3 cards, move one, delete one, press Ctrl+Z three times → state reverts. Press Ctrl+Y to redo.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCanvas.js src/pages/CanvasView.jsx
git commit -m "feat(canvas): local undo/redo with 50-step history"
```

---

### Task 8: Polish — Fit-on-Load + Thumbnail Stub

**Files:**
- Modify: `src/pages/CanvasView.jsx`
- Modify: `src/canvas/CanvasEngine.jsx` (no changes — for reference only)

- [ ] **Step 1: Fit-on-first-load when canvas has cards but pan/zoom defaults**

In `src/pages/CanvasView.jsx`, after `useCanvas` returns and after `loading` resolves, add:

```javascript
useEffect(() => {
  if (loading || !canvas || !cards.length) return;
  // Run only once per canvas: if pan is 0,0 and zoom is 1 (defaults), fit
  if (canvas.panX === 0 && canvas.panY === 0 && canvas.zoom === 1) {
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
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [loading, canvas?.id]);
```

- [ ] **Step 2: Generate canvas thumbnail on save**

For v1, store a tiny SVG snapshot of card positions as the thumbnail. In `useCanvas.js`, expose:

```javascript
function generateThumbnail() {
  if (!cards.length) return null;
  const xs = cards.map(c => c.x); const ys = cards.map(c => c.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const maxX = Math.max(...cards.map(c => c.x + c.w));
  const maxY = Math.max(...cards.map(c => c.y + 100));
  const W = maxX - minX, H = maxY - minY;
  const TW = 240, TH = 140;
  const sx = TW / W, sy = TH / H;
  const s  = Math.min(sx, sy);
  const rects = cards.map(c => {
    const x = (c.x - minX) * s; const y = (c.y - minY) * s;
    const w = c.w * s; const h = 80 * s;
    const fill = c.type === 'heading' ? '#1A1816'
              : c.type === 'image'    ? '#6B8FA8'
              : c.type === 'budget'   ? '#9A7310'
              : c.type === 'tasks'    ? '#6B5EA8'
              : c.type === 'todo'     ? '#6B5EA8'
              : c.type === 'board'    ? '#B04820'
              : c.type === 'link'     ? '#4A6A4A'
              : '#D4B870';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="0.7" rx="2"/>`;
  }).join('');
  const svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}"><rect width="100%" height="100%" fill="%23F4F1EB"/>${rects.replace(/#/g,'%23')}</svg>`;
  return svg;
}
```

Add `generateThumbnail` to the return value.

In CanvasView, periodically refresh thumbnail:

```javascript
useEffect(() => {
  if (!canvas || !cards.length) return;
  const t = setTimeout(() => {
    const thumb = generateThumbnail();
    if (thumb && thumb !== canvas.thumbnail) updateCanvas({ thumbnail: thumb });
  }, 2000);
  return () => clearTimeout(t);
}, [cards.length, canvas?.id]);
```

(Destructure `generateThumbnail` from useCanvas.)

- [ ] **Step 3: Show thumbnails in HomePage and ClientCanvasHub**

Modify HomePage thumbnail tile (Phase 3 Task 1) — replace the gradient placeholder div with:
```jsx
{cv.thumbnail
  ? <img src={cv.thumbnail} alt="" className="h-20 w-full object-cover" />
  : <div className="h-20 bg-gradient-to-br from-cream/10 to-paper/5 flex items-center justify-center text-ink/30"><FolderOpen size={22} /></div>}
```

Same change in `src/pages/ClientCanvasHub.jsx` for the canvas tiles (Phase 2 Task 6).

- [ ] **Step 4: Verify**

Open a canvas with some cards, wait 3s. Navigate back to `/` — the canvas tile shows the SVG thumbnail with colored rectangles matching card layout.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCanvas.js src/pages/CanvasView.jsx src/pages/HomePage.jsx src/pages/ClientCanvasHub.jsx
git commit -m "feat(canvas): fit-on-load + SVG thumbnail generation"
```

---

### Task 9: Final Smoke Test + README Update

**Files:**
- Modify: `studio-os/docs/canvas-quickstart.md`
- Modify: `studio-os/README.md` (if exists) or `CLAUDE.md`

- [ ] **Step 1: End-to-end smoke test**

In the preview:

1. Go to `/` — see new HomePage with greeting, modules, recent canvases (with thumbnails!), recent clients
2. Click "Nuovo Canvas" → studio canvas opens, clean palette, fit-on-load
3. Drop a Note + a Budget smart card → link a project
4. Update "Aggiorna pagato" with a value → verify CashflowPage `/cashflow` reflects new paid amount
5. Open AI panel, ask "3 nomi per una capsule invernale" — response appears, "+ Aggiungi al canvas" creates a note
6. Press Ctrl+Z to undo the note add
7. Click "Home" sidebar button → back to HomePage, the canvas tile now has a thumbnail
8. Go to `/clients/<id>` → ClientCanvasHub shows the canvas with thumbnail (if it's a client canvas)
9. Verify all old CRM pages work: `/cashflow`, `/calendario`, `/pricing`, `/send`

- [ ] **Step 2: Update quickstart doc**

In `studio-os/docs/canvas-quickstart.md`, replace the "Phase 2 / Phase 3" notes at the bottom with:

```markdown
## AI
Click **✨ MAT AI** bottom-right of the canvas:
- **Chat tab** — free conversation, "+ Aggiungi al canvas" turns answers into notes
- **Plugins tab** — render / copy / palette / naming with style selector

## Smart cards
- **Budget** — live budget for any project (totale, pagato, resto)
- **Tasks** — calendar tasks scoped by project or client
- **Files** — project file uploads
- **Project Overview** — stage / payment / link to full edit form

Smart-card edits flow back to the same Supabase tables CashflowPage / CalendarPage / Dashboard read.

## Keyboard
V (select) · H (pan) · C (connect) · Esc (clear) · Delete (remove) · Ctrl+Z / Ctrl+Y (undo/redo) · Ctrl+S — save (auto)
```

- [ ] **Step 3: Commit**

```bash
git add docs/canvas-quickstart.md
git commit -m "docs(canvas): updated quickstart with AI + smart cards"
```

---

## Phase 3 Completion Checklist

- [ ] HomePage replaces Dashboard, dark theme preserved, canvas-first layout
- [ ] "Canvas Studio" entry in sidebar opens new studio canvas
- [ ] Dashboard.jsx removed
- [ ] AI panel slides in from right; Chat works (with fallback if API offline)
- [ ] Plugins (render, copy, palette, naming) generate notes on canvas
- [ ] Undo/Redo with Ctrl+Z / Ctrl+Y
- [ ] Fit-on-load when opening a canvas with default viewport
- [ ] Canvas thumbnails generated and shown on HomePage + ClientCanvasHub
- [ ] All existing CRM pages still work
- [ ] No console errors

---

## Project Complete

After Phase 3, the canvas integration is done. The studio has:
- A canvas-first home, with dark CRM theme preserved
- Per-client canvas hubs replacing the old client detail page
- Multi-canvas per client with templates, smart cards, AI assist
- Backwards compatibility with all pre-existing CRM pages and integrations

If a canvas-related issue surfaces during use, check `docs/superpowers/specs/2026-04-16-canvas-integration-design.md` for design intent.
