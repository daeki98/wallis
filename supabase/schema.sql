-- Wallis: Walliserwörter Schema
-- Run this once in Supabase SQL Editor

create extension if not exists "uuid-ossp";

create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  wort text not null,
  hochdeutsch text not null,
  beispielsatz text,
  region text,
  added_by text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists words_created_at_idx on public.words (created_at desc);
create index if not exists words_wort_idx on public.words using gin (to_tsvector('simple', wort));

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists words_set_updated_at on public.words;
create trigger words_set_updated_at
  before update on public.words
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.words enable row level security;

drop policy if exists "Anyone can read words" on public.words;
create policy "Anyone can read words" on public.words
  for select using (true);

drop policy if exists "Authenticated users can insert" on public.words;
create policy "Authenticated users can insert" on public.words
  for insert with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update own words" on public.words;
create policy "Authenticated users can update own words" on public.words
  for update using (auth.uid() is not null);

drop policy if exists "Authenticated users can delete own words" on public.words;
create policy "Authenticated users can delete own words" on public.words
  for delete using (auth.uid() is not null);
