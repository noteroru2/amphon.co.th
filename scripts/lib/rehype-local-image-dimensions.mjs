/**
 * Rehype plugin: add width/height to local /images/* <img> from sharp metadata cache.
 */
import { getCachedDimensions, loadDimensionCache } from './local-image-dimensions-cache.mjs';
import { readAssetDimensions } from './local-image-dimensions.mjs';

function walk(node, visit) {
  visit(node);
  if (Array.isArray(node?.children)) {
    for (const child of node.children) walk(child, visit);
  }
}

export function rehypeLocalImageDimensions() {
  return async (tree) => {
    loadDimensionCache();
    const jobs = [];

    walk(tree, (node) => {
      if (node?.type !== 'element' || node.tagName !== 'img') return;
      const props = node.properties || (node.properties = {});
      const src = props.src;
      if (!src || typeof src !== 'string') return;
      if (!src.startsWith('/images/')) return;

      const hasW = props.width != null && props.width !== '' && Number(props.width) > 0;
      const hasH = props.height != null && props.height !== '' && Number(props.height) > 0;
      if (hasW && hasH) return;

      jobs.push(
        (async () => {
          let dims = getCachedDimensions(src);
          if (!dims) dims = await readAssetDimensions(src);
          if (!dims?.width || !dims?.height) return;
          if (!hasW) props.width = dims.width;
          if (!hasH) props.height = dims.height;
        })(),
      );
    });

    await Promise.all(jobs);
  };
}

export default rehypeLocalImageDimensions;
