# GSC-R7C P0 Internal Link Production Release

## Final Verdict

**PASS**

Services Index typo is live on production. Twenty R7A iPad “broken” candidates remain validated as **UTF-8 BOM scanner false positives** (no area edits). Actual production defect count: **1 fixed, 0 remaining**.

## Git

| Item | Value |
| --- | --- |
| Source branch | `seo/gsc-r7-p0-internal-link-repair` |
| Base SHA | `2611920f8405f76ec366865f99d55aaf0113bcfd` |
| Implementation SHA | `4a4c693e08a52953b0d71a596fb97baa027b5840` |
| Main before merge | `2611920f8405f76ec366865f99d55aaf0113bcfd` |
| Merge SHA | `a3fcba7c86609074c413b2ca097a8b259880ce83` |
| Content / deploy SHA | `a3fcba7c86609074c413b2ca097a8b259880ce83` |
| Final main SHA | tip after docs commits (Content/deploy remains `a3fcba7c86609074c413b2ca097a8b259880ce83`) |

Merge message: `merge: release R7 P0 internal link repair`

Release worktree: `../amphon-r7c-release` (clean; primary dirty helpers left untouched).

## Source Branch

Verified `origin/seo/gsc-r7-p0-internal-link-repair` = `4a4c693…` before merge.

Diff vs base (exact 2 files):

- `src/pages/รับซื้อสินค้าไอที.astro`
- `docs/gsc-r7b-p0-internal-link-repair-2026-08-08.md`

## Base SHA

`2611920f8405f76ec366865f99d55aaf0113bcfd`

## Implementation SHA

`4a4c693e08a52953b0d71a596fb97baa027b5840`

## Main Before Merge

`2611920f8405f76ec366865f99d55aaf0113bcfd` (equal to base; no intervening main commits)

## Merge SHA

`a3fcba7c86609074c413b2ca097a8b259880ce83`

## Content / Deploy SHA

`a3fcba7c86609074c413b2ca097a8b259880ce83` — Vercel Production deploy triggered by this merge on `main`.

## Final Main SHA

Docs commits on `main` after Ready; Content/deploy SHA remains `a3fcba7c86609074c413b2ca097a8b259880ce83`.

## R7A Candidate Correction

| Metric | Value |
| --- | --- |
| R7A candidates | **21** |
| Validated false positives | **20** |
| Real defects | **1** |
| Real defects fixed | **1** |
| Real defects remaining | **0** |

**Do not say:** “21 production links were fixed.”

**Correct wording:** R7A flagged 21 potential P0 records; R7B validated 20 as scanner false positives; 1 real Services Index route typo was fixed and released.

## UTF-8 BOM False Positive Analysis

Twenty `src/content/serviceAreas/รับซื้อ-ipad-{province}.md` files begin with UTF-8 BOM (`U+FEFF`). R7A route inventory used `startsWith('---')` without stripping BOM → locals omitted from inventory → area links to those locals flagged `BROKEN_DESTINATION`.

Reality:

- Files exist, git-tracked, non-draft, `serviceSlug: รับซื้อ-ipad`
- Build generates HTML
- Live HTTP **200** for all 20

## Actual Production Change

One source edit only:

`src/pages/รับซื้อสินค้าไอที.astro` PC cluster slug:

- before: `รับซื้อคอมสเปคสูง`
- after: `รับซื้อคอมสเปกสูง`

## Services Index Fix

| Check | Result |
| --- | --- |
| Live URL | `https://amphon.co.th/รับซื้อสินค้าไอที` |
| HTTP | **200** |
| Canonical | `https://amphon.co.th/รับซื้อสินค้าไอที` |
| Wrong href `/บริการ/รับซื้อคอมสเปคสูง` | **absent** |
| Correct href `/บริการ/รับซื้อคอมสเปกสูง` | **present** |
| Target live | `https://amphon.co.th/บริการ/รับซื้อคอมสเปกสูง` → **200**, self-canonical, indexable, H1 present, no redirect |

## iPad Local Validation

| Metric | Value |
| --- | --- |
| IPAD_LOCAL_FALSE_POSITIVES | **20** |
| IPAD_AREA_SOURCE_EDITS | **0** |
| IPAD_RETARGETS | **0** |
| IPAD_ANCHOR_CHANGES | **0** |
| Live HEAD 200 | **20/20** |
| Build HTML | **20/20** |

## Frozen Page Verification

Frozen R2–R6 pages in merge diff: **0**

## HOLD Verification

| Item | Changes |
| --- | --- |
| Desktop HOLD | **0** |
| Gaming HOLD / alias | **0** |
| P3 fixes | **0** |

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | **21/21 PASS** |

## Astro

**0 errors**

## Build

**PASS**

## Broken Link Rescan

BOM-aware validation (build + live):

| Class | Count |
| --- | --- |
| TRUE_BROKEN_DESTINATIONS (R7A real defect remaining) | **0** |
| SCANNER_FALSE_POSITIVES (iPad locals) | **20** (confirmed valid) |

## Sitemap

- `/บริการ/รับซื้อคอมสเปกสูง` present (intended)
- `/บริการ/รับซื้อคอมสเปคสูง` **not** in sitemap
- Wrong typo route never belonged as a real page

## Lighthouse

| Page | SEO |
| --- | --- |
| Services Index `/รับซื้อสินค้าไอที` | **1.0** (no critical fails) |
| `/บริการ/รับซื้อคอมสเปกสูง` | **1.0** (no critical fails) |

## Security

| Item | Committed |
| --- | --- |
| GSC CSV / `docs/gsc-r7-local/` | **0** |
| OAuth / tokens / `.env` | **0** |
| Scratch / local helper scripts | **0** (untracked only) |

## Production Verification

| Item | Value |
| --- | --- |
| Deployment ID | `dpl_3jN8FZriAuMByKLnZYPEAx2vTRCf` |
| Deployment URL | https://amphon-co-lr688rbc0-amphons-projects-bb1ec3bf.vercel.app |
| Status | **Ready** |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, project + git-main |
| Content / deploy SHA | `a3fcba7c86609074c413b2ca097a8b259880ce83` |

## Final Confirmation

- Merged R7B into `main` and pushed
- Production **Ready** on `amphon.co.th`
- Actual fix: Services Index typo only
- iPad area sources unchanged (false positives)
- Frozen / HOLD / P3 untouched
- No content rewrite, no mass link replacement
- No GSC/OAuth/CSV committed
- Docs report committed separately after Ready
