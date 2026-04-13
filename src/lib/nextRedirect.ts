export function getSafeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//')) return null;
  return next;
}

export function withNextParam(path: string, next: string | null | undefined): string {
  const safeNext = getSafeNextPath(next);
  if (!safeNext) return path;
  return `${path}?next=${encodeURIComponent(safeNext)}`;
}
