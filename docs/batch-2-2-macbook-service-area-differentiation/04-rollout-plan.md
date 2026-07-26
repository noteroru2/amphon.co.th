# Rollout plan

## Wave 2 — 7 pages

นครราชสีมา, อุดรธานี, สกลนคร, หนองคาย, นครพนม, ศรีสะเกษ, ยโสธร

เน้นจังหวัดที่มี GSC signal หรือเป็นกรณีเส้นทาง/ระยะทางสำคัญ หลังแก้รัน `astro check` ได้ exit 0 และ 0 errors

## Wave 3 — 8 pages

ชัยภูมิ, บึงกาฬ, มหาสารคาม, มุกดาหาร, ร้อยเอ็ด, เลย, หนองบัวลำภู, อำนาจเจริญ

หลัง Wave 3 ตรวจ 20 built routes, metadata, canonical, indexability, FAQ schema, parent/hub links และ location claims แล้วผ่าน 20/20

## Rollback unit

การแก้ถูก scope ไว้ที่ `serviceSlug === 'รับซื้อ-macbook'` และ profile รายจังหวัด จึง rollback ได้โดยถอด component/profile binding โดยไม่แตะ content type อื่น
