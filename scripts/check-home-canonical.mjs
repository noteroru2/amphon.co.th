import fs from 'fs';
const html = fs.readFileSync('dist/index.html', 'utf-8');
const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
  || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
console.log('Canonical:', m ? m[1] : 'NOT FOUND');
const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
console.log('Title:', t ? t[1].trim().substring(0,80) : 'NOT FOUND');
