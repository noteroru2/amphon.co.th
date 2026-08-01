# Configuration analysis — Batch 7 (updated after production proof)

```text
Current primary domain: amphon.co.th (HTTPS Non-WWW)
Current WWW configuration: Domain redirect 301 → apex (path/query preserved)
HTTP controller: Vercel platform 308 HTTP→HTTPS (Host preserved)
HTTPS controller: Vercel edge
WWW controller: Vercel Domain redirect (Dashboard) — NOT vercel.json
Path redirect controller: vercel.json (184 permanent rules → 308)
Legacy redirect controller: vercel.json (Batch 1 destinations unchanged)
Root cause of extra hops:
  http://www → https://www (platform) → https://apex (domain) → [legacy path 308]
Selected fix layer attempted: vercel.json host rule www → https://amphon.co.th/:path*
Alternative considered: middleware/edge path-aware merge; Dashboard alias change
Reason selected initially: single repo rule, no destination changes
Production result: NO HOP REDUCTION — host rule never became first Location
Expected hop reduction: not achieved
Risks of forcing alias without path-aware www handler: www may serve 200 duplicates
Rollback: remove ineffective host rule (done); Domains unchanged
```

## Dashboard steps required (user)

1. Open Vercel Project Settings → Domains  
2. Confirm primary `amphon.co.th`  
3. Keep `www.amphon.co.th` (do not delete)  
4. Plan path-aware www→apex+canonical routing (Edge middleware or absolute host-conditioned legacy rules)  
5. Only then change www off redirect-only so deployment routing can run  
6. Re-measure Legacy `http://www` must be ≤2 hops  
7. Agent has no Vercel token/project link — cannot perform step 5
