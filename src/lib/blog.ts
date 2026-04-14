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
  const normalized = (fallbackExcerpt || content || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= 170) return normalized;

  const sentenceSplit = normalized.slice(0, 220);
  const sentenceEnd = Math.max(sentenceSplit.lastIndexOf('. '), sentenceSplit.lastIndexOf('! '), sentenceSplit.lastIndexOf('? '));
  if (sentenceEnd > 100) return `${sentenceSplit.slice(0, sentenceEnd + 1).trim()}`;

  const wordBoundary = normalized.lastIndexOf(' ', 170);
  return `${normalized.slice(0, wordBoundary > 0 ? wordBoundary : 170).trimEnd()}...`;
}
