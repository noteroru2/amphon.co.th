# Production release report — Batch 6

## Verdict

**PASS WITH WARNING** — F-11 closed on production HTML/JSON-LD; Production deploy SHA not verified via Vercel API.

## Finding F-11 status

**CLOSED**

## SHAs

| Role | SHA |
| --- | --- |
| Base | `25d75e56c35154270c444980f88dc009d7a994df` |
| Implementation | `4c6e6f9319cb004e53b5386399cb9ba3b3277458` |
| Merge | `3cd7004a5028d2602e0aa58398f28f4085a66b51` |
| Production | `NOT VERIFIED` |
| Report-only | `39a86a86a394ae6210ce43b6d7da5cb0bc631885` |

## Branch / URL

- Branch: `fix/batch-6-schema-geo-coordinates`
- Deployment URL: https://amphon.co.th
- Coordinate source: `maps.app.goo.gl/krv97o14jPTRrnpW8`

## Metrics

| Metric | Value |
| --- | --- |
| Latitude before → after | `15.2386` → `15.2664215` |
| Longitude before → after | `104.8477` → `104.844358` |
| Distance moved | 3,114 m |
| Production coordinate match | PASS |
| JSON-LD invalid | 0 (sampled) |
| LocalBusiness province misuse | 0 |
| NAP regression | 0 |
| Route count (built HTML) | 1188 |
| Sitemap count | 1185 |
| Canonical / Noindex / Redirect diff | 0 |
| Batch 1–6 QA | PASS |
| Build | exit 0 |
| Remaining findings | F-04, F-06, F-09, F-10, F-12, F-13, others outside F-11 |

## Evidence files

- `post-deploy-validation.csv`
- `production-validation-results.csv`
- `coordinate-verification.md`
- `rendered-schema-validation.csv`
