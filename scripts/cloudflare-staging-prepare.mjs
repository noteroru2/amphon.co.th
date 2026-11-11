import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STAGING_WORKER = 'amphon-co-th-staging';
export const STAGING_HOST = 'cf-test.amphon.co.th';
const SOURCE_WORKER = 'amphon-co-th';
const NOINDEX = '  X-Robots-Tag: noindex, nofollow';

export function prepareCloudflareStaging(rootDir = process.cwd()) {
  const dist = path.resolve(rootDir, 'dist');
  const headerFile = path.join(dist, 'client', '_headers');
  const redirectsFile = path.join(dist, 'client', '_redirects');
  const inputConfig = path.join(dist, 'server', 'wrangler.json');
  const outputConfig = path.join(dist, 'server', 'wrangler.staging.json');

  for (const file of [headerFile, redirectsFile, inputConfig]) {
    assert.ok(fs.existsSync(file), 'Missing built file: ' + file);
  }
  const headers = fs.readFileSync(headerFile, 'utf8');
  assert.doesNotMatch(headers, /^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im,
    'Staging input must be a CLEAN Production candidate without noindex');
  assert.match(headers, /# GENERATED FROM vercel\.json — PRODUCTION\. Issue #54\./,
    'Staging must start from the guarded Production build, NOT Preview');
  const lines = headers.split(/\r?\n/);
  const rootHeaderIndices = lines.flatMap((line, i) => line.trim() === '/*' ? [i] : []);
  assert.equal(rootHeaderIndices.length, 1, 'Expected exactly one root /* header stanza');
  lines.splice(rootHeaderIndices[0] + 1, 0, NOINDEX);
  const stagedHeaders = lines.join('\n');
  assert.match(stagedHeaders, /^\s*X-Robots-Tag:\s*noindex, nofollow/im);

  const redirects = fs.readFileSync(redirectsFile, 'utf8');
  const rules = redirects.split(/\r?\n/).filter(s => s.trim() && !s.trim().startsWith('#'));
  assert.equal(rules.length, 261, 'Expected 260 exact legacy redirects + 1 slash wildcard');
  assert.ok(rules.includes('/*/ /:splat 308'), 'Missing trailing slash 308 redirect');

  const original = JSON.parse(fs.readFileSync(inputConfig, 'utf8'));
  assert.equal(original.name, SOURCE_WORKER,
    'Refusing to transform a worker other than the known isolated AMPHON candidate');
  for (const field of ['routes', 'route']) {
    assert.ok(!original[field], field + ' must be absent; never attach staging to apex/www');
  }
  assert.ok(STAGING_HOST !== 'amphon.co.th' && STAGING_HOST !== 'www.amphon.co.th');
  assert.ok(STAGING_WORKER !== SOURCE_WORKER);

  // This new independent Worker first deploys only to its own workers.dev URL.
  // The Owner must separately check that the staging hostname is unused,
  // then attach cf-test.amphon.co.th in the Cloudflare dashboard. DO NOT
  // include custom_domain/routes in code or touch the apex/www DNS records.
  const stagingConfig = {
    ...original,
    name: STAGING_WORKER,
    workers_dev: true,
    preview_urls: false,
    keep_vars: true,
  };
  delete stagingConfig.route;
  delete stagingConfig.routes;
  assert.ok(!JSON.stringify(stagingConfig).includes('amphon.co.th'),
    'Deployment config must not automatically bind any amphon.co.th hostname');

  fs.writeFileSync(headerFile, stagedHeaders, 'utf8');
  fs.writeFileSync(outputConfig, JSON.stringify(stagingConfig, null, 2) + '\n', 'utf8');

  const report = {
    mode: 'production-build-with-staging-only-noindex',
    buildSource: 'astro.config.cloudflare.production.mjs',
    stagingWorker: STAGING_WORKER,
    plannedStagingHost: STAGING_HOST,
    customDomainConfigured: false,
    routesAttachedByScript: 0,
    staticNoindex: true,
    productionCleanHeadersRequired: true,
    exactRedirects: 260,
    slashRedirects: 1,
    deploymentConfig: 'dist/server/wrangler.staging.json',
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareCloudflareStaging();
}
