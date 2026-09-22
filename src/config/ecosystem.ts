export const SHOP_URL = 'https://shop.amphon.co.th';

export type ShopCategoryTarget = {
  href: string;
  label: string;
  categoryName: string;
};

export const SHOP_CATEGORY_BY_SERVICE: Record<string, ShopCategoryTarget> = {
  'รับซื้อโน๊ตบุ๊ค': {
    href: `${SHOP_URL}/notebooks/`,
    label: 'ดูโน้ตบุ๊กมือสองที่พร้อมจำหน่าย',
    categoryName: 'โน้ตบุ๊ก',
  },
  'รับซื้อ-macbook': {
    href: `${SHOP_URL}/macbooks/`,
    label: 'ดู MacBook มือสองที่พร้อมจำหน่าย',
    categoryName: 'MacBook',
  },
  'รับซื้อคอมพิวเตอร์': {
    href: `${SHOP_URL}/desktop-pcs/`,
    label: 'ดูคอมพิวเตอร์มือสองที่พร้อมจำหน่าย',
    categoryName: 'คอมพิวเตอร์',
  },
  'รับซื้อ-gaming-pc': {
    href: `${SHOP_URL}/gaming-pcs/`,
    label: 'ดู Gaming PC มือสองที่พร้อมจำหน่าย',
    categoryName: 'Gaming PC',
  },
  'รับซื้อ-iphone': {
    href: `${SHOP_URL}/iphones/`,
    label: 'ดู iPhone มือสองที่พร้อมจำหน่าย',
    categoryName: 'iPhone',
  },
  'รับซื้อโทรศัพท์มือสอง': {
    href: `${SHOP_URL}/smartphones/`,
    label: 'ดูมือถือมือสองที่พร้อมจำหน่าย',
    categoryName: 'มือถือ',
  },
  'รับซื้อแท็บเล็ต': {
    href: `${SHOP_URL}/tablets/`,
    label: 'ดู iPad และ Tablet มือสองที่พร้อมจำหน่าย',
    categoryName: 'Tablet',
  },
  'รับซื้อ-ipad': {
    href: `${SHOP_URL}/tablets/`,
    label: 'ดู iPad และ Tablet มือสองที่พร้อมจำหน่าย',
    categoryName: 'iPad / Tablet',
  },
  'รับซื้อจอคอม': {
    href: `${SHOP_URL}/monitors/`,
    label: 'ดูจอคอมมือสองที่พร้อมจำหน่าย',
    categoryName: 'จอคอม',
  },
  'รับซื้อกล้อง': {
    href: `${SHOP_URL}/cameras/`,
    label: 'ดูกล้องมือสองที่พร้อมจำหน่าย',
    categoryName: 'กล้อง',
  },
  'รับซื้อเครื่องเกม': {
    href: `${SHOP_URL}/gaming-consoles/`,
    label: 'ดูเครื่องเกมมือสองที่พร้อมจำหน่าย',
    categoryName: 'เครื่องเกม',
  },
};

export function getShopCategoryForService(serviceSlug: string) {
  return SHOP_CATEGORY_BY_SERVICE[serviceSlug] ?? null;
}
