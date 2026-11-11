import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RC_WORKER = 'amphon-co-th-prod';
export const VERCEL_DEPLOYED_SHA = '1d235196f45e29af4c425fa4505111596db8e4c6';
const STAGING_KV = '6563771299d44a43844dcb4e8e9093ec';
const FILM_ENCODING = new Set([
  '/บริการ/รับซื้อกล้องฟิลัม',
  '/บริการ/รับซื้อกล้องฟีล์ม',
  '/บริการ/รับซื้อกล้องฟิล์ล',
]);

function strictRead(file) {
  assert.ok(fs.existsSync(file), 'Missing output file: ' + file);
  return fs.readFileSync(file, 'utf8');
}

/**
 * Prepare an INERT production candidate, not a domain cutover.
 *
 * --ci-only: local dry-run config with disabled workers.dev, no routes.
 * --release: only after separate Owner approval and a dedicated KV namespace
 *           was created. Even release mode cannot attach a custom domain.
 */
export function prepareProductionCandidate(root = process.cwd(), {
  mode = 'ci-only',
  productionKvId = process.env.AMPHON_PROD_SESSION_KV_ID || '',
} = {}) {
  assert.ok(mode === 'ci-only' || mode === 'release', 'Unknown mode');
  const client = path.join(root, 'dist/client');
  const server = path.join(root, 'dist/server');
  const headers = strictRead(path.join(client, '_headers'));
  assert.match(headers, /# GENERATED FROM vercel\.json — PRODUCTION\. Issue #54\./,
    'Refusing Preview or unguarded build artifacts');
  assert.doesNotMatch(headers, /^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im,
    'Production must not inherit staging/preview global noindex');
  const vercel = JSON.parse(strictRead(path.join(root, 'vercel.json')));
  const exact = vercel.redirects.filter(r => r.source !== '/:path+/');
  assert.equal(exact.length, 260, 'All 260 previous canonical redirects required');
  const redirectFile = path.join(client, '_redirects');
  const raw = strictRead(redirectFile);
  const seen = new Set();
  const out = [];
  let removed = 0;
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) {
      out.push(line);
      continue;
    }
    const fields = line.trim().split(/\s+/);
    assert.ok(fields.length >= 3 && /^\d{3}$/.test(fields[2]), 'Invalid redirect entry');
    if (seen.has(fields[0])) { removed++; continue; }
    seen.add(fields[0]);
    out.push(line);
  }
  const rules = out.filter(s => s.trim() && !s.trimStart().startsWith('#'));
  assert.equal(removed, 14,
    'Adapter redirect duplication count changed; review before release');
  assert.equal(rules.length, 263,
    'Expected 260 Vercel + one trailing slash + two unique Astro rules');
  for (const r of exact) {
    const src = FILM_ENCODING.has(r.source) ? encodeURI(r.source) : r.source;
    const status = r.statusCode ?? (r.permanent ? 308 : 307);
    assert.ok(rules.some(l => l.trim() === [src, r.destination, status].join(' ')),
      'Lost/overridden Vercel redirect: '+r.source);
  }
  assert.ok(rules.includes('/*/ /:splat 308'),
    'Missing preserved permanent trailing slash redirect');

  const cfg = JSON.parse(strictRead(path.join(server, 'wrangler.json')));
  assert.equal(cfg.name, RC_WORKER,
    'WRONG Worker! Never deploy Preview/Staging in Production');
  assert.ok(!cfg.routes && !cfg.route && !cfg.custom_domain,
    'Candidate must have NO domain or Worker route');
  assert.ok(cfg.assets?.binding === 'ASSETS', 'Missing static assets binding');
  const sessions = cfg.kv_namespaces?.filter(x => x.binding === 'SESSION') ?? [];
  assert.equal(sessions.length, 1, 'Exactly one isolated SESSION KV binding');
  assert.ok(!sessions[0].id || (mode === 'release' && sessions[0].id === productionKvId),
    'Cannot inherit an existing Preview/Staging SESSION KV ID');
  let kvBindings = cfg.kv_namespaces;
  if (mode === 'release') {
    assert.match(productionKvId, /^[0-9a-f]{32}$/,
      'Owner must provision a separate production SESSION KV namespace');
    assert.notEqual(productionKvId, STAGING_KV,
      'Never reuse the staging session KV namespace in production');
    kvBindings = cfg.kv_namespaces.map(x=>x.binding==='SESSION'
      ? {...x, id:productionKvId} : x);
  }
  const outConfig = {
    ...cfg,
    name:RC_WORKER,
    kv_namespaces:kvBindings,
    workers_dev:false,
    preview_urls:false,
    keep_vars:true,
  };
  delete outConfig.route;
  delete outConfig.routes;
  delete outConfig.custom_domain;
  assert.equal(outConfig.workers_dev, false);
  assert.ok(!outConfig.routes && !outConfig.route && !outConfig.custom_domain);
  assert.ok(!outConfig.kv_namespaces.some(x=>x.id===STAGING_KV));

  const output = path.join(server, 'wrangler.production.candidate.json');
  // All validations finish BEFORE editing the built artifact.
  fs.writeFileSync(redirectFile,
    out.join('\n').replace(/\n*$/u, '\n'),'utf8');
  fs.writeFileSync(output, JSON.stringify(outConfig,null,2)+'\n','utf8');
  const summary={
    mode,
    status:'candidate-only-no-domain-binding',
    originVercelSHA:VERCEL_DEPLOYED_SHA,
    workerName:RC_WORKER,
    workersDevEnabled:false,
    routesAttached:0,
    staticNoindex:false,
    legacyRedirects:exact.length,
    removedDuplicateRules:removed,
    totalRedirectRules:rules.length,
    sessionKVMode:mode==='release'?'separate-owner-provisioned':'unbound-dry-run',
    config:'dist/server/wrangler.production.candidate.json',
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const chosen=process.argv.slice(2);
  assert.ok(chosen.length === 1 && ['--ci-only','--release'].includes(chosen[0]),
    'Explicit --ci-only or --release mode required');
  prepareProductionCandidate(process.cwd(), {mode:chosen[0].slice(2)});
}
