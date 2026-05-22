import type { APIRoute } from 'astro';
import { prisma } from '../lib/prisma';

export const prerender = false;

const BASE = 'https://status.withkaya.com';

export const GET: APIRoute = async () => {
  const services = await prisma.service.findMany({ select: { id: true, updatedAt: true } });
  const reports = await prisma.downtimeReport.findMany({
    select: { id: true, startedAt: true },
    orderBy: { startedAt: 'desc' },
  });

  const urls = [
    { loc: BASE, changefreq: 'hourly', priority: '1.0' },
    { loc: `${BASE}/incidents`, changefreq: 'daily', priority: '0.8' },
    ...reports.map((r) => ({
      loc: `${BASE}/report/${r.id}`,
      changefreq: 'monthly' as const,
      priority: '0.5',
      lastmod: r.startedAt.toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'content-type': 'application/xml' },
  });
};
