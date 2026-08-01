# Production release report — Batch 7

## Verdict

**BLOCKED: PENDING DOMAIN CONFIGURATION**

## Finding F-12 status

**OPEN**

## SHAs

| Role | SHA |
| --- | --- |
| Base | `d23f34db41b0c442a98dd267e428239e5c78638e` |
| Implementation (host rule attempt) | `14d17137faa59d6216ace145b6f279216245d436` |
| Merge | `92860e509c2b23c685d1bb11f9964ea7a54a0524` |
| Production | `NOT VERIFIED` |
| Report / cleanup | *(this follow-up commit)* |

## Deployment URL

https://amphon.co.th

## Primary domain / controllers

- Primary: `https://amphon.co.th`
- Redirect controllers: Vercel platform HTTPS + Vercel Domain www redirect + vercel.json path rules
- Root cause of extra hops: platform keeps www on HTTPS upgrade; domain redirect then apex; legacy path adds third hop

## Hop summary

| Class | Before | After | Target |
| --- | --- | --- | --- |
| Current HTTP WWW | 2 | 2 | ≤2 with platform evidence |
| Current HTTPS WWW | 1 | 1 | 1 |
| Legacy HTTP WWW | 3 | 3 | ≤2 — **not met** |
| HTTP Apex | 1 | 1 | 1 |
| HTTPS Apex legacy | 1 | 1 | 1 |

## Other checks

Permanent: 308/301 · Path/query/unicode OK · Loops 0 · Incorrect dest 0 · Soft 404 0 · WWW 200 0 · Sitemap WWW 0 · Canonical WWW 0 · Batch 1–6 local QA PASS · Build exit 0

## Remaining Findings

F-12 open; also F-04, F-06, F-09, F-10, F-13, etc.
