/**
 * Regional navigation groups for area hub pages, not a statement that AMPHON
 * operates a physical store or pickup team in any listed location.
 * Hat Yai is a district of Songkhla and has a distinct existing city intent.
 */
export const AREA_REGION_GROUPS = [
  {
    id: 'metro',
    label: 'กรุงเทพมหานครและปริมณฑล',
    description: 'ส่งรูปโน๊ตบุ๊ค คอม และอุปกรณ์ไอทีจากกรุงเทพฯ และจังหวัดรอบเมืองให้ประเมินออนไลน์ก่อน',
    slugs: ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ'],
  },
  {
    id: 'central',
    label: 'ภาคกลางและภาคตะวันตก',
    description: 'รับข้อมูลประเมินเครื่องเดียวและคอมองค์กรจากพื้นที่ภาคกลางและตะวันตก โดยตกลงวิธีส่งมอบก่อน',
    slugs: ['พระนครศรีอยุธยา', 'นครปฐม', 'สุพรรณบุรี', 'กาญจนบุรี', 'เพชรบุรี'],
  },
  {
    id: 'north',
    label: 'ภาคเหนือ',
    description: 'ประเมิน Notebook, MacBook, กล้อง และคอมสำนักงานจากจังหวัดเหนือผ่านรูปและสเปกจริง',
    slugs: ['เชียงใหม่', 'เชียงราย', 'พิษณุโลก', 'นครสวรรค์', 'ตาก'],
  },
  {
    id: 'east',
    label: 'ภาคตะวันออก',
    description: 'รับข้อมูลคอมสำนักงาน โรงงาน โน๊ตบุ๊ค และกล้องจากจังหวัดภาคตะวันออกก่อนตรวจรับ',
    slugs: ['ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด'],
  },
  {
    id: 'northeast',
    label: 'ภาคตะวันออกเฉียงเหนือ',
    description: 'พื้นที่ตั้งหน้าร้านจริงคืออุบลราชธานี จังหวัดอื่นส่งข้อมูลและตกลงการตรวจรับเป็นรายกรณี',
    slugs: [
      'อุบลราชธานี', 'ขอนแก่น', 'นครราชสีมา', 'อุดรธานี',
      'บุรีรัมย์', 'สุรินทร์', 'ศรีสะเกษ', 'ยโสธร', 'อำนาจเจริญ',
      'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์', 'สกลนคร',
      'นครพนม', 'มุกดาหาร', 'ชัยภูมิ', 'เลย', 'หนองบัวลำภู',
      'หนองคาย', 'บึงกาฬ',
    ],
  },
  {
    id: 'south',
    label: 'ภาคใต้',
    description: 'ผู้ขายภูเก็ต สงขลา หาดใหญ่ ยะลา และจังหวัดใต้ส่งรูปเช็กราคาก่อนตกลงวิธีส่งมอบ',
    slugs: [
      'สงขลา', 'หาดใหญ่', 'ภูเก็ต', 'ยะลา', 'พัทลุง',
      'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'กระบี่',
      'ปัตตานี', 'นราธิวาส',
    ],
  },
] as const;

export function getAreaRegionName(slug: string): string | undefined {
  return AREA_REGION_GROUPS.find((group) =>
    (group.slugs as readonly string[]).includes(slug),
  )?.label;
}
