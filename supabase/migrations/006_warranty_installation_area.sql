-- Adds an optional installation area to website-admin warranties.
-- Review and run only in the dedicated website-admin Supabase project.

alter table public.warranties
  add column if not exists installation_area numeric(10, 2)
  check (installation_area is null or (installation_area > 0 and installation_area <= 99999));

-- Keep the existing number generation rule while accepting the new optional field.
create or replace function public.create_warranty_record(
  input_customer_name text,
  input_phone text,
  input_region text,
  input_place text,
  input_installation_date date,
  input_product_name text,
  input_warranty_period text,
  input_installer text,
  input_notes text default null,
  input_installation_area numeric default null
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

  if input_installation_area is not null
    and (input_installation_area <= 0 or input_installation_area > 99999) then
    raise exception 'Invalid installation area';
  end if;

  v_registration_date := (now() at time zone 'Asia/Seoul')::date;
  v_date_code := to_char(v_registration_date, 'YYMMDD');

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
    installation_area,
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
    input_installation_area,
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
  text, text, text, text, date, text, text, text, text, numeric
) from public;
grant execute on function public.create_warranty_record(
  text, text, text, text, date, text, text, text, text, numeric
) to authenticated;
grant execute on function public.create_warranty_record(
  text, text, text, text, date, text, text, text, text, numeric
) to service_role;
