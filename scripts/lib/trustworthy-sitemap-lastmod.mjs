import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COLLECTION_ROUTES = Object.freeze({
  areas: '/พื้นที่ให้บริการ',
  blog: '/blog',
  serviceAreas: '/รับซื้อ',
  services: '/บริการ',
});

function walkContentFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkContentFiles(resolved);
    return /\.(?:md|mdx)$/iu.test(entry.name) ? [resolved] : [];
  });
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) {
    throw new Error(`${filePath}: missing YAML frontmatter`);
  }

  return match[1];
}

function readScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'mu'));
  if (!match) return undefined;

  const raw = match[1].trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim();
  }

  return raw.replace(/[ \t]+#.*$/u, '').trim();
}

function isCalendarDate(value) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const normalized = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${normalized.year}-${normalized.month}-${normalized.day}` === value;
}

export function currentUtcDateString(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const normalized = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${normalized.year}-${normalized.month}-${normalized.day}`;
}

export function resolveTrustworthyLastmod({ date, updated, today, source = 'content' }) {
  if (!date) return undefined;
  if (!isCalendarDate(date)) {
    throw new Error(`${source}: date must use YYYY-MM-DD, received ${JSON.stringify(date)}`);
  }
  if (updated && !isCalendarDate(updated)) {
    throw new Error(`${source}: updated must use YYYY-MM-DD, received ${JSON.stringify(updated)}`);
  }
  if (updated && updated < date) {
    throw new Error(`${source}: updated ${updated} is older than date ${date}`);
  }

  const lastmod = updated ?? date;
  if (lastmod > today) {
    throw new Error(`${source}: lastmod ${lastmod} is in the future (UTC today is ${today})`);
  }

  return lastmod;
}

export function normalizeSitemapPath(input) {
  const url = new URL(input, 'https://amphon.co.th');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/u, '');
  return pathname || '/';
}

export function buildTrustworthyLastmodMap({
  contentRoot = path.resolve(process.cwd(), 'src/content'),
  today = currentUtcDateString(),
} = {}) {
  const lastmodByPath = new Map();
  const sourcesByPath = new Map();
  const collectionCounts = {};

  for (const [collection, routePrefix] of Object.entries(COLLECTION_ROUTES)) {
    const collectionRoot = path.join(contentRoot, collection);
    const files = walkContentFiles(collectionRoot).sort((a, b) => a.localeCompare(b, 'en'));
    let included = 0;

    for (const filePath of files) {
      const frontmatter = parseFrontmatter(fs.readFileSync(filePath, 'utf8'), filePath);
      if (readScalar(frontmatter, 'draft') === 'true') continue;

      const slug = readScalar(frontmatter, 'slug');
      if (!slug) {
        throw new Error(`${filePath}: missing slug`);
      }

      const lastmod = resolveTrustworthyLastmod({
        date: readScalar(frontmatter, 'date'),
        updated: readScalar(frontmatter, 'updated'),
        today,
        source: path.relative(contentRoot, filePath).split(path.sep).join('/'),
      });
      if (!lastmod) continue;

      const pathname = normalizeSitemapPath(`${routePrefix}/${slug}`);
      if (lastmodByPath.has(pathname)) {
        throw new Error(
          `${filePath}: duplicate sitemap pathname ${pathname}; first declared by ${sourcesByPath.get(pathname)}`,
        );
      }

      lastmodByPath.set(pathname, lastmod);
      sourcesByPath.set(pathname, path.relative(contentRoot, filePath).split(path.sep).join('/'));
      included += 1;
    }

    collectionCounts[collection] = { files: files.length, included };
  }

  return { lastmodByPath, sourcesByPath, collectionCounts, today };
}

export function serializeTrustworthyLastmod(item, lastmodByPath) {
  const lastmod = lastmodByPath.get(normalizeSitemapPath(item.url));
  return lastmod ? { ...item, lastmod } : item;
}

export function dateOnlySitemapIntegration() {
  return {
    name: 'amphon-trustworthy-sitemap-date-only',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const outputDirectory = fileURLToPath(dir);
        const sitemapFiles = fs
          .readdirSync(outputDirectory)
          .filter((file) => /^sitemap(?:-[^.]+)*\.xml$/u.test(file));

        for (const file of sitemapFiles) {
          const filePath = path.join(outputDirectory, file);
          const before = fs.readFileSync(filePath, 'utf8');
          const after = before.replace(
            /<lastmod>(\d{4}-\d{2}-\d{2})T00:00:00\.000Z<\/lastmod>/gu,
            '<lastmod>$1</lastmod>',
          );

          if (/<lastmod>[^<]*T[^<]*<\/lastmod>/u.test(after)) {
            throw new Error(`${file}: non-date-only lastmod remained after sitemap normalization`);
          }
          if (after !== before) fs.writeFileSync(filePath, after, 'utf8');
        }

        logger.info(`normalized trustworthy lastmod values in ${sitemapFiles.length} sitemap file(s)`);
      },
    },
  };
}
