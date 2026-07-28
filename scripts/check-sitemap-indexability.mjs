import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';
import {
  buildTrustworthyLastmodMap,
  currentUtcDateString,
} from './lib/trustworthy-sitemap-lastmod.mjs';

const builtPages = collectBuiltPages();
const sitemapFiles = walkFiles(distDir).filter((filePath) => path.basename(filePath).startsWith('sitemap') && filePath.endsWith('.xml'));
const { lastmodByPath } = buildTrustworthyLastmodMap();
const today = currentUtcDateString();

const issues = [];
let sitemapUrlCount = 0;
let lastmodCount = 0;
let omittedLastmodCount = 0;

function extractUrlEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/giu)].map((match) => {
    const loc = match[1].match(/<loc>(.*?)<\/loc>/iu)?.[1].trim() ?? '';
    const lastmod = match[1].match(/<lastmod>(.*?)<\/lastmod>/iu)?.[1].trim();
    return { loc, lastmod };
  });
}

function extractArticleDateModified(html) {
  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
  )) {
    let parsed;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }

    const nodes = parsed['@graph'] ?? [parsed];
    const article = nodes.find((node) => ['Article', 'BlogPosting'].includes(node?.['@type']));
    if (article?.dateModified) return String(article.dateModified).slice(0, 10);
  }

  return undefined;
}

if (sitemapFiles.length === 0) {
  issues.push(`no sitemap XML files found under ${distDir}`);
}

for (const sitemapFile of sitemapFiles) {
  const xml = readText(sitemapFile);
  const entries = extractUrlEntries(xml);

  for (const { loc, lastmod } of entries) {
    sitemapUrlCount += 1;
    const pathname = normalizePathname(loc);
    if (!pathname) {
      issues.push(`unreadable sitemap URL in ${path.basename(sitemapFile)}: ${loc}`);
      continue;
    }

    if (pathname.length > 1 && pathname.endsWith('/')) {
      issues.push(`trailing slash URL in sitemap: ${pathname}`);
    }

    const redirectResult = resolveRedirectChain(pathname);
    if (redirectResult.chain.length > 0) {
      issues.push(`redirect source found in sitemap: ${pathname} -> ${redirectResult.finalPath}`);
      continue;
    }

    const htmlPath = builtPages.get(pathname);
    if (!htmlPath) {
      issues.push(`non-built URL found in sitemap: ${pathname}`);
      continue;
    }

    const canonical = normalizePathname(extractCanonical(readText(htmlPath)));
    if (canonical !== pathname) {
      issues.push(`canonical mismatch for ${pathname}: ${canonical ?? 'missing canonical'}`);
    }

    const expectedLastmod = lastmodByPath.get(pathname);
    if (expectedLastmod) {
      lastmodCount += 1;
      if (lastmod !== expectedLastmod) {
        issues.push(
          `lastmod mismatch for ${pathname}: ${lastmod ?? 'missing'} != ${expectedLastmod}`,
        );
      }
    } else {
      omittedLastmodCount += 1;
      if (lastmod) {
        issues.push(`untrusted lastmod found for ${pathname}: ${lastmod}`);
      }
    }

    if (lastmod && !/^\d{4}-\d{2}-\d{2}$/u.test(lastmod)) {
      issues.push(`lastmod is not date-only for ${pathname}: ${lastmod}`);
    }
    if (lastmod && lastmod > today) {
      issues.push(`future lastmod found for ${pathname}: ${lastmod}`);
    }

    if (pathname.startsWith('/blog/') && lastmod) {
      const schemaDateModified = extractArticleDateModified(readText(htmlPath));
      if (schemaDateModified !== lastmod) {
        issues.push(
          `Article schema dateModified mismatch for ${pathname}: ${schemaDateModified ?? 'missing'} != ${lastmod}`,
        );
      }
    }
  }
}

if (issues.length === 0) {
  console.log(
    `PASS sitemap: ${sitemapUrlCount} canonical URL(s), ${lastmodCount} trustworthy lastmod, ` +
    `${omittedLastmodCount} intentionally omitted across ${sitemapFiles.length} sitemap file(s)`,
  );
  process.exit(0);
}

console.error(`FAIL sitemap: ${issues.length} issue(s) found`);
for (const issue of issues.slice(0, 30)) {
  console.error(`- ${issue}`);
}
process.exit(1);
