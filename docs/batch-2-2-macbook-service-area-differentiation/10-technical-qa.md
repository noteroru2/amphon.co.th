# Technical QA

## Passing checks

- Astro check: exit 0, 0 errors (46 pre-existing hints)
- Production build: exit 0 in ASCII diagnostic worktree; Vercel adapter completed
- Sitemap: PASS, 2 sitemap files, indexable canonical URLs only
- Duplicate headings: PASS, 1,186 built pages, no duplicate title or H1
- Batch validator: 20/20 pages; 20 unique titles, 20 unique H1s, 20 unique descriptions
- 20/20 self-canonical, index/follow, exactly one H1, FAQ schema present
- No slug, redirect, canonical, robots, sitemap policy or schema-type changes
- Batch-added internal links: 0 missing targets

## Existing full-site findings outside scope

- Internal-link checker still reports 17 missing targets, all pre-existing camera/iPhone/Ubon-area links and none originating from the 20 changed MacBook pages
- Claim-risk checker reports 1 pre-existing false positive in `src/content/services/รับซื้อโทรศัพท์เสีย.md` because the sentence explicitly says it does **not** claim “รับทุกสภาพ”

## Windows path note

Build in the main Thai-character path prerendered all routes but returned exit 1 late in the adapter lifecycle. A clean ASCII-path worktree with its own `npm ci` completed with exit 0 and generated sitemap, confirming an environment/path interaction rather than a batch source error.
