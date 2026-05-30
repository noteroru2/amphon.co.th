# SEO / JSON-LD Checklist — amphon.co.th

ใช้ checklist นี้ก่อนและหลังลงเนื้อหาจริง เพื่อยืนยันว่า structured data, canonical URL และ social preview ถูกต้องครบ

## ก่อนทดสอบ

1. รัน build และ validation ในเครื่อง:
   ```bash
   npm run check:seo
   ```
2. Deploy ไป staging/production (Vercel) แล้วใช้ URL จริง `https://amphon.co.th` ในเครื่องมือด้านล่าง

---

## 1. Rich Results Test (Google)

**URL:** https://search.google.com/test/rich-results

| หน้า | URL ที่ทดสอบ | ผลลัพธ์ที่คาดหวัง | ผ่าน |
|------|--------------|-------------------|------|
| หน้าแรก | `/` | Organization, LocalBusiness, OfferCatalog | ☐ |
| บริการ | `/บริการ/[slug]` | Service, FAQPage (ถ้ามี FAQ) | ☐ |
| พื้นที่ | `/พื้นที่ให้บริการ/[slug]` | Place, FAQPage (ถ้ามี) | ☐ |
| รับซื้อ+พื้นที่ | `/รับซื้อ/[slug]` | Service, FAQPage (ถ้ามี) | ☐ |
| บทความ | `/blog/[slug]` | BlogPosting | ☐ |
| Hub บริการ | `/รับซื้อสินค้าไอที` | CollectionPage + OfferCatalog | ☐ |
| Hub พื้นที่ | `/พื้นที่ให้บริการ` | CollectionPage + ItemList | ☐ |
| Hub บล็อก | `/blog` | CollectionPage + ItemList | ☐ |

**เช็กเพิ่ม:**
- [ ] ไม่มี error สีแดง
- [ ] FAQ แสดงเฉพาะหน้าที่มี FAQ บนหน้าเว็บจริง
- [ ] ไม่มี SearchAction ใน WebSite

---

## 2. Schema Markup Validator (Schema.org)

**URL:** https://validator.schema.org/

ทดสอบ URL เดียวกับ Rich Results Test อย่างน้อย 5 หน้าประเภทต่างกัน:

- [ ] `@graph` มี entity ครบ (Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList)
- [ ] `@id` ไม่มี trailing slash ก่อน `#` (เช่น `…/slug#webpage` ไม่ใช่ `…/slug/#webpage`)
- [ ] `inLanguage` = `th-TH` ใน WebPage, Service, BlogPosting, CollectionPage
- [ ] `primaryImageOfPage` เป็น absolute URL
- [ ] logo / image ใน Organization และ LocalBusiness เป็น absolute URL
- [ ] `WebPage.mainEntity` ชี้ entity หลักของหน้านั้น (#service, #place, #article, #itemlist, #offercatalog)

---

## 3. Google Search Console — URL Inspection

**URL:** https://search.google.com/search-console

หลัง verify domain แล้ว:

- [ ] ส่ง sitemap: `https://amphon.co.th/sitemap-index.xml`
- [ ] Inspect URL หน้าแรก → Canonical ตรง `https://amphon.co.th` (ไม่มี trailing slash)
- [ ] Inspect หน้า dynamic 1 หน้าต่อ collection → Google เลือก canonical ที่เรากำหนด
- [ ] ตรวจ `robots.txt`: `https://amphon.co.th/robots.txt`
- [ ] ไม่มี noindex บนหน้าที่ต้องการ index

---

## 4. Facebook Sharing Debugger

**URL:** https://developers.facebook.com/tools/debug/

| หน้า | เช็ก | ผ่าน |
|------|------|------|
| หน้าแรก | og:title, og:description, og:image (1200×630) | ☐ |
| บริการ 1 หน้า | og:url = canonical | ☐ |
| บทความ 1 หน้า | og:type = article | ☐ |

**เช็กเพิ่ม:**
- [ ] `og:image` โหลดได้ (default: `/images/og-default.webp`)
- [ ] กด "Scrape Again" หลังอัปเดต OG image
- [ ] ไม่ใช้ favicon เป็น og:image

---

## 5. LINE Link Preview

LINE ไม่มี debugger แยก — ทดสอบส่งลิงก์ในแชทส่วนตัว (หรือ LINE Official ถ้ามี):

| หน้า | เช็ก | ผ่าน |
|------|------|------|
| หน้าแรก | แสดง title + description + thumbnail | ☐ |
| บริการ 1 หน้า | thumbnail ตรง og:image | ☐ |
| บทความ 1 หน้า | title/description ไม่ซ้ำหน้าอื่น | ☐ |

**หมายเหตุ:** LINE cache preview นาน — ถ้าเปลี่ยน OG image อาจต้องรอหรือเพิ่ม query string ชั่วคราวเพื่อ bust cache

---

## 6. Automated checks (local)

```bash
npm run check:seo
```

Script ตรวจอัตโนมัติ:
- JSON-LD 1 block / `@graph` ต่อหน้า
- canonical = og:url = URL format เดียวกัน (ไม่มี trailing slash)
- H1 เพียง 1 ตัว
- title และ description ไม่ซ้ำข้ามหน้า
- FAQ schema ตรงกับ FAQ ที่ render บนหน้า
- primaryImageOfPage และ media URL เป็น absolute

---

## ก่อน go-live

- [ ] อัปเดตข้อมูลจริงใน `src/config/site.ts` (โทร, ที่อยู่, Line, Facebook)
- [ ] แทนที่ OG SVG placeholder ด้วย JPG/WebP 1200×630 จริง (หรือรัน `npm run og:generate` แล้วแก้ไฟล์ใน `public/images/og/`)
- [ ] ยืนยัน `date` / `updated` ใน frontmatter ทุกหน้า content
- [ ] รัน checklist ทั้ง 5 เครื่องมือด้านบนอีกครั้งหลัง deploy production
