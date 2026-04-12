-- Run this in Supabase → SQL Editor
-- Replaces the 003 custom_dimensions table (wrong column names) and adds saved_campaigns

-- ── custom_dimensions (recreate clean) ────────────────────────
drop table if exists public.custom_dimensions cascade;

create table public.custom_dimensions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  "group"    text,
  width      integer     not null,
  height     integer     not null,
  created_at timestamptz not null default now()
);

create index if not exists custom_dimensions_user_idx
  on public.custom_dimensions (user_id);

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


-- ── saved_campaigns ────────────────────────────────────────────
create table if not exists public.saved_campaigns (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  campaign_name    text        not null,
  selected_formats jsonb       not null default '[]',
  created_at       timestamptz not null default now()
);

create index if not exists saved_campaigns_user_idx
  on public.saved_campaigns (user_id);

alter table public.saved_campaigns enable row level security;

create policy "Users can view own saved campaigns"
  on public.saved_campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved campaigns"
  on public.saved_campaigns for insert
  with check (auth.uid() = user_id);
