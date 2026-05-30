import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { absoluteUrl } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `# robots.txt — ${site.url}
# SEO + AEO + GEO

User-agent: *
Allow: /
Disallow: /404

# Google
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

# Bing
User-agent: Bingbot
Allow: /

# OpenAI
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Meta
User-agent: Meta-ExternalAgent
Allow: /

# Common Crawl (used by many AI systems)
User-agent: CCBot
Allow: /

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
