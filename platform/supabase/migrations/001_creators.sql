-- PLATFORM LAYER: creators table — one row per creator/tenant
create extension if not exists "uuid-ossp";

create table public.creators (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  slug text unique not null, -- used as subdomain: slug.folio.app

  -- Identity
  display_name text not null default 'My Studio',
  logo_text text,
  bio text,
  tagline text,
  location text,

  -- Brand
  primary_color text default '#000000',
  accent_color text default '#000000',
  bg_color text default '#f9f9f7',
  text_color text default '#111111',

  -- Instagram
  instagram_handle text,
  instagram_token text, -- encrypted in production
  premade_hashtag text default '#premade',

  -- Stripe
  stripe_payment_link text,
  stripe_account_id text,

  -- Pricing
  premade_basic_price integer default 150,
  premade_premium_price integer default 250,
  archive_price integer default 50,
  archive_cutoff_date date default '2024-01-01',
  mat_price_single integer default 45,
  mat_price_custom integer default 60,
  mat_price_360 integer default 140,

  -- Copy
  premade_subtitle1 text default 'Pre-made clothing renders • Production ready files',
  premade_subtitle2 text default 'Fully alterable & customizable to your brand',

  -- Theme images (paths or URLs)
  image_hero_left text,
  image_hero_right text,
  image_logo text default '/logo.png',
  image_mat_render1 text,
  image_mat_render2 text,
  image_mat_render3 text,
  image_mat_render4 text,
  image_mat_render5 text,
  image_mat_render6 text,

  -- Status
  is_active boolean default true,
  is_onboarded boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.creators enable row level security;

create policy "Creators can read their own data"
  on public.creators for select
  using (auth.uid() = id);

create policy "Creators can update their own data"
  on public.creators for update
  using (auth.uid() = id);

-- Public read for site config (by slug)
create policy "Anyone can read creator config by slug"
  on public.creators for select
  using (is_active = true);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger creators_updated_at
  before update on public.creators
  for each row execute procedure public.handle_updated_at();
