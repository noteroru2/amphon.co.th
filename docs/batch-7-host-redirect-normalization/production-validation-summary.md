# Production validation summary — Batch 7

## Verdict

**BLOCKED: PENDING DOMAIN CONFIGURATION**

## Finding F-12

**OPEN**

## Measured production (post merge `92860e5`)

| Metric | Before | After attempted vercel.json host rule |
| --- | --- | --- |
| Current HTTP WWW hops | 2 | **2** (unchanged) |
| Current HTTPS WWW hops | 1 | **1** |
| Legacy HTTP WWW hops | 3 | **3** (unchanged) |
| HTTP Apex hops | 1 | **1** |
| HTTPS Apex legacy hops | 1 | **1** |
| First Location `http://www/` | `https://www.amphon.co.th/` | same |
| Query preservation | yes | yes |
| Soft 404 | 0 | 0 |
| Redirect loops | 0 | 0 |
| WWW 200 terminal | 0 | 0 |
| Sitemap count | 1185 | 1185 |
| Sitemap WWW URLs | 0 | 0 |

## Controllers confirmed

- HTTP→HTTPS: Vercel platform 308  
- WWW→Apex: Vercel Domain 301  
- Legacy path: vercel.json 308  

## Conclusion

Repository cannot reduce Legacy `http://www` below 3 hops without Vercel Domain/alias + path-aware edge routing. Host rule attempt removed after proof of no effect.
