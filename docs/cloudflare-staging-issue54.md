# Issue #54 — Independent Cloudflare Production Staging (NO apex/www cutover)

**Owner authorization:** Prepare and test staging ONLY, using \`cf-test.amphon.co.th\`. Do not modify DNS records/Worker routes for \`amphon.co.th\` or \`www.amphon.co.th\`, do not merge PR #55, and do not switch Vercel Production.

## Why there are TWO Cloudflare workers

| Worker | Deploy branch | Build policy | Domain |
| --- | --- | --- | --- |
| Existing preview \`amphon-co-th\` | \`infra/cloudflare-workers-preview\` | Preview config, global noindex | \`amphon-co-th.noteroru2.workers.dev\`; keep unchanged |
| New staging \`amphon-co-th-staging\` | \`infra/cloudflare-production-staging\` | **Production Astro config**, then \`cloudflare-staging-prepare.mjs\` injects **staging-only noindex** | Initial \`amphon-co-th-staging.noteroru2.workers.dev\`; planned custom domain \`cf-test.amphon.co.th\` (not yet attached) |
| Vercel live | Production deployment \`1d235196f45e29af4c425fa4505111596db8e4c6\` | Vercel adapter | \`amphon.co.th\`, \`www.amphon.co.th\` unchanged |

**Version lineage:** Staging branch starts from migration/Preview \`1f3ddecf9368897c63ca4242c41e3b1c1257cb06\`, which is based on GitHub main \`f3f91b804432c9b56542db38d70547f657cd54de\`. Vercel live is older by one Issue #50 SEO commit changing **180 service-area content files** (186 files total). Owner must explicitly approve this SEO release independently before any real-domain switch.

## Step A — staging artifacts and tests (already prepared in GitHub)

- [\`scripts/cloudflare-staging-prepare.mjs\`](../scripts/cloudflare-staging-prepare.mjs): requires clean production build headers (NO noindex), validates all 260 legacy redirects, adds \`X-Robots-Tag: noindex, nofollow\` **only to staging static headers**, produces independent \`dist/server/wrangler.staging.json\` with name \`amphon-co-th-staging\` and **no custom-domain/routes**.
- [\`scripts/cloudflare-staging-prepare.test.mjs\`](../scripts/cloudflare-staging-prepare.test.mjs): refuses Preview/noindex input, unexpected Worker name, and pre-bound routes.
- [\`scripts/cloudflare-staging-local-smoke.mjs\`](../scripts/cloudflare-staging-local-smoke.mjs): tests local Worker, canonical \`https://amphon.co.th\`, staging noindex, 260 redirects, 308 slash, 404, and safe Google Reviews API failure without secrets.
- [\`Cloudflare Production Staging QA (NO DEPLOY)\`](../.github/workflows/cloudflare-staging-qa.yml): installs locked npm packages and Node 22.23.4; builds Production candidate, validates SEO, applies staging noindex, Wrangler \`--dry-run\`, then local HTTP checks. No Cloudflare credentials/DNS change required.
- \`.node-version\` is exactly \`22.23.4\` to align Cloudflare Workers Builds with GitHub Actions. Cloudflare Workers Builds defaults to Node 24; build image honors this file or \`NODE_VERSION\` environment variable.

## Step B — OWNER setup in Cloudflare Dashboard (awaiting)

1. Open Cloudflare Dashboard → **Workers & Pages**. Do **not** edit the existing \`amphon-co-th\` worker.
2. Create a **separate** Worker with Git integration; choose GitHub repository \`noteroru2/amphon.co.th\`, branch **\`infra/cloudflare-production-staging\`**, name **\`amphon-co-th-staging\`**. Root directory \`/\`.
3. Under this **new Worker only** → **Settings → Build** set:
   - Build Command (one line):
     \`\`\`bash
     npm ci && node scripts/cloudflare-lock-verify.mjs && npx astro build --config astro.config.cloudflare.production.mjs && node scripts/cloudflare-staging-prepare.mjs
     \`\`\`
   - Deploy Command:
     \`\`\`bash
     npx wrangler deploy --config dist/server/wrangler.staging.json
     \`\`\`
   - Build variable \`NODE_VERSION\` = \`22.23.4\` (also in \`.node-version\`). Optional \`SKIP_DEPENDENCY_INSTALL\` = \`1\` to avoid platform auto-install followed by npm ci. Never put Google Places API keys into Build Variables.
4. Deploy this separate Worker to its **own** \`amphon-co-th-staging.noteroru2.workers.dev\`; verify \`X-Robots-Tag: noindex, nofollow\` on static HTML and that Preview worker \`amphon-co-th\` remains untouched.
5. Under staging Worker's **Settings → Variables and secrets → Runtime variables and secrets**, add \`GOOGLE_PLACES_API_KEY\` and \`GOOGLE_PLACE_ID\` as **Secret**. Copy from Owner-held secure source (never paste secret values into GitHub/ChatGPT). Click Deploy. Secrets are **per Worker** and do not automatically copy from existing Preview Worker.
6. If application sessions are used, give the staging Worker an isolated \`SESSION\` KV binding with a **separate staging KV namespace** (do not share live sessions). Verify binding persistence after deploy.
7. In Cloudflare zone \`amphon.co.th\`, confirm **no pre-existing DNS record or Worker route for \`cf-test.amphon.co.th\`**. If there is one, STOP and reconcile first.
8. On staging Worker → **Settings → Domains & Routes → Add → Custom Domain**, attach **only \`cf-test.amphon.co.th\`**, never \`amphon.co.th\` or \`www.amphon.co.th\`. Custom Domain creates DNS and SSL for **the staging hostname only**. Verify HTTPS certificate issuance and that no apex/www DNS records have changed.

**Note:** A Cloudflare Custom Domain creates a DNS record automatically. That is authorized only for the dedicated staging subdomain, not for apex/www. Never attach those two production hostnames to staging.

## Step C — LIVE QA only after custom-domain SSL and secrets are ready

Workflow \`Cloudflare Staging Live HTTPS/SEO/API Acceptance (READ ONLY)\` calls \`scripts/cloudflare-staging-live-qa.mjs\` and tests:
- Actual TLS trust and certificate hostname for \`cf-test.amphon.co.th\`.
- All ~1,189 sitemap URLs return HTTP 200, canonical \`https://amphon.co.th\`, **staging noindex on every page** (no duplicate indexing).
- Sitemap URL parity against current live Vercel.
- All 260 legacy redirects, trailing-slash 308s and 404 behavior.
- Google Reviews runtime returns HTTP 200 valid public data, \`no-store\`, API-only \`noindex\`. No credentials or review text logged.
- **Existing Vercel** \`www.amphon.co.th\` → apex HTTP 301 preserves path/query. This does **NOT** confirm future Cloudflare www routing; that remains a final cutover gate and requires separate Owner approval.

The Live QA workflow has \`workflow_dispatch\`, but GitHub may not expose manual runs until a workflow is present on the default branch. To trigger safely without merging anything, edit or commit the dedicated \`docs/cloudflare-staging-live-qa-request.txt\` trigger file on the staging branch after domain/SSL/secrets are configured; pushing this file runs the read-only Live QA on staging branch.

## Mandatory STOP / NO-GO conditions

- At any sign of changes to apex/www DNS, Worker route or Vercel aliases: STOP, restore approved Vercel targets from \`docs/cloudflare-cutover-rollback-issue54.md\`, and inform Owner.
- Missing SSL, any staging HTML page without noindex, any incomplete redirect rule, or Google Reviews not HTTP 200: NO-GO.
- A production-looking Git SHA alone is not sufficient: Owner must approve the **content delta of 180 service-area SEO pages** and the exact final release SHA first.
- PR #55 must stay **Draft**; production routes/DNS remain on Vercel during all staging activity.
