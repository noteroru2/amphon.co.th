# Cloudflare Astro7 — Evidence-first 25-page editorial integration RC (2026-11-18)

## Source provenance / no automatic deployment
- Base Cloudflare Astro7 candidate: `integration/cloudflare-issue50-180-20261116` at exact commit `8835065fca73934917bf816bf77d2376b3547efc` ([Draft PR #59](https://github.com/noteroru2/amphon.co.th/pull/59)).
- Content sourced from TWO independently tested, unmerged draft stacks:
  - [PR #63](https://github.com/noteroru2/amphon.co.th/pull/63) + [PR #64](https://github.com/noteroru2/amphon.co.th/pull/64), exact tested SHA `28ffc60fba34f0bb2e9ecac89726033985c6d4c6`: eight category×province pages with unique inspection and decision checklists, plus updated 12-page regression script. Github Actions [#44273828284](https://github.com/noteroru2/amphon.co.th/actions/runs/44273828284) PASS.
  - [PR #66](https://github.com/noteroru2/amphon.co.th/pull/66) + [PR #67](https://github.com/noteroru2/amphon.co.th/pull/67), exact tested SHA `7539dc8f983fadcee5f8dc0d61657c5e7ae1df60`: three parent service pages remove unverifiable numeric prices, fixed response times, blanket nationwide pickup/free dismantling claims; 14 TV/Furniture region CTAs are now truthful and still point to the original parent URL; two new truthful-page regression scripts. Github Actions [#44278991519](https://github.com/noteroru2/amphon.co.th/actions/runs/44278991519) PASS.
- Cherry-pick via exact Git blobs, NOT bulk overwrite. All 1,020 `src/content/serviceAreas` source files were identical between the Cloudflare candidate and source `main` baseline before the import (verified subtree SHA `c06f9e04161b9b51c7d70e82a97c93b090d1e3a3`). The three changed parent files were also verified identical before import.
- Contents in the integrated RC: **8 fully rewritten local pages + 3 corrected main category parents + 14 local CTA labels = 25 existing pages**; **3 imported QA scripts**. Additional workflow edits in this integration branch add immutable-source guards and verify these pages on both standard site and production Astro7 Cloudflare build. Existing URLs, canonical, robots, sitemap and index intent are preserved.
- No invented purchase receipts, government tenders, provincial branches, nationwide pickup guarantees or arbitrary FAQ padding. No PriceBook, DNS, zone, secrets, Worker Production, route or redirect edits. **No deploy** in Github workflow; Wrangler is restricted to `--dry-run`.

## Release QA (required)
- Node 22.23.4, pinned `npm ci`, high/critical production npm audit zero, 21 Google Reviews tests, Cloudflare production adapter build, `npm run validate:seo`, 260 legacy redirects, and 1,189 sitemap URLs on original Cloudflare baseline (revalidate on final commit).
- Preserve 1,020 source service pages, 921 rendered/indexable service-area URLs, 99 source exclusions. Noindex present on staging only, never on production build. Verify 921 Ubon storefront fact/LINE intake in built HTML.
- New checks: 12 GSC-protected Server/UPS/Network regional URLs; 3 main TV/Furniture/Appliance service truths; all 60 TV/Furniture/Appliance regional parent CTAs (14 corrected). Verify full GitHub branch diff relative to exact PR#59 base: only intended 25 source docs, 3 QA scripts, two QA workflows and this runbook.
- Review mobile and desktop layouts, title, H1, CTA, redirects and parent link text via real rendered preview (note: authenticated browser agent was unavailable due insufficient service credits; **not** evidence of a page problem).
- Cloudflare Worker production version and **actual release SHA** must be verified, rollback version retained, explicit owner GO required for deployment. No promotion of a Vercel preview or blindly merging two unrelated branches.
- After real production release, record SHA and UTC timestamp, verify representative 8+3+14 URLs and monitor GSC FINAL 7/14/28 days alongside qualified LINE leads.

## GSC FINAL baseline (2026-10-18 to 2026-11-14)
- TV parent `/บริการ/รับซื้อทีวี`: **128 clicks / 2,718 impressions / average position 7.34**. Preserve current keyword owner.
- TV Udon `/รับซื้อ/รับซื้อทีวี-อุดรธานี`: **17 clicks / 152 impressions**; Furniture Udon **13 / 153**.
- Thai URL `page` filters need percent-encoded canonical URLs; non-reported GSC rows cannot prove zero search demand.
- Eight local page pilots in a combined 921-page audit produced **SHORT_AND_SIMILAR 57→49, FEW_FAQ 52→48, SHORT_CONTENT 16→12, FEW_SECTIONS 10→9**. Metrics describe editorial source heuristic flags, **not Google's algorithm or actual increased traffic**.

## Remaining editorial queue
The other 49 / 48 / 12 risk flags still need human triage and verified business scope; the candidate does not claim complete qualitative remediation of all 921 pages. For service-family evidence, require anonymized owner-approved actual transactions before labeling any page as a real buy-in case.

Review and track [Issue #62](https://github.com/noteroru2/amphon.co.th/issues/62). **Do not merge this draft or deploy without owner approval.**
