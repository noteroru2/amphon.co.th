# AMPHON Service Area Editorial Review — 17 November 2026

## Evidence and scope

- Baseline: `release/cloudflare-production` commit `d376e3c3ff66bd27020a2f3894f0a2e791833acc`, 1,020 service-area sources, 921 indexable/rendered URLs, 47 service families.
- GSC Final interval 2026-10-18..2026-11-14 (before Cloudflare SEO release), no claim about post-release rankings. See `docs/seo-evidence/gsc-amphon-final-pages-2026-10-18-to-11-14.json`.
- Review cohort: 16 source pages shorter than 1,700 normalized characters and 57 source pages `SHORT_AND_SIMILAR`; 2 overlap, total 71 unique URLs. See `docs/seo-evidence/editorial-cohort-16-and-57-2026-11-17.json`.
- Five affected pages already have organic clicks: /รับซื้อ/รับซื้อเฟอร์นิเจอร์-ศรีสะเกษ (4), /รับซื้อ/รับซื้อโดรน-อุบลราชธานี (2), /รับซื้อ/รับซื้อโดรน-ขอนแก่น (2), /รับซื้อ/รับซื้อ-ups-มหาสารคาม (1), /รับซื้อ/รับซื้อของสะสม-อุบลราชธานี (1). These are **page-level** GSC numbers for the 28-day baseline, not attributable purchases.

## Editorial decision (reviewed, not mass-generated)

| Decision | Count | What changed |
| --- | ---: | --- |
| Improve short sources with real technical buyer preparation guidance | 16 | Unique device/lot checklists, what sellers must photograph, safe handling, account and owner authorization, no unverified buyback prices |
| Improve additional already-clicked regional pages | 2 | Furniture-Si Sa Ket and Drone-Khon Kaen: product-specific assessment questions and honest service boundaries |
| Preserve original page copy pending more evidence | 53 | Broad repetitive-text removal was **explicitly reverted** when a post-change heuristic showed more strong-similarity warnings; do not publish a knowingly worse batch merely to satisfy a count |
| Unchanged other indexable regional pages | 850 | No mass edits, redirects or noindex |

Source edits therefore total 18, with all 71 URLs reviewed and assigned explicit disposition. "No change pending verification" is an intentional editorial decision, not an automated assumption that pages have no search traffic.

## Outstanding editorial evidence, by family

| Family | Flagged cohort | Real additional evidence needed before substantive page-specific content |
| --- | ---: | --- |
| Drone / Action Cam | 14 | Actual inspected drone models, anonymized photo evidence and observed repair/lock/battery/gimbal conditions; do not imply local team |
| IT equipment auction / company lots | 13 | Actual lot types and quantities, authorized-disposal documents, tested/untested classification, transport arrangements. Never claim winning bids without proof |
| UPS / power backup | 11 | Model, VA/W, Battery Pack separation, test evidence, safe logistics decisions; no blanket acceptance for damaged batteries |
| Furniture | 10 | Evidence of actual furniture intake or cases relevant to IT-office batches; no claims of general house clearance |
| Server | 7 | Authentic asset sheet, storage removed/retained, ECC RAM/drive tray status, owner authority and safe data handling |
| TV | 7 | Tested screen condition, model/size, pickup/courier feasibility, actual acceptance scope |
| Household electrical items | 4 | Core IT vs non-IT intake policy, real product categories accepted, heavy transport constraints and verified service claims |
| Network | 4 | Model/license/PoE, cloud unbind and authorized disposal, safe secrets/config deletion |
| Collectibles | 1 | Actual categories accepted, completeness authenticity and transport; do not promise all types |

The 53 pages are **not** automatically set to `noindex`, deleted, redirected, or given new canonical URLs. Before consolidation, check GSC by exact percent-encoded URL, Indexing, link equity, lead events and any *real* location-specific value. GSC absence is UNKNOWN, not zero. Do not create province-specific fabricated transactions, invented office locations, guaranteed home pickup or made-up purchase prices.

## Release and QA acceptance

- Protected: page count 921, site sitemap 1,189 URLs, existing legacy redirect map, canonical/index robots, Ubon-only storefront, `09:00–19:00` and LINE `@webuy` message intake.
- Source/route gate: `node scripts/qa-safe-regional-editorial.mjs` restricts changes to the frozen 71-path cohort, allows only body copy plus factual updated date, prevents an unauthorized schema/policy/route change.
- Content GSC overlay: `node scripts/seo-gsc-quality-921.mjs` and `node scripts/seo-audit-editorial-targets.mjs`.
- Full Cloudflare Worker dry-run and SEO regression through the existing GitHub Actions. Do not modify DNS or Worker bindings for a content-only update.
- Google Business review star JSON-LD guard remains.
- After deployment: inspect the five clicked URLs and three service parents, verify no regressions, record SHA and Worker version. Watch GSC 7/14/28 days (no invented rank gain).

## Why the blanket edit was rejected

A trial removal of repeated common text across 55 similar pages did shorten generic boilerplate, but the raw shingle similarity heuristic **worsened from 0 strong-similarity warnings to 33** because the remaining shared layout/legal/FAQ language occupied a greater share of the source. The source-language change was rolled back for 53 low-evidence URLs. This metric is only a screening heuristic, not a statement about Google's algorithms, but it demonstrates why bulk SEO rewriting without real evidence is risky.

**Next safe editorial batch:** prioritize additional pages with confirmed GSC impressions/clicks, after attaching genuine, publishable inspection or service evidence rather than changing province names in a template.
