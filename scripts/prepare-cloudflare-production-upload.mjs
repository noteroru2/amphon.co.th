// AMPHON Issue #54 — prepare a version-only Worker upload. NO DEPLOY / NO ROUTE CHANGES.
// This command is deliberately separate from the audited RC artifact and never calls Cloudflare.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TARGET_WORKER = 'amphon-co-th-production';
export const EXPECTED_BASELINE_KV = '2e5195ef3f3b4557bd50776e1d492154';
export const EXPECTED_SECRETS = ['GOOGLE_PLACE_ID', 'GOOGLE_PLACES_API_KEY'];

export function prepareProductionUpload(root = process.cwd()) {
  const folder = path.join(root, 'dist', 'server');
  const source = path.join(folder, 'wrangler.rc-audit.json');
  const target = path.join(folder, 'wrangler.production-upload.json');
  const headerFile = path.join(root, 'dist', 'client', '_headers');
  const redirectsFile = path.join(root, 'dist', 'client', '_redirects');
  for (const filename of [source, headerFile, redirectsFile]) {
    assert.ok(fs.existsSync(filename), 'Missing required tested artifact: ' + filename);
  }
  const config = JSON.parse(fs.readFileSync(source, 'utf8'));
  assert.equal(config.name, 'amphon-co-th-rc-audit', 'Only the no-deploy QA artifact may be promoted');
  assert.ok(config.main && fs.existsSync(path.resolve(folder, config.main)), 'Missing compiled Worker entry');
  assert.equal(config.assets?.binding, 'ASSETS', 'Missing production ASSETS binding');
  assert.ok(fs.existsSync(path.resolve(folder, config.assets.directory)), 'Missing static assets');
  assert.equal(config.compatibility_date, '2026-11-10', 'Unexpected compatibility date');
  const hasNoActiveEntries = value =>
    value == null || (Array.isArray(value) && value.length === 0)
    || (typeof value === 'object' && !Array.isArray(value)
      && Object.values(value).every(hasNoActiveEntries));
  assert.ok(hasNoActiveEntries(config.routes) && hasNoActiveEntries(config.route)
    && hasNoActiveEntries(config.triggers), 'No active domain/cron mutations allowed');
  const inheritedSession = (config.kv_namespaces ?? []).filter(x => x.binding === 'SESSION');
  assert.ok(inheritedSession.length <= 1 && inheritedSession.every(x => !x.id),
    'Candidate must not embed a prebound SESSION KV ID');
  const headers = fs.readFileSync(headerFile, 'utf8');
  assert.doesNotMatch(headers, /^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im,
    'Production content may not carry global noindex');
  const redirects = fs.readFileSync(redirectsFile, 'utf8')
    .split(/\r?\n/).filter(x => x.startsWith('/'));
  assert.ok(redirects.length >= 261 && redirects.length <= 280,
    'Release must retain 260 exact + 1 dynamic redirect (plus existing safe supplemental rules)');
  assert.equal(new Set(redirects.map(x => x.split(/\s+/)[0])).size, redirects.length, 'Duplicate redirects');
  assert.ok(redirects.includes('/*/ /:splat 308'), 'Missing trailing-slash rule');

  const result = {
    ...config,
    name: TARGET_WORKER,
    compatibility_date: '2026-11-10',
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    workers_dev: false,
    preview_urls: false,
    kv_namespaces: [
      ...(config.kv_namespaces ?? []).filter(x => x.binding !== 'SESSION'),
      { binding: 'SESSION', id: EXPECTED_BASELINE_KV },
    ],
    secrets: { required: EXPECTED_SECRETS },
    keep_vars: true,
  };
  delete result.routes;
  delete result.route;
  delete result.triggers;
  delete result.custom_domains;
  fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n');
  console.log('AMPHON_SAFE_VERSION_UPLOAD_CONFIG ' + JSON.stringify({
    name: result.name,
    action: 'UPLOAD_ONLY_NOT_DEPLOY',
    configPath: 'dist/server/wrangler.production-upload.json',
    assetsBinding: result.assets.binding,
    sessionBinding: result.kv_namespaces[0].binding,
    requiredSecretNames: EXPECTED_SECRETS,
    redirectRules: redirects.length,
    customDomainMutations: 0,
  }));
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareProductionUpload();
}
