import assert from 'node:assert/strict';
import fs from 'node:fs';

// Verify both direct pins and integrity-pinned transitive lockfile entries.
// Run only after npm ci to ensure GitHub/Cloudflare builds cannot silently
// override package-lock.json with a runtime install.
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const pinned = { '@astrojs/cloudflare': '14.4.7', wrangler: '4.125.0' };
assert.equal(lock.lockfileVersion, 3);
for (const [name, version] of Object.entries(pinned)) {
  assert.equal(pkg.devDependencies?.[name], version, 'package.json must exact-pin '+name);
  assert.equal(lock.packages?.['']?.devDependencies?.[name], version, 'package-lock root must exact-pin '+name);
  const locked = lock.packages?.['node_modules/'+name];
  assert.equal(locked?.version, version, 'package-lock resolution must exact-pin '+name);
  assert.ok(locked?.integrity?.startsWith('sha512-'), name+' lacks lockfile integrity');
  const installed = JSON.parse(fs.readFileSync('node_modules/'+name+'/package.json', 'utf8'));
  assert.equal(installed.version, version, 'node_modules must match lockfile for '+name);
}
const total = Object.keys(lock.packages).length;
assert.ok(total >= 100, 'Missing transitive dependency lock entries');
console.log(JSON.stringify({
  result: 'PASS',
  nodeVersion: process.version,
  lockfileVersion: lock.lockfileVersion,
  lockedPackageEntries: total,
  pinned,
}, null, 2));
