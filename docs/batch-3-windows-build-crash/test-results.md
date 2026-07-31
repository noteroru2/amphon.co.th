# Test results — Batch 3

## Commands

| Command | Result |
| --- | --- |
| `npx astro check` | PASS — 0 errors / 0 warnings |
| `npm run qa:batch-1-redirects` | PASS |
| `npm run qa:batch-2-sitemap` | PASS (`dist=PRESENT`, count 1185) |
| `npm run build` × 3 | PASS — exit 0 each run |
| `npm run qa:batch-3-build` | PASS |

## Windows build matrix

| Run | Exit | HTML | Sitemap | Duration | Marker |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 1188 | 1185 | 24.3s | present |
| 2 | 0 | 1188 | 1185 | 24.8s | present |
| 3 | 0 | 1188 | 1185 | 24.9s | present |

## Output regression

| Metric | Diff |
| --- | --- |
| Unexpected route diff | 0 |
| Unexpected sitemap URL count vs production baseline | 0 (1185) |
| Canonical / noindex / redirect / content intentional changes | 0 |

## Linux local

`NOT VERIFIED LOCALLY` — no WSL/Docker CI job exercised in this batch. Vercel Production uses ASCII Linux paths where the wrapper runs in-place mode.

## Control (unwrapped)

`npm run build:astro` on the Thai path still expected to crash; used as reproduction control, not the default `build` script.
