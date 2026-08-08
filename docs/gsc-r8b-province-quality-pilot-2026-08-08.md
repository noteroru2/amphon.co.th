# GSC-R8B Province Quality Pilot

**Date:** 2026-08-08  
**Mode:** PILOT CONTENT IMPROVEMENT — NO MASS EDIT / NO MERGE / NO DEPLOY

## Final Verdict

**PASS_WITH_WARNING**

Five selected pilots improved materially on local trust wording, service-specific workflows, and cross-page differentiation. Service×province pilots show large similarity drops. Hub pilots (หาดใหญ่ / ภูเก็ต) gain clearer city-vs-province roles and Ubon-only storefront wording, but pairwise similarity vs sibling long-form hubs remains high because most body sections were retained. No fake local presence, frozen R2 page untouched, routes/slugs unchanged, build and schema checks pass.

## Git

| Item | Value |
|---|---|
| Base | `origin/main` = `9b3301c6f3a375664e2b7030b76044100d2be8a0` |
| Branch | `seo/gsc-r8-province-quality-pilot` |
| Worktree | `../amphon-r8b-pilot` |
| Commit | `2c83f2fc8b29e4fc90fde8a7bc7406e07b715964` |
| Push | `origin/seo/gsc-r8-province-quality-pilot` — not merged, not deployed |

## Pilot Selection

| Role | Route | Source | Selected from |
|---|---|---|---|
| CITY_HUB_PILOT | `/พื้นที่ให้บริการ/หาดใหญ่` | `src/content/areas/หาดใหญ่.md` | R8A candidate A |
| PROVINCE_HUB_PILOT | `/พื้นที่ให้บริการ/ภูเก็ต` | `src/content/areas/ภูเก็ต.md` | R8A candidate B |
| NOTEBOOK_PROVINCE_PILOT | `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น` | `src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-ขอนแก่น.md` | R8A candidate C |
| COMPUTER_PROVINCE_PILOT | `/รับซื้อ/รับซื้อคอมพิวเตอร์-ขอนแก่น` | `src/content/serviceAreas/รับซื้อคอมพิวเตอร์-ขอนแก่น.md` | R8A candidate D |
| THIN_DUPLICATE_FAMILY_PILOT | `/รับซื้อ/รับซื้ออุปกรณ์-network-กาฬสินธุ์` | `src/content/serviceAreas/รับซื้ออุปกรณ์-network-กาฬสินธุ์.md` | R8A candidate E |

## Freeze Verification

| Check | Result |
|---|---|
| R2 Khon Kaen exact URL | `/พื้นที่ให้บริการ/ขอนแก่น` |
| R2 Khon Kaen exact source | `src/content/areas/ขอนแก่น.md` |
| Candidate C/D conflict with R2? | **No** — C/D are serviceArea pages, not the R2 area hub |
| Frozen edits | **0** |
| SKIP_FROZEN | Not required |

R2 also covered national RAM / Mac mini — neither is in this pilot set. R3–R6 national cores untouched.

## Hatyai

- Role: CITY_SERVICE_AREA_HUB (เมืองในจังหวัดสงขลา — not a province)
- Title/H1 differentiated; removed “ใกล้ฉัน” keyword
- Explicit city acknowledgment + single-vs-bulk workflow block
- Trust: Ubon storefront only; no branch language as offering
- National uplinks: notebook + computer hubs retained/added in intro CTA

## Phuket

- Role: PROVINCE_SERVICE_AREA_HUB
- Differentiated from Hatyai via province/island logistics + hotel/villa/org pathways
- Removed “ใกล้ฉัน”; clarified no guaranteed pickup
- Trust wording aligned to Ubon-only storefront
- Uplink to notebook, computer, corporate hubs

## Notebook Province

- Full rewrite for notebook-specific inspection (battery, adapter, hinge, MDM)
- Individual vs bulk/company pathways
- Body uplink to `/บริการ/รับซื้อโน๊ตบุ๊ค` (+ specialist notebook routes where natural)
- Does not attempt to replace national notebook hub

## Computer Province

- Distinct structure from notebook: branded / custom / gaming / office / bulk transport
- Heavy-equipment logistics constraints
- Links to computer, gaming, custom, company, office hubs as context — not keyword stuffing dump

## Network Kalasin

- Expanded thin template into Switch/Router/Firewall/AP/PoE/SFP/License workflows
- Similarity vs network-ขอนแก่น: **0.919 → 0.453**
- Uplink to `/บริการ/รับซื้ออุปกรณ์-network` and `/บริการ/รับซื้อ-server-network`
- No local network expertise / branch claim

## Local Trust

| Check | Result |
|---|---|
| False branch claims | **0** |
| False local addresses | **0** |
| Ambiguous “มีหน้าร้านจริงที่ตรวจสอบได้” on pilots | Removed / replaced with Ubon-explicit service-area wording |
| Physical storefront | Ubon only |

## Business Claims

Post-rewrite claim scan on pilots: **0** misleading offering hits (affirmative สาขา / รับถึงบ้านทุกพื้นที่ / ราคาสูงสุด / จ่ายทันที / รับทุกเครื่อง).

Disclaimer/negative wording preserved where used.

## Titles / H1

| Page | Title intent | H1 |
|---|---|---|
| หาดใหญ่ | city + IT buyback | distinct city/Songkhla framing |
| ภูเก็ต | province + IT buyback | distinct province/org framing |
| โน๊ตบุ๊ค-ขอนแก่น | notebook + province | distinct evaluation-first H1 |
| คอมพิวเตอร์-ขอนแก่น | computer + province | distinct typed-desktop H1 |
| network-กาฬสินธุ์ | network gear + province | switch/router-focused H1 |

No “ใกล้ฉัน” in pilot metadata.

## Internal Linking

- Hubs → selected national services (notebook/computer/corporate as relevant)
- Service locals → matching national hub (+ related specialists)
- No mass cross-province related lists added
- Link to R2 hub `/พื้นที่ให้บริการ/ขอนแก่น` from notebook/computer pilots only as area context (hub itself not edited)

## Similarity Before / After

| Page | Closest Before | Sim Before | Closest After | Sim After | Unique-local Before | After |
|---|---|---:|---|---:|---:|---:|
| หาดใหญ่ | ภูเก็ต | 0.856 | เพชรบุรี | 0.851 | 0.532 | 0.524 |
| ภูเก็ต | เพชรบุรี | 0.906 | เพชรบุรี | 0.896 | 0.532 | 0.534 |
| โน๊ตบุ๊ค-ขอนแก่น | คอม-ขอนแก่น | 0.876 | คอม-ขอนแก่น | 0.304 | 0.846 | 0.603 |
| คอม-ขอนแก่น | โน๊ต-ขอนแก่น | 0.876 | โน๊ต-ขอนแก่น | 0.304 | 0.846 | 0.585 |
| network-กาฬสินธุ์ | network-ขอนแก่น | 0.919 | network-อุบล | 0.558 | 1.000* | 0.614 |

\*Thin page unique-ratio before was inflated by short body.  
Network vs ขอนแก่น specifically: **0.919 → 0.453**.

## Unique Local Ratio

See table above. Service pilots trade province-name-density ratio for service-workflow uniqueness; pairwise similarity is the stronger differentiation signal.

## Quality Score Before / After

| Page | Before | After |
|---|---:|---:|
| หาดใหญ่ | 87 | 87 |
| ภูเก็ต | 83 | 87 |
| โน๊ตบุ๊ค-ขอนแก่น | 74 | 78 |
| คอม-ขอนแก่น | 74 | 78 |
| network-กาฬสินธุ์ | 69 | 78 |

(GSC unavailable — scores normalized without search evidence.)

### Words (R8A tokenizer)

| Page | Before | After |
|---|---:|---:|
| หาดใหญ่ | 1470 | 1496 |
| ภูเก็ต | 1506 | 1545 |
| โน๊ตบุ๊ค-ขอนแก่น | 213 | 196 |
| คอม-ขอนแก่น | 213 | 183 |
| network-กาฬสินธุ์ | 67 | 214 |

Note: notebook/computer token counts are similar to prior template length but content is no longer near-duplicate across services; quality judged by differentiation + trust + workflow, not length chase.

## Schema

- No local-branch LocalBusiness added
- Existing sitewide Ubon NAP schema unchanged
- No invented streetAddress / postalCode / geo / local phone for non-Ubon pilots

## Routes

| Check | Result |
|---|---|
| Slugs unchanged | Yes |
| Build output present | 5/5 pilots |
| H1 count | 1 each |
| Self canonical | Present in built HTML |
| Indexable | Unchanged (no noindex) |
| Sitemap | Generated by build; pilots remain indexable collection members |

## Tests

| Check | Result |
|---|---|
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | **21/21 PASS** |
| `npx astro check` | **0 errors** |
| `npm run build` | **PASS** |
| Broken links (pilot sources) | **0** confirmed |
| Business claim scan | **0** misleading |

## Build

Windows-safe Astro build completed; sitemap regenerated; Vercel output packaged. No deploy.

## Diff

```
src/content/areas/หาดใหญ่.md
src/content/areas/ภูเก็ต.md
src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-ขอนแก่น.md
src/content/serviceAreas/รับซื้อคอมพิวเตอร์-ขอนแก่น.md
src/content/serviceAreas/รับซื้ออุปกรณ์-network-กาฬสินธุ์.md
docs/gsc-r8b-province-quality-pilot-2026-08-08.md
```

Approx. 5 content sources + report.

## Files Included

- 5 pilot markdown sources above
- This QA report

## Files Excluded

- R2 `src/content/areas/ขอนแก่น.md`
- All other province/serviceArea pages
- National hubs (Phone/Notebook/Tablet/Computer/Corporate/RAM/etc.)
- GSC CSV / OAuth / credentials
- `docs/gsc-r8-local/` datasets (local-only, excluded)

## Template Learnings

1. **Ambiguous shop phrase** should become explicit “หน้าร้านจริงอยู่จังหวัดอุบลราชธานี + service-area coordination”.
2. **Cross-service clones** (notebook≈computer) need different inspection/logistics sections, not province-name swaps.
3. **Thin B2B families** (network/server/UPS) improve fastest by adding equipment-spec checklists (Part Number, PoE, License) rather than landmark lists.
4. **Long non-Isan hubs** already strong; R8C should prefer surgical role/trust edits over full rewrites unless GSC demands it.
5. **Pilot before family rollout** — network similarity drop supports expanding template refactor to 3–5 sibling provinces next, not all 20 at once.

## Recommendation for R8C

1. Apply Ubon-explicit trust sentence to a **small template pilot** (e.g. 3–5 non-Ubon notebook pages), measure, then decide family rollout.
2. Expand **network/server/UPS** consolidate-template pilot using Kalasin pattern (still no mass edit).
3. Keep R2 hub `/พื้นที่ให้บริการ/ขอนแก่น` frozen until observation window clears.
4. Wait for GSC windows before BUSINESS_PRIORITY ranking changes or any NOINDEX discussion (still 0 candidates).
5. Do **not** create missing non-Isan service×province routes without demand evidence.

## Confirmations

- NOT MERGED
- NOT DEPLOYED
- NO NOINDEX
- NO REDIRECTS
- NO CANONICAL CHANGES
- NO MASS PROVINCE EDIT
- NO FROZEN PAGE EDIT
- NO GSC/OAUTH/CSV COMMITTED
