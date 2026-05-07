-- Tighten word write policies: only the owner can update/delete their words.
-- Insert stays open to all authenticated users (for own words via auth.uid()).

drop policy if exists "Authenticated users can update words" on public.words;
create policy "Users can update own words"
  on public.words for update using (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete words" on public.words;
create policy "Users can delete own words"
  on public.words for delete using (auth.uid() = user_id);

-- Tighten insert as well: ensure user_id matches the inserter (no spoofing)
drop policy if exists "Authenticated users can insert words" on public.words;
create policy "Users can insert their own words"
  on public.words for insert with check (auth.uid() = user_id);
