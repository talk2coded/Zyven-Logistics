-- ============================================================
-- Zyven Logistics — Supabase Database Schema (Production-safe)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.shipments (
  id               bigserial primary key,
  tracking_id      text        not null unique,

  -- Sender
  sender_name      text        not null,
  sender_phone     text        not null,
  sender_address   text        not null,

  -- Receiver
  receiver_name    text        not null,
  receiver_phone   text        not null,
  receiver_email   text,
  receiver_address text        not null,
  receiver_city    text        not null,

  -- Package
  package_desc     text        not null,
  package_weight   numeric,

  -- Schedule
  take_off_date    date        not null,
  delivery_date    date        not null,
  current_location text,

  -- Status & Fees
  status           text        not null default 'Pending'
                   check (status in ('Pending', 'In Transit', 'Delivered')),
  delivery_fee     numeric,
  amount_paid      numeric,
  notes            text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_updated_at on public.shipments;

create trigger shipments_updated_at
  before update on public.shipments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Admin allowlist (only these emails can manage shipments)
-- ============================================================
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Only allowlisted admins can read/modify the allowlist itself
drop policy if exists "Admins manage admin allowlist" on public.admin_users;
create policy "Admins manage admin allowlist"
  on public.admin_users
  for all
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = auth.email()))
  with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

-- Row Level Security
alter table public.shipments enable row level security;

-- Remove insecure demo policies if they exist
drop policy if exists "Public read shipments" on public.shipments;
drop policy if exists "Admin full access" on public.shipments;

-- ============================================================
-- Customer-safe tracking (PUBLIC)
-- ============================================================
-- Instead of allowing anon SELECT on shipments, expose a single RPC that returns
-- only customer-safe fields for one tracking_id.
create or replace function public.track_shipment(p_tracking_id text)
returns table (
  tracking_id text,
  status text,
  take_off_date date,
  delivery_date date,
  current_location text,
  receiver_city text,
  package_desc text,
  package_weight numeric
)
language sql
security definer
set search_path = public
as $$
  select
    s.tracking_id,
    s.status,
    s.take_off_date,
    s.delivery_date,
    s.current_location,
    s.receiver_city,
    s.package_desc,
    s.package_weight
  from public.shipments s
  where s.tracking_id = upper(trim(p_tracking_id))
  limit 1;
$$;

grant execute on function public.track_shipment(text) to anon;

-- ============================================================
-- Admin-only access (AUTHENTICATED + allowlisted email)
-- ============================================================
drop policy if exists "Admins select shipments" on public.shipments;
drop policy if exists "Admins insert shipments" on public.shipments;
drop policy if exists "Admins update shipments" on public.shipments;
drop policy if exists "Admins delete shipments" on public.shipments;

create policy "Admins select shipments"
  on public.shipments
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = auth.email()));

create policy "Admins insert shipments"
  on public.shipments
  for insert
  to authenticated
  with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

create policy "Admins update shipments"
  on public.shipments
  for update
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = auth.email()))
  with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

create policy "Admins delete shipments"
  on public.shipments
  for delete
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = auth.email()));
