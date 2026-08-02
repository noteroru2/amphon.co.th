# Test results — audit baseline (read-only)

## Audit script

```text
npm run audit:gsc-404-thai-urls
exit 0
```

See `audit-summary.json`.

## Package scripts

| Script | Result |
| --- | --- |
| `npx astro check` | 0 errors / 0 warnings (105 hints) |
| `npm run build` | exit 0 |
| `npm run qa:batch-1-redirects` | PASS |
| `npm run qa:batch-2-sitemap` | PASS (simulated=1166) |
| `npm run qa:batch-7-host-redirects` | PASS (config; www_host_rules=0) |
| `npm run qa:batch-11-internal-links` | PASS (broken=0, redirecting=0) |
| `npm run qa:redirect-chain` | PASS |

No production source changes. `npm run check` is not defined; used `npx astro check`.
