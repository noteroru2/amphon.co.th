# Config diff

## Source of truth

`vercel.json` (committed). Helper `scripts/generate-batch-1-redirects.mjs` updated to emit encoded destinations if re-run.

## Changes

| Metric | Before | After |
| --- | ---: | ---: |
| Redirect rules | 222 | 222 |
| Non-ASCII destinations | 219 | **0** |
| Destinations re-encoded | — | 219 |
| Logical destination changes | — | **0** |
| Status / order / sources | — | **0 changes** |
| Blog destinations | `/blog` ×2 | `/blog` ×2 |

## Example

```text
Before: /บริการ/รับซื้อเลนส์กล้อง
After:  /%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%80%E0%B8%A5%E0%B8%99%E0%B8%AA%E0%B9%8C%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87
```

Dynamic token preserved: `/:path+/` → `/:path+`
