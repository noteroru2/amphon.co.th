# Batch 6 — Correct Store Geo Coordinates (F-11)

Correct `latitude` / `longitude` in LocalBusiness structured data (and related geo meta from the same source of truth) so they match the verified Google Maps listing for อำพล เทรดดิ้ง.

## Scope

- In scope: store geo coordinates (`site.geo`), QA script, this report folder
- Out of scope: content, redirects, sitemap, canonical, NAP text, province Place centroids, F-04/F-06/F-09/F-12/F-13

## Key facts

| Item | Value |
| --- | --- |
| Finding | F-11 (P3) |
| Branch | `fix/batch-6-schema-geo-coordinates` |
| Base SHA | `25d75e56c35154270c444980f88dc009d7a994df` |
| Before | `15.2386, 104.8477` |
| After | `15.2664215, 104.844358` |
| Distance moved | ~3,114 m |
| Source of truth | `src/config/site.ts` → `site.geo` |
| Map listing | `https://maps.app.goo.gl/krv97o14jPTRrnpW8` |

## Files

- `baseline.md`
- `baseline-schema-inventory.csv`
- `repository-geo-inventory.csv`
- `coordinate-verification.md`
- `coordinate-diff.csv`
- `schema-diff.csv`
- `rendered-schema-validation.csv`
- `test-results.md`
- `post-deploy-validation.csv`
- `final-report.md`
- `production-validation-results.csv` (after deploy)
- `production-validation-summary.md` (after deploy)
- `production-release-report.md` (after deploy)

## QA

```bash
npm run qa:batch-6-schema-geo
```
