-- Run this in Supabase → SQL Editor

create table if not exists public.custom_dimensions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  label      text        not null,
  "group"    text,
  width      integer     not null,
  height     integer     not null,
  created_at timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists custom_dimensions_user_idx
  on public.custom_dimensions (user_id);

-- RLS: users can only access their own rows
alter table public.custom_dimensions enable row level security;

create policy "Users can view own custom dimensions"
  on public.custom_dimensions for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom dimensions"
  on public.custom_dimensions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own custom dimensions"
  on public.custom_dimensions for delete
  using (auth.uid() = user_id);
