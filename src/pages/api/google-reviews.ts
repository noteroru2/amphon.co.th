import type { APIRoute } from 'astro';
import { fetchGoogleReviews } from '../../lib/google-places';

export const prerender = false;

const headers = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

export const GET: APIRoute = async () => {
  const result = await fetchGoogleReviews(
    import.meta.env.GOOGLE_PLACES_API_KEY,
    import.meta.env.GOOGLE_PLACE_ID,
  );

  if (!result.ok) {
    if (result.code !== 'not_configured') {
      console.error('Google Places request failed', { code: result.code });
    }
    return new Response(JSON.stringify({ error: result.code }), {
      status: result.status,
      headers,
    });
  }

  return new Response(JSON.stringify(result.data), { status: 200, headers });
};
