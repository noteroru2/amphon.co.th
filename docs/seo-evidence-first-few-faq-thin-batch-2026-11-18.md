# Follow-up batch: FEW_FAQ + SHORT_CONTENT (2026-11-18)

## Source and scope
Based on GitHub Actions run [42953426790](https://github.com/noteroru2/amphon.co.th/actions/runs/42953426790) original 2026-11-11 `service-area-audit-921` ZIP, four pages are in **both** `FEW_FAQ` and `SHORT_CONTENT`, and the appliance-Mukdahan page is also in `SHORT_AND_SIMILAR`.

| Existing route suffix | Original issue | Editorial value added |
| --- | --- | --- |
| `รับซื้อ-server-ร้อยเอ็ด` | Few FAQ, thin | CPU/RDIMM/caddies/RAID/PSU inventory, BMC privacy, safer heavy-rack handoff |
| `รับซื้อ-ups-ชัยภูมิ` | Few FAQ, thin | VA vs W, Online/Line-interactive, runtime unknown, high-voltage and battery safety |
| `รับซื้ออุปกรณ์-network-ยโสธร` | Few FAQ, thin | Managed/PoE budget, Cloud account, license rights, privacy and SFP accessories |
| `รับซื้อเครื่องใช้ไฟฟ้า-มุกดาหาร` | Few FAQ, thin and similar | Category-specific fridge/washer/air-conditioner checks, refrigerant safety, logistics |

These are **category-specific seller preparation instructions**, not historical purchase cases. Three practical frontmatter FAQ entries per page address an actual product-related concern; no generic filler to reach a numeric quota. No claims of local branch/team, guaranteed pickup, quoted fixed buy price, contracts or transaction history.

## GSC final observations (2026-10-18 to 2026-11-14)
Use `encodeURI("https://amphon.co.th/รับซื้อ/<slug>")` when filtering exact Thai URLs; do not pass raw Unicode to an equals filter.
- Server Roi Et: **0 clicks / 2 impressions**, receipt `b009acc2-d7f6-4196-b708-d6b00cb1c044`
- UPS Chaiyaphum: **0 / 1**, receipt `c5cdf2d4-4a64-4676-b532-49e69a63c8cc`
- Network Yasothon: **no reported impressions**, receipt `dca3ea41-b994-4c14-a6a1-f726e8a25edd`
- Appliances Mukdahan: **no reported impressions**, receipt `65093c98-89a3-4e7a-a67b-50427c0d16b7`

Low reported GSC traffic is **not zero demand**, and does not authorize redirects/noindex or false local relevance.

## Release hierarchy
1. This branch is **stacked on** `seo/evidence-first-four-families-20261118` (draft PR #63), so its GitHub PR should target that branch until the first review finishes.
2. The first PR fixes CI artifact contamination from historic write-generating scripts in `seo-evidence-audit.yml`; keep exact-commit guards and do not run `issue50-*-guides.cjs --export` before building.
3. Validate all 921 existing built/indexable URLs, sitemap, canonical, H1/LINE, 99 exclusions, local storefront truth, 260 redirects where Cloudflare artifact QA is applicable, and no new URL/noindex.
4. Keep staged content separate for reviewer approval; neither this branch nor PR #63 authorizes merging, DNS changes, or production deployment.
5. After release SHA+UTC timestamp are verified, monitor GSC FINAL at 7/14/28 days and seller LINE lead quality.

Google people-first content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
