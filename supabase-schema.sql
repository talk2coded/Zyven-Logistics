-- ============================================================
-- Zyven Logistics — Supabase Database Schema (Production Safe)
-- ============================================================

-- ============================================================
-- SHIPMENTS TABLE
-- ============================================================

create table if not exists public.shipments (
  id               bigserial primary key,
  tracking_id      text not null unique,

  -- Sender
  sender_name      text not null,
  sender_phone     text not null,
  sender_address   text not null,

  -- Receiver
  receiver_name    text not null,
  receiver_phone   text not null,
  receiver_email   text,
  receiver_address text not null,
  receiver_city    text not null,

  -- Package
  package_desc     text not null,
  package_weight   numeric,

  -- Schedule
  take_off_date    date not null,
  delivery_date    date not null,
  current_location text,

  -- Status & Fees
  status text not null default 'Processing'
  check (status in (
    'Processing',
    'Moving',
    'Stopped',
    'Delivered',
    'Pending',
    'In Transit'
  )),

  delivery_fee     numeric,
  amount_paid      numeric,
  notes            text,

  -- Port Route
  port_1_location text,
  port_2_location text,
  port_3_location text,
  custom_location text,

  -- Delivery Info
  estimated_delivery_time text,
  stopped_date date,
  stopped_country text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AUTO UPDATE updated_at
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_updated_at on public.shipments;

create trigger shipments_updated_at
before update on public.shipments
for each row
execute procedure public.handle_updated_at();


-- ============================================================
-- ADMIN USERS TABLE
-- ============================================================

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;


-- ============================================================
-- ADMIN CHECK FUNCTION (PREVENTS RLS RECURSION)
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where email = auth.email()
  );
$$;


-- ============================================================
-- ADMIN ALLOWLIST POLICY
-- ============================================================

drop policy if exists "Admins manage admin allowlist"
on public.admin_users;

create policy "Admins manage admin allowlist"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- ENABLE RLS ON SHIPMENTS
-- ============================================================

alter table public.shipments enable row level security;


-- ============================================================
-- CUSTOMER TRACKING FUNCTION (PUBLIC SAFE)
-- ============================================================

drop function if exists public.track_shipment(text);

create or replace function public.track_shipment(p_tracking_id text)
returns table (
  tracking_id text,
  status text,
  take_off_date date,
  delivery_date date,
  current_location text,
  receiver_name text,
  receiver_city text,
  package_desc text,
  package_weight numeric,
  port_1_location text,
  port_2_location text,
  port_3_location text,
  custom_location text,
  estimated_delivery_time text,
  stopped_date date,
  stopped_country text
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
    s.receiver_name,
    s.receiver_city,
    s.package_desc,
    s.package_weight,
    s.port_1_location,
    s.port_2_location,
    s.port_3_location,
    s.custom_location,
    s.estimated_delivery_time,
    s.stopped_date,
    s.stopped_country
  from public.shipments s
  where s.tracking_id = upper(trim(p_tracking_id))
  limit 1;
$$;

grant execute on function public.track_shipment(text) to anon;


-- ============================================================
-- ADMIN POLICIES FOR SHIPMENTS
-- ============================================================

drop policy if exists "Admins select shipments" on public.shipments;
drop policy if exists "Admins insert shipments" on public.shipments;
drop policy if exists "Admins update shipments" on public.shipments;
drop policy if exists "Admins delete shipments" on public.shipments;

create policy "Admins select shipments"
on public.shipments
for select
to authenticated
using (public.is_admin());

create policy "Admins insert shipments"
on public.shipments
for insert
to authenticated
with check (public.is_admin());

create policy "Admins update shipments"
on public.shipments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins delete shipments"
on public.shipments
for delete
to authenticated
using (public.is_admin());