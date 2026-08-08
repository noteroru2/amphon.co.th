# GSC-R5D Computer Cluster Production Release

## Final verdict

**PASS_WITH_WARNING**

R5 computer hub architecture is live on production. National / Custom / Gaming ownership verified. Accepted warnings remain intentional:

- `DESKTOP_CONFLICT_HOLD`
- `GAMING_ALIAS_HOLD`

No Production blockers. No redirects / noindex / canonical merges on HOLD routes.

## Git

| Item | Value |
| --- | --- |
| Source branch | `seo/gsc-r5-computer-hub-architecture` |
| Base SHA | `2e3a65aae0c5e1eb02a0ed1b7bc687601b947b37` |
| Implementation SHA | `2c975ddcdd5e66baf7a20158f58f7811e85750a9` |
| Main before merge | `2e3a65aae0c5e1eb02a0ed1b7bc687601b947b37` |
| Merge SHA | `a42d4878292b09caa77b0d61cff03a9f8092c173` |
| Content / deploy SHA | `a42d4878292b09caa77b0d61cff03a9f8092c173` |
| Final main SHA | *(docs commit may advance after this report)* |

Merge message: `merge: release GSC-R5 computer hub architecture`

Diff scope: **12 files only** (3 R5B sources + Footer + images.ts + service-clusters.ts + Services Index + playstation split + 3 approved backlinks + R5C QA). No GSC/OAuth/credentials/scratch.

### Dirty worktree at release start

Unrelated tracked modifications and untracked audits/scratch remained local and were **not** included in merge or docs commit. Checkout/merge proceeded safely without reset/stash of user work.

## Source branch

Verified local + `origin/seo/gsc-r5-computer-hub-architecture` = `2c975dd…` before merge.

## Pre-deploy QA

| Check | Result |
| --- | --- |
| Content markers National / Custom / Gaming | PASS |
| Near-me metadata | absent |
| Footer National Hub link | PASS |
| Homepage Computer destination | `/บริการ/รับซื้อคอมพิวเตอร์` ALREADY_CORRECT |
| Services Index National + Custom + Gaming | PASS |
| HOLD page content changes | desktop-pc backlink only; others unchanged |
| Privacy / ownership section | PASS |
| Risky claims (hard) | **0** (false-positive substring in conditional sentence ignored) |

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | PASS **21/21** |
| `npx astro check` | **0 errors** |
| `npm run build` | **PASS** |
| Broken links (R5 destinations) | **0** |
| Schema errors | **0** |

## Astro

0 errors (hints only in unrelated scratch/scripts).

## Build

Build HTML QA on National / Custom / Gaming / HOLD desktop & alias / Workstation / Homepage / Services index: title×1, description×1, canonical×1, H1×1, indexable, FAQ (services), LINE, tel, no YAML/GSC leak.

## Broken links

**0** for component + architecture destinations checked.

## Schema

JSON-LD present; FAQPage on service hubs; no credential/GSC leakage.

## Deployment

| Item | Value |
| --- | --- |
| Platform | Vercel Production |
| Deployment ID | `dpl_5zLhvfX14mTXuqmsUhthndGMv3qJ` |
| Deployment URL | https://amphon-co-bqm0fukqk-amphons-projects-bb1ec3bf.vercel.app |
| Status | **Ready** |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, project + `git-main` |
| Content / Production SHA | `a42d487` (merge on main that triggered deploy) |

## National Computer Hub

Live `https://amphon.co.th/บริการ/รับซื้อคอมพิวเตอร์`

- HTTP **200**, redirects **0**
- Title / H1 match expected source + `| Amphon.co.th`
- Markers: National Computer Hub, CPU/GPU/Mainboard/RAM/SSD/HDD/PSU, child types, Inventory List, data-handling
- Hero `/images/pc/buy-pc.webp` HTTP 200
- Links to desktop / custom / gaming-pc / workstation / company + components
- LINE + tel; FAQ + JSON-LD OK

**Verdict: PASS**

## Custom PC

Live `/บริการ/รับซื้อคอมประกอบ`

- HTTP **200**
- Title / H1 expected
- Custom PC markers + National Hub backlink + Gaming contextual link
- Hero `/images/pc/buy-com.webp` HTTP 200

**Verdict: PASS**

## Gaming PC

Live `/บริการ/รับซื้อ-gaming-pc`

- HTTP **200**
- Title / H1 expected
- Gaming / PC Gaming / Zero-RPM / Artifact / Inventory + hub/custom links
- Hero `/images/pc/buy-pc-gaming.webp` HTTP 200

**Verdict: PASS**

## Homepage

Generic Computer → `/บริการ/รับซื้อคอมพิวเตอร์` — **ALREADY_CORRECT**  
Gaming card → `/บริการ/รับซื้อ-gaming-pc` — present  
H1 unchanged.

## Footer

`รับซื้อคอมพิวเตอร์` → `/บริการ/รับซื้อคอมพิวเตอร์` — **PASS** (live)

## Services Index

National Hub + Custom PC + Gaming PC discoverable — **PASS** (live)

## Internal Link Architecture

| Check | Verdict |
| --- | --- |
| Homepage generic → National Hub | PASS |
| Footer → National Hub | PASS |
| Index National + Custom + Gaming | PASS |
| National → specialists + components | PASS |
| Custom → National (+ Gaming when gaming) | PASS |
| Gaming → National (+ Custom when custom) | PASS |
| No accidental generic→Gaming/Custom mass move | PASS |

Incoming static counts (approx, matches R5C):

| Destination | Count |
| --- | --- |
| National Hub | ~107 |
| Custom PC | ~28 |
| Gaming PC | ~32 |

National remains strongest generic hub.

## DESKTOP_CONFLICT_HOLD

**PASS** — `/บริการ/รับซื้อ-desktop-pc` and `/บริการ/รับซื้อคอมพิวเตอร์ตั้งโต๊ะ` remain live, indexable, self-canonical; only approved contextual backlink on desktop-pc; no redirect/noindex/title/H1/slug change.

## GAMING_ALIAS_HOLD

**PASS** — `/บริการ/รับซื้อคอมเกมมิ่ง` remains live; primary discovery prefers `/บริการ/รับซื้อ-gaming-pc`; no alias redirect/noindex in this release.

## Privacy Guardrail

**PASS** — backup, logout, BitLocker, company IT, storage exclusion, reset-after-confirm. No wipe-guarantee / unauthorized company intake claims.

## Risky Claims

**0** hard claims on the three hubs.

## Images

| Asset | Status |
| --- | --- |
| `/images/pc/buy-pc.webp` | HTTP 200, `image/webp` |
| `/images/pc/buy-com.webp` | HTTP 200, `image/webp` |
| `/images/pc/buy-pc-gaming.webp` | HTTP 200, `image/webp` |

Thumbnail mapping National → `buy-pc.webp` live.

## Sitemap

- `sitemap-index.xml` / `sitemap-0.xml` HTTP **200**
- National / Custom / Gaming each appear **once** (encoded locs; National substring false-positive vs `คอมพิวเตอร์ตั้งโต๊ะ` ignored)
- Canonicals match live pages
- No sitemap resubmit

## Lighthouse

| Page | SEO score | title | description | crawlable | canonical |
| --- | --- | --- | --- | --- | --- |
| National Hub | **1.0** | pass | pass | pass | pass |
| Custom PC | **1.0** | pass | pass | pass | pass |
| Gaming PC | **1.0** | pass | pass | pass | pass |

Performance not a blocker.

## Security Scan

Git merge tree + live HTML: **0** hits for GSC CSV, OAuth, tokens, client secrets, Windows user paths, scratch credentials.

## Production Verification

All target live routes HTTP 200, H1×1, canonical self, indexable, architecture markers/links confirmed. HOLD pages untouched functionally.

## Final confirmation

- merged: **yes**
- pushed main: **yes**
- Production Ready: **yes** (`dpl_5zLhvfX14mTXuqmsUhthndGMv3qJ`)
- no GSC/OAuth/CSV committed: **yes**
- no redirects/noindex on HOLD pages: **yes**
