import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBlogPostBySlug, formatPublicationDate, type BlogPost } from '../../lib/blog';
import { renderMarkdownToHtml } from '../../lib/markdown';
import { useSeo } from '../../lib/seo';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

function stripDuplicateHeading(content: string, title: string) {
  const lines = content.split('\n');
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty >= 0 && lines[firstNonEmpty].replace(/^#+\s*/, '').trim().toLowerCase() === title.trim().toLowerCase()) {
    lines.splice(firstNonEmpty, 1);
  }
  return lines.join('\n').trim();
}

function gradientFromSeed(seed: string) {
  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 1.7) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 78% 55%), hsl(${hue2} 75% 45%))`;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!slug) { setError('Missing blog slug.'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetchBlogPostBySlug(slug).then(setPost).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load this post.')).finally(() => setLoading(false));
  }, [slug, reloadToken]);

  const sanitizedContent = useMemo(() => (post ? stripDuplicateHeading(post.content, post.title) : ''), [post]);

  useSeo({
    title: post ? `${post.title} | Alivio Search Partners Blog` : 'Healthcare Recruiting Insights | Alivio Search Partners Blog',
    description: post?.meta_description || post?.excerpt || 'Healthcare recruiting insights and clinical staffing strategies from Alivio Search Partners.',
    ogType: 'article',
  });

  return (
    <article className="mkt-container" style={{ paddingTop: '48px', paddingBottom: '72px', maxWidth: '880px' }}>
      <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to blog</Link>
      {loading ? (
        <section style={{ marginTop: '20px' }} aria-label="Loading post">
          <div className="skeleton h-4 w-36 mb-4" />
          <div className="skeleton h-12 w-4/5 mb-3" />
          <div className="skeleton h-12 w-3/5 mb-6" />
          <div className="skeleton h-56 w-full mb-6" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-11/12 mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </section>
      ) : null}
      {error ? (
        <div className="card" style={{ marginTop: '18px', borderColor: 'var(--error)', padding: '18px' }}>
          <p style={{ color: 'var(--error)', marginBottom: '12px' }}>We couldn&apos;t load this article. {error}</p>
          <button className="mkt-btn-primary" style={{ minHeight: '44px' }} onClick={() => setReloadToken((prev) => prev + 1)}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && post ? (
        <>
          <header style={{ marginTop: '20px', marginBottom: '26px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{formatPublicationDate(post.published_date)}</p>
            <h1 style={{ marginTop: '10px', marginBottom: 0, fontSize: '44px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>{post.title}</h1>
          </header>
          <div style={{ height: '220px', borderRadius: '16px', marginBottom: '22px', background: gradientFromSeed(post.slug || post.title) }} aria-hidden="true" />
          <div className="blog-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(sanitizedContent) }} />
        </>
      ) : null}

      {!loading && !error && !post ? (
        <section style={{ marginTop: '30px' }} className="card">
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '8px' }}>This article isn&apos;t available</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              It may have been moved or unpublished. Browse all posts for similar insights.
            </p>
            <Link to="/blog" className="mkt-btn-primary" style={{ minHeight: '44px' }}>
              Browse all blog posts
            </Link>
          </div>
        </section>
      ) : null}

      {post ? (
        <section style={{ marginTop: '34px', padding: '24px', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)' }}>Alivio helps hospital HR teams fill hard-to-staff clinical roles in days, not months.</p>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary" title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Book a Demo →</a>
        </section>
      ) : null}
    </article>
  );
}
