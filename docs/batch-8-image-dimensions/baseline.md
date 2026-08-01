# Baseline — Batch 8 (F-13)

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-8-image-dimensions` |
| Base SHA | `b412282a2053dd687771f87621b7d9a81f643e58` |
| Finding | F-13 missing image dimensions (34 instances, 20 unique assets) |

## Audit evidence

From `docs/seo-audit-2026-07-31/image-asset-audit.csv` + backlog:

- 34 content image instances missing width/height
- Mostly service markdown body images; some blog/serviceArea
- Batch 5 converted many PNG→WebP but deferred F-13
- Production sample `/บริการ/รับซื้อ-ssd`: hero had dims; body `<img>` had none

## Production before

```html
<img src="/images/services/rub-sue-ssd-hdd-amphon.webp" alt="...">
```

## Scope note

Hero `OptimizedImage` already had width/height (display box 600×338 with CSS `aspect-ratio: 16/9` + `object-fit: cover`) — Valid Exception, not F-13 missing list.
