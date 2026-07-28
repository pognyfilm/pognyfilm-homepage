-- Run only after reviewing 002_portfolio.sql.
-- This file creates the planned public image bucket and its access policies.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read published portfolio images" on storage.objects;
create policy "Public can read published portfolio images"
on storage.objects for select
to public
using (
  bucket_id = 'portfolio-images'
  and exists (
    select 1
    from public.portfolio_items
    where portfolio_items.id::text = (storage.foldername(name))[1]
      and portfolio_items.status = 'published'
  )
);

drop policy if exists "Portfolio managers can read all images" on storage.objects;
create policy "Portfolio managers can read all images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'portfolio-images'
  and public.current_user_is_portfolio_manager()
);

drop policy if exists "Portfolio managers can upload images" on storage.objects;
create policy "Portfolio managers can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-images'
  and public.current_user_is_portfolio_manager()
  and (storage.foldername(name))[1] ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

drop policy if exists "Portfolio managers can update images" on storage.objects;
create policy "Portfolio managers can update images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-images'
  and public.current_user_is_portfolio_manager()
)
with check (
  bucket_id = 'portfolio-images'
  and public.current_user_is_portfolio_manager()
);

drop policy if exists "Portfolio managers can delete images" on storage.objects;
create policy "Portfolio managers can delete images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-images'
  and public.current_user_is_portfolio_manager()
);
