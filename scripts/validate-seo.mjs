/**
 * Validate built HTML for SEO / JSON-LD compliance (Google Search Central).
 * Run after build: npm run build && npm run validate:seo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const siteUrl = 'https://amphon.co.th';
const IN_LANGUAGE = 'th-TH';

const errors = [];
const warnings = [];

function walkHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function getMeta(html, property) {
  const og = html.match(new RegExp(`property="${property}" content="([^"]*)"`, 'i'));
  if (og) return og[1];
  const name = html.match(new RegExp(`name="${property}" content="([^"]*)"`, 'i'));
  return name?.[1] ?? null;
}

function getCanonical(html) {
  const m = html.match(/<link rel="canonical" href="([^"]*)"/i);
  return m?.[1] ?? null;
}

function getJsonLdGraphs(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  return scripts
    .map((s) => {
      try {
        return JSON.parse(s[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function fileToUrl(filePath) {
  const rel = path.relative(distDir, filePath).replace(/\\/g, '/');
  const route = rel.replace(/index\.html$/, '').replace(/\/$/, '');
  return route ? `${siteUrl}/${route}` : siteUrl;
}

function countH1(html) {
  return (html.match(/<h1[\s>]/gi) ?? []).length;
}

function extractVisibleFaqQuestions(html) {
  return [...html.matchAll(/class="faq__question[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
}

function extractSchemaFaqQuestions(graph) {
  const faqNode = graph.find((n) => n['@type'] === 'FAQPage');
  if (!faqNode?.mainEntity) return [];
  return faqNode.mainEntity.map((q) => q.name?.trim()).filter(Boolean);
}

function hasTrailingSlashBeforeFragment(id) {
  const m = id.match(/^https:\/\/amphon\.co\.th(\/[^#]*)(#.*)$/);
  if (!m) return false;
  const urlPath = m[1];
  return urlPath.length > 1 && urlPath.endsWith('/');
}

function collectMediaUrls(value, urls = new Set()) {
  if (value == null) return urls;
  if (typeof value === 'string') {
    if (/\.(jpg|jpeg|png|webp|svg|gif)(\?|$)/i.test(value) || value.includes('/images/')) {
      urls.add(value);
    }
    return urls;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectMediaUrls(item, urls);
    return urls;
  }
  if (typeof value === 'object') {
    if (value['@type'] === 'ImageObject' && value.url) urls.add(value.url);
    for (const v of Object.values(value)) collectMediaUrls(v, urls);
  }
  return urls;
}

function nodeTypes(node) {
  const t = node['@type'];
  return Array.isArray(t) ? t : t ? [t] : [];
}

function hasType(node, type) {
  return nodeTypes(node).includes(type);
}

const htmlFiles = walkHtmlFiles(distDir);

if (htmlFiles.length === 0) {
  console.error('No HTML files in dist/. Run npm run build first.');
  process.exit(1);
}

console.log(`Validating ${htmlFiles.length} pages...\n`);

const seenCanonicals = new Set();
const seenTitles = new Map();
const seenDescriptions = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  if (rel === 'บริการ/รับซื้อ-gopro/index.html') {
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const expectedUrl = fileToUrl(file);

  const title = getMeta(html, 'og:title') ?? html.match(/<title>([^<]*)<\/title>/i)?.[1];
  const description = getMeta(html, 'description');
  const canonical = getCanonical(html);
  const ogUrl = getMeta(html, 'og:url');
  const ogImage = getMeta(html, 'og:image');
  const h1Count = countH1(html);

  if (!title) errors.push(`[${rel}] Missing <title>`);
  if (!description) errors.push(`[${rel}] Missing meta description`);
  if (!canonical) errors.push(`[${rel}] Missing canonical URL`);
  if (canonical?.endsWith('/')) errors.push(`[${rel}] Canonical has trailing slash: ${canonical}`);
  if (canonical && canonical !== expectedUrl)
    errors.push(`[${rel}] Canonical mismatch: ${canonical} ≠ ${expectedUrl}`);
  if (ogUrl && canonical && ogUrl !== canonical)
    errors.push(`[${rel}] og:url ≠ canonical: ${ogUrl} vs ${canonical}`);
  if (!ogImage) errors.push(`[${rel}] Missing og:image`);
  if (ogImage?.includes('favicon')) errors.push(`[${rel}] og:image must not be favicon`);
  if (ogImage && !ogImage.startsWith('http'))
    errors.push(`[${rel}] og:image must be absolute URL: ${ogImage}`);
  if (h1Count !== 1) errors.push(`[${rel}] Expected 1 H1, found ${h1Count}`);

  if (title) {
    if (seenTitles.has(title)) {
      errors.push(`[${rel}] Duplicate title: "${title}" (also on ${seenTitles.get(title)})`);
    } else {
      seenTitles.set(title, rel);
    }
  }

  if (description) {
    if (seenDescriptions.has(description)) {
      errors.push(
        `[${rel}] Duplicate meta description (also on ${seenDescriptions.get(description)})`,
      );
    } else {
      seenDescriptions.set(description, rel);
    }
  }

  if (canonical) {
    if (seenCanonicals.has(canonical)) errors.push(`[${rel}] Duplicate canonical: ${canonical}`);
    seenCanonicals.add(canonical);
  }

  const ldBlocks = getJsonLdGraphs(html);
  if (ldBlocks.length !== 1) errors.push(`[${rel}] Expected 1 JSON-LD block, found ${ldBlocks.length}`);

  for (const block of ldBlocks) {
    if (!block['@context']) errors.push(`[${rel}] JSON-LD missing @context`);
    const graph = block['@graph'];
    if (!Array.isArray(graph)) {
      errors.push(`[${rel}] JSON-LD must use @graph array`);
      continue;
    }

    const types = graph.flatMap((n) => nodeTypes(n));
    const ids = graph.map((n) => n['@id']).filter(Boolean);

    for (const required of ['Organization', 'LocalBusiness', 'WebSite', 'BreadcrumbList']) {
      if (!types.includes(required)) errors.push(`[${rel}] @graph missing ${required}`);
    }

    const webSite = graph.find((n) => hasType(n, 'WebSite'));
    if (webSite?.potentialAction) {
      errors.push(`[${rel}] WebSite must not include SearchAction/potentialAction (no site search)`);
    }

    const webPage = graph.find((n) => nodeTypes(n).some((t) => t.includes('Page')));
    if (!webPage) warnings.push(`[${rel}] No WebPage/CollectionPage node in @graph`);

    if (webPage) {
      if (!webPage.isPartOf?.['@id']?.includes('#website'))
        errors.push(`[${rel}] WebPage.isPartOf must reference #website`);
      if (!webPage.publisher?.['@id']?.includes('#organization'))
        errors.push(`[${rel}] WebPage.publisher must reference #organization`);
      if (!webPage.breadcrumb?.['@id']?.includes('#breadcrumb'))
        errors.push(`[${rel}] WebPage.breadcrumb must reference #breadcrumb`);
      if (webPage.inLanguage !== IN_LANGUAGE)
        errors.push(`[${rel}] WebPage.inLanguage must be "${IN_LANGUAGE}"`);
      if (!webPage.primaryImageOfPage?.url)
        errors.push(`[${rel}] WebPage missing primaryImageOfPage`);
      if (webPage.primaryImageOfPage?.url && !webPage.primaryImageOfPage.url.startsWith('http'))
        errors.push(`[${rel}] primaryImageOfPage must be absolute URL`);
    }

    for (const node of graph) {
      if (hasType(node, 'Service') && node.inLanguage !== IN_LANGUAGE) {
        errors.push(`[${rel}] Service.inLanguage must be "${IN_LANGUAGE}"`);
      }
      if (hasType(node, 'BlogPosting') && node.inLanguage !== IN_LANGUAGE) {
        errors.push(`[${rel}] BlogPosting.inLanguage must be "${IN_LANGUAGE}"`);
      }
      if (hasType(node, 'CollectionPage') && node.inLanguage !== IN_LANGUAGE) {
        errors.push(`[${rel}] CollectionPage.inLanguage must be "${IN_LANGUAGE}"`);
      }
      if (hasType(node, 'Organization')) {
        for (const field of ['name', 'url', 'logo', 'image', 'telephone', 'email']) {
          if (!node[field]) warnings.push(`[${rel}] Organization missing ${field}`);
        }
      }
      if (hasType(node, 'LocalBusiness')) {
        for (const field of [
          'name',
          'url',
          'logo',
          'image',
          'telephone',
          'email',
          'address',
          'geo',
          'openingHoursSpecification',
          'areaServed',
          'sameAs',
          'currenciesAccepted',
          'paymentAccepted',
        ]) {
          if (!node[field]) warnings.push(`[${rel}] LocalBusiness missing ${field}`);
        }
      }
    }

    for (const id of ids) {
      if (hasTrailingSlashBeforeFragment(id)) {
        errors.push(`[${rel}] @id has trailing slash before fragment: ${id}`);
      }
    }

    const mediaUrls = collectMediaUrls(graph);
    for (const url of mediaUrls) {
      if (!url.startsWith('http')) {
        errors.push(`[${rel}] JSON-LD media URL must be absolute: ${url}`);
      }
    }

    for (const node of graph) {
      if (hasType(node, 'Offer') && (node.price === '0' || node.price === 0))
        warnings.push(`[${rel}] Offer has fixed price 0 — avoid unless real price`);
    }

    const visibleFaqs = extractVisibleFaqQuestions(html);
    const schemaFaqs = extractSchemaFaqQuestions(graph);

    if (schemaFaqs.length > 0) {
      if (visibleFaqs.length === 0)
        errors.push(`[${rel}] FAQPage schema but no visible FAQ on page`);
      for (const q of schemaFaqs) {
        if (!visibleFaqs.includes(q))
          errors.push(`[${rel}] FAQ schema question not visible: "${q}"`);
      }
      for (const q of visibleFaqs) {
        if (!schemaFaqs.includes(q)) warnings.push(`[${rel}] Visible FAQ not in schema: "${q}"`);
      }
    } else if (visibleFaqs.length > 0) {
      warnings.push(`[${rel}] Visible FAQ but no FAQPage schema`);
    }

    const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicateIds.length)
      errors.push(`[${rel}] Duplicate @id in @graph: ${[...new Set(duplicateIds)].join(', ')}`);
  }
}

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log('');
}

if (errors.length) {
  console.log('Errors:');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log(`\n${errors.length} error(s) — validation failed.`);
  process.exit(1);
}

console.log(`✓ All ${htmlFiles.length} pages passed SEO / JSON-LD validation.`);
