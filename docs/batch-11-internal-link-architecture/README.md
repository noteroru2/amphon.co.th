# Batch 11 — Internal Link Architecture (F-06)

Selective Hub–Spoke strengthening for Finding F-06.

## What changed

| Change | Where |
|---|---|
| Same-province related services (≤4) | `ServiceAreaLayout` sidebar |
| Curated supporting articles | `ServiceLayout` sidebar on 7 core hubs |
| Deterministic map | `src/config/internal-link-map.ts` |
| Approved inventory | `approved-links.json` |
| Regression QA | `npm run qa:batch-11-internal-links` |

## Not in scope

- Mass-linking all low-inbound pages
- Thin templates (deferred to F-04)
- Mega footer / sitewide spam
- F-04 / F-12 / metadata / schema / images / URL / canonical / sitemap / noindex

## Key metrics

- Approved links: **2976**
- Sources affected: **747**
- Destinations strengthened: **115**
- Inbound ≤2: **966 → 867**
- Deferred to F-04: **186**
- GSC: **NOT AVAILABLE IN REPOSITORY**

## QA

```bash
npm run build
npm run qa:batch-11-internal-links
```
