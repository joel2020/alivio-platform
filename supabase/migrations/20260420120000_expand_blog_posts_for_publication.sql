/*
  # Expand blog_posts for public publishing workflow

  1. Add author/category/cover/status columns with safe defaults
  2. Backfill existing rows and set status = published
  3. Add indexes for status/category and search helpers
*/

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE public.blog_posts
SET
  author_name = COALESCE(NULLIF(author_name, ''), 'Alivio Editorial Team'),
  category = COALESCE(NULLIF(category, ''), 'Healthcare Recruiting'),
  status = COALESCE(NULLIF(status, ''), 'published')
WHERE author_name IS NULL OR category IS NULL OR status IS NULL OR author_name = '' OR category = '' OR status = '';

ALTER TABLE public.blog_posts
  ALTER COLUMN author_name SET DEFAULT 'Alivio Editorial Team',
  ALTER COLUMN author_name SET NOT NULL,
  ALTER COLUMN category SET DEFAULT 'Healthcare Recruiting',
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_posts_status_check'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS blog_posts_status_published_date_idx
  ON public.blog_posts (status, published_date DESC);

CREATE INDEX IF NOT EXISTS blog_posts_category_idx
  ON public.blog_posts (category);

CREATE INDEX IF NOT EXISTS blog_posts_title_excerpt_idx
  ON public.blog_posts USING gin (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, ''))
  );
