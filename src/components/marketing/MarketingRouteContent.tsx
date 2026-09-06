import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/** Runs after the lazy page commits, so destination anchors already exist. */
export default function MarketingRouteContent() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    let anchor = hash.slice(1);
    try { anchor = decodeURIComponent(anchor); } catch { /* Keep malformed fragments inert. */ }
    const target = hash ? document.getElementById(anchor) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'instant' });
    } else if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
  }, [pathname, hash]);

  return <Outlet />;
}
