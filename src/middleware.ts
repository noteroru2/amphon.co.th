import { defineMiddleware } from 'astro:middleware';

// Cloudflare Static Assets normally use 307 for /path/ -> /path.
// The existing Vercel production uses permanent 308 for this route form.
// wrangler.jsonc runs the Worker first only on slash-ending paths (and /api/*).
export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const destination = pathname.replace(/\/+$/u, '') + context.url.search;
    return new Response(null, {
      status: 308,
      headers: { Location: destination },
    });
  }
  return next();
});
