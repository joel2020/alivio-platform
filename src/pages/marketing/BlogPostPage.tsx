import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBlogPostBySlug, formatPublicationDate, type BlogPost } from '../../lib/blog';
import { renderMarkdownToHtml } from '../../lib/markdown';
import { useSeo } from '../../lib/seo';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      try {
        const data = await fetchBlogPostBySlug(activeSlug);
        setPost(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load this post.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  useSeo({
    title: post ? `${post.title} | Alivio Blog` : 'Blog Post | Alivio',
    description: post?.meta_description || 'Read this article from the Alivio blog.',
    keywords: post?.meta_keywords || 'alivio blog',
    ogTitle: post ? `${post.title} | Alivio Blog` : 'Alivio Blog Post',
    ogDescription: post?.meta_description || 'Read this article from the Alivio blog.',
  });

  return (
    <article className="mkt-container" style={{ paddingTop: '48px', paddingBottom: '72px', maxWidth: '880px' }}>
      <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to blog</Link>

      {loading ? <p style={{ marginTop: '18px' }}>Loading post...</p> : null}
      {error ? <p style={{ marginTop: '18px', color: 'var(--error)' }}>{error}</p> : null}

      {!loading && !error && post ? (
        <>
          <header style={{ marginTop: '20px', marginBottom: '26px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{formatPublicationDate(post.published_date)}</p>
            <h1 style={{ marginTop: '10px', marginBottom: 0, fontSize: '44px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>{post.title}</h1>
          </header>
          <div className="blog-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content) }} />
        </>
      ) : null}

      <footer style={{ marginTop: '42px', paddingTop: '20px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '14px' }}>
        © 2026 Alivio. All rights reserved.
      </footer>
    </article>
  );
}
