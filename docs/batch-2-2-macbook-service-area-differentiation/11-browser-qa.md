# Browser QA

Tested against local Astro server with the in-app browser.

## Desktop — 1440 × 900

Pages: อุบลราชธานี, ขอนแก่น, บุรีรัมย์, นครราชสีมา และ MacBook Hub

- All pages: one H1, expected title/meta/canonical, visible Line and phone CTA
- All service-area pages link to the MacBook parent/hub and supporting route
- Horizontal overflow: none (document width 1,425 vs viewport 1,440)
- Longest representative service-area page: อุบลราชธานี, article 2,430 visible characters, no layout issue
- Hub is table/FAQ-heavy representative: article 10,967 visible characters, no layout issue

## Mobile — 390 × 844

Pages: อุบลราชธานี, บุรีรัมย์ และ MacBook Hub

- Horizontal overflow: none (document width 375 vs viewport 390)
- Mobile menu control, breadcrumb, H1, hero CTA, article, sidebar content, steps and FAQ remain present
- Ubon storefront wording and Buriram no-local-branch wording are visible and distinct

## Required coverage limitation

Inventory has **0 District/City MacBook service-area pages**; all 20 are Province-level. Therefore “District/City อย่างน้อย 3 หน้า” cannot be executed without inventing or adding URLs, which this batch forbids. Four Province pages were checked on desktop and two on mobile instead. No new district route was created.
