import fs from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://amphon.co.th';

export const repoRoot = process.cwd();
export const distDir = path.join(repoRoot, 'dist');

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function walkFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  const files = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const resolved = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(resolved));
      continue;
    }

    files.push(resolved);
  }

  return files;
}

export function toPosix(value) {
  return value.split(path.sep).join('/');
}

export function normalizePathname(input) {
  if (!input) return null;
  if (input.startsWith('#') || input.startsWith('mailto:') || input.startsWith('tel:') || input.startsWith('javascript:')) {
    return null;
  }

  let url;

  try {
    url = new URL(input, SITE_ORIGIN);
  } catch {
    return null;
  }

  if (url.origin !== SITE_ORIGIN) return null;

  let pathname = url.pathname;

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    pathname = url.pathname;
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  return pathname || '/';
}

export function collectBuiltPages() {
  const pages = new Map();

  for (const filePath of walkFiles(distDir)) {
    if (!filePath.endsWith('.html')) continue;

    const relPath = toPosix(path.relative(distDir, filePath));
    let pathname = '/';

    if (relPath === 'index.html') {
      pathname = '/';
    } else if (relPath.endsWith('/index.html')) {
      pathname = `/${relPath.slice(0, -'/index.html'.length)}`;
    } else {
      pathname = `/${relPath.replace(/\.html$/u, '')}`;
    }

    pages.set(pathname, filePath);
  }

  return pages;
}

export function fileExistsInDist(pathname) {
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return fs.existsSync(path.join(distDir, cleanPath));
}

export function extractHrefs(html) {
  const hrefs = [];
  const pattern = /<a\b[^>]*href=(["'])(.*?)\1/giu;

  for (const match of html.matchAll(pattern)) {
    hrefs.push(match[2]);
  }

  return hrefs;
}

export function stripTags(value) {
  return value.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim();
}

export function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/iu);
  return match ? stripTags(match[1]) : '';
}

export function extractFirstH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/iu);
  return match ? stripTags(match[1]) : '';
}

export function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/iu);
  return match ? match[1] : '';
}

export function extractXmlLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/giu)].map((match) => match[1].trim());
}

export function loadRedirects() {
  const vercelConfig = readJson(path.join(repoRoot, 'vercel.json'));
  return vercelConfig.redirects ?? [];
}

function compileRedirectRule(rule) {
  const keys = [];
  let pattern = '^';

  for (let index = 0; index < rule.source.length; index += 1) {
    const char = rule.source[index];

    if (char !== ':') {
      pattern += char.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      continue;
    }

    let cursor = index + 1;
    let key = '';

    while (cursor < rule.source.length && /[A-Za-z0-9_]/u.test(rule.source[cursor])) {
      key += rule.source[cursor];
      cursor += 1;
    }

    const isGreedy = rule.source[cursor] === '+';
    keys.push(key);
    pattern += isGreedy ? `(?<${key}>.+)` : `(?<${key}>[^/]+)`;
    index = cursor + (isGreedy ? 0 : -1);
  }

  pattern += '$';

  return {
    ...rule,
    keys,
    regex: new RegExp(pattern, 'u'),
  };
}

export function resolveRedirectChain(pathname, redirects = loadRedirects(), limit = 10) {
  const compiled = redirects.map(compileRedirectRule);
  const visited = new Set([pathname]);
  const chain = [];
  let current = pathname;

  for (let depth = 0; depth < limit; depth += 1) {
    const matched = compiled.find((rule) => rule.regex.test(current));
    if (!matched) {
      return { finalPath: current, chain, loop: false };
    }

    const capture = current.match(matched.regex)?.groups ?? {};
    let destination = matched.destination;

    for (const [key, value] of Object.entries(capture)) {
      destination = destination.replaceAll(`:${key}`, value);
    }

    const normalizedDestination = normalizePathname(destination);
    chain.push({ source: current, destination: normalizedDestination, permanent: matched.permanent });

    if (!normalizedDestination) {
      return { finalPath: current, chain, loop: false };
    }

    if (visited.has(normalizedDestination)) {
      return { finalPath: normalizedDestination, chain, loop: true };
    }

    visited.add(normalizedDestination);
    current = normalizedDestination;
  }

  return { finalPath: current, chain, loop: true };
}
