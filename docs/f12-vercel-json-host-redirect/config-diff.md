# Config diff — Phase A

| Metric | Before | After |
| --- | --- | --- |
| Path redirects (no host) | 222 | 222 (retained) |
| WWW host exact | 0 | 222 |
| WWW catch-all | 0 | 1 |
| Total redirects | 222 | 445 |
| New rule status | — | 307 only |
| preserveQueryParams on new rules | — | true |
| Content / metadata / sitemap logic | unchanged | unchanged |

## Files touched (implementation)

- `vercel.json` — prepend WWW exact + append catch-all
- `scripts/generate-f12-www-redirects.mjs` — generator
- `scripts/check-f12-vercel-host-redirect.mjs` — QA
- `scripts/check-batch-7-host-redirects.mjs` — expect host rules
- `scripts/lib/site-audit.mjs` — ignore host rules in apex chain resolver
- `package.json` — `qa:f12-vercel-host-redirect`
- `docs/f12-vercel-json-host-redirect/*`
