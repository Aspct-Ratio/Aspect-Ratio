-- Run this in Supabase → SQL Editor

-- Add cancel-at-period-end tracking columns
alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancel_at            timestamptz;

-- Update the comment on status to include 'canceling'
comment on column public.subscriptions.status is
  'active | trialing | past_due | canceling | canceled | incomplete';
