# GSC-R6D Corporate / Bulk Production Release

## Final verdict

**PASS_WITH_WARNING**

Corporate / Bulk IT architecture is live on production. Parent Hub discovery and parent↔child separation verified. Accepted warnings from R6C remain:

1. **IMAGE_REUSE_WARNING** — `buy-office-pc-lot.webp` shared by Office PC + Bulk PC (not a Production blocker)
2. **AUCTION_TONE_FOLLOW_UP** — hard trust claims cleaned; Auction marketing tone may need later rewrite (not done in R6D)

No Production blockers. No redirects / noindex / canonical merges / slug changes / R2–R5 frozen edits.

## Git

| Item | Value |
| --- | --- |
| Source branch | `seo/gsc-r6-corporate-bulk-it-architecture` |
| Base SHA | `a2c388705a6352696d21248b0e8c363e3ea655a7` |
| Implementation SHA | `a8faebfcdc69d5828a69dc0a9567bf809707c964` |
| Main before merge | `a2c388705a6352696d21248b0e8c363e3ea655a7` |
| Merge SHA | `632a82194594ba40bb8222d6929b72c9a163a6c4` |
| Content / deploy SHA | `632a82194594ba40bb8222d6929b72c9a163a6c4` |
| Final main SHA | `ddd2aa19c10640a758c8c52f6d8bb533005c4d6a` (docs-only) |

Merge message: `merge: release GSC-R6 corporate bulk IT architecture`

Diff scope: **22 files only** (8 R6B sources + Homepage/B2B + Footer + Services Index + service-clusters + images + supporting backlinks + Auction trust cleanup + R6C QA). No GSC CSV / OAuth / `.env` / scratch / R2–R5 frozen content.

### Dirty worktree at release start

Unrelated tracked modifications and untracked audits/scratch remained local and were **not** included in merge or docs commit. Checkout/merge proceeded safely without reset/stash of user work.

## Source Branch

Verified local + `origin/seo/gsc-r6-corporate-bulk-it-architecture` = `a8faebf…` before merge.

## Base SHA

`a2c388705a6352696d21248b0e8c363e3ea655a7` (= R5D docs commit / main tip before R6 merge). Main had not advanced beyond base at merge time.

## Implementation SHA

`a8faebfcdc69d5828a69dc0a9567bf809707c964`

## Main Before Merge

`a2c388705a6352696d21248b0e8c363e3ea655a7`

## Merge SHA

`632a82194594ba40bb8222d6929b72c9a163a6c4`

## Final Main SHA

`ddd2aa19c10640a758c8c52f6d8bb533005c4d6a` (docs-only; Content/deploy SHA remains `632a82194594ba40bb8222d6929b72c9a163a6c4`).

## R6 Architecture

Primary Corporate / Bulk IT Parent Hub: `/บริการ/รับซื้อสินค้าไอทีบริษัท`

Children:

| Route | Role |
| --- | --- |
| `/บริการ/รับซื้อคอมบริษัท` | Corporate computer / employee-device lifecycle |
| `/บริการ/รับซื้อคอมสำนักงาน` | Office PC / SME / small-office |
| `/บริการ/รับซื้อคอมยกล็อต` | Quantity-first bulk computer |
| `/บริการ/รับซื้อโน๊ตบุ๊คบริษัท` | Corporate employee notebook lifecycle |
| `/บริการ/รับซื้อโน๊ตบุ๊คยกล็อต` | Quantity-first bulk notebook |
| `/บริการ/รับซื้ออุปกรณ์ไอทีบริษัท` | Office IT peripherals (not Parent) |
| `/บริการ/รับซื้อ-server-network` | Infrastructure specialist hub |

Supporting: clearance + office equipment. Auction: contractor + procurement (trust cleanup only).

## Parent Hub

Live `https://amphon.co.th/บริการ/รับซื้อสินค้าไอทีบริษัท`

- HTTP **200**, no unexpected redirect
- Title / H1 match R6B expected (+ `| Amphon.co.th`)
- Markers: Corporate / Bulk IT Parent Hub, Inventory List, Asset Tag, Serial, authorized disposal, Storage included/excluded, Domain / MDM, BitLocker, Server / Network, company/bulk PC & notebook, Office IT
- Child links present to all 6 specialist children (+ clearance as appropriate)
- Hero `/images/b2b/buy-company-it-assets.webp` HTTP 200

**Verdict: PASS**

## Company Computer

Live `/บริการ/รับซื้อคอมบริษัท` — Asset List, employee devices, Storage, Domain/MDM, authorized disposal, Parent uplink. Hero `/images/b2b/buy-company-computers.webp` HTTP 200.

**Verdict: PASS**

## Office PC

Live `/บริการ/รับซื้อคอมสำนักงาน` — Office PC / SME role, not Corporate Parent, Parent uplink. Hero `buy-office-pc-lot.webp` (shared).

**Verdict: PASS**

## Bulk PC

Live `/บริการ/รับซื้อคอมยกล็อต` — Quantity-first, no fixed lot thresholds, mixed condition, Inventory List, Parent uplink. Same hero reuse warning.

**Verdict: PASS**

## Company Notebook

Live `/บริการ/รับซื้อโน๊ตบุ๊คบริษัท` — Asset Tag / Serial / MDM / Adapter / Dock / Storage / corporate lifecycle + Parent uplink. Hero `buy-notebook-company2.webp` HTTP 200.

**Verdict: PASS**

## Bulk Notebook

Live `/บริการ/รับซื้อโน๊ตบุ๊คยกล็อต` — Quantity-first notebook, condition groups, Adapter / Storage / Inventory List + Parent. Hero `buy-notebook-all.webp` HTTP 200.

**Verdict: PASS**

## Office IT

Live `/บริการ/รับซื้ออุปกรณ์ไอทีบริษัท` — peripherals (Monitor/UPS/Dock/KVM/Printer/Scanner), not Parent, Server/Network specialist + Parent uplinks. Hero `buy-company-it-equipment.webp` HTTP 200.

**Verdict: PASS**

## Server Network

Live `/บริการ/รับซื้อ-server-network` — Server/NAS/UPS/Switch/Router/Firewall, Part Number, Drive/Controller/Module/Rail, License/Subscription, Parent uplink. Disclaimer explicitly **does not** claim Certified Data Destruction. Hero `buy-server-network.webp` HTTP 200.

**Verdict: PASS**

## Homepage

B2B generic discovery chip + first B2B card → `/บริการ/รับซื้อสินค้าไอทีบริษัท`. Live HTML confirms Parent destination.

**Verdict: PASS**

## Footer

`รับซื้อสินค้าไอทีบริษัท` → Parent Hub.

**Verdict: PASS**

## Services Index

Parent featured first; children discoverable in B2B cluster.

**Verdict: PASS**

## B2B Cluster

Parent node first / primary; auction de-prioritized from hub prominence (per R6C).

**Verdict: PASS**

## Supporting Pages

| Route | Role check |
| --- | --- |
| `/บริการ/รับเคลียร์อุปกรณ์ไอทีสำนักงาน` | **CLEARANCE_SUPPORT_ROLE = PASS** — indexable, Parent uplink, no redirect/noindex/canonical merge |
| `/บริการ/รับซื้ออุปกรณ์สำนักงานมือสอง` | **OFFICE_EQUIPMENT_SUPPORT_ROLE = PASS** — same |

## Auction Trust Guardrail

Routes:

- `/บริการ/รับเหมาประมูลอุปกรณ์ไอที`
- `/บริการ/รับประมูลคอมพิวเตอร์มือสอง`

Hard claims cleaned in R6C remain absent as **positive claims**. Disclaimer text that *rejects* “Certified Data Destruction” / Secure Erase misunderstanding is present (intentional guardrail; not a reintroduced claim).

Absent as offerings: 1,000+ machines, Certificate of Data Destruction, nationwide free audit guarantee, government/hospital/university experience claims, unverified case studies, “ได้เงินชัวร์”, “สบายใจ 100%”, truck capacity specifics.

**Auction claim verdict: PASS** (AUCTION_TONE_FOLLOW_UP warning retained for later rewrite)

## Procurement / Government Guardrail

`/บริการ/รับประมูลคอมพิวเตอร์มือสอง` still frames price as purchase / preliminary offer (not formal appraisal), seller/org follows own procedure, authorized disposal only — no bypass of ครุภัณฑ์ rules.

**Verdict: PASS**

## Privacy / Data Handling

Core R6 pages retain: org owns data policy, backup first, Domain/MDM, BitLocker, Storage included/excluded, Asset Tag/Serial, authorized disposal, Account/Activation, License/Subscription. No Reset/Format = secure erase guarantee, no PDPA compliance guarantee, no destruction certificate claim.

**Verdict: PASS**

## Risky Claims

Core risky claims remaining as false offerings: **0**

## Images

All expected heroes exist in build/public and return HTTP 200 on production.

## Image Reuse Warning

`buy-office-pc-lot.webp` used by Office PC + Bulk PC → **IMAGE_REUSE_WARNING** (accepted; not changed in R6D).

## Sitemap

Production `sitemap-0.xml`: each of 8 R6 core URLs appears **once**, HTTP 200, indexable. Supporting/Auction left at current index policy (unchanged). No sitemap resubmit required.

## Lighthouse

Production Lighthouse SEO:

| Page | SEO score | Critical SEO fails |
| --- | --- | --- |
| Parent Hub | **1.0** | none |
| Company Computer | **1.0** | none |
| Server Network | **1.0** | none |
| Company Notebook | **1.0** | none |

Performance: not a blocker.

## Tests

| Command | Result |
| --- | --- |
| `npm run test` | **NOT_CONFIGURED** |
| `npm run test:google-reviews` | PASS **21/21** |
| `npx astro check` | **0 errors** |
| `npm run build` | **PASS** |

## Astro

0 errors.

## Build

Build HTML QA (14 routes: 8 core + 2 supporting + 2 auction + home + services index): title×1, description×1, canonical×1, H1×1, indexable, FAQ/JSON-LD, LINE, tel, no YAML leak. Metadata matches expected R6B titles/H1s.

## Broken Links

**0** for Parent↔child and discovery destinations checked.

## Schema

Service / Breadcrumb / FAQ / LocalBusiness / Organization present as designed. JSON parse OK. LocalBusiness remains อุบลราชธานี-only. No fake branch / aggregateRating / Review / Offer / Product price / certification schema introduced by R6.

## Security Scan

Source + build scan for OAuth tokens, client secrets, `.env`, credential filenames: **0 hits**. No GSC CSV / OAuth committed in merge or docs commit.

## Production Verification

| Item | Value |
| --- | --- |
| Platform | Vercel Production |
| Deployment ID | `dpl_7mnNoSjMczA6wcVCh8zMDXxm8tZq` |
| Deployment URL | https://amphon-co-f5z1qbi5h-amphons-projects-bb1ec3bf.vercel.app |
| Status | **Ready** |
| Aliases | `https://amphon.co.th`, `https://www.amphon.co.th`, project + `git-main` |
| Content / Production SHA | `632a82194594ba40bb8222d6929b72c9a163a6c4` |

Live QA: 8 core + supporting + auction + homepage + services index → HTTP 200, expected metadata/markers, heroes 200, Parent discovery on homepage, Parent↔child links intact.

### Incoming link counts (approx, src)

| Target | Count |
| --- | --- |
| Parent | **28** |
| Company PC | **88** |
| Office IT | **16** |

Direction matches R6C baseline (Parent elevated; Company PC / Office IT reduced as mixed-IT links moved to Parent).

## Final Confirmation

- Merged R6 branch into `main`
- Pushed `main`
- Production **Ready** on `amphon.co.th`
- No GSC / OAuth / CSV / credentials committed
- No R2 / R3 / R4 / R5 frozen pages modified
- No redirects / noindex / canonical merges added
- No unverified Auction trust claims reintroduced as offerings
- No Auction tone rewrite beyond R6C cleanup
- Docs report committed separately after Ready (Final main SHA ≠ Content/deploy SHA)
