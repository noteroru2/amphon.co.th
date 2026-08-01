/**
 * Build src/data/local-image-dimensions.json for markdown/rehype and QA.
 */
import { buildDimensionCache, CACHE_PATH } from './lib/local-image-dimensions.mjs';

const map = await buildDimensionCache();
console.log(`Wrote ${Object.keys(map).length} image dimensions → ${CACHE_PATH}`);
