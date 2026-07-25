import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bangkokWindow,
  DAILY_GOOGLE_REVIEW_LIMIT,
  takeDailyGoogleReviewRequest,
  UpstashDailyLimitStore,
  type DailyLimitStore,
} from './review-daily-limit.ts';

class AtomicFakeStore implements DailyLimitStore {
  count = 0;
  writes: unknown[] = [];
  async take(dateKey: string, limit: number, ttlSeconds: number) {
    this.writes.push({ dateKey, limit, ttlSeconds });
    if (this.count >= limit) return false;
    this.count += 1;
    return true;
  }
}

test('allows requests 1-10 and blocks 11 without incrementing blocked requests', async () => {
  const store = new AtomicFakeStore();
  const now = new Date('2026-07-25T12:00:00.000Z');
  const results = await Promise.all(
    Array.from({ length: 11 }, () => takeDailyGoogleReviewRequest(store, now)),
  );
  assert.equal(results.filter((result) => result.allowed).length, DAILY_GOOGLE_REVIEW_LIMIT);
  assert.equal(results[10].allowed, false);
  assert.equal(store.count, DAILY_GOOGLE_REVIEW_LIMIT);
  assert.ok(store.writes.every((write) => !JSON.stringify(write).includes('review text')));
});

test('uses the Asia/Bangkok date and resets at Thai midnight', () => {
  const before = bangkokWindow(new Date('2026-07-25T16:59:59.000Z'));
  const after = bangkokWindow(new Date('2026-07-25T17:00:00.000Z'));
  assert.equal(before.dateKey, '2026-07-25');
  assert.equal(after.dateKey, '2026-07-26');
  assert.equal(before.resetAt.toISOString(), '2026-07-25T17:00:00.000Z');
});

test('fails closed when storage is missing or unavailable', async () => {
  const missing = await takeDailyGoogleReviewRequest(null);
  assert.deepEqual(missing.allowed, false);
  assert.equal(missing.allowed ? '' : missing.reason, 'storage_unavailable');

  const broken: DailyLimitStore = { take: async () => { throw new Error('offline'); } };
  const unavailable = await takeDailyGoogleReviewRequest(broken);
  assert.equal(unavailable.allowed, false);
  assert.equal(unavailable.allowed ? '' : unavailable.reason, 'storage_unavailable');
});

test('Upstash store performs one atomic EVAL and stores only counter metadata', async () => {
  let requestBody = '';
  const fetcher = async (_url: URL | RequestInfo, init?: RequestInit) => {
    requestBody = String(init?.body);
    return Response.json({ result: 1 });
  };
  const store = new UpstashDailyLimitStore('https://counter.example', 'secret', fetcher as typeof fetch);
  assert.equal(await store.take('2026-07-25', 10, 3600), true);
  const command = JSON.parse(requestBody);
  assert.equal(command[0], 'EVAL');
  assert.match(command[3], /^google-reviews:2026-07-25$/);
  assert.doesNotMatch(requestBody, /author|rating|reviewCount|review text/i);
});
