const fs = require('fs');
const path = 'src/content/services';
const files = fs.readdirSync(path).filter(f => f.endsWith('.md'));

files.forEach(f => {
  let content = fs.readFileSync(path + '/' + f, 'utf8');
  let m1 = content.match(/heroImage:\{*\"([^\"]+)\"/);
  if (!m1) return;
  let hero = m1[1];

  if (f.includes("?????")) {
    hero = '/images/services/rub-sue-headphone-earbud-amphon.png';
  } else if (f.includes("playstation")) {
    hero = '/images/services/rub-sue-playstation-ps5-amphon.png';
  } else if (f.includes("jbl") || f.includes("marshall")) {
    hero = '/images/services/rub-sue-bluetooth-speaker-amphon.png';
  } else if (f.includes("??????????")) {
    hero = '/images/services/rub-sue-it-gadget-accessories-amphon.png';
  } else if (f.includes("??????????????????")) {
    hero = '/images/services/rub-sue-komputer-gaming-pc-amphon.webp';
  }

  content = content.replace(/heroImage:\s*\"[^\"]+\"/, 'heroImage: "' + hero + '"');
  content = content.replace(/ogImage:\{*\"[^\"]+\"/, 'ogImage: "' + hero + '"');

  let m2 = content.match(/title:\s*\"([^\"]+\")/);
  let m3 = content.match(/mainKeyword:\s*\"([^\"]+\")/);
  let title = m2 ? m2[1].replace("\"", "") : '';
  let mk = m3 ? m3[1].replace("\"", "") : '';

  content = content.replace(/!\\[[^\\]]+\\]\\(\/images\/[^\\)]+\\)/g, (match, alt) => {
    return '!['+ mk + ' ' + title + '](' + hero + ')';
  });

  fs.writeFileSync(path + '/' + f, content, 'utf8');
});
console.log('Images and Alt Text updated');
