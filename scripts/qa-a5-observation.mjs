import fs from 'node:fs';

const baseline = JSON.parse(fs.readFileSync(new URL('../observations/a5-baseline.json', import.meta.url), 'utf8'));
const productionState = JSON.parse(
  fs.readFileSync(new URL('../observations/a5-production-state.json', import.meta.url), 'utf8'),
);
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));

const deploymentStatus = String(productionState.deploymentStatus || 'WAIT').toUpperCase();
const productionPassDate = productionState.productionPassDate || null;
const latestFinalizedDate = args.get('latest-finalized') || baseline.latestFinalizedGscDate;

function dayDiff(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Invalid YYYY-MM-DD date');
  return Math.max(0, Math.floor((b - a) / 86400000));
}

const clockReady =
  deploymentStatus === 'PASS' &&
  productionState.observationClockActive === true &&
  Boolean(productionPassDate);
const newFinalizedDays = clockReady ? dayDiff(productionPassDate, latestFinalizedDate) : 0;
let verdict;

if (!clockReady) {
  verdict = 'WAIT_FOR_PRODUCTION';
} else if (newFinalizedDays < productionState.minimumNewFinalizedDays) {
  verdict = 'WAIT_FOR_MORE_DATA';
} else if (newFinalizedDays < productionState.primaryDecisionWindowDays) {
  verdict = 'READY_FOR_7D_REVIEW';
} else {
  verdict = 'READY_FOR_14D_DECISION';
}

console.log(JSON.stringify({
  batch: 'A5',
  verdict,
  deploymentStatus,
  liveRuntimeGate: productionState.evidence?.liveRuntimeGate || 'UNKNOWN',
  observationClockActive: clockReady,
  baselineFinalizedGscDate: baseline.latestFinalizedGscDate,
  productionPassDate,
  latestFinalizedDate,
  newFinalizedDays,
  minimumNewFinalizedDays: productionState.minimumNewFinalizedDays,
  primaryDecisionWindowDays: productionState.primaryDecisionWindowDays,
  firstReviewFinalizedDate: productionState.firstReviewFinalizedDate,
  primaryDecisionFinalizedDate: productionState.primaryDecisionFinalizedDate,
  primaryQueries: baseline.primaryQueries,
  guardrails: [
    'Freeze A1-A4 during observation unless a production-critical defect is confirmed.',
    'Do not count finalized GSC dates before or on the production pass date as post-deploy observation days.',
    'Protect RAM and corporate-computer winners from broad rewrites.',
    'Judge Computer and Tablet on query/page movement, not sitewide average position alone.',
    'Do not start a new ranking batch before the 7-day gate unless a production-critical defect is confirmed.'
  ]
}, null, 2));
