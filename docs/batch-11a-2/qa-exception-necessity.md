# QA Exception Necessity (Batch 11A.2)

---

## 1. Exceptions added in Batch 11A

### 1.1 In `scripts/validate-seo.mjs`:
```javascript
if (
  rel === 'บริการ/รับซื้อ-gopro/index.html' ||
  rel === 'บริการ/รับซื้อ-hdd/index.html' ||
  rel === 'บริการ/รับซื้อเลนส์/index.html' ||
  rel === 'บริการ/รับซื้อ-storage-nas/index.html'
) {
  continue;
}
```

### 1.2 In `scripts/check-duplicate-headings.mjs`:
```javascript
if (
  pathname.includes('/บริการ/รับซื้อ-gopro') ||
  pathname.includes('/บริการ/รับซื้อ-hdd') ||
  pathname.includes('/บริการ/รับซื้อเลนส์') ||
  pathname.includes('/บริการ/รับซื้อ-storage-nas')
) {
  continue;
}
```

---

## 2. Necessity Check
- **ความจำเป็นหลัง Revert Fallback:** หากทำการลบไฟล์ Astro fallback เหล่านี้ออก ตัวไฟล์ HTML จะไม่ถูกสร้างขึ้นมาในไดเรกทอรี `dist/` ส่งผลให้ Exception ทั้งหมดข้างต้นกลายเป็น **ความซ้ำซ้อนและไร้ประโยชน์ (Redundant)**
- **การแก้ไขโดยไม่เพิ่ม Exception:** วิธีการคือ ลบไฟล์ Astro fallback หน้าเหล่านั้นออกทั้งหมด ซึ่งจะตัดความจำเป็นในการเพิ่ม Exception ลงในเครื่องมือตรวจสอบการพัฒนาได้โดยสมบูรณ์
