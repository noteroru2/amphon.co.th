# Batch 6.3 Production Legacy Redirect Hotfix

- Verdict: PASS WITH WARNING
- Source branch: `batch-6-3-production-legacy-redirect-hotfix`
- Starting Production SHA: `f61839a1e74e016ea1795143411cf2bcef624959`
- Hotfix commits: `4460a258dce2d8f38b53d5752cb4d7a95b65255a`, `1a81d0ea0a977971ae12886b288dc70b647d7d4e`
- Merge SHA / Production SHA: `8b0f4ac7e9d28b52790f3fd02d29bb324d457aa5`
- Deployment ID: `dpl_GvBPs6FhdXv8NR9NuhAGqVNbSW3Z`
- Production URL: `https://amphon.co.th`
- Deployment URL: `https://amphon-co-jgooh9hbf-amphons-projects-bb1ec3bf.vercel.app`
- Legacy routes generated as pages: No
- Redirect layer: Vercel permanent redirects with Unicode and percent-encoded exact-source rules
- GoPro legacy status before: 200
- GoPro legacy status after: 308
- GoPro Location: `/บริการ/รับซื้อ-gopro-action-camera`
- GoPro redirect count: 1
- HDD legacy status before: 200
- HDD legacy status after: 308
- HDD Location: `/บริการ/รับซื้อ-ssd`
- HDD redirect count: 1
- Final GoPro page: 200, self-canonical, sitemap present
- Final SSD page: 200, self-canonical, sitemap present
- Legacy URLs in sitemap: No
- Final URLs in sitemap: Yes
- Build: PASS
- Astro check: PASS
- SEO validation: PASS
- Internal 404: PASS — 0
- Redirect chain: PASS — 0 on canonical legacy sources
- Route count: 1,188 built pages
- Dependency changes: None
- Lockfile changes: None
- Temp files committed: None
- Content pages changed: None
- Merge: Complete
- Deploy: Complete and production-verified

## Production evidence

The production runtime test verified real response behavior, not only configuration:

| Source | Status | Location | Redirects | Final status | Canonical |
| --- | ---: | --- | ---: | ---: | --- |
| `/บริการ/รับซื้อ-gopro` | 308 | `/บริการ/รับซื้อ-gopro-action-camera` | 1 | 200 | self |
| `/บริการ/รับซื้อ-hdd` | 308 | `/บริการ/รับซื้อ-ssd` | 1 | 200 | self |

The final production pages retained their existing Title and H1 because neither content source was changed. JSON-LD validation passed.

## Report-only commit

Batch 6.2 and Batch 6.3 reports are committed only after production verification. That report-only SHA is documentation history and must not be described as the verified Production SHA. The verified Production SHA remains the code merge SHA above unless a later deployment is intentionally promoted.

## Remaining risks

- A trailing-slash legacy variant uses two permanent hops because the global policy first removes the slash. The canonical no-slash acceptance URLs use exactly one hop.
- `qa:claim-risk` has one unrelated pre-existing false positive described in the QA report.
