# AMPHON SEO — Evidence-first remaining content review (2026-11-18)

## Baseline and source of truth
- GitHub repo: `noteroru2/amphon.co.th`; frozen starting `main` SHA `f3f91b804432c9b56542db38d70547f657cd54de`.
- Full GitHub Actions audit: [run 42953426790](https://github.com/noteroru2/amphon.co.th/actions/runs/42953426790), artifact `service-area-audit-921` (artifact ID 13825583350), from 2026-11-11. This is **pre-edit**, not a new full build audit.
- 1,020 service-area source files; 921 rendered/indexable URLs; 99 existing exclusions.
- **52 `FEW_FAQ`** (fewer than three frontmatter FAQ entries); **57 `SHORT_AND_SIMILAR`** (source chars under 3,200 and sibling similarity >= 0.75); **16 `SHORT_CONTENT`** (under 1,700 source characters); **10 `FEW_SECTIONS`**. The categories overlap: `FEW_FAQ ∩ SHORT_AND_SIMILAR = 2`; `FEW_FAQ ∩ SHORT_CONTENT = 12`; `SHORT_AND_SIMILAR ∩ SHORT_CONTENT = 2`.
- `SIBLING_SIMILARITY_HEURISTIC` threshold >= 0.87 had **0** flagged URLs in this snapshot. This is not Google ranking evidence. `NO_STORE_LOCATION_DISCLOSURE` 640 is source-only; shared rendered layout previously passed 921/921, so do not blindly add duplicate footer text to 640 sources.

## Review lanes (do not treat FAQ quantity as a ranking factor)

| Lane | Pages | Review rule |
| --- | ---: | --- |
| A — short AND similar | 57 | Prioritize real technical decision differences; avoid province-swapped paragraphs |
| B — too little source content | 16 | Verify actual demand and operational scope; improve only where genuine expertise can help |
| C — few FAQs | 52 | Add or replace FAQs ONLY when genuine seller questions are missing; do not add filler to clear the flag |
| D — few H2 sections | 10 | Review information architecture, not arbitrary section count |

### Exact `FEW_FAQ` queue by family (52)
- Server (5): นครราชสีมา, บุรีรัมย์, มหาสารคาม, ร้อยเอ็ด, อุดรธานี.
- UPS (9): ขอนแก่น, ชัยภูมิ, นครราชสีมา, บุรีรัมย์, มหาสารคาม, มุกดาหาร, ยโสธร, สกลนคร, อุดรธานี.
- TV (8): กาฬสินธุ์, นครราชสีมา, บึงกาฬ, บุรีรัมย์, ศรีสะเกษ, สกลนคร, สุรินทร์, อุดรธานี.
- Network (5): ขอนแก่น, ยโสธร, ร้อยเอ็ด, สุรินทร์, อุดรธานี.
- Appliances (17): กาฬสินธุ์, ขอนแก่น, ชัยภูมิ, นครพนม, บึงกาฬ, บุรีรัมย์, มหาสารคาม, มุกดาหาร, ยโสธร, ร้อยเอ็ด, ศรีสะเกษ, สุรินทร์, หนองคาย, หนองบัวลำภู, อำนาจเจริญ, อุดรธานี, เลย.
- Furniture (6): กาฬสินธุ์, ขอนแก่น, ร้อยเอ็ด, สุรินทร์, หนองคาย, อุดรธานี.
- Auction/asset disposal (2): ชัยภูมิ, อุบลราชธานี.

### `SHORT_AND_SIMILAR` family queue (57)
Drone 13, Auction/asset disposal 13, Furniture 10, TV 7, Server 5, UPS 5, Network 2, Appliances 2. See original CSV artifact for exact URLs, nearest sibling and similarity. Do not claim that absence of a GSC row means zero demand.

## Phase 1: four controlled rewritten examples in this branch
1. `/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-ขอนแก่น`: company asset register, title/authority to sell, data erasure, pickup/decommissioning terms.
2. `/รับซื้อ/รับซื้อโดรน-มหาสารคาม`: model+remote match, account status, crash evidence, battery/shipping safety.
3. `/รับซื้อ/รับซื้อเฟอร์นิเจอร์-นครราชสีมา`: office/IT furniture inventory, dimensions, building access, dismantling costs.
4. `/รับซื้อ/รับซื้อทีวี-ขอนแก่น`: display panel condition checks, OLED burn-in, Smart TV accounts, fragile shipping.

These four examples were chosen to cover problem families, **not** because they are the complete set of 52 `FEW_FAQ` pages; the original report actually flags auction-Khon Kaen, furniture-Korat and TV-Khon Kaen as `SHORT_AND_SIMILAR`, while drone-Maha Sarakham is not flagged by that threshold but contained repeated template paragraphs.

### GSC evidence checked on 2026-11-18 (FINAL 2026-10-18 to 2026-11-14)
**Important page-filter normalization:** GSC rows store Thai URL paths percent-encoded. The first requests passed unencoded Thai URLs as exact page filters and incorrectly showed zeros; re-querying the encoded exact canonical URLs produced the corrected figures below. Always use the actual percent-encoded `keys[0]` from `dimensions:["page"]` or normalize both sides before joining.

| Candidate URL suffix | Clicks | Impressions | Avg position | Corrected receipt |
| --- | ---: | ---: | ---: | --- |
| `รับเหมาประมูลอุปกรณ์ไอที-ขอนแก่น` | 0 | 0 reported | — | `5fad825e-51af-4127-adf0-7ee51a76ac06` |
| `รับซื้อโดรน-มหาสารคาม` | 0 | **4** | 6.5 | `91de4e9c-4b30-417d-90fc-36b202be4116` |
| `รับซื้อเฟอร์นิเจอร์-นครราชสีมา` | 0 | **1** | 19.0 | `7c06beb8-3b01-4813-8fe3-18c0bdfeb9e4` |
| `รับซื้อทีวี-ขอนแก่น` | 0 | 0 reported | — | `57d1ac30-236e-4374-aa85-f2358db5a2f0` |

Neither zero reported impressions nor omitted GSC rows prove no demand. No URL should be deleted/noindexed based on these samples.

### Traffic to protect before next batch
Final site-scoped GSC `dimensions:["page"]`, 663 returned URL rows for the same 28-day window; receipt `bfbce03a-1b09-4b8e-8e43-b342f0e1e9ab`. Selected `FEW_FAQ` URLs with **real clicks**:
- `รับซื้อเครื่องใช้ไฟฟ้า-อุดรธานี`: **43 clicks / 474 impressions**
- `รับซื้อเครื่องใช้ไฟฟ้า-ร้อยเอ็ด`: **37 / 339**
- `รับซื้อเครื่องใช้ไฟฟ้า-ขอนแก่น`: **34 / 554**
- `รับซื้อทีวี-อุดรธานี`: **17 / 152**
- `รับซื้อเฟอร์นิเจอร์-อุดรธานี`: **13 / 153**
- `รับซื้อทีวี-ศรีสะเกษ`: **8 / 78**
These must receive conservative, human-reviewed corrections first, with before/after screenshots, unchanged query intent, and complete rollback. **Do not add filler FAQs to high-performing pages.**

## Editorial rules (required for all following batches)
1. Never fabricate purchased items, company contracts, official auction participation, province branches, warranties, local pickup coverage, customer quotes, receipts or fixed cash offers.
2. Store fact: one physical storefront in Ubon Ratchathani, 740/8 Chayangkun Road near Soi 32; 09:00–19:00 opening; LINE @webuy can accept messages 24h with staff response in queue.
3. Distinguish **seller's verified observations**, **unverified seller claims**, **condition not tested**, and **real AMPHON historical evidence**. Only label an actual deal example if a documented, approved transaction can be checked without personal data exposure.
4. Retain existing slug, page owner, canonical, indexability, sitemap presence, internal links and locally useful purpose absent separate GSC+link decision.
5. No keyword stuffing, province-name substitution, arbitrary FAQ quotas, duplicated generic inspection sentences, synthetic photos, or JSON-LD review/rating claims.
6. QA with `npm ci`, source/SEO validation, build, sample rendered title/H1/canonical/robots/sitemap/CTA, and the 921-page truth check. Deploy only a reviewed exact SHA, measure GSC FINAL 7/14/28 days after confirmed release, plus qualified buy-in leads.

## CI reproducibility finding (2026-11-18)
- The earlier workflow run [#44270795513](https://github.com/noteroru2/amphon.co.th/actions/runs/44270795513) passed, **but was not a clean exact-commit check**: the old `issue50-pair-guides.cjs --export` and `issue50-thin-guides.cjs --export` commands write tracked Markdown before `npm run build`. Consequently its uploaded CSV counts were based on regenerated files, not only this branch's committed edits. **Do not use that run as final release evidence.**
- This PR now removes those two *write-producing generator invocations from the PR audit workflow only* and adds `git diff --exit-code -- src/content/serviceAreas` guards before and after build. The unchanged generator scripts remain in the repository; no production workflow or Worker is modified until this PR is reviewed.
- Run the corrected workflow again on the final tested SHA and use only its artifact for before/after findings; no production deploy/merge implied.

## Next evidence requirements / blockers
- Original service parent pages `รับซื้อเฟอร์นิเจอร์.md` and `รับซื้อทีวี.md` contain broad pickup promises that may conflict with the conditional provincial guidance. **Review and correct these parent claims in a separately scoped P0 PR before treating the cluster as verified.**
- Inspect operational coverage and actual past lots before making first-hand experience claims. Ownership/transport verification from staff or the AMPHON System should remain private.
- The four rewritten sources are **draft content changes**, not evidence of a currently deployed production release. Await CI and rendered preview review, then owner release approval.
