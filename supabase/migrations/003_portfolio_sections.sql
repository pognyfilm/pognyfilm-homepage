-- Phase 2-2: structured portfolio sections.
-- Review only. Do not run until the application changes are approved.

alter table public.portfolio_items
  add column if not exists cover_image_alt_text text,
  add column if not exists before_title text,
  add column if not exists before_description text,
  add column if not exists during_title text,
  add column if not exists during_description text,
  add column if not exists after_title text,
  add column if not exists after_description text;
