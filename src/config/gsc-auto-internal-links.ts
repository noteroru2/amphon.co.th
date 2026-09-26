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
    actionId: '1ad0ef64-d635-411e-be68-8f669694dd90',
    sourceKind: 'service',
    sourceSlug: 'รับซื้อ-gaming-pc',
    targetPath: '/บริการ/รับซื้อคอมพิวเตอร์',
    anchor: 'รับซื้อคอมพิวเตอร์',
    context: 'สำหรับรายละเอียดการประเมินสินค้าที่เกี่ยวข้อง ดู',
    approvedAt: '2026-09-26T06:30:00.172477+00:00',
  },
  {
    actionId: '1ad0ef64-d635-411e-be68-8f669694dd90',
    sourceKind: 'service',
    sourceSlug: 'รับซื้อคอมประกอบ',
    targetPath: '/บริการ/รับซื้อคอมพิวเตอร์',
    anchor: 'ประเมินคอม PC มือสอง',
    context: 'สำหรับรายละเอียดการประเมินสินค้าที่เกี่ยวข้อง ดู',
    approvedAt: '2026-09-26T06:30:00.172477+00:00',
  },
]

export function getGscAutoInternalLinks(kind: GscAutoLinkSourceKind, slug: string) {
  return GSC_AUTO_INTERNAL_LINKS
    .filter((item) => item.sourceKind === kind && item.sourceSlug === slug)
    .slice(0, 2)
}
