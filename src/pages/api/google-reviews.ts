import type { APIRoute } from 'astro';
import { fetchGoogleReviews } from '../../lib/google-places.ts';
import { configuredGoogleMapsUrl } from '../../lib/google-maps.ts';

export const prerender = false;

const headers = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

type Dependencies = {
  fetchReviews: typeof fetchGoogleReviews;
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

    const result = await dependencies.fetchReviews(dependencies.apiKey, dependencies.placeId);

    if (!result.ok) {
      if (result.code !== 'not_configured') {
        console.error('Google Places request failed', { code: result.code });
      }
      return new Response(JSON.stringify({
        error: result.code,
        message: result.code === 'quota_exceeded'
          ? 'ขณะนี้มีผู้ใช้งานรีวิวครบตามโควตาแล้ว กรุณาดูรีวิวล่าสุดบน Google Maps'
          : 'ขณะนี้ยังโหลดรีวิวไม่ได้ กรุณาดูรีวิวล่าสุดบน Google Maps',
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
  fetchReviews: fetchGoogleReviews,
  apiKey: import.meta.env?.GOOGLE_PLACES_API_KEY,
  placeId: import.meta.env?.GOOGLE_PLACE_ID,
  googleMapsUrl: configuredGoogleMapsUrl(),
});
