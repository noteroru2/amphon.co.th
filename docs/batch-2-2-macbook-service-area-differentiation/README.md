# Batch 2.2 — MacBook Service-area Differentiation

สถานะ: **พร้อม review บน branch `batch-2-2-macbook-service-area-differentiation`**

งานนี้ปรับ 20 หน้า MacBook service-area ระดับจังหวัด โดยไม่เพิ่ม/ลบ URL ไม่เปลี่ยน slug, redirect, canonical, indexability หรือ sitemap policy และไม่แก้บริการกลุ่มอื่น

## ผลสำคัญ

- 20/20 หน้าได้รับ title, H1, description, เนื้อหาหลัก, FAQ และคำแนะนำพื้นที่ที่แยกกัน
- ร้านจริงระบุเฉพาะอุบลราชธานี; อีก 19 จังหวัดระบุชัดว่าไม่มีสาขาหรือทีมประจำ
- similarity เฉลี่ยแบบ reproducible ลดจาก 86.81% เป็น 25.91%; คู่สูงสุด 29.27%; 0/190 คู่เกิน 75%
- Astro check: 0 errors
- production build ใน diagnostic worktree พาธ ASCII: exit 0 และสร้าง sitemap สำเร็จ
- ไม่มีหน้า District/City ใน inventory จริง จึงไม่สร้าง URL อำเภอเพื่อให้ครบจำนวน QA

อ่านสรุปสุดท้ายที่ [12-final-report.md](12-final-report.md)
