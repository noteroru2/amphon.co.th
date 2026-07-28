import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import {
  buildTrustworthyLastmodMap,
  dateOnlySitemapIntegration,
  normalizeSitemapPath,
  resolveTrustworthyLastmod,
  serializeTrustworthyLastmod,
} from './lib/trustworthy-sitemap-lastmod.mjs';

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-lastmod-'));
  for (const collection of ['areas', 'blog', 'serviceAreas', 'services']) {
    fs.mkdirSync(path.join(root, collection), { recursive: true });
  }
  return root;
}

function writeContent(root, collection, name, frontmatter) {
  fs.writeFileSync(
    path.join(root, collection, `${name}.md`),
    `---\n${frontmatter}\n---\n\nTest content\n`,
    'utf8',
  );
}

test('uses updated before date and falls back to date', () => {
  assert.equal(
    resolveTrustworthyLastmod({
      date: '2026-06-01',
      updated: '2026-07-27',
      today: '2026-07-28',
    }),
    '2026-07-27',
  );
  assert.equal(
    resolveTrustworthyLastmod({ date: '2026-06-01', today: '2026-07-28' }),
    '2026-06-01',
  );
  assert.equal(resolveTrustworthyLastmod({ today: '2026-07-28' }), undefined);
});

test('rejects malformed, future and chronologically invalid dates', () => {
  assert.throws(
    () => resolveTrustworthyLastmod({ date: '2026-7-01', today: '2026-07-28' }),
    /YYYY-MM-DD/u,
  );
  assert.throws(
    () =>
      resolveTrustworthyLastmod({
        date: '2026-07-20',
        updated: '2026-07-19',
        today: '2026-07-28',
      }),
    /older than date/u,
  );
  assert.throws(
    () => resolveTrustworthyLastmod({ date: '2026-07-29', today: '2026-07-28' }),
    /future/u,
  );
});

test('maps Thai content URLs and omits draft or undated entries', () => {
  const root = fixtureRoot();
  writeContent(
    root,
    'blog',
    'phone',
    'slug: "ขายโทรศัพท์มือสองใกล้ฉัน"\ndate: "2026-07-20"\nupdated: "2026-07-27"',
  );
  writeContent(root, 'services', 'draft', 'slug: "ไม่เผยแพร่"\ndate: "2026-07-20"\ndraft: true');
  writeContent(root, 'areas', 'undated', 'slug: "ไม่มีวันที่"');

  const { lastmodByPath } = buildTrustworthyLastmodMap({
    contentRoot: root,
    today: '2026-07-28',
  });

  assert.equal(lastmodByPath.size, 1);
  assert.equal(lastmodByPath.get('/blog/ขายโทรศัพท์มือสองใกล้ฉัน'), '2026-07-27');
  assert.equal(
    normalizeSitemapPath(
      'https://amphon.co.th/blog/%E0%B8%82%E0%B8%B2%E0%B8%A2%E0%B9%82%E0%B8%97%E0%B8%A3%E0%B8%A8%E0%B8%B1%E0%B8%9E%E0%B8%97%E0%B9%8C',
    ),
    '/blog/ขายโทรศัพท์',
  );
});

test('serialization leaves URLs without a trustworthy source unchanged', () => {
  const lastmodByPath = new Map([['/blog/ทดสอบ', '2026-07-27']]);
  const dated = serializeTrustworthyLastmod(
    { url: 'https://amphon.co.th/blog/ทดสอบ', links: [] },
    lastmodByPath,
  );
  const staticPage = serializeTrustworthyLastmod(
    { url: 'https://amphon.co.th/about', links: [] },
    lastmodByPath,
  );

  assert.equal(dated.lastmod, '2026-07-27');
  assert.equal(staticPage.lastmod, undefined);
});

test('content map is deterministic and docs-only files do not affect it', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-lastmod-workspace-'));
  const root = path.join(workspace, 'src', 'content');
  for (const collection of ['areas', 'blog', 'serviceAreas', 'services']) {
    fs.mkdirSync(path.join(root, collection), { recursive: true });
  }
  writeContent(root, 'services', 'camera', 'slug: "รับซื้อกล้อง"\ndate: "2026-06-01"');

  const first = buildTrustworthyLastmodMap({ contentRoot: root, today: '2026-07-28' });
  fs.mkdirSync(path.join(workspace, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(workspace, 'docs', 'report-only.md'), '# Report only\n', 'utf8');
  const second = buildTrustworthyLastmodMap({ contentRoot: root, today: '2026-07-28' });

  assert.deepEqual([...first.lastmodByPath], [...second.lastmodByPath]);
});

test('date-only integration removes generated midnight timestamps', () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-sitemap-output-'));
  const sitemapPath = path.join(output, 'sitemap-0.xml');
  fs.writeFileSync(
    sitemapPath,
    '<urlset><url><loc>https://amphon.co.th/blog/test</loc><lastmod>2026-07-27T00:00:00.000Z</lastmod></url></urlset>',
    'utf8',
  );

  const integration = dateOnlySitemapIntegration();
  integration.hooks['astro:build:done']({
    dir: pathToFileURL(`${output}${path.sep}`),
    logger: { info() {} },
  });

  assert.match(fs.readFileSync(sitemapPath, 'utf8'), /<lastmod>2026-07-27<\/lastmod>/u);
});

test('repository content produces a trustworthy map without editing frontmatter', () => {
  const { lastmodByPath, collectionCounts } = buildTrustworthyLastmodMap();
  assert.equal(lastmodByPath.size, 1257);
  assert.deepEqual(collectionCounts, {
    areas: { files: 32, included: 32 },
    blog: { files: 50, included: 50 },
    serviceAreas: { files: 1020, included: 1020 },
    services: { files: 156, included: 155 },
  });
});
