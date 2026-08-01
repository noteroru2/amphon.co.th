# F-12 — File-based host redirects (Vercel Hobby)

Phase A prepares `vercel.json` host-aware WWW redirects (307).  
Host rules become effective only after the owner switches `www.amphon.co.th` from Domain Redirect 301 → Production.

```text
Source of Truth: vercel.json
Exact WWW legacy rules: 222
Generic WWW catch-all: 1
Existing path rules retained: 222
Total redirects after Phase A: 445
Phase A status: 307
```

## Status

```text
F-12: OPEN — ROLLED BACK TO SAFE DOMAIN REDIRECT
Production: READY WITH KNOWN OPEN FINDING
```

- Phase A: merged (307 host rules in `vercel.json`)
- Phase B domain cutover: **FAILED** — host `has` rules did not fire (`phase-b-failure.md`)
- Domain rollback: **COMPLETE** — baseline restored (`post-rollback-validation.md`)
- Do **not** re-switch domain until a new remediation plan
