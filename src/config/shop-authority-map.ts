export const SHOP_URL = 'https://shop.amphon.co.th'

export type ShopAuthorityTarget = {
  href: string
  label: string
  title: string
  summary: string
}

export const SHOP_AUTHORITY_BY_BLOG: Record<string, ShopAuthorityTarget[]> = {
  'การ์ดจอมีผลต่อราคาคอมมือสองแค่ไหน': [
    { href: `${SHOP_URL}/specs/`, label: 'เลือกเครื่องตาม GPU ที่มีจริง', title: 'ดูสินค้าไอทีมือสองตาม GPU', summary: 'เทียบเครื่องจาก GTX / RTX ที่ผ่านเกณฑ์สต๊อกของ AMPHON SHOP' },
    { href: `${SHOP_URL}/gaming-pcs/`, label: 'ดู Gaming PC มือสอง', title: 'Gaming PC ที่พร้อมขาย', summary: 'ดูราคา รูป สเปกและสภาพของเครื่องจริง' },
  ],
  'คอมเกมมิ่งมือสอง-ขายอย่างไรให้ได้ราคาดี': [
    { href: `${SHOP_URL}/gaming-pcs/`, label: 'ดู Gaming PC มือสอง', title: 'กำลังมองหา Gaming PC?', summary: 'เลือกจากเครื่องจริงที่มีอยู่ตอนนี้' },
    { href: `${SHOP_URL}/specs/`, label: 'เลือกตาม GPU / CPU', title: 'Spec Finder', summary: 'เริ่มจากสเปกที่ต้องการแทนการไล่ดูทุกเครื่อง' },
  ],
  'วิธีเช็กสเปกคอมก่อนขาย': [
    { href: `${SHOP_URL}/specs/`, label: 'เลือกสินค้าตามสเปก', title: 'นำสเปกไปเทียบกับสินค้ามือสอง', summary: 'ดูหน้า Spec Finder ที่เปิดเฉพาะกลุ่มที่มีสต๊อกจริง' },
    { href: `${SHOP_URL}/notebooks/`, label: 'ดูโน้ตบุ๊กมือสอง', title: 'Notebook มือสอง', summary: 'ดู CPU RAM SSD สภาพและ Product Evidence รายเครื่อง' },
  ],
  'แรมมือสองขายได้เท่าไหร่': [
    { href: `${SHOP_URL}/specs/`, label: 'ดูสินค้าไอทีตาม RAM', title: 'เลือกเครื่องตาม RAM', summary: 'Spec page จะเปิดเมื่อมีสต๊อก ประวัติและ demand มากพอ' },
  ],
  'ราคา-macbook-มือสอง-2026': [
    { href: `${SHOP_URL}/macbooks/`, label: 'ดู MacBook มือสองพร้อมขาย', title: 'MacBook มือสองใน AMPHON SHOP', summary: 'ราคา สภาพ แบตเตอรี่ รูปและข้อมูลของเครื่องจริง' },
  ],
  'macbook-battery-cycle-มีผลต่อราคาขายแค่ไหน': [
    { href: `${SHOP_URL}/macbooks/`, label: 'เทียบ MacBook มือสอง', title: 'ดู Battery และสภาพของ MacBook จริง', summary: 'เปิดดู Product Evidence ของแต่ละเครื่องก่อนตัดสินใจซื้อ' },
  ],
  'ราคา-ipad-มือสอง-2026': [
    { href: `${SHOP_URL}/tablets/`, label: 'ดู iPad / Tablet มือสอง', title: 'iPad และ Tablet พร้อมขาย', summary: 'เทียบรุ่น ความจุ สภาพและราคาเครื่องจริง' },
  ],
  'วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน': [
    { href: `${SHOP_URL}/tablets/`, label: 'ดู iPad มือสองที่มีจริง', title: 'รู้รุ่นแล้ว ไปดูเครื่องที่พร้อมขาย', summary: 'ดูรูป สภาพ ความจุและสถานะของแต่ละเครื่อง' },
  ],
  'ราคา-iphone-มือสอง-2026': [
    { href: `${SHOP_URL}/iphones/`, label: 'ดู iPhone มือสองพร้อมขาย', title: 'iPhone มือสองใน AMPHON SHOP', summary: 'ดูราคา แบตเตอรี่ สภาพ รูปจริงและสถานะเครื่อง' },
  ],
  'วิธีเช็ก-battery-health-iphone-ก่อนขาย': [
    { href: `${SHOP_URL}/iphones/`, label: 'เทียบ iPhone มือสอง', title: 'ดู Battery Health ของเครื่องจริง', summary: 'ข้อมูล Battery และสภาพจะแสดงเมื่อมีการบันทึกกับ SKU นั้นจริง' },
  ],
  'กล้อง-shutter-count-สูง-ขายได้ไหม': [
    { href: `${SHOP_URL}/cameras/`, label: 'ดูกล้องมือสองพร้อมขาย', title: 'กล้องมือสองใน AMPHON SHOP', summary: 'เทียบรุ่น สภาพ รูปจริงและผลตรวจที่บันทึกไว้' },
  ],
}

export function getShopAuthorityTargets(blogSlug: string) {
  return SHOP_AUTHORITY_BY_BLOG[blogSlug] ?? []
}
