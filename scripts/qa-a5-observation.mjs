import fs from 'node:fs';

const baseline = JSON.parse(fs.readFileSync(new URL('../observations/a5-baseline.json', import.meta.url), 'utf8'));
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));

const production = (args.get('production') || 'WAIT').toUpperCase();
const latestFinalizedDate = args.get('latest-finalized') || baseline.latestFinalizedGscDate;

function dayDiff(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Invalid YYYY-MM-DD date');
  return Math.max(0, Math.floor((b - a) / 86400000));
}

const newFinalizedDays = dayDiff(baseline.latestFinalizedGscDate, latestFinalizedDate);
let verdict;

if (production !== 'PASS') {
  verdict = 'WAIT_FOR_PRODUCTION';
} else if (newFinalizedDays < baseline.observationClock.minimumNewFinalizedDays) {
  verdict = 'WAIT_FOR_MORE_DATA';
} else if (newFinalizedDays < baseline.observationClock.primaryDecisionWindowDays) {
  verdict = 'READY_FOR_7D_REVIEW';
} else {
  verdict = 'READY_FOR_14D_DECISION';
}

console.log(JSON.stringify({
  batch: 'A5',
  verdict,
  production,
  baselineFinalizedGscDate: baseline.latestFinalizedGscDate,
  latestFinalizedDate,
  newFinalizedDays,
  minimumNewFinalizedDays: baseline.observationClock.minimumNewFinalizedDays,
  primaryDecisionWindowDays: baseline.observationClock.primaryDecisionWindowDays,
  primaryQueries: baseline.primaryQueries,
  guardrails: [
    'Freeze A1-A4 during observation unless a production-critical defect is confirmed.',
    'Protect RAM and corporate-computer winners from broad rewrites.',
    'Judge Computer and Tablet on query/page movement, not sitewide average position alone.',
    'Do not start a new ranking batch before the 7-day gate unless the production gate is NO_GO.'
  ]
}, null, 2));
