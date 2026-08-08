# GSC-R5C Computer Cluster Internal Linking QA

## Final verdict

**PASS_WITH_WARNING**

R5B content installed and verified. National / Custom / Gaming ownership paths are correct on Homepage, Footer, Services Index, and R5B sources. One WRONG_GAMING_TO_GENERIC fix applied. Desktop conflict and Gaming alias pages left untouched (no redirect / noindex / rewrite). Warnings: HOLD groups remain; RAM freeze page still has mixed Gaming→Custom anchor text (not edited); several CONTEXT_DEPENDENT / HOLD_GAMING_ALIAS links left for GSC evidence.

## Environment

| Item | Value |
| --- | --- |
| Node | v22.20.0 |
| Astro | ^6.4.2 |
| Date | 2026-08-08 |
| OS | Windows 10 |

## Git

| Item | Value |
| --- | --- |
| Branch | `seo/gsc-r5-computer-hub-architecture` |
| Base / origin/main | `2e3a65aae0c5e1eb02a0ed1b7bc687601b947b37` |
| Working tree | R5B + R5C scoped edits; unrelated dirty files excluded from commit |

## R5B content verification

| File | Role | Status |
| --- | --- | --- |
| `src/content/services/รับซื้อคอมพิวเตอร์.md` | National Computer Hub | INSTALLED — markers present; no ใกล้ฉัน in metadata |
| `src/content/services/รับซื้อคอมประกอบ.md` | Custom PC Specialist | INSTALLED — Custom PC / parts / backlink to hub |
| `src/content/services/รับซื้อ-gaming-pc.md` | Primary Gaming PC Hub | INSTALLED — Gaming / Zero-RPM / Artifact / hub+custom links |

## Frontmatter

| Page | title / h1 / slug / draft / FAQ / quickSummary | Near-me / wrong primary |
| --- | --- | --- |
| National | PASS — draft false, updated 2026-08-08, FAQ+quickSummary | No ใกล้ฉัน |
| Custom | PASS — primary = รับซื้อคอมประกอบ | Not chasing generic รับซื้อคอม |
| Gaming | PASS — primary = รับซื้อ Gaming PC | Not chasing Workstation / generic computer |

YAML parse / schema: Astro content sync + check 0 errors.

## National Computer Hub ownership

Generic discovery destinations:

| Surface | Destination | Verdict |
| --- | --- | --- |
| Homepage priority chip | `/บริการ/รับซื้อคอมพิวเตอร์` | ALREADY_CORRECT |
| Footer | `/บริการ/รับซื้อคอมพิวเตอร์` | FIXED (added) |
| Services index chip/slugs | `/บริการ/รับซื้อคอมพิวเตอร์` | ALREADY_CORRECT |
| OfferCatalog / related chips | desktop + custom + gaming-pc | FIXED (clusters) |

## Custom PC ownership

| Surface | Destination | Verdict |
| --- | --- | --- |
| National Hub body | `/บริการ/รับซื้อคอมประกอบ` | CORRECT_CUSTOM_PC |
| Services index PC cluster | included | CORRECT_CUSTOM_PC |
| National Hub intent chips / related cards | added | FIXED |
| Homepage dedicated Custom card | none (not added; no homepage rewrite) | Discoverable via Hub + Index |

## Gaming PC ownership

| Surface | Destination | Verdict |
| --- | --- | --- |
| Homepage computer hub card | `/บริการ/รับซื้อ-gaming-pc` | ALREADY_CORRECT |
| Footer | `/บริการ/รับซื้อ-gaming-pc` | ALREADY_CORRECT |
| Services index PC cluster | `รับซื้อ-gaming-pc` added | FIXED |
| National Hub related / chips | `รับซื้อ-gaming-pc` (replaced alias in overrides) | FIXED |
| External Gaming anchors → `/บริการ/รับซื้อคอมเกมมิ่ง` | left | HOLD_GAMING_ALIAS |

## Homepage

- Generic Computer → `/บริการ/รับซื้อคอมพิวเตอร์` — **ALREADY_CORRECT**
- Gaming card → `/บริการ/รับซื้อ-gaming-pc` — **ALREADY_CORRECT**
- H1 / homepage body — **unchanged** (no rewrite)

## Footer

| Anchor | Before | After | Verdict |
| --- | --- | --- | --- |
| รับซื้อคอมพิวเตอร์ | (missing) | `/บริการ/รับซื้อคอมพิวเตอร์` | FIXED |
| รับซื้อคอมพิวเตอร์ตั้งโต๊ะ | desktop route | unchanged | HOLD / keep |
| รับซื้อ Gaming PC | gaming-pc | unchanged | CORRECT_GAMING_PC |

## Services index

| Item | Verdict |
| --- | --- |
| National Hub in PC cluster | CORRECT |
| Custom PC in PC cluster | CORRECT |
| Gaming PC slug added to PC cluster | FIXED |
| Workstation slug added | FIXED |
| Desktop cards retained | PASS (not removed) |

## Generic anchor audit (representative)

| Source | Anchor | Current destination | Context | Verdict |
| --- | --- | --- | --- | --- |
| `index.astro` | รับซื้อคอมพิวเตอร์ | `/บริการ/รับซื้อคอมพิวเตอร์` | priority chip | CORRECT_NATIONAL_HUB |
| `Footer.astro` | รับซื้อคอมพิวเตอร์ | `/บริการ/รับซื้อคอมพิวเตอร์` | footer services | CORRECT_NATIONAL_HUB (after fix) |
| `รับซื้อ-playstation.md` | รับซื้อคอมพิวเตอร์ / Gaming PC | was National Hub only | mixed gaming+generic | WRONG_GAMING_TO_GENERIC → **FIXED** (split) |
| `รับซื้อแรม.md` | Gaming PC หรือเครื่องประกอบ → Custom | related list | mixed | WRONG_CUSTOM (Gaming intent) — **LEFT** (RAM freeze) |
| `รับซื้อเมนบอร์ด.md` | คอมประกอบ / คอมพิวเตอร์ตั้งโต๊ะ | Custom only | mixed desktop/custom | HOLD_DESKTOP_CONFLICT / CONTEXT_DEPENDENT |
| `รับซื้อซีพียู.md` | คอมประกอบ / คอมพิวเตอร์ตั้งโต๊ะ | Custom only | mixed | HOLD_DESKTOP_CONFLICT / CONTEXT_DEPENDENT |
| `รับซื้อเครื่องเกม.md` | รับซื้อคอมเกมมิ่ง (Gaming PC) | `/บริการ/รับซื้อคอมเกมมิ่ง` | gaming | HOLD_GAMING_ALIAS |
| `รับซื้อจอเกมมิ่ง.md` | รับซื้อคอมเกมมิ่ง (Gaming PC) | alias | gaming | HOLD_GAMING_ALIAS |
| `รับซื้อ-nintendo-switch.md` | รับซื้อคอมเกมมิ่ง (Gaming PC) | alias | gaming | HOLD_GAMING_ALIAS |
| Blog GPU / สเปกคอม | รับซื้อคอมเกมมิ่ง | alias | gaming blog | HOLD_GAMING_ALIAS |
| Area pages | คอมพิวเตอร์ตั้งโต๊ะ | National Hub | area CTA | CONTEXT_DEPENDENT |
| `รับซื้อคอมเกมมิ่ง.md` | รับซื้อ Gaming PC | `/บริการ/รับซื้อ-gaming-pc` | alias→primary | CORRECT_GAMING_PC |

**Wrong fixed count:** 1 (playstation)  
**Context-dependent / HOLD unchanged:** ≥10 (intentional)

## Child backlinks

| Page | Hub backlink | Action |
| --- | --- | --- |
| คอมพิวเตอร์ตั้งโต๊ะ | already present | none |
| desktop-pc | missing → added 1 contextual | FIXED |
| คอมประกอบ | already present | none |
| gaming-pc | already present | none |
| คอมเกมมิ่ง | already present | none |
| workstation | missing → added 1 | FIXED |
| คอมบริษัท | missing → added 1 | FIXED |
| คอมสเปกสูง / สตรีม / etc. | follow-up if needed | FOLLOW-UP LIST (no mass edit) |

## Desktop conflict hold

**DESKTOP_CONFLICT_HOLD**

Pages untouched (no redirect / canonical / noindex / rewrite / title / H1 / slug):

- `/บริการ/รับซื้อ-desktop-pc`
- `/บริการ/รับซื้อคอมพิวเตอร์ตั้งโต๊ะ`

Only: role check + optional hub backlink (desktop-pc) + classify + GSC evidence request.

## Gaming alias hold

**GAMING_ALIAS_HOLD**

- Primary candidate: `/บริการ/รับซื้อ-gaming-pc`
- Thai alias `/บริการ/รับซื้อคอมเกมมิ่ง` remains live; Thai page already links to Gaming PC hub
- Homepage / Footer / Index / National Hub chips now prefer gaming-pc
- External Gaming-labeled links still often hit alias — left for GSC Query × Page

## Component links

From National Hub body — all routes exist:

| Destination | Exists |
| --- | --- |
| `/บริการ/รับซื้อการ์ดจอ` | yes |
| `/บริการ/รับซื้อซีพียู` | yes |
| `/บริการ/รับซื้อแรม` | yes |
| `/บริการ/รับซื้อเมนบอร์ด` | yes |
| `/บริการ/รับซื้อ-ssd` | yes |
| `/บริการ/รับซื้อจอคอม` | yes |
| `/บริการ/รับซื้ออุปกรณ์คอมพิวเตอร์` | yes |

Broken destinations: **0**

## Image QA

| Page | Expected | Status |
| --- | --- | --- |
| National | `/images/pc/buy-pc.webp` | file exists; frontmatter + `images.ts` thumbnail/featured aligned |
| Custom | `/images/pc/buy-com.webp` | OK |
| Gaming | `/images/pc/buy-pc-gaming.webp` | OK |

## Privacy / data handling

National Hub section “การจัดการข้อมูลก่อนขายคอม” covers backup, account logout, BitLocker, company IT, storage exclusion, reset after confirmation. No guarantee-of-wipe / unverified company intake claims found.

## Risky claims

Scan of three R5B sources: **0** hard risky claims (รับทุกเครื่อง / ราคาสูงสุด / จ่ายทันที / นัดรับทุกจังหวัด / etc.). Conditional language retained.

## Schema

- FAQ + Service/JSON-LD present on service builds
- Canonical self on all checked routes
- Indexable robots
- Address references: อุบลราชธานี only (no fake branch)
- Astro check: **0 errors**

## Rendered metadata

| Route | Title | Length | Description | Length | H1 |
| --- | --- | --- | --- | --- | --- |
| `/บริการ/รับซื้อคอมพิวเตอร์` | รับซื้อคอม รับซื้อคอมพิวเตอร์มือสอง PC ส่งสเปกประเมินก่อนขาย \| Amphon.co.th | 75 | (source desc) | 152 | รับซื้อคอม รับซื้อคอมพิวเตอร์มือสอง ส่งรูปและสเปกประเมินก่อนขาย |
| `/บริการ/รับซื้อคอมประกอบ` | รับซื้อคอมประกอบมือสอง ส่งสเปก CPU GPU RAM SSD ประเมินก่อนขาย \| Amphon.co.th | 76 | (source desc) | 149 | รับซื้อคอมประกอบมือสอง ประเมินจากชิ้นส่วนและสภาพจริง |
| `/บริการ/รับซื้อ-gaming-pc` | รับซื้อ Gaming PC มือสอง ส่งสเปก CPU GPU ประเมินก่อนขาย \| Amphon.co.th | 70 | (source desc) | 136 | รับซื้อ Gaming PC มือสอง ส่งสเปกและรูปเครื่องประเมินก่อนขาย |

Title length warnings: none actionable (suffix only).

## Incoming link counts (static `src/` occurrences)

| Destination | Before (approx, pre R5C link edits) | After | Important sources |
| --- | --- | --- | --- |
| `/บริการ/รับซื้อคอมพิวเตอร์` | ~103 | 107+ | Footer, Homepage, Index, hubs, areas |
| `/บริการ/รับซื้อคอมประกอบ` | ~28 | 28+ | Hub body, chips, related |
| `/บริการ/รับซื้อ-gaming-pc` | ~31 | 32+ | Footer, Homepage, playstation fix, clusters |
| `/บริการ/รับซื้อคอมพิวเตอร์ตั้งโต๊ะ` | ~21 | ~21 | HOLD (unchanged intent) |
| `/บริการ/รับซื้อ-desktop-pc` | ~7 | ~7 | HOLD |

Direction prioritized over raw quantity.

## GSC evidence required (local-only checklist — do not commit CSV)

### Desktop Query × Page

Queries: รับซื้อ desktop pc · รับซื้อ desktop pc มือสอง · รับซื้อคอมตั้งโต๊ะ · รับซื้อคอมพิวเตอร์ตั้งโต๊ะ · รับซื้อ pc ตั้งโต๊ะ · desktop pc มือสอง  

Compare: `/บริการ/รับซื้อ-desktop-pc` · `/บริการ/รับซื้อคอมพิวเตอร์ตั้งโต๊ะ` · `/บริการ/รับซื้อคอมพิวเตอร์`

### Gaming Query × Page

Queries: รับซื้อ gaming pc · รับซื้อคอมเกมมิ่ง · รับซื้อคอมเล่นเกม · รับซื้อ pc gaming · รับซื้อคอมประกอบเล่นเกม · รับซื้อคอมสเปกสูง  

Compare: `/บริการ/รับซื้อ-gaming-pc` · `/บริการ/รับซื้อคอมเกมมิ่ง` · `/บริการ/รับซื้อคอมเล่นเกมสเปกแรง` · `/บริการ/รับซื้อคอมสเปกสูง` · `/บริการ/รับซื้อคอมประกอบ`

Store under `docs/gsc-r5-local/` (excluded) only.

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | PASS (21/21) |
| `npx astro check` | PASS — 0 errors |
| `npm run build` | PASS |

## Build

- Build HTML QA on National / Custom / Gaming / Desktop HOLD / Gaming alias / Workstation / Homepage / Services index: title×1, description×1, canonical×1, H1×1, indexable, FAQ (services), LINE, tel, no YAML/GSC leak
- Broken links in R5C destinations: **0**
- Schema errors: **0**

## Security

| Item | Status |
| --- | --- |
| `docs/gsc-r*-local/` | excluded via `.git/info/exclude` |
| OAuth / credentials / `.env` / GSC CSV | not staged |
| Windows user paths | not committed |

## Diff (eligible R5C scope)

Source / architecture files:

- `src/content/services/รับซื้อคอมพิวเตอร์.md` (R5B)
- `src/content/services/รับซื้อคอมประกอบ.md` (R5B)
- `src/content/services/รับซื้อ-gaming-pc.md` (R5B)
- `src/content/services/รับซื้อ-desktop-pc.md` (+1 hub backlink)
- `src/content/services/รับซื้อ-workstation.md` (+1 hub backlink)
- `src/content/services/รับซื้อคอมบริษัท.md` (+1 hub backlink)
- `src/content/services/รับซื้อ-playstation.md` (split gaming link)
- `src/components/Footer.astro`
- `src/config/images.ts`
- `src/config/service-clusters.ts`
- `src/pages/รับซื้อสินค้าไอที.astro`
- `docs/gsc-r5c-computer-cluster-internal-linking-qa-2026-08-08.md`

No R2/R3/R4 / phone / RAM / province mass edits in eligible set.

## Files eligible to commit

Explicit list above only.

## Files excluded

- Unrelated dirty docs/scripts/blog/area edits already in worktree
- `docs/batch-2-macbook-cannibalization-audit/`
- `scratch/`
- GSC CSV / OAuth / credentials / `.env`
- `sitewide-deep-audit.md`, `verify_production_results.json`

## Recommended production step

1. Review PR on `seo/gsc-r5-computer-hub-architecture`
2. Collect GSC Query × Page for Desktop + Gaming HOLD groups
3. Only then decide consolidation / redirects
4. Do **not** merge/deploy from this batch automation without owner approval
