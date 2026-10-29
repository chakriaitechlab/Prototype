import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakriai.com';

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'Applebot-Extended',
  'cohere-ai',
  'Bytespider',
  'CCBot',
  'FacebookBot',
  'meta-externalagent',
] as const;

const PUBLIC_ALLOW = [
  '/',
  '/jobs',
  '/employers',
  '/candidates',
  '/pricing',
  '/support',
  '/privacy',
  '/terms',
];

const PRIVATE_DISALLOW = [
  '/dashboard',
  '/api',
  '/onboarding',
  '/auth',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
