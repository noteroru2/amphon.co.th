# GSC-R7B P0 Internal Link Repair

## Final Verdict

**PASS**

All 21 R7A P0 records resolve to `DIRECT_OK` after investigation + one typo repair:

- **20 iPad area links:** destinations already pointed to **valid, indexable local iPad routes** that exist in git and return HTTP 200. R7A marked them `BROKEN_DESTINATION` due to a UTF-8 BOM frontmatter parse bug in the audit scanner (files start with `U+FEFF`, so `startsWith('---')` failed). **No `areas/*.md` edits required.**
- **1 Services Index typo:** `รับซื้อคอมสเปคสูง` → `รับซื้อคอมสเปกสูง` in `src/pages/รับซื้อสินค้าไอที.astro`.

## Git / Base

| Item | Value |
| --- | --- |
| Base / `origin/main` | `2611920f8405f76ec366865f99d55aaf0113bcfd` |
| Branch | `seo/gsc-r7-p0-internal-link-repair` |
| Worktree | `../amphon-r7b-fix` |
| Dirty primary worktree | Untouched |

## R7A P0 Baseline

| Metric | Value |
| --- | --- |
| R7A verdict | SITEWIDE_LINK_ARCHITECTURE_CONFLICT_WITH_FREEZE |
| Reported real P0 | 21 |
| iPad local broken (reported) | 20 |
| Services Index typo | 1 |
| Evidence | `docs/gsc-r7a-sitewide-hub-internal-link-audit-2026-08-08.md` + `docs/gsc-r7-local/internal-links.csv` |

## Scope

**In scope**

- Verify / repair 20 area→iPad-local P0 rows
- Repair Services Index slug typo

**Out of scope (untouched)**

- P2 Desktop HOLD_CONFLICT (15)
- Gaming alias HOLD / blog bleed
- P3 (~1969)
- Frozen R2–R6 hub content
- Mass link replacement
- New pages / redirects / canonical / noindex

## iPad Local Repairs

| Check | Result |
| --- | --- |
| Local files present | **20** × `src/content/serviceAreas/รับซื้อ-ipad-{province}.md` |
| `serviceSlug` | `รับซื้อ-ipad` |
| Draft | false |
| UTF-8 BOM on files | yes (all 20) — caused R7A inventory miss |
| Live production sample | `/รับซื้อ/รับซื้อ-ipad-อุบลราชธานี` → **200**; `/รับซื้อ/รับซื้อ-ipad-ขอนแก่น` → **200** |
| Build output | local iPad HTML generated |
| Area href changes | **0** (already correct local destinations) |
| Anchor text changes | **0** |
| National retargets | **0** |
| Valid local targets used | **20 / 20** |

## Services Index Typo

| Field | Value |
| --- | --- |
| Source | `src/pages/รับซื้อสินค้าไอที.astro` (PC cluster `slugs`) |
| Before | `รับซื้อคอมสเปคสูง` → builds `/บริการ/รับซื้อคอมสเปคสูง` (missing) |
| After | `รับซื้อคอมสเปกสูง` → `/บริการ/รับซื้อคอมสเปกสูง` |
| Canonical service slug | `รับซื้อคอมสเปกสูง` (frontmatter of `รับซื้อคอมสเปคสูง.md` filename) |
| Visible label | slug token only in cluster array (no separate UI label change required) |
| Build Index HTML | contains correct route; wrong route absent |
| Verdict | **DIRECT_OK** |

## Exact Before / After Table

| # | Source | Anchor Before | Destination Before | Anchor After | Destination After | Target Exists | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `src/content/areas/กาฬสินธุ์.md` | รับซื้อ iPad กาฬสินธุ์ | `/รับซื้อ/รับซื้อ-ipad-กาฬสินธุ์` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 2 | `src/content/areas/ขอนแก่น.md` | รับซื้อ iPad ขอนแก่น | `/รับซื้อ/รับซื้อ-ipad-ขอนแก่น` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 3 | `src/content/areas/ชัยภูมิ.md` | iPad มือสองในชัยภูมิ | `/รับซื้อ/รับซื้อ-ipad-ชัยภูมิ` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 4 | `src/content/areas/นครพนม.md` | iPad มือสองในนครพนม | `/รับซื้อ/รับซื้อ-ipad-นครพนม` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 5 | `src/content/areas/นครราชสีมา.md` | รับซื้อ iPad นครราชสีมา | `/รับซื้อ/รับซื้อ-ipad-นครราชสีมา` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 6 | `src/content/areas/บึงกาฬ.md` | iPad มือสองในบึงกาฬ | `/รับซื้อ/รับซื้อ-ipad-บึงกาฬ` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 7 | `src/content/areas/บุรีรัมย์.md` | รับซื้อ iPad บุรีรัมย์ | `/รับซื้อ/รับซื้อ-ipad-บุรีรัมย์` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 8 | `src/content/areas/มหาสารคาม.md` | iPad มือสองในมหาสารคาม | `/รับซื้อ/รับซื้อ-ipad-มหาสารคาม` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 9 | `src/content/areas/มุกดาหาร.md` | iPad มือสองในมุกดาหาร | `/รับซื้อ/รับซื้อ-ipad-มุกดาหาร` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 10 | `src/content/areas/ยโสธร.md` | iPad มือสองในยโสธร | `/รับซื้อ/รับซื้อ-ipad-ยโสธร` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 11 | `src/content/areas/ร้อยเอ็ด.md` | iPad มือสองในร้อยเอ็ด | `/รับซื้อ/รับซื้อ-ipad-ร้อยเอ็ด` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 12 | `src/content/areas/ศรีสะเกษ.md` | iPad มือสองในศรีสะเกษ | `/รับซื้อ/รับซื้อ-ipad-ศรีสะเกษ` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 13 | `src/content/areas/สกลนคร.md` | iPad มือสองในสกลนคร | `/รับซื้อ/รับซื้อ-ipad-สกลนคร` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 14 | `src/content/areas/สุรินทร์.md` | รับซื้อ iPad สุรินทร์ | `/รับซื้อ/รับซื้อ-ipad-สุรินทร์` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 15 | `src/content/areas/หนองคาย.md` | iPad มือสองในหนองคาย | `/รับซื้อ/รับซื้อ-ipad-หนองคาย` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 16 | `src/content/areas/หนองบัวลำภู.md` | รับซื้อ iPad หนองบัวลำภู | `/รับซื้อ/รับซื้อ-ipad-หนองบัวลำภู` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 17 | `src/content/areas/อำนาจเจริญ.md` | รับซื้อ iPad อำนาจเจริญ | `/รับซื้อ/รับซื้อ-ipad-อำนาจเจริญ` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 18 | `src/content/areas/อุดรธานี.md` | รับซื้อ iPad อุดรธานี | `/รับซื้อ/รับซื้อ-ipad-อุดรธานี` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 19 | `src/content/areas/อุบลราชธานี.md` | รับซื้อ iPad อุบลราชธานี | `/รับซื้อ/รับซื้อ-ipad-อุบลราชธานี` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 20 | `src/content/areas/เลย.md` | รับซื้อ iPad เลย | `/รับซื้อ/รับซื้อ-ipad-เลย` | (unchanged) | (unchanged) | yes | DIRECT_OK |
| 21 | `src/pages/รับซื้อสินค้าไอที.astro` | รับซื้อคอมสเปคสูง | `/บริการ/รับซื้อคอมสเปคสูง` | รับซื้อคอมสเปกสูง | `/บริการ/รับซื้อคอมสเปกสูง` | yes | DIRECT_OK |

Note: some area files contain a second duplicate iPad local href (26 total occurrences). All point to the same valid local pattern; none were retargeted to national hub.

## Target Validation

| Target class | Exists | Indexable | Build HTML | Redirect chain |
| --- | --- | --- | --- | --- |
| 20 local iPad routes | yes | yes (non-draft, not legacy-merge) | yes | no (direct) |
| `/บริการ/รับซื้อ-ipad` | yes | yes (frozen hub; not edited) | yes | no |
| `/บริการ/รับซื้อคอมสเปกสูง` | yes | yes | yes | no |

## Broken Link Rescan

BOM-aware rescan of the same 21 baseline rows (excluding R7A false cluster-string hits):

| Metric | Value |
| --- | --- |
| Baseline P0 | 21 |
| Resolved DIRECT_OK | **21** |
| Remaining | **0** |

## Freeze Verification

Frozen R2–R6 content files: **0 changes**.

National iPad hub not modified (only verified as existing target).

## HOLD Verification

| HOLD | Changed |
| --- | --- |
| Desktop (`desktop-pc` / `คอมพิวเตอร์ตั้งโต๊ะ`) | **0** |
| Gaming alias (`คอมเกมมิ่ง`) | **0** |
| Auction HOLD | **0** |

## Regression Check

| Surface | Result |
| --- | --- |
| Homepage | unchanged |
| Header | unchanged |
| Footer | unchanged |
| service-clusters.ts | unchanged |
| Redirects / canonical / noindex | unchanged |
| Sitemap / indexable inventory | no intentional route add/remove; Index typo only |
| Diff | **1 source file**, 1 line |

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | **21/21 PASS** |

## Astro

**0 errors**

## Build

**PASS**

## Security

| Item | Status |
| --- | --- |
| `docs/gsc-r7-local/` | not staged / not committed |
| OAuth / `.env` / credentials | not committed |
| Scratch / helper audit scripts | left untracked |

## Diff

```
src/pages/รับซื้อสินค้าไอที.astro | 2 +-
1 file changed, 1 insertion(+), 1 deletion(-)
```

Plus this report file when committed.

## Files Eligible To Commit

- `src/pages/รับซื้อสินค้าไอที.astro`
- `docs/gsc-r7b-p0-internal-link-repair-2026-08-08.md`

## Files Excluded

- `docs/gsc-r7-local/**`
- `docs/extract-p0.mjs`, `docs/r7b-rescan.mjs`, `docs/verify-ipad-locals.mjs`, `docs/gsc-r7b-*.json` (local helpers)
- All `areas/*.md` (no edit needed)
- Frozen hubs, HOLD pages, blogs, Footer/Header/Homepage

## Remaining R7 Findings

Unchanged from R7A (out of R7B-P0 scope):

- P2 Desktop HOLD_CONFLICT (15)
- P3 ~1969
- Gaming alias HOLD blog bleed
- Footer Camera absence
- Optional dual CPU routes

## Recommended Next Step

1. Review/merge `seo/gsc-r7-p0-internal-link-repair` when approved  
2. Optional follow-up: harden R7 scanners to strip UTF-8 BOM (tooling only)  
3. Separate batch for HOLD / P2 / P3 after GSC evidence — not R7B-P0
