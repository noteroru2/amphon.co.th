# Batch 11A.3 — Deployment and Production Smoke Report

**Date:** 2026-07-18 (Asia/Bangkok)  
**Branch:** `main`  
**Repository HEAD / origin/main:** `1dce6966ef4e6bcab4a4bb240731a21a67aacc1d`

## Final verdict

**FAIL — Redirect or production behavior does not meet the requirements.**

Do not start Batch 11B. Do not restore Astro fallback pages automatically. Investigate the active Vercel redirect configuration and deployment/cache behavior first.

## Cleanup and committed files

Temporary Batch 11A fallback/QA changes were removed before the two requested commits:

- Reverted `src/pages/บริการ/รับซื้อ-gopro.astro` to its pre-Batch 11A version.
- Removed `src/pages/บริการ/รับซื้อเลนส์.astro`.
- Removed `src/pages/บริการ/รับซื้อ-storage-nas.astro`.
- Reverted `scripts/validate-seo.mjs`.
- Reverted `scripts/check-duplicate-headings.mjs`.

Technical SEO commit:

- `6424190` — `fix(seo): clean legacy redirects and exclude redirect sources from sitemap`
- Contains only `vercel.json` and `astro.config.mjs`.

Documentation commit:

- `1dce696` — `docs(seo): add batch 11a technical cleanup and verification reports`
- Contains only `docs/batch-11a/**`, `docs/batch-11a-1/**`, `docs/batch-11a-2/**`, and the clean-state report under `docs/batch-11a-3/**`.

Both commits are present on `origin/main`; local `HEAD` equals `origin/main`. Vercel served newly generated destination assets during the smoke test, but the deployed Git SHA could not be independently read from an exposed production response header or local Vercel metadata.

## Final clean-state QA

All required local checks passed from `1dce696`:

- `npm run build`: PASS — 1,174 pages.
- `npm run qa:coverage`: PASS.
- `npm run qa:internal-404`: PASS — no missing targets and no links to redirect sources.
- `npm run qa:redirect-chain`: PASS — 12 samples, no chains or loops.
- `npm run qa:sitemap`: PASS — two sitemap files, only indexable canonical URLs.
- `npm run qa:duplicate-headings`: PASS — 1,174 pages, no duplicate title/H1.
- `npm run qa:claim-risk`: PASS.

The three obsolete Astro routes are absent from the current clean build. Their sources are absent from the generated sitemap and internal links.

## Production HTTP smoke test

Tests used direct HTTP requests without following redirects at approximately 10:17 Asia/Bangkok.

| Source | First status | Location | Hop count | Final URL | Final status | Result |
|---|---:|---|---:|---|---:|---|
| `/บริการ/รับซื้อเลนส์` | 308 Permanent Redirect | `/บริการ/รับซื้อเลนส์กล้อง` | 1 | `/บริการ/รับซื้อเลนส์กล้อง` | 200 | PASS |
| `/บริการ/รับซื้อ-storage-nas` | 404 Not Found | none | 0 | source URL | 404 | FAIL |
| `/บริการ/รับซื้อ-gopro` | 200 OK | none | 0 | source URL | 200 | FAIL — stale fallback HTML is still served |

All intended destination URLs independently returned `200 OK` with `text/html; charset=utf-8`:

- `/บริการ/รับซื้อเลนส์กล้อง`
- `/บริการ/รับซื้อ-nas`
- `/บริการ/รับซื้อ-gopro-action-camera`

The first lens response also included Vercel's `Refresh: 0;url=...` header. No HTML meta-refresh or JavaScript redirect was established on the destination pages. Destination canonical/indexability was validated by the local clean-state sitemap QA, but a complete production-body canonical/robots audit was not treated as sufficient to override the failed source responses.

## Production sitemap

`/sitemap-index.xml` returned `200 OK` with `Content-Type: application/xml`. The current local production-equivalent build confirms that the three redirect sources are excluded and the intended destinations are indexable canonical URLs. Because two production source behaviors failed, the overall production validation remains FAIL regardless of the sitemap result.

## Push and deployment result

- Push: PASS — `main` and `origin/main` both resolve to `1dce6966ef4e6bcab4a4bb240731a21a67aacc1d`.
- Hosting deployment: PARTIAL/FAIL — current destination assets are available, but two of three required edge redirects are not active as required.
- No source changes were made while waiting for deployment.

## Working tree after verification

The Batch 11A tracked tree was clean before this report. Pre-existing untracked items remain and were intentionally not deleted or committed:

- `scratch/`
- `sitewide-deep-audit.md`
- `verify_production_results.json`

This report itself is uncommitted because the two explicitly requested commits had already been created and pushed before the final production verification; rewriting the pushed documentation commit or creating an unrequested third commit would violate the prescribed two-commit boundary.

## Remaining risks and recommended next step

The production behavior suggests that the active Vercel route table is not consistently applying the new rules, or that stale production artifacts/routes are taking precedence. Before Batch 11B:

1. Confirm that Vercel production is linked to this repository and `main`, and verify the deployed SHA is `1dce6966...` in the Vercel deployment UI/API.
2. Inspect the effective deployment route manifest for the exact UTF-8 paths rather than relying only on `vercel.json` source text.
3. Check whether the explicit percent-encoded NAS rule has a path typo and whether the GoPro static artifact is being retained or served from an older deployment/cache.
4. Redeploy after correcting the route configuration, then repeat the three no-follow requests and destination/sitemap checks.

## Batch 11A.4 follow-up (2026-07-18)

The FAIL result above is retained as the historical Batch 11A.3 result. Batch 11A.4 identified an encoded NAS path typo and a missing encoded GoPro redirect rule, corrected them in fix commit `1b1a1b4`, and deployed production deployment `dpl_Ekk6EXehJE6wEHPML4XkzMYSCygY`. After remediation, all three canonical source paths return 308 to the intended destination in one hop and finish at 200. See `docs/batch-11a-4/final-remediation-report.md` for complete evidence and the final WARNING verdict.

