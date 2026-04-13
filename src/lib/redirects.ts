export function getSafeNextPath(search: string, fallbackPath: string) {
  const next = new URLSearchParams(search).get('next');
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return fallbackPath;
}

export function withNextParam(path: string, nextPath: string) {
  return `${path}?next=${encodeURIComponent(nextPath)}`;
}
