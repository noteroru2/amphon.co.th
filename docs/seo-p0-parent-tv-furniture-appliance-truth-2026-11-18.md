# P0 service-parent truth correction — 2026-11-18

## Why this separate release candidate exists
The 4+4 provincial-page editorial improvements in [draft PR #63](https://github.com/noteroru2/amphon.co.th/pull/63) and [draft PR #64](https://github.com/noteroru2/amphon.co.th/pull/64) would conflict with broad, unsupported commitments in parent pages for TV, furniture, and household appliances. This patch is deliberately **independent, from unmodified `main` SHA `f3f91b804432c9b56542db38d70547f657cd54de`**, so the business/truth issue can be reviewed without carrying 8 local edits.

## Actual GSC FINAL data, 2026-10-18 through 2026-11-14 (Thai paths percent-encoded)
| Exact parent page | Clicks | Impressions | Avg position | Receipt |
| --- | ---: | ---: | ---: | --- |
| `/บริการ/รับซื้อทีวี` | **128** | **2,718** | 7.34 | `72e82a49-a42d-4873-bae5-fae8eafc5ffd` |
| `/บริการ/รับซื้อเฟอร์นิเจอร์` | 0 reported | 0 reported | N/A | `43216903-02f4-43ab-8814-718fdb1600ad` |
| `/บริการ/รับซื้อเครื่องใช้ไฟฟ้า` | 0 | 6 | 5.00 | `5a57a004-a1a3-467c-a2e1-68bf12173d08` |

*Important: GSC omitted/anonymized rows do not prove no demand. TV is an established higher-traffic page; protect query ownership and the main keyword.*

## Changes limited to three existing parent Markdown files
- **TV:** change title's blanket pickup guarantee to intake intent; remove unsupported table of buy prices, 30-min reply promise, guaranteed pickup across Isan, blanket highest price claims, and false fixed age/warranty premium. Replace with display condition, model and fragile-shipping screening. Preserve original `slug`, `mainKeyword`, FAQ topics, links and media.
- **Furniture:** remove unsupported price ranges, guaranteed free staff transport, same-day cash, office clearance and guaranteed handoff timing. Explain item inventory (office desks/chairs/cabinets/racks), site dimensions/access, ownership proof, dismantling cost and non-guaranteed coverage.
- **Appliances:** remove unsupported purchase price ranges and unconditional free aircon dismantling, fixed delivery or pickup guarantee, bulk auction claims. Require qualified handling of refrigerant/installed equipment, safe electrical checks, appliance category-specific condition information.

No invented actual purchase cases, local offices, exact buy prices or government auction contracts. Store facts: `บริษัท อำพล เทรดดิ้ง จำกัด`, single storefront `740/8 ถนนชยางกูร ใกล้ซอย 32 อำเภอเมืองอุบลราชธานี`, 09:00–19:00, LINE `@webuy` can take messages 24h but staff reply according to queue. These statements should match current owner-confirmed reality before release.

## QA and release conditions
- Check three URL slugs, `mainKeyword`, self canonical, H1=1, indexability and sitemap presence (keep 921 service-area URLs) and working LINE CTA.
- Run source-clean build: `npm ci`, `npm run build`, `npm run validate:seo`, previous protected page cohort checks and `node scripts/check-p0-parent-service-truth.mjs`; fail on unsupported numeric offers/guarantees. The historic `--export` scripts are source-modifying even when run in QA; this PR disables their execution in the QA workflow and checks `git diff --exit-code` on both services and serviceAreas before and after build.
- **Do not merge/deploy while QA is pending**, or interpret a successful Vercel preview as Cloudflare Production released.
- Manual desktop/mobile preview, confirm CTA placement and legibility, verify active release branch relation to `amphon-co-th-production` and latest production SHA, owner approval before publish.
- Record exact release SHA/date and measure **final** GSC at 7, 14 and 28 days + qualified LINE inquiries. Preserve rollback artifact.

## Residual follow-up
The three pages may contain general marketing phrasing requiring further editorial review, but they no longer make the identified categorical pickup/free-disassembly/fixed-price commitments. Other service parent categories need their own audit; this PR must not claim all 921 content pages are fully human-verified.
