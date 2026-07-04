import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  extractXmlLocs,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';

const builtPages = collectBuiltPages();
const sitemapFiles = walkFiles(distDir).filter((filePath) => path.basename(filePath).startsWith('sitemap') && filePath.endsWith('.xml'));

const issues = [];

for (const sitemapFile of sitemapFiles) {
  const xml = readText(sitemapFile);
  const locs = extractXmlLocs(xml).filter((loc) => !loc.endsWith('.xml'));

  for (const loc of locs) {
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
  }
}

if (issues.length === 0) {
  console.log(`PASS sitemap: checked ${sitemapFiles.length} sitemap file(s), only indexable canonical URLs found`);
  process.exit(0);
}

console.error(`FAIL sitemap: ${issues.length} issue(s) found`);
for (const issue of issues.slice(0, 30)) {
  console.error(`- ${issue}`);
}
process.exit(1);
