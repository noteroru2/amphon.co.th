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
Verdict: PASS — SAFE ROLLBACK COMPLETE
F-12: OPEN — VERCEL HOBBY PLATFORM LIMITATION / OWNER-ACCEPTED
Domain: www 301 → apex
Failed Phase A runtime: REMOVED
Production: READY
Development cycle: CLOSED
```

See `final-code-cleanup-report.md`.
