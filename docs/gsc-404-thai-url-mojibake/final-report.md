# Final report — GSC 404 Thai URL Mojibake Audit

## Verdict

```text
PASS WITH WARNING
```

Warnings: Production SHA **NOT VERIFIED**; GSC export file not provided; blog URLs need owner decision; Googlebot Location handling inferred from Node fetch + raw UTF-8 Location evidence (not a Googlebot packet capture).

## Status

```text
NF-GSC-404-THAI-URLS: OPEN — AUDIT COMPLETE / FIX APPROVAL PENDING
F-12: OPEN — VERCEL HOBBY PLATFORM LIMITATION / OWNER-ACCEPTED
Production code changes: 0
Merge: NOT MERGED
Deploy: NOT DEPLOYED
```

## Identity

| Field | Value |
| --- | --- |
| Branch | `audit/gsc-404-thai-url-mojibake` |
| Base SHA | `a196dc7c6fb22ca4e5c1e2f3f37f638863d2559f` |
| Audit SHA | *(filled after commit)* |
| Production SHA | NOT VERIFIED |
| URLs audited | **20/20** |

## Production HTTP (curl, UTF-8 Location decode)

| Metric | Count |
| --- | ---: |
| Initial 3xx | **20** |
| Final 200 | **20** |
| Final 404 | **0** |
| Unicode/encoded mismatch | **0** |
| Raw UTF-8 Location | **18** |
| HTML body mojibake | **0** |
| Double-encoded in curl chain | **0** |
| In production sitemap (sources) | **0** |
| Redirect rules present | **20** |
| Routes generated for sources | **0** (filtered) |
| Content files still on disk (provinces) | yes (HDD/GoPro/Lens areas) |

## Per-URL classification

| Class | Count | IDs |
| --- | ---: | --- |
| FIX_ENCODING_ONLY | 18 | 1–14, 17–20 |
| REQUIRES_OWNER_DECISION | 2 | 15–16 (blog → `/blog`) |
| RESTORE_200 | 0 | — |
| KEEP_404_GONE | 0 | — |
| GSC_STALE_STATUS alone | 0 | (do not Validate-only before encoding fix) |

## Proposed targets (already live when Location decoded correctly)

| Source group | Target |
| --- | --- |
| HDD provinces | `/รับซื้อ/รับซื้อ-ssd-{จังหวัด}` |
| GoPro provinces + hub | `/บริการ/รับซื้อ-gopro-action-camera` |
| Lens provinces + hub | `/บริการ/รับซื้อเลนส์กล้อง` |
| storage-nas | `/บริการ/รับซื้อ-nas` |
| `/บริการ/รับซื้อสินค้าไอที` | `/รับซื้อสินค้าไอที` |
| `/บริการ/รับซื้อ-hdd` | `/บริการ/รับซื้อ-ssd` |
| Blog articles | `/blog` |

Targets validated: HTTP 200, likely indexable, self-canonical, in sitemap (`url-decision-matrix.csv`).

## Root causes

1. **Encoding / redirect emission:** Unicode destinations in `vercel.json` → raw UTF-8 `Location` → strict clients 404 + mojibake URL.
2. **Route retirement:** intentional via `seo-policy` + redirects (not accidental delete).
3. **Sitemap:** sources excluded by design.
4. **GSC:** reports 404 consistent with bot failure on raw UTF-8 Location; not “no redirect configured.”

## Severity

| Level | Finding |
| --- | --- |
| **P1** | Raw UTF-8 Location on Thai redirects (18/20 scope + **219** repo destinations) — indexation/redirect follow risk |
| **P1** | Core rename `/บริการ/รับซื้อสินค้าไอที` affected by same Location encoding issue |
| **P2** | Multiple SEO landing legacy URLs in GSC 404 list (provinces/hubs) |
| **P3** | Blog retire-to-`/blog` owner preference; F-12 unchanged |

No P0 sitewide outage: UTF-8-aware browsers generally reach 200.

## Recommended implementation batches (after approval)

| Batch | Action |
| --- | --- |
| **Fix F** | Percent-encode (ASCII) all non-ASCII `vercel.json` destinations — primary fix |
| **Fix A** | Confirm hubs: สินค้าไอที, SSD, NAS, GoPro action camera, เลนส์กล้อง |
| **Fix B–D** | No route restore; keep redirects after Fix F |
| **Fix E** | Owner decision on blog URLs |

## Owner decisions required

1. Approve **Fix F** (percent-encode redirect destinations sitewide for Thai paths).
2. Blog #15–16: keep 308→`/blog` / `KEEP_404_GONE` / restore articles.
3. Confirm no desire to **RESTORE_200** province HDD/GoPro/Lens pages.

## Remaining findings

- NF-GSC-404-THAI-URLS (this)
- F-12 (unchanged)
- F-04 and other prior opens (unchanged)
