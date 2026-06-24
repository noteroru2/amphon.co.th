/**
 * Convert source images to optimized WebP files.
 *
 * Source:  public/images-source/  (.png, .jpg, .jpeg)
 * Output:  public/images/       (.webp, same folder structure)
 *
 * Run: npm run images:optimize
 * Requires: npm install sharp
 */

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const sourceDir = join(root, 'public', 'images-source');
const outputDir = join(root, 'public', 'images');

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;
const INPUT_EXTS = new Set(['.png', '.jpg', '.jpeg']);

let sharp;

try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Error: sharp is not installed.');
  console.error('Run: npm install sharp');
  process.exit(1);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * @param {string} dir
 * @param {(filePath: string) => Promise<void>} onFile
 */
async function walk(dir, onFile) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      return;
    }
    throw err;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, onFile);
      continue;
    }
    if (!INPUT_EXTS.has(extname(entry.name).toLowerCase())) continue;
    await onFile(fullPath);
  }
}

/**
 * @param {string} inputPath
 */
async function optimizeImage(inputPath) {
  const relativePath = relative(sourceDir, inputPath);
  const outputRelative = relativePath.replace(/\.(png|jpe?g)$/i, '.webp');
  const outputPath = join(outputDir, outputRelative);

  const inputStat = await stat(inputPath);
  const inputSize = inputStat.size;

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  let pipeline = image;
  if ((metadata.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });
  }

  const outputBuffer = await pipeline
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, outputBuffer);

  const outputSize = outputBuffer.length;
  const saved = inputSize - outputSize;
  const savedLabel =
    saved >= 0
      ? `saved ${formatSize(saved)}`
      : `+${formatSize(-saved)} (larger after encode)`;

  const resizeNote =
    (metadata.width ?? 0) > MAX_WIDTH ? `, resized from ${metadata.width}px wide` : '';

  console.log(
    `✓ ${relativePath} → ${outputRelative}\n` +
      `  ${formatSize(inputSize)} → ${formatSize(outputSize)} (${savedLabel}${resizeNote})`
  );

  return { inputSize, outputSize };
}

async function main() {
  console.log('Image optimizer (images-source → images)\n');
  console.log(`Source: ${sourceDir}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Max width: ${MAX_WIDTH}px | WebP quality: ${WEBP_QUALITY}\n`);

  try {
    await stat(sourceDir);
  } catch {
    console.error(`Source directory not found: public/images-source/`);
    console.error('Create the folder and add .png / .jpg / .jpeg files, then run again.');
    process.exit(1);
  }

  let count = 0;
  let totalInput = 0;
  let totalOutput = 0;

  await walk(sourceDir, async (filePath) => {
    const result = await optimizeImage(filePath);
    count++;
    totalInput += result.inputSize;
    totalOutput += result.outputSize;
  });

  if (count === 0) {
    console.log('No .png / .jpg / .jpeg files found in public/images-source/');
    return;
  }

  const totalSaved = totalInput - totalOutput;
  console.log(
    `\nDone — ${count} file(s) converted, ` +
      `${formatSize(totalInput)} → ${formatSize(totalOutput)} ` +
      `(net ${totalSaved >= 0 ? 'saved' : 'added'} ${formatSize(Math.abs(totalSaved))})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
