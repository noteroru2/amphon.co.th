# Batch 7 — Host Redirect Normalization (F-12)

Collapse `http://www` / `https://www` / `http` apex host-protocol chains toward canonical `https://amphon.co.th` while preserving path and query.

## Identity

| Item | Value |
| --- | --- |
| Finding | F-12 |
| Branch | `fix/batch-7-host-redirect-normalization` |
| Base SHA | `d23f34db41b0c442a98dd267e428239e5c78638e` |
| Canonical host | `https://amphon.co.th` |

## Fix

Prepend one `vercel.json` host-conditioned permanent redirect:

```json
{
  "source": "/:path*",
  "has": [{ "type": "host", "value": "www.amphon.co.th" }],
  "destination": "https://amphon.co.th/:path*",
  "permanent": true
}
```

Goal: when Edge evaluates this on the initial `www` request (including HTTP), Location jumps straight to HTTPS apex, reducing hops.

## QA

```bash
npm run qa:batch-7-host-redirects
BATCH7_RUNTIME=1 npm run qa:batch-7-host-redirects
```
