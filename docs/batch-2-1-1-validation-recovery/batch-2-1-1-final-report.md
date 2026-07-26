# Batch 2.1.1 MacBook Validation Recovery — Final Report

## Executive Summary

- Verdict: **PASS WITH WARNING**
- Readiness for Batch 2.2: **READY**
- Branch: `batch-2-1-1-validation-recovery`
- Starting SHA: `aba75eebac2e9d4b3a4d05d0a9bb281ca45da669`
- Batch 2.1 commit: `aba75ee`
- Final SHA: see the commit containing this report; omitted here to avoid a self-referential commit hash
- Astro errors before: 1
- Astro errors after: 0
- Build exit before: `-1073740791`
- Build exit after: 0
- Sitemap files before: 0
- Sitemap files after: 2
- Sitemap URLs parsed: 1,179
- MacBook URLs checked: 14
- MacBook broken links: 0
- Source/config/QA files changed: 6
- Contract/recovery reports created: 13
- Dependency changes: 0
- Lockfile changed: No
- Merge: No
- Deploy: No

## Root Cause: Astro Check

`createFAQSchema()` can return `null`. The original `.filter(Boolean)` did not narrow the element type for TypeScript, leaving an array incompatible with `Record<string, unknown>[]`. The fix narrows the nullable value before array construction and does not change rendered FAQ schema.

## Root Cause: Build Crash

The crash happens after prerender and asset rearrangement but before Vercel function bundling and sitemap finalization when the Windows working path contains Thai characters. The same source, lockfile and dependency versions build with exit 0 from an ASCII-only detached worktree.

The triggering path condition is confirmed. The exact native binary is **Unconfirmed**; there is no JavaScript stack, stderr detail or Windows event naming the component.

## Root Cause: Sitemap Not Found

There were two independent causes:

1. The native process terminated before `@astrojs/sitemap` finalized its artifacts.
2. QA helpers treated `dist` as the public root, while the Vercel adapter places public files under `dist/client`.

The recovery resolves `dist/client` when present, makes zero sitemap files a hard QA failure, and excludes one existing redirect-source route from the sitemap. Final sitemap QA parses 1,179 canonical/indexable URLs and exits 0.

## Batch 2.1 Regression Validation

All 14 Batch 2.1 routes—including the MacBook Hub and seller guide—exist, are present in sitemap, are indexable, self-canonical, have one H1, contain valid JSON-LD graph output, and have zero broken internal links.

No MacBook content was edited in this recovery.

## Report Contract Alignment

Original reports remain in place. Standard-name reports were added:

- `batch-2-1-page-query-map-after.csv`
- `batch-2-1-internal-links-before-after.csv`
- `batch-2-1-files-changed.csv`
- `batch-2-1-qa-report.md`
- `batch-2-1-final-report.md`

The existing `batch-2-1-baseline.md` already matched the contract.

## Files Preserved

The pre-existing untracked groups below were not changed, removed or staged:

- `docs/batch-2-macbook-cannibalization-audit/`
- `scratch/`
- `sitewide-deep-audit.md`
- `verify_production_results.json`

## Warnings

Full-site QA exposes 17 pre-existing non-MacBook broken links, one forbidden iPad article with two H1 elements, and one unrelated claim-risk match. These were not hidden or rewritten because doing so would violate the recovery scope.

## Batch 2.2 Gate

**READY — Batch 2.2 may proceed.**

The Batch 2.1 technical gate and target regression pass. The unrelated full-site issues remain explicitly recorded for a separately authorized cleanup.
