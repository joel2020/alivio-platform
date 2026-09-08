const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELDS = 'id,title,slug,excerpt,content,published_date,meta_description,meta_keywords,created_at,author_name,category,cover_image_url,status';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function articleDocument(template, state, renderArticle) {
  const { body, seo } = renderArticle(state);
  const image = state.post?.cover_image_url || 'https://aliviosearchpartners.com/og-image.png';
  const head = [
    `<title>${escape(seo.title)}</title>`,
    `<meta name="description" content="${escape(seo.description)}" />`,
    `<meta name="robots" content="${escape(seo.robots)}" />`,
    `<link rel="canonical" href="${escape(seo.canonicalUrl)}" />`,
    ...Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:url': seo.canonicalUrl, 'og:type': 'article', 'og:site_name': 'Alivio Search Partners', 'og:image': image }).map(([k, v]) => `<meta property="${k}" content="${escape(v)}" />`),
    ...Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': image }).map(([k, v]) => `<meta name="${k}" content="${escape(v)}" />`),
    ...(seo.structuredData ? [`<script id="alivio-structured-data" type="application/ld+json">${json(seo.structuredData)}</script>`] : []),
    `<script id="alivio-article-data" type="application/json">${json(state)}</script>`,
  ].join('\n');
  return template.replace(/<title>[\s\S]*?<\/title>|<meta\s+(?:name="(?:description|keywords|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>|<link\s+rel="canonical"[^>]*>/g, '')
    .replace('</head>', `${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="/blog/${escape(state.slug)}">${body}</div>`);
}

export function createArticleHandler({ renderArticle, readTemplate, fetchImpl = fetch, env = process.env }) {
  return async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      res.statusCode = 405;
      return res.end('Method not allowed');
    }
    const url = new URL(req.url || '/', 'https://aliviosearchpartners.com');
    const fromPath = url.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1];
    const values = url.searchParams.getAll('slug');
    const slug = fromPath || (values.length === 1 ? values[0] : '');
    if (slug.length > 200 || !SLUG.test(slug)) {
      res.statusCode = 404;
      return res.end('<!doctype html><html lang="en"><head><title>Article not found</title><meta name="robots" content="noindex, follow"></head><body><h1>This article is not available</h1><a href="/blog">Browse articles</a></body></html>');
    }

    let state = { slug, post: null, status: 'unavailable' };
    let status = 503;
    try {
      const base = env.VITE_SUPABASE_URL;
      const key = env.VITE_SUPABASE_ANON_KEY;
      if (!base || !key) throw new Error('Public database configuration unavailable');
      const endpoint = new URL('/rest/v1/blog_posts', base);
      endpoint.search = new URLSearchParams({ select: FIELDS, slug: `eq.${slug}`, status: 'eq.published', limit: '1' }).toString();
      const result = await fetchImpl(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(6000), cache: 'no-store' });
      if (!result.ok) throw new Error('Published article lookup failed');
      const rows = await result.json();
      if (!Array.isArray(rows)) throw new Error('Invalid article response');
      if (rows.length === 0) { state = { slug, post: null, status: 'not-found' }; status = 404; }
      else {
        const row = rows[0];
        if (row.status !== 'published' || row.slug !== slug) throw new Error('Unexpected article publication state');
        // Explicit projection prevents future database fields entering public HTML.
        const post = Object.fromEntries(FIELDS.split(',').map(key => [key, row[key]]));
        if (typeof post.title !== 'string' || typeof post.content !== 'string' || !post.title.trim() || !post.content.trim()) throw new Error('Invalid published article');
        state = { slug, post, status: 'ready' }; status = 200;
      }
    } catch { /* Transient errors must not misclassify a published article as missing. */ }
    try {
      const html = articleDocument(await readTemplate(), state, renderArticle);
      res.statusCode = status;
      res.setHeader('X-Robots-Tag', status === 200 ? 'index, follow' : 'noindex, follow');
      if (status === 503) res.setHeader('Retry-After', '60');
      return res.end(req.method === 'HEAD' ? undefined : html);
    } catch {
      res.statusCode = 503;
      res.setHeader('Retry-After', '60');
      return res.end(req.method === 'HEAD' ? undefined : '<!doctype html><html lang="en"><head><title>Article temporarily unavailable</title><meta name="robots" content="noindex, follow"></head><body><h1>This article is temporarily unavailable</h1><p>Please try again shortly.</p><a href="/blog">Browse articles</a></body></html>');
    }
  };
}
