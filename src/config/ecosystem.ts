export const SHOP_URL = 'https://shop.amphon.co.th';

export type ShopCategoryTarget = {
  href: string;
  label: string;
  categoryName: string;
};

export const SHOP_CATEGORY_BY_SERVICE: Record<string, ShopCategoryTarget> = {
  'รับซื้อโน๊ตบุ๊ค': {
    href: `${SHOP_URL}/notebooks/`,
    label: 'ดูหมวดโน้ตบุ๊กมือสองใน AMPHON SHOP',
    categoryName: 'โน้ตบุ๊ก',
  },
  'รับซื้อ-macbook': {
    href: `${SHOP_URL}/macbooks/`,
    label: 'ดูหมวด MacBook มือสองใน AMPHON SHOP',
    categoryName: 'MacBook',
  },
  'รับซื้อคอมพิวเตอร์': {
    href: `${SHOP_URL}/desktop-pcs/`,
    label: 'ดูหมวดคอมพิวเตอร์มือสองใน AMPHON SHOP',
    categoryName: 'คอมพิวเตอร์',
  },
  'รับซื้อ-gaming-pc': {
    href: `${SHOP_URL}/gaming-pcs/`,
    label: 'ดูหมวด Gaming PC มือสองใน AMPHON SHOP',
    categoryName: 'Gaming PC',
  },
  'รับซื้อ-gaming-notebook': {
    href: `${SHOP_URL}/gaming-laptops/`,
    label: 'ดู Gaming Laptop มือสองใน AMPHON SHOP',
    categoryName: 'Gaming Laptop',
  },
  'รับซื้อการ์ดจอ': {
    href: `${SHOP_URL}/specs/`,
    label: 'เลือกสินค้าไอทีมือสองตาม GPU ใน AMPHON SHOP',
    categoryName: 'สินค้าตาม GPU',
  },
  'รับซื้อแรม': {
    href: `${SHOP_URL}/specs/`,
    label: 'เลือกสินค้าไอทีมือสองตาม RAM ใน AMPHON SHOP',
    categoryName: 'สินค้าตาม RAM',
  },
  'รับซื้อซีพียู': {
    href: `${SHOP_URL}/specs/`,
    label: 'เลือกสินค้าไอทีมือสองตาม CPU ใน AMPHON SHOP',
    categoryName: 'สินค้าตาม CPU',
  },
  'รับซื้อ-iphone': {
    href: `${SHOP_URL}/iphones/`,
    label: 'ดูหมวด iPhone มือสองใน AMPHON SHOP',
    categoryName: 'iPhone',
  },
  'รับซื้อโทรศัพท์มือสอง': {
    href: `${SHOP_URL}/smartphones/`,
    label: 'ดูหมวดมือถือมือสองใน AMPHON SHOP',
    categoryName: 'มือถือ',
  },
  'รับซื้อแท็บเล็ต': {
    href: `${SHOP_URL}/tablets/`,
    label: 'ดูหมวด iPad และ Tablet มือสองใน AMPHON SHOP',
    categoryName: 'Tablet',
  },
  'รับซื้อ-ipad': {
    href: `${SHOP_URL}/tablets/`,
    label: 'ดูหมวด iPad และ Tablet มือสองใน AMPHON SHOP',
    categoryName: 'iPad / Tablet',
  },
  'รับซื้อจอคอม': {
    href: `${SHOP_URL}/monitors/`,
    label: 'ดูหมวดจอคอมมือสองใน AMPHON SHOP',
    categoryName: 'จอคอม',
  },
  'รับซื้อกล้อง': {
    href: `${SHOP_URL}/cameras/`,
    label: 'ดูหมวดกล้องมือสองใน AMPHON SHOP',
    categoryName: 'กล้อง',
  },
  'รับซื้อเครื่องเกม': {
    href: `${SHOP_URL}/gaming-consoles/`,
    label: 'ดูหมวดเครื่องเกมมือสองใน AMPHON SHOP',
    categoryName: 'เครื่องเกม',
  },
};

export function getShopCategoryForService(serviceSlug: string) {
  return SHOP_CATEGORY_BY_SERVICE[serviceSlug] ?? null;
}
