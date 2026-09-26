#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const EDGE_URL = process.env.SEO_EXECUTOR_URL || 'https://mfpdtlxwdbxitgfzdape.supabase.co/functions/v1/seo-action-executor'
const REPOSITORY = process.env.GITHUB_REPOSITORY || 'noteroru2/amphon.co.th'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const ID_TOKEN_URL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL || ''
const ID_TOKEN_REQUEST_TOKEN = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || ''
const SITE_ORIGIN = 'https://amphon.co.th'
const REGISTRY = 'src/config/gsc-auto-internal-links.ts'
const MAX_SOURCE_PAGES = 4
const MAX_LINKS_PER_SOURCE = 2

if (REPOSITORY !== 'noteroru2/amphon.co.th') throw new Error(`Unexpected repository: ${REPOSITORY}`)
if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required')
if (!ID_TOKEN_URL || !ID_TOKEN_REQUEST_TOKEN) throw new Error('GitHub OIDC permission id-token: write is required')

function run(command, args = [], options = {}) {
  const result = execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.capture === false ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })
  return typeof result === 'string' ? result.trim() : ''
}

function git(args, options = {}) {
  return run('git', args, options)
}

function resetMain() {
  git(['fetch', 'origin', 'main'])
  git(['checkout', '-B', 'main', 'origin/main'])
  git(['reset', '--hard', 'origin/main'])
  git(['clean', '-fd'])
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function jsString(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}

function yamlDoubleQuote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', ' ')}"`
}

async function githubOidcToken() {
  const url = new URL(ID_TOKEN_URL)
  url.searchParams.set('audience', EDGE_URL)
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${ID_TOKEN_REQUEST_TOKEN}` },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.value) {
    throw new Error(`Unable to obtain GitHub OIDC token: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload.value
}

async function edge(operation, body = {}) {
  const token = await githubOidcToken()
  const response = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ operation, ...body }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.ok) {
    throw new Error(`Executor gateway ${operation} failed: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload
}

async function finish(job, outcome, payload = {}) {
  return edge('finish', { jobId: job.jobId, outcome, payload })
}

async function githubApi(apiPath, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}${apiPath}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${GITHUB_TOKEN}`,
      'x-github-api-version': '2022-11-28',
      ...(init.headers || {}),
    },
  })
  const raw = await response.text()
  let payload = null
  try {
    payload = raw ? JSON.parse(raw) : null
  } catch {
    payload = raw
  }
  if (!response.ok) {
    throw new Error(`GitHub API ${apiPath} failed: ${response.status} ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`)
  }
  return payload
}

function decodePath(pageUrl) {
  const url = new URL(pageUrl)
  if (url.origin !== SITE_ORIGIN) throw new Error(`Target page is outside ${SITE_ORIGIN}`)
  const decoded = decodeURIComponent(url.pathname)
  return decoded === '/' ? '/' : decoded.replace(/\/+$/, '')
}

function sourceInfo(sourcePath) {
  const clean = decodeURIComponent(sourcePath).replace(/\/+$/, '')
  if (clean.startsWith('/บริการ/')) {
    const slug = clean.slice('/บริการ/'.length)
    return { sourceKind: 'service', sourceSlug: slug, sourcePath: clean }
  }
  if (clean.startsWith('/blog/')) {
    const slug = clean.slice('/blog/'.length)
    return { sourceKind: 'blog', sourceSlug: slug, sourcePath: clean }
  }
  return null
}

function sourceFileExists(source) {
  const folder = source.sourceKind === 'service' ? 'services' : 'blog'
  return ['.md', '.mdx'].some((ext) => existsSync(path.join('src/content', folder, `${source.sourceSlug}${ext}`)))
}

function extractSourcePaths(notes, targetPath) {
  const found = String(notes || '').match(/\/(?:บริการ|blog)\/[^\s,，;；)\]}]+/gu) || []
  const unique = []
  for (const raw of found) {
    const cleaned = raw.replace(/[.。:：]+$/u, '')
    const info = sourceInfo(cleaned)
    if (!info || info.sourcePath === targetPath || !sourceFileExists(info)) continue
    if (!unique.some((item) => item.sourcePath === info.sourcePath)) unique.push(info)
    if (unique.length >= MAX_SOURCE_PAGES) break
  }
  return unique
}

function extractAnchors(notes, fallback) {
  const matches = [...String(notes || '').matchAll(/[“"]([^”"]{2,80})[”"]/gu)]
    .map((match) => match[1].trim())
    .filter((value) => value && !value.includes('/') && !value.toLowerCase().includes('title'))
  const unique = [...new Set(matches)]
  if (!unique.length && fallback) unique.push(String(fallback).trim())
  return unique
}

function parseRegistry(content) {
  const match = content.match(/(export const GSC_AUTO_INTERNAL_LINKS:[^\n]*=\s*\[)([\s\S]*?)(\]\n\nexport function getGscAutoInternalLinks)/)
  if (!match) throw new Error('Unable to locate GSC_AUTO_INTERNAL_LINKS registry')
  const entries = []
  const objectPattern = /\{\s*actionId:\s*'([^']+)',\s*sourceKind:\s*'([^']+)',\s*sourceSlug:\s*'([^']+)',\s*targetPath:\s*'([^']+)',\s*anchor:\s*'([^']+)',\s*context:\s*'([^']+)',\s*approvedAt:\s*'([^']+)'\s*\}/g
  for (const item of match[2].matchAll(objectPattern)) {
    entries.push({
      actionId: item[1],
      sourceKind: item[2],
      sourceSlug: item[3],
      targetPath: item[4],
      anchor: item[5],
      context: item[6],
      approvedAt: item[7],
    })
  }
  return { match, entries }
}

function serializeRegistryEntry(entry) {
  return [
    '  {',
    `    actionId: '${jsString(entry.actionId)}',`,
    `    sourceKind: '${jsString(entry.sourceKind)}',`,
    `    sourceSlug: '${jsString(entry.sourceSlug)}',`,
    `    targetPath: '${jsString(entry.targetPath)}',`,
    `    anchor: '${jsString(entry.anchor)}',`,
    `    context: '${jsString(entry.context)}',`,
    `    approvedAt: '${jsString(entry.approvedAt)}',`,
    '  },',
  ].join('\n')
}

function addAutoLinks(job) {
  const action = job.action
  const targetPath = decodePath(action.page)
  const original = readFileSync(REGISTRY, 'utf8')
  const parsed = parseRegistry(original)
  const existingForAction = parsed.entries.filter((entry) => entry.actionId === action.id)
  if (existingForAction.length) {
    return {
      changed: false,
      targetPath,
      entries: existingForAction,
      sourcePaths: existingForAction.map((entry) =>
        entry.sourceKind === 'service' ? `/บริการ/${entry.sourceSlug}` : `/blog/${entry.sourceSlug}`,
      ),
    }
  }

  if (action.actionType !== 'INTERNAL_LINK_BOOST') throw new Error('AUTO_DEPLOY accepts INTERNAL_LINK_BOOST only')
  if (!job.diagnostic?.autoSafeInternalLink || job.diagnostic?.requiresHumanReview) {
    throw new Error('Auto-link guard is not satisfied')
  }

  const sources = extractSourcePaths(action.candidateNotes, targetPath)
  if (!sources.length) throw new Error('No explicit existing source paths were found in candidate notes')

  const anchors = extractAnchors(action.candidateNotes, action.primaryQuery)
  const approvedAt = action.approvedAt || new Date().toISOString()
  const additions = []
  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index]
    const sourceCount = parsed.entries.filter(
      (entry) => entry.sourceKind === source.sourceKind && entry.sourceSlug === source.sourceSlug,
    ).length
    if (sourceCount >= MAX_LINKS_PER_SOURCE) continue
    additions.push({
      actionId: action.id,
      sourceKind: source.sourceKind,
      sourceSlug: source.sourceSlug,
      targetPath,
      anchor: anchors[index % anchors.length],
      context:
        source.sourceKind === 'blog'
          ? 'หากต้องการประเมินสินค้าต่อจากข้อมูลในบทความนี้ ดู'
          : 'สำหรับรายละเอียดการประเมินสินค้าที่เกี่ยวข้อง ดู',
      approvedAt,
    })
    if (additions.length >= MAX_SOURCE_PAGES) break
  }

  if (!additions.length) throw new Error('All explicit source pages reached the guarded link cap')

  const allEntries = [...parsed.entries, ...additions]
  const nextBody = allEntries.length ? `\n${allEntries.map(serializeRegistryEntry).join('\n')}\n` : ''
  const next = original.replace(parsed.match[0], `${parsed.match[1]}${nextBody}${parsed.match[3]}`)
  writeFileSync(REGISTRY, next)

  return {
    changed: true,
    targetPath,
    entries: additions,
    sourcePaths: additions.map((entry) =>
      entry.sourceKind === 'service' ? `/บริการ/${entry.sourceSlug}` : `/blog/${entry.sourceSlug}`,
    ),
  }
}

function actionEntries(actionId) {
  const parsed = parseRegistry(readFileSync(REGISTRY, 'utf8'))
  return parsed.entries.filter((entry) => entry.actionId === actionId)
}

function commitEvidence(commitSha, changedFiles) {
  const baseCommitSha = git(['rev-parse', `${commitSha}^`])
  const diffText = git(['show', '--format=', '--no-ext-diff', '--unified=3', commitSha, '--', ...changedFiles])
  return {
    baseCommitSha,
    patchCommitSha: commitSha,
    rollbackCommitSha: baseCommitSha,
    diffText,
    diffSha256: sha256(diffText),
    changedFiles,
  }
}

function findPriorActionCommit(actionId) {
  const sha = git(['log', '--all', `--grep=seo-action:${actionId}`, '--format=%H', '-n', '1'])
  return sha || null
}

async function waitForLinks(patchPayload, attempts = 18) {
  const targetPath = patchPayload.targetPath
  const encodedTarget = encodeURI(targetPath)
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let allGood = true
    for (const sourcePath of patchPayload.sourcePaths || []) {
      try {
        const response = await fetch(new URL(sourcePath, SITE_ORIGIN), {
          headers: { 'user-agent': 'Amphon-SEO-Executor/1.0' },
        })
        const html = await response.text()
        const ok = response.ok && (
          html.includes(`href="${targetPath}"`) ||
          html.includes(`href='${targetPath}'`) ||
          html.includes(`href="${encodedTarget}"`) ||
          html.includes(`href='${encodedTarget}'`)
        )
        if (!ok) allGood = false
      } catch {
        allGood = false
      }
    }
    if (allGood) return true
    console.log(`Live link verification attempt ${attempt}/${attempts} is not ready yet`)
    await new Promise((resolve) => setTimeout(resolve, 10_000))
  }
  return false
}

function targetContentFile(pageUrl) {
  const targetPath = decodePath(pageUrl)
  const candidates = []
  if (targetPath.startsWith('/บริการ/')) {
    const slug = targetPath.slice('/บริการ/'.length)
    candidates.push(`src/content/services/${slug}.md`, `src/content/services/${slug}.mdx`)
  } else if (targetPath.startsWith('/blog/')) {
    const slug = targetPath.slice('/blog/'.length)
    candidates.push(`src/content/blog/${slug}.md`, `src/content/blog/${slug}.mdx`)
  }
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) throw new Error(`META_REVIEW target is not a supported content file: ${targetPath}`)
  return found
}

function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) throw new Error('Markdown frontmatter is missing')
  return match[1]
}

function fieldValue(fm, field) {
  const match = fm.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'))
  return match ? match[1] : null
}

function replaceField(content, field, value) {
  const pattern = new RegExp(`^${field}:\\s*.*$`, 'm')
  if (!pattern.test(frontmatter(content))) throw new Error(`Frontmatter field ${field} is missing`)
  return content.replace(pattern, `${field}: ${yamlDoubleQuote(value)}`)
}

function prepareMetaPatch(job) {
  const action = job.action
  if (action.actionType !== 'META_REVIEW') throw new Error('PR_ONLY accepts META_REVIEW only')
  if (!action.candidateTitle && !action.candidateDescription) throw new Error('META_REVIEW has no title/description candidate')

  const file = targetContentFile(action.page)
  const before = readFileSync(file, 'utf8')
  const beforeFm = frontmatter(before)
  const protectedFields = ['h1', 'slug', 'canonical', 'robots']
  const protectedBefore = Object.fromEntries(protectedFields.map((field) => [field, fieldValue(beforeFm, field)]))

  let after = before
  if (action.candidateTitle) after = replaceField(after, 'title', action.candidateTitle)
  if (action.candidateDescription) after = replaceField(after, 'description', action.candidateDescription)

  const afterFm = frontmatter(after)
  const protectedAfter = Object.fromEntries(protectedFields.map((field) => [field, fieldValue(afterFm, field)]))
  if (JSON.stringify(protectedBefore) !== JSON.stringify(protectedAfter)) {
    throw new Error('Protected meta fields changed unexpectedly')
  }
  if (after === before) throw new Error('META_REVIEW patch produced no change')

  writeFileSync(file, after)
  return {
    file,
    targetPath: decodePath(action.page),
    candidateTitle: action.candidateTitle || null,
    candidateDescription: action.candidateDescription || null,
  }
}

function ensureOnlyChanged(expectedFiles) {
  const changed = [
    ...git(['diff', '--name-only']).split('\n').filter(Boolean),
    ...git(['diff', '--cached', '--name-only']).split('\n').filter(Boolean),
    ...git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean),
  ]
  const unique = [...new Set(changed)]
  const unexpected = unique.filter((file) => !expectedFiles.includes(file))
  if (unexpected.length) throw new Error(`Unexpected tracked/generated changes: ${unexpected.join(', ')}`)
}

async function waitForMeta(patchPayload, attempts = 12) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(new URL(patchPayload.targetPath, SITE_ORIGIN), {
        headers: { 'user-agent': 'Amphon-SEO-Executor/1.0' },
      })
      const html = await response.text()
      const titleOk = !patchPayload.candidateTitle || html.includes(patchPayload.candidateTitle)
      const descriptionProbe = patchPayload.candidateDescription
        ? patchPayload.candidateDescription.slice(0, Math.min(70, patchPayload.candidateDescription.length))
        : ''
      const descriptionOk = !descriptionProbe || html.includes(descriptionProbe) || html.includes(descriptionProbe.replaceAll('&', '&amp;'))
      if (response.ok && titleOk && descriptionOk) return true
    } catch {
      // Deployment can still be propagating.
    }
    console.log(`Live meta verification attempt ${attempt}/${attempts} is not ready yet`)
    await new Promise((resolve) => setTimeout(resolve, 10_000))
  }
  return false
}

async function createOrFindPullRequest(branch, title, body) {
  const owner = REPOSITORY.split('/')[0]
  const query = new URLSearchParams({ state: 'open', head: `${owner}:${branch}`, base: 'main' })
  const existing = await githubApi(`/pulls?${query}`)
  if (Array.isArray(existing) && existing.length) return existing[0]

  return githubApi('/pulls', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title,
      head: branch,
      base: 'main',
      body,
      draft: true,
    }),
  })
}

async function processAutoLink(job) {
  resetMain()

  if (job.patchCommitSha && job.patchPayload?.sourcePaths?.length) {
    const live = await waitForLinks(job.patchPayload, 8)
    if (live) {
      await finish(job, 'APPLIED', { liveVerifiedAt: new Date().toISOString() })
      console.log(`APPLIED verified existing commit for ${job.action.primaryQuery}`)
    } else {
      await finish(job, 'VERIFYING', {})
      console.log(`VERIFYING ${job.action.primaryQuery}; live deploy not visible yet`)
    }
    return
  }

  const existing = actionEntries(job.action.id)
  if (existing.length) {
    const priorCommit = findPriorActionCommit(job.action.id)
    if (!priorCommit) throw new Error('Registry already contains action but matching Git commit was not found')
    const sourcePaths = existing.map((entry) =>
      entry.sourceKind === 'service' ? `/บริการ/${entry.sourceSlug}` : `/blog/${entry.sourceSlug}`,
    )
    const patchPayload = {
      targetPath: existing[0].targetPath,
      sourcePaths,
      anchors: existing.map((entry) => entry.anchor),
    }
    const evidence = commitEvidence(priorCommit, [REGISTRY])
    const live = await waitForLinks(patchPayload, 8)
    await finish(job, live ? 'APPLIED' : 'VERIFYING', {
      ...evidence,
      patchPayload,
      ...(live ? { liveVerifiedAt: new Date().toISOString() } : {}),
    })
    return
  }

  const baseCommitSha = git(['rev-parse', 'HEAD'])
  const patch = addAutoLinks(job)
  if (!patch.changed) throw new Error('Expected a new guarded registry patch')

  run('npm', ['run', 'qa:gsc-auto-links'], { capture: false })
  run('npm', ['run', 'build'], { capture: false })
  ensureOnlyChanged([REGISTRY])

  git(['add', REGISTRY])
  const diffText = git(['diff', '--cached', '--no-ext-diff', '--unified=3'])
  if (!diffText) throw new Error('Guarded link patch has no staged diff')
  const changedFiles = git(['diff', '--cached', '--name-only']).split('\n').filter(Boolean)
  if (changedFiles.length !== 1 || changedFiles[0] !== REGISTRY) {
    throw new Error(`AUTO_DEPLOY may change only ${REGISTRY}`)
  }

  git(['config', 'user.name', 'Amphon SEO Executor'])
  git(['config', 'user.email', 'seo-executor@users.noreply.github.com'])
  git(['commit', '-m', `seo(auto): link boost ${job.action.primaryQuery} [seo-action:${job.action.id}]`])
  const patchCommitSha = git(['rev-parse', 'HEAD'])
  git(['push', 'origin', 'HEAD:main'])

  const patchPayload = {
    targetPath: patch.targetPath,
    sourcePaths: patch.sourcePaths,
    anchors: patch.entries.map((entry) => entry.anchor),
  }
  const evidence = {
    baseCommitSha,
    patchCommitSha,
    rollbackCommitSha: baseCommitSha,
    diffText,
    diffSha256: sha256(diffText),
    changedFiles,
    patchPayload,
  }

  const live = await waitForLinks(patchPayload)
  await finish(job, live ? 'APPLIED' : 'VERIFYING', {
    ...evidence,
    ...(live ? { liveVerifiedAt: new Date().toISOString() } : {}),
  })
  console.log(`${live ? 'APPLIED' : 'VERIFYING'} auto link: ${job.action.primaryQuery} ${patchCommitSha}`)
}

async function processMetaPr(job) {
  resetMain()
  const baseCommitSha = git(['rev-parse', 'HEAD'])
  const branch = `seo/meta-${job.action.id.slice(0, 8)}`
  git(['checkout', '-B', branch, 'origin/main'])

  const patchPayload = prepareMetaPatch(job)
  run('npm', ['run', 'build'], { capture: false })
  run('npm', ['run', 'validate:seo'], { capture: false })
  ensureOnlyChanged([patchPayload.file])

  git(['add', patchPayload.file])
  const diffText = git(['diff', '--cached', '--no-ext-diff', '--unified=3'])
  if (!diffText) throw new Error('META_REVIEW patch has no staged diff')
  if (/^[+-](?:h1|slug|canonical|robots):/m.test(diffText)) {
    throw new Error('META_REVIEW attempted to alter a protected field')
  }
  const changedFiles = git(['diff', '--cached', '--name-only']).split('\n').filter(Boolean)
  if (changedFiles.length !== 1 || changedFiles[0] !== patchPayload.file) {
    throw new Error('META_REVIEW may change only its exact content file')
  }

  git(['config', 'user.name', 'Amphon SEO Executor'])
  git(['config', 'user.email', 'seo-executor@users.noreply.github.com'])
  git(['commit', '-m', `seo(review): meta candidate ${job.action.primaryQuery} [seo-action:${job.action.id}]`])
  const patchCommitSha = git(['rev-parse', 'HEAD'])
  git(['push', '--force-with-lease', '-u', 'origin', `HEAD:${branch}`])

  const prBody = [
    '## SEO Action Executor',
    '',
    `- Action: \`${job.action.id}\``,
    `- Query: **${job.action.primaryQuery}**`,
    `- Page: ${job.action.page}`,
    `- Risk mode: **PR_ONLY** — this workflow does not merge or deploy the change.`,
    `- Rollback point: \`${baseCommitSha}\``,
    '',
    '### Guard',
    '- Only title/description frontmatter may change.',
    '- H1, slug/URL, canonical and robots are protected.',
    '- Merge manually only after reviewing the diff.',
  ].join('\n')

  const pr = await createOrFindPullRequest(
    branch,
    `SEO meta review: ${job.action.primaryQuery}`,
    prBody,
  )

  await finish(job, 'PR_READY', {
    baseCommitSha,
    patchCommitSha,
    rollbackCommitSha: baseCommitSha,
    diffText,
    diffSha256: sha256(diffText),
    changedFiles,
    patchPayload,
    pullRequestNumber: pr.number,
    pullRequestUrl: pr.html_url,
  })

  console.log(`PR_READY #${pr.number}: ${job.action.primaryQuery}`)
  resetMain()
}

async function reconcilePullRequests() {
  const response = await edge('pr_ready')
  for (const job of response.jobs || []) {
    try {
      if (!job.pullRequestNumber) continue
      const pr = await githubApi(`/pulls/${job.pullRequestNumber}`)
      if (pr.merged_at) {
        const live = await waitForMeta(job.patchPayload || {}, 8)
        if (!live) {
          console.log(`PR #${job.pullRequestNumber} merged but live meta is not visible yet`)
          continue
        }
        await finish(job, 'APPLIED', {
          patchCommitSha: pr.merge_commit_sha || job.patchCommitSha,
          prMergedAt: pr.merged_at,
          liveVerifiedAt: new Date().toISOString(),
        })
        console.log(`APPLIED merged meta PR #${job.pullRequestNumber}`)
      } else if (pr.state === 'closed') {
        await finish(job, 'FAILED', {
          error: `Pull request #${job.pullRequestNumber} was closed without merge`,
        })
      }
    } catch (error) {
      console.error(`PR reconciliation failed for job ${job.jobId}:`, error)
    }
  }
}

async function processClaimedJobs() {
  const response = await edge('claim', { limit: 3 })
  for (const job of response.jobs || []) {
    try {
      if (job.riskMode === 'AUTO_DEPLOY' && job.executionKind === 'INTERNAL_LINK') {
        await processAutoLink(job)
      } else if (job.riskMode === 'PR_ONLY' && job.executionKind === 'META') {
        await processMetaPr(job)
      } else {
        throw new Error(`Claimed unsupported risk/execution pair: ${job.riskMode}/${job.executionKind}`)
      }
    } catch (error) {
      console.error(`Executor job ${job.jobId} failed:`, error)
      try {
        await finish(job, 'FAILED', {
          error: error instanceof Error ? error.message : String(error),
        })
      } catch (finishError) {
        console.error('Unable to record executor failure:', finishError)
      }
      try {
        resetMain()
      } catch {
        // Keep the primary executor error.
      }
    }
  }
}

await reconcilePullRequests()
await processClaimedJobs()
console.log('SEO Action Executor run complete')
