import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createArticleHandler, articleDocument } from '../../server/article-handler.mjs';
import { renderArticle } from '../../.server/entry-article.js';

const template = await readFile(new URL('../../.server/article-template.html', import.meta.url), 'utf8');
const post = { id: 'test', slug: 'test-article', title: 'A published article', excerpt: 'A useful summary.', content: '# A published article\n\nCurrent public content.', published_date: '2026-04-13', meta_description: 'Description.', meta_keywords: '', created_at: '2026-04-13', author_name: 'Alivio Search Partners', category: 'Insights', cover_image_url: null, status: 'published' };
const env = { VITE_SUPABASE_URL: 'https://public-db.invalid', VITE_SUPABASE_ANON_KEY: 'public-test-key' };
function make(fetchImpl, overrides = {}) { return createArticleHandler({ renderArticle, readTemplate: async () => template, fetchImpl, env, ...overrides }); }
async function call(handler, url = '/api/article?slug=test-article', method = 'GET') {
  const response = { headers: {}, statusCode: 0, body: undefined, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(body) { this.body = body; } };
  await handler({ url, method }, response); return response;
}
const rows = data => new Response(JSON.stringify(data), { status: 200 });

test('published lookup uses only fixed public endpoint, public fields and published filter', async () => {
  const result = await call(make(async (url, options) => {
    assert.equal(url.origin, 'https://public-db.invalid');
    assert.equal(url.pathname, '/rest/v1/blog_posts');
    assert.equal(url.searchParams.get('status'), 'eq.published');
    assert.equal(url.searchParams.get('slug'), 'eq.test-article');
    assert.equal(url.searchParams.get('limit'), '1');
    assert.ok(!url.searchParams.get('select').includes('*'));
    assert.equal(options.headers.Authorization, 'Bearer public-test-key');
    assert.equal(options.cache, 'no-store'); assert.ok(options.signal);
    return rows([{ ...post, private_note: 'NEVER-SERIALIZE' }]);
  }));
  assert.equal(result.statusCode, 200); assert.match(result.body, /<h1[^>]*>A published article<\/h1>/);
  assert.match(result.body, /Current public content/); assert.ok(!result.body.includes('NEVER-SERIALIZE'));
  assert.equal(result.headers['x-robots-tag'], 'index, follow');
  assert.equal(result.headers['vercel-cdn-cache-control'], 'no-store');
});

test('content updates and unpublishing take effect on the next request', async () => {
  let current = [post]; const handler = make(async () => rows(current));
  assert.match((await call(handler)).body, /Current public content/);
  current = [{ ...post, content: 'Freshly updated content.' }];
  assert.match((await call(handler)).body, /Freshly updated content/);
  current = []; const removed = await call(handler);
  assert.equal(removed.statusCode, 404); assert.equal(removed.headers['x-robots-tag'], 'noindex, follow');
  assert.ok(!removed.body.includes('Freshly updated content')); assert.match(removed.headers['cache-control'], /no-store/);
});

for (const failure of ['network', 'timeout', 'upstream', 'json', 'draft', 'wrong-slug', 'bad-content']) {
  test(`${failure} fails closed as 503 without publishing data or leaking errors`, async () => {
    const result = await call(make(async () => {
      if (failure === 'network') throw new Error('INTERNAL-SECRET');
      if (failure === 'timeout') throw new DOMException('INTERNAL-SECRET', 'TimeoutError');
      if (failure === 'upstream') return new Response('INTERNAL-SECRET', { status: 500 });
      if (failure === 'json') return rows({ error: 'INTERNAL-SECRET' });
      return rows([{ ...post, content: 'INTERNAL-SECRET', ...(failure === 'draft' ? { status: 'draft' } : failure === 'wrong-slug' ? { slug: 'another-article' } : { title: null }) }]);
    }));
    assert.equal(result.statusCode, 503); assert.equal(result.headers['retry-after'], '60');
    assert.equal(result.headers['x-robots-tag'], 'noindex, follow'); assert.ok(!result.body.includes('INTERNAL-SECRET'));
  });
}

test('invalid slugs and methods never reach the database', async () => {
  const handler = make(async () => { assert.fail('Unexpected database call'); });
  for (const url of ['/api/article', '/api/article?slug=../admin', '/api/article?slug=x&slug=y', '/api/article?slug=%22%3E%3Cscript%3E', `/api/article?slug=${'a'.repeat(201)}`]) {
    assert.equal((await call(handler, url)).statusCode, 404);
  }
  const result = await call(handler, '/api/article?slug=test-article', 'POST');
  assert.equal(result.statusCode, 405); assert.equal(result.headers.allow, 'GET, HEAD');
});

test('original article pathname wins over a user-supplied slug query', async () => {
  const handler = make(async url => { assert.equal(url.searchParams.get('slug'), 'eq.test-article'); return rows([post]); });
  assert.equal((await call(handler, '/blog/test-article?slug=another-article')).statusCode, 200);
});

test('HEAD has the same status and headers without a body', async () => {
  const result = await call(make(async () => rows([post])), '/api/article?slug=test-article', 'HEAD');
  assert.equal(result.statusCode, 200); assert.equal(result.body, undefined);
});

test('stored markup cannot escape document, JSON or Markdown boundaries', () => {
  const attack = '</script><script>window.injected=true</script><img src=x onerror=alert(1)>';
  const body = articleDocument(template, { slug: post.slug, post: { ...post, title: attack, content: attack, excerpt: attack, meta_description: attack }, status: 'ready' }, renderArticle);
  assert.ok(!body.includes('<script>window.injected=true</script>'));
  assert.ok(!body.includes('<img src=x onerror='));
  const bootstrap = body.match(/id="alivio-article-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(bootstrap).post.title, attack);
  assert.match(body, /&lt;script&gt;/);
});

test('missing configuration and template failure return recoverable 503', async () => {
  const config = await call(make(async () => assert.fail('Unexpected database call'), { env: {} }));
  assert.equal(config.statusCode, 503);
  const render = await call(make(async () => rows([post]), { readTemplate: async () => { throw new Error('INTERNAL-SECRET'); } }));
  assert.equal(render.statusCode, 503); assert.ok(!render.body.includes('INTERNAL-SECRET'));
});
