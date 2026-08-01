# Baseline — Batch 7 (F-12)

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-7-host-redirect-normalization` |
| Base SHA | `d23f34db41b0c442a98dd267e428239e5c78638e` |
| Finding | F-12 — http://www redirect chain |
| Production status (pre-fix) | Live |

## Observed production chains (pre-fix)

### Current homepage / paths

| Request | Hops | Chain |
| --- | --- | --- |
| `https://amphon.co.th/` | 0 | 200 |
| `http://amphon.co.th/` | 1 | 308 → `https://amphon.co.th/` |
| `https://www.amphon.co.th/` | 1 | 301 → `https://amphon.co.th/` |
| `http://www.amphon.co.th/` | 2 | 308 → `https://www.amphon.co.th/` → 301 → `https://amphon.co.th/` |

### Legacy `/รับซื้อ` (encoded)

| Request | Hops | Notes |
| --- | --- | --- |
| `https://amphon.co.th/<legacy>` | 1 | vercel.json path 308 |
| `http://amphon.co.th/<legacy>` | 2 | HTTPS normalize + path |
| `https://www.amphon.co.th/<legacy>` | 2 | www→apex 301 + path 308 |
| `http://www.amphon.co.th/<legacy>` | **3** | HTTPS www + www→apex + path |

## Controllers (pre-fix)

| Hop | Status | Suspected controller |
| --- | --- | --- |
| HTTP → HTTPS (same host) | 308 | Vercel platform HTTP→HTTPS |
| HTTPS www → HTTPS apex | 301 | Vercel Domain redirect |
| Legacy path | 308 | `vercel.json` redirects |

## DNS (read-only)

| Host | Type | Target |
| --- | --- | --- |
| `amphon.co.th` | A | Vercel anycast IPs |
| `www.amphon.co.th` | CNAME | `*.vercel-dns-017.com` |
| Cloudflare proxy | | Not detected |

## Repository

- No `src/middleware.*`
- No prior host-conditioned redirect in `vercel.json` (184 path rules)
- Canonical site: `https://amphon.co.th`

## Evidence

See `host-variant-baseline.csv` and `raw-response-headers/`.
