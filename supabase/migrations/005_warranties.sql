-- Phase 4: manually managed quality warranties.
-- Review and run this file only in the dedicated website-admin Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  warranty_number text not null unique
    check (warranty_number ~ '^PG-[0-9]{8}$'),
  customer_name text not null,
  phone text not null,
  region text not null,
  place text not null,
  installation_date date not null,
  product_name text not null,
  warranty_period text not null,
  installer text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null
);

-- Keeps issued daily sequences even when a warranty record is later deleted.
create table if not exists public.warranty_daily_sequences (
  registration_date date primary key,
  last_sequence integer not null check (last_sequence between 1 and 99)
);

create index if not exists warranties_created_at_idx
  on public.warranties (created_at desc);
create index if not exists warranties_customer_phone_idx
  on public.warranties (customer_name, phone);
create index if not exists warranties_installation_date_idx
  on public.warranties (installation_date desc);

drop trigger if exists warranties_set_updated_at on public.warranties;
create trigger warranties_set_updated_at
before update on public.warranties
for each row execute function public.set_updated_at();

alter table public.warranties enable row level security;
alter table public.warranty_daily_sequences enable row level security;

revoke all on table public.warranties from anon, authenticated;
revoke all on table public.warranty_daily_sequences from anon, authenticated;
grant select, insert, update, delete on table public.warranties to authenticated;
grant all on table public.warranties to service_role;
grant all on table public.warranty_daily_sequences to service_role;

drop policy if exists "Warranty managers can read warranties" on public.warranties;
create policy "Warranty managers can read warranties"
on public.warranties for select
to authenticated
using (public.current_user_is_portfolio_manager());

drop policy if exists "Warranty managers can insert warranties" on public.warranties;
create policy "Warranty managers can insert warranties"
on public.warranties for insert
to authenticated
with check (
  public.current_user_is_portfolio_manager()
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Warranty managers can update warranties" on public.warranties;
create policy "Warranty managers can update warranties"
on public.warranties for update
to authenticated
using (public.current_user_is_portfolio_manager())
with check (
  public.current_user_is_portfolio_manager()
  and updated_by = auth.uid()
);

drop policy if exists "Admins can delete warranties" on public.warranties;
create policy "Admins can delete warranties"
on public.warranties for delete
to authenticated
using (public.current_user_is_admin());

create or replace function public.create_warranty_record(
  input_customer_name text,
  input_phone text,
  input_region text,
  input_place text,
  input_installation_date date,
  input_product_name text,
  input_warranty_period text,
  input_installer text,
  input_notes text default null
)
returns table (id uuid, warranty_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registration_date date;
  v_date_code text;
  v_next_sequence integer;
  v_generated_number text;
  v_generated_id uuid;
begin
  if not public.current_user_is_portfolio_manager() then
    raise exception 'Warranty manager access required';
  end if;

  v_registration_date := (now() at time zone 'Asia/Seoul')::date;
  v_date_code := to_char(v_registration_date, 'YYMMDD');

  -- Serialize number allocation for a single registration date.
  perform pg_advisory_xact_lock(hashtext('warranty:' || v_registration_date::text));

  insert into public.warranty_daily_sequences (
    registration_date,
    last_sequence
  ) values (
    v_registration_date,
    1
  )
  on conflict (registration_date) do update
    set last_sequence = public.warranty_daily_sequences.last_sequence + 1
  returning last_sequence into v_next_sequence;

  if v_next_sequence > 99 then
    raise exception 'Daily warranty number limit exceeded';
  end if;

  v_generated_number := 'PG-' || v_date_code || lpad(v_next_sequence::text, 2, '0');
  v_generated_id := gen_random_uuid();

  insert into public.warranties (
    id,
    warranty_number,
    customer_name,
    phone,
    region,
    place,
    installation_date,
    product_name,
    warranty_period,
    installer,
    notes,
    created_by,
    updated_by
  ) values (
    v_generated_id,
    v_generated_number,
    input_customer_name,
    input_phone,
    input_region,
    input_place,
    input_installation_date,
    input_product_name,
    input_warranty_period,
    input_installer,
    nullif(input_notes, ''),
    auth.uid(),
    auth.uid()
  );

  return query select v_generated_id, v_generated_number;
end;
$$;

revoke all on function public.create_warranty_record(
  text, text, text, text, date, text, text, text, text
) from public;
grant execute on function public.create_warranty_record(
  text, text, text, text, date, text, text, text, text
) to authenticated;
grant execute on function public.create_warranty_record(
  text, text, text, text, date, text, text, text, text
) to service_role;
