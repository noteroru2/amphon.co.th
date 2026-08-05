# GSC-R2 Production Release

**Batch:** GSC-R2 — Production Release  
**Date:** 2026-08-05  
**Site:** https://amphon.co.th/

---

## Final verdict

# PASS

Merged `seo/gsc-r2-top-opportunities` into `main`, pushed, Vercel Production **Ready**, and verified all three live URLs (HTTP 200, metadata, content markers, schema). No GSC raw data or OAuth credentials were committed.

---

## Git

| Item | Value |
|---|---|
| Source branch | `seo/gsc-r2-top-opportunities` |
| Implementation commit | `0446b1b12e250bdb045d0b76c332055c06deb03e` |
| Base SHA | `3fc3496dfd4f6c6e49e649eb209a0140a6784a7e` |
| Main SHA before merge | `3fc3496dfd4f6c6e49e649eb209a0140a6784a7e` (no newer commits on main) |
| Merge SHA | `b0cb3c7f2cbbc98f92eae7a5a0aedfb262f9f8bd` |
| Content deploy SHA | `b0cb3c7` (Vercel Production Ready for this merge) |
| Release docs commits | `1bb70c4`, `22bf803` |
| Merge message | `merge: deploy GSC-R2 content opportunities` |
| Diff scope (`3fc3496..0446b1b`) | Only the 3 content pages + `docs/gsc-r2-implementation-qa-2026-08-05.md` |

`docs/gsc-revenue-audit-2026-08-05/` remained local-only via `.git/info/exclude` (not staged; `.gitignore` not modified).

---

## QA

| Check | Result |
|---|---|
| Google Reviews tests | **PASS** 21/21 (`npm run test:google-reviews`) |
| Astro check | **PASS** — 0 errors |
| Build | **PASS** (`npm run build`) |
| Broken internal content links | **0** (`/contact` and image paths are valid; not counted as broken routes) |
| Schema parse errors (build + production) | **0** |

Pre-deploy rendered title/H1 matched the batch expectations for all three routes.

---

## Deployment

| Item | Value |
|---|---|
| Platform | Vercel |
| Deployment ID | `dpl_7y4mrJpFwAFDpCB9cN13mFVEcAvU` |
| Deployment URL | https://amphon-co-5yvivm3hz-amphons-projects-bb1ec3bf.vercel.app |
| Production status | **Ready** |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th` |
| Production SHA | Aligns with final main `b0cb3c7` (deploy created immediately after `main` push; CLI summary did not print git SHA field) |
| Created | 2026-08-05 20:55:52 GMT+7 |

Push success was not treated as deploy success — Production HTTP verification was run against live `amphon.co.th`.

---

## Production verification

### `/บริการ/รับซื้อแรม`

| Check | Result |
|---|---|
| HTTP | 200 (1 hop, no redirect chain) |
| Title / H1 | Match build expectations |
| Canonical | `https://amphon.co.th/บริการ/รับซื้อแรม` |
| Indexable | Yes |
| LINE / tel: | Present |
| Markers | DDR3, DDR4, DDR5, DIMM, SO-DIMM, สติกเกอร์ |
| Schema / FAQ | Parse OK; FAQPage present |
| GSC/credential leak | None |

### `/บริการ/รับซื้อ-mac-mini`

| Check | Result |
|---|---|
| HTTP | 200 |
| Title / H1 | Match build expectations |
| Canonical | `https://amphon.co.th/บริการ/รับซื้อ-mac-mini` |
| Indexable | Yes |
| Markers | M4 / M4 Pro, M2 / M2 Pro, M1, Intel, Activation Lock |
| Schema / FAQ | Parse OK |
| GSC/credential leak | None |

### `/พื้นที่ให้บริการ/ขอนแก่น`

| Check | Result |
|---|---|
| HTTP | 200 |
| Title / H1 | Match build expectations |
| Canonical | `https://amphon.co.th/พื้นที่ให้บริการ/ขอนแก่น` |
| Indexable | Yes |
| Business facts | อุบลราชธานี storefront stated; `ไม่มีสาขา`; appointment-based นัดรับ |
| LocalBusiness address | Ubon only (`740/8 ถนนชยางกูร`, `addressRegion: อุบลราชธานี`) — **no Khon Kaen address** |
| Markers | รับซื้อโน๊ตบุ๊ค ขอนแก่น, อุบลราชธานี, ไม่มีสาขา, นัดรับ |
| GSC/credential leak | None |

---

## Rendered SEO metadata

| Route | Title | Description | Canonical | H1 | Indexable |
|---|---|---|---|---|---|
| `/บริการ/รับซื้อแรม` | รับซื้อ RAM มือสอง DDR3 DDR4 DDR5 ส่งรูปประเมินราคาได้ \| Amphon.co.th | รับซื้อ RAM มือสองสำหรับ PC โน๊ตบุ๊ค และ Server ทั้ง DDR3 DDR4 DDR5 ส่งรูปสติกเกอร์ รุ่น ความจุ บัส และจำนวนแผงเพื่อประเมินเบื้องต้นได้ | https://amphon.co.th/บริการ/รับซื้อแรม | รับซื้อ RAM มือสอง DDR3 DDR4 DDR5 ส่งรูปประเมินราคาได้ | Yes |
| `/บริการ/รับซื้อ-mac-mini` | Mac mini มือสองขายได้เท่าไหร่ รับซื้อ M1 M2 M4 และ Intel \| Amphon.co.th | มี Mac mini มือสอง M1 M2 M4 M4 Pro หรือ Intel ต้องการขาย ส่งชิป RAM SSD รูปสภาพ และอุปกรณ์เพื่อประเมินเบื้องต้น ราคาสุดท้ายยืนยันหลังตรวจเครื่อง | https://amphon.co.th/บริการ/รับซื้อ-mac-mini | Mac mini มือสองขายได้เท่าไหร่ รับซื้อ M1 M2 M4 และ Intel | Yes |
| `/พื้นที่ให้บริการ/ขอนแก่น` | รับซื้อคอม ขอนแก่น โน๊ตบุ๊ค MacBook นัดรับในพื้นที่ \| Amphon.co.th | รับซื้อคอมและโน๊ตบุ๊ค ขอนแก่น พร้อม MacBook โทรศัพท์ กล้อง และสินค้าไอที ส่งรูปประเมินก่อน มีทีมงานนัดรับตามพื้นที่และรอบงานที่ยืนยัน | https://amphon.co.th/พื้นที่ให้บริการ/ขอนแก่น | รับซื้อคอม ขอนแก่น โน๊ตบุ๊ค MacBook นัดรับในพื้นที่ | Yes |

---

## Sitemap

| Check | Result |
|---|---|
| `https://amphon.co.th/sitemap-0.xml` | HTTP 200 |
| RAM URL present | Yes |
| Mac mini URL present | Yes |
| Khon Kaen URL present | Yes |
| Indexing API / manual sitemap submit | **Not performed** (per batch rules) |

---

## Lighthouse

Ran Lighthouse CLI **13.4.1** (`--only-categories=seo`, headless) against Production:

| Route | SEO score | Indexable | Title | Meta description | Canonical | Crawlable anchors | Console errors audit |
|---|---:|---|---|---|---|---|---|
| รับซื้อแรม | 1.0 | Pass | Pass | Pass | Pass | Pass | Present in report (not used as content fail) |
| Mac mini | 1.0 | Pass | Pass | Pass | Pass | Pass | Present in report (not used as content fail) |
| ขอนแก่น | 1.0 | Pass | Pass | Pass | Pass | Pass | Present in report (not used as content fail) |

Performance lab scores were not used as release criteria.

---

## Security

| Check | Result |
|---|---|
| Raw GSC CSV / audit folder committed | **No** — excluded via `.git/info/exclude` |
| OAuth client/token committed | **No** |
| Credential scan on production HTML (3 URLs) | **Clean** |
| `git add .` / `git add -A` used | **No** |

---

## Final confirmation

- [x] Merged to main (`--no-ff`)
- [x] Pushed `origin/main`
- [x] Deployed (Vercel Production Ready)
- [x] Production verified (3 URLs)
- [x] No GSC raw data or credentials in git history for this release
