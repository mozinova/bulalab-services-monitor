const BASE_URL = process.env.STATUS_API_BASE_URL;
const CRON_SECRET = process.env.CRON_SECRET;

if (!BASE_URL || !CRON_SECRET) {
  console.error('Missing STATUS_API_BASE_URL or CRON_SECRET env vars');
  process.exit(1);
}

async function tick() {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] Dialer tick starting...`);

  try {
    const url = `${BASE_URL}/api/cron?cron_secret=${encodeURIComponent(CRON_SECRET as string)}`;
    const res = await fetch(url);

    const body = await res.json();
    const elapsed = Date.now() - start;

    if (res.ok) {
      console.log(`[${new Date().toISOString()}] Dialer tick completed in ${elapsed}ms — ${JSON.stringify(body)}`);
    } else {
      console.error(`[${new Date().toISOString()}] Dialer tick failed (${res.status}) in ${elapsed}ms — ${JSON.stringify(body)}`);
    }
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[${new Date().toISOString()}] Dialer tick error in ${elapsed}ms — ${err}`);
  }
}

tick();
setInterval(tick, 5 * 60 * 1000);
