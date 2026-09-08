import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { estimateReadingTime, fetchPublishedBlogPostBySlug, fetchRelatedPublishedPosts, formatPublicationDate, type BlogPost } from '../../lib/blog';
import { renderMarkdownToHtml } from '../../lib/markdown';
import { useSeo } from '../../lib/seo';

const SITE_URL = 'https://aliviosearchpartners.com';

function stripDuplicateHeading(content: string, title: string) {
  const lines = content.split('\n');
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty >= 0 && lines[firstNonEmpty].replace(/^#+\s*/, '').trim().toLowerCase() === title.trim().toLowerCase()) {
    lines.splice(firstNonEmpty, 1);
  }
  return lines.join('\n').trim();
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!slug) {
      setError('Missing blog slug.');
      setLoading(false);
      return;
    }

    const activeSlug = slug;

    async function loadPost() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const loadedPost = await fetchPublishedBlogPostBySlug(activeSlug);
        setPost(loadedPost);

        if (loadedPost) {
          const related = await fetchRelatedPublishedPosts(loadedPost.id, loadedPost.category);
          setRelatedPosts(related);
        } else {
          setNotFound(true);
          setRelatedPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load this post.');
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [slug, reloadToken]);

  const sanitizedContent = useMemo(() => (post ? stripDuplicateHeading(post.content, post.title) : ''), [post]);
  const canonicalUrl = `${SITE_URL}/blog/${slug ?? ''}`;

  useSeo({
    title: post ? `${post.title} | Alivio Search Partners Blog` : 'Healthcare Recruiting Insights | Alivio Search Partners Blog',
    description: post?.meta_description || post?.excerpt || 'Healthcare recruiting insights and clinical staffing strategies from Alivio Search Partners.',
    canonicalUrl,
    ogType: 'article',
    robots: notFound ? 'noindex, follow' : 'index, follow',
    structuredData: post
      ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || post.excerpt,
        datePublished: post.published_date,
        author: {
          '@type': post.author_name === 'Alivio Search Partners' ? 'Organization' : 'Person',
          name: post.author_name,
        },
        articleSection: post.category,
        image: post.cover_image_url ?? undefined,
        mainEntityOfPage: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Alivio Search Partners',
          url: SITE_URL,
        },
      }
      : undefined,
  });

  const shareUrl = canonicalUrl;
  const shareText = post ? `${post.title} | Alivio Search Partners` : 'Alivio Search Partners Blog';

  return (
    <article className="mkt-container" style={{ paddingTop: '48px', paddingBottom: '72px', maxWidth: '880px' }}>
      <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to blog</Link>
      {loading ? <section style={{ marginTop: '20px' }} aria-label="Loading post"><div className="skeleton h-56 w-full" /></section> : null}
      {error ? (
        <div className="card" style={{ marginTop: '18px', borderColor: 'var(--error)', padding: '18px' }}>
          <p style={{ color: 'var(--error)', marginBottom: '12px' }}>We couldn&apos;t load this article. {error}</p>
          <button className="mkt-btn-primary" style={{ minHeight: '44px' }} onClick={() => setReloadToken((prev) => prev + 1)}>Retry</button>
        </div>
      ) : null}

      {!loading && !error && post ? (
        <>
          <header style={{ marginTop: '20px', marginBottom: '26px' }}>
            <span className="badge-neutral">{post.category}</span>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{formatPublicationDate(post.published_date)} · {post.author_name} · {estimateReadingTime(post.content)}</p>
            <h1 style={{ marginTop: '10px', marginBottom: '8px', fontSize: '44px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>{post.title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
          </header>

          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '16px', marginBottom: '22px' }} />
          ) : null}

          <div className="blog-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(sanitizedContent) }} />

          <section style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a className="mkt-btn-secondary" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
            <a className="mkt-btn-secondary" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">Share on X</a>
            <button className="mkt-btn-secondary" onClick={() => void navigator.clipboard.writeText(shareUrl)}>Copy link</button>
          </section>

          {relatedPosts.length > 0 ? (
            <section style={{ marginTop: '36px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Related posts</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedPosts.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit', padding: '16px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{formatPublicationDate(related.published_date)}</p>
                    <h3 style={{ margin: '8px 0 6px', fontSize: '18px', lineHeight: 1.3 }}>{related.title}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{related.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {!loading && !error && !post ? (
        <section style={{ marginTop: '30px' }} className="card">
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '8px' }}>This article isn&apos;t available</h2>
            {notFound && slug ? <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>We couldn&apos;t find a published post for <code>{slug}</code>.</p> : null}
            <Link to="/blog" className="mkt-btn-primary" style={{ minHeight: '44px' }}>Browse all blog posts</Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
