import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakriai.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/jobs',
    '/employers',
    '/candidates',
    '/pricing',
    '/support',
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
