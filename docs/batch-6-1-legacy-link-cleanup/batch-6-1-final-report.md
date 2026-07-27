# Batch 6.1 — Legacy Broken Links and Orphan Pages Cleanup

## Executive Summary

- Verdict: **PASS**
- Branch: `batch-6-1-legacy-link-cleanup`
- Starting SHA: `2963488`
- Final SHA: assigned by the scoped commit; see final delivery response
- Broken links before: 11
- Broken links after: 0
- Internal-404 final exit: 0
- Orphan pages audited: 4
- Orphan pages linked: 0
- Orphan pages intentionally unchanged: 4
- Redirects created: 0
- Incorrect redirects removed: 1
- Pages created/deleted: 0/0
- Build: PASS
- Astro check: PASS
- SEO validation: PASS
- Sitemap: PASS
- Duplicate headings: PASS
- Canonical/JSON-LD: PASS
- Dependency/lockfile changes: 0/0
- Merge: No
- Deploy: No

## Broken Links Fixed

Nine camera-service links pointed to the nonexistent legacy namespace:

`/พื้นที่ให้บริการ/รับซื้อกล้อง-อุบลราชธานี`

They now point directly to the generated final URL:

`/รับซื้อ/รับซื้อกล้อง-อุบลราชธานี`

Two links on `/พื้นที่ให้บริการ/อุบลราชธานี` pointed to:

`/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี`

They now point to:

`/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี`

The existing redirect from that real computer route to the nonexistent route was removed from both `src/config/seo-policy.ts` and `vercel.json`. Regression fixtures were updated accordingly.

## Orphan Page Decisions

| Legacy URL | Replacement | Decision |
| --- | --- | --- |
| `/บริการ/รับซื้อ-gopro` | `/บริการ/รับซื้อ-gopro-action-camera` | Keep intentionally orphaned redirect source |
| `/บริการ/รับซื้อ-hdd` | `/บริการ/รับซื้อ-ssd` | Keep intentionally orphaned redirect source |
| `/บริการ/รับซื้อ-storage-nas` | `/บริการ/รับซื้อ-nas` | Keep intentionally orphaned redirect source |
| `/บริการ/รับซื้อเลนส์` | `/บริการ/รับซื้อเลนส์กล้อง` | Keep intentionally orphaned redirect source |

No contextual links were added because internal links should target each final canonical destination, not legacy redirect sources. No exact legacy URL appears in the supplied six-month GSC Pages sheet.

## Safeguards

- No iPad/iPhone rewrite or ownership change.
- No Title, H1, canonical or schema change.
- No homepage/footer changes.
- No location rewrite beyond two broken link destinations.
- No dependency or lockfile change.
- No page creation, deletion or noindex operation.
- No Temp/AppData file tracked.
- No merge or deployment.

## Measurement

After a future deployment, verify:

1. both final Ubon service-area URLs return 200;
2. the computer route is no longer intercepted by the removed redirect;
3. internal crawl reports show zero broken targets;
4. sitemap route count remains stable;
5. GSC does not surface the four legacy redirect URLs as indexed landing pages.
