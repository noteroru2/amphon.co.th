import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractHrefs,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';

const builtPages = collectBuiltPages();
const htmlFiles = walkFiles(distDir).filter((filePath) => filePath.endsWith('.html'));

const missingLinks = [];
const redirectedLinks = [];

for (const filePath of htmlFiles) {
  const pathname = [...builtPages.entries()].find(([, resolved]) => resolved === filePath)?.[0] ?? filePath;
  const html = readText(filePath);
  const hrefs = extractHrefs(html);

  for (const href of hrefs) {
    const normalized = normalizePathname(href);
    if (!normalized) continue;
    if (normalized.startsWith('/images/') || normalized.startsWith('/favicon') || normalized.startsWith('/icon-')) {
      continue;
    }

    if (builtPages.has(normalized)) {
      continue;
    }

    const redirectResult = resolveRedirectChain(normalized);

    if (redirectResult.chain.length > 0 && builtPages.has(redirectResult.finalPath)) {
      redirectedLinks.push({
        from: pathname,
        href: normalized,
        final: redirectResult.finalPath,
      });
      continue;
    }

    missingLinks.push({
      from: pathname,
      href: normalized,
    });
  }
}

if (missingLinks.length === 0 && redirectedLinks.length === 0) {
  console.log('PASS internal links: no missing targets and no internal links hitting redirect sources');
  process.exit(0);
}

if (missingLinks.length > 0) {
  console.error(`FAIL internal links: ${missingLinks.length} missing target(s)`);
  for (const issue of missingLinks.slice(0, 20)) {
    console.error(`- ${issue.from} -> ${issue.href}`);
  }
}

if (redirectedLinks.length > 0) {
  console.error(`FAIL internal links: ${redirectedLinks.length} link(s) point to redirect sources`);
  for (const issue of redirectedLinks.slice(0, 20)) {
    console.error(`- ${issue.from} -> ${issue.href} -> ${issue.final}`);
  }
}

process.exit(1);
