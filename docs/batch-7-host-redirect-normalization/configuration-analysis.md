# Configuration analysis — Batch 7

```text
Current primary domain: amphon.co.th (HTTPS Non-WWW) — confirmed by astro site URL, sitemap, canonical HTML, production 200
Current WWW configuration: www.amphon.co.th CNAME → Vercel DNS; HTTPS www returns 301 to apex (Vercel Domain redirect)
HTTP controller: Vercel platform 308 HTTP→HTTPS (preserves Host)
HTTPS controller: Vercel edge / deployment
WWW controller: Vercel Domain redirect 301 www → apex (path+query preserved)
Path redirect controller: vercel.json redirects (184 rules, permanent → 308)
Legacy redirect controller: same vercel.json path rules (Batch 1)
Root cause of extra hops:
  1) HTTP www is upgraded to HTTPS www first (platform)
  2) HTTPS www is then redirected to HTTPS apex (domain redirect)
  3) Legacy paths add a third hop via vercel.json on apex
Selected fix layer: Repository vercel.json host-conditioned redirect (first rule) to https://amphon.co.th/:path*
Alternative considered:
  - Dashboard-only domain tweak (no CLI/project auth available) → blocked without credentials
  - Middleware merging host+legacy map → only works if www requests reach the app (domain redirect currently intercepts)
  - Duplicating all legacy rules with www host + absolute canonical destination → high risk / large scope
Reason selected: Single rule, preserves path/query, can collapse HTTP www → HTTPS apex if Edge evaluates config redirects before or instead of same-host HTTPS upgrade; does not alter F-01 destinations
Expected hop reduction:
  - Current HTTP www: 2 → 1 (if host rule applies on first request)
  - Legacy HTTP www: 3 → 2 (host collapse + path) or better
  - If platform HTTPS-upgrade still wins first: hops unchanged → document platform limit / Dashboard next step
Risks:
  - Host rule ignored if Domain redirect / HTTPS upgrade always precede config redirects
  - Double-encoding if capture mishandled (mitigate with :path* and production checks)
  - Interaction with 184 path rules (host rule first; path rules remain for apex)
Rollback:
  - Revert merge commit removing the host rule; push main
  - Do not change DNS
```

## Dashboard steps if config rule ineffective (user action)

1. Vercel Project → Settings → Domains
2. Confirm `amphon.co.th` is Production / Primary
3. Confirm `www.amphon.co.th` redirects to `amphon.co.th` (or, if needing middleware merge, temporarily serve www as alias then rely on vercel.json host rule — only with explicit approval)
4. Do not remove www domain
5. Do not create new tokens in-repo
