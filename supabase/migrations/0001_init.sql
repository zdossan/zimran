-- Student Loan Guardian — initial schema (P4 pay/trust/pitch slice).
-- Run in the Supabase SQL editor for project `student-loan-guardian`.
-- Requires Authentication > Providers > Anonymous sign-ins to be enabled.

-- sessions_data: one row per (anonymous) auth user, holding the three slices of app state
-- that currently live in localStorage (borrower input, plan comparison, audit result).
create table if not exists public.sessions_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  borrower_input jsonb,
  comparison jsonb,
  audit jsonb,
  updated_at timestamptz not null default now()
);

alter table public.sessions_data enable row level security;

create policy "sessions_data_select_own"
  on public.sessions_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "sessions_data_insert_own"
  on public.sessions_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "sessions_data_update_own"
  on public.sessions_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- entitlements: whether a user has paid (Stripe-backed). Only the service role (server-side,
-- after a verified Stripe webhook/checkout) may write; users may only read their own row.
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pro boolean not null default false,
  plan text check (plan in ('monthly', 'annual')),
  stripe_customer_id text,
  stripe_session_id text unique,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "entitlements_select_own"
  on public.entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/update/delete policies for entitlements: with RLS enabled and no policy for those
-- commands, authenticated/anon users are denied; only the service role (which bypasses RLS)
-- can write.
