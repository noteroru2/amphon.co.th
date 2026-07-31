# Production validation summary — Batch 3

| Item | Value |
| --- | --- |
| Verdict | PASS WITH WARNING |
| F-08 | CLOSED (Windows build exit 0 ×3; production smoke OK) |
| Branch | `fix/batch-3-windows-build-crash` |
| Base SHA | `6c3d0a25877785ff6d4069b8f4267528c422e977` |
| Implementation SHA | `cc00ade3da93dffa179d5b18e369520428bf20d7` |
| Merge SHA | `8521563fe5882fd4097a2701e1e58dbd812c2727` |
| Production SHA | `NOT VERIFIED` |
| Report-only SHA | _(pending this commit)_ |
| Deployment URL | https://amphon.co.th |
| Windows | 10.0.26200 / PowerShell 5.1 |
| Node | v22.20.0 (unchanged; not pinned further) |
| Root cause | Non-ASCII Thai characters in Windows repo absolute path abort Node during Astro/Vercel post-rearrange phase |
| Fix | ASCII mirror wrapper `scripts/windows-safe-astro-build.mjs` |
| Windows builds | 3× exit 0 (24.3s / 24.8s / 24.9s) |
| HTML / Sitemap | 1188 / 1185 |
| Batch 1 / 2 regression | PASS / PASS |
| Output diffs | 0 unexpected route/canonical/noindex/redirect/content |
| Astro check | 0 errors / 0 warnings |
| Production | homepage 200; sitemap 1185; F-02/F-03 present; F-01 redirect 308 |
| Remaining | F-04 F-05 F-06 F-07 F-09 F-11 F-12 (+P3) |
