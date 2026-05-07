-- 1. Update handle_new_user: assign a random cat avatar from /public on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _avatars text[] := array['/katze1.jpg', '/katze2.jpg', '/katze3.jpg'];
  _avatar text;
begin
  _avatar := _avatars[1 + floor(random() * array_length(_avatars, 1))::int];

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    _avatar
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Sync words.added_by when profile display_name changes
create or replace function public.sync_words_added_by()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.display_name is distinct from OLD.display_name then
    update public.words
    set added_by = NEW.display_name
    where user_id = NEW.id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists profiles_sync_words on public.profiles;
create trigger profiles_sync_words
  after update of display_name on public.profiles
  for each row execute function public.sync_words_added_by();

-- 3. Backfill: existing profiles without avatar get a random cat
update public.profiles
set avatar_url = (
  array['/katze1.jpg', '/katze2.jpg', '/katze3.jpg']
)[1 + floor(random() * 3)::int]
where avatar_url is null;
