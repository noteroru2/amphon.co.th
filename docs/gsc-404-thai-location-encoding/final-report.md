# Final report — Thai redirect Location encoding

## Verdict

```text
PASS WITH WARNING
```

Warning: Production SHA NOT VERIFIED (Hobby); GSC Validate Fix still needs owner action; Blog 2 owner decision pending.

## Finding status

```text
NF-GSC-404-THAI-LOCATION: CLOSED — VERIFIED
NF-GSC-404-BLOG-LEGACY: OPEN — OWNER DECISION PENDING (2 URLs)
NF-GSC-404-THAI-URLS: PARTIALLY CLOSED (encoding + 18 redirects verified; blog open)
F-12: OPEN — VERCEL HOBBY PLATFORM LIMITATION / OWNER-ACCEPTED
```

## SHAs

| Role | SHA |
| --- | --- |
| Base / Audit merge | `5979910bfbb51e8560193c8c6c92427a99e723d0` |
| Implementation | `ec8f344bb0794175e30cdf757ff8a3c84ae7c586` |
| Merge | `ae7426577571f855d92a668f34e76a321a466360` |
| Production | NOT VERIFIED (smoke after merge `ae74265`) |
| Report-only | *(this docs commit)* |
| PR | https://github.com/noteroru2/amphon.co.th/pull/new/fix/gsc-404-thai-location-encoding |

## Encoding metrics

| Metric | Before | After |
| --- | ---: | ---: |
| Redirect rules | 222 | 222 |
| Raw Unicode destinations | 219 | **0** |
| Destinations re-encoded | — | 219 |
| Logical destination changes | — | **0** |
| Double encoding | — | **0** |
| Status / order / source changes | — | **0** |
| Raw UTF-8 Location (prod, 18 GSC) | 18 | **0** |

## Production validation (18 GSC + strict client)

```text
npm run qa:gsc-404-thai-location-encoding -- --runtime
→ PASS … runtime=OK
```

Node fetch sample (`/รับซื้อ/รับซื้อ-hdd-สกลนคร`):

- Location: ASCII percent-encoded
- Mojibake: false
- Follow: **200**

Blog 2: still 308 → `/blog` (unchanged).

## Diffs

Sitemap 1166 · Route/Canonical/Noindex/Content/Metadata/Schema **0** · Broken/redirecting **0** · Indexable orphan **0**

## GSC next action

Owner: Search Console → Validate Fix on the 404 issue (do not re-add retired URLs to sitemap).

## Blog

Generic `/blog` redirect may not be the best long-term target. Requires separate decision between restore article and 410.
