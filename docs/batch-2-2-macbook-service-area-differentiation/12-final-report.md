# Final report — Batch 2.2

## Outcome

MacBook service-area pages 20 หน้าเปลี่ยนจาก near-duplicate template เป็นเนื้อหาจังหวัดที่แยก intent ชัดเจน โดยใช้ scoped profile/component เฉพาะ `serviceSlug: รับซื้อ-macbook` หน้า service-area ประเภทอื่นไม่เปลี่ยน

แต่ละหน้ามีข้อมูลเฉพาะอย่างน้อย 3–5 ส่วน: บริบทพื้นที่/อำเภอ วิธีเริ่มประเมิน ปัจจัยตรวจเครื่อง คำแนะนำแพ็ก วิธีส่งมอบ supporting service CTA และ FAQ

## Business truth

- หน้าร้านจริง: อุบลราชธานีเท่านั้น
- อีก 19 จังหวัด: ไม่มีการอ้างสาขา ทีมประจำ จุดรับประจำ หรือรับถึงที่แบบรับประกัน
- การส่งมอบต่างจังหวัด: ตกลงเป็นรายกรณีหลังประเมินเบื้องต้น

## SEO and technical result

- Similarity average 86.81% → 25.91%; maximum 92.99% → 29.27%; คู่ >75% ลด 190 → 0
- 20/20 title, H1, description เป็นชุด unique และมีจังหวัดตรงหน้า
- canonical/indexability/sitemap inclusion คงเดิม
- parent/hub/supporting links ใช้งานได้
- ไม่มี redirect/noindex/delete/new URL/schema-type change
- Astro check และ ASCII production build ผ่าน

## Scope and limitations

- ไม่มี District/City route ใน inventory จึงไม่มี district QA และไม่สร้างหน้าใหม่
- ไม่แตะไฟล์ user-modified ใน `src/content/areas/` ได้แก่ กาฬสินธุ์ ขอนแก่น นครราชสีมา บุรีรัมย์ และอุดรธานี
- ไม่แก้ 17 existing internal-link findings และ 1 existing claim-risk false positive เพราะอยู่นอก scope
- ไม่ merge และไม่ deploy

## Git

Branch: `batch-2-2-macbook-service-area-differentiation`

Required commit message: `seo: differentiate MacBook service area pages`
