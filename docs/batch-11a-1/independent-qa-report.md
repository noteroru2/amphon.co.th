# Independent QA Report (Batch 11A.1)
**Project:** amphon.co.th  
**Report Date:** July 18, 2026  
**Status:** PASS (0 errors found)

---

## 1. Summary of Independent Verification

An independent validation script was run to scan the `dist/` build folder recursively, parsing all HTML and sitemap outputs. The findings are summarized below:

| Metric Checked | Status | Total Scanned | Errors Found | Notes |
|:---|:---|:---|:---|:---|
| **Sitemap URL Existence** | **PASS** | 1,170 URLs | 0 | All sitemap URLs exist in the built folder |
| **Sitemap URL Redirects** | **PASS** | 1,170 URLs | 0 | No redirecting URLs found in the sitemap |
| **Sitemap URL Indexability** | **PASS** | 1,170 URLs | 0 | No `noindex` tags on sitemap URLs |
| **Canonical Alignment** | **PASS** | 1,176 pages | 0 | All canonical tags point to self-referencing clean URLs |
| **Internal link targets** | **PASS** | 20,000+ links | 0 | No broken links, no links point to redirect sources |
| **Duplicate Headings/Titles** | **PASS** | 1,172 pages | 0 | 0 duplicate H1s, 0 duplicate titles (excluding fallbacks) |

---

## 2. Quantitative Alignment Check
- **Total HTML files in dist:** 1,176
- **Total URLs in Sitemap:** 1,170
- **Diff (6 pages):**
  - `/404.html` (noindex, sitemap-excluded)
  - `/บริการ/รับซื้อ-gopro/index.html` (noindex fallback, sitemap-excluded)
  - `/บริการ/รับซื้อ-hdd/index.html` (noindex fallback, sitemap-excluded)
  - `/บริการ/รับซื้อเลนส์/index.html` (noindex fallback, sitemap-excluded)
  - `/บริการ/รับซื้อ-storage-nas/index.html` (noindex fallback, sitemap-excluded)
  - `/บริการ/รับซื้อสินค้าไอที/index.html` (redirect source fallback, sitemap-excluded)

This confirms that all pages are accounted for, and no indexable pages are missing from the sitemap.
