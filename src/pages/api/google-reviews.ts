import type { APIRoute } from 'astro';
import { fetchGoogleReviews } from '../../lib/google-places.ts';
import { configuredGoogleMapsUrl } from '../../lib/google-maps.ts';
import {
  configuredDailyLimitStore,
  retryAfterSeconds,
  takeDailyGoogleReviewRequest,
  type DailyLimitStore,
} from '../../lib/review-daily-limit.ts';

export const prerender = false;

const headers = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

type Dependencies = {
  store: DailyLimitStore | null;
  fetchReviews: typeof fetchGoogleReviews;
  now: () => Date;
  apiKey?: string;
  placeId?: string;
  googleMapsUrl: string;
};

export function createGoogleReviewsHandler(dependencies: Dependencies): APIRoute {
  return async () => {
    if (!dependencies.apiKey || !dependencies.placeId) {
      return new Response(JSON.stringify({
        error: 'not_configured',
        googleMapsUrl: dependencies.googleMapsUrl,
      }), { status: 503, headers });
    }

    const now = dependencies.now();
    const allowance = await takeDailyGoogleReviewRequest(dependencies.store, now);
    if (!allowance.allowed) {
      if (allowance.reason === 'storage_unavailable') {
        console.error('Google review counter unavailable');
      }
      return new Response(JSON.stringify({
        rateLimited: allowance.reason === 'limit_reached',
        message: allowance.reason === 'limit_reached'
          ? 'Daily Google review limit reached'
          : 'Google reviews are temporarily unavailable',
        googleMapsUrl: dependencies.googleMapsUrl,
      }), {
        status: allowance.reason === 'limit_reached' ? 429 : 503,
        headers: {
          ...headers,
          'Retry-After': String(retryAfterSeconds(allowance.resetAt, now)),
        },
      });
    }

    const result = await dependencies.fetchReviews(dependencies.apiKey, dependencies.placeId);

  if (!result.ok) {
    if (result.code !== 'not_configured') {
      console.error('Google Places request failed', { code: result.code });
    }
      return new Response(JSON.stringify({
        error: result.code,
        googleMapsUrl: dependencies.googleMapsUrl,
      }), {
      status: result.status,
      headers,
    });
  }

    return new Response(JSON.stringify(result.data), { status: 200, headers });
  };
}

export const GET = createGoogleReviewsHandler({
  store: configuredDailyLimitStore(),
  fetchReviews: fetchGoogleReviews,
  now: () => new Date(),
  apiKey: import.meta.env?.GOOGLE_PLACES_API_KEY,
  placeId: import.meta.env?.GOOGLE_PLACE_ID,
  googleMapsUrl: configuredGoogleMapsUrl(),
});
