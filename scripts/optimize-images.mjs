/**
 * Image optimization script — resizes & re-encodes public images with Sharp.
 * Run once:  node scripts/optimize-images.mjs
 *
 * Strategy
 * ─────────
 * • Service thumbnails (ServiceCard, cat-card): displayed at ~400x225 max
 *   → resize to 800x450 (2× for HiDPI), quality 82
 * • About / interior images: displayed up to 720x450
 *   → resize to 1080x675 if larger, quality 82
 * • Hero background images (full-width): keep width 1400 max, quality 78
 * • Blog content images: keep width 1200 max, quality 82
 * • OG images: keep as-is (1200x630 is the standard)
 */

import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'images');

const PROFILES = [
  {
    dirs: ['services'],
    maxWidth: 640,
    maxHeight: 360,
    quality: 80,
    label: 'service thumbnails',
  },
  {
    dirs: ['about'],
    maxWidth: 960,
    maxHeight: 600,
    quality: 80,
    label: 'about images',
  },
  {
    dirs: ['hero'],
    maxWidth: 1400,
    maxHeight: 900,
    quality: 72,
    label: 'hero images',
  },
  {
    dirs: ['blog'],
    maxWidth: 1200,
    maxHeight: 750,
    quality: 80,
    label: 'blog images',
  },
];

let totalSavedBytes = 0;
let processedCount = 0;

async function processDir(dirPath, maxWidth, maxHeight, quality) {
  let files;
  try {
    files = await readdir(dirPath);
  } catch {
    return;
  }

  for (const file of files) {
    if (!['.webp', '.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase())) continue;
    const filePath = join(dirPath, file);
    const info = await stat(filePath);
    const originalSize = info.size;

    try {
      // Read entire file into memory first — releases file lock before we write back
      const inputBuffer = await readFile(filePath);
      const img = sharp(inputBuffer);
      const meta = await img.metadata();

      const needsResize = (meta.width ?? 0) > maxWidth || (meta.height ?? 0) > maxHeight;
      const pipeline = needsResize
        ? img.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        : img;

      const ext = extname(file).toLowerCase();
      let outputBuffer;
      if (ext === '.webp') {
        outputBuffer = await pipeline.webp({ quality }).toBuffer();
      } else if (ext === '.png') {
        outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      } else {
        outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      }

      // Only write if the new file is smaller
      if (outputBuffer.length < originalSize) {
        // Write directly with 'w' flag (truncate + overwrite) — works on Windows without unlink
        await writeFile(filePath, outputBuffer, { flag: 'w' });
        const saved = originalSize - outputBuffer.length;
        totalSavedBytes += saved;
        processedCount++;
        console.log(
          `✓ ${file}  ${Math.round(originalSize / 1024)}KB → ${Math.round(outputBuffer.length / 1024)}KB  (-${Math.round(saved / 1024)}KB)${needsResize ? `  resized to ≤${maxWidth}×${maxHeight}` : ''}`
        );
      } else {
        console.log(`  ${file}  already optimal (${Math.round(originalSize / 1024)}KB)`);
      }
    } catch (err) {
      console.error(`✗ ${file}  ${err.message}`);
    }
  }
}

console.log('Amphon Image Optimizer\n');

for (const profile of PROFILES) {
  console.log(`── ${profile.label} ──`);
  for (const dir of profile.dirs) {
    await processDir(
      join(publicDir, dir),
      profile.maxWidth,
      profile.maxHeight,
      profile.quality
    );
  }
  console.log('');
}

console.log(
  `\nDone — ${processedCount} files optimized, saved ${Math.round(totalSavedBytes / 1024)} KB total`
);
