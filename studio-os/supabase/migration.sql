-- ============================================================
-- Venganza OS — Supabase migration
-- Esegui questo script nel SQL Editor del tuo progetto Supabase
-- ============================================================

-- ── Clients ──────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  brand       text,
  email       text,
  phone       text,
  language    text,
  notes       text,
  created_at  timestamptz default now()
);

alter table public.clients enable row level security;

create policy "Owner full access — clients"
  on public.clients for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Projects ─────────────────────────────────────────────────
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  client_id       uuid references public.clients(id) on delete set null,
  title           text not null,
  description     text,
  type            text check (type in ('fashion','branding','edilizia','other')),
  stage           text check (stage in ('lead','onboarding','in_progress','waiting','review','completed')) default 'lead',
  is_paused       boolean default false,
  paused_reason   text,
  deadline        date,
  price           numeric,
  payment_status  text check (payment_status in ('unpaid','deposit','paid')) default 'unpaid',
  next_action     text,
  missing_info    text,
  tasks           jsonb default '[]',
  created_at      timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Owner full access — projects"
  on public.projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
