# P0 — provincial CTA link audit after parent buy-price table removal (2026-11-18)

## Why
Draft PR #66 replaces unverified numeric purchase-price tables in the national service parents for TV, furniture and appliances with genuine condition/inspection guidance. Some local service-area pages still claimed their parent destination displayed a `ตารางราคาประเมิน` (numeric estimate table), which would become misleading. **This is factual link-label repair, not a duplicate-content or page-count exercise.**

## Read-only census and exact diff
- 3 service families × 20 provinces = **60** existing local Markdown pages inspected.
- **8 TV** local pages with false numeric-price-table CTA labels corrected.
- **6 furniture** local pages with false numeric-price-table CTA labels corrected.
- **0 appliance** pages needed this exact correction.
- **14** existing pages changed; nothing about existing URL, slug, frontmatter, canonical, robots, sitemap, claim of local branches, or price amount was added or renamed. Only the link label and associated teaser copy was corrected; target remains the original parent `/บริการ/...` URL.
- Reviewed high-GSC examples include `/รับซื้อ/รับซื้อทีวี-อุดรธานี` (17 clicks / 152 impressions) and `/รับซื้อ/รับซื้อเฟอร์นิเจอร์-อุดรธานี` (13 / 153) from property GSC FINAL 2026-10-18..2026-11-14. Do not interpret those as post-change performance.

## Release dependency
- Stacked PR is based on Draft [#66](https://github.com/noteroru2/amphon.co.th/pull/66) at commit `8afd7875af3508ff6f428d0b390993441deace31`, **not** from Production.
- Requires [#66](https://github.com/noteroru2/amphon.co.th/pull/66) changes to parent pages; publishing this CTA correction without parent context would be inappropriate.
- `scripts/check-local-parent-price-table-links.mjs` checks all **60** pages for misleading links, valid original slugs, parent links, rendered sitemap/canonical/indexability and LINE CTA. Workflow tests exact source with no write-generators.
- No new or deleted URL, no title/description edits, no FAQ filling, and no assertion of actual local purchase cases or pickup teams.
- Must pass current GitHub Actions exact-commit Build/SEO check plus spot-check mobile link labels on a real preview before release. Do not merge/deploy without release review.

## Next editorial review
Each of the 60 pages remains subject to its original human content-quality review. Correcting an anchor label alone does **not** claim to solve thin content, local relevance, search ranking, or real transaction evidence.
