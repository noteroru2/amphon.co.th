# Coordinate verification — Batch 6 (F-11)

```text
Verified business name: อำพล เทรดดิ้ง (Google Maps place title; matches site.name)
Verified address: 740/8 ถนนชยางกูร จังหวัดอุบลราชธานี (NAP on site; listing title includes buy-back services in Ubon)
Verified telephone: 0642579353 / +66642579353 (site NAP; listing linked from same business channels)
Verified map/listing source: https://maps.app.goo.gl/krv97o14jPTRrnpW8
  Resolved Location (HTTP 302): Google Maps place URL containing
  place feature /g/11sdwpz7sc
  hex place id 0x311687b7ef0583c9:0x90ad9a37b84af3a
  pin !3d15.2664215!4d104.844358
Latitude: 15.2664215
Longitude: 104.844358
Verification date: 2026-08-01
Verification method:
  1. Used business-owned short map URL already in repository (site.hasMap / footer).
  2. Resolved HTTP redirect without inventing a new search query.
  3. Extracted official pin coordinates from Maps place URL parameters !3d / !4d.
  4. Confirmed place title decodes to อำพล เทรดดิ้ง and matches single-store Ubon business.
Cross-check source:
  - SEO audit 2026-07-31 (same Maps pin vs schema delta ~3 km)
  - Haversine distance old→new = 3114 m (matches audit ~3 km)
  - hasMap URL unchanged and already points at this listing
Confidence: high
```

## Match checklist

| Signal | Result |
| --- | --- |
| Business name | Pass — อำพล เทรดดิ้ง |
| Address region | Pass — อุบลราชธานี / Chayangkun Rd context on site |
| Website / owned link | Pass — short URL embedded on amphon.co.th |
| Single store | Pass — no other physical branches claimed |
| Not province centroid | Pass — pin ≠ Ubon centroid `15.2287, 104.8564` |
| Not old schema point | Pass — differs from `15.2386, 104.8477` by ~3.1 km |

## Rejected sources (not used as authority)

- Province centroid / postal geocode
- Generic street geocoding alone
- AI-generated coordinates
- OpenStreetMap without business match
