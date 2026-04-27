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
  files           jsonb default '[]',
  brief           jsonb default '{}',
  created_at      timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Owner full access — projects"
  on public.projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Aggiungi colonne se la tabella esiste già ─────────────────
alter table public.projects
  add column if not exists files         jsonb   default '[]',
  add column if not exists brief         jsonb   default '{}',
  add column if not exists paid_amount   numeric,
  add column if not exists contract_sent boolean default false,
  add column if not exists retainer_fee  numeric,
  add column if not exists sales_count   integer,
  add column if not exists cover_image   text;

-- Aggiorna check constraint tipo per includere retainer
alter table public.projects drop constraint if exists projects_type_check;
alter table public.projects
  add constraint projects_type_check
  check (type in ('fashion','branding','edilizia','app','premade','retainer','other'));

-- ── Storage bucket per immagini di progetto ───────────────────
insert into storage.buckets (id, name, public)
  values ('project-files', 'project-files', true)
  on conflict (id) do nothing;

create policy "Auth upload project-files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files');

create policy "Public read project-files"
  on storage.objects for select
  using (bucket_id = 'project-files');

create policy "Auth delete project-files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-files');

-- ============================================================
-- ── Site (Altered Venganza website) ─────────────────────────
-- Public-readable theme + premades managed from Venganza OS
-- ============================================================

create table if not exists public.site_settings (
  id                       int primary key default 1,
  hero_image               text,
  case_study_maali_image   text,
  case_study_04_image      text,
  data                     jsonb default '{}',
  updated_at               timestamptz default now(),
  constraint site_settings_singleton check (id = 1)
);

alter table public.site_settings enable row level security;

create policy "Public read site_settings"
  on public.site_settings for select
  using (true);

create policy "Auth write site_settings"
  on public.site_settings for all
  to authenticated
  using (true) with check (true);

-- Seed singleton row
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ── Site Premades ────────────────────────────────────────────

create table if not exists public.site_premades (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique,
  title        text not null,
  description  text,
  image        text,
  price        numeric,
  status       text check (status in ('draft','published')) default 'draft',
  position     int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.site_premades enable row level security;

create policy "Public read published premades"
  on public.site_premades for select
  using (status = 'published');

create policy "Auth read all premades"
  on public.site_premades for select
  to authenticated using (true);

create policy "Auth write premades"
  on public.site_premades for all
  to authenticated
  using (true) with check (true);

-- ── Site assets storage (public images for the website) ──────

insert into storage.buckets (id, name, public)
  values ('site-assets', 'site-assets', true)
  on conflict (id) do nothing;

create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Auth upload site-assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-assets');

create policy "Auth delete site-assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-assets');

-- ── Push Subscriptions ────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  endpoint     text not null,
  subscription jsonb not null,
  created_at   timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Owner push subs"
  on public.push_subscriptions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Aggiorna stage per includere delivered e archived ─────────
alter table public.projects drop constraint if exists projects_stage_check;
alter table public.projects
  add constraint projects_stage_check
  check (stage in ('lead','onboarding','in_progress','waiting','review','completed','delivered','archived'));

-- ── Deliveries (link pubblici di consegna file) ───────────────
create table if not exists public.deliveries (
  token       text primary key default replace(gen_random_uuid()::text, '-', ''),
  project_id  uuid references public.projects(id) on delete cascade,
  title       text not null,
  files       jsonb not null default '[]',
  message     text,
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);

alter table public.deliveries enable row level security;

-- Chiunque può leggere una delivery (il cliente non è autenticato)
create policy "Public read deliveries"
  on public.deliveries for select
  using (true);

-- Solo utenti autenticati possono creare delivery
create policy "Auth insert deliveries"
  on public.deliveries for insert to authenticated
  with check (true);

-- ── Aggiungi colonna bg_images a deliveries ───────────────────
alter table public.deliveries
  add column if not exists bg_images jsonb default '[]';

-- ── Smart Pricing Memory: data completamento progetto ────────
alter table public.projects
  add column if not exists completed_at timestamptz;

-- ── Activity log per progetto ────────────────────────────────
alter table public.projects
  add column if not exists activity jsonb default '[]';

-- ── Cashflow: entrate e uscite (business + personali) ─────────
create table if not exists public.cashflow_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('entrata', 'uscita')),
  amount       numeric(12,2) not null check (amount > 0),
  category     text,
  description  text,
  date         date not null default current_date,
  source       text not null default 'manual' check (source in ('manual', 'revolut', 'stripe')),
  revolut_id   text,
  created_at   timestamptz not null default now()
);

alter table public.cashflow_entries enable row level security;

create policy "Owner cashflow"
  on public.cashflow_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indice unico per evitare duplicati dal sync Revolut
create unique index if not exists cashflow_revolut_id_idx
  on public.cashflow_entries (revolut_id)
  where revolut_id is not null;

-- ── Calendar Tasks ──────────────────────────────────────────
create table if not exists public.calendar_tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  title             text not null,
  description       text,
  date              date not null,
  time_start        text,   -- "09:00" format, nullable for all-day tasks
  time_end          text,   -- "10:30" format
  color             text default 'burgundy',
  is_done           boolean default false,
  reminder_minutes  integer,
  created_at        timestamptz default now()
);

alter table public.calendar_tasks enable row level security;

create policy "Owner calendar tasks"
  on public.calendar_tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Calendar Tasks: client/project association ──────────────
alter table public.calendar_tasks
  add column if not exists client_id  uuid references public.clients(id)  on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null;
