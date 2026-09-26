export type GscAutoLinkSourceKind = 'service' | 'blog'

export type GscAutoInternalLink = {
  actionId: string
  sourceKind: GscAutoLinkSourceKind
  sourceSlug: string
  targetPath: string
  anchor: string
  context: string
  approvedAt: string
}

/**
 * AUTO-EXECUTION CONTRACT
 * - Entries are added only after a GSC INTERNAL_LINK_BOOST action is APPROVED.
 * - Maximum 2 entries per source page and 4 source pages per action.
 * - targetPath must be a same-domain canonical path.
 * - Never use this file to change H1, title, canonical, robots, redirects or URL ownership.
 * - The automation must run CI and live verification before marking an action APPLIED.
 */
export const GSC_AUTO_INTERNAL_LINKS: GscAutoInternalLink[] = [
  {
    actionId: '99a0f6c2-3c0f-4971-a75d-36c1598cb71f',
    sourceKind: 'service',
    sourceSlug: 'รับซื้อ-imac-mac-mini',
    targetPath: '/บริการ/รับซื้อ-mac-mini',
    anchor: 'รับซื้อ Mac mini',
    context: 'สำหรับรายละเอียดการประเมินสินค้าที่เกี่ยวข้อง ดู',
    approvedAt: '2026-09-26T06:30:00.172477+00:00',
  },
  {
    actionId: '99a0f6c2-3c0f-4971-a75d-36c1598cb71f',
    sourceKind: 'blog',
    sourceSlug: 'imac-mac-mini-มือสอง-ขายอย่างไรให้ประเมินง่าย',
    targetPath: '/บริการ/รับซื้อ-mac-mini',
    anchor: 'ขาย Mac mini มือสอง',
    context: 'หากต้องการประเมินสินค้าต่อจากข้อมูลในบทความนี้ ดู',
    approvedAt: '2026-09-26T06:30:00.172477+00:00',
  },
  {
    actionId: '99a0f6c2-3c0f-4971-a75d-36c1598cb71f',
    sourceKind: 'blog',
    sourceSlug: 'mac-mini-m4-มือสอง',
    targetPath: '/บริการ/รับซื้อ-mac-mini',
    anchor: 'ประเมิน Mac mini',
    context: 'หากต้องการประเมินสินค้าต่อจากข้อมูลในบทความนี้ ดู',
    approvedAt: '2026-09-26T06:30:00.172477+00:00',
  },
]

export function getGscAutoInternalLinks(kind: GscAutoLinkSourceKind, slug: string) {
  return GSC_AUTO_INTERNAL_LINKS
    .filter((item) => item.sourceKind === kind && item.sourceSlug === slug)
    .slice(0, 2)
}
