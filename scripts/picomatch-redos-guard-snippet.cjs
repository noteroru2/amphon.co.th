// AMPHON_CVE_2026_112366_FAIL_CLOSED_GUARD
// Reject repeated extglobs with ambiguous stars before constructing a RegExp.
// This scan is linear in the length of the pattern and conservative by design.
const __amphonUnsafeRepeatedExtglob = input => {
  if (input.length > 65536) {
    throw new SyntaxError('AMPHON_PICOMATCH_GLOB_TOO_LONG');
  }
  let escaped = false;
  let bracket = false;
  let quoted = false;
  const frames = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (!quoted && ch === '[') { bracket = true; continue; }
    if (bracket && ch === ']') { bracket = false; continue; }
    if (bracket) continue;
    if (ch === '"') { quoted = !quoted; continue; }
    if (quoted) continue;
    if (ch === '(') {
      const previous = input[i - 1];
      const repeated = previous === '*' || previous === '+';
      if (frames.length && repeated) frames[frames.length - 1].risky = true;
      frames.push({ repeated, risky: false });
      continue;
    }
    if (ch === ')') {
      const frame = frames.pop();
      if (!frame) continue;
      if (frame.repeated && frame.risky) return true;
      if (frames.length && frame.risky) frames[frames.length - 1].risky = true;
      continue;
    }
    if (ch === '*' && input[i + 1] !== '(' && frames.length) {
      frames[frames.length - 1].risky = true;
    }
  }
  return frames.some(frame => frame.repeated && frame.risky);
};
