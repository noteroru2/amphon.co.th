# AMPHON amphon.co.th — Cloudflare release and GSC registry (2026-11-16)

## Production baseline verified
- Host: https://amphon.co.th
- Cloudflare Worker: amphon-co-th-production
- Approved production source SHA: 885113107dc0627f62f599cde9a43a197733a29f
- Observed Worker version: e231e3ce-7016-49cb-9882-403c666debe4
- Cutover occurred 2026-11-15; precise Cloudflare audit timestamp not yet verified
- Sitemap: 1,189 URLs, original legacy redirects: 260
- Real business: บริษัท อำพล เทรดดิ้ง จำกัด, Ubon shop 09:00–19:00, LINE @webuy messages 24h
- Keep Vercel READY deployment dpl_DmtdiCXTsy6zBMKNVEehFyMoUBwr and previous Worker version for rollback

## Pre-cutover GSC FINAL property totals
Source: connected AMPHON_SEO seo_gsc_query site_id=amphon, dimensions=[] (NOT a sum of sampled queries). Dates use Search Console's Pacific data days.

| Window | Dates | Clicks | Impressions | CTR | Avg position |
|---|---|---:|---:|---:|---:|
| 7d | 2026-11-05..11-11 | 602 | 24,082 | 2.4998% | 5.6414 |
| 14d | 2026-10-29..11-11 | 1,192 | 47,626 | 2.5028% | 5.9061 |
| 28d | 2026-10-15..11-11 | 2,145 | 88,347 | 2.4279% | 6.4320 |

Latest property snapshot inspected 2026-11-16: GSC Final 2026-10-17..11-13: 2,162 clicks, 89,584 impressions, 2.4134% CTR, position 6.3569. This contains NO post-cutover data.

## Keyword ownership and action evidence (GSC FINAL 2026-10-17..11-13)
| Query | Canonical owner | Observations | Planned guarded adjustment |
|---|---|---|---|
| รับซื้อโน๊ตบุ๊ค | https://amphon.co.th/บริการ/รับซื้อโน๊ตบุ๊ค | 4 clicks / 48 imp / pos 22.67 | Clarify service evidence in meta description, retain title/H1/URL/canonical; do not fabricate prices or deals |
| รับซื้อคอมพิวเตอร์ | https://amphon.co.th/บริการ/รับซื้อคอมพิวเตอร์ | Landing page 3 clicks / 251 imp / pos 7.02 / CTR 1.20% | Improve Title/Description clarity for Gaming PC, office PCs, LINE intake. Do not alter H1/URL/canonical |
| รับซื้อคอมมือสอง | Verify query-by-page ownership before additional changes | Query aggregate 15 clicks / 398 imp / pos 6.64 | Protect against cannibalization |
| รับซื้อกล้องฟิล์ม | Preserve existing URL and redirects | 46 clicks / 122 imp / pos 2.07 | Protect high-performing page and encoded legacy redirects |

## Scheduled post-cutover GSC monitoring — already active
- 7-day period 2026-11-16..11-22; report 2026-11-25
- 14-day period 2026-11-16..11-29; report 2026-12-02
- 28-day period 2026-11-16..12-13; report 2026-12-16
- AMPHON SEO Hub site monitor is also enabled every 72h. Do not create duplicate schedules.
- Query property totals with dimensions=[], and separately page/query/date dimensions; never compare differing window lengths. Check GSC FINAL lag and Indexing/Crawl only if evidence exists; do not claim rankings based on immediate post-deploy HTML.

## CI, release evidence and rollout rules
1. Branch review: compare changes with frozen Cloudflare release and list changed URLs.
2. CI: pin Node/Astro lock; Google Reviews tests; Cloudflare build; SEO/JSON-LD; 1,189 sitemap; 260 redirects; 921 storefront-truth pages; robots/noindex/LINE; Worker dry-run. Upload candidate SHA + QA evidence JSON, but NEVER Auto Deploy from CI.
3. Deploy only a **tested SHA** to amphon-co-th-production with correct SESSION KV and Google Places secrets, after verified protected QA and rollback checks. Do not alter root/www DNS, other Workers or GitHub main.
4. After deploy, record actual deployment time, Worker version, SHA, touched URLs, CI run ID, verified HTTP behavior, and rollback version in the central release register. A passing CI run is not proof of production deployment.
5. Compare 7/14/28-day GSC after the release using Final data and equal-length before/after windows; attribute cautiously.

**Integration safety:** main differs from Cloudflare baseline by 180 remediated service-area documents plus 6 related files. Reverse diff contains 17 Cloudflare infrastructure/runtime changes that do not exist in main. Do not deploy main directly. The integration branch cherry-picks exact reviewed Git blobs onto the current release. Separate hours-only hotfix PR #58 must not silently include these 180 pages.
