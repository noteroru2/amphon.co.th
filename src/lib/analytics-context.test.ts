import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAnalyticsContext } from './analytics-context.ts';
import {
  BLOCKED_PARAM_KEYS,
  classifyCtaHref,
  isAllowedAnalyticsEvent,
  sanitizeAnalyticsParams,
} from './analytics.ts';

test('home taxonomy', () => {
  const ctx = resolveAnalyticsContext('/');
  assert.equal(ctx.page_type, 'home');
  assert.equal(ctx.service_category, 'multi_service');
  assert.equal(ctx.province, 'national');
});

test('national phone', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อโทรศัพท์มือสอง');
  assert.equal(ctx.page_type, 'service_national');
  assert.equal(ctx.service_category, 'phone');
  assert.equal(ctx.province, 'national');
});

test('iphone brand', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อ-iphone');
  assert.equal(ctx.page_type, 'service_brand');
  assert.equal(ctx.service_category, 'iphone');
  assert.equal(ctx.province, 'national');
});

test('tablet national', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อแท็บเล็ต');
  assert.equal(ctx.page_type, 'service_national');
  assert.equal(ctx.service_category, 'tablet');
});

test('ipad brand', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อ-ipad');
  assert.equal(ctx.page_type, 'service_brand');
  assert.equal(ctx.service_category, 'ipad');
});

test('notebook national', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อโน๊ตบุ๊ค');
  assert.equal(ctx.page_type, 'service_national');
  assert.equal(ctx.service_category, 'notebook');
});

test('macbook brand', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อ-macbook');
  assert.equal(ctx.page_type, 'service_brand');
  assert.equal(ctx.service_category, 'macbook');
});

test('computer national', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อคอมพิวเตอร์');
  assert.equal(ctx.page_type, 'service_national');
  assert.equal(ctx.service_category, 'computer');
});

test('gaming specialist', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อ-gaming-pc');
  assert.equal(ctx.page_type, 'service_specialist');
  assert.equal(ctx.service_category, 'gaming_pc');
});

test('ram specialist', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อแรม');
  assert.equal(ctx.page_type, 'service_specialist');
  assert.equal(ctx.service_category, 'ram');
});

test('corporate parent', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อสินค้าไอทีบริษัท');
  assert.equal(ctx.page_type, 'corporate_parent');
  assert.equal(ctx.service_category, 'corporate_it');
  assert.equal(ctx.lead_type, 'corporate');
});

test('bulk computer', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อคอมยกล็อต');
  assert.equal(ctx.page_type, 'bulk_service');
  assert.equal(ctx.service_category, 'bulk_computer');
  assert.equal(ctx.lead_type, 'bulk');
});

test('server network', () => {
  const ctx = resolveAnalyticsContext('/บริการ/รับซื้อ-server-network');
  assert.equal(ctx.page_type, 'service_specialist');
  assert.equal(ctx.service_category, 'server_network');
  assert.equal(ctx.lead_type, 'infrastructure');
});

test('phuket area hub', () => {
  const ctx = resolveAnalyticsContext('/พื้นที่ให้บริการ/ภูเก็ต');
  assert.equal(ctx.page_type, 'area_hub');
  assert.equal(ctx.province, 'ภูเก็ต');
});

test('hatyai city hub uses Songkhla province', () => {
  const ctx = resolveAnalyticsContext('/พื้นที่ให้บริการ/หาดใหญ่');
  assert.equal(ctx.page_type, 'city_hub');
  assert.equal(ctx.province, 'สงขลา');
  assert.notEqual(ctx.province, 'หาดใหญ่');
});

test('local notebook khon kaen', () => {
  const ctx = resolveAnalyticsContext('/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น');
  assert.equal(ctx.page_type, 'service_local');
  assert.equal(ctx.service_category, 'notebook');
  assert.equal(ctx.province, 'ขอนแก่น');
});

test('core routes are not page_type=other', () => {
  const paths = [
    '/',
    '/บริการ/รับซื้อโทรศัพท์มือสอง',
    '/บริการ/รับซื้อ-iphone',
    '/บริการ/รับซื้อแท็บเล็ต',
    '/บริการ/รับซื้อ-ipad',
    '/บริการ/รับซื้อโน๊ตบุ๊ค',
    '/บริการ/รับซื้อ-macbook',
    '/บริการ/รับซื้อคอมพิวเตอร์',
    '/บริการ/รับซื้อ-gaming-pc',
    '/บริการ/รับซื้อแรม',
    '/บริการ/รับซื้อสินค้าไอทีบริษัท',
    '/บริการ/รับซื้อคอมยกล็อต',
    '/บริการ/รับซื้อ-server-network',
    '/พื้นที่ให้บริการ/ภูเก็ต',
    '/พื้นที่ให้บริการ/หาดใหญ่',
    '/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น',
  ];
  for (const path of paths) {
    assert.notEqual(resolveAnalyticsContext(path).page_type, 'other', path);
  }
});

test('classify LINE and phone and maps', () => {
  assert.deepEqual(classifyCtaHref('https://line.me/ti/p/~@webuy'), {
    cta_type: 'line',
    destination: 'line',
    contact_method: 'line',
  });
  assert.deepEqual(classifyCtaHref('tel:+66642579353'), {
    cta_type: 'phone',
    destination: 'phone',
    contact_method: 'phone',
  });
  const maps = classifyCtaHref('https://maps.app.goo.gl/krv97o14jPTRrnpW8');
  assert.equal(maps?.cta_type, 'maps');
  assert.equal(maps?.destination, 'maps');
  assert.equal(maps?.contact_method, undefined);
});

test('internal links are not CTAs', () => {
  assert.equal(classifyCtaHref('/บริการ/รับซื้อโน๊ตบุ๊ค'), null);
  assert.equal(classifyCtaHref('https://amphon.co.th/blog'), null);
});

test('facebook page is cta without contact_intent method', () => {
  const fb = classifyCtaHref('https://www.facebook.com/Amphontrading');
  assert.equal(fb?.cta_type, 'facebook');
  assert.equal(fb?.contact_method, undefined);
});

test('sanitize strips PII and URLs', () => {
  const clean = sanitizeAnalyticsParams({
    cta_type: 'line',
    phone_number: '0812345678',
    href: 'https://line.me/ti/p/~@webuy?x=1',
    email: 'a@b.com',
    destination: 'line',
    free_text: 'hello',
    page_path: '/x',
  });
  assert.equal(clean.cta_type, 'line');
  assert.equal(clean.destination, 'line');
  assert.equal(clean.phone_number, undefined);
  assert.equal(clean.href, undefined);
  assert.equal(clean.email, undefined);
  assert.equal(clean.page_path, undefined);
  for (const key of BLOCKED_PARAM_KEYS) {
    assert.equal(clean[key], undefined);
  }
});

test('only cta_click and contact_intent are allowed events', () => {
  assert.equal(isAllowedAnalyticsEvent('cta_click'), true);
  assert.equal(isAllowedAnalyticsEvent('contact_intent'), true);
  assert.equal(isAllowedAnalyticsEvent('generate_lead'), false);
  assert.equal(isAllowedAnalyticsEvent('purchase'), false);
});
