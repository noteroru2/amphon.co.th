# Final report — Batch 6

## Verdict

**PASS WITH WARNING**

Warning: Production SHA `NOT VERIFIED`. All sampled production JSON-LD geo checks passed.

## Finding

| Finding | Status |
| --- | --- |
| F-11 store geo coordinates | **CLOSED** |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-6-schema-geo-coordinates` |
| Base SHA | `25d75e56c35154270c444980f88dc009d7a994df` |
| Implementation SHA | `4c6e6f9319cb004e53b5386399cb9ba3b3277458` |
| Merge SHA | `3cd7004a5028d2602e0aa58398f28f4085a66b51` |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | `31a1bd1636542c5dd6df769338fc6a7d81a2dec2` |
| Deployment URL | https://amphon.co.th |

## Coordinates

| | Before | After |
| --- | --- | --- |
| Latitude | `15.2386` | `15.2664215` |
| Longitude | `104.8477` | `104.844358` |
| Distance moved | | **3,114 m** |
| Verified source | | `https://maps.app.goo.gl/krv97o14jPTRrnpW8` → Maps `!3d/!4d` |
| Production match | | PASS |

## Change summary

| Metric | Value |
| --- | --- |
| Source files changed (code) | 1 (`src/config/site.ts`) |
| QA / package | `scripts/check-batch-6-schema-geo.mjs`, `package.json` |
| Docs | `docs/batch-6-schema-geo/*` |
| URLs affected (geo output) | sitewide BaseLayout / LocalBusiness |
| Schema types affected | LocalBusiness (+ geo.position/ICBM meta) |
| NAP diff | 0 |
| LocalBusiness count per page | 1 |
| Fake province LocalBusiness | 0 |
| AggregateRating | 0 |
| Product/Offer regression | 0 |
| JSON-LD invalid | 0 |
| Route / Sitemap / Canonical / Noindex / Redirect / Internal link / Content / Image diff | 0 |

## QA / build

Astro check 0 errors / 0 warnings · Batch 1–6 PASS · Build exit 0 · HTML 1188 · Sitemap 1185 · Production samples PASS

## Scope compliance

Only `site.geo` latitude/longitude updated. `hasMap`, address, telephone, opening hours, province Place centroids, content, redirects, sitemap logic unchanged.

## ADDITIONAL FINDING (not fixed)

Area pages still emit administrative `Place` GeoCoordinates from `provinceGeo` centroids. Not LocalBusiness; left unchanged per F-11 scope.
