-- Update trigger: 6 Katzen aus /katzen/ Ordner

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _avatars text[] := array[
    '/katzen/katze1.jpg',
    '/katzen/katze2.jpg',
    '/katzen/katze3.jpg',
    '/katzen/katze4.jpg',
    '/katzen/katze5.jpg',
    '/katzen/katze6.jpg'
  ];
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

-- Migrate existing avatar paths /katzeN.jpg → /katzen/katzeN.jpg
update public.profiles
set avatar_url = '/katzen/' || substring(avatar_url from '/(katze[0-9]+\.jpg)$')
where avatar_url ~ '^/katze[0-9]+\.jpg$';
