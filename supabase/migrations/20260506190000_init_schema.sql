-- Wallis: Initial schema
-- Tables: words, profiles
-- Storage: avatars bucket
-- RLS: public read on words, owner-only write on profiles & words

create extension if not exists "uuid-ossp";

-------------------------------------------------------------------------------
-- profiles
-------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-------------------------------------------------------------------------------
-- words
-------------------------------------------------------------------------------

create table public.words (
  id uuid primary key default gen_random_uuid(),
  wort text not null,
  bedeutung text not null,
  added_by text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index words_created_at_idx on public.words (created_at desc);

alter table public.words enable row level security;

create policy "Words are publicly readable"
  on public.words for select using (true);

create policy "Authenticated users can insert words"
  on public.words for insert with check (auth.uid() is not null);

create policy "Authenticated users can update words"
  on public.words for update using (auth.uid() is not null);

create policy "Authenticated users can delete words"
  on public.words for delete using (auth.uid() is not null);

-------------------------------------------------------------------------------
-- Auto-update updated_at on both tables
-------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger words_set_updated_at
  before update on public.words
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-------------------------------------------------------------------------------
-- Storage: avatars bucket (public)
-------------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
