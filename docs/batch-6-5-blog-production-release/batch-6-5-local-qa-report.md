# Batch 6.5 Main QA Report

QA was executed against detached worktree SHA `f6ac636dbe1f22f976571a301845bcfd20ad3bef`.

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run astro -- sync` | 0 | PASS |
| `npm run astro -- check` | 0 | PASS — 104 files, 0 errors, 0 warnings, 43 hints |
| `npm run build` | 0 | PASS |
| `npm run validate:seo` | 0 | PASS — 1,187 pages |
| `npm run qa:sitemap` | 0 | PASS — 2 generated sitemap files |
| `npm run qa:duplicate-headings` | 0 | PASS — 1,188 built pages |
| `npm run qa:internal-404` | 0 | PASS — no missing targets or redirect-source links |
| `npm run qa:redirect-chain` | 0 | PASS — 9 samples, no loops or chains |
| `node scripts/check-blog-listing.mjs` | 0 | PASS — 50 unique cards |

Blog validation confirmed:

- The four Batch 6.4 posts are positions 1–4.
- Each displays `27 กรกฎาคม 2026`.
- Dates, BlogPosting schema, canonicals and sitemap membership pass.
- Minimum Hero text contrast is 11.40:1.
- Risky Hero claim is absent.
- Internal broken links: 0.
- Route collision, canonical and JSON-LD regressions: 0.
- Dependency and lockfile changes: 0.

The first build attempt in the Thai-character workspace finished route generation but Windows terminated the adapter process after completion. The authoritative QA run used an ASCII-path detached worktree at the exact same Merge SHA and returned exit code 0 for every command.
