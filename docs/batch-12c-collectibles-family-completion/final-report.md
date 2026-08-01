# Final report — Batch 12C Collectibles Family Completion

## Verdict

PASS

## Status

- Collectibles Family: CLOSED — 19/19 RESOLVED
- F-04: OPEN — COLLECTIBLES FAMILY COMPLETE / REMAINING CANDIDATES PENDING

## SHAs

- Branch: `fix/batch-12c-collectibles-family-completion`
- Base SHA: `6baf5a34903f895abdac96692d0265f216a7dcdd`
- Implementation SHA: `9ae82cda0d3b11b1b62ebb7908e0566a269bbc78`
- Branch tip (docs fill): `258633a`
- Merge SHA: `56db3fff1300a3305414ad865926577fa443e7f2`
- Production SHA: NOT VERIFIED
- Report-only SHA: PENDING
- Deployment URL: https://amphon.co.th

## Scope

- Source count: 9
- Family total: 19
- Target: `/บริการ/รับซื้อของสะสม`
- Source set SHA-256: `701b35d97524a86ebfaeac0782dc3c611094dafe5395d4dddf85317147109b06`
- Unique content found: 0
- Sections merged: 0
- Boilerplate discarded: 9/9
- Decision gate: REDIRECT_NO_CONTENT_TO_MERGE × 9
- Routes retired: 9
- Logical redirects: 9
- Configured redirect sources: 18 (unicode + percent-encoded)
- Existing redirects retargeted: 0
- Query / Unicode / Encoded: PASS
- Redirect hops: 1 (308)
- Internal links updated: policy filter only (hard links = 0)
- Links to retired sources (prod crawl 1166): 0
- Broken links: 0
- Redirecting sitemap URLs: 0
- Orphans (batch-11 local): 2 (pre-existing allowance)
- Sitemap before/after: 1175 → 1166
- Unexpected sitemap diff: 0
- Target: 200, indexable, self-canonical, in sitemap
- Batch 12B regression: PASS (prod + local)
- Metadata/schema/image diff: none
- Astro check: 0 errors / 0 warnings (result line)
- Build: exit 0
- Batch 1–12C QA: PASS (Batch 7 PASS WITH WARNING = F-12 unchanged)
- Out of scope preserved: `/รับซื้อ/รับซื้อของสะสม-อุบลราชธานี` still 200 + sitemap
- F-12: OPEN / BLOCKED BY VERCEL DOMAIN CONFIGURATION (unchanged)
- Remaining Findings: F-04 (remaining candidates), F-12; F-14–F-18 out of scope
- Remaining F-04 active candidates (reconciled from decision-matrix): **167**
  - Original matrix rows: 188
  - False positives: 2
  - Collectibles MERGE resolved: 19
  - Remaining MERGE (non-collectibles): 19
  - IMPROVE remaining: 14 (includes ของสะสม-อุบลราชธานี)
  - REQUIRES_BUSINESS_DECISION: 134
  - Check: 188 − 2 FP − 19 collectibles MERGE = 167

## Production evidence

- `post-deploy-validation.csv`: 42/42 PASS (target + 19×2 unicode/encoded redirects + sitemap)
- Production crawl: 1166/1166 checked; links_to_retired=0; broken=0; redirecting=0

## Report files

`docs/batch-12c-collectibles-family-completion/` — README, baseline, family-url-map, production-baseline, content-preservation-map, content-diff, redirect-dependency-map, internal-link-cleanup, sitemap-diff, route-diff, family-completion-validation, rendered-validation, visual-validation, test-results, post-deploy-validation, final-report, source-set-hash
