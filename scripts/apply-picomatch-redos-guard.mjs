import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const marker = 'AMPHON_CVE_2026_112366_FAIL_CLOSED_GUARD';
const anchor = "const parse = (input, options) => {\n  if (typeof input !== 'string') {\n    throw new TypeError('Expected a string');\n  }\n";
const allowedVersions = new Set(['4.0.7', '2.3.2']);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guard = fs.readFileSync(path.join(root, 'scripts/picomatch-redos-guard-snippet.cjs'), 'utf8');
assert.equal(guard.split(marker).length, 2, 'Security snippet marker must appear exactly once');
const invocation = "\n  if (__amphonUnsafeRepeatedExtglob(input)) {\n    throw new SyntaxError('AMPHON_PICOMATCH_REDOS_PATTERN_REJECTED');\n  }\n";

function installedCopies() {
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(lock.lockfileVersion, 3, 'Unexpected npm lockfile version');
  const items = Object.entries(lock.packages)
    .filter(([name]) => name === 'node_modules/picomatch' || name.endsWith('/node_modules/picomatch'))
    .map(([relative, metadata]) => ({relative, version:metadata.version}));
  assert.equal(items.length, 2, 'Unexpected picomatch dependency topology: must review all copies');
  assert.deepEqual(items.map(x=>x.version).sort(), ['2.3.2','4.0.7']);
  return items;
}
function verifySource(text, relative) {
  assert.ok(text.includes(guard), 'Security snippet missing/changed in ' + relative);
  assert.ok(text.includes(invocation), 'Fail-closed invocation missing in ' + relative);
  assert.equal(text.split(marker).length, 2, 'Duplicate/incomplete security marker: ' + relative);
  assert.ok(text.includes('module.exports = parse;'), 'Picomatch parser export missing in ' + relative);
}
const verifyOnly = process.argv.includes('--verify');
for (const {relative,version} of installedCopies()) {
  assert.ok(allowedVersions.has(version), 'Unreviewed picomatch version ' + version);
  const dir = path.join(root, relative);
  const installed = JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
  assert.equal(installed.version,version,'Installed version differs from locked '+relative);
  const filename=path.join(dir,'lib','parse.js');
  let source=fs.readFileSync(filename,'utf8');
  if (verifyOnly) {
    verifySource(source, relative);
  } else if (!source.includes(marker)) {
    assert.equal(source.split(anchor).length, 2, 'Parser has changed; refusing unsafe patch '+relative);
    assert.ok(source.includes('analyzeRepeatedExtglob'), 'Expected parser structure missing '+relative);
    assert.ok(source.includes('module.exports = parse;'), 'Parser export missing '+relative);
    source = source.replace(anchor,guard+'\n'+anchor+invocation);
    fs.writeFileSync(filename,source,'utf8');
    verifySource(fs.readFileSync(filename,'utf8'),relative);
  } else {
    verifySource(source,relative);
  }
  console.log('PICOMATCH_REDOS_GUARD '+JSON.stringify({
    status:'PASS',version,path:relative,mode:verifyOnly?'verified':'installed-or-present',
    advisory:'GHSA-fc5q-39xc-vjpf',npmAudit:'still reports package advisory until official fixed version'
  }));
}
