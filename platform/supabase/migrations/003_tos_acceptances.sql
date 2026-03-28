-- Acceptance log: tracks who accepted ToS, when, from what IP, and which version
-- Required for GDPR compliance and Italian Codice Civile Art. 1341-1342

create table public.tos_acceptances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  tos_version text not null default 'v1.0',
  accepted_tos boolean not null default false,
  accepted_liability_clause boolean not null default false, -- Art. 1341-1342 c.c.
  ip_address text,
  user_agent text,
  accepted_at timestamptz default now()
);

-- RLS: only service role can insert/read (server-side only)
alter table public.tos_acceptances enable row level security;

create policy "Service role only"
  on public.tos_acceptances
  using (false); -- no client access; only SUPABASE_SERVICE_KEY can write
