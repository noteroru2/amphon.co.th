# Batch 11B — Final QA Report

Date: 2026-07-18

## Scope

Final QA covered the eight pages in the Batch 11B opportunity-recovery set, their metadata and structured data, internal links, responsive rendering, and the repository-wide SEO safety checks.

## Automated QA

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | PASS | Astro production build completed; 1,174 pages generated. |
| `npm run qa:coverage` | PASS | All bundled coverage checks completed successfully. |
| Internal 404 links | PASS | No internal broken-link regression detected. |
| Redirect chains | PASS | No redirect-chain regression detected. |
| Sitemap coverage | PASS | Sitemap QA completed successfully. |
| Duplicate headings | PASS | Heading duplication check completed successfully. |
| Claim-risk scan | PASS | No prohibited or unsupported high-risk wording detected by the project QA. |
| `git diff --check` | PASS | No whitespace-error regression. |

The local dependency installation had to be repaired before the final build because the existing `node_modules` tree was missing files from `aria-query`. Running `npm install` restored the local environment; it did not introduce tracked dependency-file changes.

## Browser QA

The in-app browser was used at a mobile viewport of 390 × 844 pixels (375-pixel document client width) to inspect representative page types:

- Home page
- RAM service page
- Nakhon Ratchasima area page
- iPad model-identification article

All inspected pages passed the following runtime checks:

- No horizontal overflow (`scrollWidth === clientWidth`)
- One visible, page-specific H1
- Self-referencing canonical URL
- Index/follow robots directive
- Working LINE and telephone link elements present
- JSON-LD parsed successfully
- No placeholder content detected

## Content and SEO Review

- Search intent is separated between the national home page, product/service pages, local-area pages, and the informational iPad article.
- Titles and H1s were adjusted to make each page's primary intent explicit without creating duplicate targets.
- Area pages now describe an online-first assessment process and conditional appointments instead of implying guaranteed local coverage.
- Unsupported fixed prices, speed guarantees, accuracy guarantees, and absolute pricing claims were removed from the RAM page.
- The iPad article now provides an answer-first model-number lookup and links to Apple's official identification guidance.
- Existing conversion paths to LINE, telephone, and relevant service pages were preserved.

## Configuration and Release Safety

- No changes were made to `vercel.json`, `astro.config.mjs`, or deployment scripts.
- No commit was created.
- No branch was pushed.
- No preview or production deployment was performed.
- Pre-existing untracked workspace files were left untouched.

## Data Caveat

No raw Google Search Console query export was present in the workspace. The opportunity prioritization and query-to-page mapping therefore use the page-level metrics and targets supplied in the Batch 11B brief. Query-level performance and cannibalization should be re-measured from a fresh GSC export after the approved changes have been deployed and accumulated sufficient impressions.

## Verdict

**WARNING — QA passed and the batch is ready for human review, with one measurement caveat: the raw GSC query export was unavailable.**

