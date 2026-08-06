# GSC-R4C Tablet and iPad Internal Linking QA

## Final verdict

**PASS**

R4B content is installed on both hubs. Tablet Hub and iPad Hub are separated in content and discovery (Footer + Services index). Homepage iPad card already pointed to iPad Hub. Generic markdown anchors scanned with **0 WRONG_*** verdicts. Build and Astro check passed.

## Environment

| Item | Value |
|---|---|
| Branch | `seo/gsc-r4-tablet-ipad-architecture` |
| Base / origin/main | `1a6e734755243ae5cf7cef9874b18f4a8e506b53` |
| Node | v24.14.1 |
| Astro | ^6.4.2 |
| Local exclude | `.git/info/exclude` includes `docs/gsc-r4-local/` (+ prior GSC local paths) |

## Source pages

| Page role | Source file | Slug | Route |
|---|---|---|---|
| National Tablet Hub | `src/content/services/รับซื้อแท็บเล็ต.md` | `รับซื้อแท็บเล็ต` | `/บริการ/รับซื้อแท็บเล็ต` |
| iPad Service Hub | `src/content/services/รับซื้อ-ipad.md` | `รับซื้อ-ipad` | `/บริการ/รับซื้อ-ipad` |

No duplicate sources for these routes. Both URLs present once in built `sitemap-0.xml`.

## R4B content verification

| Marker group | Tablet Hub | iPad Hub |
|---|---|---|
| Brand / family coverage | PASS (Samsung/Xiaomi/Redmi/POCO/Huawei/Lenovo/HONOR/Surface) | PASS (Pro/Air/mini/มาตรฐาน) |
| Spec / lock topics | Model Number, Wi-Fi/Cellular/5G, MDM, Knox, Autopilot, Inventory | Axxxx, Wi-Fi/Cellular, Pencil, Keyboard, Find My, Activation Lock, MDM, Inventory |
| Cross-hub links | → iPad, Surface, Notebook, อุปกรณ์ไอทีบริษัท, พื้นที่ให้บริการ | → Tablet Hub + child pages |

Verdict: **CONTENT_INSTALLED** (not CONTENT_NOT_INSTALLED). No body rewrite in R4C.

## Frontmatter validation

| Check | Tablet | iPad |
|---|---|---|
| YAML / single title·h1·description | PASS | PASS |
| slug / mainKeyword role | PASS | PASS |
| relatedKeywords array / no near-me | PASS | PASS |
| Tablet KW without iPad primary | PASS | — |
| iPad KW without Android Tablet primary | — | PASS |
| heroImage / ogImage exist | PASS (`buy-tablets.webp` after fix) | PASS (`buy-ipad.webp`) |
| draft: false / FAQ / quickSummary (services schema) | PASS | PASS |
| updated | `2026-08-06` | `2026-08-06` |

## Tablet/iPad architecture before

- Homepage: iPad card → iPad Hub (correct); no generic Tablet card.
- Footer: **missing** Tablet and iPad links.
- Services index: iPad featured/chip present; **Tablet Hub missing** from featured/chips/clusters.
- Content hubs already cross-linked in R4B body.
- iPad child pages already link up to iPad Hub.

## Internal link changes

| Source | Anchor | Destination | Route exists | Status |
|---|---|---|---|---|
| `Footer.astro` | รับซื้อแท็บเล็ต | `/บริการ/รับซื้อแท็บเล็ต` | yes | ADDED |
| `Footer.astro` | รับซื้อ iPad | `/บริการ/รับซื้อ-ipad` | yes | ADDED |
| `รับซื้อสินค้าไอที.astro` | รับซื้อแท็บเล็ต (+ featured/cluster) | `/บริการ/รับซื้อแท็บเล็ต` | yes | ADDED |
| `รับซื้อสินค้าไอที.astro` | รับซื้อ iPad | `/บริการ/รับซื้อ-ipad` | yes | ALREADY_CORRECT |
| `รับซื้อ-surface.md` | รับซื้อแท็บเล็ตมือสอง | `/บริการ/รับซื้อแท็บเล็ต` | yes | ADDED (1 backlink) |
| Homepage iPad card | รับซื้อ iPad | `/บริการ/รับซื้อ-ipad` | yes | ALREADY_CORRECT |

## Homepage validation

| Anchor intent | Destination | Verdict |
|---|---|---|
| iPad | `/บริการ/รับซื้อ-ipad` | ALREADY_CORRECT |
| Generic Tablet card | (none) | No wrong dest; discovery via Footer + Services index |

Homepage H1/primary intent unchanged. No long tablet/iPad article added.

## Footer validation

| Footer anchor | Before | After | Verdict |
|---|---|---|---|
| รับซื้อแท็บเล็ต | missing | `/บริการ/รับซื้อแท็บเล็ต` | ADDED |
| รับซื้อ iPad | missing | `/บริการ/รับซื้อ-ipad` | ADDED |

No “ใกล้ฉัน”. No duplicate anchors to conflicting URLs.

## Services index validation

- Tablet Hub added to `mainMoneySlugs`, category chip, and dedicated Android/Windows tablet cluster (includes Surface).
- iPad remains separate cluster (includes Gen).
- Descriptions remain role-separated via distinct hubs.
- Thumbnail mapping: `รับซื้อแท็บเล็ต` → `buy-tablets.webp` in `images.ts`.

## Generic anchor review

Repo markdown/astro scan of tablet/iPad-like anchors:

| Verdict | Count |
|---|---:|
| CORRECT_TABLET_HUB | 6 |
| CORRECT_IPAD_HUB | 31 |
| CORRECT_IPAD_CHILD | 31 |
| CORRECT_LOCAL | 26 |
| CONTEXT_DEPENDENT | 5 |
| WRONG_* | **0** |

Generic wrong links fixed: **0** (none required). Context-dependent left unchanged: **5**.

## Tablet Hub and iPad separation

**PASS**

- Tablet Hub primary: Android/Windows; points iPad seekers to iPad Hub.
- iPad Hub primary: Apple iPad; points Android/Windows to Tablet Hub.
- Services index and Footer expose both as distinct destinations.

## Child-page backlinks

| Page | Hub link | Action |
|---|---|---|
| iPad Pro / Air / mini / Gen / จอแตก / เสีย | → iPad Hub | ALREADY present |
| Apple Pencil / Magic Keyboard iPad | → iPad Hub | ALREADY present |
| Surface | → Tablet Hub | **ADDED** one related-services link |

Follow-up (not mass-edited): other non-Apple tablet brand pages if/when created; many Surface/iPad locals already use local↔hub patterns.

## Image validation

| Page | Current image | Exists | Relevant | Action |
|---|---|---|---|---|
| Tablet Hub | `/images/mobile/buy-tablets.webp` | yes | yes (tablet asset in imageAlt) | Switched from phone hero |
| iPad Hub | `/images/apple/buy-ipad.webp` | yes | yes | Keep |

## Apple account guardrail

**PASS**

iPad page requires sign-out, Find My off, Activation Lock removed, MDM release; may decline if ownership cannot be verified. No claims that shop unlocks all iCloud devices or buys locked/lost devices.

## Content structure validation

- H1 count = 1 on both hubs (build HTML).
- No risky guarantee phrases as targeting claims (limitation wording only).
- No “ใกล้ฉัน” in metadata.
- Heading hierarchy and FAQ present.

## Schema validation

- JSON-LD parse PASS on built pages.
- Schema errors: **0**.
- LocalBusiness remains Ubon-centric via site layout.
- No fake AggregateRating/Review added in this batch.

## Internal link validation

Broken links in change set: **0**. Child destinations (`ipad-pro|air|mini|gen|จอแตก|เสีย|apple-pencil|magic-keyboard-ipad|surface|โน๊ตบุ๊ค|อุปกรณ์ไอทีบริษัท`) exist as service sources.

## Rendered metadata

| Route | Rendered title | Length | Description | Length | H1 |
|---|---|---:|---|---:|---|
| `/บริการ/รับซื้อแท็บเล็ต` | รับซื้อแท็บเล็ตมือสอง Samsung Xiaomi Huawei Lenovo และ Windows \| Amphon.co.th | 77 | (from FM) | 165 | รับซื้อแท็บเล็ตมือสอง Android และ Windows ส่งรูปประเมินก่อนขาย |
| `/บริการ/รับซื้อ-ipad` | รับซื้อ iPad มือสอง Pro Air mini และ iPad รุ่นมาตรฐาน \| Amphon.co.th | 68 | (from FM) | 149 | รับซื้อ iPad มือสอง ส่งรุ่นและรูปสภาพประเมินก่อนขาย |

## Incoming link counts

Static unique source files containing destination path:

| Destination | Before | After | Important sources |
|---:|---:|---:|---|
| `/บริการ/รับซื้อแท็บเล็ต` | 23 | 26 | Footer, Services index, Surface, locals, iPad Hub |
| `/บริการ/รับซื้อ-ipad` | 63 | 64 | Footer (+), Homepage card, index, children |
| `/บริการ/รับซื้อ-ipad-pro` | 3 | 3 | iPad Hub, blog, layout |
| `/บริการ/รับซื้อ-surface` | 24 | 24 | Tablet Hub, locals, blogs |

Types: Footer (sitewide), Services index (nav/index), Homepage (iPad card), Contextual (hubs↔children/Surface).

## Tests and build

| Check | Result |
|---|---|
| `npm run test` | NOT_CONFIGURED |
| `test:google-reviews` | PASS 21/21 |
| `astro check` | 0 errors |
| `npm run build` | PASS |
| Broken links | 0 |
| Schema errors | 0 |
| Routes built | yes |

## Security scan

No GSC CSV / OAuth / `.env` in diff. Built HTML credential/GSC string scan: clean on sampled pages.

## Diff summary

Files:

- `src/content/services/รับซื้อแท็บเล็ต.md` — R4B install + hero → `buy-tablets.webp`
- `src/content/services/รับซื้อ-ipad.md` — R4B install
- `src/content/services/รับซื้อ-surface.md` — +1 Tablet Hub backlink
- `src/components/Footer.astro` — Tablet + iPad links
- `src/pages/รับซื้อสินค้าไอที.astro` — Tablet featured/chip/cluster (+ iPad Gen in cluster)
- `src/config/images.ts` — tablet thumbnail map

No R2/R3 pages, no phone-condition page, no mass province edits, no GSC credentials.

## Files eligible to commit

- The six files listed above
- `docs/gsc-r4c-tablet-ipad-internal-linking-qa-2026-08-06.md`

## Files excluded from commit

- `docs/gsc-r4-local/**`, other GSC local folders, OAuth, CSV, `.env`
- Prior R3A local report (excluded)

## Recommended production step

1. Review branch PR.
2. Merge to main only after owner approval (not in R4C).
3. Deploy via normal Vercel production after merge.
4. Do not call Indexing API in this batch.
