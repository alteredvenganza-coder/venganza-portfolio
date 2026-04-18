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

-- ── Canvas tables ─────────────────────────────────────────────

create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
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

-- ── Canvas snapshots (Phase 4 versioning) ─────────────────────

create table if not exists public.canvas_snapshots (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.canvases(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text,
  cards_data jsonb not null,
  connections_data jsonb not null,
  thumbnail text,
  kind text not null default 'manual', -- 'manual' | 'auto'
  created_at timestamptz default now()
);

create index if not exists canvas_snapshots_canvas_idx
  on public.canvas_snapshots(canvas_id, created_at desc);

alter table public.canvas_snapshots enable row level security;

create policy "canvas_snapshots_owner" on public.canvas_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
