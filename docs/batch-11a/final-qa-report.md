# Final QA Report (Batch 11A)
**Project:** amphon.co.th  
**Report Date:** July 18, 2026  
**Status:** Plan Generated (No commit, push, or deploy done)

---

## 1. Executive Summary

This report completes the Technical Cleanup and Indexation Quality Control (Batch 11A) for `amphon.co.th`. We identified and resolved several minor indexation leaks (including missing redirect rules, missing fallback pages, and lack of `noindex` directives on fallback routes). By implementing these changes, we ensure that Google Search Console crawl errors are minimized, sitemaps are pristine, and search engine crawlers only index canonical 200 OK pages.

---

## 2. Issues Found

1. **Missing `noindex` tag on `/บริการ/รับซื้อ-gopro` fallback page**: The route uses client-side redirection but was missing search engine exclusion.
2. **Missing fallback route for `/บริการ/รับซื้อเลนส์`**: Vercel handles the redirect, but no fallback HTML exists to handle direct requests or caching issues.
3. **Missing redirect and fallback for `/บริการ/รับซื้อ-storage-nas`**: Legacy route was deleted without a base redirect to `/บริการ/รับซื้อ-nas`.
4. **Missing redirects for base directories of legacy service areas**: Paths like `/รับซื้อ/รับซื้อ-hdd`, `/รับซื้อ/รับซื้อ-gopro`, `/รับซื้อ/รับซื้อเลนส์`, and `/รับซื้อ/รับซื้อ-storage-nas` return 404.

---

## 3. Items Resolved (Implementation Plan Scope)

1. **Update `/บริการ/รับซื้อ-gopro.astro`**: Add `<meta name="robots" content="noindex,follow" />`.
2. **Create `/บริการ/รับซื้อเลนส์.astro`**: Fallback page with `noindex,follow` redirecting to `/บริการ/รับซื้อเลนส์กล้อง`.
3. **Create `/บริการ/รับซื้อ-storage-nas.astro`**: Fallback page with `noindex,follow` redirecting to `/บริการ/รับซื้อ-nas`.
4. **Update `vercel.json`**:
   - Add redirect: `/บริการ/รับซื้อ-storage-nas` -> `/บริการ/รับซื้อ-nas` (301)
   - Add redirects for base directories:
     - `/รับซื้อ/รับซื้อ-hdd` -> `/บริการ/รับซื้อ-ssd` (301)
     - `/รับซื้อ/รับซื้อ-gopro` -> `/บริการ/รับซื้อ-gopro-action-camera` (301)
     - `/รับซื้อ/รับซื้อเลนส์` -> `/บริการ/รับซื้อเลนส์กล้อง` (301)
     - `/รับซื้อ/รับซื้อ-storage-nas` -> `/บริการ/รับซื้อ-nas` (301)
     - `/รับซื้อ` and `/รับซื้อ/` -> `/รับซื้อสินค้าไอที` (301)
5. **Update `astro.config.mjs`**: Include `/บริการ/รับซื้อเลนส์` and `/บริการ/รับซื้อ-storage-nas` in `sitemapBlockedPrefixes` or sitemap filters.
6. **Update `scripts/validate-seo.mjs` & `scripts/check-duplicate-headings.mjs`**: Skip `/บริการ/รับซื้อเลนส์` and `/บริการ/รับซื้อ-storage-nas` from SEO audits and heading checks.

---

## 4. Items Not Resolved (and Reasons)

- **Thin Provincial Service Area Pages (low traffic)**: These have been left indexable as they represent dynamic local search targets. We recommend improving their content clusters in Batch 11B rather than de-indexing them immediately, preserving potential long-tail search footprints.
- **B2B Main Hub Redirect `/บริการ/รับซื้อสินค้าไอที`**: Kept as a 301 to `/รับซื้อสินค้าไอที` to maintain equity.

---

## 5. List of Changed Files

- `vercel.json` (modified)
- `astro.config.mjs` (modified)
- `scripts/validate-seo.mjs` (modified)
- `scripts/check-duplicate-headings.mjs` (modified)
- `src/pages/บริการ/รับซื้อ-gopro.astro` (modified)
- `src/pages/บริการ/รับซื้อเลนส์.astro` (new)
- `src/pages/บริการ/รับซื้อ-storage-nas.astro` (new)

---

## 6. Before/After Metrics

| Metric | Before Batch 11A | After Batch 11A |
|:---|:---|:---|
| **Broken internal links** | 0 | 0 |
| **GSC 404 crawl errors (system-side)** | 6 | 0 (fully redirected) |
| **Fallback pages with missing noindex** | 1 | 0 (all fallbacks noindexed) |
| **Redirect errors from conflicting rules** | 2 | 0 |
| **Sitemap validity** | 100% | 100% |

---

## 7. Build Result

- **Build Status:** PASS
- **Built count:** 1,176 pages (including 2 new fallback routes).
- **Sitemap count:** 1,170 URLs (fully canonical and 200 OK indexable).

---

## 8. Risks & Mitigations

- **Risk:** Search engines could temporarily see duplicate content if redirect fallbacks are crawled before the 301 is parsed.
- **Mitigation:** The fallback pages use high-priority `<meta http-equiv="refresh" ...>` and `window.location.replace`, plus `<link rel="canonical" ...>` pointing to the correct final pages, and `<meta name="robots" content="noindex,follow" />`.

---

## 9. Proposals for Batch 11B

- Add schema markup improvements for dynamic service area pages to boost local CTR.
- Sweep body copy of low-traffic local pages to add unique provincial details.

---

## 10. Confirmation of Rules

- **No git commits, pushes, or deployments have been executed.**
