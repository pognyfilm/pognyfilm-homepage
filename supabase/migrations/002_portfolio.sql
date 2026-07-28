-- Phase 2-1: portfolio content management.
-- Review and run this file only in the dedicated website-admin Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  region text,
  place text,
  category text,
  installation_type text,
  product text,
  installation_date date,
  summary text,
  description text,
  blog_url text,
  youtube_url text,
  cover_image_path text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'hidden')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_items(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  stage text not null default 'general'
    check (stage in ('before', 'during', 'after', 'general')),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (portfolio_id, storage_path)
);

create table if not exists public.portfolio_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_item_tags (
  portfolio_id uuid not null references public.portfolio_items(id) on delete cascade,
  tag_id uuid not null references public.portfolio_tags(id) on delete cascade,
  primary key (portfolio_id, tag_id)
);

create index if not exists portfolio_items_public_order_idx
  on public.portfolio_items (status, sort_order, published_at desc);
create index if not exists portfolio_items_updated_at_idx
  on public.portfolio_items (updated_at desc);
create index if not exists portfolio_items_category_idx
  on public.portfolio_items (category);
create index if not exists portfolio_items_title_search_idx
  on public.portfolio_items using gin (to_tsvector('simple', title));
create index if not exists portfolio_images_portfolio_order_idx
  on public.portfolio_images (portfolio_id, sort_order);
create index if not exists portfolio_item_tags_tag_idx
  on public.portfolio_item_tags (tag_id, portfolio_id);

drop trigger if exists portfolio_items_set_updated_at on public.portfolio_items;
create trigger portfolio_items_set_updated_at
before update on public.portfolio_items
for each row execute function public.set_updated_at();

create or replace function public.current_user_is_portfolio_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
      and is_active = true
  );
$$;

revoke all on function public.current_user_is_portfolio_manager() from public;
grant execute on function public.current_user_is_portfolio_manager()
  to anon, authenticated;
grant execute on function public.current_user_is_portfolio_manager()
  to service_role;

alter table public.portfolio_items enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.portfolio_tags enable row level security;
alter table public.portfolio_item_tags enable row level security;

revoke all on table public.portfolio_items from anon, authenticated;
revoke all on table public.portfolio_images from anon, authenticated;
revoke all on table public.portfolio_tags from anon, authenticated;
revoke all on table public.portfolio_item_tags from anon, authenticated;

grant select on table public.portfolio_items to anon, authenticated;
grant select on table public.portfolio_images to anon, authenticated;
grant select on table public.portfolio_tags to anon, authenticated;
grant select on table public.portfolio_item_tags to anon, authenticated;
grant insert, update, delete on table public.portfolio_items to authenticated;
grant insert, update, delete on table public.portfolio_images to authenticated;
grant insert, update, delete on table public.portfolio_tags to authenticated;
grant insert, update, delete on table public.portfolio_item_tags to authenticated;
grant all on table public.portfolio_items to service_role;
grant all on table public.portfolio_images to service_role;
grant all on table public.portfolio_tags to service_role;
grant all on table public.portfolio_item_tags to service_role;

drop policy if exists "Published portfolio items are public" on public.portfolio_items;
create policy "Published portfolio items are public"
on public.portfolio_items for select
to anon, authenticated
using (
  status = 'published'
  or public.current_user_is_portfolio_manager()
);

drop policy if exists "Managers can insert portfolio items" on public.portfolio_items;
create policy "Managers can insert portfolio items"
on public.portfolio_items for insert
to authenticated
with check (
  public.current_user_is_portfolio_manager()
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Managers can update portfolio items" on public.portfolio_items;
create policy "Managers can update portfolio items"
on public.portfolio_items for update
to authenticated
using (public.current_user_is_portfolio_manager())
with check (
  public.current_user_is_portfolio_manager()
  and updated_by = auth.uid()
);

drop policy if exists "Admins can delete portfolio items" on public.portfolio_items;
create policy "Admins can delete portfolio items"
on public.portfolio_items for delete
to authenticated
using (public.current_user_is_admin());

drop policy if exists "Published portfolio images are public" on public.portfolio_images;
create policy "Published portfolio images are public"
on public.portfolio_images for select
to anon, authenticated
using (
  public.current_user_is_portfolio_manager()
  or exists (
    select 1
    from public.portfolio_items
    where portfolio_items.id = portfolio_images.portfolio_id
      and portfolio_items.status = 'published'
  )
);

drop policy if exists "Managers can insert portfolio images" on public.portfolio_images;
create policy "Managers can insert portfolio images"
on public.portfolio_images for insert
to authenticated
with check (public.current_user_is_portfolio_manager());

drop policy if exists "Managers can update portfolio images" on public.portfolio_images;
create policy "Managers can update portfolio images"
on public.portfolio_images for update
to authenticated
using (public.current_user_is_portfolio_manager())
with check (public.current_user_is_portfolio_manager());

drop policy if exists "Managers can delete portfolio images" on public.portfolio_images;
drop policy if exists "Admins can delete portfolio images" on public.portfolio_images;
create policy "Admins can delete portfolio images"
on public.portfolio_images for delete
to authenticated
using (public.current_user_is_admin());

drop policy if exists "Published portfolio tags are public" on public.portfolio_tags;
create policy "Published portfolio tags are public"
on public.portfolio_tags for select
to anon, authenticated
using (
  public.current_user_is_portfolio_manager()
  or exists (
    select 1
    from public.portfolio_item_tags
    join public.portfolio_items
      on portfolio_items.id = portfolio_item_tags.portfolio_id
    where portfolio_item_tags.tag_id = portfolio_tags.id
      and portfolio_items.status = 'published'
  )
);

drop policy if exists "Managers can insert portfolio tags" on public.portfolio_tags;
create policy "Managers can insert portfolio tags"
on public.portfolio_tags for insert
to authenticated
with check (public.current_user_is_portfolio_manager());

drop policy if exists "Managers can update portfolio tags" on public.portfolio_tags;
create policy "Managers can update portfolio tags"
on public.portfolio_tags for update
to authenticated
using (public.current_user_is_portfolio_manager())
with check (public.current_user_is_portfolio_manager());

drop policy if exists "Admins can delete portfolio tags" on public.portfolio_tags;
create policy "Admins can delete portfolio tags"
on public.portfolio_tags for delete
to authenticated
using (public.current_user_is_admin());

drop policy if exists "Published portfolio tag links are public" on public.portfolio_item_tags;
create policy "Published portfolio tag links are public"
on public.portfolio_item_tags for select
to anon, authenticated
using (
  public.current_user_is_portfolio_manager()
  or exists (
    select 1
    from public.portfolio_items
    where portfolio_items.id = portfolio_item_tags.portfolio_id
      and portfolio_items.status = 'published'
  )
);

drop policy if exists "Managers can insert portfolio tag links" on public.portfolio_item_tags;
create policy "Managers can insert portfolio tag links"
on public.portfolio_item_tags for insert
to authenticated
with check (public.current_user_is_portfolio_manager());

drop policy if exists "Managers can delete portfolio tag links" on public.portfolio_item_tags;
drop policy if exists "Admins can delete portfolio tag links" on public.portfolio_item_tags;
create policy "Admins can delete portfolio tag links"
on public.portfolio_item_tags for delete
to authenticated
using (public.current_user_is_admin());

create or replace function public.replace_portfolio_children(
  target_portfolio_id uuid,
  image_rows jsonb,
  tag_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.current_user_is_portfolio_manager() then
    raise exception 'Portfolio manager access required';
  end if;

  if not exists (
    select 1 from public.portfolio_items where id = target_portfolio_id
  ) then
    raise exception 'Portfolio item not found';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(image_rows, '[]'::jsonb)) as image
    where image->>'storage_path' not like target_portfolio_id::text || '/%'
  ) then
    raise exception 'Invalid portfolio image path';
  end if;

  delete from public.portfolio_images
  where portfolio_id = target_portfolio_id;

  insert into public.portfolio_images (
    id,
    portfolio_id,
    storage_path,
    alt_text,
    stage,
    caption,
    sort_order
  )
  select
    coalesce(nullif(image->>'id', '')::uuid, gen_random_uuid()),
    target_portfolio_id,
    image->>'storage_path',
    nullif(image->>'alt_text', ''),
    image->>'stage',
    nullif(image->>'caption', ''),
    coalesce((image->>'sort_order')::integer, 0)
  from jsonb_array_elements(coalesce(image_rows, '[]'::jsonb)) as image;

  delete from public.portfolio_item_tags
  where portfolio_id = target_portfolio_id;

  insert into public.portfolio_item_tags (portfolio_id, tag_id)
  select target_portfolio_id, tag_id
  from unnest(coalesce(tag_ids, array[]::uuid[])) as tag_id;
end;
$$;

revoke all on function public.replace_portfolio_children(uuid, jsonb, uuid[]) from public;
grant execute on function public.replace_portfolio_children(uuid, jsonb, uuid[])
  to authenticated;
grant execute on function public.replace_portfolio_children(uuid, jsonb, uuid[])
  to service_role;
