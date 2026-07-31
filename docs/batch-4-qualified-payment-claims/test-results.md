# Test results — Batch 4

| Command | Result |
| --- | --- |
| `npx astro check` | PASS — 0 errors / 0 warnings |
| `npm run qa:batch-1-redirects` | PASS |
| `npm run qa:batch-2-sitemap` | PASS |
| `npm run build` | PASS — exit 0 (Windows-safe wrapper) |
| `npm run qa:batch-3-build` | PASS — HTML 1188 / sitemap 1185 |
| `npm run qa:batch-4-claims` | PASS |

## Counts

| Metric | Value |
| --- | --- |
| Route / HTML pages | 1188 |
| Sitemap URLs | 1185 |
| Target pages validated | 8 |
| Unqualified claims remaining on targets | 0 |

## Diffs

| Check | Result |
| --- | --- |
| Route diff | 0 |
| Sitemap diff | 0 |
| Canonical regression on targets | none |
| Noindex regression on targets | none |
| Redirect map | unchanged (not edited) |
