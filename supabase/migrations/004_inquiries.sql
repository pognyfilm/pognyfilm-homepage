-- Phase 3: homepage inquiry management.
-- Review and run this file only in the dedicated website-admin Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  region text,
  place text,
  message text,
  source text not null default 'homepage',
  status text not null default 'new'
    check (status in (
      'new',
      'consulting',
      'visit_reserved',
      'quotation_completed',
      'contract_completed',
      'closed'
    )),
  manager text check (manager is null or manager in ('이성화', '이두연')),
  memo text,
  sms_sent boolean not null default false,
  sms_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);
create index if not exists inquiries_status_created_at_idx
  on public.inquiries (status, created_at desc);

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

revoke all on table public.inquiries from anon, authenticated;
grant select, insert, update, delete on table public.inquiries to authenticated;
grant all on table public.inquiries to service_role;

drop policy if exists "Inquiry managers can read inquiries" on public.inquiries;
create policy "Inquiry managers can read inquiries"
on public.inquiries for select
to authenticated
using (public.current_user_is_portfolio_manager());

drop policy if exists "Inquiry managers can insert inquiries" on public.inquiries;
create policy "Inquiry managers can insert inquiries"
on public.inquiries for insert
to authenticated
with check (
  public.current_user_is_portfolio_manager()
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Inquiry managers can update inquiries" on public.inquiries;
create policy "Inquiry managers can update inquiries"
on public.inquiries for update
to authenticated
using (public.current_user_is_portfolio_manager())
with check (
  public.current_user_is_portfolio_manager()
  and updated_by = auth.uid()
);

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
on public.inquiries for delete
to authenticated
using (public.current_user_is_admin());
