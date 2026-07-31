# Reproduction log — F-08

## Pre-fix (Thai path)

| Item | Value |
| --- | --- |
| Command | `npm run build` / `npx astro build` |
| Cwd | `C:\Users\User\Desktop\project ทั้งหมด\amphon.co.th` |
| Exit code | `-1073740791` (`0xC0000409`) |
| Last stdout | `[build] Rearranging server assets...` then `[build] ✓ Completed in ~8.8s.` |
| HTML | 1188 |
| Sitemap in `dist` | 0 files |
| Shells | PowerShell and `cmd.exe` both returned the same crash code for `astro build` |

### Diagnostic options

```powershell
$env:NODE_OPTIONS="--trace-uncaught --trace-warnings --trace-exit --report-on-fatalerror --report-uncaught-exception"
npm run build
Remove-Item Env:NODE_OPTIONS
```

Observed: npm exit-handler reported child exit `-1073740791`. No Node diagnostic `report.*.json` found. Application Event Log filter for `node.exe|npm|astro` in the crash window returned no useful faulting-module records.

## Path isolation

| Workdir | Type | Exit | Sitemap |
| --- | --- | --- | --- |
| Thai path (original) | real | `-1073740791` | missing |
| `C:\src\amphon-build-test` | full ASCII copy + `npm ci` | `0` | 1185 |
| `C:\src\project with spaces\amphon` | ASCII + spaces copy | `0` | 1185 |
| `C:\src\amphon-j` junction → Thai | junction | `1` (EPERM symlink) | missing |
| `Z:\` via `SUBST` → Thai | subst | `1` (URL scheme error in helpers) | missing |

## Post-fix (Thai path via wrapper)

| Run | Exit | HTML | Sitemap | Duration |
| --- | --- | --- | --- | --- |
| 1 | 0 | 1188 | 1185 | 24.3s |
| 2 | 0 | 1188 | 1185 | 24.8s |
| 3 | 0 | 1188 | 1185 | 24.9s |

See `repeated-build-results.csv`.
