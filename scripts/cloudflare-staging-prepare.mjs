import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STAGING_WORKER = 'amphon-co-th-staging';
export const STAGING_HOST = 'cf-test.amphon.co.th';
// Existing isolated KV was created by the first 2026-11-11 Cloudflare staging deploy
// BEFORE the _redirects validation failed. Wrangler id-less SESSION bindings
// can re-provision and collide on retry (10014). This is a public resource ID,
// not an API secret. Never use the Preview/Production KV namespace here.
export const STAGING_SESSION_KV_ID = '6563771299d44a43844dcb4e8e9093ec';
const SOURCE_WORKER = 'amphon-co-th-staging';
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
  const rawLines = redirects.split(/\r?\n/);
  // The Astro adapter adds redirects AFTER the 260 mappings generated from
  // vercel.json. Fourteen of those extra rules have exactly the same source
  // paths as the authoritative Vercel rules. Cloudflare rejects _redirects
  // at deployment with code 100324 even though a local Wrangler dry run passes.
  // Keep the FIRST occurrence (Vercel takes precedence) and preserve the
  // other unique Astro redirects. Compare exact source BYTES: Vercel has
  // intentionally separate raw-Thai and percent-encoded source URLs, which
  // are both needed for parity and MUST NOT be collapsed by decoding.
  const seen = new Map();
  const keptLines = [];
  let duplicateRedirectsRemoved = 0;
  let conflictingAdapterRulesRemoved = 0;
  for (const line of rawLines) {
    if (!line.trim() || line.trimStart().startsWith('#')) {
      keptLines.push(line);
      continue;
    }
    const fields = line.trim().split(/\s+/);
    assert.ok(fields.length >= 3 && /^\d{3}$/.test(fields[2]),
      'Invalid _redirects rule (not a valid source/destination/HTTP status)');
    const source = fields[0];
    if (seen.has(source)) {
      duplicateRedirectsRemoved++;
      if (seen.get(source) !== line.trim()) conflictingAdapterRulesRemoved++;
      continue;
    }
    seen.set(source, line.trim());
    keptLines.push(line);
  }
  const cleanRedirects = keptLines.join('\n').replace(/\n*$/u, '\n');
  const rules = keptLines.filter(s => s.trim() && !s.trimStart().startsWith('#'));
  assert.equal(new Set(rules.map(s => s.trim().split(/\s+/)[0])).size, rules.length,
    'Cloudflare _redirects contains duplicate exact-source rules');
  // Keep all 260 Vercel rules and the unique additional adapter redirects.
  const vercel = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
  const legacy = vercel.redirects.filter(rule => rule.source !== '/:path+/');
  assert.equal(legacy.length, 260, 'Expected exactly 260 Vercel legacy redirect definitions');
  assert.ok(rules.length >= legacy.length + 1,
    'Missing 260 Vercel rules and trailing slash wildcard');
  assert.ok(rules.includes('/*/ /:splat 308'), 'Missing trailing slash 308 redirect');
  const encodedFilmTypos = new Set([
    '/บริการ/รับซื้อกล้องฟิลัม',
    '/บริการ/รับซื้อกล้องฟีล์ม',
    '/บริการ/รับซื้อกล้องฟิล์ล',
  ]);
  for (const item of legacy) {
    const source = encodedFilmTypos.has(item.source) ? encodeURI(item.source) : item.source;
    const status = item.statusCode ?? (item.permanent ? 308 : 307);
    assert.ok(rules.includes(source + ' ' + item.destination + ' ' + status),
      'Staging redirect missing: ' + item.source);
  }

  const original = JSON.parse(fs.readFileSync(inputConfig, 'utf8'));
  const kvs = original.kv_namespaces;
  assert.ok(Array.isArray(kvs), 'Generated Astro Wrangler config must define SESSION KV');
  const sessionBindings = kvs.filter(item => item.binding === 'SESSION');
  assert.equal(sessionBindings.length, 1, 'Exactly one SESSION KV binding is required');
  assert.ok(!sessionBindings[0].id || sessionBindings[0].id === STAGING_SESSION_KV_ID,
    'Unexpected SESSION KV namespace: refuse to bind production or Preview data');
  assert.equal(original.name, SOURCE_WORKER,
    'Refusing to transform a worker other than the known isolated AMPHON candidate');
  for (const field of ['routes', 'route']) {
    assert.ok(!original[field], field + ' must be absent; never attach staging to apex/www');
  }
  assert.ok(STAGING_HOST !== 'amphon.co.th' && STAGING_HOST !== 'www.amphon.co.th');
  assert.notEqual(STAGING_WORKER, 'amphon-co-th',
    'Staging build must never target the original Preview Worker');

  // This new independent Worker first deploys only to its own workers.dev URL.
  // The Owner must separately check that the staging hostname is unused,
  // then attach cf-test.amphon.co.th in the Cloudflare dashboard. DO NOT
  // include custom_domain/routes in code or touch the apex/www DNS records.
  const stagingConfig = {
    ...original,
    name: STAGING_WORKER,
    // Point at the ALREADY-created isolated namespace. Avoid id-less auto-
    // provisioning on every Workers Builds deploy after the first failed run.
    kv_namespaces: kvs.map(item => item.binding === 'SESSION'
      ? { ...item, id: STAGING_SESSION_KV_ID }
      : item),
    workers_dev: true,
    preview_urls: false,
    keep_vars: true,
  };
  delete stagingConfig.route;
  delete stagingConfig.routes;
  // The generated bundle can legitimately contain canonical URLs and
  // other strings naming amphon.co.th. Only routing keys attach a Worker to a
  // hostname. Reject those keys explicitly instead of string-scanning content.
  assert.ok(!Object.hasOwn(stagingConfig, 'route') &&
    !Object.hasOwn(stagingConfig, 'routes'),
  'Staging deployment cannot automatically bind any hostname');
  assert.notEqual(stagingConfig.name, 'amphon-co-th',
    'Staging must not replace the existing Preview Worker');

  // Write only AFTER every safety check passes, so a failed attempt cannot
  // leave a partially fixed bundle that could be deployed by accident.
  fs.writeFileSync(redirectsFile, cleanRedirects, 'utf8');
  fs.writeFileSync(headerFile, stagedHeaders, 'utf8');
  fs.writeFileSync(outputConfig, JSON.stringify(stagingConfig, null, 2) + '\n', 'utf8');

  const report = {
    mode: 'production-build-with-staging-only-noindex',
    buildSource: 'astro.config.cloudflare.production.mjs',
    stagingWorker: STAGING_WORKER,
    plannedStagingHost: STAGING_HOST,
    customDomainConfigured: false,
    routesAttachedByScript: 0,
    sessionKvPinned: true,
    sessionKvNamespaceId: STAGING_SESSION_KV_ID,
    staticNoindex: true,
    productionCleanHeadersRequired: true,
    exactRedirects: legacy.length,
    adapterExtraRedirects: rules.length - legacy.length - 1,
    duplicateRedirectsRemoved,
    conflictingAdapterRulesRemoved,
    redirectRulesAfterDeduplication: rules.length,
    slashRedirects: 1,
    deploymentConfig: 'dist/server/wrangler.staging.json',
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareCloudflareStaging();
}
