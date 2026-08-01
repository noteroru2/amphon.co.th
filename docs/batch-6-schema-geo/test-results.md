# Test results — Batch 6

| Command | Result |
| --- | --- |
| `npm ci` | PASS |
| `npx astro check` | PASS — 0 errors / 0 warnings (63 hints, mostly scratch/scripts) |
| `npm run qa:batch-1-redirects` | PASS |
| `npm run qa:batch-2-sitemap` | PASS |
| `npm run build` | PASS — exit 0 (windows-safe wrapper) |
| `npm run qa:batch-3-build` | PASS — html=1188, sitemap=1185 |
| `npm run qa:batch-4-claims` | PASS |
| `npm run qa:batch-5-images` | PASS |
| `npm run qa:batch-6-schema-geo` | PASS |

## Batch 6 assertions

| Check | Result |
| --- | --- |
| Source lat/lng | `15.2664215` / `104.844358` |
| Old coords in LocalBusiness | 0 |
| Store geo mismatch | 0 |
| Fake province LocalBusiness | 0 |
| AggregateRating | 0 |
| Review schema | 0 |
| NAP mismatch | 0 |
| Sitemap count | 1185 |
| Sample pages (10) | all PASS with new geo |

## Schema validation notes

- JSON-LD parse: PASS on sampled pages
- `NOT VERIFIED WITH GOOGLE RICH RESULTS TEST`
- Geo does not imply Rich Results entitlement

## ADDITIONAL FINDING (not fixed)

- Area pages still emit `Place` GeoCoordinates from `provinceGeo` centroids (administrative Place, not LocalBusiness). Left unchanged per F-11 store-only scope.
