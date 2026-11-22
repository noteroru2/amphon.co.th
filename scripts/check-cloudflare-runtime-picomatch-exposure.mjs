import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Evidence from emitted Cloudflare code, NOT an npm advisory waiver.
 * Static signature scanning cannot exclude rewritten, dynamically imported,
 * or minified vulnerable logic. Preserve npm audit as a separate blocking gate.
 */
const signatures = [
  { name: 'picomatch', re: /\bpicomatch\b/i },
  { name: 'analyzeRepeatedExtglob', re: /analyzeRepeatedExtglob/i },
  { name: 'POSIX_REGEX_SOURCE', re: /POSIX_REGEX_SOURCE/i },
  { name: 'tinyglobby', re: /\btinyglobby\b/i },
  { name: 'anymatch', re: /\banymatch\b/i },
];
const emittedRoots = ['dist/server', '.cf-integration-dryrun'];
const runtimeExtensions = new Set(['.js', '.mjs', '.cjs', '.map']);
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.astro']);
const directImport = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)['"](?:picomatch|tinyglobby|anymatch)(?:\/[^'"]*)?['"]/g;

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlink in artifact scan: ' + full);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

export function checkRuntime(root, options = {}) {
  const minBytes = options.minBytes ?? 8192;
  const report = {
    checkedAt: new Date().toISOString(),
    sha: process.env.GITHUB_SHA || null,
    methodology: 'Static emitted-script signatures + first-party direct imports; not a claim of complete runtime non-exploitability',
    entrypoints: [], emitted: [], directSourceImports: [], hits: [], passed: false,
    limits: [
      'A bundled/minified or dynamically generated matcher may not retain recognizable symbols',
      'This check does not replace npm audit, adversarial runtime tests, independent source review or patching a vulnerable upstream dependency',
      'Only build artifacts from the current SHA can support conclusions about this candidate',
    ],
  };

  for (const rel of emittedRoots) {
    const dir = path.join(root, rel);
    assert.ok(fs.existsSync(dir), 'Missing emitted Cloudflare artifact directory: ' + rel);
    const paths = listFiles(dir).filter(p => runtimeExtensions.has(path.extname(p)));
    const scripts = paths.filter(p => path.extname(p) !== '.map');
    const totalBytes = scripts.reduce((n, p) => n + fs.statSync(p).size, 0);
    assert.ok(scripts.length > 0, 'Missing JavaScript files in ' + rel);
    assert.ok(totalBytes >= minBytes, 'Suspiciously small emitted bundle in ' + rel + ': ' + totalBytes);
    report.entrypoints.push({ root: rel, scripts: scripts.length, bytes: totalBytes });
    for (const p of paths) {
      const buf = fs.readFileSync(p);
      const body = buf.toString('utf8');
      const relativePath = path.relative(root, p).split(path.sep).join('/');
      report.emitted.push({
        path: relativePath, bytes: buf.length,
        sha256: crypto.createHash('sha256').update(buf).digest('hex'),
      });
      for (const sig of signatures) {
        if (sig.re.test(body)) report.hits.push({ file: relativePath, signature: sig.name });
      }
    }
  }

  const sourceRoot = path.join(root, 'src');
  assert.ok(fs.existsSync(sourceRoot), 'Missing first-party src directory');
  for (const p of listFiles(sourceRoot).filter(p => sourceExtensions.has(path.extname(p)))) {
    const body = fs.readFileSync(p, 'utf8');
    for (const m of body.matchAll(directImport)) {
      report.directSourceImports.push({
        file: path.relative(root, p).split(path.sep).join('/'),
        import: m[0].slice(0, 100),
      });
    }
  }
  report.passed = report.hits.length === 0 && report.directSourceImports.length === 0;
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(process.cwd());
  const outPath = path.join(root, 'artifacts/security/picomatch-runtime-exposure.json');
  try {
    const report = checkRuntime(root);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
    console.log('CLOUDFLARE_PICOMATCH_RUNTIME_EXPOSURE ' + JSON.stringify({
      checkedAt: report.checkedAt, sha: report.sha, entrypoints: report.entrypoints,
      emittedFiles: report.emitted.length, hits: report.hits,
      directSourceImports: report.directSourceImports, passed: report.passed,
      warning: 'No static signatures is NOT proof of absence of exploitability; npm audit remains mandatory and blocking',
    }));
    assert.equal(report.passed, true, 'Vulnerable glob parser may be present in Worker output / app source');
  } catch (e) {
    console.error('CLOUDFLARE_PICOMATCH_RUNTIME_EXPOSURE_FAIL ' + String(e?.stack || e));
    process.exitCode = 1;
  }
}
