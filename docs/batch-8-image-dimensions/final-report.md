# Final report — Batch 8

## Verdict

**PASS WITH WARNING**

Warning: Production SHA `NOT VERIFIED`; Lighthouse CLS `NOT VERIFIED WITH LIGHTHOUSE`. Target HTML dimensions verified on production.

## Finding

| Finding | Status |
| --- | --- |
| F-13 image dimensions | **CLOSED** |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-8-image-dimensions` |
| Base SHA | `b412282a2053dd687771f87621b7d9a81f643e58` |
| Implementation SHA | `a797aecf40ea10c8af53b3a6b4d829f25633e1d3` |
| Merge SHA | `98e9f6b33b517a3ac1e9b54739fb3887e2a49a2b` |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | *(filled after docs commit)* |
| Deployment URL | https://amphon.co.th |

## Change summary

| Metric | Value |
| --- | --- |
| Audit URLs/instances | 34 |
| Confirmed live / fixed | 34 |
| Unique assets | 20 |
| Valid exceptions | Hero 600×338 display-box + CSS aspect-ratio; SVG; srcset enhancement deferred |
| Missing dimensions before → after | 34 → 0 |
| Wrong content ratios | 0 |
| Broken images / asset 404 | 0 |
| Alt / loading / fetchpriority regressions | 0 |
| Image binary changes | 0 |
| Visual / CLS automation | NOT VERIFIED WITH LIGHTHOUSE (HTML intrinsic dims + reserved CSS) |
| Route / Sitemap / Canonical diffs | 0 |
| Sitemap count | 1185 |
| Batch 1–8 QA | PASS (Batch 7 F-12 warning only) |
| Build | exit 0 · Astro check 0/0 |

## Implementation

Rehype plugin injects sharp-backed intrinsic dimensions into local markdown images; dimension cache at `src/data/local-image-dimensions.json`.
