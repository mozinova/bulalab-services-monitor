import type { APIRoute } from 'astro';
import { ServiceMonitor } from '../../lib/serviceMonitor';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const secret = url.searchParams.get('cron_secret');
  const expected = import.meta.env.CRON_SECRET;

  if (!secret || secret !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const monitor = new ServiceMonitor();
  const results = await monitor.checkAll();

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
