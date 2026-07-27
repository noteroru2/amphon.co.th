# Batch 4 Homepage Controlled SEO Optimization

## Executive Summary

- Verdict: **PASS WITH WARNING**
- Branch: `batch-4-homepage-controlled-optimization`
- Starting SHA: `8826048`
- Final SHA: Git commit containing this report
- Homepage URL: `https://amphon.co.th/`
- Homepage source: `src/pages/index.astro`
- GSC average position: 4.86
- GSC clicks: 139
- GSC impressions: 3,778
- GSC CTR: 3.68%
- Title changed: No
- H1 changed: No
- Meta description changed: Yes
- Controlled service links: 4 → 6
- Controlled province links: 8 → 6
- Total internal-link instances: 220 → 90
- Unique internal destinations: 159 → 39
- Footer links: unchanged at 28
- Astro sync: PASS
- Build: PASS
- Astro check: PASS
- Sitemap: PASS
- Homepage broken links: 0
- Commit: `seo: refine homepage services and internal linking`
- Push: branch only
- Merge: No
- Deploy: No

## Important Interpretation

The homepage already ranks at average position 4.86, so Batch 4 follows a preserve-first strategy. The current Title and H1 remain unchanged because the export does not provide evidence strong enough to justify altering either high-risk field. The primary content change is controlled routing: six service hubs and six evidence-based province hubs replace collection-order and homepage sitemap behavior.

## GSC Findings

The workbook contains separate `ข้อความค้นหา` and `หน้า` sheets, not a Query × Page export. Therefore:

- Confirmed query conflicts: 0
- Probable on-page overlaps: RAM, notebook, and computer service intent
- Possible mismatches: phone, iPhone, iPad, MacBook, camera, and province intent
- Query × Page available: No
- Interpretation: `Insufficient evidence — query-to-landing-page relationship cannot be confirmed`

The homepage should own brand and broad company/service intent. Product-specific, province-specific, and informational queries should be routed to their dedicated hub pages.

## Title Decision

**KEEP CURRENT TITLE**

`รับซื้อสินค้าไอทีมือสองทั่วประเทศ | AMPHON TRADING | Amphon.co.th`

The rendered Title preserves broad service intent and brand coverage. With position 4.86 and no Query × Page data, changing it would create more risk than evidence-supported upside.

## Meta Description Change

Before:

`รับซื้อโน๊ตบุ๊ค คอมพิวเตอร์ RAM iPhone iPad MacBook และสินค้าไอทีมือสอง ส่งรูปเช็กราคาได้ มีหน้าร้านจริงที่อุบลราชธานี รองรับลูกค้าทั่วประเทศ`

After:

`อำพล เทรดดิ้ง รับซื้อสินค้าไอทีมือสอง ทั้งโน๊ตบุ๊ค โทรศัพท์ iPad MacBook RAM คอมพิวเตอร์และกล้อง ส่งรูปประเมินฟรี หน้าร้านอยู่อุบลราชธานี พร้อมนัดรับหรือจัดส่งตามพื้นที่`

## Homepage Content Changes

1. Reconfigured the existing popular-service block to six intentional hub pages.
2. Reconfigured the province block to six GSC/business-priority province hubs.
3. Clarified that the only main storefront is in Ubon Ratchathani.
4. Clarified preliminary pricing, optional sale decision, scheduled pickup, conditional shipping, final inspection, and payment.
5. Aligned OfferCatalog and ItemList schema items with the six visible service/province cards.
6. Removed the homepage-only rescue-link dump that exposed 135 unique service destinations.
7. Preserved URL, canonical, Title, H1, hero, primary CTA, footer, service pages, location pages, and existing content clusters.

## Service Links Added

| Service | Anchor | Destination |
| --- | --- | --- |
| RAM | รับซื้อ RAM | `/บริการ/รับซื้อแรม` |
| Notebook | รับซื้อโน๊ตบุ๊ค | `/บริการ/รับซื้อโน๊ตบุ๊ค` |
| Telephone | รับซื้อโทรศัพท์ | `/บริการ/รับซื้อโทรศัพท์มือสอง` |
| iPad | รับซื้อ iPad | `/บริการ/รับซื้อ-ipad` |
| MacBook | รับซื้อ MacBook | `/บริการ/รับซื้อ-macbook` |
| Camera | รับซื้อกล้อง | `/บริการ/รับซื้อกล้อง` |

## Province Links Added

| Province | Reason |
| --- | --- |
| อุบลราชธานี | Main storefront and business truth; 4 clicks / 55 impressions |
| บุรีรัมย์ | 9 clicks / 233 impressions / position 7.51 |
| กาฬสินธุ์ | 7 clicks / 162 impressions / position 8.01 |
| อุดรธานี | 11 clicks / 284 impressions / position 8.37 |
| ขอนแก่น | 11 clicks / 261 impressions / position 8.69 |
| นครราชสีมา | 4 clicks / 182 impressions / position 8.54 |

## Internal Link Equity

The homepage no longer exposes a sitemap-like list of service/model pages. Service-link instances fell from 178 to 50 and unique service destinations from 135 to 20. The six controlled service cards and six province cards provide clear routing while existing category, B2B, header, and footer navigation remain intact.

## Business Location Clarity

- Main storefront: Ubon Ratchathani
- No branches were claimed in other provinces
- Customers outside Ubon can send photos and details for preliminary evaluation
- Pickup is scheduled only in service areas after details are agreed
- Final price is confirmed after physical inspection
- Payment occurs only if the seller agrees
- Shipping is available only under confirmed conditions

## Technical QA

- Astro sync: PASS
- Build: PASS
- Astro check: PASS, 0 errors
- Sitemap: PASS
- Canonical: unchanged
- Metadata: PASS
- H1: one, unchanged
- JSON-LD: PASS; no fake rating/review/location schema added
- Homepage broken links: 0
- Mobile overflow: none
- Browser console errors/warnings: 0
- Repository-wide warnings: pre-existing out-of-scope H1, broken-link, orphan, and claim-pattern findings are documented in `batch-4-qa-report.md`

## Files Not Touched

- Service Page content
- Location Page content
- iPad cluster
- iPhone cluster
- MacBook cluster
- Batch 3 content
- Redirects
- Noindex
- Dependencies
- Lockfile
- Concurrent user-edited service/blog files
- Batch 5 work

## Remaining Risks

1. Query × Page data is unavailable, so landing-page conflicts cannot be confirmed.
2. The homepage already ranks well and should be measured before another metadata/content change.
3. Four pre-existing alias routes remain orphaned.
4. Seventeen pre-existing missing internal targets remain outside Batch 4 scope.
5. A repository-wide iPad H1 issue remains outside Batch 4 scope.
6. Avoid adding another broad homepage link block in the next iteration.

## Measurement Plan

- Before deployment: preserve this GSC baseline.
- Days 1–7: verify crawlability, canonical, sitemap, and homepage rendering.
- Days 14–28: review homepage CTR/impressions and service-page impressions.
- Days 42–56: compare Query × Page ownership, ranking distribution, and click distribution.
- Do not change the Title again during the primary measurement window without stronger evidence.

## Report Paths

1. `batch-4-homepage-baseline.md`
2. `batch-4-homepage-gsc-query-audit.csv`
3. `batch-4-homepage-query-ownership.csv`
4. `batch-4-title-decision.md`
5. `batch-4-meta-before-after.csv`
6. `batch-4-internal-links-before-after.csv`
7. `batch-4-anchor-audit.csv`
8. `batch-4-files-changed.csv`
9. `batch-4-qa-report.md`
10. `batch-4-final-report.md`
