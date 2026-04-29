import { supabase } from './supabase';

export type BlogStatus = 'draft' | 'published';

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
  author_name: string;
  category: string;
  cover_image_url: string | null;
  status: BlogStatus;
}

export interface BlogPostUpsert {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_date: string;
  meta_description: string;
  meta_keywords: string;
  author_name: string;
  category: string;
  cover_image_url: string | null;
  status: BlogStatus;
}

export const POSTS_PER_PAGE = 12;

const BLOG_SELECT = 'id,title,slug,excerpt,content,published_date,meta_description,meta_keywords,created_at,author_name,category,cover_image_url,status';

export async function fetchPublishedBlogPostsPage(page: number, searchQuery: string, category: string) {
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabase
    .from('blog_posts')
    .select(BLOG_SELECT, { count: 'exact' })
    .eq('status', 'published')
    .order('published_date', { ascending: false });

  if (searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    query = query.or(`title.ilike.${term},excerpt.ilike.${term}`);
  }

  if (category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { posts: (data ?? []) as BlogPost[], totalCount: count ?? 0 };
}

export async function fetchPublishedCategories() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')
    .order('category', { ascending: true });

  if (error) throw error;

  const categories = Array.from(new Set((data ?? []).map((row: { category: string | null }) => row.category).filter(Boolean))) as string[];
  return ['All', ...categories];
}

export async function fetchPublishedBlogPostBySlug(slug: string) {
  const { data, error } = await supabase.from('blog_posts').select(BLOG_SELECT).eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) {
    const isNotFound = error.code === 'PGRST116' || error.details?.includes('0 rows');
    if (isNotFound) return null;
    throw error;
  }
  return (data as BlogPost | null) ?? null;
}

export async function fetchRelatedPublishedPosts(postId: string, category: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_SELECT)
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', postId)
    .order('published_date', { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchAdminBlogPosts() {
  const { data, error } = await supabase.from('blog_posts').select(BLOG_SELECT).order('published_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchAdminBlogPostById(id: string) {
  const { data, error } = await supabase.from('blog_posts').select(BLOG_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as BlogPost | null) ?? null;
}

export async function createBlogPost(input: BlogPostUpsert) {
  const { data, error } = await supabase.from('blog_posts').insert(input).select(BLOG_SELECT).single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updateBlogPost(id: string, input: BlogPostUpsert) {
  const { data, error } = await supabase.from('blog_posts').update(input).eq('id', id).select(BLOG_SELECT).single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
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

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
