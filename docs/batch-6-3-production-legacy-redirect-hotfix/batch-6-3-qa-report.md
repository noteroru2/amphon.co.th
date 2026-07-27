# Batch 6.3 QA Report

## Verdict

PASS WITH WARNING

## Clean-room local QA

QA was run from detached worktree commit `1a81d0ea0a977971ae12886b288dc70b647d7d4e`.

| Check | Result |
| --- | --- |
| Astro sync/check | PASS — 103 files, 0 errors, 0 warnings, 43 existing hints |
| Production build | PASS — 1,188 built pages |
| SEO / JSON-LD validation | PASS — 1,187 pages |
| Sitemap indexability | PASS — 2 sitemap files |
| Duplicate Title/H1 | PASS — 1,188 built pages |
| Internal 404 | PASS — 0 missing targets and no links to redirect sources |
| Redirect-chain QA | PASS — 9 samples, no loops or chains |
| Vercel redirect matcher | PASS — Unicode and encoded variants checked |
| Legacy static build output | PASS — absent |
| Final GoPro/SSD build output | PASS — present |

`qa:claim-risk` reported one pre-existing false positive in `src/content/services/รับซื้อโทรศัพท์เสีย.md` because the page explicitly says it does **not** use an unconditional “รับทุกสภาพ” claim. That file was not modified by this hotfix and the warning does not affect routing or SEO acceptance.

## Runtime notes

`vercel dev` invokes Astro development routing and does not reproduce Vercel deployment redirects for this static-output setup. It therefore was not used as production-layer evidence. Local behavior was checked with the repository redirect matcher, build-output assertions, and a local filesystem-precedence simulator. Final acceptance was verified against the production Vercel alias.

## Scope

- No homepage, footer, iPad/iPhone cluster, final GoPro page, or final SSD page changes.
- No dependency or lockfile changes.
- No generated output or temporary script committed.
- Route count decreased from 1,190 to 1,188 solely because the two legacy static pages were removed.
