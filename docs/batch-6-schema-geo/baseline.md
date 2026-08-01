# Baseline — Batch 6 (F-11)

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-6-schema-geo-coordinates` |
| Base SHA | `25d75e56c35154270c444980f88dc009d7a994df` |
| Base tip source | `origin/main` |
| Finding | F-11 — store geo coordinates ~3 km off |
| Production status (pre-fix) | Live schema used `15.2386, 104.8477` sitewide |

## Finding F-11 (audit)

From `docs/seo-audit-2026-07-31/`:

- Schema GeoCoordinates: `15.2386, 104.8477`
- Google Maps listing (footer short link resolved): `15.2664215, 104.844358`
- Distance: ~3 km
- Affected: LocalBusiness schema sitewide (every page via `buildPageGraph`)

## Coordinates before

| Field | Value |
| --- | --- |
| latitude | `15.2386` |
| longitude | `104.8477` |
| Source file | `src/config/site.ts` (`site.geo`) |
| Consumers | `src/lib/seo.ts` `createLocalBusinessSchema()`, `src/layouts/BaseLayout.astro` (`geo.position`, `ICBM`) |

## Schema types affected

| Type | Has store geo? | Notes |
| --- | --- | --- |
| LocalBusiness + ProfessionalService | Yes | Uses `site.geo` |
| Organization | No | No geo property |
| Place (area pages) | Province centroid | `site.provinceGeo` — not LocalBusiness; left unchanged |
| WebSite / WebPage / BreadcrumbList / FAQPage / Service | No store geo | unchanged |

## Affected URLs

All HTML pages that render `BaseLayout` / `buildPageGraph` (sitewide LocalBusiness). Representative set:

- `/`
- `/contact`
- `/about`
- `/บริการ/*`
- `/พื้นที่ให้บริการ/*`
- blog and other indexable pages

## Audit comparison method

Resolved footer `hasMap` short URL `https://maps.app.goo.gl/krv97o14jPTRrnpW8` to Google Maps place pin (`!3d` / `!4d`) and compared to JSON-LD geo.

## Production check method (pre-fix)

HTTP GET homepage HTML → parse `application/ld+json` → LocalBusiness.geo = old coordinates.
