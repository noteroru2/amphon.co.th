# Batch 6.4 QA Report

## Verdict

PASS WITH WARNING

## Automated QA

All authoritative build checks were run from a clean temporary worktree carrying only the staged Batch 6.4 code diff.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run astro -- sync` | 0 | PASS |
| `npm run astro -- check` | 0 | PASS — 104 files, 0 errors, 0 warnings, 43 pre-existing hints |
| `npm run build` | 0 | PASS — 1,188 built pages |
| `npm run validate:seo` | 0 | PASS — 1,187 pages |
| `npm run qa:sitemap` | 0 | PASS — 2 sitemap files |
| `npm run qa:duplicate-headings` | 0 | PASS — 1,188 pages |
| `npm run qa:internal-404` | 0 | PASS — 0 broken targets |
| `npm run qa:redirect-chain` | 0 | PASS — 9 samples, no loops/chains |
| `node scripts/check-blog-listing.mjs` | 0 | PASS — 50 unique cards; order, dates, schemas, canonicals, sitemap and 11.40:1 contrast |

The first build attempt from the Thai-character workspace path reached Vercel adapter bundling but the Windows process terminated abnormally. A mapped drive was also unsuitable because the adapter requires a `file:` URL. The clean ASCII-path worktree build completed successfully and is the authoritative build result.

## Browser QA

The production page was captured before changes. The post-change page was tested from the local Astro server backed by the clean QA worktree.

| Viewport | Overflow | Console warnings/errors | Broken images | Hero | Cards |
| --- | ---: | ---: | ---: | --- | --- |
| 1440×900 | 0px | 0 | 0 | PASS — 345.48px high | PASS |
| 1920×1080 | 0px | 0 | 0 | PASS — 348.06px high | PASS |
| 390×844 | 0px | 0 | 0 | PASS — 347.84px high | PASS |
| 360×800 | 0px | 0 | 0 | PASS — 373.31px high | PASS |

Additional checks:

- Breadcrumb, badge, H1, subtitle, description, CTA/footer/floating widgets rendered.
- All 50 cards remained available; no pagination or JS-only load-more exists.
- The first four cards match the required deterministic order and display 27 July 2026.
- Tags use the existing flex-wrap and 0.5rem gap; no joined tag text.
- Read-more links now have title-specific accessible names.
- Clicking the first card reached the correct article; its H1, canonical, date, image and mobile overflow passed.
- Blog schema includes `CollectionPage`, `BreadcrumbList`, and `ItemList`.

## Warning

The site's Astro sitemap integration does not emit `<lastmod>` for any route. All four article URLs are present in the sitemap, and their `datePublished`/`dateModified` schema values are correct. Adding global sitemap last-modified serialization would exceed this focused hotfix scope.

`astro preview` is not supported by the Vercel adapter. Browser QA therefore used the Astro development server, while the completed Vercel-adapter production build supplied output-level validation.
