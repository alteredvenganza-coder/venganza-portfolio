-- When a user signs up, create their creator profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.creators (id, email, slug, display_name)
  values (
    new.id,
    new.email,
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '-', 'g')),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
