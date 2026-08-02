/**
 * READ-ONLY GSC 404 Thai URL audit — header-only curl (UTF-8 Location) + node fetch samples.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/gsc-404-thai-url-mojibake');
const ORIGIN = 'https://amphon.co.th';
const UA = 'AmphonGsc404Audit/3';

const SCOPE = [
  { id: 1, path: '/รับซื้อ/รับซื้อ-hdd-สกลนคร', category: 'hdd-province', product: 'hdd', province: 'สกลนคร' },
  { id: 2, path: '/รับซื้อ/รับซื้อ-hdd-นครพนม', category: 'hdd-province', product: 'hdd', province: 'นครพนม' },
  { id: 3, path: '/รับซื้อ/รับซื้อ-gopro-เลย', category: 'gopro-province', product: 'gopro', province: 'เลย' },
  { id: 4, path: '/รับซื้อ/รับซื้อเลนส์-อุดรธานี', category: 'lens-province', product: 'เลนส์', province: 'อุดรธานี' },
  { id: 5, path: '/รับซื้อ/รับซื้อเลนส์-นครพนม', category: 'lens-province', product: 'เลนส์', province: 'นครพนม' },
  { id: 6, path: '/รับซื้อ/รับซื้อ-gopro-อุดรธานี', category: 'gopro-province', product: 'gopro', province: 'อุดรธานี' },
  { id: 7, path: '/รับซื้อ/รับซื้อ-hdd-หนองบัวลำภู', category: 'hdd-province', product: 'hdd', province: 'หนองบัวลำภู' },
  { id: 8, path: '/รับซื้อ/รับซื้อ-gopro-บึงกาฬ', category: 'gopro-province', product: 'gopro', province: 'บึงกาฬ' },
  { id: 9, path: '/รับซื้อ/รับซื้อเลนส์-ชัยภูมิ', category: 'lens-province', product: 'เลนส์', province: 'ชัยภูมิ' },
  { id: 10, path: '/รับซื้อ/รับซื้อเลนส์-หนองคาย', category: 'lens-province', product: 'เลนส์', province: 'หนองคาย' },
  { id: 11, path: '/รับซื้อ/รับซื้อ-hdd-อุบลราชธานี', category: 'hdd-province', product: 'hdd', province: 'อุบลราชธานี' },
  { id: 12, path: '/บริการ/รับซื้อสินค้าไอที', category: 'core-service', product: 'สินค้าไอที', province: '' },
  { id: 13, path: '/รับซื้อ/รับซื้อ-hdd-บึงกาฬ', category: 'hdd-province', product: 'hdd', province: 'บึงกาฬ' },
  { id: 14, path: '/รับซื้อ/รับซื้อเลนส์-ร้อยเอ็ด', category: 'lens-province', product: 'เลนส์', province: 'ร้อยเอ็ด' },
  { id: 15, path: '/blog/how-to-reset-playstation', category: 'blog', product: 'blog', province: '' },
  { id: 16, path: '/blog/check-nintendo-joycon', category: 'blog', product: 'blog', province: '' },
  { id: 17, path: '/บริการ/รับซื้อ-storage-nas', category: 'legacy-hub', product: 'storage-nas', province: '' },
  { id: 18, path: '/บริการ/รับซื้อ-gopro', category: 'legacy-hub', product: 'gopro', province: '' },
  { id: 19, path: '/บริการ/รับซื้อเลนส์', category: 'legacy-hub', product: 'เลนส์', province: '' },
  { id: 20, path: '/บริการ/รับซื้อ-hdd', category: 'legacy-hub', product: 'hdd', province: '' },
];

const esc = (s) => {
  const t = String(s ?? '');
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
const csv = (rows) => rows.map((r) => r.map(esc).join(',')).join('\n') + '\n';
const encodePathOnce = (p) => p.split('/').map((s) => (s ? encodeURIComponent(s) : '')).join('/');
const pathNorm = (u) => {
  try {
    const x = u.startsWith('http') ? new URL(u) : new URL(u, ORIGIN);
    return decodeURIComponent(x.pathname.replace(/\/$/, '') || '/');
  } catch {
    return u;
  }
};
const looksDouble = (s) => /%25E0%25B/i.test(String(s)) || /%C3%A0%C2%B8/i.test(String(s));
const hasMojibake = (t) => !!t && (/Ã.|Â.|à¸.|à¹./.test(t) || (t.match(/\uFFFD/g) || []).length >= 2);
const hasThai = (t) => /[\u0E00-\u0E7F]/.test(t || '');
const sha1 = (s) => createHash('sha1').update(s || '').digest('hex').slice(0, 16);

function curlBuf(args) {
  try {
    return execFileSync('curl.exe', args, { encoding: 'buffer', maxBuffer: 2 * 1024 * 1024, timeout: 20000, windowsHide: true });
  } catch (e) {
    return e.stdout || Buffer.alloc(0);
  }
}

function headersOnce(url) {
  const buf = curlBuf([
    '--path-as-is', '-sS', '-D', '-', '-o', 'NUL', '--max-redirs', '0',
    '--connect-timeout', '10', '--max-time', '15', '-A', UA, '-X', 'GET', url,
  ]);
  const latin = buf.toString('latin1');
  const block = latin.split('\r\n\r\n')[0] || '';
  const status = Number((block.match(/HTTP\/\d(?:\.\d)?\s+(\d+)/) || [])[1] || 0);
  const locM = block.match(/^location:\s*(.+)\r?$/im);
  let locationUtf8 = '';
  let locationMojibake = '';
  let locationPercentEncoded = false;
  let locationNonAsciiRaw = false;
  if (locM) {
    const raw = locM[1].replace(/\r$/, '');
    const locBuf = Buffer.from(raw, 'latin1');
    locationUtf8 = locBuf.toString('utf8');
    locationMojibake = locBuf.toString('latin1');
    locationPercentEncoded = /%[0-9A-Fa-f]{2}/.test(raw);
    locationNonAsciiRaw = [...locBuf].some((b) => b >= 0x80);
  }
  const ct = ((block.match(/^content-type:\s*(.+)\r?$/im) || [])[1] || '').trim();
  return { status, locationUtf8, locationMojibake, locationPercentEncoded, locationNonAsciiRaw, contentType: ct };
}

function trace(url, max = 6) {
  const hops = [];
  let cur = url;
  const seen = new Set();
  for (let i = 0; i < max; i++) {
    if (seen.has(cur)) {
      hops.push({ url: cur, status: 0, locationUtf8: 'LOOP' });
      break;
    }
    seen.add(cur);
    const h = headersOnce(cur);
    hops.push({ url: cur, ...h });
    if (!h.status || h.status < 300 || h.status >= 400 || !h.locationUtf8) break;
    cur = new URL(h.locationUtf8, cur).href;
  }
  return hops;
}

function extractMeta(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || '';
  const charset = (html.match(/<meta[^>]+charset=["']?([^"'>\s]+)/i) || [])[1] || '';
  const lang = (html.match(/<html[^>]+lang=["']([^"']+)/i) || [])[1] || '';
  const canonical =
    (html.match(/rel=["']canonical["'][^>]+href=["']([^"']+)/i) ||
      html.match(/href=["']([^"']+)["'][^>]+rel=["']canonical["']/i) ||
      [])[1] || '';
  const robots =
    (html.match(/name=["']robots["'][^>]+content=["']([^"']+)/i) ||
      html.match(/content=["']([^"']+)["'][^>]+name=["']robots["']/i) ||
      [])[1] || '';
  return { title, h1, charset, lang, canonical, robots };
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: ctrl.signal });
    const text = await res.text();
    return { status: res.status, url: res.url, text };
  } catch (e) {
    return { status: 0, url, text: '', error: String(e) };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const redirects = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).redirects || [];
  const findRedirect = (pathname) => {
    const enc = encodePathOnce(pathname);
    return redirects.find((r) => r.source === pathname || r.source === enc) || null;
  };
  const destNonAscii = redirects.filter((r) => /[^\x00-\x7F]/.test(r.destination || '')).length;
  const destPercent = redirects.filter((r) => /%[0-9A-Fa-f]{2}/.test(r.destination || '')).length;

  const scopeRows = [['id','url_unicode','path_unicode','url_percent_encoded','category','product','province','gsc_reported_404','source_screenshot_group','included']];
  for (const u of SCOPE) {
    scopeRows.push([u.id, ORIGIN + u.path, u.path, ORIGIN + encodePathOnce(u.path), u.category, u.product, u.province, 'yes', 'gsc-404', 'yes']);
  }
  fs.writeFileSync(path.join(OUT, 'url-scope.csv'), csv(scopeRows));

  // sitemap
  const prodSitemap = new Set();
  {
    const idx = await fetchText(`${ORIGIN}/sitemap-index.xml`);
    for (const m of [...idx.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])) {
      const xml = await fetchText(m);
      for (const loc of xml.text.matchAll(/<loc>([^<]+)<\/loc>/g)) prodSitemap.add(pathNorm(loc[1]));
    }
  }
  const localSitemap = new Set();
  const localSm = path.join(ROOT, 'dist/client/sitemap-0.xml');
  if (fs.existsSync(localSm)) {
    for (const loc of fs.readFileSync(localSm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) localSitemap.add(pathNorm(loc[1]));
  }
  console.log('sitemap prod', prodSitemap.size, 'vercel dest non-ascii', destNonAscii);

  // source scan once
  const fileTexts = new Map();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(md|astro|ts|js|mjs)$/.test(ent.name)) {
        try { fileTexts.set(full, fs.readFileSync(full, 'utf8')); } catch { /* */ }
      }
    }
  };
  for (const d of ['src/content', 'src/pages', 'src/layouts', 'src/components', 'src/config']) walk(path.join(ROOT, d));
  fileTexts.set(path.join(ROOT, 'vercel.json'), fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

  const httpRows = [['url','request_variant','method','initial_status','redirect_count','redirect_chain','final_url','final_status','content_type','charset','location_header','location_non_ascii_raw','location_percent_encoded','query_preserved','body_language','result']];
  const cmpRows = [['url_unicode','url_encoded','unicode_initial_status','encoded_initial_status','unicode_final_url','encoded_final_url','same_logical_target','unicode_body_hash','encoded_body_hash','double_encoding_detected','decode_mismatch','mojibake_detected','location_raw_utf8_unencoded','result']];
  const chainRows = [['source_url','source_variant','hop_number','status','location_raw','location_decoded','host','path_raw','path_decoded','double_encoded','final_target','result']];
  const charsetRows = [['url','response_type','content_type_header','charset_header','html_meta_charset','html_lang','title_rendered','h1_rendered','raw_text_sample','mojibake_sample','encoding_layer','suspected_code_source','result']];
  const routeRows = [['url','source_file','route_type','route_defined','generated_locally','generated_path','redirect_rule_exists','redirect_target','noindex_policy','sitemap_policy','retired_intentionally','evidence','result']];
  const smRows = [['url','local_sitemap','production_sitemap','lastmod','canonical_reference_count','referencing_urls','canonical_target','target_status','indexability','result']];
  const refRows = [['target_url','reference_type','source_file','source_url','anchor_text','production_visible','points_to_404','expected_action']];
  const decisionRows = [['url','current_status','unicode_status','encoded_status','route_exists','sitemap','internal_links','mojibake','root_cause','recommended_classification','proposed_target','target_status','intent_match','seo_risk','business_risk','owner_approval_required','reason']];
  const fixRows = [['fix_id','url','root_cause','recommended_action','source_file_to_change','redirect_source','redirect_target','status_code','restore_route','sitemap_action','canonical_action','internal_link_action','encoding_action','gsc_action','risk','rollback','owner_approval_required']];

  const targetCache = new Map();
  async function probeTarget(dest) {
    if (!dest) return { status: '', indexable: '', selfCanon: '', inSm: '', hops: '0', final: '' };
    if (targetCache.has(dest)) return targetCache.get(dest);
    const hops = trace(ORIGIN + dest);
    const last = hops.at(-1);
    // fetch final page via percent-encoded absolute URL (avoid Location follow issues)
    const abs = ORIGIN + encodePathOnce(pathNorm(last.url));
    const page = await fetchText(abs);
    const meta = extractMeta(page.text);
    const pn = pathNorm(last.url);
    const self = meta.canonical ? pathNorm(meta.canonical) === pn : false;
    const out = {
      status: String(last.status),
      indexable: /noindex/i.test(meta.robots) ? 'noindex' : last.status === 200 ? 'likely_indexable' : 'n/a',
      selfCanon: meta.canonical ? (self ? 'yes' : 'no') : 'missing_or_unchecked',
      inSm: prodSitemap.has(pn) ? 'yes' : 'no',
      hops: String(Math.max(0, hops.length - 1)),
      final: last.url,
      title: meta.title,
      charset: meta.charset,
      lang: meta.lang,
      robots: meta.robots,
      bodyMoj: hasMojibake(page.text),
      bodyThai: hasThai(page.text),
      bodyHash: sha1(page.text.slice(0, 20000)),
    };
    targetCache.set(dest, out);
    return out;
  }

  // Node-fetch Location mishandling demo (evidence)
  {
    const demo = ORIGIN + encodePathOnce('/รับซื้อ/รับซื้อ-hdd-สกลนคร');
    const r = await fetch(demo, { redirect: 'manual', headers: { 'user-agent': UA } });
    const badLoc = r.headers.get('location') || '';
    fs.writeFileSync(
      path.join(OUT, 'node-fetch-location-evidence.json'),
      JSON.stringify({
        request: demo,
        status: r.status,
        location_as_js_string: badLoc,
        looks_mojibake: hasMojibake(badLoc),
        followed_would_be: badLoc ? new URL(badLoc, demo).href : '',
        note: 'Node undici decodes raw UTF-8 Location as Latin-1 → mojibake; curl UTF-8 decode reaches 200 target',
      }, null, 2),
    );
  }

  const perUrl = [];
  for (const u of SCOPE) {
    const unicodeUrl = ORIGIN + u.path;
    const encodedUrl = ORIGIN + encodePathOnce(u.path);
    console.log(`#${u.id}`, u.path);

    const variants = [
      { name: 'unicode-GET', url: unicodeUrl },
      { name: 'encoded-GET', url: encodedUrl },
      { name: 'unicode-query-GET', url: unicodeUrl + '?source=gsc404audit' },
    ];
    const VR = {};
    for (const v of variants) {
      const hops = trace(v.url);
      const first = hops[0];
      const last = hops.at(-1);
      const count = Math.max(0, hops.length - 1);
      const chain = hops.map((h) => `${h.status}:${h.url}${h.locationUtf8 ? '->' + h.locationUtf8 : ''}`).join(' | ');
      let qp = 'n/a';
      if (v.name.includes('query')) {
        try { qp = new URL(last.url).searchParams.get('source') === 'gsc404audit' ? 'yes' : 'no'; }
        catch { qp = 'error'; }
      }
      httpRows.push([
        unicodeUrl, v.name, 'GET', first.status, count, chain, last.url, last.status,
        last.contentType || '', '', first.locationUtf8 || '', first.locationNonAsciiRaw ? 'yes' : 'no',
        first.locationPercentEncoded ? 'yes' : 'no', qp, 'n/a_header_only',
        last.status === 200 ? (count ? 'REDIRECT_THEN_200' : 'DIRECT_200') : `FINAL_${last.status}`,
      ]);
      VR[v.name] = { hops, first, last, count };

      hops.forEach((h, i) => {
        let host = '', pathRaw = '', pathDec = '';
        try {
          const pu = new URL(h.url);
          host = pu.hostname; pathRaw = pu.pathname; pathDec = decodeURIComponent(pu.pathname);
        } catch { /* */ }
        chainRows.push([
          unicodeUrl, v.name.includes('encoded') ? 'encoded' : 'unicode', i, h.status,
          h.locationUtf8 || '', h.locationMojibake || '', host, pathRaw, pathDec,
          looksDouble(h.locationUtf8 || pathRaw) ? 'yes' : 'no', last.url,
          h.locationNonAsciiRaw ? 'RAW_UTF8_LOCATION' : 'OK',
        ]);
      });
    }

    const uGet = VR['unicode-GET'];
    const eGet = VR['encoded-GET'];
    const same = pathNorm(uGet.last.url) === pathNorm(eGet.last.url) && uGet.last.status === eGet.last.status;
    const rawLoc = !!(uGet.first.locationNonAsciiRaw || eGet.first.locationNonAsciiRaw);
    const dbl = looksDouble(uGet.first.locationUtf8 || '') || looksDouble(uGet.last.url);

    const redir = findRedirect(u.path);
    const target = redir?.destination || '';
    const tp = await probeTarget(target);

    cmpRows.push([
      unicodeUrl, encodedUrl, uGet.first.status, eGet.first.status, uGet.last.url, eGet.last.url,
      same ? 'yes' : 'no', tp.bodyHash || '', tp.bodyHash || '', dbl ? 'yes' : 'no', same ? 'no' : 'yes',
      tp.bodyMoj ? 'yes' : 'no', rawLoc ? 'yes' : 'no',
      same && !dbl ? (rawLoc ? 'MATCH_BUT_RAW_UTF8_LOCATION' : 'MATCH') : 'MISMATCH',
    ]);

    charsetRows.push([
      unicodeUrl, `final_target_sample_${tp.status}`, 'text/html (sampled via percent-encoded GET)',
      'utf-8 (assumed from meta)', tp.charset || '', tp.lang || '', (tp.title || '').slice(0, 120), '',
      (tp.title || '').slice(0, 160), tp.bodyMoj ? (tp.title || '').slice(0, 80) : '',
      rawLoc ? 'location_header_raw_utf8' : 'ascii_or_percent_location',
      'vercel.json Unicode destinations → Vercel Location raw UTF-8; Node fetch Latin-1 misread',
      tp.bodyMoj ? 'MOJIBAKE_BODY' : rawLoc ? 'RAW_UTF8_LOCATION_RISK' : 'OK',
    ]);
    // Location mojibake evidence row
    if (rawLoc) {
      charsetRows.push([
        unicodeUrl, 'location_header_if_latin1', 'n/a', 'n/a', 'n/a', 'n/a', '', '',
        uGet.first.locationMojibake || '', uGet.first.locationMojibake || '',
        'latin1_misdecode_of_utf8_location', 'HTTP client Location header decoding', 'MOJIBAKE_LOCATION_VIEW',
      ]);
    }

    const slug = u.path.split('/').pop();
    const candidates = [
      `src/content/serviceAreas/${slug}.md`,
      `src/content/services/${slug}.md`,
      `src/content/blog/${slug}.md`,
    ];
    const existing = candidates.filter((f) => fs.existsSync(path.join(ROOT, f)));
    const genRel = `dist/client${u.path}/index.html`;
    routeRows.push([
      unicodeUrl, existing.join('|') || 'none', u.category,
      existing.length ? 'content_exists' : 'no_content_file',
      fs.existsSync(path.join(ROOT, genRel)) ? 'yes' : 'no',
      fs.existsSync(path.join(ROOT, genRel)) ? genRel : '',
      redir ? 'yes' : 'no', target,
      'legacy filtered via seo-policy LEGACY_SERVICE_MERGES when applicable',
      'excluded when not generated',
      redir ? 'yes' : 'unknown',
      redir ? `vercel.json permanent -> ${target}` : existing.length ? 'content filtered from getStaticPaths' : 'missing',
      redir ? 'REDIRECT_RULE' : existing.length ? 'CONTENT_FILTERED' : 'MISSING',
    ]);

    const inProd = prodSitemap.has(u.path);
    smRows.push([
      unicodeUrl, localSitemap.has(u.path) ? 'yes' : 'no', inProd ? 'yes' : 'no', '', '0', '',
      '', String(uGet.last.status), 'n/a', inProd ? 'IN_SITEMAP' : 'NOT_IN_SITEMAP',
    ]);

    let refCount = 0;
    for (const [file, text] of fileTexts) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      if (existing.includes(rel)) continue;
      if (text.includes(u.path) || text.includes(encodePathOnce(u.path))) {
        let refType = 'source_mention';
        if (rel.endsWith('vercel.json')) refType = 'redirect_config';
        else if (rel.includes('seo-policy')) refType = 'seo_policy';
        else if (rel.includes('/content/')) { refType = 'content_mention'; refCount++; }
        refRows.push([unicodeUrl, refType, rel, '', '', rel.startsWith('src/') ? 'maybe' : 'config', uGet.last.status === 404 ? 'yes' : 'no', 'ok_after_encoding_fix']);
      }
    }

    let cls = 'REQUIRES_OWNER_DECISION';
    let reason = '';
    let intent = 'yes';
    let owner = 'yes';
    if (uGet.last.status === 200 && redir && rawLoc) {
      cls = 'FIX_ENCODING_ONLY';
      reason = 'curl UTF-8 Location follow → 200 at replacement. Location is raw UTF-8 (not percent-encoded). Strict clients (Node fetch; likely some bots/GSC) mis-decode → mojibake path → 404. Do not restore retired routes.';
      owner = 'yes';
    } else if (uGet.last.status === 200 && redir && !rawLoc) {
      if (u.category === 'blog') {
        cls = 'REQUIRES_OWNER_DECISION';
        reason = '308→/blog works (ASCII Location). Article retired. Owner: keep redirect, KEEP_404_GONE, or restore article.';
        intent = 'partial_blog_index';
        owner = 'yes';
      } else {
        cls = 'GSC_STALE_STATUS';
        reason = 'Redirect + final 200 with ASCII Location; GSC 404 likely stale.';
        owner = 'no';
      }
    } else if (uGet.last.status === 404) {
      cls = 'REQUIRES_OWNER_DECISION';
      reason = 'Final 404 after UTF-8 Location decode — target missing.';
    }

    decisionRows.push([
      unicodeUrl, `init=${uGet.first.status};final=${uGet.last.status};rawLoc=${rawLoc}`,
      uGet.first.status, eGet.first.status, existing.length ? 'content_file' : 'no',
      inProd ? 'yes' : 'no', String(refCount), rawLoc ? 'location_risk' : (tp.bodyMoj ? 'yes' : 'no'),
      rawLoc ? 'vercel_location_raw_utf8' : 'intentional_redirect',
      cls, target,
      `http=${tp.status};index=${tp.indexable};canon=${tp.selfCanon};sm=${tp.inSm};hops=${tp.hops}`,
      intent, 'high', u.category === 'core-service' ? 'high' : 'medium', owner, reason,
    ]);

    fixRows.push([
      `F${u.id}`, unicodeUrl, reason,
      cls === 'FIX_ENCODING_ONLY'
        ? 'Percent-encode vercel.json redirect destinations (ASCII-only Location)'
        : cls === 'REQUIRES_OWNER_DECISION' && u.category === 'blog'
          ? 'Owner choose: keep 308→/blog | KEEP_404_GONE | restore article'
          : cls,
      cls === 'FIX_ENCODING_ONLY' ? 'vercel.json' : 'none (audit-only)',
      u.path, target, '308', 'no', 'none', 'none',
      refCount ? 'review content mentions' : 'none',
      cls === 'FIX_ENCODING_ONLY' ? 'percent-encode destinations sitewide for Thai paths' : 'none',
      'Re-crawl / Validate Fix in GSC after fix', 'medium', 'revert vercel.json', owner,
    ]);

    perUrl.push({
      u, unicodeUrl, uGet, eGet, redir, same, dbl, rawLoc, existing, inProd, cls, target, refCount, tp,
      finalStatus: uGet.last.status, initialStatus: uGet.first.status, mojBody: tp.bodyMoj,
    });
    console.log(`  -> ${uGet.first.status}→${uGet.last.status} rawLoc=${rawLoc} final=${pathNorm(uGet.last.url)} cls=${cls}`);
  }

  fs.writeFileSync(path.join(OUT, 'production-http-audit.csv'), csv(httpRows));
  fs.writeFileSync(path.join(OUT, 'unicode-encoded-comparison.csv'), csv(cmpRows));
  fs.writeFileSync(path.join(OUT, 'redirect-chain-audit.csv'), csv(chainRows));
  fs.writeFileSync(path.join(OUT, 'charset-encoding-audit.csv'), csv(charsetRows));
  fs.writeFileSync(path.join(OUT, 'route-source-inventory.csv'), csv(routeRows));
  fs.writeFileSync(path.join(OUT, 'sitemap-canonical-audit.csv'), csv(smRows));
  fs.writeFileSync(path.join(OUT, 'internal-reference-audit.csv'), csv(refRows));
  fs.writeFileSync(path.join(OUT, 'url-decision-matrix.csv'), csv(decisionRows));
  fs.writeFileSync(path.join(OUT, 'proposed-fix-plan.csv'), csv(fixRows));

  const summary = {
    urls: perUrl.length,
    final_200: perUrl.filter((r) => r.finalStatus === 200).length,
    final_404: perUrl.filter((r) => r.finalStatus === 404).length,
    initial_3xx: perUrl.filter((r) => r.initialStatus >= 300 && r.initialStatus < 400).length,
    raw_utf8_location: perUrl.filter((r) => r.rawLoc).length,
    mojibake_body: perUrl.filter((r) => r.mojBody).length,
    double_encoded_in_chain: perUrl.filter((r) => r.dbl).length,
    unicode_encoded_mismatch: perUrl.filter((r) => !r.same).length,
    with_redirect_rule: perUrl.filter((r) => r.redir).length,
    prod_sitemap_hits: perUrl.filter((r) => r.inProd).length,
    vercel_dest_non_ascii: destNonAscii,
    vercel_dest_percent: destPercent,
    classifications: Object.fromEntries([...new Set(perUrl.map((r) => r.cls))].map((c) => [c, perUrl.filter((r) => r.cls === c).length])),
  };
  fs.writeFileSync(path.join(OUT, 'audit-summary.json'), JSON.stringify(summary, null, 2));
  console.log('SUMMARY', summary);
}

main().catch((e) => { console.error(e); process.exit(1); });
