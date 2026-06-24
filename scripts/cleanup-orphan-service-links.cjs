/**
 * Remove orphan service link lists (no ## heading) left from prior edits.
 */
const fs = require('fs');
const path = require('path');

const SERVICES = path.join(__dirname, '..', 'src', 'content', 'services');

function isServiceLinkLine(line) {
  return /^- \[[^\]]+\]\(\/บริการ\/[^)]+\)\s*$/.test(line);
}

function cleanOrphans(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i] === '---') {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j < lines.length && isServiceLinkLine(lines[j])) {
        let k = j;
        while (k < lines.length && isServiceLinkLine(lines[k])) k++;
        while (k < lines.length && lines[k].trim() === '') k++;
        if (k < lines.length && lines[k] === '---') {
          out.push('---');
          i = k + 1;
          continue;
        }
      }
    }
    out.push(lines[i]);
    i++;
  }

  return out.join('\n');
}

const gamingFiles = [
  'รับซื้อ-msi-katana.md',
  'รับซื้อ-msi-cyborg.md',
  'รับซื้อ-msi-thin.md',
  'รับซื้อ-msi-raider.md',
  'รับซื้อ-msi-vector.md',
  'รับซื้อ-msi-stealth.md',
  'รับซื้อ-msi-pulse-crosshair.md',
  'รับซื้อ-msi-titan.md',
  'รับซื้อ-msi-sword.md',
  'รับซื้อ-rog-gaming.md',
  'รับซื้อ-rog-zephyrus.md',
  'รับซื้อ-asus-tuf-gaming.md',
  'รับซื้อ-acer-nitro.md',
  'รับซื้อ-acer-predator.md',
  'รับซื้อ-hp-victus.md',
  'รับซื้อ-hp-omen.md',
  'รับซื้อ-dell-alienware.md',
  'รับซื้อ-dell-g-series.md',
  'รับซื้อ-lenovo-loq.md',
  'รับซื้อ-gigabyte-gaming-notebook.md',
  'รับซื้อ-gigabyte-aorus.md',
];

let fixed = 0;
for (const f of gamingFiles) {
  const fp = path.join(SERVICES, f);
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  const next = cleanOrphans(c);
  if (next !== c) {
    fs.writeFileSync(fp, next, 'utf8');
    console.log('cleaned', f);
    fixed++;
  }
}
console.log('files cleaned:', fixed);
