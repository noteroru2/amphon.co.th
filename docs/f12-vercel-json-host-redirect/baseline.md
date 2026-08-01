# Baseline — F-12 remediation

## Historical (Final Audit)

- Verdict: PASS WITH KNOWN OPEN FINDINGS
- Redirect rules: 222
- F-12: OPEN — PLATFORM / DOMAIN REDIRECT CHAIN
- Sitemap: 1,166
- Routes: 1,169

## Current (this branch, pre-change)

- Path redirects in `vercel.json`: **222** (matches historical)
- WWW host rules before: **0**
- Production http://www legacy hops: **3** (confirmed)
- Production https://www legacy hops: **2** (domain then path)

## After Phase A config (not yet effective for www traffic)

- Path redirects retained: 222
- Exact WWW rules: 222
- Catch-all: 1
- Total: 445
- Status codes for new rules: **307** only
