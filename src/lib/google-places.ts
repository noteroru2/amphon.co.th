export const PLACE_FIELDS = 'id,displayName,rating,userRatingCount,googleMapsUri,reviews';
export const REQUEST_TIMEOUT_MS = 7000;

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function safeHttpsUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function normalizePlace(payload: unknown) {
  const place = record(payload);
  const displayName = record(place.displayName);
  const reviews = Array.isArray(place.reviews) ? place.reviews : [];

  return {
    businessName: text(displayName.text),
    rating: number(place.rating),
    reviewCount: number(place.userRatingCount),
    googleMapsUrl: safeHttpsUrl(place.googleMapsUri),
    reviews: reviews.map((value) => {
      const review = record(value);
      const author = record(review.authorAttribution);
      const translated = record(review.text);
      const original = record(review.originalText);

      return {
        id: text(review.name),
        authorName: text(author.displayName),
        authorProfileUrl: safeHttpsUrl(author.uri),
        authorPhotoUrl: safeHttpsUrl(author.photoUri),
        rating: number(review.rating),
        text: text(translated.text),
        originalText: text(original.text),
        relativeTime: text(review.relativePublishTimeDescription),
        publishTime: text(review.publishTime),
        googleMapsUrl: safeHttpsUrl(review.googleMapsUri),
        reportUrl: safeHttpsUrl(review.flagContentUri),
      };
    }).filter((review) => review.text.trim().length > 0),
  };
}

export type GoogleReviewsResult =
  | { ok: true; status: 200; data: ReturnType<typeof normalizePlace> }
  | { ok: false; status: number; code: string };

export async function fetchGoogleReviews(
  apiKey: string | undefined,
  placeId: string | undefined,
  fetcher: typeof fetch = fetch,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<GoogleReviewsResult> {
  if (!apiKey || !placeId) return { ok: false, status: 503, code: 'not_configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
    url.searchParams.set('languageCode', 'th');
    url.searchParams.set('regionCode', 'TH');

    const response = await fetcher(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': PLACE_FIELDS,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const code = response.status === 400 ? 'invalid_place'
        : response.status === 401 || response.status === 403 ? 'access_denied'
        : response.status === 429 ? 'quota_exceeded'
        : 'upstream_error';
      return { ok: false, status: response.status === 429 ? 503 : 502, code };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { ok: false, status: 502, code: 'malformed_response' };
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { ok: false, status: 502, code: 'malformed_response' };
    }
    return { ok: true, status: 200, data: normalizePlace(payload) };
  } catch (error) {
    return {
      ok: false,
      status: 504,
      code: error instanceof Error && error.name === 'AbortError' ? 'upstream_timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timer);
  }
}
