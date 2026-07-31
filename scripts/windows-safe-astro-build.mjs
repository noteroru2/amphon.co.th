/**
 * Windows-safe Astro build entrypoint (F-08).
 *
 * Evidence: `astro build` aborts with Windows exit -1073740791 (0xC0000409)
 * when the repo absolute path contains non-ASCII characters (e.g. Thai).
 * The same Node, lockfile, and sources succeed on an ASCII-only path.
 *
 * On win32 + non-ASCII cwd, mirror sources to an ASCII workdir, build there,
 * copy dist/.vercel back, and propagate the real child exit code.
 * On other platforms / ASCII paths, run `astro build` in-place.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = path.join(ROOT, '.amphon-build-complete');
const NON_ASCII = /[^\x00-\x7F]/;

function fail(message, code = 1) {
  console.error(`[windows-safe-astro-build] ${message}`);
  process.exit(code);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    ...options,
  });
  if (result.error) {
    fail(`failed to start ${command}: ${result.error.message}`);
  }
  if (result.signal) {
    fail(`${command} terminated by signal ${result.signal}`);
  }
  return result.status ?? 1;
}

function removeMarker() {
  try {
    fs.unlinkSync(MARKER);
  } catch {
    // ignore missing marker
  }
}

function writeMarker(payload) {
  fs.writeFileSync(MARKER, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function hasNonAscii(value) {
  return NON_ASCII.test(value);
}

function lockfileHash(root) {
  const lockPath = path.join(root, 'package-lock.json');
  const pkgPath = path.join(root, 'package.json');
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(lockPath));
  hash.update('\0');
  hash.update(fs.readFileSync(pkgPath));
  return hash.digest('hex');
}

function ensureEmptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function robocopy(src, dest, extraArgs = []) {
  // Robocopy success exit codes are 0–7.
  const args = [src, dest, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np', ...extraArgs];
  const result = spawnSync('robocopy', args, {
    stdio: 'inherit',
    env: process.env,
    windowsHide: true,
  });
  if (result.error) {
    fail(`robocopy failed to start: ${result.error.message}`);
  }
  const code = result.status ?? 1;
  if (code >= 8) {
    fail(`robocopy failed with exit code ${code}`);
  }
  return code;
}

function syncSources(sourceRoot, workRoot) {
  fs.mkdirSync(workRoot, { recursive: true });
  robocopy(sourceRoot, workRoot, [
    '/XD',
    'node_modules',
    'dist',
    '.git',
    '.vercel',
    '.astro',
    'scratch',
    '.cursor',
    'docs',
  ]);
}

function ensureWorkDependencies(workRoot, expectedHash) {
  const stampPath = path.join(workRoot, '.amphon-lock-hash');
  const nm = path.join(workRoot, 'node_modules');
  const astroBin = path.join(workRoot, 'node_modules', 'astro', 'bin', 'astro.mjs');
  let current = '';
  try {
    current = fs.readFileSync(stampPath, 'utf8').trim();
  } catch {
    current = '';
  }
  if (current === expectedHash && fs.existsSync(astroBin) && fs.existsSync(nm)) {
    console.log('[windows-safe-astro-build] reusing cached node_modules in ASCII workdir');
    return;
  }
  console.log('[windows-safe-astro-build] npm ci in ASCII workdir');
  const code = run('npm', ['ci'], { cwd: workRoot, shell: true });
  if (code !== 0) {
    fail(`npm ci in workdir exited ${code}`, code);
  }
  fs.writeFileSync(stampPath, `${expectedHash}\n`, 'utf8');
}

function copyArtifactsBack(workRoot, sourceRoot) {
  const distSrc = path.join(workRoot, 'dist');
  const vercelSrc = path.join(workRoot, '.vercel');
  if (!fs.existsSync(distSrc)) {
    fail('build finished without dist/ in workdir');
  }
  ensureEmptyDir(path.join(sourceRoot, 'dist'));
  robocopy(distSrc, path.join(sourceRoot, 'dist'));
  if (fs.existsSync(vercelSrc)) {
    ensureEmptyDir(path.join(sourceRoot, '.vercel'));
    robocopy(vercelSrc, path.join(sourceRoot, '.vercel'));
  }
}

function runAstroBuild(cwd) {
  const astroBin = path.join(cwd, 'node_modules', 'astro', 'bin', 'astro.mjs');
  if (!fs.existsSync(astroBin)) {
    fail(`missing Astro binary at ${astroBin}`);
  }
  return run(process.execPath, [astroBin, 'build'], { cwd });
}

function asciiWorkRoot() {
  const base = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  if (hasNonAscii(base)) {
    return 'C:\\amphon-co-th-win-build';
  }
  return path.join(base, 'amphon-co-th-win-build');
}

removeMarker();

const cwd = process.cwd();
const needsMirror =
  process.platform === 'win32' && (hasNonAscii(cwd) || hasNonAscii(ROOT));

if (!needsMirror) {
  console.log('[windows-safe-astro-build] in-place astro build');
  const code = runAstroBuild(ROOT);
  if (code !== 0) {
    process.exit(code);
  }
  writeMarker({
    mode: 'in-place',
    cwd,
    root: ROOT,
    platform: process.platform,
    completedAt: new Date().toISOString(),
  });
  process.exit(0);
}

const workRoot = asciiWorkRoot();
if (hasNonAscii(workRoot)) {
  fail(`ASCII workdir path unexpectedly contains non-ASCII: ${workRoot}`);
}

console.log(`[windows-safe-astro-build] non-ASCII path detected`);
console.log(`[windows-safe-astro-build] cwd: ${cwd}`);
console.log(`[windows-safe-astro-build] root: ${ROOT}`);
console.log(`[windows-safe-astro-build] mirroring build to: ${workRoot}`);

syncSources(ROOT, workRoot);
ensureWorkDependencies(workRoot, lockfileHash(ROOT));

const buildCode = runAstroBuild(workRoot);
if (buildCode !== 0) {
  process.exit(buildCode);
}

copyArtifactsBack(workRoot, ROOT);
writeMarker({
  mode: 'ascii-mirror',
  cwd,
  workRoot,
  platform: process.platform,
  completedAt: new Date().toISOString(),
});
console.log('[windows-safe-astro-build] artifacts copied back; build complete');
process.exit(0);
