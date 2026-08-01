# Final report — Batch 6 (pre-merge / pre-production section)

## Verdict

**PASS WITH WARNING** (production validation pending at commit time; local QA complete)

## Finding

| Finding | Status |
| --- | --- |
| F-11 store geo coordinates | **READY TO CLOSE** after production validation |

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-6-schema-geo-coordinates` |
| Base SHA | `25d75e56c35154270c444980f88dc009d7a994df` |
| Implementation SHA | *(filled after commit)* |
| Merge SHA | *(filled after merge)* |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | *(filled after docs commit)* |
| Deployment URL | https://amphon.co.th |

## Coordinates

| | Before | After |
| --- | --- | --- |
| Latitude | `15.2386` | `15.2664215` |
| Longitude | `104.8477` | `104.844358` |
| Distance moved | | **3,114 m** |
| Verified source | | `https://maps.app.goo.gl/krv97o14jPTRrnpW8` → Maps `!3d/!4d` |

## Change summary

| Metric | Value |
| --- | --- |
| Source files changed (code) | 1 (`src/config/site.ts`) |
| QA / package | `scripts/check-batch-6-schema-geo.mjs`, `package.json` |
| Docs | `docs/batch-6-schema-geo/*` |
| URLs affected (geo output) | sitewide BaseLayout / LocalBusiness (~all HTML pages) |
| Schema types affected | LocalBusiness (+ geo.position/ICBM meta) |
| NAP diff | 0 |
| LocalBusiness count per page | 1 |
| Fake province LocalBusiness | 0 |
| AggregateRating | 0 |
| Product/Offer regression | 0 (no new Product/Offer added) |
| JSON-LD invalid | 0 (sampled + sitewide LocalBusiness scan) |
| Route / Sitemap / Canonical / Noindex / Redirect / Internal link / Content / Image diff | 0 intentional |

## QA / build

Astro check 0 errors / 0 warnings · Batch 1–6 PASS · Build exit 0 · HTML 1188 · Sitemap 1185

## Scope compliance

Only `site.geo` latitude/longitude updated. `hasMap`, address, telephone, opening hours, province Place centroids, content, redirects, sitemap logic unchanged.

## Post-deploy checklist

- [ ] Production JSON-LD latitude/longitude match
- [ ] Homepage / contact / about / area samples HTTP 200
- [ ] Sitemap still 1185
- [ ] Batch 1–5 regressions still hold on production
- [ ] Update production-* report files + report-only commit
