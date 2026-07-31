# Batch 2 Baseline

- **Main / Base SHA:** `00a117edd66c515e713d07599e352b3fe2ca4024`
- **Production sitemap:** https://amphon.co.th/sitemap-index.xml → `sitemap-0.xml`
- **Production sitemap count ก่อนแก้:** **1,183**
- **Batch 1 status:** F-01 CLOSED; legacy redirect sources ไม่อยู่ใน sitemap

## Sitemap system (ปัจจุบัน)

- Generator: `@astrojs/sitemap` ใน `astro.config.mjs`
- Filter: `shouldIncludeInSitemap()` จาก `scripts/lib/sitemap-inclusion.mjs` (หลัง Batch 2)
- Lastmod: `scripts/lib/trustworthy-sitemap-lastmod.mjs` + `dateOnlySitemapIntegration()` — **ไม่แตะใน Batch นี้**
- Host: `https://amphon.co.th`, `trailingSlash: 'never'`
- Output: sitemap index + `sitemap-0.xml`

## F-02

| รายการ | ค่า |
|---|---|
| URL | `/บริการ/รับซื้อสินค้าไอทีบริษัท` |
| Production HTTP | **200** |
| ใน sitemap ก่อนแก้ | **ไม่มี** |
| สาเหตุ | `pathname.includes('/บริการ/รับซื้อสินค้าไอที')` ตัด substring กว้างเกิน — ตั้งใจตัด hub redirect `/บริการ/รับซื้อสินค้าไอที` แต่ไปตัด sibling `...บริษัท` ด้วย |
| Indexable / self-canonical | ใช่ (audit + content collection service page) |

## F-03

| รายการ | ค่า |
|---|---|
| URL | `/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี` |
| Production HTTP | **200** |
| ใน sitemap ก่อนแก้ | **ไม่มี** |
| สาเหตุ | exclusion แบบ exact ใน filter เดิม (`pathname !== '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี'`) ทั้งที่หน้ายัง indexable + self-canonical |
| การตัดสินใจ Batch นี้ | **ใส่กลับเข้า sitemap** เพื่อเลิก conflict (ไม่เปลี่ยน noindex/canonical) |

## Filter logic เดิม (ก่อนแก้)

```js
!pathname.includes('/404') &&
!pathname.includes('/บริการ/รับซื้อสินค้าไอที') &&  // ← F-02 false positive
pathname !== '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี' && // ← F-03
pathname !== '/บริการ/รับซื้อ-gopro' &&
pathname !== '/บริการ/รับซื้อ-hdd' &&
pathname !== '/บริการ/รับซื้อเลนส์' &&
pathname !== '/บริการ/รับซื้อ-storage-nas' &&
!sitemapBlockedPrefixes.some((prefix) => pathname.includes(prefix))
```
