# Production validation summary — Batch 6

## Verdict

**PASS WITH WARNING**

Warning: Production SHA `NOT VERIFIED` (Vercel API / deploy SHA not confirmed without creating credentials).

## Finding F-11

**CLOSED** — Production LocalBusiness geo matches verified store pin.

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

| | Value |
| --- | --- |
| Source | Google Maps listing via `https://maps.app.goo.gl/krv97o14jPTRrnpW8` (`!3d15.2664215!4d104.844358`) |
| Before | `15.2386, 104.8477` |
| After / Production | `15.2664215, 104.844358` |
| Distance moved | 3,114 m |
| Production match | PASS |

## Production sample checks

All sampled URLs HTTP 200, JSON-LD parse OK, LocalBusiness geo = new coords, NAP unchanged, fake province LocalBusiness = 0.

Sitemap-0.xml: 200, count **1185**.

## Regression

Batch 1–6 local QA PASS · Build exit 0 · Astro check 0 errors / 0 warnings

## Remaining findings (not in this batch)

F-04, F-06, F-09, F-10, F-12, F-13, and other open backlog items outside F-11.
