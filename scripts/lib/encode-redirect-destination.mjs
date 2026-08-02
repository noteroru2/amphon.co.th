/**
 * Safe percent-encoding for Vercel redirect destinations (Thai path fix).
 * Encodes path segments only; preserves scheme/host/query/fragment/dynamic tokens.
 */
const DYNAMIC_SEGMENT = /^(:[A-Za-z_][A-Za-z0-9_+*]*(?:\([^)]*\))?|\*\*?|[A-Za-z_][A-Za-z0-9_]*\*|\$\d+)$/;

export function hasNonAscii(value) {
  return /[^\x00-\x7F]/.test(String(value ?? ''));
}

export function looksDoubleEncoded(value) {
  return /%25(?:E0|B8|B9|[0-9A-F]{2})/i.test(String(value ?? ''));
}

export function safeDecodeSegment(segment) {
  if (!segment) return segment;
  if (!/%[0-9A-Fa-f]{2}/.test(segment)) return segment;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function encodePathname(pathname) {
  if (!pathname && pathname !== '') return pathname;
  const leading = pathname.startsWith('/') ? '/' : '';
  const parts = pathname.split('/');
  // preserve empty leading segment from leading slash
  const encoded = parts.map((seg, i) => {
    if (seg === '' && (i === 0 || i === parts.length - 1)) return '';
    if (!seg) return '';
    if (DYNAMIC_SEGMENT.test(seg)) return seg;
    const decoded = safeDecodeSegment(seg);
    return encodeURIComponent(decoded);
  });
  let out = encoded.join('/');
  if (leading && !out.startsWith('/')) out = `/${out}`;
  return out;
}

export function logicalPathname(destination) {
  if (!destination) return '';
  try {
    if (/^https?:\/\//i.test(destination)) {
      const u = new URL(destination);
      return safeDecodePath(u.pathname);
    }
    const pathOnly = destination.split(/[?#]/, 1)[0];
    return safeDecodePath(pathOnly);
  } catch {
    return destination;
  }
}

function safeDecodePath(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname
      .split('/')
      .map((s) => safeDecodeSegment(s))
      .join('/');
  }
}

/**
 * Encode an internal redirect destination. External hosts unchanged except path encoding.
 */
export function encodeRedirectDestination(destination) {
  if (destination == null) return destination;
  const dest = String(destination);

  if (/^https?:\/\//i.test(dest)) {
    const u = new URL(dest);
    const nextPath = encodePathname(u.pathname);
    return `${u.origin}${nextPath}${u.search}${u.hash}`;
  }

  let pathPart = dest;
  let suffix = '';
  const hashIdx = dest.indexOf('#');
  if (hashIdx >= 0) {
    suffix = dest.slice(hashIdx) + suffix;
    pathPart = dest.slice(0, hashIdx);
  }
  const queryIdx = pathPart.indexOf('?');
  if (queryIdx >= 0) {
    suffix = pathPart.slice(queryIdx) + suffix;
    pathPart = pathPart.slice(0, queryIdx);
  }

  return encodePathname(pathPart) + suffix;
}

export function isExternalDestination(destination) {
  if (!destination) return false;
  if (!/^https?:\/\//i.test(destination)) return false;
  try {
    return new URL(destination).hostname !== 'amphon.co.th';
  } catch {
    return true;
  }
}
