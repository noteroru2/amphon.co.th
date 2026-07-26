# Native Build Crash Analysis

## Observed failure

- Command: `node node_modules/astro/bin/astro.mjs build`
- Working directory: `C:\Users\User\Desktop\project ทั้งหมด\amphon.co.th`
- Node 22.20.0 exit: `-1073740791` (`0xC0000409`)
- Node 24.14.0 exit: `-1073740791` (`0xC0000409`)
- Last successful log: `Rearranging server assets... ✓ Completed`
- Missing later stages: Vercel function bundling, sitemap integration output and static copy

The failure occurs after Astro prerender and asset rearrangement but before the adapter/integration pipeline completes. It is not caused by an npm prebuild or postbuild script because `package.json` defines `build` as `astro build` only.

## Isolation evidence

The same commit, source fix, `package-lock.json` and dependency versions were placed in a detached worktree at:

`C:\Users\User\AppData\Local\Temp\amphon-b2111-ascii`

Results:

- `npm ci`: exit 0; lockfile unchanged
- `npm run build`: exit 0
- Vercel function bundled
- `sitemap-index.xml` and `sitemap-0.xml` created
- `.vercel/output/static` copied
- Final log: `Complete!`

## Root cause

Confirmed condition: the native crash is triggered when this Windows build runs from the repository path containing Thai characters. The source and dependencies build successfully from an ASCII-only path.

The exact native binary or upstream call responsible for `0xC0000409` is **Unconfirmed** because the process terminates without JavaScript exception, stderr detail or Windows Application event. Sharp import and a standalone one-pixel Sharp transform both exit 0, so the evidence does not justify attributing the crash specifically to Sharp.

## Recovery

No dependency, package version or global architecture was changed. Production validation runs in the safe ASCII diagnostic worktree. The primary branch retains the requested source and QA fixes.
