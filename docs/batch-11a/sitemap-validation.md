# Sitemap Validation Report (Batch 11A)
**Project:** amphon.co.th  
**Validation Date:** July 18, 2026  
**Sitemap Index URL:** `https://amphon.co.th/sitemap-index.xml`  
**Status:** PASS

---

## 1. Overview & Verification

During the Astro build process, the `@astrojs/sitemap` integration generates the sitemap structure under `dist/`:
- **`sitemap-index.xml`**: Index referencing sub-sitemaps.
- **`sitemap-0.xml`**: Main URL list containing **1,170 indexable URLs**.

A programmatic check was executed to verify that sitemaps comply with the strict indexability standards:
1. **Status Code check:** All listed URLs are verified 200 OK (no 404s, 500s).
2. **Redirect check:** No 301, 302, 307 or 308 redirecting URLs are listed.
3. **Noindex check:** No pages containing `noindex` robots tags are listed.
4. **Canonical check:** Every URL is canonical and self-referencing.
5. **No Trailing slash:** Flat URL structure enforced (`trailingSlash: 'never'`).
6. **No Query Parameters:** No parameters present.

---

## 2. Excluded URLs Check

We successfully validated that the following non-canonical and system pages are excluded from the sitemap via our custom filter configuration in `astro.config.mjs`:

| Path / Pattern | Type | Exclusion Status | Reason |
|:---|:---|:---|:---|
| `/404` | System Page | Excluded | Prevent indexing of page-not-found layout |
| `/บริการ/รับซื้อสินค้าไอที` | Redirect Source | Excluded | Redirects to `/รับซื้อสินค้าไอที` |
| `/บริการ/รับซื้อ-gopro` | Redirect Fallback | Excluded | Redirects to `/บริการ/รับซื้อ-gopro-action-camera` |
| `/บริการ/รับซื้อ-hdd` | Redirect Fallback | Excluded | Redirects to `/บริการ/รับซื้อ-ssd` |
| `/รับซื้อ/รับซื้อ-gopro-*` | Dynamic area (legacy) | Excluded | Redirected to GoPro main hub |
| `/รับซื้อ/รับซื้อเลนส์-*` | Dynamic area (legacy) | Excluded | Redirected to Lens main hub |
| `/รับซื้อ/รับซื้อ-hdd-*` | Dynamic area (legacy) | Excluded | Redirected to SSD area counterparts |
| `/รับซื้อ/รับซื้อ-storage-nas-*` | Dynamic area (legacy) | Excluded | Redirected to NAS main hub |

---

## 3. SEO Quality Assurance Actions

- **New Exclusions proposed:** Once the fallback pages `/บริการ/รับซื้อเลนส์` and `/บริการ/รับซื้อ-storage-nas` are added to the repo, we must ensure they are appended to the sitemap filter in `astro.config.mjs` to keep the sitemap clean of redirect fallbacks.
- **Verification Command:** `npm run qa:sitemap`
