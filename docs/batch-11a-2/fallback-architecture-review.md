# Fallback Architecture Review (Batch 11A.2)

---

## 1. Critical Questions & Answers

### 1.1 หาก Redirect ทำงานที่ Vercel edge ไฟล์ Astro fallback นี้ยังถูกเรียกใช้หรือไม่?
- **ไม่มีการเรียกใช้ในสภาพแวดล้อม Production:** เพราะกลไก Vercel Edge จะดักจับ URL และตอบกลับเป็น 301 Redirect ให้กับบราวเซอร์หรือบอทตั้งแต่ชั้น Edge Network ดังนั้นไฟล์ HTML fallback ที่ถูก Build ไว้ในเครื่องจะไม่เคยส่งออกไปบริการจริง

### 1.2 ไฟล์นี้ตอบสถานะใดเมื่อไม่มี Edge rule?
- ตอบสถานะ **200 OK** (และมีเนื้อหาหน้าเปลี่ยนผ่านพร้อม Meta Refresh)

### 1.3 มีความเสี่ยง Soft 404 หรือไม่?
- **มีขนาดเล็กในเครื่องมือทดสอบ:** บอทบางประเภทหากไม่ทำรายการตาม Redirect และเห็นหน้า 200 OK ที่มีเนื้อหาเบาบาง (Thin content) อาจจัดประเภทเป็น Soft 404 (แม้ว่าจะระบุ noindex ก็ตาม)

### 1.4 ประโยชน์ของการเก็บไฟล์สำรองนี้เทียบกับ Redirect-only?
- **ไม่มีผลกระทบจริงต่อ Production:** ประโยชน์เดียวคือทำให้การเช็กหน้าเสียในเครื่อง (Local QA) ผ่านในกรณีที่การตรวจไม่ได้มองเห็นกฎเปลี่ยนเส้นทางบน Vercel 
- **ทางเลือกที่สะอาดกว่า (Redirect-only):** การลบไฟล์เหล่านี้ทิ้งไปเลย และจัดการผ่าน `vercel.json` เท่านั้นเป็นโครงสร้างที่สะอาดกว่าอย่างเห็นได้ชัด เพราะทำให้ประมวลผลเร็วขึ้น โค้ดน้อยลง และตัด Exception ของ QA scripts ทิ้งได้ทั้งหมด

---

## 2. Verdict by File

| File | Proposed Verdict | Justification |
|:---|:---|:---|
| `รับซื้อเลนส์.astro` | **REVERT** | Platform-level redirect is sufficient. Local stub is redundant. |
| `รับซื้อ-storage-nas.astro` | **REVERT** | Platform-level redirect is sufficient. Local stub is redundant. |
| `รับซื้อ-gopro.astro` | **REVERT** | Platform-level redirect is sufficient. Local stub is redundant. |
