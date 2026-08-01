# Final report — Batch 8 (pre-production)

## Verdict

**PASS WITH WARNING** — local QA complete; Lighthouse CLS `NOT VERIFIED`; production validation pending.

## Finding

| Finding | Status |
| --- | --- |
| F-13 image dimensions | **READY TO CLOSE** after production HTML checks |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-8-image-dimensions` |
| Base SHA | `b412282a2053dd687771f87621b7d9a81f643e58` |
| Implementation SHA | *(after commit)* |
| Deployment URL | https://amphon.co.th |

## Summary

| Metric | Value |
| --- | --- |
| Audit URLs / instances | 34 |
| Unique assets | 20 |
| Images fixed (built HTML) | 34 |
| Valid exceptions | Hero display-box dims; SVG; srcset enhancement deferred |
| Missing dimensions after | 0 (targets + global local raster scan) |
| Wrong content ratios | 0 |
| Broken images / asset 404 | 0 |
| Alt / loading / fetchpriority regressions | 0 |
| Image binary changes | 0 |
| Sitemap | 1185 |
| Batch 1–8 QA | PASS (Batch 7 warning only for F-12) |

## Files changed

- `astro.config.mjs` — rehype plugin
- `src/components/OptimizedImage.astro` — cache fallback
- `src/data/local-image-dimensions.json` — metadata cache
- `scripts/lib/local-image-dimensions*.mjs`, `rehype-local-image-dimensions.mjs`, `build-image-dimension-cache.mjs`
- `scripts/check-batch-8-image-dimensions.mjs`
- `package.json` — QA + cache scripts
- `docs/batch-8-image-dimensions/*`
