-- Main homepage featured portfolio selection.
-- Existing rows remain OFF because the new column defaults to false.

alter table public.portfolio_items
  add column if not exists is_featured boolean not null default false;

create index if not exists portfolio_items_featured_order_idx
  on public.portfolio_items (is_featured, status, sort_order, published_at desc);

create or replace function public.enforce_portfolio_featured_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_featured then
    perform pg_advisory_xact_lock(607202606);

    if (
      select count(*)
      from public.portfolio_items
      where is_featured = true
        and id <> new.id
    ) >= 6 then
      raise exception '대표 노출은 최대 6개까지 선택할 수 있습니다.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists portfolio_items_featured_limit
  on public.portfolio_items;

create trigger portfolio_items_featured_limit
before insert or update of is_featured
on public.portfolio_items
for each row execute function public.enforce_portfolio_featured_limit();
