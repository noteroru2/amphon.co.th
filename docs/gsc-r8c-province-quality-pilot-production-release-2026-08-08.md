# GSC-R8C Province Quality Pilot Production Release

**Date:** 2026-08-08  
**Mode:** VERIFY / MERGE / PUSH / DEPLOY / PRODUCTION QA  
**Content rewrite:** none

## Final Verdict

**PASS_WITH_WARNING**

All five R8B pilots are live on `amphon.co.th` with clean trust, Ubon-only NAP schema, indexability unchanged, R2 Khon Kaen hub frozen/unedited, and Lighthouse SEO 1.0. Accepted warning remains limited hub pairwise similarity improvement (Hatyai/Phuket) from R8B — not a release blocker and not rewritten in R8C.

## Git

| Item | Value |
|---|---|
| Source branch | `seo/gsc-r8-province-quality-pilot` |
| Base SHA | `9b3301c6f3a375664e2b7030b76044100d2be8a0` |
| Content commit | `2c83f2fc8b29e4fc90fde8a7bc7406e07b715964` |
| Branch tip | `89c0ea6efbef2aae7d24dd6c63a71273ef0bfb18` |
| Main before merge | `9b3301c6f3a375664e2b7030b76044100d2be8a0` |
| Merge SHA | `0c93ddf37d5bc600c48cd5cdaf5d8a42cc55d477` |
| Content / deploy SHA | `0c93ddf37d5bc600c48cd5cdaf5d8a42cc55d477` |
| Final main SHA | *(after docs-only commit)* |

Release performed in clean worktree `../amphon-r8c-release` because main worktree had unrelated dirty files (left untouched).

## Source Branch

`seo/gsc-r8-province-quality-pilot` tip matched expected `89c0ea6`. Diff vs base:

- 5 pilot content sources
- `docs/gsc-r8b-province-quality-pilot-2026-08-08.md`

No mass province/template/national/frozen/GSC artifacts in merge.

## Base SHA

`9b3301c6f3a375664e2b7030b76044100d2be8a0` (= `origin/main` at merge time)

## Content Commit

`2c83f2fc8b29e4fc90fde8a7bc7406e07b715964` — `content: pilot differentiated province service pages`

## Branch Tip

`89c0ea6efbef2aae7d24dd6c63a71273ef0bfb18` — includes R8B report SHA note

## Main Before Merge

`9b3301c6f3a375664e2b7030b76044100d2be8a0`

## Merge SHA

`0c93ddf37d5bc600c48cd5cdaf5d8a42cc55d477`  
Message: `merge: release R8 province quality pilot`

## Content / Deploy SHA

`0c93ddf37d5bc600c48cd5cdaf5d8a42cc55d477`

## Final Main SHA

Recorded after docs-only commit in this file’s Git table update / final response.

## Pilot Scope

| # | Route | Source | Role |
|---|---|---|---|
| 1 | `/พื้นที่ให้บริการ/หาดใหญ่` | `src/content/areas/หาดใหญ่.md` | CITY_SERVICE_AREA_HUB |
| 2 | `/พื้นที่ให้บริการ/ภูเก็ต` | `src/content/areas/ภูเก็ต.md` | PROVINCE_SERVICE_AREA_HUB |
| 3 | `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น` | `src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-ขอนแก่น.md` | NOTEBOOK_PROVINCE |
| 4 | `/รับซื้อ/รับซื้อคอมพิวเตอร์-ขอนแก่น` | `src/content/serviceAreas/รับซื้อคอมพิวเตอร์-ขอนแก่น.md` | COMPUTER_PROVINCE |
| 5 | `/รับซื้อ/รับซื้ออุปกรณ์-network-กาฬสินธุ์` | `src/content/serviceAreas/รับซื้ออุปกรณ์-network-กาฬสินธุ์.md` | NETWORK_PROVINCE |

## Hatyai

Live **200**, self-canonical, indexable.  
Title/H1 distinguish city in Songkhla. No `จังหวัดหาดใหญ่`. Ubon storefront explicit. SEO Lighthouse **1.0**.

## Phuket

Live **200**, self-canonical, indexable.  
Province service-area hub; no Phuket branch/storefront claim. Ubon NAP in schema. SEO Lighthouse **1.0**.

## Notebook Khon Kaen

Live **200**, self-canonical, indexable.  
Notebook + geo intent; body/layout path to `/บริการ/รับซื้อโน๊ตบุ๊ค`. SEO Lighthouse **1.0**.

## Computer Khon Kaen

Live **200**, self-canonical, indexable.  
Computer + geo; specialist context links to computer/gaming/custom/company paths. Does not replace national computer hub.

## Network Kalasin

Live **200**, self-canonical, indexable.  
Switch/Router/Firewall/AP/PoE/Part Number/License context present. Links to `/บริการ/รับซื้ออุปกรณ์-network` and `/บริการ/รับซื้อ-server-network` (URL-encoded in HTML). SEO Lighthouse **1.0**.

## R2 Freeze Verification

| Check | Result |
|---|---|
| Frozen URL | `/พื้นที่ให้บริการ/ขอนแก่น` |
| Frozen source | `src/content/areas/ขอนแก่น.md` |
| Diff in R8B/R8C | **0** |
| Source hash vs base `9b3301c` | **unchanged** |
| Live Title/H1 | Matches R2 release wording |
| R2_FROZEN_REGRESSION | **0** |

## Local Trust

| Check | Result |
|---|---|
| FALSE_BRANCH | **0** |
| FALSE_LOCAL_ADDRESS | **0** |
| MISLEADING_PICKUP_GUARANTEE | **0** |
| Non-Ubon posture | SERVICE_AREA_ONLY |

## Local Address

Schema + visible references use:

`740/8 ถนนชยางกูร` · `addressRegion: อุบลราชธานี` only.

## Schema

Present types include Organization, LocalBusiness/ProfessionalService, WebSite, WebPage, BreadcrumbList, Service/Place/FAQ as applicable.  
LocalBusiness address = Ubon only. No province-specific branch NAP/geo/phone/hours invented.

## Internal Linking

- Hubs → selected national notebook/computer/(corporate for Phuket) paths  
- Notebook local → National Notebook Hub  
- Computer local → National Computer Hub (+ specialists)  
- Network local → Network + Server/Network specialist paths  
- No mass cross-province dumps added in R8C

## Cannibalization Guardrail

Local pilots retain geo intent and uplink to national hubs; no evidence of attempting to replace national notebook/computer hubs.

## Similarity Baselines

Recorded from R8B (no rewrite in R8C):

| Page | Baseline |
|---|---|
| Hatyai | 0.851 |
| Phuket | 0.896 |
| Notebook Khon Kaen | 0.304 |
| Computer Khon Kaen | 0.304 |
| Network Kalasin vs Khon Kaen prior | 0.453 |

## Tests

| Check | Pre-merge | Post-merge |
|---|---|---|
| `npm run test` | NOT_CONFIGURED | NOT_CONFIGURED |
| `test:google-reviews` | 21/21 | 21/21 |
| `astro check` | 0 errors | 0 errors |
| `build` | PASS | PASS |

## Astro

0 errors (hints only, pre-existing).

## Build

PASS (windows-safe Astro build).

## Broken Links

0 confirmed on pilot routes (live 200, national uplinks present).

## Sitemap

All 5 pilots appear **exactly once** in production sitemap inventory check; HTTP 200; self-canonical.

## Lighthouse

| URL | SEO |
|---|---|
| Hatyai | **1.0** |
| Phuket | **1.0** |
| Notebook Khon Kaen | **1.0** |
| Network Kalasin | **1.0** |

No critical SEO failures. Performance not a blocker.

## Security

| Item | In merge/deploy commit |
|---|---|
| `docs/gsc-r8-local/` | **0** (excluded/untracked) |
| GSC CSV / OAuth / tokens / `.env` | **0** |
| Scratch / credentials | **0** |

## Production Verification

| Item | Value |
|---|---|
| Deployment ID | `dpl_GL9ZxNZ4L3psdXYJdVtTTRCh8nPz` |
| Deployment URL | https://amphon-co-8zqb51fyx-amphons-projects-bb1ec3bf.vercel.app |
| Status | **Ready** |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, project + git-main |
| Content / deploy SHA | `0c93ddf37d5bc600c48cd5cdaf5d8a42cc55d477` |

Live pilots: 5/5 HTTP 200, indexable, H1=1, self-canonical, trust clean.

## Final Confirmation

- MERGED into `main` and PUSHED  
- PRODUCTION READY on `amphon.co.th`  
- NO MASS PROVINCE EDIT  
- NO NOINDEX / NO REDIRECT / NO CANONICAL CHANGE  
- NO FROZEN PAGE EDIT  
- NO GSC/OAUTH/CSV COMMITTED  
- Template family expansion **not** applied (observe pilot first)
