import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchGoogleReviews, normalizePlace, safeHttpsUrl } from './google-places.ts';

test('missing configuration returns a safe error', async () => {
  assert.deepEqual(await fetchGoogleReviews(undefined, undefined), {
    ok: false, status: 503, code: 'not_configured',
  });
});

test('normalizes nulls and preserves review text', () => {
  const data = normalizePlace({
    displayName: { text: 'อำพล เทรดดิ้ง' },
    reviews: [
      { name: 'first', rating: 1, text: { text: '<b>ข้อความเดิม</b>' } },
      null,
    ],
  });
  assert.equal(data.reviews[0].text, '<b>ข้อความเดิม</b>');
  assert.equal(data.reviews[0].rating, 1);
  assert.equal(data.reviews.length, 1);
  assert.equal(data.rating, null);
});

test('keeps only reviews with text without changing Google relevance order', () => {
  const data = normalizePlace({
    reviews: [
      { name: 'first', rating: 1, text: { text: 'รีวิวลำดับแรก' } },
      { name: 'blank', rating: 5, text: { text: '   ' } },
      { name: 'third', rating: 2, text: { text: 'รีวิวลำดับสาม' } },
    ],
  });
  assert.deepEqual(data.reviews.map((review) => review.id), ['first', 'third']);
  assert.deepEqual(data.reviews.map((review) => review.rating), [1, 2]);
});

test('rejects non-https and malformed URLs', () => {
  assert.equal(safeHttpsUrl('javascript:alert(1)'), '');
  assert.equal(safeHttpsUrl('http://example.com'), '');
  assert.equal(safeHttpsUrl('https://maps.google.com/x'), 'https://maps.google.com/x');
});

test('maps upstream errors without exposing response bodies', async () => {
  const fetcher = async () => new Response('secret upstream body', { status: 403 });
  const result = await fetchGoogleReviews('key', 'place', fetcher as typeof fetch);
  assert.deepEqual(result, { ok: false, status: 502, code: 'access_denied' });
});

test('handles malformed JSON responses', async () => {
  const fetcher = async () => new Response('{', { status: 200 });
  const result = await fetchGoogleReviews('key', 'place', fetcher as typeof fetch);
  assert.deepEqual(result, { ok: false, status: 502, code: 'malformed_response' });
});

test('handles timeout', async () => {
  const fetcher = (_url: URL | RequestInfo, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });
  const result = await fetchGoogleReviews('key', 'place', fetcher as typeof fetch, 1);
  assert.deepEqual(result, { ok: false, status: 504, code: 'upstream_timeout' });
});
