export const FULL_REVIEW_PATHS = new Set([
  '/',
]);

export function reviewTrustForPath(pathname: string): 'full' | 'compact' {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // An invalid encoded path is never eligible for live reviews.
  }
  const normalized = decoded.length > 1 ? decoded.replace(/\/+$/, '') : decoded;
  return FULL_REVIEW_PATHS.has(normalized) ? 'full' : 'compact';
}
