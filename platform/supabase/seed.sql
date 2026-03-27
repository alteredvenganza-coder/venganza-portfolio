-- Dev seed: one example creator
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  'a0000000-0000-0000-0000-000000000001',
  'demo@alteredvenganza.com',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now()
) on conflict do nothing;

insert into public.creators (
  id, email, slug, display_name, bio, tagline, location,
  primary_color, bg_color,
  instagram_handle, premade_hashtag,
  premade_basic_price, is_onboarded
) values (
  'a0000000-0000-0000-0000-000000000001',
  'demo@alteredvenganza.com',
  'alteredvenganza',
  'Altered Venganza',
  'Multi-disciplinary studio made for brands that builds.',
  'Premium branding • Custom designs • Pre-mades & softwares for fashion designers and creatives',
  'Trieste, Italy / by Rare Martinez',
  '#7b1f24', '#f5f0eb',
  'alteredvenganza', '#premade',
  200, true
) on conflict do nothing;
