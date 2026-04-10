-- Run this in Supabase → SQL Editor

create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete set null,
  stripe_customer_id      text not null,
  stripe_subscription_id  text not null unique,
  plan                    text not null default 'freelancer',
  status                  text not null default 'active',
  -- possible values: active, trialing, past_due, canceled, incomplete
  current_period_end      timestamptz,
  trial_end               timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Index for fast customer lookups
create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

-- Index for user lookups
create index if not exists subscriptions_user_idx
  on public.subscriptions (user_id);

-- RLS: users can only read their own subscription row
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS automatically (used by the webhook handler)
