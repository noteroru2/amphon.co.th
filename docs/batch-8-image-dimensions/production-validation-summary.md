# Production validation summary — Batch 8

## Verdict

**PASS WITH WARNING**

- Production HTML dimensions verified on sampled F-13 URLs
- Lighthouse CLS: `NOT VERIFIED WITH LIGHTHOUSE`
- Production SHA: `NOT VERIFIED`

## Finding F-13

**CLOSED**

## Identity

| Item | Value |
| --- | --- |
| Branch | `fix/batch-8-image-dimensions` |
| Base SHA | `b412282a2053dd687771f87621b7d9a81f643e58` |
| Implementation SHA | `a797aecf40ea10c8af53b3a6b4d829f25633e1d3` |
| Merge SHA | `98e9f6b33b517a3ac1e9b54739fb3887e2a49a2b` |
| Production SHA | `NOT VERIFIED` |
| Deployment URL | https://amphon.co.th |

## Production samples

All sampled URLs HTTP 200; content `<img>` has intrinsic width/height matching sharp metadata; sitemap 1185.

## Regressions

Broken images 0 · Asset 404 0 · Alt/loading preserved on samples · F-12 still OPEN/BLOCKED (unchanged)
