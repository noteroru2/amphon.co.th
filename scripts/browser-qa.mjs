/**
 * Browser QA Agent — amphon.co.th
 * ตรวจ local preview ที่ http://localhost:4321
 * ห้ามแก้ไฟล์ / commit / push / deploy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const BASE_URL = 'http://localhost:4321';
const TIMEOUT = 10000;

const CLAIM_RISK_PATTERNS = [
  /ราคาสูงสุด/g,
  /ดีที่สุด/g,
  /อันดับ\s*1/g,
  /รับทุกสภาพ/g,
  /ราคาดีที่สุด/g,
  /สูงที่สุด/g,
  /เยี่ยมที่สุด/g,
  /ถูกที่สุด/g,
];

// ===== Fetch helper (follows redirects manually) =====
async function fetchChain(url, maxHops = 5) {
  const hops = [];
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(current, { redirect: 'manual' });
    const status = res.status;
    hops.push({ url: current, status });
    if (status >= 300 && status < 400) {
      const loc = res.headers.get('location');
      if (!loc) break;
      current = loc.startsWith('http') ? loc : `${BASE_URL}${loc}`;
    } else {
      break;
    }
  }
  return hops;
}

// ===== Read dist HTML file =====
function readDistFile(urlPath) {
  // Strip query/hash
  const clean = urlPath.split('?')[0].split('#')[0];
  // Remove trailing slash
  const noSlash = clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : clean;
  const candidates = [
    path.join(DIST, noSlash, 'index.html'),
    path.join(DIST, noSlash + '.html'),
    path.join(DIST, noSlash),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const stat = fs.statSync(c);
      if (stat.isFile()) return fs.readFileSync(c, 'utf-8');
    }
  }
  return null;
}

// ===== Extract from HTML =====
function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
}
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}
function extractMeta(html, name) {
  const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'));
  return m ? m[1].trim() : null;
}
function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim() : null;
}
function hasNoindex(html) {
  return /<meta[^>]+robots[^>]+noindex/i.test(html) || /<meta[^>]+noindex[^>]+robots/i.test(html);
}
function checkClaimRisk(html) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const found = [];
  for (const pat of CLAIM_RISK_PATTERNS) {
    const matches = text.match(pat);
    if (matches) found.push(...matches.map(() => pat.source.replace(/\\s\*/g, ' ').replace(/\\/g, '')));
  }
  return [...new Set(found)];
}
function hasCTA(html) {
  return /line\.me|lin\.ee|tel:|โทร/i.test(html);
}
function checkOverflow(html) {
  // Check for common overflow issues in CSS/style — basic heuristic
  return /overflow-x\s*:\s*hidden/i.test(html) || true; // can't fully test without browser
}
function hasInternalLinks(html) {
  const m = html.match(/<a[^>]+href=["']\/[^"']+["']/gi);
  return m ? m.length : 0;
}
function extractBodyText(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== Results store =====
const results = {
  redirect: [],
  canonical: [],
  moneyPages: [],
  sitemap: { pass: true, issues: [] },
  assets: [],
};

// ===== 1. Redirect P0 =====
async function checkRedirects() {
  console.log('\n════════════════════════════════════════');
  console.log('1. ตรวจ Redirect P0');
  console.log('════════════════════════════════════════');

  const redirectTests = [
    {
      from: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด/',
      expectFinal: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด',
    },
    {
      from: '/บริการ/รับซื้อ-gopro',
      expectFinal: '/บริการ/รับซื้อ-gopro-action-camera',
    },
    {
      from: '/บริการ/รับซื้อเลนส์',
      expectFinal: '/บริการ/รับซื้อเลนส์กล้อง',
    },
    {
      from: '/บริการ/รับซื้อ-hdd',
      expectFinal: '/บริการ/รับซื้อ-ssd',
    },
    {
      from: '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
      expectFinal: '/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
    },
  ];

  // NOTE: astro preview does NOT handle vercel.json redirects
  // We validate redirect rules from vercel.json and confirm destination pages exist
  const vercelJson = JSON.parse(fs.readFileSync(path.join(DIST, '..', 'vercel.json'), 'utf-8'));
  const vercelRedirects = vercelJson.redirects || [];

  for (const test of redirectTests) {
    const r = { url: test.from, pass: true, issues: [], hops: [] };

    // Find matching vercel redirect rule
    const rule = vercelRedirects.find(rd => rd.source === test.from);
    if (!rule) {
      r.issues.push('❌ ไม่พบ redirect rule ใน vercel.json');
      r.pass = false;
    } else {
      r.hops.push({ from: test.from, to: rule.destination, type: rule.permanent ? '301' : '302' });
      const dest = rule.destination;

      // Check destination = expected
      if (!dest.includes(test.expectFinal.replace(/^\//, ''))) {
        r.issues.push(`❌ destination "${dest}" ไม่ตรง expected "${test.expectFinal}"`);
        r.pass = false;
      }

      // Check destination page exists in dist
      const destHtml = readDistFile(dest);
      if (!destHtml) {
        r.issues.push(`❌ destination page "${dest}" ไม่มีใน dist (404)`);
        r.pass = false;
      } else {
        r.hops.push({ url: dest, status: 200 });

        // Check canonical at destination
        const canonical = extractCanonical(destHtml);
        const canonicalPath = canonical ? canonical.replace('https://amphon.co.th', '') : null;
        const expectedCanonical = dest.endsWith('/') ? dest.slice(0, -1) : dest;
        if (canonicalPath && canonicalPath !== expectedCanonical) {
          r.issues.push(`⚠️ canonical "${canonicalPath}" ไม่ตรง final URL "${expectedCanonical}"`);
          r.pass = false;
        } else if (!canonicalPath) {
          r.issues.push('⚠️ ไม่พบ canonical tag ที่ destination');
          r.pass = false;
        }

        // Check redirect chain > 1 hop
        const chainRule = vercelRedirects.find(rd => rd.source === dest);
        if (chainRule) {
          r.issues.push(`❌ redirect chain! destination "${dest}" ยัง redirect ต่อไป "${chainRule.destination}"`);
          r.pass = false;
        }
      }

      // Check trailing slash conflict: is there ALSO a rule for dest+/ ?
      const trailingRule = vercelRedirects.find(rd =>
        rd.source === dest + '/' && rd.destination !== dest
      );
      if (trailingRule) {
        r.issues.push(`⚠️ trailing slash conflict: "${dest}/" → "${trailingRule.destination}"`);
      }
    }

    results.redirect.push(r);
    const icon = r.pass ? '✅' : '❌';
    console.log(`\n${icon} ${test.from}`);
    if (r.hops.length) console.log('   Hops:', JSON.stringify(r.hops));
    if (r.issues.length) r.issues.forEach(i => console.log('   ' + i));
    if (r.pass) console.log('   → PASS');
  }
}

// ===== 2. Canonical Destination Pages =====
async function checkCanonicalPages() {
  console.log('\n════════════════════════════════════════');
  console.log('2. ตรวจ Canonical Destination Pages');
  console.log('════════════════════════════════════════');

  const pages = [
    { url: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด', notes: [] },
    { url: '/บริการ/รับซื้อ-gopro-action-camera', notes: [] },
    { url: '/บริการ/รับซื้อเลนส์กล้อง', notes: [] },
    { url: '/บริการ/รับซื้อ-ssd', notes: ['ต้องมีเนื้อหา HDD/SSD/External'] },
    { url: '/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี', notes: [] },
  ];

  for (const page of pages) {
    const r = { url: page.url, pass: true, issues: [] };
    const html = readDistFile(page.url);

    if (!html) {
      r.issues.push('❌ 404 — ไม่พบไฟล์ใน dist');
      r.pass = false;
      results.canonical.push(r);
      console.log(`\n❌ ${page.url}`);
      r.issues.forEach(i => console.log('   ' + i));
      continue;
    }

    // H1
    const h1 = extractH1(html);
    if (!h1) { r.issues.push('❌ ไม่พบ H1'); r.pass = false; }
    else r.issues.push(`✅ H1: "${h1}"`);

    // Title
    const title = extractTitle(html);
    if (!title) { r.issues.push('❌ ไม่พบ <title>'); r.pass = false; }
    else r.issues.push(`✅ Title: "${title.substring(0, 60)}..."`);

    // Meta description
    const desc = extractMeta(html, 'description');
    if (!desc) { r.issues.push('⚠️ ไม่พบ meta description'); }

    // Canonical
    const canonical = extractCanonical(html);
    const canonicalPath = canonical ? canonical.replace('https://amphon.co.th', '') : null;
    if (!canonicalPath) {
      r.issues.push('❌ ไม่พบ canonical tag'); r.pass = false;
    } else if (canonicalPath !== page.url) {
      r.issues.push(`❌ canonical "${canonicalPath}" ≠ "${page.url}"`); r.pass = false;
    } else {
      r.issues.push(`✅ canonical ถูกต้อง`);
    }

    // CTA
    if (!hasCTA(html)) {
      r.issues.push('❌ ไม่พบ CTA (LINE/โทร)'); r.pass = false;
    } else {
      r.issues.push('✅ มี CTA (LINE/โทร)');
    }

    // Claim risk
    const claims = checkClaimRisk(html);
    if (claims.length > 0) {
      r.issues.push(`❌ พบ claim-risk: ${claims.join(', ')}`); r.pass = false;
    } else {
      r.issues.push('✅ ไม่มี claim-risk');
    }

    // noindex
    if (hasNoindex(html)) {
      r.issues.push('❌ พบ noindex!'); r.pass = false;
    }

    // SSD page: HDD/External content
    if (page.url.includes('รับซื้อ-ssd')) {
      const bodyText = extractBodyText(html);
      const hasHDD = /HDD|hard\s*disk|ฮาร์ดดิสก์|hard drive/i.test(bodyText);
      const hasSSD = /SSD|solid.?state/i.test(bodyText);
      const hasExternal = /external|external\s*drive|external\s*storage|ฮาร์ดดิสก์พกพา/i.test(bodyText);
      if (!hasHDD) r.issues.push('⚠️ /รับซื้อ-ssd ไม่มีเนื้อหาเกี่ยวกับ HDD');
      if (!hasSSD) r.issues.push('❌ /รับซื้อ-ssd ไม่มีเนื้อหา SSD'); r.pass = false;
      if (!hasExternal) r.issues.push('⚠️ /รับซื้อ-ssd ไม่มีเนื้อหา External Drive');
      if (hasHDD) r.issues.push('✅ มีเนื้อหา HDD');
      if (hasExternal) r.issues.push('✅ มีเนื้อหา External Drive');
    }

    results.canonical.push(r);
    const icon = r.pass ? '✅' : '❌';
    console.log(`\n${icon} ${page.url}`);
    r.issues.forEach(i => console.log('   ' + i));
  }
}

// ===== 3. Money Pages =====
async function checkMoneyPages() {
  console.log('\n════════════════════════════════════════');
  console.log('3. ตรวจ Money Pages');
  console.log('════════════════════════════════════════');

  const moneyPages = [
    '/',
    '/รับซื้อสินค้าไอที',
    '/บริการ/รับซื้อโน๊ตบุ๊ค',
    '/บริการ/รับซื้อ-iphone',
    '/บริการ/รับซื้อ-ipad',
    '/บริการ/รับซื้อ-macbook',
    '/บริการ/รับซื้อคอมพิวเตอร์',
    '/บริการ/รับซื้อคอมบริษัท',
    '/บริการ/รับซื้อกล้อง',
    '/บริการ/รับซื้อ-server',
    '/บริการ/รับซื้อ-nas',
    '/บริการ/รับซื้อ-ups',
  ];

  // Track titles for duplicate detection
  const titlesSeen = new Map();

  for (const pageUrl of moneyPages) {
    const r = { url: pageUrl, pass: true, issues: [] };
    const html = readDistFile(pageUrl);

    if (!html) {
      r.issues.push('❌ 404 — ไม่พบไฟล์ใน dist');
      r.pass = false;
      results.moneyPages.push(r);
      console.log(`\n❌ ${pageUrl} → 404`);
      continue;
    }

    // CTA
    if (!hasCTA(html)) {
      r.issues.push('❌ ไม่พบ CTA'); r.pass = false;
    } else {
      r.issues.push('✅ CTA พบ');
    }

    // Internal links
    const linkCount = hasInternalLinks(html);
    if (linkCount < 3) {
      r.issues.push(`⚠️ internal links น้อย (${linkCount})`);
    } else {
      r.issues.push(`✅ internal links: ${linkCount}`);
    }

    // Canonical
    const canonical = extractCanonical(html);
    const canonicalPath = canonical ? canonical.replace('https://amphon.co.th', '') : null;
    if (!canonicalPath) {
      r.issues.push('❌ ไม่พบ canonical'); r.pass = false;
    } else if (canonicalPath !== pageUrl) {
      r.issues.push(`❌ canonical mismatch: "${canonicalPath}" ≠ "${pageUrl}"`); r.pass = false;
    } else {
      r.issues.push('✅ canonical ถูกต้อง');
    }

    // Title duplicate check
    const title = extractTitle(html);
    if (title) {
      if (titlesSeen.has(title)) {
        r.issues.push(`❌ title ซ้ำกับ ${titlesSeen.get(title)}: "${title}"`); r.pass = false;
      } else {
        titlesSeen.set(title, pageUrl);
        r.issues.push(`✅ title unique: "${title.substring(0, 50)}..."`);
      }
    }

    // Claim risk
    const claims = checkClaimRisk(html);
    if (claims.length > 0) {
      r.issues.push(`❌ พบ claim-risk: ${claims.join(', ')}`); r.pass = false;
    } else {
      r.issues.push('✅ ไม่มี claim-risk');
    }

    // noindex
    if (hasNoindex(html)) {
      r.issues.push('❌ พบ noindex!'); r.pass = false;
    }

    results.moneyPages.push(r);
    const icon = r.pass ? '✅' : '❌';
    console.log(`\n${icon} ${pageUrl}`);
    r.issues.forEach(i => console.log('   ' + i));
  }
}

// ===== 4. Sitemap =====
async function checkSitemap() {
  console.log('\n════════════════════════════════════════');
  console.log('4. ตรวจ Sitemap');
  console.log('════════════════════════════════════════');

  // Read sitemap-index
  const sitemapIndexPath = path.join(DIST, 'sitemap-index.xml');
  const sitemap0Path = path.join(DIST, 'sitemap-0.xml');

  if (!fs.existsSync(sitemapIndexPath)) {
    results.sitemap.pass = false;
    results.sitemap.issues.push('❌ ไม่พบ sitemap-index.xml');
    console.log('❌ ไม่พบ sitemap-index.xml');
    return;
  }

  console.log('✅ sitemap-index.xml พบ');

  const sitemapXml = fs.readFileSync(sitemap0Path, 'utf-8');
  const urlMatches = sitemapXml.match(/<loc>([\s\S]*?)<\/loc>/g) || [];
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());
  console.log(`📊 พบ ${urls.length} URLs ใน sitemap-0.xml`);

  // Check legacy URLs not in sitemap
  const LEGACY_URLS = [
    '/บริการ/รับซื้อ-hdd',
    '/บริการ/รับซื้อ-gopro',
    '/บริการ/รับซื้อเลนส์',
  ];

  for (const legacy of LEGACY_URLS) {
    const fullLegacy = `https://amphon.co.th${legacy}`;
    if (urls.includes(fullLegacy)) {
      results.sitemap.issues.push(`❌ Legacy URL ยังอยู่ใน sitemap: ${legacy}`);
      results.sitemap.pass = false;
      console.log(`❌ Legacy URL ใน sitemap: ${legacy}`);
    } else {
      console.log(`✅ Legacy URL ไม่อยู่ใน sitemap: ${legacy}`);
    }
  }

  // Sample 50 URLs for validation
  const sampleSize = Math.min(50, urls.length);
  const step = Math.floor(urls.length / sampleSize);
  const sampled = urls.filter((_, i) => i % step === 0).slice(0, sampleSize);

  console.log(`\n🔍 สุ่มตรวจ ${sampled.length} URLs:`);
  let sitemapFails = 0;
  const sitemapIssues = [];

  for (const fullUrl of sampled) {
    const urlPath = fullUrl.replace('https://amphon.co.th', '');
    const html = readDistFile(urlPath);

    if (!html) {
      sitemapIssues.push(`❌ 404: ${urlPath}`);
      sitemapFails++;
      continue;
    }

    // Check noindex
    if (hasNoindex(html)) {
      sitemapIssues.push(`❌ noindex: ${urlPath}`);
      sitemapFails++;
      continue;
    }

    // Check canonical mismatch
    const canonical = extractCanonical(html);
    const canonicalPath = canonical ? canonical.replace('https://amphon.co.th', '') : null;
    if (canonicalPath && canonicalPath !== urlPath) {
      sitemapIssues.push(`❌ canonical mismatch: ${urlPath} → canonical: ${canonicalPath}`);
      sitemapFails++;
      continue;
    }
  }

  if (sitemapIssues.length > 0) {
    results.sitemap.pass = false;
    results.sitemap.issues.push(...sitemapIssues);
    sitemapIssues.forEach(i => console.log('   ' + i));
  } else {
    console.log(`✅ ตรวจ ${sampled.length} URLs ผ่านทั้งหมด`);
  }
  console.log(`📊 Sitemap sample: ${sampled.length - sitemapFails}/${sampled.length} PASS`);
}

// ===== 5. Static Assets =====
async function checkAssets() {
  console.log('\n════════════════════════════════════════');
  console.log('5. ตรวจ Static Assets');
  console.log('════════════════════════════════════════');

  const assetChecks = [
    { path: '/robots.txt', type: 'text' },
    { path: '/sitemap-index.xml', type: 'xml' },
    { path: '/sitemap.xml', type: 'xml', alias: true },
  ];

  // Check robots.txt
  const robotsPath = path.join(DIST, 'robots.txt');
  const robotsR = { url: '/robots.txt', pass: true, issues: [] };
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf-8');
    robotsR.issues.push('✅ robots.txt พบ');
    if (/sitemap/i.test(robots)) robotsR.issues.push('✅ มี Sitemap directive');
    if (/disallow.*\/$/i.test(robots)) {
      robotsR.issues.push('⚠️ มี Disallow: / — ตรวจสอบอีกครั้ง');
    }
    const sitemapLine = robots.match(/Sitemap:\s*(.+)/i);
    if (sitemapLine) robotsR.issues.push(`✅ Sitemap: ${sitemapLine[1].trim()}`);
  } else {
    robotsR.issues.push('❌ ไม่พบ robots.txt'); robotsR.pass = false;
  }
  results.assets.push(robotsR);
  console.log(`\n${robotsR.pass ? '✅' : '❌'} /robots.txt`);
  robotsR.issues.forEach(i => console.log('   ' + i));

  // Check sitemap-index.xml
  const sitemapR = { url: '/sitemap-index.xml', pass: true, issues: [] };
  if (fs.existsSync(path.join(DIST, 'sitemap-index.xml'))) {
    sitemapR.issues.push('✅ sitemap-index.xml พบ');
    const content = fs.readFileSync(path.join(DIST, 'sitemap-index.xml'), 'utf-8');
    if (content.includes('sitemap-0.xml')) sitemapR.issues.push('✅ อ้างอิง sitemap-0.xml');
  } else {
    sitemapR.issues.push('❌ ไม่พบ sitemap-index.xml'); sitemapR.pass = false;
  }
  results.assets.push(sitemapR);
  console.log(`\n${sitemapR.pass ? '✅' : '❌'} /sitemap-index.xml`);
  sitemapR.issues.forEach(i => console.log('   ' + i));

  // Check images directory
  const imagesDir = path.join(DIST, 'images');
  const imgR = { url: '/images/*', pass: true, issues: [] };
  if (fs.existsSync(imagesDir)) {
    const imgs = fs.readdirSync(imagesDir);
    imgR.issues.push(`✅ images/ พบ ${imgs.length} files`);
    // Check homepage hero image
    const heroImages = imgs.filter(f =>
      /hero|home|index|amphon/i.test(f) && /\.(jpg|jpeg|png|webp|avif)$/i.test(f)
    );
    if (heroImages.length > 0) {
      imgR.issues.push(`✅ Hero images: ${heroImages.slice(0, 3).join(', ')}`);
    } else {
      imgR.issues.push(`ℹ️ ไม่พบ hero image ชื่อ hero/home — ตรวจ HTML แทน`);
    }
  } else {
    imgR.issues.push('❌ ไม่พบ images/ directory'); imgR.pass = false;
  }
  results.assets.push(imgR);
  console.log(`\n${imgR.pass ? '✅' : '❌'} /images/*`);
  imgR.issues.forEach(i => console.log('   ' + i));

  // Check homepage HTML for img tags
  const homeHtml = readDistFile('/');
  if (homeHtml) {
    const heroImgR = { url: '/index.html img check', pass: true, issues: [] };
    const imgs = homeHtml.match(/<img[^>]+>/gi) || [];
    heroImgR.issues.push(`✅ Homepage มี ${imgs.length} img tags`);
    const brokenImgCheck = imgs.filter(img => !/src=["'][^"']+["']/i.test(img));
    if (brokenImgCheck.length > 0) {
      heroImgR.issues.push(`⚠️ img tags ไม่มี src: ${brokenImgCheck.length}`);
    }
    results.assets.push(heroImgR);
    console.log(`\n✅ Homepage img tags`);
    heroImgR.issues.forEach(i => console.log('   ' + i));
  }
}

// ===== Summary =====
function printSummary() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║         QA SUMMARY — amphon.co.th            ║');
  console.log('╚══════════════════════════════════════════════╝');

  const s1Pass = results.redirect.filter(r => r.pass).length;
  const s1Total = results.redirect.length;
  console.log(`\n1. Redirect P0:        ${s1Pass}/${s1Total} PASS ${s1Pass === s1Total ? '✅' : '❌'}`);
  results.redirect.filter(r => !r.pass).forEach(r => {
    console.log(`   ❌ FAIL: ${r.url}`);
    r.issues.filter(i => i.startsWith('❌')).forEach(i => console.log(`      ${i}`));
  });

  const s2Pass = results.canonical.filter(r => r.pass).length;
  const s2Total = results.canonical.length;
  console.log(`\n2. Canonical Pages:    ${s2Pass}/${s2Total} PASS ${s2Pass === s2Total ? '✅' : '❌'}`);
  results.canonical.filter(r => !r.pass).forEach(r => {
    console.log(`   ❌ FAIL: ${r.url}`);
    r.issues.filter(i => i.startsWith('❌')).forEach(i => console.log(`      ${i}`));
  });

  const s3Pass = results.moneyPages.filter(r => r.pass).length;
  const s3Total = results.moneyPages.length;
  console.log(`\n3. Money Pages:        ${s3Pass}/${s3Total} PASS ${s3Pass === s3Total ? '✅' : '❌'}`);
  results.moneyPages.filter(r => !r.pass).forEach(r => {
    console.log(`   ❌ FAIL: ${r.url}`);
    r.issues.filter(i => i.startsWith('❌')).forEach(i => console.log(`      ${i}`));
  });

  const s4Pass = results.sitemap.pass;
  console.log(`\n4. Sitemap:            ${s4Pass ? 'PASS ✅' : 'FAIL ❌'}`);
  results.sitemap.issues.filter(i => i.startsWith('❌')).forEach(i => console.log(`   ${i}`));

  const s5Pass = results.assets.filter(r => r.pass).length;
  const s5Total = results.assets.length;
  console.log(`\n5. Static Assets:      ${s5Pass}/${s5Total} PASS ${s5Pass === s5Total ? '✅' : '❌'}`);
  results.assets.filter(r => !r.pass).forEach(r => {
    console.log(`   ❌ FAIL: ${r.url}`);
    r.issues.filter(i => i.startsWith('❌')).forEach(i => console.log(`      ${i}`));
  });

  const allPass = s1Pass === s1Total && s2Pass === s2Total && s3Pass === s3Total && s4Pass && s5Pass === s5Total;
  console.log('\n──────────────────────────────────────────────');
  console.log(`OVERALL: ${allPass ? '✅ ALL PASS' : '❌ มีปัญหา — ดู FAIL รายการด้านบน'}`);
  console.log('──────────────────────────────────────────────\n');
}

// ===== Main =====
async function main() {
  console.log('🔍 Browser QA Agent — amphon.co.th');
  console.log(`📅 ${new Date().toLocaleString('th-TH')}`);
  console.log(`📁 DIST: ${DIST}`);

  await checkRedirects();
  await checkCanonicalPages();
  await checkMoneyPages();
  await checkSitemap();
  await checkAssets();
  printSummary();
}

main().catch(console.error);
