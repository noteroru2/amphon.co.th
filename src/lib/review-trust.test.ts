import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateGoogleMapsUrl } from './google-maps.ts';
import { FULL_REVIEW_PATHS, reviewTrustForPath } from './review-trust.ts';

test('live reviews are limited to the homepage', () => {
  assert.equal(FULL_REVIEW_PATHS.size, 1);
  for (const path of FULL_REVIEW_PATHS) assert.equal(reviewTrustForPath(path), 'full');
  assert.equal(reviewTrustForPath('/about'), 'compact');
  assert.equal(reviewTrustForPath('/contact'), 'compact');
  assert.equal(reviewTrustForPath('/บริการ/รับซื้อคอมพิวเตอร์'), 'compact');
  assert.equal(reviewTrustForPath('/blog/example'), 'compact');
  assert.equal(reviewTrustForPath('/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น'), 'compact');
  assert.equal(reviewTrustForPath('/บริการ/รับซื้อ-macbook-pro'), 'compact');
});

test('encoded non-home paths remain compact', () => {
  assert.equal(reviewTrustForPath(encodeURI('/บริการ/รับซื้อคอมพิวเตอร์')), 'compact');
});

test('Google Maps configuration accepts only approved HTTPS listing URLs', () => {
  assert.ok(validateGoogleMapsUrl('https://maps.app.goo.gl/example'));
  assert.ok(validateGoogleMapsUrl('https://www.google.com/maps/place/example'));
  assert.equal(validateGoogleMapsUrl('http://maps.app.goo.gl/example'), '');
  assert.equal(validateGoogleMapsUrl('https://example.com/maps/place/example'), '');
  assert.equal(validateGoogleMapsUrl('javascript:alert(1)'), '');
});

test('static Maps reviews URL is always crawlable HTTPS without waiting for JS', async () => {
  const { staticGoogleMapsReviewsUrl, DEFAULT_GOOGLE_MAPS_BUSINESS_NAME } = await import('./google-maps.ts');
  const expectedQuery = 'ร้านอำพล เทรดดิ้ง อุบลราชธานี';
  const misspelledProvince = 'อุบลราชธธานี';

  assert.equal(DEFAULT_GOOGLE_MAPS_BUSINESS_NAME, expectedQuery);
  assert.doesNotMatch(DEFAULT_GOOGLE_MAPS_BUSINESS_NAME, new RegExp(misspelledProvince));

  const fallback = staticGoogleMapsReviewsUrl({ configuredUrl: '', placeId: '' });
  assert.match(fallback, /^https:\/\/www\.google\.com\/maps\/search\/\?/);
  assert.doesNotMatch(fallback, /query_place_id=/);

  const parsed = new URL(fallback);
  assert.equal(parsed.protocol, 'https:');
  const decodedQuery = parsed.searchParams.get('query');
  assert.equal(decodedQuery, expectedQuery);
  assert.equal(decodedQuery, DEFAULT_GOOGLE_MAPS_BUSINESS_NAME);
  assert.ok(decodedQuery && !decodedQuery.includes(misspelledProvince));
  assert.doesNotMatch(fallback, /%E0%B8%98%E0%B8%98/); // double ธ encoded

  const withPlace = staticGoogleMapsReviewsUrl({
    configuredUrl: '',
    placeId: 'ChIJ_test_place',
    businessName: DEFAULT_GOOGLE_MAPS_BUSINESS_NAME,
  });
  const placeParsed = new URL(withPlace);
  assert.equal(placeParsed.searchParams.get('query'), expectedQuery);
  assert.equal(placeParsed.searchParams.get('query_place_id'), 'ChIJ_test_place');

  const configured = staticGoogleMapsReviewsUrl({
    configuredUrl: 'https://maps.app.goo.gl/example',
    placeId: 'ChIJ_ignored',
  });
  assert.equal(configured, 'https://maps.app.goo.gl/example');
});

test('full reviews all-reviews link ships with static href in source', () => {
  const source = readFileSync(new URL('../components/GoogleReviews.astro', import.meta.url), 'utf8');
  assert.match(source, /data-all-reviews href=\{mapsReviewsUrl\}/);
  assert.doesNotMatch(source, /allReviews\?\.remove\(\)/);
  assert.doesNotMatch(source, /อุบลราชธธานี/);
});

test('compact card cannot call the reviews API or hard-code score totals', () => {
  const source = readFileSync(new URL('../components/GoogleReviewsLink.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\/api\/google-reviews|data-rating|data-review-count/);
  assert.doesNotMatch(source, /\b[1-5](?:\.\d)?\s*(?:ดาว|รีวิว)/);
});

test('BaseLayout is the only rendering point and chooses exactly one trust mode', () => {
  const source = readFileSync(new URL('../layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.match(source, /reviewTrust === 'full'/);
  assert.match(source, /reviewTrust === 'compact'/);
  assert.match(source, /reviewTrustForPath\(Astro\.url\.pathname\)/);
});

test('full reviews are click-to-load and have no viewport-triggered request', () => {
  const source = readFileSync(new URL('../components/GoogleReviews.astro', import.meta.url), 'utf8');
  assert.match(source, /type="button" data-reviews-load/);
  assert.match(source, /addEventListener\('click'/);
  assert.doesNotMatch(source, /IntersectionObserver|rootMargin/);
  assert.equal((source.match(/fetch\('\/api\/google-reviews'/g) ?? []).length, 1);
  assert.match(source, /if \(requested\) return;\s*requested = true;/);
  assert.match(source, /\{ once: true \}/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|caches\.|indexedDB/);
});

test('review feature does not add rating or review schema', () => {
  const layout = readFileSync(new URL('../layouts/BaseLayout.astro', import.meta.url), 'utf8');
  const fullReviews = readFileSync(new URL('../components/GoogleReviews.astro', import.meta.url), 'utf8');
  const compactReviews = readFileSync(new URL('../components/GoogleReviewsLink.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(`${layout}\n${fullReviews}\n${compactReviews}`, /aggregateRating|"@type"\s*:\s*"Review"/i);
});
