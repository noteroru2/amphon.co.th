# GSC-R3D Production Release

## Final verdict

**PASS_WITH_WARNING**

Production is live with R3C architecture: National Phone Hub and National Notebook Hub receive correct homepage, footer, and services-index discovery; Ubon Local links up to National Notebook Hub; Phone Hub separates iPhone and condition intents. No content rewrite in this release.

Warnings:

- `npm run test` is NOT_CONFIGURED (repo uses `test:google-reviews` only).
- Vercel inspect JSON did not expose an explicit git commit field; Production SHA is inferred as `89997bd` from the main push that triggered deployment `dpl_DMhE3dpMp23SK9TwdqyGvxQaMe6Q` (aliases include `amphon.co.th` and `…-git-main-…`).
- Lighthouse `errors-in-console` audit was not present / undefined in the SEO-only run; no blocker.

## Git

| Item | Value |
|---|---|
| Source branch | `seo/gsc-r3-phone-notebook-architecture` |
| Base SHA | `1485c6e9157241fec47bfda880608343d5e1ef01` |
| Implementation commit | `6c35844363fd6d0e702fce6e477eb8481bda6000` |
| Main SHA before merge | `1485c6e9157241fec47bfda880608343d5e1ef01` |
| Merge SHA | `89997bd958cee7858cc31b740bd8331034b39750` |
| Final main SHA | `89997bd958cee7858cc31b740bd8331034b39750` |
| Content SHA | `6c35844` (implementation) / merge `89997bd` |
| Main ahead of base before merge | no new commits |

Merge message: `merge: release GSC-R3 phone and notebook architecture`

Diff scope (merge): 6 files only — 3 content sources, Footer, Services index, R3C QA doc. No GSC CSV / OAuth / R3A local report.

Local-only: `docs/gsc-r3-phone-notebook-architecture-2026-08-06.md` kept out via `.git/info/exclude`.

## QA

| Check | Result |
|---|---|
| `npm run test` | NOT_CONFIGURED |
| `npm run test:google-reviews` | PASS 21/21 |
| `npx astro check` | 0 errors |
| `npm run build` | PASS |
| Broken links (release set) | 0 |
| Schema JSON-LD parse | 0 errors |

## Deployment

| Item | Value |
|---|---|
| Platform | Vercel Production |
| Deployment ID | `dpl_DMhE3dpMp23SK9TwdqyGvxQaMe6Q` |
| Deployment URL | https://amphon-co-may9k9l8l-amphons-projects-bb1ec3bf.vercel.app |
| Production status | Ready |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, git-main alias |
| Production SHA | `89997bd` (inferred from main deploy) |

## Production pages

### National Phone Hub — `/บริการ/รับซื้อโทรศัพท์มือสอง`

- HTTP 200, no redirect chain
- Title / H1 match expected R3B
- Markers: multi-brand, ขายขาด / ไม่ใช่จำนำหรือรับฝาก, Activation Lock, FRP, ติดผ่อน, links to iPhone + โทรศัพท์เสีย
- LINE + tel present; FAQ + JSON-LD OK; indexable
- Pawn terms absent from Title/H1/Description

### National Notebook Hub — `/บริการ/รับซื้อโน๊ตบุ๊ค`

- HTTP 200
- Title / H1 match expected
- Markers: หน้าบริการหลักระดับประเทศ, CPU/RAM/SSD/GPU, gaming/company/broken topics, link to Ubon Local
- LINE + tel; FAQ + JSON-LD OK

### Ubon Notebook Local — `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี`

- HTTP 200
- Title / H1 match expected
- Markers: Local Intent, 740/8 ชยางกูร, ซอย 42, หน้าร้านจริง, uplink to National Hub
- LINE + tel; FAQ + JSON-LD OK

### iPhone Service — `/บริการ/รับซื้อ-iphone`

- HTTP 200; links back to Phone Hub present; title/H1 unchanged by R3C

### Homepage — `/`

- Business-wide title/H1 unchanged
- Phone popular destination → National Phone Hub
- Notebook popular destination → National Notebook Hub
- No pawn keywords added

### Services index — `/รับซื้อสินค้าไอที`

- Links to National Phone Hub and National Notebook Hub present (chip/featured/cluster)

## Internal link architecture

| Surface | Destination | Status |
|---|---|---|
| Homepage generic phone | `/บริการ/รับซื้อโทรศัพท์มือสอง` | PASS |
| Homepage generic notebook | `/บริการ/รับซื้อโน๊ตบุ๊ค` | PASS |
| Footer `รับซื้อโทรศัพท์มือสอง` | `/บริการ/รับซื้อโทรศัพท์มือสอง` | PASS |
| Footer `รับซื้อโน๊ตบุ๊ค` | `/บริการ/รับซื้อโน๊ตบุ๊ค` | PASS |
| Services index | both hubs | PASS |
| Phone Hub → iPhone | `/บริการ/รับซื้อ-iphone` | PASS |
| Phone Hub → condition | `/บริการ/รับซื้อโทรศัพท์เสีย` | PASS |
| Ubon → National Notebook | `/บริการ/รับซื้อโน๊ตบุ๊ค` | PASS |

Phone/iPhone separation: **PASS**  
National/Ubon Notebook separation: **PASS**

Incoming (architecture, not maximized):

- Sitewide: Footer hubs
- Navigation: Services index (not header mega-menu)
- Homepage cards: both hubs
- Contextual: Phone↔iPhone/condition; Notebook↔Ubon/specialized

## Rendered metadata

| Route | Title | Description | Canonical | H1 | Indexable |
|---|---|---|---|---|---|
| `/บริการ/รับซื้อโทรศัพท์มือสอง` | รับซื้อโทรศัพท์มือสองทุกยี่ห้อ iPhone Samsung OPPO vivo Xiaomi \| Amphon.co.th | รับซื้อโทรศัพท์มือสองทั้ง iPhone และ Android… | https://amphon.co.th/บริการ/รับซื้อโทรศัพท์มือสอง | รับซื้อโทรศัพท์มือสองทุกยี่ห้อ ส่งรูปประเมินก่อนขาย | yes |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | รับซื้อโน๊ตบุ๊คมือสอง ส่งรูปเช็กราคา เครื่องดีและเครื่องเสีย \| Amphon.co.th | รับซื้อโน๊ตบุ๊คมือสองทั้งเครื่องทำงาน เกมมิ่ง… | https://amphon.co.th/บริการ/รับซื้อโน๊ตบุ๊ค | รับซื้อโน๊ตบุ๊คมือสอง ส่งรูปและสเปกประเมินก่อนขาย | yes |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | รับซื้อโน๊ตบุ๊ค อุบลราชธานี มีหน้าร้าน ส่งรูปประเมินก่อนขาย \| Amphon.co.th | รับซื้อโน๊ตบุ๊คในอุบลราชธานี มีหน้าร้านจริง… | https://amphon.co.th/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี | รับซื้อโน๊ตบุ๊ค อุบลราชธานี มีหน้าร้านจริงและนัดรับตามพื้นที่ | yes |
| `/บริการ/รับซื้อ-iphone` | รับซื้อ iPhone มือสอง ส่งรูปเช็กราคาได้ทั่วประเทศ \| Amphon.co.th | (unchanged) | https://amphon.co.th/บริการ/รับซื้อ-iphone | (unchanged) | yes |
| `/` | รับซื้อสินค้าไอทีมือสองทั่วประเทศ \| AMPHON TRADING \| Amphon.co.th | business-wide | https://amphon.co.th | business-wide | yes |
| `/รับซื้อสินค้าไอที` | รับซื้อสินค้าไอที เลือกหน้ารับซื้อให้ตรงกับสินค้า \| Amphon.co.th | hub index | https://amphon.co.th/รับซื้อสินค้าไอที | hub H1 | yes |

## Sitemap

- `sitemap-index.xml` HTTP 200 → `sitemap-0.xml` (lastmod 2026-08-06)
- All 3 release URLs present exactly once (percent-encoded locs decode to canonical paths)
- Canonicals match sitemap URLs
- No new sitemap submit performed

## Lighthouse

SEO category (lab) for 3 main pages:

| Page | SEO score | title | meta | canonical | crawlable | anchors | HTTP |
|---|---:|---:|---:|---:|---:|---:|---:|
| Phone Hub | 1.0 | pass | pass | pass | pass | pass | pass |
| Notebook Hub | 1.0 | pass | pass | pass | pass | pass | pass |
| Ubon Local | 1.0 | pass | pass | pass | pass | pass | pass |

Performance not treated as blocker. No content changes for scores.

## Pawn/deposit guardrail

**PASS**

- Phone Hub may mention จำนำ/รับฝาก only as denial of service (ขายขาด).
- Absent from Title, H1, Meta description, mainKeyword, relatedKeywords targeting, CTA, Homepage additions from R3C.

## Security

| Scan | Hits |
|---|---:|
| Merge commit file list credentials/GSC | 0 |
| Recent history credential/GSC paths | 0 |
| Live HTML credential/GSC strings (checked pages) | 0 |

R3A report and GSC local folders remain local-only / excluded.

## Final confirmation

- Merged: yes (`--no-ff` into main)
- Pushed: yes (`origin/main` = `89997bd`)
- Deployed: yes (Vercel Ready `dpl_DMhE3dpMp23SK9TwdqyGvxQaMe6Q`)
- Production verified: yes (live HTML + sitemap + Lighthouse SEO)
- No Indexing API used
- No content rewrite in R3D
- No GSC data or OAuth committed
