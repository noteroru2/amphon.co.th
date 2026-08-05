# GSC-R2 Implementation QA

**Batch:** GSC-R2 — Implementation QA  
**Date:** 2026-08-05  
**Site:** https://amphon.co.th/  
**Mode:** QA + commit on feature branch only (no merge / no deploy)

---

## Final verdict

# PASS_WITH_WARNING

Build, Astro check, frontmatter, schema, images, and internal routes for the three replaced pages all pass. Commit is eligible.

**Warnings (non-blocking):**

1. Risky-phrase scanner matched `มีสาขาขอนแก่น` at `src/content/areas/ขอนแก่น.md` line **376** as heading `### มีสาขาขอนแก่นไหม` — body on line **378** answers **ไม่มี** and restates Ubon storefront. Not an affirmative branch claim; left unchanged per “do not auto-edit copy.”
2. Word count decreased on Mac mini (2254 → 1066) and Khon Kaen (1107 → 897) after the user-supplied replacements. Content was not rewritten by this batch.
3. `npm run test` is **NOT_CONFIGURED**. Configured suite `npm run test:google-reviews` passed (21/21).

---

## Environment

| Item | Value |
|---|---|
| Branch | `seo/gsc-r2-top-opportunities` (created from `main`) |
| Base / HEAD before commit | `3fc3496dfd4f6c6e49e649eb209a0140a6784a7e` |
| Node.js | `v24.14.1` |
| Astro | `6.4.2` |
| Git status before commit | 3 modified content files + untracked `docs/gsc-revenue-audit-2026-08-05/` (excluded) |

---

## Source files

| Page | Source file | Slug | Canonical route |
|---|---|---|---|
| หน้ารับซื้อแรม | `src/content/services/รับซื้อแรม.md` | `รับซื้อแรม` | `/บริการ/รับซื้อแรม` |
| หน้ารับซื้อ Mac mini | `src/content/services/รับซื้อ-mac-mini.md` | `รับซื้อ-mac-mini` | `/บริการ/รับซื้อ-mac-mini` |
| หน้าพื้นที่ขอนแก่น | `src/content/areas/ขอนแก่น.md` | `ขอนแก่น` | `/พื้นที่ให้บริการ/ขอนแก่น` |

Only these three source files were modified in the working tree (plus this QA report). No other site pages were edited in this batch.

---

## Frontmatter validation

| File | YAML | title×1 | description×1 | slug unchanged | mainKeyword | relatedKeywords array | hero/og exist | draft false | FAQs | dup keys | delimiters |
|---|---|---|---|---|---|---|---|---|---|---|---|
| รับซื้อแรม.md | OK | OK | OK | OK (`รับซื้อแรม`) | `รับซื้อแรม` | OK | OK / OK | OK | 6 | none | OK |
| รับซื้อ-mac-mini.md | OK | OK | OK | OK (`รับซื้อ-mac-mini`) | `รับซื้อ Mac mini` | OK | OK / OK | OK | 7 | none | OK |
| ขอนแก่น.md | OK | OK | OK | OK (`ขอนแก่น`) | `รับซื้อคอม ขอนแก่น` | OK | OK / OK | OK | 6 | none | OK |

All three include `updated: "2026-08-05"` consistent with optional `updated` in `src/content.config.ts`. No extra cosmetic fields added by QA.

---

## Content structure validation

| Check | รับซื้อแรม | Mac mini | ขอนแก่น |
|---|---|---|---|
| Rendered H1 count | 1 | 1 | 1 |
| Duplicate headings (MD) | none | none | none |
| Empty links | none | none | none |
| Empty important image alts | none | none | none |
| Unbalanced code fences | no | no | no |
| Page-topic coverage (spec §5–7) | all required themes present | all required themes present (incl. M3 clarified as not sold) | all required themes present |

**Mac mini specifics:** clarifies Apple has no Mac mini M3; Activation Lock must be removed before handover; no fixed buyback price table; CTO uplift not promised as a fixed add-on.

**Khon Kaen specifics:** Ubon storefront stated; no Khon Kaen branch/storefront; appointment-based coverage; no fake Khon Kaen address.

---

## Internal link validation

Collected markdown internal links from the three pages (excluding image `![]()` paths).

| Source page | Anchor text | Destination | Status | Final URL |
|---|---|---|---|---|
| `/บริการ/รับซื้อแรม` | (11 service/area/blog targets) | `/บริการ/…`, related hubs | OK | `https://amphon.co.th/…` |
| `/บริการ/รับซื้อ-mac-mini` | (7 Apple-related targets) | `/บริการ/…`, `/blog/…` | OK | `https://amphon.co.th/…` |
| `/พื้นที่ให้บริการ/ขอนแก่น` | service-area + contact links | `/รับซื้อ/…`, `/contact` | OK | `https://amphon.co.th/…` |

- Broken content routes: **0**
- `/contact` resolves via `src/pages/contact.astro`
- No link URL fixes required

---

## Image validation

| File | heroImage | ogImage | Body images | Notes |
|---|---|---|---|---|
| รับซื้อแรม.md | `/images/services/rub-sue-ram-ddr4-ddr5-amphon.webp` exists | same | exists + alt present | OK |
| รับซื้อ-mac-mini.md | `/images/services/rub-sue-mac-mini-amphon.webp` exists | same | OK | OK |
| ขอนแก่น.md | `/images/hero/hero-amphon-trading-map-isan.webp` exists | `/images/og/og-area-khonkaen.webp` exists | OK | OK |

No new images created. Build reported no asset errors for these pages.

---

## Build validation

| Command | Result |
|---|---|
| `npm run test` | **NOT_CONFIGURED** (missing script) |
| `npm run test:google-reviews` | **PASS** — 21/21 |
| `npx astro check` | **PASS** — 0 errors (63 hints pre-existing elsewhere) |
| `npm run build` | **PASS** (`windows-safe-astro-build` Complete) |

---

## Rendered SEO output

From `dist/client/…/index.html` after build:

| Route | Rendered title | Length | Rendered description | Length | H1 |
|---|---|---:|---|---:|---|
| `/บริการ/รับซื้อแรม` | รับซื้อ RAM มือสอง DDR3 DDR4 DDR5 ส่งรูปประเมินราคาได้ \| Amphon.co.th | 69 | รับซื้อ RAM มือสองสำหรับ PC โน๊ตบุ๊ค และ Server ทั้ง DDR3 DDR4 DDR5 ส่งรูปสติกเกอร์ รุ่น ความจุ บัส และจำนวนแผงเพื่อประเมินเบื้องต้นได้ | 135 | รับซื้อ RAM มือสอง DDR3 DDR4 DDR5 ส่งรูปประเมินราคาได้ |
| `/บริการ/รับซื้อ-mac-mini` | Mac mini มือสองขายได้เท่าไหร่ รับซื้อ M1 M2 M4 และ Intel \| Amphon.co.th | 71 | มี Mac mini มือสอง M1 M2 M4 M4 Pro หรือ Intel ต้องการขาย ส่งชิป RAM SSD รูปสภาพ และอุปกรณ์เพื่อประเมินเบื้องต้น ราคาสุดท้ายยืนยันหลังตรวจเครื่อง | 144 | Mac mini มือสองขายได้เท่าไหร่ รับซื้อ M1 M2 M4 และ Intel |
| `/พื้นที่ให้บริการ/ขอนแก่น` | รับซื้อคอม ขอนแก่น โน๊ตบุ๊ค MacBook นัดรับในพื้นที่ \| Amphon.co.th | 66 | รับซื้อคอมและโน๊ตบุ๊ค ขอนแก่น พร้อม MacBook โทรศัพท์ กล้อง และสินค้าไอที ส่งรูปประเมินก่อน มีทีมงานนัดรับตามพื้นที่และรอบงานที่ยืนยัน | 133 | รับซื้อคอม ขอนแก่น โน๊ตบุ๊ค MacBook นัดรับในพื้นที่ |

Additional render checks (all three):

- Canonical ×1 matching production route
- Robots: no `noindex`
- LINE CTA `href` present
- Phone CTA uses `tel:`
- Hero/key image `alt` present
- FAQ section + FAQPage schema present
- No raw Markdown/YAML / GSC credential leakage in HTML

---

## Schema validation

| Route | JSON-LD parse errors | LocalBusiness | Khon Kaen address in LocalBusiness | FAQPage |
|---|---:|---:|---:|---:|
| รับซื้อแรม | 0 | 1 (Ubon) | 0 | 1 |
| Mac mini | 0 | 1 (Ubon) | 0 | 1 |
| ขอนแก่น | 0 | 1 — `addressRegion: อุบลราชธานี`, street `740/8 ถนนชยางกูร` | **0** | 1 |

No conflicting duplicate LocalBusiness with a Khon Kaen storefront address.

---

## Risky claims scan

Scanner phrases from batch spec. Hits:

| File | Line | Phrase | Context |
|---|---:|---|---|
| `src/content/areas/ขอนแก่น.md` | 376 | `มีสาขาขอนแก่น` | Heading `### มีสาขาขอนแก่นไหม` — answered **ไม่มี** on L378 |

No hits on RAM or Mac mini pages for the forbidden claim list. No automatic copy edits performed.

---

## Security scan

| Check | Result |
|---|---|
| OAuth / token / client secret in the 3 sources | Not found |
| GSC raw CSV / queries in sources or built HTML of the 3 routes | Not found |
| Windows credential paths in sources/HTML | Not found |
| Staging of `docs/gsc-revenue-audit-2026-08-05/*` | **Excluded** |

---

## Diff summary

`git diff --stat` (content only):

```
src/content/areas/ขอนแก่น.md           | 244 insertions, 378 deletions
src/content/services/รับซื้อ-mac-mini.md | 258 insertions, 224 deletions
src/content/services/รับซื้อแรม.md       | 221 insertions,  90 deletions
3 files changed, 723 insertions(+), 692 deletions(-)
```

| File | +lines | −lines | Words before → after | Title before → after | H1 before → after |
|---|---:|---:|---|---|---|
| รับซื้อแรม.md | 221 | 90 | 527 → 712 | รับซื้อแรม RAM… → รับซื้อ RAM มือสอง… | รับซื้อแรมมือสอง (RAM)… → (body H2) รับซื้อ RAM มือสองสำหรับ… / rendered H1 = title |
| รับซื้อ-mac-mini.md | 258 | 224 | 2254 → 1066 | รับซื้อ Mac mini มือสอง M2 และ M4… → Mac mini มือสองขายได้เท่าไหร่… | ทำไม Mac mini… → (body H2) Mac mini มือสองขายได้เท่าไหร่ เริ่มจาก… / rendered H1 = title |
| ขอนแก่น.md | 244 | 378 | 1107 → 897 | รับซื้อคอม ขอนแก่น…นัดรับถึงพื้นที่ → …นัดรับในพื้นที่ | รับซื้อคอม ขอนแก่น…จ่ายเงินหน้างาน → (body H2) …รับประเมินโน๊ตบุ๊ค… / rendered H1 = title |

No unrelated formatter / line-ending-only files in the working tree.

---

## Files eligible to commit

- `src/content/services/รับซื้อแรม.md`
- `src/content/services/รับซื้อ-mac-mini.md`
- `src/content/areas/ขอนแก่น.md`
- `docs/gsc-r2-implementation-qa-2026-08-05.md`

---

## Files excluded from commit

- Entire `docs/gsc-revenue-audit-2026-08-05/` (GSC raw/derived CSV + prior audit)
- Any OAuth client/token files (outside repo under user config; never staged)
- `.env` / secrets
- Unrelated site source

---

## Recommended next step

1. Review PR for branch `seo/gsc-r2-top-opportunities` against `main`.
2. Spot-check production preview of the three URLs after merge approval.
3. Do **not** merge or deploy from this QA batch automatically.
4. Optional: rephrase Khon Kaen FAQ heading if you want zero scanner hits (e.g. “มีสาขาในขอนแก่นหรือไม่”) — content meaning already correct.
