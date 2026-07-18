# Batch 11B.1 — Final Release QA

Date: 2026-07-18

## Release gate

- Production build: PASS — 1,174 pages generated.
- Coverage suite: PASS.
- Internal 404 check: PASS.
- Redirect-chain check: PASS.
- Sitemap indexability check: PASS.
- Duplicate title/H1 check: PASS.
- Claim-risk check: PASS.
- `git diff --check`: PASS.
- Protected configuration review: PASS — no changes to `vercel.json`, `astro.config.mjs`, deployment or QA scripts, canonical handling, sitemap generation, redirects, or the global design system.

## iPad inbound-link audit

Before the release-gate adjustment, the article was discoverable through generated blog collection/index output but had no literal contextual inbound link from source content.

Two crawlable contextual HTML links were added:

| Source URL | Anchor | Crawlable |
| --- | --- | --- |
| `/บริการ/รับซื้อ-ipad` | `วิธีเช็กรุ่น iPad จากเลขโมเดล Axxxx` | Yes — normal Markdown link rendered as `<a href>` |
| `/blog/ขาย-ipad-มือสอง-ต้องเช็กอะไรบ้าง` | `ตรวจว่า iPad เป็น Gen ไหน` | Yes — normal Markdown link rendered as `<a href>` |

No footer, link cloud, or global component was changed.

## Mobile browser QA

All eight target pages were tested from the production build through the local preview at a requested viewport of 390 × 844 pixels (375-pixel document client width).

All pages passed:

- no document-level horizontal overflow;
- exactly one visible, page-specific H1;
- LINE and telephone links present;
- valid JSON-LD;
- correct self-canonical;
- index/follow robots directive;
- no placeholder text or overlapping content.

The iPad Axxxx table and the computer specification table are wider than their content column but remain contained in their intended horizontal-scroll wrappers; neither causes page-level overflow. The iPad article has no FAQPage schema because it does not display a real FAQ section. Its link to the iPad service page is rendered and crawlable.

## Metadata safety

- Titles and H1s are unique across all 1,174 built pages.
- Descriptions match the visible page content.
- The four area pages use online-first assessment and conditional appointment/fulfilment language; none claims a local branch.
- The Nakhon Ratchasima page includes both “โคราช” and “นครราชสีมา”.
- The RAM page contains no old fixed-price table or unsupported guarantee wording.
- The iPad article remains informational and distinct from the transactional iPad service page.

## Pre-release verdict

PASS — release gate cleared for the two-commit strategy and production deployment.

