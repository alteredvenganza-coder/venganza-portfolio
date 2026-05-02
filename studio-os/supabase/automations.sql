-- ============================================================
-- Venganza OS — Comment-to-sell automations
-- Esegui questo nel SQL Editor di Supabase dopo migration.sql
-- ============================================================

create extension if not exists pgcrypto;

-- ── Trigger / status enums ───────────────────────────────────
do $$ begin
  create type trigger_type as enum ('comment', 'story_reply');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dm_status as enum ('pending', 'sent', 'failed', 'skipped');
exception when duplicate_object then null; end $$;

-- ── IG accounts ──────────────────────────────────────────────
create table if not exists public.ig_accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  label         text not null,
  ig_user_id    text not null,
  page_id       text not null,
  access_token  text not null,
  created_at    timestamptz not null default now(),
  unique (user_id, ig_user_id)
);

alter table public.ig_accounts enable row level security;

do $$ begin
  create policy "Owner full access — ig_accounts"
    on public.ig_accounts for all
    using  (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── Automation rules ─────────────────────────────────────────
create table if not exists public.automation_rules (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  ig_account_id   uuid references public.ig_accounts(id) on delete cascade not null,
  name            text not null,
  trigger         trigger_type not null,
  post_id         text,
  keywords        text[] not null default '{}',
  match_mode      text not null default 'any', -- 'any' | 'exact'
  reply_comment   text,
  dm_text         text not null,
  dm_link         text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.automation_rules enable row level security;

do $$ begin
  create policy "Owner full access — automation_rules"
    on public.automation_rules for all
    using  (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── DM queue ─────────────────────────────────────────────────
create table if not exists public.dm_queue (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  rule_id         uuid references public.automation_rules(id) on delete set null,
  ig_account_id   uuid references public.ig_accounts(id) on delete cascade not null,
  recipient_id    text not null,
  trigger         trigger_type not null,
  source_id       text,
  payload         jsonb,
  status          dm_status not null default 'pending',
  attempts        int not null default 0,
  error           text,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);

alter table public.dm_queue enable row level security;

do $$ begin
  create policy "Owner read — dm_queue"
    on public.dm_queue for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── Logs ─────────────────────────────────────────────────────
create table if not exists public.automation_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  rule_id         uuid,
  ig_account_id   uuid,
  event_type      text not null,
  trigger         trigger_type,
  source_id       text,
  payload         jsonb,
  message         text,
  created_at      timestamptz not null default now()
);

alter table public.automation_logs enable row level security;

do $$ begin
  create policy "Owner read — automation_logs"
    on public.automation_logs for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_rules_account_active on public.automation_rules(ig_account_id, active);
create index if not exists idx_queue_status         on public.dm_queue(status, created_at);
create index if not exists idx_logs_user_created    on public.automation_logs(user_id, created_at desc);
