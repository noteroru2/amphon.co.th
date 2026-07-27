# Batch 6 — iPad and iPhone Cluster Architecture

## Executive Summary

- Verdict: **PASS WITH WARNING**
- Branch: `batch-6-ipad-iphone-cluster-architecture`
- Starting SHA: `441892a`
- Final SHA: assigned by the reports commit; see the final delivery response and remote branch
- iPad pages audited: 35
- iPhone pages audited: 42
- iPad page files updated: 7
- iPhone page files updated: 13
- Shared architecture/layout files updated: 2
- Pages created: 0
- Pages deleted: 0
- Redirects created: 0
- Noindex changes: 0
- In-scope internal broken links fixed: 5
- In-scope broken links remaining: 0
- Site-wide pre-existing broken links outside scope: 11
- Batch 6 orphan pages: 0
- Site-wide pre-existing orphan pages outside scope: 4
- Query conflicts confirmed: 0
- Query conflicts probable: 2
- Query conflicts possible: 3
- Query relationship with insufficient evidence: 1
- Build: PASS
- Astro check: PASS
- Sitemap: PASS
- Commit: three scoped commits planned (iPad, iPhone, reports/QA)
- Push: branch only
- Merge: No
- Deploy: No

## iPad Cluster

- Transactional Hub: `/บริการ/รับซื้อ-ipad`
- Tablet Hub: `/บริการ/รับซื้อแท็บเล็ต` owns multi-brand Android/Windows tablet terms; it is a sibling/parent-adjacent hub, not an alias of iPad.
- Family pages: iPad Pro, Air, mini and Gen remain existing children; no exact-variant pages were generated.
- Condition pages: iPad broken screen and damaged/non-working iPad remain distinct service intent.
- Informational owners: the model-number guide owns “วิธีดูรุ่น iPad / Axxxx”; the iCloud guide owns the informational account-lock query.
- Accessories: Apple Pencil and Magic Keyboard remain supporting service pages.
- Location relationship: `/รับซื้อ/รับซื้อ-ipad-{province}` owns province-modified intent and links to the national service hierarchy; no location page was rewritten.
- Primary ownership: broad iPad transactional queries belong to the iPad Hub.
- Content gaps/P2: exact generations, battery-only, bend-only and charge-port-only pages need demand before creation.
- Duplicate candidates: Tablet versus iPad is adjacent intent, not confirmed cannibalization.

## iPhone Cluster

- Phone Hub: `/บริการ/รับซื้อโทรศัพท์มือสอง` owns broad multi-brand phone terms.
- iPhone Hub: `/บริการ/รับซื้อ-iphone` owns brand-specific transactional terms.
- Model pages: existing iPhone 13–17 and Pro Max pages remain; no color/capacity/country variants were created.
- Condition pages: broken screen and Face ID retain distinct transactional intent.
- Account-lock service: `/บริการ/รับซื้อ-iphone-ติด-icloud` now covers assessment only after the original owner removes the Apple Account, Find My, Activation Lock and any MDM.
- Informational owner: `/blog/iphone-ติด-icloud-ลืม-apple-id-ก่อนขาย` answers iCloud/account recovery intent and does not teach bypassing.
- Location relationship: `/รับซื้อ/รับซื้อ-iphone-{province}` owns province-modified intent; sample pages were audited without rewrite.
- Primary ownership: broad iPhone queries belong to the iPhone Hub, not the Phone Hub.
- Content gaps/P2: Parts and Service History may warrant a focused guide after demand; exact model/condition combinations remain rejected.
- Duplicate candidates: `รับซื้อมือถือ` overlaps the Phone Hub, but no merge, redirect or deletion is justified without Query × Page.

## Cannibalization

- Confirmed: 0. The supplied GSC workbook does not contain Query × Page.
- Probable: Phone Hub versus `รับซื้อมือถือ`; iPhone iCloud guide versus former service wording.
- Possible: Tablet versus iPad; model-identification guide versus iPad Gen; Phone versus iPhone.
- Insufficient evidence: national service versus province landing pages.
- Safe action used: ownership labels, internal anchors, parent/child architecture and focused metadata/content changes. No URL consolidation was performed.

## Internal Linking

- Hub → Child: dedicated cluster priorities now expose bounded family/model/condition links.
- Child → Hub: model/condition pages resolve into the appropriate iPad or iPhone hub rather than broad Apple links.
- Guide → Service: informational guides point to the national transactional owner.
- Phone → iPhone and Tablet → iPad: relationships are explicit without treating the pages as duplicates.
- Location → National Service: five broken iPhone Ubon links were corrected from the nonexistent `/พื้นที่ให้บริการ/...` route to `/รับซื้อ/...`.
- Misleading “รับซื้อ iPhone ติด iCloud” anchors were renamed to post-unlock assessment wording.

## Pages Created

No page was created. Existing architecture already covers the evidenced high-value intents.

## Pages Not Created

- Exact iPad generations and exact iPhone variants: insufficient demand and thin-content risk.
- Color, capacity and country combinations: programmatic duplication risk.
- Province + model and model + condition combinations: overlapping intent and no GSC evidence.
- Separate iPad bend/battery/charge pages: current condition pages can answer these without fragmentation.
- Parts and Service History guide: useful candidate, but current export does not show enough demand for this batch.

## Metadata Changes

Evidence-based changes were limited to:

- iPad iCloud guide: direct safe title/description.
- iPad model guide: removed a second rendered H1 while preserving the proven title.
- iPhone iCloud guide: current Apple Account terminology.
- iPhone post-unlock service: distinct Title, H1, description and main keyword.
- iPhone 17: removed the site-name suffix embedded in frontmatter so the layout adds it only once.

See `batch-6-metadata-before-after.csv`.

## Technical QA

- `npm run astro -- sync`: exit 0
- `npm run astro -- check`: exit 0; 0 errors, 0 warnings, 43 pre-existing hints
- `npm run build`: exit 0
- `npm run validate:seo`: exit 0; 1,189 pages passed
- `npm run qa:sitemap`: exit 0
- `npm run qa:duplicate-headings`: exit 0
- Browser: 20 routes × desktop/mobile; no overflow, missing image or console error

The repository-wide internal-link check still reports 11 unrelated pre-existing camera/legacy area targets. All five iPhone failures in Batch 6 were fixed.

## Files Not Touched

- Homepage
- Footer
- Redirect configuration
- Package dependencies
- Lockfile
- Location page content
- Pre-existing untracked user files
- Batch 2 report folder and other prior-batch artifacts

## Remaining Risks

- Query-to-landing-page behavior cannot be confirmed without GSC Query × Page.
- The Phone Hub and `รับซื้อมือถือ` need measurement before any consolidation decision.
- Existing model pages should be monitored rather than expanded programmatically.
- No redirect candidate should be executed without a separate evidence-led batch.
- Strong pages should be allowed 42–56 days after future deployment before a second rewrite.

## Measurement Plan

- Days 1–7 after a future deployment: indexing, canonicals, sitemap and crawl errors.
- Days 14–28: impressions for iPad Hub, iPhone Hub and changed guides.
- Days 42–56: primary ranking and click evaluation.
- Export Query × Page and compare Phone versus iPhone, Tablet versus iPad, model pages, condition pages and location modifiers.
- Review click distribution and assisted growth from the new internal-link architecture.
- Re-run cannibalization classification before any merge, redirect or new exact-model page.
