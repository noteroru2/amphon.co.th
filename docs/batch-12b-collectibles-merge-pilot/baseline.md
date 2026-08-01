# Baseline — Batch 12B

```text
Main Base SHA: 90ed322226063d23780a1c8dfb0a7f4ceb5687c0
Audit Branch Tip: 1aff5b9233971ab8f6e58a0a74e7b77e39c6536b
Implementation Branch: fix/batch-12b-collectibles-merge-pilot
Target: /บริการ/รับซื้อของสะสม
Sitemap before: 1185
Sitemap after (expected): 1175
```

## Pilot freeze

Provinces (from Batch 12A Pilot A suggestion): กาฬสินธุ์, ขอนแก่น, ชัยภูมิ, นครพนม, นครราชสีมา, บึงกาฬ, บุรีรัมย์, มหาสารคาม, มุกดาหาร, ยโสธร

## Architecture choice

- Retire routes via `isIndexableServiceArea` + `COLLECTIBLES_MERGE_PILOT_SLUGS`
- Explicit permanent redirects in `vercel.json` (unicode + encoded)
- Exact sitemap exclusions for the 10 URLs
- No content merge to target (sources are province-name templates only)
