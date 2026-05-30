/** Strip UTF-8 BOM from Markdown files (fix PowerShell encoding). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/content');

function stripBomInDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += stripBomInDir(full);
    else if (entry.name.endsWith('.md')) {
      const buf = fs.readFileSync(full);
      if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
        fs.writeFileSync(full, buf.subarray(3));
        count++;
        console.log(`Stripped BOM: ${path.relative(root, full)}`);
      }
    }
  }
  return count;
}

const n = stripBomInDir(root);
console.log(`Done. Fixed ${n} file(s).`);
