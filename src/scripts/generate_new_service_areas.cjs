const fs = require('fs');
const path = require('path');

const serviceAreasDir = path.join(__dirname, '..', 'content', 'serviceAreas');

const provinces = [
  "กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", 
  "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", 
  "ร้อยเอ็ด", "เลย", "สกลนคร", "สุรินทร์", "ศรีสะเกษ", 
  "หนองคาย", "หนองบัวลำภู", "อุดรธานี", "อุบลราชธานี", "อำนาจเจริญ"
];

const newServices = [
  { slug: "รับเหมาประมูลอุปกรณ์ไอที", name: "อุปกรณ์ไอทีบริษัทและประมูล" },
  { slug: "รับซื้อ-server", name: "Server และตู้ Rack" },
  { slug: "รับซื้ออุปกรณ์-network", name: "อุปกรณ์ Network และ Switch" },
  { slug: "รับซื้อ-storage-nas", name: "Storage และ NAS" },
  { slug: "รับซื้อ-ups", name: "UPS และเครื่องสำรองไฟ" },
  { slug: "รับซื้อเครื่องใช้ไฟฟ้า", name: "เครื่องใช้ไฟฟ้ามือสอง" },
  { slug: "รับซื้อทีวี", name: "ทีวีและโทรทัศน์" },
  { slug: "รับซื้อเฟอร์นิเจอร์", name: "เฟอร์นิเจอร์และของย้ายบ้าน" },
  { slug: "รับซื้อของสะสม", name: "ของสะสมและเครื่องดนตรี" },
  { slug: "รับซื้อโดรน", name: "โดรนและกล้อง Action Cam" }
];

let createdCount = 0;

for (const service of newServices) {
  for (const province of provinces) {
    const fileName = `${service.slug}-${province}.md`;
    const filePath = path.join(serviceAreasDir, fileName);
    
    // Slug for serviceArea is serviceSlug-province
    const fileSlug = `${service.slug}-${province}`;
    
    const content = `---
title: "รับซื้อ ${service.name} ${province} ประเมินราคาฟรี บริการถึงที่"
slug: "${fileSlug}"
description: "รับซื้อ ${service.name} ใน ${province} ให้ราคาสูง ประเมินราคาฟรีผ่าน Line จ่ายเงินสดทันที มีบริการรับของถึงที่"
mainKeyword: "รับซื้อ ${service.name} ${province}"
relatedKeywords: ["รับซื้อ ${service.name} ${province}", "ขาย ${service.name} ${province}"]
heroImage: "/images/hero/hero-amphon-trading-map-isan.webp"
date: "2025-06-01"
updated: "2026-05-30"
draft: false
serviceSlug: "${service.slug}"
areaSlug: "${province}"
---

## รับซื้อ ${service.name} ${province} บริการถึงที่

อำพล เทรดดิ้ง มีบริการรับซื้อ **${service.name}** ในพื้นที่ **จังหวัด${province}** และใกล้เคียง เราอำนวยความสะดวกให้ลูกค้าที่ต้องการขายอุปกรณ์ไอทีและสินค้ามือสองด้วยบริการประเมินราคาล่วงหน้า เพื่อให้คุณขายของได้อย่างมั่นใจ ปลอดภัย และรวดเร็วที่สุด

> 🔥 **ต้องการดูราคาประเมิน และขั้นตอนการขายใช่ไหม?**
> 👉 **[คลิกที่นี่เพื่อดูตารางราคาประเมิน ${service.name} ทุกรุ่น พร้อมขั้นตอนการส่งรูปเช็คราคา](/รับซื้อ/${service.slug})**

### พื้นที่ให้บริการในจังหวัด${province}

ลูกค้าในพื้นที่สามารถทัก Line [@webuy](https://line.me/ti/p/~@webuy) หรือโทร 064-257-9353 เพื่อส่งรูปและสเปกมาให้ทีมงานประเมินราคาเบื้องต้นได้ฟรี ไม่ว่าคุณจะอยู่ในเขตเมือง หรืออำเภอต่างๆ หากราคาเป็นที่น่าพอใจ สามารถนัดหมายรับของหรือตกลงวิธีส่งมอบได้ทันที

- **เช็คราคา ${service.name} ทั่วประเทศ:** [คลิกดูรายละเอียด](/รับซื้อ/${service.slug})
- **ดูพื้นที่รับซื้ออื่นๆ ในภาคอีสาน:** [พื้นที่ให้บริการ ${province}](/พื้นที่ให้บริการ/${province})
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    createdCount++;
  }
}

console.log(`Successfully generated ${createdCount} new feeder pages.`);
