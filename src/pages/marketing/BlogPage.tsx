import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { POSTS_PER_PAGE, estimateReadingTime, fetchPublishedBlogPostsPage, fetchPublishedCategories, formatPublicationDate, type BlogPost } from '../../lib/blog';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const page = useMemo(() => {
    const value = Number(searchParams.get('page') || '1');
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }, [searchParams]);

  const activeSearch = searchParams.get('q')?.trim() ?? '';
  const activeCategory = searchParams.get('category')?.trim() ?? 'All';
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

  useEffect(() => {
    async function loadCategories() {
      try {
        const loaded = await fetchPublishedCategories();
        setCategories(loaded);
      } catch {
        setCategories(['All']);
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError(null);
      try {
        const { posts: pagePosts, totalCount: count } = await fetchPublishedBlogPostsPage(page, activeSearch, activeCategory);
        setPosts(pagePosts);
        setTotalCount(count);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load blog posts.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, [page, activeSearch, activeCategory, reloadToken]);

  const setParamState = (next: { page?: number; q?: string; category?: string }) => {
    const current = {
      page,
      q: activeSearch,
      category: activeCategory,
      ...next,
    };

    const params = new URLSearchParams();
    if ((current.page ?? 1) > 1) params.set('page', String(current.page));
    if (current.q && current.q.trim()) params.set('q', current.q.trim());
    if (current.category && current.category !== 'All') params.set('category', current.category);

    setSearchParams(params);
  };

  return (
    <div className="mkt-container" style={{ paddingTop: '48px', paddingBottom: '72px' }}>
      <header style={{ marginBottom: '28px' }}>
        <p className="mkt-label" style={{ marginBottom: '10px' }}>ALIVIO BLOG</p>
        <h1 style={{ fontSize: '42px', marginBottom: '10px', letterSpacing: '-0.03em' }}>Healthcare Recruiting Insights for Hospitals and Health Systems</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '740px' }}>
          Practical guidance on nurse recruiting, clinical staffing operations, and AI workflows that help reduce vacancy days.
        </p>
      </header>

      <section className="card" style={{ padding: '18px', marginBottom: '20px' }}>
        <input
          className="input w-full"
          placeholder="Search blog posts"
          value={activeSearch}
          onChange={(event) => setParamState({ page: 1, q: event.target.value })}
        />
        <div className="flex flex-wrap gap-2" style={{ marginTop: '12px' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setParamState({ page: 1, category })}
              className={activeCategory === category ? 'mkt-btn-primary' : 'mkt-btn-secondary'}
              style={{ minHeight: '36px', padding: '0 14px' }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Loading blog posts">
          {Array.from({ length: 6 }).map((_, idx) => (
            <article key={idx} className="card" style={{ padding: '24px', minHeight: '260px' }}>
              <div className="skeleton h-32 w-full mb-3" />
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-7 w-5/6 mb-2" />
              <div className="skeleton h-4 w-full mb-2" />
            </article>
          ))}
        </section>
      ) : null}

      {error ? (
        <div className="card" style={{ borderColor: 'var(--error)', padding: '18px', marginBottom: '20px' }}>
          <p style={{ color: 'var(--error)', marginBottom: '12px' }}>We couldn&apos;t load blog posts. {error}</p>
          <button className="mkt-btn-primary" style={{ minHeight: '44px' }} onClick={() => setReloadToken((prev) => prev + 1)}>
            Retry loading posts
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Blog posts list">
            {posts.map((post) => (
              <article
                key={post.id}
                className="card card-hover"
                style={{ padding: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}
              >
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} loading="lazy" />
                ) : (
                  <div style={{ width: '100%', height: '160px', background: 'var(--bg-subtle)' }} aria-hidden="true" />
                )}
                <div style={{ padding: '0 20px' }}>
                  <span className="badge-neutral">{post.category}</span>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{formatPublicationDate(post.published_date)} · {post.author_name} · {estimateReadingTime(post.content)}</p>
                  <h2 style={{ margin: '10px 0', fontSize: '22px', lineHeight: 1.35 }}>{post.title}</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', flexGrow: 1 }}>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {posts.length === 0 ? (
            <div className="card" style={{ marginTop: '24px', padding: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>No posts found</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Try a different search term or category.</p>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <nav aria-label="Blog pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '34px' }}>
              <button className="mkt-btn-secondary" style={{ height: '40px', padding: '0 16px' }} disabled={page <= 1} onClick={() => setParamState({ page: page - 1 })}>
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setParamState({ page: num })}
                  aria-current={num === page ? 'page' : undefined}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: num === page ? 'var(--accent)' : 'var(--bg-surface)',
                    color: num === page ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {num}
                </button>
              ))}
              <button className="mkt-btn-secondary" style={{ height: '40px', padding: '0 16px' }} disabled={page >= totalPages} onClick={() => setParamState({ page: page + 1 })}>
                Next
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
