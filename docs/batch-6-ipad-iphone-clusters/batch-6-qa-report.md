# Batch 6 QA Report

## Result

Verdict: **PASS WITH WARNING**

The Batch 6 iPad/iPhone implementation passes compilation, SEO, schema, sitemap, responsive browser and in-scope link checks. Warnings are limited to pre-existing repository issues outside these clusters and the absence of a GSC Query × Page export.

## Commands and exit codes

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run astro -- sync` | 0 | Content synced and types generated |
| `npm run astro -- check` | 0 | 104 files; 0 errors, 0 warnings, 43 pre-existing hints |
| `npm run build` | 0 | Vercel adapter production build complete; sitemap generated |
| `npm run validate:seo` | 0 | 1,189 pages passed SEO and JSON-LD validation |
| `npm run qa:redirect-chain` | 0 | 10 samples; no loops or chains |
| `npm run qa:sitemap` | 0 | 2 sitemap files; canonical indexable URLs only |
| `npm run qa:duplicate-headings` | 0 | 1,190 built pages; no duplicate titles or H1s |
| `npm run qa:internal-404` | 1 | 11 pre-existing missing targets outside iPad/iPhone; Batch 6 cluster missing targets = 0 |
| `npm run qa:claim-risk` | 1 | One pre-existing false positive in `รับซื้อโทรศัพท์เสีย.md`, where the copy explicitly rejects an unconditional claim |

The first sandboxed build attempt failed only at Vercel dependency symlink creation (`EPERM`) because the diagnostic worktree used a junction. A second isolated QA copy with real dependencies completed the full production build with exit 0.

## Route and technical checks

- Built pages: 1,190 including 404; SEO validator checked 1,189 indexable/content pages.
- Route collisions: 0.
- Removed routes: 0.
- Redirects added: 0.
- Noindex changes: 0.
- Duplicate titles: 0.
- Duplicate descriptions: 0.
- Duplicate H1: 0.
- Duplicate canonical: 0.
- Sitemap canonical/indexability failures: 0.
- Batch 6 broken links: 0.
- Site-wide pre-existing broken links outside Batch 6: 11 (camera and legacy area links).
- Batch 6 orphan pages: 0.
- Site-wide pre-existing orphan pages: 4 (`รับซื้อ-gopro`, `รับซื้อ-hdd`, `รับซื้อ-storage-nas`, `รับซื้อเลนส์`).
- Missing images in browser sample: 0.
- Browser console errors: 0.
- Dependency/lockfile changes: 0.

## Browser QA

The in-app browser checked 20 routes at desktop `1440×900` and mobile `390×844`:

- iPad Hub and Tablet Hub
- iPad Pro and iPad Air
- iPad broken-screen and broken-device conditions
- iPad iCloud and model-identification guides
- iPad Ubon Ratchathani and Khon Kaen location samples
- Phone Hub and iPhone Hub
- iPhone 13 and iPhone 17
- iPhone broken-screen and Face ID conditions
- iPhone iCloud and price guides
- iPhone Ubon Ratchathani and Khon Kaen location samples

All 40 viewport/page combinations had:

- exactly one H1;
- a rendered title and self-canonical;
- `index, follow`;
- JSON-LD;
- visible LINE/telephone CTA;
- zero broken rendered images;
- no document-level horizontal overflow.

Hub samples also contained `Service`, `BreadcrumbList` and `FAQPage` in the rendered JSON-LD. Hub-to-family, hub-to-parent and hub-to-safety-guide links were verified in the visible DOM.

Screenshots are stored in `docs/batch-6-ipad-iphone-clusters/screenshots/`.

## Scope safeguards

- Homepage touched: No.
- Footer touched: No.
- Location pages rewritten: 0.
- Redirect configuration touched: No.
- Dependencies changed: 0.
- Lockfile changed: 0.
- Pre-existing user untracked files staged or modified: No.
- Merge: No.
- Deploy: No.

## Warnings

1. GSC provides separate Queries and Pages sheets, not Query × Page; confirmed cannibalization remains 0.
2. The 11 remaining internal-link failures are pre-existing and outside the iPad/iPhone scope.
3. Four unrelated service pages are site-wide orphans; none belongs to Batch 6.
4. Exact-model and combination pages remain P2 until demand is observed.
