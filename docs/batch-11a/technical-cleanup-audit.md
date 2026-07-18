# Technical Cleanup & Indexation Quality Audit (Batch 11A)
**Project:** amphon.co.th  
**Audited Date:** July 18, 2026  
**Status:** Complete (Staging ready, no modifications/commits made yet)

---

## 1. Executive Summary

This audit outlines the technical SEO status of the `amphon.co.th` repository, cross-referencing live build configurations against recent Google Search Console (GSC) data (approximately 1,196 indexed pages, 66 not indexed pages, and 47 discovered/crawled but not indexed URLs).

Our primary goals are to:
- Establish a zero-error threshold for internal redirect links and 404s.
- Clean and streamline Vercel configurations and dynamic Astro paths.
- Ensure that only canonical, 200 OK indexable pages reside in the XML sitemaps.
- Provide clear triage for discovered/crawled not indexed URLs.

---

## 2. Platform Audit Findings

### 2.1 Astro Configuration (`astro.config.mjs`)
- **Trailing Slash:** Configured as `trailingSlash: 'never'` to enforce canonical flat URLs.
- **HTML Compression:** Configured with `compressHTML: true` for optimized mobile load times.
- **Sitemap Integration:** Enforced filters to exclude `/404`, `/บริการ/รับซื้อสินค้าไอที` (redirect source), `/บริการ/รับซื้อ-gopro`, and `/บริการ/รับซื้อ-hdd` plus legacy wildcard prefix patterns (`/รับซื้อ/รับซื้อ-gopro-`, `/รับซื้อ/รับซื้อเลนส์-`, `/รับซื้อ/รับซื้อ-hdd-`, `/รับซื้อ/รับซื้อ-storage-nas-`).
- *Improvement Candidate:* Ensure that all redirect fallbacks are excluded in sitemap configurations to prevent crawling of non-canonical versions.

### 2.2 Sitemap Generation
- The build produces `sitemap-index.xml` and `sitemap-0.xml` in `dist/`.
- All URLs inside the sitemap use UTF-8 URL encoding for Thai characters (e.g. `%E0%B8%...`).
- Cross-checking sitemap locs shows 100% 200 OK indexable status for listed URLs.

### 2.3 Redirect Configuration (`vercel.json` & `seo-policy.ts`)
- **Vercel Redirects:** Configured in `vercel.json` with `permanent: true`.
- **Astro Redirect Fallbacks:** Physical route fallback files exist at `src/pages/บริการ/รับซื้อ-gopro.astro` and `src/pages/บริการ/รับซื้อ-hdd.astro`.
- *Issue found:* The GoPro redirect fallback page lacks `<meta name="robots" content="noindex,follow" />`.
- *Issue found:* Missing exact base-path redirects for `/บริการ/รับซื้อ-storage-nas`, and missing exact redirects for base paths `/รับซื้อ/รับซื้อ-hdd`, `/รับซื้อ/รับซื้อ-gopro`, `/รับซื้อ/รับซื้อเลนส์`, and `/รับซื้อ/รับซื้อ-storage-nas` (crawled by search bots and returning 404).
- *Proposed fix:* Add exact redirect mapping in `vercel.json` and generate lightweight fallback pages for `/บริการ/รับซื้อ-storage-nas` and `/บริการ/รับซื้อเลนส์`.

### 2.4 Canonical Links & Robots Meta
- **Canonical:** Astro layouts dynamically resolve self-referencing absolute URL canonical tags (e.g. `<link rel="canonical" href="https://amphon.co.th/..." />`).
- **Robots Meta:** Default money pages render `index,follow`. The custom redirect fallback pages must explicitly render `noindex,follow` (or `noindex,noarchive`) to satisfy quality crawls.

### 2.5 Robots.txt (`src/pages/robots.txt.ts`)
- Dynamically rendered to serve search engines and AI agents (Allowing all main user-agents including GPTBot, ClaudeBot, Google-Extended, etc.).
- Points to the correct sitemap location: `https://amphon.co.th/sitemap-index.xml`.

### 2.6 Thai URL Encoding
- System uses standard Thai slug strings (e.g., `/บริการ/รับซื้อแรม`).
- Vercel routes are mapped in UTF-8 hex encoding inside `vercel.json` to prevent server decoding errors.

---

## 3. Detailed URL Analysis

### 3.1 404 URL Audit (6 URLs Identified in GSC)
- **`/บริการ/รับซื้อ-storage-nas`**: 404 due to deletion of markdown file and missing redirect. Action: Add redirect to `/บริการ/รับซื้อ-nas` and create fallback page.
- **`/รับซื้อ` and `/รับซื้อ/`**: 404 because Astro has no route matching the base folder. Action: Add Vercel redirect to `/รับซื้อสินค้าไอที`.
- **`/รับซื้อ/รับซื้อ-hdd`**: 404 when bot crawls base path of dynamic route. Action: Redirect to `/บริการ/รับซื้อ-ssd`.
- **`/รับซื้อ/รับซื้อ-gopro`**: 404 when bot crawls base path. Action: Redirect to `/บริการ/รับซื้อ-gopro-action-camera`.
- **`/รับซื้อ/รับซื้อเลนส์`**: 404 when bot crawls base path. Action: Redirect to `/บริการ/รับซื้อเลนส์กล้อง`.
- **`/รับซื้อ/รับซื้อ-storage-nas`**: 404 when bot crawls base path. Action: Redirect to `/บริการ/รับซื้อ-nas`.

### 3.2 Redirect Error Audit (2 URLs)
- **`/บริการ/รับซื้อ-gopro`** and **`/บริการ/รับซื้อ-hdd`** had redirect order clashes in older deployment versions, resolving to circular hops or empty targets. This is now fully mitigated by order consolidation in `vercel.json` and Astro fallback page alignment.

### 3.3 Page with Redirect (11 URLs)
- Main legacy routes that redirect permanently.
- Target check: All redirections lead directly to 200 OK indexable canonical pages.
- Action: Sweep all content pages to replace links pointing to these redirect sources (ensure zero internal link redirect hits).
