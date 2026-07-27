# Batch 6.4 Baseline

## Git baseline

- Starting branch: `main`
- Starting SHA: `5186e856e70f96b11fa613c7a4a7c074ddcc616d`
- Work branch: `batch-6-4-blog-listing-readability-hotfix`
- Pre-existing untracked items preserved:
  - `docs/batch-2-macbook-cannibalization-audit/`
  - `scratch/`
  - `sitewide-deep-audit.md`
  - `verify_production_results.json`

No pre-existing tracked modifications were present.

## Actual sources

| Item | Actual source |
| --- | --- |
| Blog index route | `src/pages/blog/index.astro` |
| Blog collection | `src/content.config.ts`, collection `blog`, files under `src/content/blog/` |
| Sorting logic | `src/pages/blog/index.astro`; descending `data.date` |
| Card component | `src/components/ArticleCard.astro` |
| Hero component | Inline Blog-specific header in `src/pages/blog/index.astro` |
| Hero paragraph class | Before: generic `.prose` plus inline paragraph styles; after: `.blog-hero__description` |
| Global style affecting paragraph | `.prose { color: var(--color-gray-700) }` and `.prose strong { color: var(--color-dark) }` in `src/styles/global.css` |

## Article sources

| Slug | Source |
| --- | --- |
| `ขายโทรศัพท์มือสองใกล้ฉัน` | `src/content/blog/ขายโทรศัพท์มือสองใกล้ฉัน.md` |
| `ขายกล้อง-sony-มือสอง-ต้องเช็กอะไรบ้าง` | `src/content/blog/ขายกล้อง-sony-มือสอง-ต้องเช็กอะไรบ้าง.md` |
| `mac-mini-m4-มือสอง` | `src/content/blog/mac-mini-m4-มือสอง.md` |
| `แรมมือสองขายได้เท่าไหร่` | `src/content/blog/แรมมือสองขายได้เท่าไหร่.md` |

All four files used `date: "2026-06-01"` and `updated: "2026-07-27"`.

## Root cause

The listing correctly sorted by publication `date`, but the four new articles had the wrong publication date. They therefore appeared below posts dated 15–21 June and July. The comparator also had no deterministic secondary key for posts sharing a date.

The long Hero paragraph explicitly used `var(--color-gray-600)`, which resolves to `#334155`, inside a dark navy gradient. Its worst-case contrast was only 1.41:1. The generic `.prose` wrapper also applied dark prose typography intended for a light content background, including dark `strong` text. The paragraph's length and 32px top margin made the Hero 384px on desktop and 483px on 390px mobile.

The production source inspected at baseline no longer contained the exact phrase “ราคาที่สูงที่สุด”, but the replacement copy was still applied so the Hero uses the approved neutral wording and regression QA rejects risky price guarantees in that section.

## Listing behavior

- All 50 posts render on one crawlable page.
- No pagination, load-more control, category filter, or `slice()` limit exists.
- No pagination change was needed for this hotfix.
