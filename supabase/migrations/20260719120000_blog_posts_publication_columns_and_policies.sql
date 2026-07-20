-- Columns the frontend blog code selects/filters on but which were
-- missing in production (live blog queries were failing).
alter table public.blog_posts
  add column if not exists author_name text not null default 'Alivio Search Partners',
  add column if not exists category text not null default 'Insights',
  add column if not exists cover_image_url text,
  add column if not exists status text not null default 'published';

do $$ begin
  alter table public.blog_posts
    add constraint blog_posts_status_check check (status in ('draft','published'));
exception when duplicate_object then null; end $$;

create index if not exists idx_blog_posts_status_published_date
  on public.blog_posts (status, published_date desc);

-- Tighten read access: public sees published posts only; platform
-- admins see and manage everything.
drop policy if exists "Allow public read access" on public.blog_posts;

create policy "Public read published posts" on public.blog_posts
  for select using (status = 'published' or public.is_platform_admin());

create policy "Platform admins manage posts" on public.blog_posts
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());
