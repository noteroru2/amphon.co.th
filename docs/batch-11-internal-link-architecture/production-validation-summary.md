# Production Validation Summary — Batch 11 F-06

## Verdict

```text
PASS WITH WARNING
```

Approved sample links live on production. Full-site graph metrics from local build remain authoritative for broken/redirecting/noindex (0). Production crawl counted `/site.webmanifest` as false-positive “broken” targets (not HTML routes). GSC not available. Remaining inbound ≤2 pages are Valid Long-tail / DEFER_TO_F04.

## Finding F-06 status

```text
CLOSED
```

## Evidence

| Check | Result |
|---|---|
| Sample sources (5) approved links present | PASS |
| Homepage 200 | PASS |
| Sitemap-0 count 1185 | PASS |
| Sitemap pages HTTP 200 (1185/1185) | PASS |
| Internal HTTP/WWW links (crawl) | 0 |
| Local Batch 11 QA broken/redirecting/to_noindex | 0 / 0 / 0 |
| Production SHA | NOT VERIFIED |

## Sample results

See `production-validation-results.csv` and `post-deploy-validation.csv`.
