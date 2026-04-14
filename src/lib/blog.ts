import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_date: string;
  meta_description: string;
  meta_keywords: string;
  created_at: string;
}

export const POSTS_PER_PAGE = 12;

export async function fetchBlogPostsPage(page: number) {
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const { data, error, count } = await supabase.from('blog_posts').select('*', { count: 'exact' }).order('published_date', { ascending: false }).range(from, to);
  if (error) throw error;
  return { posts: (data ?? []) as BlogPost[], totalCount: count ?? 0 };
}

export async function fetchBlogPostBySlug(slug: string) {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data as BlogPost;
}

export async function fetchAllBlogSlugs() {
  const { data, error } = await supabase.from('blog_posts').select('slug').order('published_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: { slug: string }) => row.slug);
}

export function formatPublicationDate(dateValue: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateValue));
}

export function estimateReadingTime(text: string) {
  const wordCount = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

export function excerptFromContent(content: string, fallbackExcerpt?: string) {
  const source = content || fallbackExcerpt || '';
  const excerpt = source
    .replace(/[#*`]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 150)
    .replace(/\s\S*$/, '')
    .trimEnd();

  return `${excerpt}...`;
}
