# Batch 6.4 Blog Listing and Readability Hotfix

- Verdict: PASS WITH WARNING
- Branch: `batch-6-4-blog-listing-readability-hotfix`
- Starting SHA: `5186e856e70f96b11fa613c7a4a7c074ddcc616d`
- Blog route: `/blog`
- New posts expected/displayed/in first four: 4 / 4 / 4
- Sorting: `date` descending; explicit priority for the four same-day releases; Thai slug ascending fallback
- Date Published / Date Modified: `2026-07-27` / `2026-07-27`
- Hero contrast: PASS — 11.40:1 minimum
- Hero description color: `#dbe4f0`
- Hero height: 345–348px desktop; 348–373px mobile
- Risky Hero claim: absent
- Tag spacing: PASS — flex-wrap, 0.5rem gap
- Build / Astro check / SEO / Sitemap / Internal 404 / Redirect chain / Duplicate headings: PASS
- Mobile overflow: 0px
- Console errors: 0
- Broken images: 0
- Dependency changes: None
- Lockfile changes: None
- Merge: No
- Deploy: No

## Result

The four articles now lead the listing in this order:

1. ขายโทรศัพท์มือสองใกล้ฉัน
2. ขายกล้อง Sony มือสองต้องเช็กอะไรบ้าง
3. Mac mini M4 มือสอง
4. แรมมือสองขายได้เท่าไหร่

All display 27 July 2026. Sorting remains based on publication date, guards invalid dates, and uses deterministic tie-breakers rather than collection insertion order.

The Hero paragraph no longer inherits light-background prose colors. It uses a dedicated Blog-specific class, neutral approved copy, `#dbe4f0`, 1.8/1.75 line height, a 760px maximum width, and responsive 64px/40px vertical padding. The Hero is shorter despite the increased deliberate padding because the copy is concise and the 32px centered prose offset was removed.

## Scope

No article body, slug, canonical, Title, H1, keyword, or internal article link changed. No homepage, footer, service/location page, redirect configuration, dependency, or lockfile changed. This branch has not been merged or deployed.

## Warning

Sitemap routes pass, but the existing site-wide sitemap generator emits no `<lastmod>` values. Article schema dates are correct.
