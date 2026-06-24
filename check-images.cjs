const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'content', 'services');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.md'));

let missingImages = [];

files.forEach(file => {
    const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');
    
    // Check frontmatter
    const heroMatch = content.match(/heroImage:\s*["']([^"']+)["']/);
    const ogMatch = content.match(/ogImage:\s*["']([^"']+)["']/);
    
    const heroImg = heroMatch ? heroMatch[1] : null;
    const ogImg = ogMatch ? ogMatch[1] : null;

    if (!heroImg || !fs.existsSync(path.join(publicDir, heroImg))) {
        missingImages.push({ file, type: 'heroImage', path: heroImg || 'Not defined' });
    }

    // Check inline images (e.g., ![alt text](/images/...))
    const inlineMatches = [...content.matchAll(/!\[.*?\]\((.*?)\)/g)];
    inlineMatches.forEach(match => {
        let imgPath = match[1];
        if (imgPath.startsWith('/')) {
            if (!fs.existsSync(path.join(publicDir, imgPath))) {
                missingImages.push({ file, type: 'inlineImage', path: imgPath });
            }
        }
    });
});

const uniqueFiles = [...new Set(missingImages.map(i => i.file))];
console.log('Total files missing images:', uniqueFiles.length);
console.log(uniqueFiles.join('\n'));
