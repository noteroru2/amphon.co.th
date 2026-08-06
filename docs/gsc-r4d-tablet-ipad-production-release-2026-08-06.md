# GSC-R4D Tablet and iPad Production Release

## Final verdict

**PASS**

R4C tablet/iPad architecture is live on production. Tablet Hub and iPad Hub remain role-separated; Footer and Services index discover both hubs; Surface backlinks to Tablet Hub; heroes and assets return HTTP 200.

## Git

| Item | Value |
|---|---|
| Source branch | `seo/gsc-r4-tablet-ipad-architecture` |
| Base SHA | `1a6e734755243ae5cf7cef9874b18f4a8e506b53` |
| Implementation commit | `1df565ff6e7a6043c0c85282c18d084727230bc0` |
| Main SHA before merge | `1a6e734755243ae5cf7cef9874b18f4a8e506b53` |
| Merge SHA | `d44aa1a7c76640de5c72a1788d5be530b675590a` |
| Final main SHA (content) | `d44aa1a7c76640de5c72a1788d5be530b675590a` |
| Content SHA | `1df565f` / merge `d44aa1a` |

Merge message: `merge: release GSC-R4 tablet and iPad architecture`

Diff scope: 7 files only (2 hubs + Surface backlink + Footer + Services index + images.ts + R4C QA). No GSC/OAuth/credentials.

## QA

| Check | Result |
|---|---|
| `npm run test` | NOT_CONFIGURED |
| `test:google-reviews` | PASS 21/21 |
| `astro check` | 0 errors |
| `npm run build` | PASS |
| Broken links | 0 |
| Schema JSON-LD parse | 0 errors |

## Deployment

| Item | Value |
|---|---|
| Platform | Vercel Production |
| Deployment ID | `dpl_DjNdSfGHDLZWCrmmx9A5oSvTPvvF` |
| Deployment URL | https://amphon-co-43o6jfii7-amphons-projects-bb1ec3bf.vercel.app |
| Production status | Ready |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, git-main |
| Production SHA | `d44aa1a` (inferred from main deploy) |

## Production pages

### National Tablet Hub — `/บริการ/รับซื้อแท็บเล็ต`

- HTTP 200, no redirect
- Title/H1 match expected
- Markers: multi-brand Android/Windows, Model Number, MDM/Knox/Autopilot, Inventory, links to iPad / Surface (percent-encoded hrefs) / Notebook
- Hero `buy-tablets.webp` present
- LINE + tel; FAQ + JSON-LD OK

### iPad Hub — `/บริการ/รับซื้อ-ipad`

- HTTP 200
- Title/H1 match expected
- Markers: Pro/Air/mini/มาตรฐาน, Axxxx, Pencil, Keyboard, Find My, Activation Lock, MDM, Tablet uplink, child pages
- Hero `buy-ipad.webp`
- Apple account guardrail present

### Surface — `/บริการ/รับซื้อ-surface`

- HTTP 200; contextual backlink to Tablet Hub present

### Homepage / Services index

- Homepage iPad card → iPad Hub; Footer exposes Tablet + iPad
- Services index shows both hubs (featured/chip/cluster)

## Internal link architecture

| Check | Verdict |
|---|---|
| Footer Tablet → `/บริการ/รับซื้อแท็บเล็ต` | PASS |
| Footer iPad → `/บริการ/รับซื้อ-ipad` | PASS |
| Services index Tablet + iPad | PASS |
| Tablet/iPad separation | PASS |
| Surface → Tablet Hub | PASS |
| iPad → child pages | PASS |

Incoming baseline (static sources, R4C): Tablet ~26 · iPad ~64 · Surface retains Tablet uplink. Live HTML confirms Footer, Index, Homepage (iPad), and contextual directions.

## Images

| Asset | Status |
|---|---|
| Tablet hero `/images/mobile/buy-tablets.webp` | HTTP 200, `image/webp` |
| iPad hero `/images/apple/buy-ipad.webp` | HTTP 200, `image/webp` |
| Services thumbnail mapping | `รับซื้อแท็บเล็ต` → `buy-tablets.webp` |

No phone/gaming PC as Tablet hero.

## Apple account guardrail

**PASS** — requires Apple sign-out, Find My off, Activation Lock removed, MDM release; declines locked/disputed ownership cases. No “shop unlocks all iCloud” claims.

## Rendered metadata

| Route | Title | Description | Canonical | H1 | Indexable |
|---|---|---|---|---|---|
| `/บริการ/รับซื้อแท็บเล็ต` | รับซื้อแท็บเล็ตมือสอง Samsung Xiaomi Huawei Lenovo และ Windows \| Amphon.co.th | (FM) | https://amphon.co.th/บริการ/รับซื้อแท็บเล็ต | รับซื้อแท็บเล็ตมือสอง Android และ Windows ส่งรูปประเมินก่อนขาย | yes |
| `/บริการ/รับซื้อ-ipad` | รับซื้อ iPad มือสอง Pro Air mini และ iPad รุ่นมาตรฐาน \| Amphon.co.th | (FM) | https://amphon.co.th/บริการ/รับซื้อ-ipad | รับซื้อ iPad มือสอง ส่งรุ่นและรูปสภาพประเมินก่อนขาย | yes |
| `/บริการ/รับซื้อ-surface` | รับซื้อ Surface มือสอง Surface Pro Laptop Go ทั่วประเทศ \| Amphon.co.th | (FM) | https://amphon.co.th/บริการ/รับซื้อ-surface | (Surface H1) | yes |
| `/` | business-wide | business-wide | https://amphon.co.th | business-wide | yes |
| `/รับซื้อสินค้าไอที` | hub index | hub | https://amphon.co.th/รับซื้อสินค้าไอที | hub H1 | yes |

## Sitemap

- `sitemap-index.xml` → `sitemap-0.xml` HTTP 200
- Tablet Hub and iPad Hub each appear **once**
- Canonicals match sitemap URLs
- No new sitemap submit

## Lighthouse

| Page | SEO score | title | canonical | crawlable | anchors | HTTP |
|---|---:|---:|---:|---:|---:|---:|
| Tablet Hub | 1.0 | pass | pass | pass | pass | pass |
| iPad Hub | 1.0 | pass | pass | pass | pass | pass |

## Security

Credential / GSC path scan on merge file list: **0 hits**. Live HTML credential/GSC strings: **0**. Local GSC folders remain excluded via `.git/info/exclude`.

## Final confirmation

- Merged: yes (`--no-ff`)
- Pushed: yes (`origin/main` = `d44aa1a`)
- Deployed: yes (Vercel Ready `dpl_DjNdSfGHDLZWCrmmx9A5oSvTPvvF`)
- Production verified: yes (HTML + assets + sitemap + Lighthouse SEO)
- No Indexing API
- No content rewrite in R4D
- No GSC/OAuth/CSV committed
