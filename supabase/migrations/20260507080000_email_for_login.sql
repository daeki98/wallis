-- Lookup function: lets users login with their display_name OR email.
-- security definer because it needs to read auth.users which is otherwise locked down.
-- Returns null if no match, the matched email otherwise.

create or replace function public.email_for_login(_input text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  _email text;
begin
  if _input is null or _input = '' then
    return null;
  end if;

  -- Already an email? Return as-is (caller will validate via signInWithPassword)
  if _input like '%@%' then
    return _input;
  end if;

  -- Otherwise lookup by display_name (case-insensitive)
  select u.email into _email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.display_name) = lower(_input)
  limit 1;

  return _email;
end;
$$;

grant execute on function public.email_for_login(text) to anon, authenticated;
