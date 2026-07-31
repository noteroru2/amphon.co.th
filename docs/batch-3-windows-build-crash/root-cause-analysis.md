# Root cause analysis — F-08

## Symptom

On Windows, `npm run build` / `astro build` generates HTML routes successfully, then aborts with exit code `-1073740791` (`0xC0000409`) after:

```text
[build] Rearranging server assets...
[build] ✓ Completed in …
```

Local `dist` has HTML (~1188) but no `sitemap-*.xml`. Production Linux builds were already healthy (sitemap 1185).

## Confirmed reproduction

- Repository path: `C:\Users\User\Desktop\project ทั้งหมด\amphon.co.th`
- Node `v22.20.0` / npm `11.8.0`
- Reproduced with both `npm run build` and direct `astro build`
- Reproduced in PowerShell and CMD

## Affected environment

- Windows 10/11 (`10.0.26200`)
- Repository absolute path containing Thai (non-ASCII) characters
- Astro 6.4.2 + `@astrojs/vercel` 10.0.8 local build

## Unaffected environment

- Same sources/deps on ASCII-only path `C:\src\amphon-build-test` → exit 0
- ASCII path with spaces `C:\src\project with spaces\amphon` → exit 0
- Isolated `@vercel/nft` + `copyFilesToFolder` on Thai path after a partial build → exit 0
- Production/Vercel Linux ASCII checkout (pre-existing healthy sitemap)

## Last successful build step

Astro server generate + “Rearranging server assets” completion (end of `viteBuild` / `buildEnvironments`).

## Faulting process/module

| Level | Finding |
| --- | --- |
| Process | `node.exe` aborts; npm reports child exit `-1073740791` |
| Next expected log | `[@astrojs/vercel] Bundling function …` (seen on successful ASCII builds; not flushed on hard abort) |
| Native module / DLL | **NOT CONFIRMED** — no WER/Application log faulting-module record; no Node diagnostic report file |

## Evidence

1. Thai path crash exit `-1073740791` after rearrange; sitemap absent.
2. Full copy to ASCII path: complete success including sitemap 1185.
3. Spaces-only ASCII path: success → spaces alone are not sufficient to cause the crash.
4. Junction/SUBST aliases to Thai path: fail with JS errors in `@astrojs/vercel` / `@astrojs/internal-helpers` symlink/URL handling (different failure mode; shows post-rearrange Vercel bundling is sensitive to path identity).
5. `fs.symlink` on this machine returns `EPERM` (no SeCreateSymbolicLink / Developer Mode). Successful ASCII builds still work because npm install has **0** symlinks in `node_modules` and `copyFilesToFolder` uses `copyFile` for non-symlink files.
6. Wrapper mirroring to `%LOCALAPPDATA%\amphon-co-th-win-build`: three consecutive exit 0 builds from the Thai path.

## Ruled-out causes

| Candidate | Why ruled out |
| --- | --- |
| npm lifecycle / postbuild script | Repo `build` was plain `astro build`; direct `astro build` also crashed |
| Missing await in repo postbuild | No postbuild script existed |
| Sitemap inclusion logic (F-02/F-03) | Out of scope; production already correct; crash precedes local sitemap emit |
| Sharp install corruption alone | `sharp` loads on Thai path; ASCII rebuild with fresh `npm ci` succeeds without changing Sharp version |
| Spaces in path alone | Spaces-only ASCII copy succeeded |
| Deliberate `process.exit` masking | Crash code is OS abort status, not a scripted `exit 0` |

## Confirmed root cause

**Repository absolute path containing non-ASCII (Thai) characters on this Windows host causes a hard Node process abort during the Astro + `@astrojs/vercel` post-rearrange / build-done phase.**

Exact native faulting module inside Node/Astro/Vercel/NFT is **not confirmed**.

## Fix

`scripts/windows-safe-astro-build.mjs` + `package.json` `"build"` entry:

- Detect win32 + non-ASCII repo/cwd path
- Mirror sources to ASCII workdir, `npm ci` when lock hash changes
- Run local `astro` binary there
- Copy `dist/` and `.vercel/` back
- Write `.amphon-build-complete` only after success
- Propagate real child exit codes (no `|| true` / forced `exit 0`)

`build:astro` remains available for unwrapped reproduction.

## Why the fix works

Successful builds were repeatedly demonstrated on ASCII physical paths. The wrapper makes the build execute on such a path while keeping the developer checkout location unchanged, then returns artifacts.

## Risks

- Extra disk use under `%LOCALAPPDATA%\amphon-co-th-win-build`
- First mirrored build pays `npm ci` cost; later builds reuse cached `node_modules` when lock hash matches
- If ASCII workdir creation fails, build fails loudly (does not mask)

## Validation

- 3 consecutive Windows wrapper builds exit 0
- HTML 1188 / sitemap 1185 stable
- `qa:batch-1-redirects`, `qa:batch-2-sitemap`, `qa:batch-3-build` PASS
- `npx astro check` → 0 errors / 0 warnings
