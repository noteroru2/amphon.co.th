# Final report — Batch 7

## Verdict

**BLOCKED: PENDING DOMAIN CONFIGURATION**

Repo-only `vercel.json` www host rule was deployed and measured: it does **not** change production hops because Vercel applies (1) HTTP→HTTPS same-host 308 and (2) Domain 301 www→apex **before** configuration redirects on `www`.

## Finding F-12 status

**OPEN** — cannot close while Legacy `http://www` remains 3 hops.

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-7-host-redirect-normalization` |
| Base SHA | `d23f34db41b0c442a98dd267e428239e5c78638e` |
| Implementation SHA | `14d17137faa59d6216ace145b6f279216245d436` (host rule attempt) |
| Merge SHA | `92860e509c2b23c685d1bb11f9964ea7a54a0524` |
| Follow-up | remove ineffective host rule + record BLOCKED |
| Production SHA | `NOT VERIFIED` |
| Deployment URL | https://amphon.co.th |
| Primary domain | `https://amphon.co.th` |

## Root cause

| Hop | Status | Controller |
| --- | --- | --- |
| 1 | 308 | Vercel platform HTTP→HTTPS (Location keeps `www`) |
| 2 | 301 | Vercel Domain redirect `www` → apex |
| 3 (legacy only) | 308 | `vercel.json` path redirect on apex |

## Production hops (after attempted fix)

| Variant | Hops | Status vs target |
| --- | --- | --- |
| Current HTTP WWW | **2** | Allowed with platform evidence (≤2) |
| Current HTTPS WWW | **1** | Pass |
| HTTP Apex | **1** | Pass |
| Legacy HTTPS Apex | **1** | Pass |
| Legacy HTTPS WWW | **2** | Pass (≤2) |
| Legacy HTTP WWW | **3** | **Fail close criteria (need ≤2)** |

Permanent codes observed: **308** (HTTP/platform & path), **301** (domain www→apex).

Path/query/unicode/encoded: preserved. Loops: 0. Soft 404: 0. WWW final 200: 0.

## Why repo fix failed

Selected layer `vercel.json` host → `https://amphon.co.th/:path*` never became the first Location for `http://www` (still `https://www...`). Domain redirect continues to own HTTPS www.

## Required user action (Dashboard)

1. Vercel → Project → Settings → Domains  
2. Keep `amphon.co.th` as primary / production  
3. Do **not** delete `www.amphon.co.th`  
4. Change www from pure Domain Redirect to a mode where requests can hit deployment routing **only after** a path-aware Edge/middleware or absolute host+legacy rules are ready — otherwise www may answer 200  
5. Recommended safe approach with auth:  
   - Prepare Edge middleware (or per-legacy www host rules with absolute canonical destinations) that redirects `www` → `https://amphon.co.th` + canonical path in one response  
   - Then switch www off “redirect-only” so those rules execute  
6. Do not invent DNS changes; no new tokens from the agent

Until that happens, F-12 stays open.

## Scope

No content/sitemap/canonical/schema/image/F-01 destination changes. Ineffective host rule removed after measurement.
