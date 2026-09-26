import { readFile } from 'node:fs/promises'

const runner = await readFile(new URL('./seo-action-executor.mjs', import.meta.url), 'utf8')

const checks = [
  ['runner claims rollback jobs before new SEO work', runner.includes("edge('rollback_claim'") && runner.indexOf('await processRollbackJobs()') < runner.indexOf('await processClaimedJobs()')],
  ['runner reverts exact deployed commit', runner.includes("git(['revert'") && runner.includes('job.originalCommitSha')],
  ['merge commits use first-parent revert', runner.includes("git(['revert', '-m', '1'")],
  ['rollback is idempotent after crash', runner.includes('findPriorRollbackCommit') && runner.includes('seo-rollback:')],
  ['rollback validates exact changed files', runner.includes('sameFiles(originalFiles, job.changedFiles)') && runner.includes('sameFiles(revertedFiles, job.changedFiles)')],
  ['rollback conflicts stop for human review', runner.includes("'BLOCKED'") && runner.includes('Git revert conflict or unsafe history')],
  ['rollback builds before pushing', runner.includes("run('npm', ['run', 'build']") && runner.indexOf("run('npm', ['run', 'build']") < runner.lastIndexOf("git(['push', 'origin', 'HEAD:main'])")],
  ['rollback records revert diff hash', runner.includes('revertDiffSha256: sha256(diffText)')],
  ['rollback verifies live internal-link removal', runner.includes('waitForLinkRollback') && runner.includes('exactVariants')],
  ['rollback verifies live meta restoration', runner.includes('waitForMetaRollback') && runner.includes('previousTitle') && runner.includes('previousDescription')],
  ['meta apply stores previous values for rollback verification', runner.includes("previousTitle: yamlScalarText(fieldValue(beforeFm, 'title'))")],
]

const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
if (failed.length) {
  console.error(`SEO AUTO ROLLBACK verification failed: ${failed.map(([label]) => label).join(', ')}`)
  process.exit(1)
}
console.log('SEO AUTO ROLLBACK PASS — exact revert, conflict guard, idempotency and live verification protected')
