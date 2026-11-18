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
All four exact filtered URLs returned 0 reported clicks and 0 reported impressions. **This is not proof of no demand** and is not a license to delete/noindex.
- Auction Khon Kaen receipt: `6a4f2063-f5cd-47dd-b0b4-b84938e4925e`.
- Drone Maha Sarakham receipt: `cdd08959-4d0d-4b60-804b-d5b3ac97fbea`.
- Furniture Korat receipt: `f7987a55-5af8-48b4-b080-71308915835a`.
- TV Khon Kaen receipt: `35ed2055-1760-46f4-995f-d24764e88175`.

## Editorial rules (required for all following batches)
1. Never fabricate purchased items, company contracts, official auction participation, province branches, warranties, local pickup coverage, customer quotes, receipts or fixed cash offers.
2. Store fact: one physical storefront in Ubon Ratchathani, 740/8 Chayangkun Road near Soi 32; 09:00–19:00 opening; LINE @webuy can accept messages 24h with staff response in queue.
3. Distinguish **seller's verified observations**, **unverified seller claims**, **condition not tested**, and **real AMPHON historical evidence**. Only label an actual deal example if a documented, approved transaction can be checked without personal data exposure.
4. Retain existing slug, page owner, canonical, indexability, sitemap presence, internal links and locally useful purpose absent separate GSC+link decision.
5. No keyword stuffing, province-name substitution, arbitrary FAQ quotas, duplicated generic inspection sentences, synthetic photos, or JSON-LD review/rating claims.
6. QA with `npm ci`, source/SEO validation, build, sample rendered title/H1/canonical/robots/sitemap/CTA, and the 921-page truth check. Deploy only a reviewed exact SHA, measure GSC FINAL 7/14/28 days after confirmed release, plus qualified buy-in leads.

## Next evidence requirements / blockers
- Original service parent pages `รับซื้อเฟอร์นิเจอร์.md` and `รับซื้อทีวี.md` contain broad pickup promises that may conflict with the conditional provincial guidance. **Review and correct these parent claims in a separately scoped P0 PR before treating the cluster as verified.**
- Inspect operational coverage and actual past lots before making first-hand experience claims. Ownership/transport verification from staff or the AMPHON System should remain private.
- The four rewritten sources are **draft content changes**, not evidence of a currently deployed production release. Await CI and rendered preview review, then owner release approval.
