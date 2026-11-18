import assert from 'node:assert/strict';
import fs from 'node:fs';

// Verify both direct pins and integrity-pinned transitive lockfile entries.
// Run only after npm ci to ensure GitHub/Cloudflare builds cannot silently
// override package-lock.json with a runtime install.
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const pinned = {
  '@astrojs/cloudflare': { version: '14.4.7', type: 'devDependencies' },
  'wrangler': { version: '4.125.0', type: 'devDependencies' },
  // Pin checked-compatible Astro 7 security patch release: never silently
  // downgrade to Astro 5 via npm audit fix --force.
  'astro': { version: '7.4.12', type: 'devDependencies' },
  '@astrojs/markdown-remark': { version: '7.3.9', type: 'devDependencies' },
};
assert.equal(lock.lockfileVersion, 3);
for (const [name, { version, type }] of Object.entries(pinned)) {
  assert.equal(pkg[type]?.[name], version, 'package.json must exact-pin '+name);
  assert.equal(lock.packages?.['']?.[type]?.[name], version, 'package-lock root must exact-pin '+name);
  const locked = lock.packages?.['node_modules/'+name];
  assert.equal(locked?.version, version, 'package-lock resolution must exact-pin '+name);
  assert.ok(locked?.integrity?.startsWith('sha512-'), name+' lacks lockfile integrity');
  const installed = JSON.parse(fs.readFileSync('node_modules/'+name+'/package.json', 'utf8'));
  assert.equal(installed.version, version, 'node_modules must match lockfile for '+name);
}

const buildOnly = ['astro', '@astrojs/markdown-remark', '@astrojs/sitemap', '@fontsource/sarabun'];
assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0,
  'Cloudflare Worker must ship with no npm runtime install dependencies');
assert.equal(Object.keys(lock.packages?.['']?.dependencies ?? {}).length, 0,
  'Root lockfile must not classify build tools as runtime dependencies');
for (const name of buildOnly) {
  assert.ok(pkg.devDependencies?.[name], 'Missing build-only dev dependency '+name);
  assert.equal(lock.packages?.['']?.devDependencies?.[name], pkg.devDependencies[name],
    'Build-only pin mismatch: '+name);
}
for (const name of ['node_modules/picomatch','node_modules/anymatch/node_modules/picomatch']) {
  assert.equal(lock.packages?.[name]?.dev, true,
    'Vulnerable build-time glob parser must not be a production dependency: '+name);
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
