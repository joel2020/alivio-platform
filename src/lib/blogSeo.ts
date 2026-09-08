import type { BlogPost } from './blog';

export type ArticleState = { slug: string; post: BlogPost | null; status: 'ready' | 'not-found' | 'unavailable' };

export function readInitialArticle(slug?: string): ArticleState | undefined {
  if (typeof document === 'undefined' || !slug) return undefined;
  const data = document.getElementById('alivio-article-data')?.textContent;
  if (!data) return undefined;
  try {
    const state = JSON.parse(data) as ArticleState;
    return state.slug === slug && ['ready', 'not-found', 'unavailable'].includes(state.status) ? state : undefined;
  } catch { return undefined; }
}

export function getArticleSeo(post: BlogPost | null, slug: string, unavailable = false) {
  const canonicalUrl = `https://aliviosearchpartners.com/blog/${slug}`;
  return {
    title: post ? `${post.title} | Alivio Search Partners Blog` : unavailable ? 'Article temporarily unavailable | Alivio Search Partners' : 'Article not found | Alivio Search Partners',
    description: post?.meta_description || post?.excerpt || 'Explore recruiting insights from Alivio Search Partners.',
    canonicalUrl,
    ogType: 'article',
    ogImage: post?.cover_image_url || 'https://aliviosearchpartners.com/og-image.png',
    robots: post ? 'index, follow' : 'noindex, follow',
    structuredData: post ? {
      '@context': 'https://schema.org', '@type': 'Article', headline: post.title,
      description: post.meta_description || post.excerpt, datePublished: post.published_date,
      author: { '@type': post.author_name === 'Alivio Search Partners' ? 'Organization' : 'Person', name: post.author_name },
      articleSection: post.category, image: post.cover_image_url ?? undefined,
      mainEntityOfPage: canonicalUrl,
      publisher: { '@type': 'Organization', '@id': 'https://aliviosearchpartners.com/#organization', name: 'Alivio Search Partners', url: 'https://aliviosearchpartners.com' },
    } : { '@context': 'https://schema.org', '@type': 'WebPage', name: unavailable ? 'Article temporarily unavailable' : 'Article not found', url: canonicalUrl },
  };
}
