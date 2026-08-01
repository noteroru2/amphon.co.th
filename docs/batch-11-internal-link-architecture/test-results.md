# Test Results — Batch 11 Internal Link Architecture

## Local QA

| Check | Result |
|---|---|
| `npx astro check` | 0 errors / 0 warnings (hints only outside scope) |
| `npm run build` | exit 0 |
| `qa:batch-1-redirects` | PASS |
| `qa:batch-2-sitemap` | PASS |
| `qa:batch-3-build` | PASS |
| `qa:batch-4-claims` | PASS |
| `qa:batch-5-images` | PASS |
| `qa:batch-6-schema-geo` | PASS |
| `qa:batch-7-host-redirects` | PASS WITH WARNING (F-12 platform hops; expected) |
| `qa:batch-8-image-dimensions` | PASS |
| `qa:batch-9-f10` | PASS |
| `qa:batch-10-metadata` | PASS |
| `qa:batch-11-internal-links` | PASS |

## Batch 11 QA notes

```text
built_pages=1188
approved_links=2976
noindex_pages=3
orphan_pages=2 (pre-existing: non-index / legacy paths; not new from Batch 11)
broken=0
redirecting=0
to_noindex=0
http_www_internal=0
sitemap_url_count=1185
```

## Rendered sample validation

17/17 approved sample links present in generated HTML (`rendered-link-validation.csv`).
