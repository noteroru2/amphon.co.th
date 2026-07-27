# Batch 6.3 Root Cause

## Summary

The defect had two layers:

1. `src/pages/บริการ/รับซื้อ-gopro.astro` and `src/pages/บริการ/รับซื้อ-hdd.astro` generated real static `200` pages. Those files implemented canonical, meta refresh, and `window.location.replace`, so the redirect-map checks passed while production still served page content.
2. After those static pages were removed, the first hotfix deployment returned `404`. Production requests reach Vercel in percent-encoded form, while the two exact redirect rules had only Unicode sources. Existing working lens and storage redirects demonstrated that an encoded source fallback is required for Thai paths in this deployment.

## Route analysis

| Legacy URL | Source generating 200 | Redirect rule | Rule location | Final URL | Root cause |
| --- | --- | --- | --- | --- | --- |
| `/บริการ/รับซื้อ-gopro` | `src/pages/บริการ/รับซื้อ-gopro.astro` | permanent redirect | `vercel.json` | `/บริการ/รับซื้อ-gopro-action-camera` | A static legacy page masked the intended redirect; after removal the Unicode-only rule did not match Vercel's encoded request path. |
| `/บริการ/รับซื้อ-hdd` | `src/pages/บริการ/รับซื้อ-hdd.astro` | permanent redirect | `vercel.json` | `/บริการ/รับซื้อ-ssd` | A static legacy page masked the intended redirect; after removal the Unicode-only rule did not match Vercel's encoded request path. |

The final pages are generated from:

- `src/content/services/รับซื้อ-gopro-action-camera.md`
- `src/content/services/รับซื้อ-ssd.md`

Neither final-page content file was modified.

## Precedence and encoding

The production evidence showed that a generated static legacy resource was served as `200` instead of the expected configuration redirect. Removing both explicit legacy page files stopped the static output from being generated.

The first deployment after removal then exposed the encoding issue: both paths returned `404`, while the equivalent lens and storage rules worked because `vercel.json` contained percent-encoded source fallbacks. Batch 6.3 therefore keeps the readable Unicode exact rules and adds matching encoded source rules for GoPro and HDD.

The canonical no-trailing-slash source redirects directly in one hop. Under the repository's global `trailingSlash: "never"` policy, a trailing-slash variant first normalizes the slash and then applies the legacy redirect, for two permanent hops. This is consistent with existing site routing and does not affect the acceptance URLs.

## Final fix

- Removed the two legacy static page sources.
- Kept the final GoPro and SSD pages unchanged.
- Added percent-encoded Vercel source fallbacks for the two Thai legacy paths.
- Added a runtime regression script that verifies real HTTP status, `Location`, redirect count, final status, canonical, and sitemap membership.
- Strengthened build-output QA so legacy static output causes failure and both final outputs are required.
- Extended redirect configuration QA to require both Unicode and encoded variants.

## Production result

Deployment `dpl_GvBPs6FhdXv8NR9NuhAGqVNbSW3Z`, built from main merge SHA `8b0f4ac7e9d28b52790f3fd02d29bb324d457aa5`, returned:

- `/บริการ/รับซื้อ-gopro`: `308` → `/บริการ/รับซื้อ-gopro-action-camera`, one redirect, final `200`.
- `/บริการ/รับซื้อ-hdd`: `308` → `/บริการ/รับซื้อ-ssd`, one redirect, final `200`.

Both final URLs are self-canonical and present in the sitemap. Both legacy URLs are absent from the sitemap.
