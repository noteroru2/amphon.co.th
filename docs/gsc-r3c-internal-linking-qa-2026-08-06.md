# GSC-R3C Internal Linking and Implementation QA

## Final verdict

**PASS_WITH_WARNING**

R3B content is installed on all three sources. Footer and Services Index now discover the National Phone Hub. Homepage popular cards already pointed generic phone/notebook to the correct National Hubs (ALREADY_CORRECT). No WRONG_GENERIC_TO_HOME destinations found that required content edits. Province-local notebook anchors that look “generic + province” were left unchanged as CORRECT_LOCAL (no mass province edit).

Warnings:

- `npm run test` is NOT_CONFIGURED (repo uses `test:google-reviews` only).
- Scanner false-positives labeled 14 province notebook links as WRONG_GENERIC_TO_LOCAL; human review reclassified them CORRECT_LOCAL / REVIEW_ONLY — not edited.
- `quickSummary` removed from Ubon serviceArea frontmatter only (not in `serviceAreas` schema). Body unchanged.

## Environment

| Item | Value |
|---|---|
| Current branch | `seo/gsc-r3-phone-notebook-architecture` |
| Base / origin/main SHA | `1485c6e9157241fec47bfda880608343d5e1ef01` |
| Node | v24.14.1 |
| Astro | ^6.4.2 |
| GSC local excludes | `.git/info/exclude` → `docs/gsc-revenue-audit-2026-08-05/`, `docs/gsc-r3-local/` |

## Source pages

| Page role | Source file | Slug | Route |
|---|---|---|---|
| National Phone Hub | `src/content/services/รับซื้อโทรศัพท์มือสอง.md` | `รับซื้อโทรศัพท์มือสอง` | `/บริการ/รับซื้อโทรศัพท์มือสอง` |
| National Notebook Hub | `src/content/services/รับซื้อโน๊ตบุ๊ค.md` | `รับซื้อโน๊ตบุ๊ค` | `/บริการ/รับซื้อโน๊ตบุ๊ค` |
| Ubon Notebook Local | `src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี.md` | `รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` |

No duplicate sources creating the same route.

## R3B content verification

| Marker group | Phone Hub | Notebook Hub | Ubon Local |
|---|---|---|---|
| Multi-brand / national role | PASS | PASS (`หน้าบริการหลักระดับประเทศ`) | PASS (Local Intent) |
| Sell-out / not pawn | PASS | N/A | N/A |
| Spec / condition topics | Activation Lock, FRP, ติดผ่อน, เสีย | CPU/RAM/SSD/GPU, Gaming, บริษัท, เสีย | Address 740/8 ชยางกูร ซอย 42 |
| Hub links | → iPhone, → โทรศัพท์เสีย | → Ubon + specialized | → `/บริการ/รับซื้อโน๊ตบุ๊ค` |

Verdict: **CONTENT_INSTALLED** (not CONTENT_NOT_INSTALLED). No body rewrite performed in R3C.

## Frontmatter validation

| Check | Phone | Notebook | Ubon |
|---|---|---|---|
| YAML parse | PASS | PASS | PASS |
| Single title/h1/description | PASS | PASS | PASS |
| Slug / serviceSlug / areaSlug | PASS | PASS | PASS |
| mainKeyword role | PASS | PASS | PASS |
| relatedKeywords no จำนำ/รับฝาก | PASS | PASS | PASS |
| heroImage / ogImage exist | PASS | PASS | PASS |
| draft: false | PASS | PASS | PASS |
| FAQ parse | PASS | PASS | PASS |
| updated | `2026-08-06` | `2026-08-06` | `2026-08-06` |
| quickSummary | In services schema | In services schema | **Removed** (not in serviceAreas schema) |

## Internal link architecture before

- Homepage popular cards: phone → Phone Hub, notebook → National Hub (already correct via slug).
- Footer: notebook → National Hub; iPhone present; **Phone Hub missing (P1)**.
- Services index featured/chips: iPhone present; **Phone Hub missing**.
- iPhone page already linked back to Phone Hub (contextual).
- Ubon Local already linked up to National Notebook Hub.
- National Notebook Hub already linked to Ubon + specialized pages.

## Internal link changes

| Source page/component | Anchor | Destination | Route exists | Redirect | Final URL | Status |
|---|---|---|---|---|---|---|
| `Footer.astro` | รับซื้อโทรศัพท์มือสอง | `/บริการ/รับซื้อโทรศัพท์มือสอง` | yes | none | same | ADDED |
| `Footer.astro` | รับซื้อโน๊ตบุ๊ค | `/บริการ/รับซื้อโน๊ตบุ๊ค` | yes | none | same | ALREADY_CORRECT |
| `รับซื้อสินค้าไอที.astro` chip + featured | รับซื้อโทรศัพท์มือสอง | `/บริการ/รับซื้อโทรศัพท์มือสอง` | yes | none | same | ADDED |
| `รับซื้อสินค้าไอที.astro` | Phone cluster slugs | Phone Hub / condition / มือถือ | yes | none | same | ADDED cluster |
| Homepage popular card | รับซื้อโทรศัพท์ | `/บริการ/รับซื้อโทรศัพท์มือสอง` | yes | none | same | ALREADY_CORRECT |
| Homepage popular card | รับซื้อโน๊ตบุ๊ค | `/บริการ/รับซื้อโน๊ตบุ๊ค` | yes | none | same | ALREADY_CORRECT |

Generic wrong links fixed in markdown bodies: **0** (none verified WRONG_GENERIC_TO_HOME).

Province “รับซื้อโน๊ตบุ๊ค {จังหวัด}” → local pages: left unchanged (**CORRECT_LOCAL**).

## Homepage boundary validation

- Homepage H1/title remain business-wide IT buyback (no phone/notebook primary keyword capture).
- Cards summarize and deep-link to National Hubs.
- No long phone/notebook article added.
- No “ใกล้ฉัน” stuffed into title/H1/section headings.

## Footer and navigation validation

| Surface | Phone Hub | Notebook Hub |
|---|---|---|
| Footer | ADDED | ALREADY_CORRECT |
| Header / mobile nav | Category hubs only (no wrong generic→local) | same |
| Services index | ADDED featured + chip + phone cluster | ALREADY_CORRECT chip/featured |
| Homepage cards | ALREADY_CORRECT | ALREADY_CORRECT |

Discovery points (indexable): Phone Hub ≥2 (Homepage + Footer + Services index). Notebook Hub ≥2 (Homepage + Footer + Services index).

## Phone Hub and iPhone separation

**PASS**

- Phone Hub links to `/บริการ/รับซื้อ-iphone` and `/บริการ/รับซื้อโทรศัพท์เสีย` with intent-separated anchors.
- iPhone already links back to Phone Hub; no duplicate spam links added.
- Title/H1 of iPhone unchanged.

## National and Local Notebook separation

**PASS**

- National Hub states national role and links to Ubon Local in the area section.
- Ubon Local links up with clear anchor “หน้ารับซื้อโน๊ตบุ๊คมือสองหลัก”.
- Homepage generic notebook → National Hub (not Ubon).

## Pawn/deposit guardrail

| Pattern | Hits in Phone Hub | Context |
|---|---:|---|
| จำนำ / รับฝาก | 2 | Disclaimers only (“ไม่ใช่จำนำหรือรับฝาก”) |
| relatedKeywords / title / meta targeting pawn | 0 | — |
| Homepage pawn targeting | 0 | — |

Blog pages that explain จำนำ vs ขายขาด exist separately and were not retargeted. **SHOULD_NOT_TARGET** maintained.

## Internal link validation

Broken internal links introduced: **0**

All destinations in the change set exist as built routes. No draft/noindex targets. No encoding errors observed in rendered hrefs.

## Content structure validation

| Check | Result |
|---|---|
| H1 count = 1 | PASS (all 3 + iPhone + home) |
| No body H1 duplicate | PASS |
| Markdown / fences | PASS |
| Risky claim phrases (guarantee / every unit / every day pickup) | **0 hits** on the 3 sources |
| FAQ frontmatter present | PASS |

## Image validation

| Page | heroImage | Exists |
|---|---|---|
| Phone Hub | `/images/mobile/buy-mobile-phones.webp` | yes |
| Notebook Hub | `/images/notebook/buy-notebook.webp` | yes |
| Ubon Local | `/images/services/rub-sue-notebook-laptops-acer-asus.webp` | yes |

Phone body uses mobile imagery. No new assets created.

## Schema validation

- JSON-LD parse: PASS on built HTML (1 graph each).
- FAQ schema present via layout FAQs.
- LocalBusiness address remains Ubon (geo TH-34).
- No AggregateRating / fake Review schema added in this batch.
- No จำนำ in serviceType from this work.

## Rendered SEO metadata

| Route | Title | Description | Canonical | H1 | Indexable | Incoming hub link |
|---|---|---|---|---|---|---|
| `/บริการ/รับซื้อโทรศัพท์มือสอง` | รับซื้อโทรศัพท์มือสองทุกยี่ห้อ iPhone Samsung OPPO vivo Xiaomi \| Amphon.co.th | (from FM) | `https://amphon.co.th/บริการ/รับซื้อโทรศัพท์มือสอง` | รับซื้อโทรศัพท์มือสองทุกยี่ห้อ ส่งรูปประเมินก่อนขาย | yes | Footer + Services index + Homepage card |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | รับซื้อโน๊ตบุ๊คมือสอง ส่งรูปเช็กราคา เครื่องดีและเครื่องเสีย \| Amphon.co.th | (from FM) | `https://amphon.co.th/บริการ/รับซื้อโน๊ตบุ๊ค` | รับซื้อโน๊ตบุ๊คมือสอง ส่งรูปและสเปกประเมินก่อนขาย | yes | Footer + Homepage + Local uplinks |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | รับซื้อโน๊ตบุ๊ค อุบลราชธานี มีหน้าร้าน ส่งรูปประเมินก่อนขาย \| Amphon.co.th | (from FM) | `https://amphon.co.th/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | รับซื้อโน๊ตบุ๊ค อุบลราชธานี มีหน้าร้านจริงและนัดรับตามพื้นที่ | yes | National Hub + area/blog |
| `/บริการ/รับซื้อ-iphone` | (unchanged) | (unchanged) | correct | (unchanged) | yes | links to Phone Hub |
| `/` | รับซื้อสินค้าไอทีมือสองทั่วประเทศ \| … | business-wide | `https://amphon.co.th` | business-wide | yes | cards → both hubs |

## Incoming link counts

Static unique source files linking to destination path (markdown/astro/config scan). Homepage cards use slug config (counted as sitewide card, not always as raw path string).

| Destination | Before incoming links | After incoming links | Important sources |
|---:|---:|---:|---|
| `/บริการ/รับซื้อโทรศัพท์มือสอง` | 4 | 6 (+ Homepage card already) | Footer (new), Services index (new), iPhone, โทรศัพท์เสีย, blogs |
| `/บริการ/รับซื้อโน๊ตบุ๊ค` | 70 | 70+ (unchanged architecture) | Footer, Homepage, many locals/services |
| `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี` | 3 | 3 | National Hub, area, blog |
| `/บริการ/รับซื้อ-iphone` | 64 | 64+ | Footer, locals, Apple cluster |

Breakdown for Phone Hub after:

- Sitewide: Footer
- Navigation / index: Services index chip + featured
- Contextual: iPhone, condition, blogs
- Homepage card: popularServices slug → `/บริการ/รับซื้อโทรศัพท์มือสอง`

## Tests and build

| Check | Result |
|---|---|
| `npm run test` | NOT_CONFIGURED |
| `npm run test:google-reviews` | PASS (21/21) |
| `npx astro check` | 0 errors |
| `npm run build` | PASS |
| Broken links (changed set) | 0 |
| Schema parse errors | 0 |
| Routes built (3 + iPhone + home) | yes |

## Security scan

- No GSC CSV / OAuth / `.env` staged.
- Built HTML: no credential leak, no GSC raw data.
- Local-only folders remain excluded via `.git/info/exclude`.

## Diff summary

```
src/components/Footer.astro                        | 1 +
src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี.md | R3B install + quickSummary removed
src/content/services/รับซื้อโทรศัพท์มือสอง.md           | R3B install (user)
src/content/services/รับซื้อโน๊ตบุ๊ค.md                 | R3B install (user)
src/pages/รับซื้อสินค้าไอที.astro                      | Phone Hub featured/chip/cluster
docs/gsc-r3c-internal-linking-qa-2026-08-06.md     | this report
```

Approximate body word counts after: Phone 686 · Notebook 836 · Ubon 674.

No R2 pages (RAM / Mac mini / ขอนแก่น) touched. No mass province edit.

## Files eligible to commit

- `src/content/services/รับซื้อโทรศัพท์มือสอง.md`
- `src/content/services/รับซื้อโน๊ตบุ๊ค.md`
- `src/content/serviceAreas/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี.md`
- `src/components/Footer.astro`
- `src/pages/รับซื้อสินค้าไอที.astro`
- `docs/gsc-r3c-internal-linking-qa-2026-08-06.md`

## Files excluded from commit

- `docs/gsc-r3-phone-notebook-architecture-2026-08-06.md` (R3A audit; prior untracked)
- `docs/gsc-r3-local/**` and all GSC CSVs / OAuth
- `docs/gsc-revenue-audit-2026-08-05/**`
- Unrelated working-tree QA scripts/outputs if present

## Recommended production step

1. Review this branch PR.
2. Merge to main only after owner approval (not done in R3C).
3. Deploy via normal Vercel production flow after merge.
4. Do **not** request indexing / Indexing API in this batch.
5. Optional follow-up: audit remaining province pages for National Hub uplinks where missing (no mass edit without diff review).
