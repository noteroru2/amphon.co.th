/**
 * Generate Phase A host-aware WWW redirects for F-12.
 * READS vercel.json Source of Truth; writes updated vercel.json + docs CSVs.
 * Does not invent redirect mappings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/f12-vercel-json-host-redirect');
const VERCEL = path.join(ROOT, 'vercel.json');
const WWW = 'www.amphon.co.th';
const APEX = 'amphon.co.th';
const ORIGIN = `https://${APEX}`;
const PHASE_A_STATUS = 307;

fs.mkdirSync(OUT, { recursive: true });

function esc(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function writeCsv(name, rows) {
  if (!rows.length) {
    fs.writeFileSync(path.join(OUT, name), '\n', 'utf8');
    return;
  }
  const h = Object.keys(rows[0]);
  fs.writeFileSync(
    path.join(OUT, name),
    [h.join(',')]
      .concat(rows.map((r) => h.map((k) => esc(r[k])).join(',')))
      .join('\n') + '\n',
    'utf8',
  );
}

function compileRule(rule) {
  const keys = [];
  let pattern = '^';
  for (let i = 0; i < rule.source.length; i++) {
    const char = rule.source[i];
    if (char !== ':') {
      pattern += char.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      continue;
    }
    let cursor = i + 1;
    let key = '';
    while (cursor < rule.source.length && /[A-Za-z0-9_]/u.test(rule.source[cursor])) {
      key += rule.source[cursor];
      cursor += 1;
    }
    const greedy = rule.source[cursor] === '+';
    keys.push(key);
    pattern += greedy ? `(?<${key}>.+)` : `(?<${key}>[^/]+)`;
    i = cursor + (greedy ? 0 : -1);
  }
  pattern += '$';
  return { ...rule, keys, regex: new RegExp(pattern, 'u') };
}

function applyDestination(rule, pathname) {
  const m = pathname.match(rule.regex);
  if (!m) return null;
  let dest = rule.destination;
  const groups = m.groups || {};
  for (const [k, v] of Object.entries(groups)) {
    dest = dest.replaceAll(`:${k}`, v);
  }
  // $1 style
  if (m[1] !== undefined) dest = dest.replace(/\$1/g, m[1]);
  return dest;
}

function normalizePath(p) {
  if (!p) return '/';
  try {
    if (p.startsWith('http')) {
      const u = new URL(p);
      if (u.hostname !== APEX && u.hostname !== WWW) return p; // external
      p = u.pathname || '/';
    }
  } catch {
    /* keep */
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep encoded */
  }
  return p || '/';
}

const raw = JSON.parse(fs.readFileSync(VERCEL, 'utf8'));
const existing = raw.redirects || [];
const beforeCount = existing.length;

// Strip any previous F-12 host rules if regenerating
const baseRules = existing.filter(
  (r) =>
    !(
      Array.isArray(r.has) &&
      r.has.some((h) => h.type === 'host' && h.value === WWW)
    ),
);

const compiled = baseRules.map(compileRule);

function resolveFinal(pathname, limit = 12) {
  const intermediates = [];
  let current = normalizePath(pathname);
  const seen = new Set([current]);
  for (let i = 0; i < limit; i++) {
    let matched = null;
    let next = null;
    for (const rule of compiled) {
      if (rule.has) continue; // only path rules in base
      next = applyDestination(rule, current);
      if (next != null) {
        matched = rule;
        break;
      }
    }
    if (!matched) {
      return {
        final: current,
        intermediates,
        hops: intermediates.length,
        external: false,
        loop: false,
      };
    }
    intermediates.push(next);
    if (String(matched.destination).startsWith('http')) {
      try {
        const u = new URL(next.startsWith('http') ? next : matched.destination);
        if (u.hostname !== APEX && u.hostname !== WWW) {
          return {
            final: u.href,
            intermediates,
            hops: intermediates.length,
            external: true,
            loop: false,
          };
        }
        current = normalizePath(u.pathname);
      } catch {
        return {
          final: next,
          intermediates,
          hops: intermediates.length,
          external: true,
          loop: false,
        };
      }
    } else {
      current = normalizePath(next);
    }
    if (seen.has(current)) {
      return {
        final: current,
        intermediates,
        hops: intermediates.length,
        external: false,
        loop: true,
      };
    }
    seen.add(current);
  }
  return {
    final: current,
    intermediates,
    hops: intermediates.length,
    external: false,
    loop: true,
  };
}

const inventory = [];
const finalMap = [];
const wwwMap = [];
const wwwExact = [];
const seenWwwSource = new Set();

baseRules.forEach((rule, idx) => {
  const ruleId = `R${String(idx + 1).padStart(4, '0')}`;
  inventory.push({
    rule_id: ruleId,
    source: rule.source,
    destination: rule.destination,
    status_code: rule.statusCode || (rule.permanent === false ? 307 : 308),
    permanent: rule.permanent !== false && !rule.statusCode,
    host_condition: '',
    query_preserved: rule.preserveQueryParams === true ? 'yes' : 'default-false',
    unicode_source: /%E0%B8/i.test(rule.source) ? 'encoded' : /[\u0E00-\u0E7F]/.test(rule.source) ? 'unicode' : 'ascii',
    encoded_source: /%E0%B8/i.test(rule.source) ? 'yes' : 'no',
    external: String(rule.destination).startsWith('http') ? 'maybe' : 'no',
    source_file: 'vercel.json',
    rule_order: idx + 1,
    active: 'yes',
    notes: '',
  });

  const resolved = resolveFinal(rule.source);
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(rule.source);
  let sourceVariant = isEncoded ? 'encoded' : /[\u0E00-\u0E7F]/.test(rule.source) ? 'unicode' : 'ascii';

  let safe = true;
  let reason = 'ok';
  if (resolved.loop) {
    safe = false;
    reason = 'loop';
  }
  if (resolved.external) {
    safe = false;
    reason = 'external_target';
  }
  if (String(resolved.final).startsWith('http') && !String(resolved.final).startsWith(ORIGIN)) {
    safe = false;
    reason = 'non_apex_final';
  }

  const finalPath = resolved.external
    ? resolved.final
    : normalizePath(resolved.final);
  const wwwDest = resolved.external ? '' : `${ORIGIN}${finalPath === '/' ? '/' : finalPath}`;

  finalMap.push({
    source: rule.source,
    source_variant: sourceVariant,
    current_destination: rule.destination,
    intermediate_targets: resolved.intermediates.join(' > '),
    final_target: resolved.external ? resolved.final : finalPath,
    redirect_hops_apex_https: resolved.hops,
    final_status: 'ASSUMED_200_PENDING_PROD',
    final_host: resolved.external ? 'external' : APEX,
    final_scheme: 'https',
    self_canonical: 'ASSUMED',
    indexable: 'ASSUMED',
    query_preservation_expected: 'yes',
    safe_for_www_direct_rule: safe ? 'yes' : 'no',
    reason,
  });

  if (!safe) {
    wwwMap.push({
      rule_id: `WWW-${ruleId}`,
      source: rule.source,
      source_variant: sourceVariant,
      existing_destination: rule.destination,
      resolved_final_target: String(finalPath),
      www_destination: '',
      host: WWW,
      status_code_phase_a: PHASE_A_STATUS,
      status_code_phase_b: 308,
      preserve_query: 'true',
      rule_order: '',
      generated_from: ruleId,
      included: 'no',
      exclusion_reason: reason,
    });
    return;
  }

  if (seenWwwSource.has(rule.source)) {
    wwwMap.push({
      rule_id: `WWW-${ruleId}`,
      source: rule.source,
      source_variant: sourceVariant,
      existing_destination: rule.destination,
      resolved_final_target: finalPath,
      www_destination: wwwDest,
      host: WWW,
      status_code_phase_a: PHASE_A_STATUS,
      status_code_phase_b: 308,
      preserve_query: 'true',
      rule_order: '',
      generated_from: ruleId,
      included: 'no',
      exclusion_reason: 'duplicate_source',
    });
    return;
  }
  seenWwwSource.add(rule.source);

  const wwwRule = {
    source: rule.source,
    destination: wwwDest,
    statusCode: PHASE_A_STATUS,
    preserveQueryParams: true,
    has: [{ type: 'host', value: WWW }],
  };
  wwwExact.push(wwwRule);
  wwwMap.push({
    rule_id: `WWW-${ruleId}`,
    source: rule.source,
    source_variant: sourceVariant,
    existing_destination: rule.destination,
    resolved_final_target: finalPath,
    www_destination: wwwDest,
    host: WWW,
    status_code_phase_a: PHASE_A_STATUS,
    status_code_phase_b: 308,
    preserve_query: 'true',
    rule_order: wwwExact.length,
    generated_from: ruleId,
    included: 'yes',
    exclusion_reason: '',
  });
});

const catchAll = {
  source: '/(.*)',
  destination: `${ORIGIN}/$1`,
  statusCode: PHASE_A_STATUS,
  preserveQueryParams: true,
  has: [{ type: 'host', value: WWW }],
};

wwwMap.push({
  rule_id: 'WWW-CATCHALL',
  source: '/(.*)',
  source_variant: 'catch-all',
  existing_destination: '',
  resolved_final_target: 'same-path',
  www_destination: `${ORIGIN}/$1`,
  host: WWW,
  status_code_phase_a: PHASE_A_STATUS,
  status_code_phase_b: 308,
  preserve_query: 'true',
  rule_order: wwwExact.length + 1,
  generated_from: 'generator',
  included: 'yes',
  exclusion_reason: '',
});

const nextRedirects = [...wwwExact, ...baseRules, catchAll];
const next = { ...raw, redirects: nextRedirects };
fs.writeFileSync(VERCEL, JSON.stringify(next, null, 2) + '\n', 'utf8');

writeCsv('redirect-rule-inventory.csv', inventory);
writeCsv('legacy-final-target-map.csv', finalMap);
writeCsv('www-direct-rule-map.csv', wwwMap);
writeCsv('redirect-source-inventory.csv', [
  {
    file: 'vercel.json',
    type: 'redirects',
    purpose: 'All production redirects including F-12 host-aware WWW rules',
    rule_count: nextRedirects.length,
    generated: 'partial — WWW rules generated from existing path rules',
    source_of_truth: 'yes',
    used_in_build: 'yes',
    used_in_production: 'yes',
    notes: `before=${beforeCount} base_path=${baseRules.length} www_exact=${wwwExact.length} catchall=1 after=${nextRedirects.length}`,
  },
]);

const summary = {
  before: beforeCount,
  base_path_rules: baseRules.length,
  www_exact: wwwExact.length,
  catch_all: 1,
  after: nextRedirects.length,
  excluded: wwwMap.filter((r) => r.included === 'no').length,
  phase_a_status: PHASE_A_STATUS,
};
fs.writeFileSync(path.join(OUT, 'generator-summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
