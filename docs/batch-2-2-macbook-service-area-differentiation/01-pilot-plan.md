# Pilot plan

## Gate

Batch 2.1.1 ผ่าน gate จาก commit `a40f6b3` ซึ่งมี Batch 2.1 commit เป็น ancestor และรายงานยืนยัน Astro check, production build, sitemap และ MacBook route validation แล้ว

## Wave 1: 5 Province pages

เลือก อุบลราชธานี, ขอนแก่น, บุรีรัมย์, สุรินทร์ และกาฬสินธุ์ เพราะครอบคลุมหน้าร้านจริงหนึ่งจังหวัด รูปแบบต่างจังหวัด และหน้าที่มีสัญญาณ GSC เด่นใน export

Inventory มี 20 หน้าและทุกหน้าเป็น Province-level ไม่มี District/City URL ดังนั้นข้อกำหนด pilot “อย่างน้อย 2 District/City” ไม่สามารถทำโดยไม่สร้างหน้าใหม่ ซึ่งอยู่นอก scope จึงใช้ 5 จังหวัดตัวแทนและบันทึกข้อจำกัดแทน

## Pilot acceptance

- title/H1/meta มีจังหวัดและไม่ซ้ำ
- มีคำแนะนำพื้นที่ วิธีส่งมอบ การแพ็ก ปัจจัยประเมิน ลิงก์และ FAQ ที่เฉพาะหน้า
- ไม่อ้างสาขา ทีม หรือบริการรับถึงที่เกินจริง
- Astro check หลัง Wave 1 ต้อง 0 errors ก่อนขยายงาน
