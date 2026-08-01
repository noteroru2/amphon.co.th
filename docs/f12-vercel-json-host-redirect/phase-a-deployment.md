# Phase A deployment

| Field | Value |
| --- | --- |
| Base SHA | `ff6f453b0dc1a059d8c13fbf0fa365755d05315b` |
| Phase A implementation SHA | `8bf095f3951d726e53f608ad9640873a58f2da2d` |
| Phase A merge SHA | `84f083b57bb523310e763b986bc986d33cbb96e5` |
| Branch | `fix/f12-vercel-json-host-redirect` |
| PR | https://github.com/noteroru2/amphon.co.th/pull/new/fix/f12-vercel-json-host-redirect |
| Production SHA | NOT VERIFIED |
| Apex homepage | 200 |
| Sitemap index | 200 |
| Apex legacy `/บริการ/รับซื้อ-hdd` | 308 |
| WWW rules effective? | **NO** — Domain 301 still owns www until manual switch |
| Temporary redirect status | 307 |
| Rollback | READY (`docs/f12-vercel-json-host-redirect/rollback-plan.md`) |

## Counts deployed in config

- Path rules retained: 222
- Exact WWW: 222
- Catch-all: 1
- Total: 445
