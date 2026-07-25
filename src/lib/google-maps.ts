const ALLOWED_GOOGLE_MAPS_HOSTS = new Set([
  'maps.app.goo.gl',
  'www.google.com',
  'google.com',
  'maps.google.com',
  'goo.gl',
]);

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
  return validateGoogleMapsUrl(import.meta.env.PUBLIC_GOOGLE_MAPS_URL);
}
