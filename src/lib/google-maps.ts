const ALLOWED_GOOGLE_MAPS_HOSTS = new Set([
  'maps.app.goo.gl',
  'www.google.com',
  'google.com',
  'maps.google.com',
  'goo.gl',
]);

/** Default public listing search used when no env override is configured.
 * Spelling must be exactly: ร้านอำพล เทรดดิ้ง อุบลราชธานี (not อุบลราชธธานี).
 */
export const DEFAULT_GOOGLE_MAPS_BUSINESS_NAME = 'ร้านอำพล เทรดดิ้ง อุบลราชธานี';

export function validateGoogleMapsUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') return '';
  try {
    const url = new URL(value);
    const pathIsMaps = url.hostname === 'maps.app.goo.gl'
      || url.hostname === 'maps.google.com'
      || (url.hostname === 'goo.gl' && url.pathname.startsWith('/maps'))
      || ((url.hostname === 'www.google.com' || url.hostname === 'google.com') && url.pathname.startsWith('/maps'));
    return url.protocol === 'https:' && ALLOWED_GOOGLE_MAPS_HOSTS.has(url.hostname) && pathIsMaps
      ? url.href
      : '';
  } catch {
    return '';
  }
}

export function configuredGoogleMapsUrl(): string {
  return validateGoogleMapsUrl(import.meta.env?.PUBLIC_GOOGLE_MAPS_URL);
}

/**
 * Static Google Maps URL for crawlable <a href> links at Astro build time.
 * Preference: PUBLIC_GOOGLE_MAPS_URL → Place ID search → default business search.
 * Never depends on client JS or Places API responses.
 */
export function staticGoogleMapsReviewsUrl(
  options: {
    configuredUrl?: unknown;
    placeId?: unknown;
    businessName?: string;
  } = {},
): string {
  const configured = validateGoogleMapsUrl(
    options.configuredUrl ?? import.meta.env?.PUBLIC_GOOGLE_MAPS_URL,
  );
  if (configured) return configured;

  const businessName = (options.businessName ?? DEFAULT_GOOGLE_MAPS_BUSINESS_NAME).trim()
    || DEFAULT_GOOGLE_MAPS_BUSINESS_NAME;
  const placeId = typeof options.placeId === 'string'
    ? options.placeId.trim()
    : typeof import.meta.env?.GOOGLE_PLACE_ID === 'string'
      ? import.meta.env.GOOGLE_PLACE_ID.trim()
      : '';

  // Use encodeURIComponent so spaces become %20 (not +) — matches Maps search links.
  let href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;
  if (placeId) href += `&query_place_id=${encodeURIComponent(placeId)}`;
  return href;
}
