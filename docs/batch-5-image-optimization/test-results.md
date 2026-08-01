# Test results — Batch 5

| Command | Result |
| --- | --- |
| `npx astro check` | PASS — 0 errors / 0 warnings |
| `npm run qa:batch-1-redirects` | PASS |
| `npm run qa:batch-2-sitemap` | PASS |
| `npm run build` | PASS — exit 0 |
| `npm run qa:batch-3-build` | PASS — HTML 1188 / sitemap 1185 |
| `npm run qa:batch-4-claims` | PASS |
| `npm run qa:batch-5-images` | PASS |

## Asset savings

| Metric | Value |
| --- | --- |
| Assets swapped | 21 |
| Bytes before | 15,007,296 |
| Bytes after | 1,825,972 |
| Bytes saved | 13,181,324 (~87.8%) |
| Live URLs impacted | 23 |
| Valid exceptions | Unreferenced oversized PNGs retained without WebP generation; draft page source updated but not live |
| Broken images | 0 |

## Diffs

Route/Sitemap/Canonical/Noindex/Redirect/Content-text: unchanged intentionally.
