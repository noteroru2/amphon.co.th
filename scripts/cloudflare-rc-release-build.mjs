// AMPHON PR #74 — exact-SHA production artifact build and QA, without publishing traffic.
// Cloudflare Builds may only call this from the version-upload-only trigger.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const branch = process.env.CF_BRANCH || process.env.CLOUDFLARE_BUILD_BRANCH || '';
if (branch) assert.equal(branch, 'release/cloudflare-unified-astro7-20261118',
  'Refuse a different Cloudflare release branch');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding:'utf8' }).trim();
assert.match(sha, /^[a-f0-9]{40}$/, 'Release must use an immutable 40-character commit SHA');
const checks = [
  ['node', ['scripts/cloudflare-lock-verify.mjs']],
  ['npm', ['audit', '--omit=dev', '--audit-level=high']],
  ['npm', ['audit', '--audit-level=moderate']],
  ['npm', ['run', 'qa:picomatch-hardening']],
  ['npm', ['run', 'test:google-reviews']],
  ['node', ['--test', 'scripts/cloudflare-routing.test.mjs', 'scripts/cloudflare-release-finalize.test.mjs']],
  ['npx', ['astro', 'build', '--config', 'astro.config.cloudflare.production.mjs']],
  ['npm', ['run', 'validate:seo']],
  ['node', ['scripts/cloudflare-release-finalize.mjs']],
  ['node', ['scripts/check-issue50-rendered-truth.mjs']],
  ['node', ['scripts/check-p0-parent-service-truth.mjs']],
  ['node', ['scripts/check-issue50-gsc-regional.mjs']],
  ['node', ['scripts/cloudflare-production-local-smoke.mjs']],
  ['node', ['scripts/prepare-cloudflare-production-upload.mjs']],
  ['npx', ['wrangler', 'deploy', '--config', 'dist/server/wrangler.production-upload.json', '--dry-run']],
];
for (const [exe, args] of checks) {
  console.log('AMPHON_RELEASE_BUILD_GATE', JSON.stringify({ sha, command: [exe,...args].join(' ') }));
  execFileSync(exe, args, { stdio:'inherit', maxBuffer:64*1024*1024 });
}
console.log('AMPHON_CLOUDflare_UPLOAD_ONLY_READY', JSON.stringify({
  sha,
  command:'npx wrangler versions upload --config dist/server/wrangler.production-upload.json --keep-vars --strict',
  deploysProductionTraffic:false,
  checksPassed:checks.length,
}));
