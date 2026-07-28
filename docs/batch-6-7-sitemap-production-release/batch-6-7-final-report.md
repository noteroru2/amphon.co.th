# Batch 6.7 Sitemap Lastmod Production Release

- Verdict: PASS WITH WARNING
- Source branch: `codex/batch-6-6-trustworthy-sitemap-lastmod`
- Branch base: `fd1d17aa314de0349af7a4b4ad251727c7c310b0`
- Implementation commit: `a7f4807f2bf9a74975b42390ecd93b72138d09f7`
- Merge SHA: `34d77935871ae1680e5b1d846cefba3fee084e4c`
- Production SHA: `34d77935871ae1680e5b1d846cefba3fee084e4c`
- Deployment ID: `dpl_FwDAZq3kFyFwnG5RC82YY4M6n5hj`
- Production URL: `https://amphon.co.th`
- Sitemap URL: `https://amphon.co.th/sitemap-index.xml`
- Sitemap URLs: 1,183 unique
- URLs with lastmod: 1,175
- URLs without lastmod: 8
- Lastmod coverage: 99.32%
- Latest lastmod: `2026-07-27`
- Date source: frontmatter `updated ?? date`
- Invalid dates: 0
- Future dates: 0
- Article schema mismatches: 0
- Redirect sources in sitemap: 0
- Broken sitemap URLs: 0
- Canonical mismatches: 0
- Noindex sitemap URLs: 0
- Deterministic build: PASS
- Production mapping match: PASS
- Build, Astro check, SEO validation and sitemap QA: PASS
- Internal 404: 0
- Redirect chain and legacy runtime checks: PASS
- Dependency changes: 0
- Lockfile changes: 0
- Content pages changed: 0
- Temp files committed: 0

## URLs intentionally without lastmod

The following canonical, indexable HTTP 200 URLs remain in the sitemap without lastmod because they have no trustworthy page-specific content date:

- `/`
- `/about`
- `/blog`
- `/contact`
- `/privacy-policy`
- `/พื้นที่ให้บริการ`
- `/รับซื้อสินค้าไอที`
- `/วิธีการรับซื้อ`

No build, deployment, current, Git, mtime or ctime date was substituted.

## Production verification

The sitemap index and child sitemap both returned HTTP 200 and parsed successfully. All 1,183 sitemap URLs were crawled. Every URL returned HTTP 200 with the expected canonical and without noindex. The complete audit is in `batch-6-7-production-sitemap-audit.csv`.

Thirty representative URLs were checked across four new articles, four hubs, two final redirect destinations, six area pages, six model/condition pages and all eight static omissions. All passed. The four new articles have sitemap lastmod, schema `datePublished` and schema `dateModified` equal to `2026-07-27`.

GoPro and HDD legacy sources return one permanent 308 redirect to the expected canonical destination, which returns HTTP 200.

## GSC readiness

The production sitemap is ready for Google Search Console:

1. Open Google Search Console.
2. Open **Sitemaps**.
3. Submit the same sitemap URL again: `https://amphon.co.th/sitemap-index.xml`.
4. Do not delete the existing sitemap first.
5. Do not request indexing for all 1,183 URLs.
6. Request indexing only for key URLs whose content was materially changed.

The report-only commit is separate from the production code and must not replace the production deployment.
