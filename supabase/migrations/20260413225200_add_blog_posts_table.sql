/*
  # Add public blog posts table

  1. New table
    - blog_posts
      - id (uuid, primary key)
      - title (text)
      - slug (text, unique)
      - excerpt (text)
      - content (text)
      - published_date (date)
      - meta_description (text)
      - meta_keywords (text)
      - created_at (timestamp)

  2. Security
    - Enable Row Level Security
    - Public read policy for published blog content
*/

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  published_date DATE NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_date_idx
  ON public.blog_posts (published_date DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read blog posts" ON public.blog_posts;
CREATE POLICY "Public can read blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);
