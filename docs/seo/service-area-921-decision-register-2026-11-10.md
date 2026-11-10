# SEO P0 service × province audit — 10 Nov 2026

## Scope and source
- GitHub Source `src/content/serviceAreas`: **1,020** Markdown files, grouped by `serviceSlug` and `areaSlug`.
- Published build and sitemap `/รับซื้อ/`: **921** URLs.
- **99** source files were not emitted in this build (existing filtering/merge rules). Do not reindex without reviewing their intended status.
- GSC 28-day final window **2026-10-10 .. 2026-11-06**: **391** URL rows for /รับซื้อ/; **549** total clicked visits, **6,563** impressions in the observed rows; **242** rows with zero clicks and **360** with <=3. Google anonymization and filtering mean the other 530 URLs are **UNKNOWN**, not zero-demand.
- Source audit CI: https://github.com/noteroru2/amphon.co.th/actions/runs/42845795710
- CSV artifact: `service-area-audit-921` (files `all-source-pages.csv`, `indexable-921.csv`, `manual-review.csv`, `summary.json`). The script is deterministic and can be rerun on any commit with a new Astro build.

## Findings (diagnostic rules, not ranking penalties)

- 219 indexable pages exceed the source-text sibling-similarity threshold. Province names are normalized when comparing pages.
- 153 pages contain fewer than 1,700 source-text characters.
- 170 pages contain fewer than three Q&A frontmatter entries; 160 have fewer than two H2 headings.
- 852 pages lack **Ubon disclosure in the Markdown source**, but this is **NOT evidence** that the shared HTML layout lacks the storefront address. Before treating this as a defect, verify rendered pages and SEO intent.
- 20 iPad Markdown files contain a UTF-8 BOM (U+FEFF). An initial audit flagged broken frontmatter, **false positive**; the script now strips BOM without altering files or SEO.
- There are 47 `serviceSlug` families including iPad after BOM handling.

### Families with high near-duplicate concentration

| Family | Active URLs | High-similarity flagged | Average source length before final BOM correction |
| --- | ---: | ---: | ---: |
| รับเหมาประมูลอุปกรณ์ไอที | 20 | 20 | ~714 chars |
| รับซื้อ Server | 20 | 19 | ~719 chars |
| รับซื้อ UPS | 20 | 19 | ~721 chars |
| รับซื้อทีวี | 20 | 19 | ~707 chars |
| รับซื้อเฟอร์นิเจอร์ | 20 | 19 | ~736 chars |
| รับซื้อโดรน | 20 | 19 | ~724 chars |
| รับซื้อ Network | 20 | 18 | ~889 chars |
| รับซื้อเครื่องใช้ไฟฟ้า | 20 | 10 | ~1,714 chars |

**Interpretation:** These are content-repetition heuristics, not evidence of a manual action or a Google spam-policy violation. Some have actual traffic and may meet local needs. Check seller intent, actual pick-up feasibility, backlinks and page-level GSC before changes.

## Traffic protection — observed commercial URLs

Protect and inspect these examples before altering any route, canonical or indexing:
- `/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-อุดรธานี`: 38 clicks / 479 impressions.
- `/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี`: 35 / 511.
- `/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-ร้อยเอ็ด`: 29 / 278.
- `/รับซื้อ/รับซื้อเฟอร์นิเจอร์-อุบลราชธานี`: 29 / 223.
- `/รับซื้อ/รับซื้อทีวี-อุดรธานี`: 25 / 186.
- `/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-ขอนแก่น`: 24 / 397.

The names above are checked as Google Search Console page rows; no position/CTR copied from sampled query aggregations.

## Decision workflow (no automatic deletion)

1. `KEEP`: Proven qualified seller leads, genuine geographically distinct service and/or independent backlinks. Preserve canonical and URLs. Improve original evidence and local conditional logistics only where real.
2. `IMPROVE`: Relevant intent but thin/duplicative. Add **verified** assessment checklists, product-specific logistics, local handling evidence, actual operator disclosure; not mass-generated city-name swaps.
3. `OWNER_REVIEW`: Unclear demand or operational feasibility, especially non-IT furniture/large appliances. Verify what is really purchased, how and in which provinces.
4. `MERGE_CANDIDATE`: Only if intent truly matches a stronger page, after retrieving finalized page×query GSC, internal links, external backlinks and confirming destination. Use explicit one-hop 301, updated sitemap/internal links, regression QA.
5. `EXCLUDE`: If there is no real service, no unique user value and no reasonable safe target, decide manual noindex with owner permission; never bulk-noindex by low-click criterion.

## Reconciliation with earlier SEO work
Previous batch-12A/12F owner decisions and explicit merge rules in `src/config/seo-policy.ts` must take precedence. **Do not redo approved redirects or unpublish previously protected URLs**. This document is a cross-all-pages evidence overlay, not a second unrelated site-architecture rebuild.

## Measurements after content deployment
- Baseline 28-day final period: 2026-10-10..11-06.
- For edits to the 3 category parent pages: track queries plus page metrics, qualified LINE contacts, and valid business leads at 7/14/28 days after **actual production deployment**, not PR creation.
- For 921-area route changes: there have been **none in this PR**. Any future index/redirect action needs a separate PR and owner review; retain before/after snapshots for the URL cohort.
