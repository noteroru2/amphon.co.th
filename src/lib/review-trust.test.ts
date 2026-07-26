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
