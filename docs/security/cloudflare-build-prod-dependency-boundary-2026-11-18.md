# Cloudflare Worker dependency boundary — production audit scope (2026-11-18)

## What changed
AMPHON uses Astro 7 on Node 22 to **build** a Cloudflare Worker and static assets. Its Worker is then uploaded as compiled code, not served via a Node.js runtime that loads `node_modules/astro` or Markdown rendering tooling on every request.

The four root npm dependencies were **incorrectly classified as production Node modules**:
- `astro 7.4.12`
- `@astrojs/markdown-remark 7.3.9`
- `@astrojs/sitemap 3.7.3`
- `@fontsource/sarabun 5.2.8`

They are now declared `devDependencies` (their exact original semver ranges are retained). The existing Cloudflare adapter, Vercel adapter, TypeScript, Wrangler and Sharp were already dev-only. Production npm dependencies are deliberately empty. The **real npm-generated lockfile** must classify both `picomatch` v4.0.7 and nested v2.3.2 as `dev:true`. A new CI assertion rejects any future unintended production module classification. The Cloudflare build and wrangler dry-run are validated independently to prove the runtime still works.

## Important security boundary
- `npm audit --omit=dev` now measures the **production npm installation**, and must pass naturally with HIGH=0 and CRITICAL=0. This is NOT the same as `npm audit` across ALL installed build tools.
- **Full-tree npm audit is explicitly retained and reported**. The old 11 high package records caused by `picomatch` remain flagged by the npm Advisory DB and must not be called resolved.
- `picomatch` in the **build toolchain** remains locally hardened by postinstall in the prior security PR; `npm ci` and adversarial tests verify it. A production-only `npm ci --omit=dev` skips building those modules and asserts picomatch is absent.
- Runtime emitted-code scanner `scripts/check-cloudflare-runtime-picomatch-exposure.mjs` on the compiled Cloudflare Worker and Wrangler dry-run bundle remains **mandatory** and was verified on prior SHAs; absence of tokens is evidence, not comprehensive reachability proof.
- This DOES NOT make the underlying upstream 4.0.7 package safe nor prove all attack patterns harmless; full security remediation still needs official upstream patch or reviewed code replacement.
- NO `npm audit --audit-level=critical`, `--ignore`, major Astro downgrade, fake version, unvetted fork, or CI bypass was used.
- No production deployment, Worker, DNS, changes or PR-to-main merge is authorized by this patch. Production release still requires complete QA + Owner approval.

## Verification
Require `npm ci` (build scripts ON), `scripts/cloudflare-lock-verify.mjs`, `npm run qa:picomatch-hardening`, `npm audit --omit=dev` (zero high/critical), independent full-scope `npm audit` evidence, Node/Cloudflare Astro build, 921 indexable pages + 99 excluded, 260 redirects, JSON-LD, 21 Google Reviews tests, Worker dry-run, 60 provincial links, runtime scan and post-release QA. Never report full audit as cleared by production-only scoping.

## Actual CI evidence, 18 November 2026
- [Lock regeneration GH Actions #44312506640](https://github.com/noteroru2/amphon.co.th/actions/runs/44312506640): PASS. Real npm lock with 670 entries, both picomatch versions `dev:true`, `npm ci` + actual parser tests PASS; production-only `npm ci --omit=dev` PASS, both picomatch packages absent.
- Exact scoped production result: `npm audit --omit=dev` **0 total / 0 high / 0 critical**.
- **Full tree is not cleared**: `npm audit` has **24 HIGH, 2 MODERATE, 0 CRITICAL**, including `picomatch` and other tooling. These are tracked in a dedicated informational artifact in the release CI. The old 11 HIGH was the *previous misclassified production-scope* count, NOT the full-graph count.
- [Real Cloudflare QA on lock-verified SHA 4b1907c](https://github.com/noteroru2/amphon.co.th/actions/runs/44312635140): both the strict `cloudflare-candidate` security/release job and `content-only-qa` PASS including build, 921 service-area SEO URLs, redirect parity, runtime source proof and Worker dry-run.
- Temporary privileged `cloudflare-production-deps-lock-regen.yml` was removed after committing the authenticated npm-generated lockfile. Permanent QA uses only read-only `contents: read` permissions.
- User-facing claims should say **"Production npm audit passed; the full build-tool audit still contains unresolved published advisories"**, never "all dependencies are patched".
