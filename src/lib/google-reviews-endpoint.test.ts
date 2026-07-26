import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createGoogleReviewsHandler } from '../pages/api/google-reviews.ts';

const context = {} as Parameters<ReturnType<typeof createGoogleReviewsHandler>>[0];
const mapsUrl = 'https://maps.google.com/maps/place/example';
const success = {
  ok: true as const,
  status: 200 as const,
  data: { businessName: 'ร้าน', rating: 5, reviewCount: 1, googleMapsUrl: mapsUrl, reviews: [] },
};

function handler(fetchReviews: Parameters<typeof createGoogleReviewsHandler>[0]['fetchReviews']) {
  return createGoogleReviewsHandler({
    fetchReviews,
    apiKey: 'mock-key',
    placeId: 'mock-place',
    googleMapsUrl: mapsUrl,
  });
}

test('endpoint calls Google without counter storage', async () => {
  let calls = 0;
  const response = await handler(async () => {
    calls += 1;
    return success;
  })(context);

  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
});

test('missing configuration returns Maps fallback without calling Google', async () => {
  let calls = 0;
  const endpoint = createGoogleReviewsHandler({
    fetchReviews: async () => {
      calls += 1;
      return success;
    },
    googleMapsUrl: mapsUrl,
  });
  const response = await endpoint(context);

  assert.equal(response.status, 503);
  assert.equal(calls, 0);
  assert.deepEqual(await response.json(), {
    error: 'not_configured',
    googleMapsUrl: mapsUrl,
  });
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
});

test('quota exceeded is polite, safe, no-store and includes Maps fallback', async () => {
  const response = await handler(async () => ({
    ok: false,
    status: 503,
    code: 'quota_exceeded',
  }))(context);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.equal(body.error, 'quota_exceeded');
  assert.match(body.message, /Google Maps/);
  assert.equal(body.googleMapsUrl, mapsUrl);
  assert.equal(Object.keys(body).length, 3);
});

test('every endpoint result is no-store and includes fallback on errors', async () => {
  for (const result of [
    { ok: false as const, status: 502, code: 'upstream_error' },
    { ok: false as const, status: 504, code: 'upstream_timeout' },
    { ok: false as const, status: 502, code: 'network_error' },
  ]) {
    const response = await handler(async () => result)(context);
    assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
    assert.equal((await response.json()).googleMapsUrl, mapsUrl);
  }
});

test('Google review endpoint has no counter storage or review cache integration', () => {
  const endpointSource = readFileSync(
    new URL('../pages/api/google-reviews.ts', import.meta.url),
    'utf8',
  );
  const envSource = readFileSync(new URL('../../.env.example', import.meta.url), 'utf8');

  assert.doesNotMatch(endpointSource, /Redis|Upstash|KV_REST|review-daily-limit|cache\(|caches\.|localStorage|sessionStorage/);
  assert.doesNotMatch(envSource, /KV_REST|UPSTASH_REDIS|REDIS/);
});
