import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { absoluteUrl } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = () => {
  // Cloudflare Bot Preference Sync prepends AI-training directives; origin
  // must not contradict its current Disallow rules for training crawlers.
  const body = `# robots.txt — ${site.url}
# SEO and authorized search/AI-search crawling

User-agent: *
Allow: /
Disallow: /404

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# No explicit Allow for GPTBot, ClaudeBot, CCBot or Google-Extended;
# the Cloudflare-managed training policy is authoritative.

# LLM content guide
# See ${absoluteUrl('/llms.txt')}

Sitemap: ${absoluteUrl('/sitemap-index.xml')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
