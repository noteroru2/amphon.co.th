# Final Report — Batch 11 F-06 (pre-merge / implementation)

## Verdict

```text
PASS WITH WARNING
```

Priority Hub–Spoke links added selectively and verified on production samples. Remaining inbound ≤2 pages are Valid Long-tail / DEFER_TO_F04. GSC data not in repository. Production SHA NOT VERIFIED.

## Finding F-06 status

```text
CLOSED
```

## SHAs

| Field | Value |
|---|---|
| Branch | `fix/batch-11-internal-link-architecture` |
| Base SHA | `778dfbecc67d12f3020d00d3f88cd48efe4d7095` |
| Implementation SHA | `5cd0fa3943c9f174e7e6adbaa0c5cc99b158edea` |
| Merge SHA | `52255ebec9e6c3fed5330348230aa7ff4b194c5c` |
| Production SHA | NOT VERIFIED |
| Report-only SHA | `991fb3d26634c23ea6390bab54643ded256a3450` |

## Implementation summary

1. **Same-province horizontal links** on indexable service×location pages (sidebar): up to 4 related core-hub services in the same province. Deferred thin service templates excluded as destinations and as sources.
2. **Supporting articles** on 7 core service hubs (sidebar “อ่านก่อนตัดสินใจขาย”) with descriptive, non-commercial anchors.
3. Deterministic map in `src/config/internal-link-map.ts` + approved inventory in `approved-links.json`.

## Counts

| Metric | Value |
|---:|---:|
| URLs crawled (built) | 1188 |
| Approved links added | 2976 |
| Province-related links | 2960 |
| Supporting-article links | 16 |
| Source pages changed | 747 |
| Destination pages strengthened | 115 |
| Pages inbound ≤2 before | 966 |
| Pages inbound ≤2 after | 867 |
| P1 hubs with new outbound article links | 7 |
| P2 pages inbound-strengthened | 43 |
| P3 kept / long-tail | 694 |
| DEFER_TO_F04 | 186 |
| Requires GSC | 0 (GSC not available) |
| Links removed | 0 |
| Links changed (retarget) | 0 |
| Broken internal links | 0 |
| Redirecting internal links | 0 |
| Orphan pages (new) | 0 |
| Links to noindex | 0 |
| Canonical conflicts | 0 |
| Internal HTTP/WWW links | 0 |
| Anchor text issues | 0 |
| Cannibalization regression | none detected (role-based anchors) |

## Priority map

| Class | Count |
|---|---:|
| P1 | 33 |
| P2 | 272 |
| P3 | 694 |
| DEFER_TO_F04 | 186 |
| KEEP_AS_IS | 2 |

## Diffs (SEO controls)

| Control | Diff |
|---|---|
| Routes | none |
| Sitemap count | 1185 (unchanged) |
| Canonical | unchanged |
| Noindex | unchanged |
| Redirects | unchanged |
| Metadata | unchanged |
| Schema | unchanged |
| Images | unchanged |

## Click depth

Baseline click depth not re-forced to ≤3 for all long-tail. P1 hubs remain in main nav. P2 province hubs reachable via location hub + new sibling links. Deep long-tail / deferred pages intentionally not mass-promoted.

## Scope compliance

In-scope only: layouts, service/service-area pages props, `internal-link-map.ts`, Batch 11 QA script, `package.json` QA script entry, docs under `docs/batch-11-internal-link-architecture/`.

## Production checklist

- [x] Merge to main
- [x] Deploy live (sample HTML confirmed)
- [x] Validate sample source/destination URLs on production
- [x] Confirm sitemap 1185
- [x] Confirm broken/redirecting (local QA) = 0
- [x] Record production-validation CSVs + report-only commit
