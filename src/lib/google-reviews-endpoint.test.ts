import assert from 'node:assert/strict';
import test from 'node:test';
import { createGoogleReviewsHandler } from '../pages/api/google-reviews.ts';
import type { DailyLimitStore } from './review-daily-limit.ts';

const context = {} as Parameters<ReturnType<typeof createGoogleReviewsHandler>>[0];
const success = {
  ok: true as const,
  status: 200 as const,
  data: { businessName: 'ร้าน', rating: 5, reviewCount: 1, googleMapsUrl: '', reviews: [] },
};

test('missing env and storage failure are fail-closed with no-store', async () => {
  let calls = 0;
  const missing = createGoogleReviewsHandler({
    store: null,
    fetchReviews: async () => { calls += 1; return success; },
    now: () => new Date('2026-07-25T12:00:00Z'),
    googleMapsUrl: 'https://maps.google.com/example',
  });
  const missingResponse = await missing(context);
  assert.equal(missingResponse.status, 503);
  assert.equal(missingResponse.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.equal(calls, 0);

  const broken: DailyLimitStore = { take: async () => { throw new Error('offline'); } };
  const unavailable = createGoogleReviewsHandler({
    store: broken,
    fetchReviews: async () => { calls += 1; return success; },
    now: () => new Date('2026-07-25T12:00:00Z'),
    apiKey: 'mock',
    placeId: 'mock',
    googleMapsUrl: 'https://maps.google.com/example',
  });
  const unavailableResponse = await unavailable(context);
  assert.equal(unavailableResponse.status, 503);
  assert.equal(calls, 0);
});

test('daily limit returns 429, Retry-After and fallback without calling Google', async () => {
  let calls = 0;
  const full: DailyLimitStore = { take: async () => false };
  const handler = createGoogleReviewsHandler({
    store: full,
    fetchReviews: async () => { calls += 1; return success; },
    now: () => new Date('2026-07-25T12:00:00Z'),
    apiKey: 'mock',
    placeId: 'mock',
    googleMapsUrl: 'https://maps.google.com/example',
  });
  const response = await handler(context);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.ok(Number(response.headers.get('Retry-After')) > 0);
  assert.equal(calls, 0);
  assert.deepEqual(await response.json(), {
    rateLimited: true,
    message: 'Daily Google review limit reached',
    googleMapsUrl: 'https://maps.google.com/example',
  });
});

test('allowed request calls Google exactly once', async () => {
  let calls = 0;
  const available: DailyLimitStore = { take: async () => true };
  const handler = createGoogleReviewsHandler({
    store: available,
    fetchReviews: async () => { calls += 1; return success; },
    now: () => new Date('2026-07-25T12:00:00Z'),
    apiKey: 'mock',
    placeId: 'mock',
    googleMapsUrl: '',
  });
  const response = await handler(context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.equal(calls, 1);
});
