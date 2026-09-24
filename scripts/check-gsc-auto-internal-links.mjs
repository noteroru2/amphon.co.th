import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [config, component, blog, service] = await Promise.all([
  read('src/config/gsc-auto-internal-links.ts'),
  read('src/components/GscAutoInternalLinks.astro'),
  read('src/layouts/BlogLayout.astro'),
  read('src/layouts/ServiceLayout.astro'),
])

const checks = [
  ['registry documents approval-only execution', config.includes('only after a GSC INTERNAL_LINK_BOOST action is APPROVED')],
  ['registry caps source/action footprint', config.includes('Maximum 2 entries per source page and 4 source pages per action')],
  ['registry forbids dangerous SEO mutations', config.includes('Never use this file to change H1, title, canonical, robots, redirects or URL ownership')],
  ['renderer emits same-site href from registry only', component.includes('href={link.targetPath}') && !component.includes('target="_blank"')],
  ['blog layout reads links by exact blog slug', blog.includes("getGscAutoInternalLinks('blog', slug)")],
  ['service layout reads links by exact service slug', service.includes("getGscAutoInternalLinks('service', slug)")],
]

const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
if (failed.length) process.exit(1)

const entryMatches = [...config.matchAll(/sourceSlug:\s*['"]([^'"]+)['"][\s\S]*?targetPath:\s*['"]([^'"]+)['"]/g)]
for (const [, sourceSlug, targetPath] of entryMatches) {
  if (!targetPath.startsWith('/') || targetPath.startsWith('//')) {
    console.error('FAIL - targetPath must be a same-domain absolute path:', targetPath)
    process.exit(1)
  }
  if (targetPath.includes('#') && targetPath.startsWith('#')) {
    console.error('FAIL - fragment-only target is not allowed')
    process.exit(1)
  }
  if (!sourceSlug.trim()) {
    console.error('FAIL - sourceSlug is empty')
    process.exit(1)
  }
}

console.log('GSC AUTO INTERNAL LINKS PASS — approval, footprint and URL safety guards protected')
