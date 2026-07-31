# Final report — Batch 3 (pre-merge / implementation)

## Verdict

**PASS WITH WARNING**

Warning reasons:

1. Root cause confirmed at **path + Windows + Astro/Vercel build-done** component level; exact native faulting module not identified.
2. Linux local build `NOT VERIFIED LOCALLY` (Vercel ASCII in-place path expected to be unaffected).

## Finding

| Finding | Status |
| --- | --- |
| F-08 Windows build crash | READY TO CLOSE after merge + production validation |

## SHAs

| Item | SHA |
| --- | --- |
| Base (`origin/main`) | `6c3d0a25877785ff6d4069b8f4267528c422e977` |
| Implementation | _(fill after commit)_ |
| Merge | _(pending)_ |
| Production | _(pending)_ |
| Report-only | _(pending)_ |

## Root cause

Non-ASCII (Thai) characters in the Windows repository absolute path cause Node to abort with `-1073740791` after Astro rearrange, before local sitemap artifacts are written. ASCII physical paths succeed with the same sources and lockfile.

## Fix

- `scripts/windows-safe-astro-build.mjs` — ASCII mirror build on win32 non-ASCII paths
- `package.json` — `build` uses wrapper; `build:astro` keeps unwrapped control; `qa:batch-3-build` added
- `.gitignore` — ignore `.amphon-build-complete` and `.vercel/`
- `scripts/check-batch-3-windows-build.mjs` — artifact/marker regression checks

## Validation snapshot

- Windows builds: 3/3 exit 0
- HTML: 1188
- Sitemap: 1185
- Batch 1 / Batch 2 QA: PASS
- Astro check: 0 errors / 0 warnings
- Output SEO diffs: none intentional

## Remaining findings (unchanged)

F-04, F-05, F-06, F-07, F-09, F-11, F-12, and P3 items remain outside this batch.
