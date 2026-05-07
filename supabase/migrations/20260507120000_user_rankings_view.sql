-- View: aggregated word counts per user for the leaderboard.
-- security_invoker so RLS of underlying tables (public read) applies.

create or replace view public.user_rankings
with (security_invoker = true)
as
select
  p.id,
  p.display_name,
  p.avatar_url,
  count(w.id)::int as word_count,
  max(w.created_at) as last_word_at
from public.profiles p
left join public.words w on w.user_id = p.id
group by p.id, p.display_name, p.avatar_url;

grant select on public.user_rankings to anon, authenticated;
