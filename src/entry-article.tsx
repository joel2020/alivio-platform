import { renderToString } from 'react-dom/server';
import { Suspense } from 'react';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import MarketingLayout from './components/marketing/MarketingLayout';
import BlogPostPage from './pages/marketing/BlogPostPage';
import { getArticleSeo, type ArticleState } from './lib/blogSeo';

export function renderArticle(state: ArticleState) {
  const path = `/blog/${state.slug}`;
  const body = renderToString(
    <StaticRouter location={path}>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/blog/:slug" element={<BlogPostPage initialState={state} />} />
          </Route>
        </Routes>
      </Suspense>
    </StaticRouter>,
  );
  return { body, seo: getArticleSeo(state.post, state.slug, state.status === 'unavailable') };
}
