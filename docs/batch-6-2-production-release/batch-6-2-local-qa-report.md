# Batch 6.2 Local QA Report

QA ran from the merged `main` snapshot at `f61839a1e74e016ea1795143411cf2bcef624959`.

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run astro -- sync` with telemetry disabled | 0 | PASS |
| `npm run astro -- check` | 0 | PASS — 104 files, 0 errors, 0 warnings, 43 pre-existing hints |
| `npm run build` | 0 | PASS — Vercel adapter complete; sitemap generated |
| `npm run validate:seo` | 0 | PASS — 1,189 pages |
| `npm run qa:sitemap` | 0 | PASS |
| `npm run qa:duplicate-headings` | 0 | PASS — 1,190 built pages |
| `npm run qa:internal-404` | 0 | PASS — broken internal links 0 |
| `npm run qa:redirect-chain` | 0 | PASS — 9 samples, no loops or chains |

The first sync attempt was blocked by the sandbox when Astro telemetry tried to create a user-level config directory. Re-running the same sync with `ASTRO_TELEMETRY_DISABLED=1` passed; this was an execution-environment permission issue, not a project failure.

- Route count: 1,190 including the 404 page
- SEO pages validated: 1,189
- Canonical regression: 0
- JSON-LD regression: 0
- Route collision: 0
- Dependency changes: 0
- Lockfile changes: 0
