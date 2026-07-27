# Batch 6 Repository Baseline

- Branch: `batch-6-ipad-iphone-cluster-architecture`
- Starting SHA: `441892a`
- Initial tracked modifications: 0
- Initial staged files: 0
- Initial untracked paths excluded from Batch 6:
  - `docs/batch-2-macbook-cannibalization-audit/`
  - `scratch/`
  - `sitewide-deep-audit.md`
  - `verify_production_results.json`
- GSC source: `amphon.co.th-Performance-on-Search-2026-07-26.xlsx`
- GSC filter: Web, latest 6 months
- Query × Page export: No
- Interpretation rule: **Insufficient evidence — actual query-to-landing-page relationship cannot be confirmed**

## Actual route implementation

| Item | Actual implementation |
| --- | --- |
| iPad main source | `src/content/services/รับซื้อ-ipad.md` → `/บริการ/รับซื้อ-ipad` |
| iPhone main source | `src/content/services/รับซื้อ-iphone.md` → `/บริการ/รับซื้อ-iphone` |
| Phone hub source | `src/content/services/รับซื้อโทรศัพท์มือสอง.md` → `/บริการ/รับซื้อโทรศัพท์มือสอง` |
| Tablet hub source | `src/content/services/รับซื้อแท็บเล็ต.md` → `/บริการ/รับซื้อแท็บเล็ต` |
| Blog collection | `src/content/blog/*.{md,mdx}` via `src/pages/blog/[slug].astro` |
| Service collection | `src/content/services/*.{md,mdx}` via `src/pages/บริการ/[slug].astro` |
| Model-page system | Service collection entries; no separate model generator |
| Condition-page system | Service/blog entries classified by intent; no separate generator |
| Location-page system | `src/content/serviceAreas/*` via `src/pages/รับซื้อ/[slug].astro` |
| Metadata source | Content frontmatter rendered by ServiceLayout/BlogLayout/BaseLayout |
| Schema source | `src/lib/seo.ts`, ServiceLayout, BlogLayout and visible FAQ data |
| Related links source | Markdown links plus `src/config/service-clusters.ts` |
| Sitemap source | `@astrojs/sitemap` in `astro.config.mjs` |

## Baseline findings

- iPad and iPhone service pages were grouped into one broad APPLE related-content cluster.
- The dedicated Tablet Hub and iPad Hub already exist and should remain separate.
- The multi-brand Phone Hub and iPhone Hub already exist, but related-content ownership was not represented as separate clusters.
- The iPad model-identification guide had a layout H1 plus a second Markdown H1.
- Existing iCloud/Activation Lock content used outdated Apple ID terminology and one service page implied locked devices could be bought for parts.
- No URL, redirect, canonical, noindex, dependency or lockfile change is required.
