# Instagram Comment-to-DM — Design

**Date:** 2026-05-05
**Status:** Approved (verbal); pending written sign-off
**Owner:** alteredvenganza
**Target:** Working end-to-end in studio-os within 2 hours

## Goal

Internal "comment-to-sell" tool, ManyChat-style but minimal: when someone comments a configured **keyword** on a post/reel or replies to a story with the keyword, the system:

1. **Sends them an automatic DM** with a fixed text + link, AND
2. **(For comment triggers only) Publicly replies to their comment** with a fixed text the owner chooses (e.g. "Ti ho mandato il link in DM 📩").

Both replies are single-shot — no buttons, no branching, no multi-turn. The public reply is **per-trigger optional**; if the field is empty, only the DM is sent.

Owner uses it from studio-os admin (single user). Not a multi-tenant SaaS.

## Scope

### In

- Webhook receiver (Vercel function) for Instagram comments + story replies
- Keyword matcher (case-insensitive substring) scoped to a source filter
- Auto-DM sender via Instagram Graph API (`/me/messages`)
- **Auto public-reply** on the matched comment via `POST /<ig_comment_id>/replies`, when the trigger has a non-empty `comment_reply_text`. Comment-triggers only (story replies have no public-reply surface)
- Admin UI in studio-os: setup credentials, manage triggers, view recent events, test DM
- Persistence: triggers, credentials, event log
- Basic deduplication (same `comment_id` + `sender_igsid` won't fire twice)

### Out (explicit cuts to fit 2-hour budget)

- Buttons or quick replies in the DM
- Multi-step / branching flows
- Auto-rotation across "last N stories" (replaced by simpler `any_story` source type)
- Token auto-refresh (Page access token is long-lived 60 days; manual refresh later)
- Multi-account / multi-tenant
- Analytics dashboard (just an event log table)
- Variable substitution in DM text (no `{{name}}` placeholders)
- Rate limiting beyond what Meta enforces

## Architecture

```
Instagram (comment / story reply)
        │
        ▼
Meta webhook  ──▶  Vercel function  /api/instagram-webhook
                          │
                          ├─ verify X-Hub-Signature-256 with IG_APP_SECRET
                          ├─ parse event → comment_event | story_reply_event
                          ├─ load active triggers from Supabase (service role)
                          ├─ match: source_type + source_id + keyword
                          ├─ dedup check against ig_events
                          ├─ POST /me/messages with PAGE_ACCESS_TOKEN
                          └─ insert ig_events row (status=sent|failed|skipped_dup)

studio-os admin (/instagram-triggers)
        │
        ├─ Setup card  ──▶ upsert ig_credentials
        ├─ Trigger CRUD ─▶ ig_triggers
        ├─ Event log    ◀─ ig_events (last 50)
        └─ Test DM      ──▶ /api/instagram-test-dm  → graph send to a chosen IGSID
```

## Components

### 1. Webhook function — `api/instagram-webhook.js`

**GET handler** — Meta verification challenge:
- Read `hub.mode`, `hub.verify_token`, `hub.challenge` from query
- If `mode === 'subscribe'` and `verify_token` matches the stored value → return `challenge` as text
- Else → 403

**POST handler** — event delivery:
1. Read raw body (needed for signature)
2. Verify `X-Hub-Signature-256` = `sha256=<hmac(rawBody, IG_APP_SECRET)>`. Mismatch → 403, log nothing.
3. Parse JSON. Iterate `body.entry[]`:
   - For each `entry.changes[]` with `field === 'comments'` → handle as comment event:
     - Extract: `media_id`, `comment_id`, `text`, `from.id` (commenter IGSID), `from.username`
   - For each `entry.messaging[]` with a story reply attachment → handle as story-reply event:
     - Story replies arrive as standard `message` events with `message.reply_to.story.id` set (Graph API v21 contract)
     - Extract: `sender.id` (IGSID), `recipient.id` (your IG id), `message.text`, `message.reply_to.story.id`
4. For each parsed event, call `processEvent(event)`.
5. Respond `200 OK` regardless (Meta retries on non-2xx).

**`processEvent(event)`:**
1. Look up active triggers for the configured owner.
2. Filter triggers by source match:
   - `any_post` — matches any comment event
   - `any_story` — matches any story-reply event
   - `specific_post` — `trigger.source_id === event.media_id`
   - `specific_story` — `trigger.source_id === event.story_id`
3. Of remaining, find first whose `keyword.toLowerCase()` is contained in `event.text.toLowerCase()`.
4. If none match → drop silently (no event row).
5. If match found:
   - Check `ig_events` for an existing row with same `(trigger_id, source_event_id)` → if found, insert `status='skipped_dup'` row and exit.
   - **(Comment events only)** If `trigger.comment_reply_text` is non-empty, `POST https://graph.facebook.com/v21.0/<comment_id>/replies?access_token=...` with body `{ message: trigger.comment_reply_text }`. Capture result into `comment_reply_status` (`sent`/`failed`) + `comment_reply_error`. **Do not abort on failure** — still try the DM next.
   - Build DM body: `${trigger.dm_text}\n\n${trigger.dm_link}` (link kept on its own line so Instagram auto-previews it).
   - `POST https://graph.facebook.com/v21.0/me/messages?access_token=...` with body `{ recipient: { id: sender_igsid }, message: { text } }`.
   - On DM 2xx → insert `ig_events` row `status='sent'` (with the captured `comment_reply_status`).
   - On DM error → insert `status='failed'` with the error message + http status (still keep the `comment_reply_status` if the public reply did succeed).

### 2. Test-DM function — `api/instagram-test-dm.js`

Authenticated POST endpoint (verify Supabase JWT in `Authorization` header). Body: `{ recipient_igsid, text, link }`. Sends a one-off DM using the stored `PAGE_ACCESS_TOKEN`. Used by the admin "Test DM" button to confirm token + permissions before going live.

### 3. Admin page — `src/pages/InstagramTriggersPage.jsx` at route `/instagram-triggers`

Three sections, top to bottom:

**Setup card** — single form (collapsible after first save):
- IG Business User ID (string)
- Page Access Token (long-lived, password input)
- App Secret (password input)
- Verify Token (string, default `vng-ig-${random}` on first load)
- Webhook URL (read-only; computed from `window.location.origin` + `/api/instagram-webhook` + a copy-to-clipboard button)
- Save button → upsert into `ig_credentials`
- Below the card: a small "Test DM" mini-form — paste a recipient IGSID + click → calls `/api/instagram-test-dm`, shows green/red result inline.

**Triggers list** — table with [Source, Keyword, DM preview, Reply preview, Active toggle, Edit, Delete]. "Nuovo trigger" button opens an inline form:
- Source type: select with 4 options (`any_post`, `any_story`, `specific_post`, `specific_story`)
- Source ID: text input, shown only when type is `specific_*`. Helper text: "Incolla l'URL del post / storia o solo l'ID."
- Keyword: text input
- DM text: textarea (max 900 chars, IG limit is 1000)
- DM link: URL input
- **Risposta pubblica al commento (opzionale)**: textarea (max 250 chars, IG comment limit is 300). Shown only when source type is `any_post` or `specific_post` (story types hide this field). Helper text: "Lascia vuoto per non rispondere pubblicamente. Es: 'Ti ho mandato il link in DM 📩'"
- Active: checkbox, default true
- Save / Annulla

**Event log** — read-only list of last 50 `ig_events` rows: timestamp, source media id, sender username, **two status badges (DM + Reply)**, link to expand and see error if failed. Auto-refresh every 30 s.

### 4. Database — extend `supabase/migration.sql`

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
  source_id text,                       -- post/reel/story id; null for any_*
  keyword text not null,
  dm_text text not null,
  dm_link text not null,
  comment_reply_text text,              -- public reply on the comment thread; null = skip public reply
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists ig_triggers_active_idx on public.ig_triggers (user_id, active);

alter table public.ig_triggers enable row level security;
create policy "ig_triggers_owner" on public.ig_triggers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.ig_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trigger_id uuid references public.ig_triggers(id) on delete set null,
  source_kind text not null check (source_kind in ('comment','story_reply')),
  source_event_id text not null,        -- comment_id or message_id (used for dedup)
  source_media_id text,                  -- post or story id
  sender_igsid text not null,
  sender_username text,
  status text not null check (status in ('sent','failed','skipped_dup')),
  error text,
  comment_reply_status text check (comment_reply_status in ('sent','failed')),  -- null = not attempted
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

The unique partial index on `(trigger_id, source_event_id) WHERE status='sent'` enforces dedup at DB level — even if two webhook deliveries race, only one row with `status='sent'` survives.

### 5. Server-side credential access

The webhook function has no Supabase JWT — it must use the **service role key** (env var `SUPABASE_SERVICE_ROLE_KEY`, already present per existing functions like `cron-reminders.js`). It bypasses RLS to read `ig_credentials` for the single owner row. Looking up "the owner" for v1: the webhook reads the **single row** in `ig_credentials` (single-user assumption). When multi-user is needed later, route by `ig_user_id` from the webhook payload.

`IG_APP_SECRET` for signature verification is read from the DB (`ig_credentials.app_secret`) on each request — small extra DB hit, but avoids a second source of truth and makes the admin UI self-sufficient (no Vercel env redeploy to change credentials).

## Data Flow Examples

**Comment trigger (with public reply):**
1. User comments "INFO" on your reel.
2. Meta POSTs `{ entry: [{ id: 'IG_USER_ID', changes: [{ field: 'comments', value: { id: 'COMMENT_ID', media: { id: 'MEDIA_ID' }, from: { id: 'IGSID', username: 'marco' }, text: 'INFO' } }] }] }`.
3. Webhook verifies signature, finds matching trigger (`any_post` + keyword `info`, with `comment_reply_text` = "Ti ho mandato il link in DM 📩"), checks no existing `sent` event for this comment.
4. `POST /COMMENT_ID/replies` → public reply appears under marco's comment within seconds.
5. `POST /me/messages` → DM lands in marco's inbox.
6. Logs event with both `status='sent'` and `comment_reply_status='sent'`.

**Story-reply trigger:**
1. Someone replies to your story with "PREZZO".
2. Meta POSTs `{ entry: [{ id: '...', messaging: [{ sender: { id: 'IGSID' }, recipient: { id: 'YOUR_IG_ID' }, message: { text: 'PREZZO', reply_to: { story: { id: 'STORY_ID' } } } }] }] }`.
3. Same matcher path. Sends DM. Logs event.

## Security

- **Signature verification** is mandatory before processing any webhook payload.
- **Tokens at rest:** stored in Supabase as plaintext, but only the service role can read them and the column is never exposed to the client (admin UI re-reads through an RLS-protected select that returns the values to the owner only — this is acceptable for an internal single-user tool; a future hardening step is `pgcrypto` AES at rest or pushing tokens to Vercel env).
- **Test-DM endpoint** requires a valid Supabase user JWT and only sends with the credentials owned by that user.
- **No PII in logs** beyond IGSID + username, which Instagram already exposes publicly via the comment.

## Setup checklist (Meta side, ~5 min)

The user does this once before code can fire end-to-end:
1. Meta Developer Console → App → Products → add **Instagram**, **Webhooks**.
2. Webhooks → Instagram → Callback URL = `https://<studio-os-prod>.vercel.app/api/instagram-webhook`, Verify Token = same string saved in admin UI.
3. Subscribe to fields: `comments`, `messages`, `messaging_postbacks`. Required permissions on the access token: `instagram_basic`, `instagram_manage_messages` (DM send), `instagram_manage_comments` (read + public reply), `pages_show_list`, `pages_read_engagement`.
4. App roles → ensure your IG account is added as **Tester** or **Admin** (no app review needed for owner usage).
5. Generate a **Page Access Token** for the FB Page connected to your IG Business account, exchange for **long-lived** (60 days) via `/oauth/access_token?grant_type=fb_exchange_token`.
6. Get the **IG Business User ID** via `GET /me/accounts?fields=instagram_business_account&access_token=<page_token>`.
7. Subscribe the page to webhooks: `POST /<IG_USER_ID>/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=<page_token>`.

These steps are referenced in the implementation plan but not coded — they're manual UI steps in the Meta Console.

## Open assumptions

- **Studio-os Vercel domain** — not in the spec yet. Will be filled in when implementation starts (likely `studio-os-<id>.vercel.app` or a custom domain). The webhook URL shown in the admin UI is computed from `window.location.origin`, so this isn't hard-coded.
- **Owner identity in webhook** — single-user assumption: webhook picks the only row in `ig_credentials`. If a second user appears, refactor to look up by `entry.id` (= `IG_USER_ID`) against `ig_credentials.ig_user_id`.
- **Story-reply payload shape** — Meta v21 documents `message.reply_to.story` for story replies. If the live payload differs (some accounts get `attachments[].type='story_mention'` instead), the parser will be hardened during testing; the matcher logic stays unchanged.

## Self-Review Notes

- **Placeholder scan:** No TBDs in normative sections. The Vercel domain is flagged as an open assumption (resolved at implementation time, not blocking).
- **Internal consistency:** `ig_credentials` is single-row; the webhook explicitly assumes single-user. Multi-user path is documented as a refactor target. No contradictions.
- **Scope check:** ~10 implementation tasks (migration, webhook, test-DM, admin page sections, db helpers). Fits one plan.
- **Ambiguity check:**
  - "Match" = case-insensitive substring (`event.text.toLowerCase().includes(trigger.keyword.toLowerCase())`). Pinned in the matcher description.
  - "Source ID" for `specific_post` accepts either Instagram media URL or raw ID — the admin form normalizes via a small helper (`extractIgMediaId(input)`).
  - Dedup is enforced at DB level via a partial unique index, not just an app check.
  - DM body shape (`text\n\nlink` so Instagram unfurls the link) is pinned.
  - Public-reply field is **per-trigger optional, comment-only**. Empty string = treat as null (no reply). Story-reply triggers ignore the field entirely. Pinned in matcher and admin UI sections.
  - Reply-then-DM order is pinned. A reply failure does not abort the DM (the DM is the more important payload — the link).
- **Risks called out:**
  - 60-day Page token expiry — admin UI shows `updated_at`; user re-pastes token before day 60.
  - Webhook 7-day messaging window — comment events trigger fresh windows automatically; story replies too. Edge case: if a user comments and we DM 8 days later (e.g., outage), Meta refuses. Acceptable for v1.
  - Meta dev-mode app — only Testers/Admins of the app can comment-trigger DMs. For public usage, app review is required (deferred).
