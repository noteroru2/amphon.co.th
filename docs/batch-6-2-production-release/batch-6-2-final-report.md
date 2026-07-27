# Batch 6.2 Production Release

- Verdict: **BLOCKED**
- Source branch: `batch-6-1-legacy-link-cleanup`
- Source SHA: `5a075a8ed287171d71f736c99f4ca966295572aa`
- Main SHA before merge: `441892a86376b9ae8d4adf476ecc19b9dd1db49d`
- Merge SHA: `f61839a1e74e016ea1795143411cf2bcef624959`
- Main remote SHA: `f61839a1e74e016ea1795143411cf2bcef624959`
- Deployment ID: `dpl_Afhft4cCbf8pExvDaUUx8VYZNpVh`
- Deployment SHA: `f61839a1e74e016ea1795143411cf2bcef624959`
- Production URL: `https://amphon.co.th`
- Build: PASS
- Astro check: PASS — 0 errors, 0 warnings
- SEO validation: PASS — 1,189 pages
- Sitemap local: PASS
- Internal 404 local: PASS
- Redirect chain local: PASS
- Production routes tested: 27
- Production routes passed: 25
- Production broken links: 0
- Production redirects passed: 2/4
- Production canonical: PASS — 1183/1183
- Production JSON-LD: PASS on all sampled final pages
- Production mobile overflow: 0
- Console errors: 0
- Route count: 1,190 local; 1183 indexable production sitemap URLs
- Dependency changes: 0
- Lockfile changes: 0
- Merge: Yes
- Deploy: Yes

## Blocking defect

Production does not satisfy the required legacy redirect policy for two routes:

| Source URL | Status | Redirects | Actual final URL | Required final URL | Result |
| --- | ---: | ---: | --- | --- | --- |
| `/บริการ/รับซื้อ-gopro` | 200 | 0 | `/บริการ/รับซื้อ-gopro` | `/บริการ/รับซื้อ-gopro-action-camera` | FAIL |
| `/บริการ/รับซื้อ-hdd` | 200 | 0 | `/บริการ/รับซื้อ-hdd` | `/บริการ/รับซื้อ-ssd` | FAIL |

Both responses expose their legacy static HTML at HTTP 200 even though their canonical tags point to the intended destinations. The required production behavior is a redirect. Per Batch 6.2 acceptance criteria, an incorrect legacy redirect requires `BLOCKED`.

## Temporary Files Verification

No `AppData`, `Local/Temp`, `batch6-1-orphan-audit`, or `codex-batch6-gsc` path is tracked in Git. Existing user-owned untracked files were preserved.

## Merge Evidence

Batch 6 SHA `2963488` is an ancestor of source SHA `5a075a8` (exit 0). The source branch was merged once with a no-fast-forward merge commit. There were no conflicts.

## Local QA Evidence

All eight required local commands passed on merged `main`. SEO validated 1,189 pages, heading QA checked 1,190 built pages, internal broken links were 0, and local redirect-chain checks passed.

## Deployment Evidence

Vercel deployment `dpl_Afhft4cCbf8pExvDaUUx8VYZNpVh` is Ready. Its build log identifies branch `main` and commit `f61839a`, matching both the merge SHA and `origin/main`.

## Production Hub Results

The iPad, Tablet, iPhone and Phone hubs all returned HTTP 200 with correct self-canonicals, one H1, metadata, JSON-LD, breadcrumbs, internal service links, LINE CTA and telephone CTA.

## Legacy Redirect Results

- `/บริการ/รับซื้อเลนส์` → `/บริการ/รับซื้อเลนส์กล้อง`: PASS, one redirect
- `/บริการ/รับซื้อ-storage-nas` → `/บริการ/รับซื้อ-nas`: PASS, one redirect
- `/บริการ/รับซื้อ-gopro`: FAIL, no redirect
- `/บริการ/รับซื้อ-hdd`: FAIL, no redirect

## Corrected Route Results

- `/รับซื้อ/รับซื้อกล้อง-อุบลราชธานี`: HTTP 200, no redirect, PASS
- `/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี`: HTTP 200, no reverse redirect, PASS

## Production Internal Links

- Sitemap pages crawled: 1183
- Unique internal targets checked: 1185
- Broken internal links: 0
- Old camera-area links: 0
- Old computer-area links: 0

## Sitemap Result

Production sitemap index returned HTTP 200 and parsed successfully. It contains 1183 unique URLs, duplicate count 0, HTTP/canonical failures 0. All four hubs are present, legacy redirect sources are excluded, and indexable canonical destinations are present.

## Browser QA

- Desktop routes checked: 23
- Mobile routes checked: 23
- Desktop visual/console failures: 0
- Mobile visual/console failures: 0
- Horizontal overflow: 0
- Broken images: 0
- Placeholder content: 0
- Console errors: 0
- CTA and breadcrumbs: PASS

## Measurement Baseline

Deployment date: 2026-07-27.

| Page | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| iPad Hub | 0 | 161 | 0.00% | 39.16 |
| Tablet Hub | 0 | 0 | N/A | N/A |
| iPhone Hub | 1 | 253 | 0.40% | 51.81 |
| Phone Hub | 0 | 3 | 0.00% | 25.67 |

Top condition page: iPad cracked-screen page — 7 clicks, 104 impressions, 6.73% CTR, position 6.09.  
Top model page: iPad Pro — 3 clicks, 71 impressions, 4.23% CTR, position 15.73.  
Top guide: iPad model-identification guide — 3 clicks, 498 impressions, 0.60% CTR, position 9.55.

## Remaining Risks

- GSC still lacks Query × Page, so landing-page ownership cannot be proven.
- Organic results require 42–56 days of observation.
- Do not change the affected Title/H1 again during the measurement window.
- Do not create exact-model pages until demand is demonstrated.
- Other redirect candidates require a separate evidence-led batch.
- The two failed legacy redirects require a separate corrective change and redeployment; no content or redirect fix was made during this merge/deploy verification.

## Report Paths

1. `docs/batch-6-2-production-release/batch-6-2-pre-merge-diff.csv`
2. `docs/batch-6-2-production-release/batch-6-2-merge-report.md`
3. `docs/batch-6-2-production-release/batch-6-2-local-qa-report.md`
4. `docs/batch-6-2-production-release/batch-6-2-deployment-report.md`
5. `docs/batch-6-2-production-release/batch-6-2-production-routes.csv`
6. `docs/batch-6-2-production-release/batch-6-2-production-sitemap-audit.csv`
7. `docs/batch-6-2-production-release/batch-6-2-production-link-audit.csv`
8. `docs/batch-6-2-production-release/batch-6-2-files-changed.csv`
9. `docs/batch-6-2-production-release/batch-6-2-final-report.md`
