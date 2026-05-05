# Instagram Comment-to-DM — Phase 1: UI + DB + Deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `/instagram-triggers` admin page in studio-os to Vercel prod with full CRUD on triggers + credentials persistence in Supabase. No webhook, no Meta integration yet — that's Phase 2.

**Architecture:** Single `InstagramTriggersPage.jsx` with three local subcomponents (`SetupCard`, `TriggersSection`, `EventLog`). Persistence via existing `supabase` client through new helpers appended to `src/lib/db.js`. Three new tables (`ig_credentials`, `ig_triggers`, `ig_events`) added to `supabase/migration.sql` and applied via Supabase MCP. The "Test DM" button is rendered but disabled with a "Disponibile in Fase 2" hint.

**Tech Stack:** React 19, Tailwind CSS, lucide-react, Supabase, react-router-dom v7. No new runtime deps.

**Spec reference:** [`docs/superpowers/specs/2026-05-05-instagram-comment-to-dm-design.md`](../specs/2026-05-05-instagram-comment-to-dm-design.md) — see "Phase 1" section for scope contract.

**Note on TDD:** studio-os has no existing unit-test setup. Verification is manual via `npm run dev` (browser smoke) at the end of each UI task. Phase 4 of the canvas roadmap introduces Playwright; we don't bring that in here. This is an explicit deviation from the writing-plans skill's TDD default, justified by codebase convention (no existing tests on any page).

---

### Task 1: Database migration

**Files:**
- Modify: `supabase/migration.sql`

**Apply:** via `mcp__supabase__apply_migration` after editing the file.

- [ ] **Step 1: Append schema to `supabase/migration.sql`**

Append at the very end of the file:

```sql
-- ── Instagram comment-to-DM ──────────────────────────────────

create table if not exists public.ig_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ig_user_id text not null,
  page_access_token text not null,
  app_secret text not null,
  verify_token text not null,
  updated_at timestamptz default now()
);

alter table public.ig_credentials enable row level security;
create policy "ig_credentials_owner" on public.ig_credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.ig_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  source_type text not null check (source_type in ('any_post','any_story','specific_post','specific_story')),
  source_id text,
  keyword text not null,
  dm_text text not null,
  dm_link text not null,
  comment_reply_text text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists ig_triggers_active_idx
  on public.ig_triggers (user_id, active);

alter table public.ig_triggers enable row level security;
create policy "ig_triggers_owner" on public.ig_triggers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.ig_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trigger_id uuid references public.ig_triggers(id) on delete set null,
  source_kind text not null check (source_kind in ('comment','story_reply')),
  source_event_id text not null,
  source_media_id text,
  sender_igsid text not null,
  sender_username text,
  status text not null check (status in ('sent','failed','skipped_dup')),
  error text,
  comment_reply_status text check (comment_reply_status in ('sent','failed')),
  comment_reply_error text,
  created_at timestamptz default now()
);

create unique index if not exists ig_events_dedup_idx
  on public.ig_events (trigger_id, source_event_id)
  where status = 'sent';

alter table public.ig_events enable row level security;
create policy "ig_events_owner" on public.ig_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `mcp__supabase__apply_migration` with:
- `name`: `instagram_comment_to_dm_phase1`
- `query`: the exact SQL block from Step 1.

- [ ] **Step 3: Verify tables exist**

Call `mcp__supabase__list_tables` with `schemas: ["public"]`. Confirm `ig_credentials`, `ig_triggers`, `ig_events` are present, each with the columns from the SQL above and RLS enabled.

- [ ] **Step 4: Commit**

```bash
git add supabase/migration.sql
git commit -m "feat(ig): tables for credentials, triggers, events (Phase 1)"
```

---

### Task 2: DB helper functions

**Files:**
- Modify: `src/lib/db.js`

- [ ] **Step 1: Append helpers at the very end of `src/lib/db.js`**

```javascript
// ── Instagram comment-to-DM ─────────────────────────────────────────────────

function igCredentialsFromDb(row) {
  if (!row) return null;
  return {
    userId:          row.user_id,
    igUserId:        row.ig_user_id,
    pageAccessToken: row.page_access_token,
    appSecret:       row.app_secret,
    verifyToken:     row.verify_token,
    updatedAt:       row.updated_at,
  };
}

export async function fetchIgCredentials(userId) {
  const { data, error } = await supabase
    .from('ig_credentials')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return igCredentialsFromDb(data);
}

export async function upsertIgCredentials(userId, patch) {
  const row = {
    user_id:           userId,
    ig_user_id:        patch.igUserId        ?? '',
    page_access_token: patch.pageAccessToken ?? '',
    app_secret:        patch.appSecret       ?? '',
    verify_token:      patch.verifyToken     ?? '',
    updated_at:        new Date().toISOString(),
  };
  const { error } = await supabase
    .from('ig_credentials')
    .upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

function igTriggerFromDb(row) {
  return {
    id:               row.id,
    userId:           row.user_id,
    sourceType:       row.source_type,
    sourceId:         row.source_id,
    keyword:          row.keyword,
    dmText:           row.dm_text,
    dmLink:           row.dm_link,
    commentReplyText: row.comment_reply_text,
    active:           row.active,
    createdAt:        row.created_at,
  };
}

export async function fetchIgTriggers(userId) {
  const { data, error } = await supabase
    .from('ig_triggers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(igTriggerFromDb);
}

export async function insertIgTrigger(userId, patch) {
  const row = {
    user_id:            userId,
    source_type:        patch.sourceType,
    source_id:          patch.sourceId || null,
    keyword:            patch.keyword,
    dm_text:            patch.dmText,
    dm_link:            patch.dmLink,
    comment_reply_text: patch.commentReplyText || null,
    active:             patch.active ?? true,
  };
  const { data, error } = await supabase
    .from('ig_triggers')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return igTriggerFromDb(data);
}

export async function updateIgTrigger(id, patch) {
  const row = {};
  if (patch.sourceType        !== undefined) row.source_type        = patch.sourceType;
  if (patch.sourceId          !== undefined) row.source_id          = patch.sourceId || null;
  if (patch.keyword           !== undefined) row.keyword            = patch.keyword;
  if (patch.dmText            !== undefined) row.dm_text            = patch.dmText;
  if (patch.dmLink            !== undefined) row.dm_link            = patch.dmLink;
  if (patch.commentReplyText  !== undefined) row.comment_reply_text = patch.commentReplyText || null;
  if (patch.active            !== undefined) row.active             = patch.active;
  const { error } = await supabase
    .from('ig_triggers')
    .update(row)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteIgTrigger(id) {
  const { error } = await supabase.from('ig_triggers').delete().eq('id', id);
  if (error) throw error;
}

function igEventFromDb(row) {
  return {
    id:                  row.id,
    userId:              row.user_id,
    triggerId:           row.trigger_id,
    sourceKind:          row.source_kind,
    sourceEventId:       row.source_event_id,
    sourceMediaId:       row.source_media_id,
    senderIgsid:         row.sender_igsid,
    senderUsername:      row.sender_username,
    status:              row.status,
    error:               row.error,
    commentReplyStatus:  row.comment_reply_status,
    commentReplyError:   row.comment_reply_error,
    createdAt:           row.created_at,
  };
}

export async function fetchIgEvents(userId, { limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('ig_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(igEventFromDb);
}
```

- [ ] **Step 2: Verify file still parses**

Run:

```bash
npm run lint -- src/lib/db.js
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.js
git commit -m "feat(ig): db helpers — credentials, triggers, events"
```

---

### Task 3: Page skeleton + route + nav entry

Goal: page is reachable at `/instagram-triggers` with three placeholder cards. Wires plumbing only — no business logic yet.

**Files:**
- Create: `src/pages/InstagramTriggersPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Create `src/pages/InstagramTriggersPage.jsx` with skeleton**

```javascript
import { Instagram } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function InstagramTriggersPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <Instagram size={20} className="text-burgundy-muted shrink-0 mt-1" />
        <div>
          <h1 className="text-xl font-semibold text-ink">Comment-to-DM</h1>
          <p className="text-xs text-subtle mt-1">
            Quando qualcuno commenta una keyword su un post o risponde a una storia, mando in automatico un DM con il link e (opzionale) rispondo pubblicamente al commento.
          </p>
        </div>
      </header>

      <SetupCard userId={user?.id} />
      <TriggersSection userId={user?.id} />
      <EventLog userId={user?.id} />
    </div>
  );
}

function SetupCard({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Setup Meta</p>
      <p className="text-sm text-muted">Da implementare in Task 4.</p>
    </div>
  );
}

function TriggersSection({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Trigger</p>
      <p className="text-sm text-muted">Da implementare in Task 5.</p>
    </div>
  );
}

function EventLog({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Eventi recenti</p>
      <p className="text-sm text-muted">Da implementare in Task 6.</p>
    </div>
  );
}
```

- [ ] **Step 2: Register route in `src/App.jsx`**

In `src/App.jsx`, add the import near the other page imports:

```javascript
import InstagramTriggersPage from './pages/InstagramTriggersPage';
```

Inside `AdminContent`'s `<Routes>` block (after the `/inviti` route, before the catch-all `<Route path="*"`), add:

```javascript
<Route path="/instagram-triggers" element={<InstagramTriggersPage />} />
```

- [ ] **Step 3: Add nav entry in `src/components/Layout.jsx`**

In the import line for lucide icons, add `Instagram` to the existing destructured list:

```javascript
import { Search, LayoutDashboard, Users, TrendingUp, Wallet, X, Settings, FolderKanban, Send, CalendarDays, Gift, Menu, Instagram } from 'lucide-react';
```

In the `NAV` array (after `/inviti`), add:

```javascript
{ to: '/instagram-triggers', label: 'Instagram', icon: Instagram, adminOnly: true },
```

- [ ] **Step 4: Verify in browser**

Run:

```bash
npm run dev
```

Open `http://localhost:5173/instagram-triggers`. Expected:
- Page renders with header "Comment-to-DM" + subtitle
- Three placeholder cards each labelled (Setup Meta / Trigger / Eventi recenti) with "Da implementare" text
- Nav bar shows new "Instagram" entry (admin only); clicking it from elsewhere navigates here

Stop the dev server before next task.

- [ ] **Step 5: Commit**

```bash
git add src/pages/InstagramTriggersPage.jsx src/App.jsx src/components/Layout.jsx
git commit -m "feat(ig): page skeleton + route + nav entry"
```

---

### Task 4: Setup card — credentials form + persistence

Goal: filling the setup card and clicking "Salva" persists to `ig_credentials`. Reload preserves values. Disabled "Test DM" button visible.

**Files:**
- Modify: `src/pages/InstagramTriggersPage.jsx`

- [ ] **Step 1: Update imports at top of `InstagramTriggersPage.jsx`**

Replace the existing import block with:

```javascript
import { useState, useEffect } from 'react';
import { Instagram, Copy, Check } from 'lucide-react';
import Btn from '../components/Btn';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { fetchIgCredentials, upsertIgCredentials } from '../lib/db';
```

- [ ] **Step 2: Replace the placeholder `SetupCard` with the real one**

Replace the existing `function SetupCard({ userId }) { ... }` block with:

```javascript
function SetupCard({ userId }) {
  const [creds, setCreds] = useState({
    igUserId: '', pageAccessToken: '', appSecret: '', verifyToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchIgCredentials(userId)
      .then(c => {
        if (c) setCreds({
          igUserId:        c.igUserId        ?? '',
          pageAccessToken: c.pageAccessToken ?? '',
          appSecret:       c.appSecret       ?? '',
          verifyToken:     c.verifyToken     ?? '',
        });
      })
      .catch(err => console.error('[ig] fetch credentials failed', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/instagram-webhook`
    : '';

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertIgCredentials(userId, creds);
      setSavedAt(Date.now());
    } catch (e) {
      alert('Errore salvataggio: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="glass rounded-lg p-5">
        <p className="text-sm text-muted">Caricamento setup…</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-4">
      <div>
        <p className="label-meta mb-1">Setup Meta</p>
        <p className="text-[11px] text-subtle">
          Una volta sole. Trovi questi valori nella Meta Developer Console → la tua App → Instagram + Webhooks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="IG Business User ID">
          <input
            value={creds.igUserId}
            onChange={e => setCreds({ ...creds, igUserId: e.target.value })}
            placeholder="178…"
          />
        </Field>
        <Field label="Page Access Token (long-lived)">
          <input
            type="password"
            value={creds.pageAccessToken}
            onChange={e => setCreds({ ...creds, pageAccessToken: e.target.value })}
            placeholder="EAAB…"
            autoComplete="off"
          />
        </Field>
        <Field label="App Secret">
          <input
            type="password"
            value={creds.appSecret}
            onChange={e => setCreds({ ...creds, appSecret: e.target.value })}
            placeholder="abc123…"
            autoComplete="off"
          />
        </Field>
        <Field label="Verify Token (lo scegli tu)">
          <input
            value={creds.verifyToken}
            onChange={e => setCreds({ ...creds, verifyToken: e.target.value })}
            placeholder="vng-ig-2026"
          />
        </Field>
      </div>

      <Field label="Webhook URL — incolla in Meta → Webhooks → Callback URL">
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 font-mono text-xs"
            onClick={e => e.target.select()}
          />
          <button
            type="button"
            onClick={copyWebhook}
            className="px-3 py-1.5 rounded bg-white/8 text-muted hover:text-ink text-xs flex items-center gap-1 shrink-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copiato' : 'Copia'}
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio…' : 'Salva credenziali'}
        </Btn>
        {savedAt > 0 && Date.now() - savedAt < 3000 && (
          <span className="text-xs text-burgundy-muted">Salvato</span>
        )}

        <Btn variant="secondary" size="sm" disabled>
          Test DM
        </Btn>
        <span className="text-[10px] text-subtle">Disponibile dopo il setup webhook (Fase 2)</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, open `/instagram-triggers`. Fill all four fields with dummy values (e.g. `IG_USER_ID=test123`, `pageAccessToken=test`, `appSecret=test`, `verifyToken=vng-ig-test`), click **Salva credenziali**. Expected:
- "Salvato" badge appears for 3s
- Refresh page (Ctrl+R) → values come back exactly as saved
- Webhook URL line shows `http://localhost:5173/api/instagram-webhook` and clicking **Copia** flips to **Copiato** then back

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/InstagramTriggersPage.jsx
git commit -m "feat(ig): setup card with credentials persistence + webhook URL copy"
```

---

### Task 5: Triggers section — list, create form, edit, delete, toggle

Goal: full CRUD on `ig_triggers` from the page. New / Edit form is inline; list is a vertical stack of cards (responsive).

**Files:**
- Modify: `src/pages/InstagramTriggersPage.jsx`

- [ ] **Step 1: Extend imports**

In the existing import line for lucide, add `Plus, Trash2, Edit2, X`. In the existing import line for db helpers add the trigger helpers. Final lines should read:

```javascript
import { Instagram, Copy, Check, Plus, Trash2, Edit2, X } from 'lucide-react';
import { fetchIgCredentials, upsertIgCredentials, fetchIgTriggers, insertIgTrigger, updateIgTrigger, deleteIgTrigger } from '../lib/db';
```

- [ ] **Step 2: Replace the placeholder `TriggersSection` with the real implementation**

Replace the existing `function TriggersSection({ userId }) { ... }` block with:

```javascript
const SOURCE_LABELS = {
  any_post:       'Qualsiasi post',
  any_story:      'Qualsiasi storia',
  specific_post:  'Post specifico',
  specific_story: 'Storia specifica',
};

const EMPTY_DRAFT = {
  sourceType: 'any_post',
  sourceId: '',
  keyword: '',
  dmText: '',
  dmLink: '',
  commentReplyText: '',
  active: true,
};

function TriggersSection({ userId }) {
  const [triggers, setTriggers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);   // null | 'new' | trigger.id
  const [draft,    setDraft]    = useState(EMPTY_DRAFT);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchIgTriggers(userId)
      .then(setTriggers)
      .catch(err => console.error('[ig] fetch triggers failed', err))
      .finally(() => setLoading(false));
  }, [userId]);

  function startNew() {
    setDraft(EMPTY_DRAFT);
    setEditing('new');
  }

  function startEdit(t) {
    setDraft({
      sourceType:       t.sourceType,
      sourceId:         t.sourceId       ?? '',
      keyword:          t.keyword,
      dmText:           t.dmText,
      dmLink:           t.dmLink,
      commentReplyText: t.commentReplyText ?? '',
      active:           t.active,
    });
    setEditing(t.id);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  }

  async function handleSave() {
    if (!userId) return;
    if (!draft.keyword.trim() || !draft.dmText.trim() || !draft.dmLink.trim()) {
      alert('Keyword, testo DM e link sono obbligatori.');
      return;
    }
    if ((draft.sourceType === 'specific_post' || draft.sourceType === 'specific_story') && !draft.sourceId.trim()) {
      alert('Per "Post specifico" / "Storia specifica" devi indicare un ID o URL.');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await insertIgTrigger(userId, draft);
        setTriggers(prev => [created, ...prev]);
      } else {
        await updateIgTrigger(editing, draft);
        setTriggers(prev => prev.map(t => t.id === editing ? { ...t, ...draft, sourceId: draft.sourceId || null, commentReplyText: draft.commentReplyText || null } : t));
      }
      cancelEdit();
    } catch (e) {
      alert('Errore: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!confirm(`Eliminare il trigger "${t.keyword}"?`)) return;
    try {
      await deleteIgTrigger(t.id);
      setTriggers(prev => prev.filter(x => x.id !== t.id));
    } catch (e) {
      alert('Errore: ' + e.message);
    }
  }

  async function handleToggleActive(t) {
    const next = !t.active;
    setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, active: next } : x));
    try {
      await updateIgTrigger(t.id, { active: next });
    } catch (e) {
      // revert on error
      setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, active: t.active } : x));
      alert('Errore: ' + e.message);
    }
  }

  const isPostSource = draft.sourceType === 'any_post' || draft.sourceType === 'specific_post';
  const isSpecific   = draft.sourceType === 'specific_post' || draft.sourceType === 'specific_story';

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-meta mb-1">Trigger</p>
          <p className="text-[11px] text-subtle">
            Una keyword + una sorgente (post/storia) + un DM. Quando qualcuno commenta o risponde, parte tutto in automatico.
          </p>
        </div>
        {editing === null && (
          <Btn variant="primary" size="sm" onClick={startNew}>
            <Plus size={13} /> Nuovo trigger
          </Btn>
        )}
      </div>

      {editing !== null && (
        <div className="rounded-md border border-burgundy/30 bg-burgundy/8 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink">{editing === 'new' ? 'Nuovo trigger' : 'Modifica trigger'}</p>
            <button onClick={cancelEdit} className="text-subtle hover:text-ink">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Sorgente">
              <select
                value={draft.sourceType}
                onChange={e => setDraft({ ...draft, sourceType: e.target.value })}
              >
                <option value="any_post">{SOURCE_LABELS.any_post}</option>
                <option value="any_story">{SOURCE_LABELS.any_story}</option>
                <option value="specific_post">{SOURCE_LABELS.specific_post}</option>
                <option value="specific_story">{SOURCE_LABELS.specific_story}</option>
              </select>
            </Field>

            <Field label="Keyword (case-insensitive)">
              <input
                value={draft.keyword}
                onChange={e => setDraft({ ...draft, keyword: e.target.value })}
                placeholder="info"
              />
            </Field>

            {isSpecific && (
              <Field label="ID o URL del post/storia" className="sm:col-span-2">
                <input
                  value={draft.sourceId}
                  onChange={e => setDraft({ ...draft, sourceId: e.target.value })}
                  placeholder="https://www.instagram.com/p/… oppure 178…"
                />
              </Field>
            )}

            <Field label="Testo DM" className="sm:col-span-2">
              <textarea
                rows={3}
                maxLength={900}
                value={draft.dmText}
                onChange={e => setDraft({ ...draft, dmText: e.target.value })}
                placeholder="Ciao! Ecco il link che hai chiesto 👇"
                className="resize-none"
              />
            </Field>

            <Field label="Link nel DM" className="sm:col-span-2">
              <input
                type="url"
                value={draft.dmLink}
                onChange={e => setDraft({ ...draft, dmLink: e.target.value })}
                placeholder="https://altered.example/checkout"
              />
            </Field>

            {isPostSource && (
              <Field label="Risposta pubblica al commento (opzionale)" className="sm:col-span-2">
                <textarea
                  rows={2}
                  maxLength={250}
                  value={draft.commentReplyText}
                  onChange={e => setDraft({ ...draft, commentReplyText: e.target.value })}
                  placeholder="Ti ho mandato il link in DM 📩"
                  className="resize-none"
                />
              </Field>
            )}

            <Field label="Attivo" className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={e => setDraft({ ...draft, active: e.target.checked })}
                />
                Trigger attivo
              </label>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva trigger'}
            </Btn>
            <Btn variant="ghost" size="sm" onClick={cancelEdit}>Annulla</Btn>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">Caricamento trigger…</p>}

      {!loading && triggers.length === 0 && editing === null && (
        <p className="text-sm text-subtle py-6 text-center">
          Nessun trigger. Premi <strong>Nuovo trigger</strong> per crearne uno.
        </p>
      )}

      {!loading && triggers.length > 0 && (
        <div className="flex flex-col gap-2">
          {triggers.map(t => (
            <div key={t.id} className="rounded-md border border-white/10 bg-white/5 p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wide text-burgundy-muted font-mono">
                    {SOURCE_LABELS[t.sourceType]}
                  </span>
                  {t.sourceId && (
                    <span className="text-[10px] text-subtle font-mono truncate max-w-[180px]" title={t.sourceId}>
                      · {t.sourceId}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink mb-1">
                  Se commento contiene <code className="px-1 rounded bg-white/10 text-burgundy-muted">{t.keyword}</code>
                  {' '}→ DM con link
                </p>
                <p className="text-[11px] text-muted line-clamp-2">{t.dmText}</p>
                {t.commentReplyText && (
                  <p className="text-[11px] text-subtle italic mt-1">
                    Reply pubblico: "{t.commentReplyText}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <label className="inline-flex items-center gap-1 cursor-pointer mr-1" title={t.active ? 'Attivo' : 'Disattivato'}>
                  <input
                    type="checkbox"
                    checked={t.active}
                    onChange={() => handleToggleActive(t)}
                  />
                </label>
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 rounded text-muted hover:text-ink hover:bg-white/8"
                  title="Modifica"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="p-1.5 rounded text-muted hover:text-red-400 hover:bg-white/8"
                  title="Elimina"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, open `/instagram-triggers`.

- Click **Nuovo trigger** → form appears.
- Fill: Sorgente=`Qualsiasi post`, Keyword=`info`, DM text=`Ciao!`, Link=`https://example.com`, Reply=`Ti ho mandato il DM 📩`. Click **Salva trigger**.
- Trigger card appears in list.
- Click pencil icon on the card → form repopulates with the values.
- Change keyword to `prezzo` → save → list updates.
- Click checkbox → trigger toggles inactive (refresh page → still inactive).
- Click trash icon → confirm dialog → trigger removed.
- Change Sorgente to `Storia specifica` → "Risposta pubblica" field disappears (story types hide it).
- Change Sorgente to `Post specifico` → "ID o URL" field appears.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/InstagramTriggersPage.jsx
git commit -m "feat(ig): triggers CRUD — list, create, edit, delete, toggle"
```

---

### Task 6: Event log — empty state + auto-refresh

Goal: read-only list of last 50 events. Phase 1 will show only the empty state since no events fire yet (webhook is Phase 2). Auto-refresh every 30s so when Phase 2 lands the events show without code changes.

**Files:**
- Modify: `src/pages/InstagramTriggersPage.jsx`

- [ ] **Step 1: Extend imports**

In the existing lucide import line, add `CheckCircle2, XCircle, MinusCircle`. In the existing db import line, add `fetchIgEvents`. Final lines:

```javascript
import { Instagram, Copy, Check, Plus, Trash2, Edit2, X, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { fetchIgCredentials, upsertIgCredentials, fetchIgTriggers, insertIgTrigger, updateIgTrigger, deleteIgTrigger, fetchIgEvents } from '../lib/db';
```

- [ ] **Step 2: Replace the placeholder `EventLog` with the real implementation**

Replace the existing `function EventLog({ userId }) { ... }` block with:

```javascript
function eventTimeLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status, label }) {
  if (!status) return null;
  const map = {
    sent:        { Icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-950/30 border-green-500/20' },
    failed:      { Icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-950/30 border-red-500/20' },
    skipped_dup: { Icon: MinusCircle,  color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-500/20' },
  };
  const cfg = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${cfg.bg} ${cfg.color}`}>
      <cfg.Icon size={10} />
      {label}: {status}
    </span>
  );
}

function EventLog({ userId }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function refresh() {
      try {
        const list = await fetchIgEvents(userId, { limit: 50 });
        if (!cancelled) setEvents(list);
      } catch (e) {
        console.error('[ig] fetch events failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-3">
      <div>
        <p className="label-meta mb-1">Eventi recenti</p>
        <p className="text-[11px] text-subtle">
          Aggiornamento automatico ogni 30 s. Ultimi 50 eventi.
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Caricamento eventi…</p>}

      {!loading && events.length === 0 && (
        <p className="text-sm text-subtle py-6 text-center">
          Nessun evento ancora. Riceverai eventi qui dopo aver completato il setup Meta (Fase 2).
        </p>
      )}

      {!loading && events.length > 0 && (
        <div className="flex flex-col gap-1">
          {events.map(ev => {
            const isOpen = expanded === ev.id;
            return (
              <div
                key={ev.id}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 cursor-pointer hover:bg-white/8"
                onClick={() => setExpanded(isOpen ? null : ev.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-subtle">{eventTimeLabel(ev.createdAt)}</span>
                  <span className="text-[10px] uppercase tracking-wide text-burgundy-muted">
                    {ev.sourceKind === 'comment' ? 'commento' : 'story-reply'}
                  </span>
                  <span className="text-xs text-ink truncate max-w-[160px]" title={ev.senderUsername || ev.senderIgsid}>
                    @{ev.senderUsername || ev.senderIgsid}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <StatusBadge status={ev.status} label="DM" />
                    {ev.commentReplyStatus && <StatusBadge status={ev.commentReplyStatus} label="Reply" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-muted font-mono space-y-1">
                    <div>media: {ev.sourceMediaId ?? '—'}</div>
                    <div>event id: {ev.sourceEventId}</div>
                    {ev.error && <div className="text-red-400">DM error: {ev.error}</div>}
                    {ev.commentReplyError && <div className="text-red-400">Reply error: {ev.commentReplyError}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Open `/instagram-triggers`. Expected:
- "Eventi recenti" card shows the empty-state line.
- Browser DevTools Network tab: every 30s a request fires to `ig_events` (filter "ig_events" or watch the Supabase RPC).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/InstagramTriggersPage.jsx
git commit -m "feat(ig): event log with empty state + 30s auto-refresh"
```

---

### Task 7: Production build smoke

Goal: catch any prod-only build issue before pushing to Vercel.

**Files:** none (verification only).

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: build completes with no errors. Warnings about chunk size are OK.

- [ ] **Step 2: Preview**

```bash
npm run preview
```

Open the URL printed by Vite (usually `http://localhost:4173`). Navigate to `/instagram-triggers`. Confirm the page renders the same as it did under `npm run dev`.

Stop the preview server.

- [ ] **Step 3: No commit needed for this task** — it's a verification gate.

---

### Task 8: Push branch for Vercel preview deploy

Goal: produce a Vercel preview URL the user can open from any device, and confirm Phase 1 works in a prod-like env. The webhook URL shown in the admin SetupCard will resolve to the preview domain — exactly what's needed when Phase 2 starts.

**Files:** none.

- [ ] **Step 1: Push the branch**

```bash
git push origin claude/rebuild-venganza-homepage-1PN9U
```

Vercel auto-deploys preview on push (default project setting in studio-os).

- [ ] **Step 2: Retrieve preview URL**

Use the Vercel MCP to find the latest deployment for this branch:

```
mcp__c95b5437-2cf4-4b6c-9def-ca5621d13128__list_deployments
  → filter by branch "claude/rebuild-venganza-homepage-1PN9U"
  → take the newest one
  → grab its `url` (or `preview_url`)
```

If the MCP isn't reachable, fall back to: ask the user to open `https://vercel.com/<team>/<project>/deployments` and copy the URL of the latest deployment.

- [ ] **Step 3: Hand off to user with the preview URL**

Print, in a single short message to the user:

```
Phase 1 deployata su preview: <PREVIEW_URL>/instagram-triggers
Login con il tuo account, prova:
1) Setup card — incolla 4 valori finti (anche solo lettere) e clicca Salva
2) Nuovo trigger — sorgente "Qualsiasi post", keyword "info", testo DM e link finti
3) Toggle attivo, modifica, elimina
4) Eventi recenti — vedi empty state
5) Copia il Webhook URL — lo userai in Fase 2 per Meta Console

Quando hai validato la UX dimmi "ok phase 2" e parto col webhook + Meta.
```

- [ ] **Step 4: No commit** — branch is already pushed.

---

## Self-Review Notes

- **Spec coverage check (Phase 1 section of the design spec):**
  - Migration: all three tables → Task 1 ✓
  - `/instagram-triggers` page with three sections → Tasks 3+4+5+6 ✓
  - Setup card form → Task 4 ✓
  - Trigger CRUD → Task 5 ✓
  - Event log with empty state → Task 6 ✓
  - Nav entry → Task 3 ✓
  - Test DM disabled with "Fase 2" hint → Task 4 ✓
  - Webhook URL displayed live → Task 4 ✓
  - Deploy to Vercel prod → Task 8 (preview URL on the branch; merge to main happens after user validates)
- **Placeholder scan:** No TBDs. Each task has full code. Webhook URL is computed from `window.location.origin`, so the spec's "Vercel domain TBD" is already resolved at runtime.
- **Type consistency:**
  - Trigger object shape: `{ id, userId, sourceType, sourceId, keyword, dmText, dmLink, commentReplyText, active, createdAt }` — used identically in `igTriggerFromDb`, `insertIgTrigger`, `updateIgTrigger`, the page state, and the list rendering.
  - Credentials shape: `{ userId, igUserId, pageAccessToken, appSecret, verifyToken, updatedAt }` — consistent across helpers and the form.
  - Event status enum: `'sent'|'failed'|'skipped_dup'` for `status`, `'sent'|'failed'` for `commentReplyStatus`. `StatusBadge` handles both via the `map` lookup; missing `commentReplyStatus` is rendered as null (badge hidden), as designed.
- **Ambiguity check:**
  - Form validation in Task 5 explicitly rejects empty keyword/dmText/dmLink, and rejects empty `sourceId` only when source type is specific. Pinned via the `if (...) { alert(...); return; }` guard.
  - "Active toggle" both updates UI optimistically and reverts on DB error. Pinned in `handleToggleActive`.
  - Form-vs-list state machine: `editing` is `null | 'new' | <trigger.id>`. Three discrete states, exhaustively handled. No third "saving but not opened" state needed.
- **Open considerations (acceptable for Phase 1):**
  - The deploy step (Task 8) targets a preview URL on the feature branch, not main. The user explicitly wants to "see how it works" before committing — preview is the right surface. Merging to main happens after sign-off, before Phase 2 starts (or as part of Phase 2 final commit).
  - No password masking on `verifyToken` — it's not a real secret in Meta's threat model (any value the user picks; only used to verify webhook GET handshake). Decision pinned.
  - No i18n keys: page copy is Italian-first to match the rest of studio-os admin pages (CashflowPage, AdminInvitesPage). EN translation deferred.
