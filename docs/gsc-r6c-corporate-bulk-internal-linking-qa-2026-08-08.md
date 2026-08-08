# GSC-R6C Corporate / Bulk Internal Linking QA

## Final verdict

**PASS_WITH_WARNING**

8 R6B core pages installed and verified. Corporate Parent Hub discovery wired on Homepage, Footer, Services Index, and B2B cluster. Child → Parent backlinks present. Auction page received **minimal trust/safety cleanup** (not a full rewrite). Remaining warning: auction page still carries promotional tone in non-claim sections and should get a dedicated rewrite later if needed (`AUCTION_PAGE_REWRITE_REQUIRED` for residual marketing voice, not for hard fabricated claims that remained).

Accepted architecture holds:

- Auction / procurement pages not promoted to Parent
- No R2/R3/R4/R5 frozen page edits

## Environment

| Item | Value |
| --- | --- |
| Node | v22.20.0 |
| Astro | ^6.4.2 |
| Date | 2026-08-08 |
| OS | Windows |

## Git

| Item | Value |
| --- | --- |
| Branch | `seo/gsc-r6-corporate-bulk-it-architecture` |
| Base / origin/main | `a2c388705a6352696d21248b0e8c363e3ea655a7` |
| Dirty unrelated worktree | left untouched; not staged |

## R6B installation

| Slug | Source file | Status |
| --- | --- | --- |
| รับซื้อสินค้าไอทีบริษัท | `src/content/services/รับซื้อสินค้าไอทีบริษัท.md` | INSTALLED |
| รับซื้อคอมบริษัท | `src/content/services/รับซื้อคอมบริษัท.md` | INSTALLED |
| รับซื้อคอมสำนักงาน | `src/content/services/รับซื้อคอมสำนักงาน.md` | INSTALLED |
| รับซื้อคอมยกล็อต | `src/content/services/รับซื้อคอมยกล็อต.md` | INSTALLED |
| รับซื้อโน๊ตบุ๊คบริษัท | `src/content/services/รับซื้อโน๊ตบุ๊คบริษัท.md` | INSTALLED |
| รับซื้อโน๊ตบุ๊คยกล็อต | `src/content/services/รับซื้อโน๊ตบุ๊คยกล็อต.md` | INSTALLED |
| รับซื้ออุปกรณ์ไอทีบริษัท | `src/content/services/รับซื้ออุปกรณ์ไอทีบริษัท.md` | INSTALLED |
| รับซื้อ-server-network | `src/content/services/รับซื้อ-server-network.md` | INSTALLED |

Duplicate slug sources: **0** · `SOURCE_NOT_FOUND`: **0**

## Parent Hub verification

`/บริการ/รับซื้อสินค้าไอทีบริษัท`

- Role: Corporate / Bulk IT Parent Hub
- Title/H1 match expected
- Markers: mixed IT assets, Inventory List, child specialist links, data handling / authorization
- No near-me metadata

## Page role mapping

| Page | Role | Verdict |
| --- | --- | --- |
| สินค้าไอทีบริษัท | CORPORATE_BULK_PARENT | PASS |
| คอมบริษัท | CORPORATE_COMPUTER | PASS |
| คอมสำนักงาน | OFFICE_PC | PASS |
| คอมยกล็อต | BULK_COMPUTER | PASS |
| โน๊ตบุ๊คบริษัท | CORPORATE_NOTEBOOK | PASS |
| โน๊ตบุ๊คยกล็อต | BULK_NOTEBOOK | PASS |
| อุปกรณ์ไอทีบริษัท | OFFICE_IT_EQUIPMENT | PASS |
| server-network | INFRASTRUCTURE_HUB | PASS |

## Homepage

- Category chip: `สินค้าไอทีบริษัท` → Parent (**FIXED** from คอมบริษัท/ยกล็อต)
- B2B cards: Parent added first; คอมบริษัท desc corrected to computer/Asset List; อุปกรณ์ไอทีบริษัท desc corrected to peripherals; auction card **removed** from homepage B2B (no new auction prominence)
- computerHubLinks คอมบริษัท desc corrected
- No homepage H1 rewrite

## Footer

| Anchor | Before | After | Verdict |
| --- | --- | --- | --- |
| รับซื้อสินค้าไอทีบริษัท | missing | `/บริการ/รับซื้อสินค้าไอทีบริษัท` | FIXED |
| รับซื้อคอมบริษัท | present | unchanged | CORRECT_CORPORATE_COMPUTER |

## Services Index

- Featured money slugs: Parent added ahead of คอมบริษัท
- B2B cluster: Parent first; includes notebook company/bulk, office IT, server-network, supporting scenarios
- Category chip → Parent
- Parent vs Office IT descriptions remain distinct

## B2B cluster

- `service-clusters.ts`: Parent elevated in COM_OFFICE priority; slug overrides for Parent/Office IT/notebook bulk; related-card overrides for Parent children
- Auction pages de-prioritized from COM_OFFICE hub priority list

## Generic anchor audit (representative)

| Source | Anchor / context | Destination | Verdict | Action |
| --- | --- | --- | --- | --- |
| Homepage B2B | ทรัพย์สินไอทีองค์กร → คอมบริษัท | was company PC | WRONG_GENERIC_TO_COMPUTER | FIXED → Parent card |
| Homepage B2B | Server/Network on Office IT card | อุปกรณ์ไอทีบริษัท | WRONG_GENERIC_TO_OFFICE_IT | FIXED desc |
| Footer | Parent missing | — | discovery gap | FIXED |
| `รับซื้อสินค้าไอที.md` | mixed company lot | office IT + company PC | WRONG_GENERIC | FIXED → Parent + Office IT |
| `รับซื้อ-server/nas/ups/network` | B2B many categories | Office IT | WRONG_GENERIC_TO_OFFICE_IT | FIXED → Parent |
| `รับประมูล...` | B2B many categories | Office IT | WRONG_GENERIC | FIXED → Parent |
| R5 frozen pages | company links | company PC | CONTEXT / FREEZE | unchanged |
| Auction pages | bidding/auction intent | self | AUCTION_HOLD | no Parent promotion |

**Wrong fixed:** 8 surfaces · **Context-dependent / freeze unchanged:** many (intentional)

## Child backlinks

All 7 children already contain contextual Parent uplinks in R6B body. No mass body rewrite required.

## Supporting scenario pages

| Page | Role | Parent uplink | Verdict |
| --- | --- | --- | --- |
| รับเคลียร์อุปกรณ์ไอทีสำนักงาน | CLEARANCE_SUPPORT_ROLE | already present | PASS |
| รับซื้ออุปกรณ์สำนักงานมือสอง | OFFICE_EQUIPMENT_SUPPORT_ROLE | added Parent + Office IT | FIXED |

## Auction claim audit

Page: `/บริการ/รับเหมาประมูลอุปกรณ์ไอที`

Hard claims softened/removed:

- 1,000+ / every scale capacity
- Secure Erase / Physical Destruction / Certificate guarantees
- Site Audit free nationwide / 1–2 day SLA
- Fabricated case studies
- ได้เงินชัวร์ / สบายใจ 100%
- รถ 6–10 ล้อ capacity table
- “รับเหมาหมดเลย”

**Verdict:** MINIMAL_TRUST_CLEANUP_DONE · residual marketing voice may still need a later dedicated rewrite → `AUCTION_PAGE_REWRITE_REQUIRED` (tone), not remaining hard fake capability claims in cleaned sections.

## Government / procurement guardrail

`/บริการ/รับประมูลคอมพิวเตอร์มือสอง`

- Already stated shop offers purchase price, not official appraisal
- Softened “no registry sticker” FAQ to require authorized seller / org procedure
- Related link retargeted from Office IT → Parent for mixed B2B

**PASS**

## Privacy / data handling

Core R6B pages emphasize organization-owned policy, backup, Domain/MDM, encryption, storage include/exclude, authorization. No certified wipe / PDPA guarantee claims on core pages.

## Business claims

R6 core hard risky scan: **0**

## Images

| Page | Asset | Status |
| --- | --- | --- |
| Parent | `/images/b2b/buy-company-it-assets.webp` | exists |
| Company PC | `buy-company-computers.webp` | exists |
| Office/Bulk PC | `buy-office-pc-lot.webp` | exists · **IMAGE_REUSE_WARNING** |
| Notebook company | `buy-notebook-company2.webp` | exists |
| Notebook bulk | `buy-notebook-all.webp` | exists |
| Office IT | `buy-company-it-equipment.webp` | exists |
| Server Network | `buy-server-network.webp` | exists |

Thumbnail mappings updated in `images.ts`.

## Routes

All required child/infrastructure destinations exist (server/nas/ups/network + related computer/notebook routes). Broken destinations: **0**

## Frontmatter

8 R6B pages: YAML valid, draft false, updated 2026-08-08, FAQ present, expected titles/H1. Astro content sync: PASS

## Schema

Build HTML: canonical×1, robots indexable, FAQ/JSON-LD present on services, no credential leak. LocalBusiness remains Ubon-only pattern.

## Rendered metadata

| Route | Title (prefix) | H1 |
| --- | --- | --- |
| Parent | รับซื้อสินค้าไอทีบริษัทและองค์กร ส่ง Inventory List ประเมินก่อนขาย | expected |
| Company PC | รับซื้อคอมบริษัทและเครื่องพนักงาน ส่ง Asset List ประเมินก่อนขาย | expected |
| Office PC | รับซื้อคอมสำนักงานและคอมออฟฟิศมือสอง ส่งสเปกประเมินก่อนขาย | expected |
| Bulk PC | รับซื้อคอมยกล็อตและคอมหลายเครื่อง ส่ง Inventory List ประเมินก่อนขาย | expected |
| Company Notebook | รับซื้อโน๊ตบุ๊คบริษัท เครื่องพนักงานเก่า ส่ง Asset List ประเมินก่อนขาย | expected |
| Bulk Notebook | รับซื้อโน๊ตบุ๊คยกล็อต หลายเครื่อง ส่งรายการประเมินก่อนขาย | expected |
| Office IT | รับซื้ออุปกรณ์ไอทีบริษัท จอ UPS Dock Printer และอุปกรณ์สำนักงาน | expected |
| Infrastructure | รับซื้อ Server Network NAS UPS มือสอง ส่ง Part Number ประเมินก่อนขาย | expected |

## Incoming link counts

| Destination | Before | After | Notes |
| --- | --- | --- | --- |
| Parent | 16 | 28 | Footer, Homepage, Index, infra uplinks |
| Company PC | 92 | 88 | some generic retargets |
| Office PC | 11 | 11 | stable |
| Bulk PC | 16 | 16 | stable |
| Company Notebook | 25 | 25 | stable |
| Bulk Notebook | 32 | 32 | stable |
| Office IT | 20 | 16 | mixed B2B → Parent |
| Server Network | 14 | 14 | stable |

Parent discovery strengthened without mass redistribution.

## Parent-child separation

**PASS** — distinct primary intents across Parent / Company PC / Office PC / Bulk / Notebook / Office IT / Infrastructure.

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | NOT_CONFIGURED |
| `test:google-reviews` | PASS 21/21 |
| `astro check` | 0 errors |
| `npm run build` | PASS |
| Broken links | 0 |
| Schema errors | 0 |

## Build

14 target routes rendered with title/desc/canonical/H1 ×1, indexable, LINE/tel, no YAML/GSC leak, no hard residual auction claims in HTML.

## Security

`.git/info/exclude` includes `docs/gsc-r6-local/`, oauth, credentials, gsc csv. No secrets staged.

## Diff

Eligible:

- 8 R6B sources
- Footer, Homepage, Services Index
- service-clusters.ts, images.ts
- supporting office-equipment backlink
- auction minimal cleanup + procurement guardrail
- infra/server/nas/ups/network Parent uplinks
- services hub content link fix
- this QA report

Excluded: unrelated dirty docs/scripts/blogs/areas, scratch, GSC/OAuth.

## Files eligible to commit

Explicit list only (see commit).

## Files excluded

Unrelated dirty worktree + scratch + local GSC paths.

## Recommended R6D production step

1. Review PR on `seo/gsc-r6-corporate-bulk-it-architecture`
2. Merge/release separately (R6D)
3. Optional follow-up: dedicated auction page rewrite for remaining marketing tone
4. Do **not** merge/deploy from this batch automation beyond branch push
