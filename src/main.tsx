import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import { preloadMarketingRoute } from './lib/preloadMarketingRoute';
import './index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Preserve public HTML while lazy route code loads. Dynamic/private shells
// and the standalone 404 still mount through the existing client render path.
const path = window.location.pathname.replace(/\/+$/, '') || '/';
if (root.dataset.prerendered === path) {
  void preloadMarketingRoute(path).then(
    () => hydrateRoot(root, app),
    () => createRoot(root).render(app),
  );
} else createRoot(root).render(app);
