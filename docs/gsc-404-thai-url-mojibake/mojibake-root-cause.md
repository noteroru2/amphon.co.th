# Mojibake / 404 — root cause analysis

## Verdict

```text
ROOT CAUSE CONFIRMED
```

## 404 root cause

**Not** “routes missing with no redirect.”

Evidence:

1. All 20 URLs have `vercel.json` permanent redirects.
2. With **curl** decoding `Location` as UTF-8: **20/20** end at HTTP **200** on the intended replacement (1 hop on HTTPS apex).
3. None of the 20 appear in the production sitemap (expected for retired/legacy sources).
4. Province/hub sources are intentionally **not** in `getStaticPaths` (`filterIndexableServiceAreas` + `LEGACY_SERVICE_MERGES` in `src/config/seo-policy.ts`).

GSC “404” is explained by clients that **fail to follow** the non-ASCII `Location` correctly (see Encoding), not by absence of redirect rules.

## Encoding root cause

**Confirmed:** Vercel responds with `Location` containing **raw UTF-8 Thai bytes**, not percent-encoding.

Hex evidence (curl buffer as latin1 → UTF-8):

- Bytes include `E0 B8 A3…` (Thai UTF-8).
- `has percent` in Location = **false**.
- Correct UTF-8 string: `/รับซื้อ/รับซื้อ-ssd-สกลนคร`.
- Same bytes shown as Latin-1: `/à¸£à¸±à¸…` (mojibake).

Repo inventory:

- `vercel.json` destinations with non-ASCII: **219**
- Destinations already percent-encoded: **0**

Node `fetch` (undici) evidence: `node-fetch-location-evidence.json`

- `location_as_js_string` = mojibake
- Follow URL becomes `%C3%A0%C2%B8…` (UTF-8 of mojibake) → **404**

This matches owner report of “ภาษาไทยเพี้ยน / ภาษาต่างด้าว” when some tools open the URL chain.

HTML final pages sampled via percent-encoded absolute GET: **no body mojibake**; `<meta charset>` UTF-8 OK on targets.

## Redirect root cause

Rules are intentional merges/renames:

| Pattern | Target |
| --- | --- |
| HDD province | `/รับซื้อ/รับซื้อ-ssd-{จังหวัด}` |
| GoPro province / hub | `/บริการ/รับซื้อ-gopro-action-camera` |
| Lens province / hub | `/บริการ/รับซื้อเลนส์กล้อง` |
| storage-nas hub | `/บริการ/รับซื้อ-nas` |
| `/บริการ/รับซื้อสินค้าไอที` | `/รับซื้อสินค้าไอที` |
| Blog slugs | `/blog` (ASCII — no Location encoding issue) |

No loop. Chain length on HTTPS apex = **1** when Location is decoded as UTF-8.

## Sitemap root cause

Sources not in sitemap by design (not generated / legacy). Targets **are** in sitemap (validated in decision matrix `sm=yes` for replacements).

## Internal-link root cause

Batch 11 baseline: broken = 0, redirecting = 0. This audit’s `content_mention` counts are **source string** hits (including hub path substrings in markdown), not proof of production `<a href>` to soft-404. No methodology conflict proven; treat as “mentions exist in content/config,” not “HTML broken links = N.”

## GSC stale-data possibility

**Partial.** After encoding fix, many URLs should become “redirect → 200” for Googlebot. Until then, GSC 404 is **consistent with bot mishandling raw UTF-8 Location**, not merely stale cache. Blog #15–16 may be stale and/or intentional retire-to-index.

## Code search (decode)

- `decodeURIComponent` once in `src/lib/review-trust.ts` — **not** double-decode.
- No `Buffer.from(..., 'latin1').toString('utf8')` pattern found in app redirect path.
- Failure mode is **platform Location emission** + **client header decoding**, not Astro double-decode of pathname.
