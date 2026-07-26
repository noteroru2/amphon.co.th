# Pilot QA

Wave 1 แก้ 5 หน้า: อุบลราชธานี ขอนแก่น บุรีรัมย์ สุรินทร์ และกาฬสินธุ์

## Results

- `astro check`: exit 0, 0 errors
- 5/5 หน้าใช้ profile เฉพาะจังหวัดและ fallback ไม่กระทบบริการอื่น
- แต่ละหน้ามีจังหวัดใน title/H1/meta, district guidance, service mode, packing advice, evaluation focus, supporting link, CTA และ 3 FAQs
- อุบลราชธานีระบุหน้าร้านจริง; 4 จังหวัดอื่นระบุว่าไม่มีสาขา/ทีมประจำและต้องตกลงส่งมอบเป็นรายกรณี
- ไม่พบการเปลี่ยน URL, canonical, robots หรือ schema type

## District limitation

ไม่พบหน้า District/City ใน 20-route inventory จึงไม่มี district pilot QA และไม่มีการสร้างหน้าใหม่เพื่อทดแทน
