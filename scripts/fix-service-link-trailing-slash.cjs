const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'content', 'services');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

let changedFiles = 0;
let fixedLinks = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  const orig = fs.readFileSync(fp, 'utf8');
  const next = orig.replace(/\]\((\/บริการ\/[^)]+)\/\)/g, (_, url) => {
    fixedLinks += 1;
    return `](${url})`;
  });

  if (next !== orig) {
    fs.writeFileSync(fp, next, 'utf8');
    changedFiles += 1;
    console.log(file);
  }
}

console.log(`---\nfiles: ${changedFiles}, links fixed: ${fixedLinks}`);
