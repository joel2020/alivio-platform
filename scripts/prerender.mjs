import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

process.env.NODE_ENV = 'production';
const serverDir = resolve('.prerender');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

try {
  await build({ build: { ssr: 'src/entry-prerender.tsx', outDir: serverDir, emptyOutDir: true, copyPublicDir: false } });
  const { render, routes, getPageSeo } = await import(pathToFileURL(resolve(serverDir, 'entry-prerender.js')).href);
  const template = await readFile('dist/index.html', 'utf8');
  // Keep an empty SPA shell so dynamic/private URLs never inherit homepage content.
  await writeFile('dist/app.html', template);
  function document(path, body) {
    const seo = getPageSeo(path);
    const head = [
      `<title>${escape(seo.title)}</title>`,
      `<meta name="description" content="${escape(seo.description)}" />`,
      `<meta name="robots" content="${escape(seo.robots)}" />`,
      `<link rel="canonical" href="${escape(seo.canonicalUrl)}" />`,
      ...Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:url': seo.canonicalUrl, 'og:type': 'website', 'og:site_name': 'Alivio Search Partners', 'og:image': seo.ogImage }).map(([key, value]) => `<meta property="${key}" content="${escape(value)}" />`),
      ...Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.ogImage }).map(([key, value]) => `<meta name="${key}" content="${escape(value)}" />`),
      `<script id="alivio-structured-data" type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>`,
    ].join('\n');
    return template.replace(/<title>[\s\S]*?<\/title>|<meta\s+(?:name="(?:description|keywords|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>|<link\s+rel="canonical"[^>]*>/g, '')
      .replace('</head>', `${head}\n</head>`)
      .replace('<div id="root"></div>', `<div id="root"${routes.includes(path) ? ` data-prerendered="${escape(path)}"` : ''}>${body}</div>`);
  }
  for (const path of routes) {
    const file = path === '/' ? 'dist/index.html' : `dist${path}.html`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, document(path, render(path)));
  }
  await writeFile('dist/404.html', document('/404', render('/404')));
  console.log(`Prerendered ${routes.length} public pages and the 404 page.`);
} finally {
  await rm(serverDir, { recursive: true, force: true });
}
