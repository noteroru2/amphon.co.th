import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateGoogleMapsUrl } from './google-maps.ts';
import { FULL_REVIEW_PATHS, reviewTrustForPath } from './review-trust.ts';

test('live reviews are limited to the approved 9-page whitelist', () => {
  assert.equal(FULL_REVIEW_PATHS.size, 9);
  for (const path of FULL_REVIEW_PATHS) assert.equal(reviewTrustForPath(path), 'full');
  assert.equal(reviewTrustForPath('/blog/example'), 'compact');
  assert.equal(reviewTrustForPath('/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น'), 'compact');
  assert.equal(reviewTrustForPath('/บริการ/รับซื้อ-macbook-pro'), 'compact');
});

test('encoded Thai whitelist paths are recognized', () => {
  assert.equal(reviewTrustForPath(encodeURI('/บริการ/รับซื้อคอมพิวเตอร์')), 'full');
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
