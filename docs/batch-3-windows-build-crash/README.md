# Batch 3 — Windows Build Crash (F-08)

## Goal

Make `npm run build` on Windows exit **0** without hiding errors, while preserving routes/sitemap and Linux/Vercel behavior.

## Status

| Item | Value |
| --- | --- |
| Finding | F-08 |
| Branch | `fix/batch-3-windows-build-crash` |
| Base SHA | `6c3d0a25877785ff6d4069b8f4267528c422e977` |
| Verdict (pre-merge) | PASS WITH WARNING |

## Fix summary

On Windows, when the repository absolute path contains non-ASCII characters, `scripts/windows-safe-astro-build.mjs` mirrors the project to an ASCII workdir (`%LOCALAPPDATA%\amphon-co-th-win-build`), runs `astro build` there, copies `dist/` and `.vercel/` back, and propagates the real child exit code.

On ASCII paths and non-Windows platforms, the wrapper runs `astro build` in place.

## Key evidence

| Path | Result |
| --- | --- |
| `...\project ทั้งหมด\amphon.co.th` + `astro build` | Exit `-1073740791` after rearrange; HTML 1188; sitemap 0 |
| `C:\src\amphon-build-test` (ASCII copy) | Exit `0`; HTML 1188; sitemap 1185 |
| `C:\src\project with spaces\amphon` (spaces, no Thai) | Exit `0` |
| Wrapper from Thai path | Exit `0` × 3 consecutive runs |

## Reports in this folder

- `environment-baseline.md`
- `reproduction-log.md`
- `pipeline-isolation.csv`
- `root-cause-analysis.md`
- `build-output-baseline.json`
- `build-output-diff.csv`
- `repeated-build-results.csv`
- `test-results.md`
- `post-deploy-validation.csv`
- `final-report.md`
- `production-validation-summary.md` (after deploy)
- `production-release-report.md` (after deploy)
