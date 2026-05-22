const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@bulalab.com';
const FROM_NAME = process.env.FROM_NAME ?? 'BulaLab Status';

interface SendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendParams) {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.warn('[email] CF_API_TOKEN or CF_ACCOUNT_ID not set — skipping send');
    return;
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to,
        subject,
        html,
        text,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudflare email API error ${res.status}: ${body}`);
  }
}

const templates: Record<string, string> = {
  'verify-code': `<html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="padding:32px"><h1 style="margin:0 0 8px;font-size:20px;color:#111">Verify your email</h1><p style="margin:0 0 24px;font-size:14px;color:#666">Use the code below to subscribe to status updates.</p><div style="background:#f5f5f5;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px"><span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111;font-family:monospace">{{ code }}</span></div><p style="margin:0;font-size:12px;color:#888">This code expires in 15 minutes.</p></td></tr><tr><td style="padding:16px 32px;border-top:1px solid #eee"><p style="margin:0;font-size:11px;color:#999">&copy; {{ year }} BulaLab</p></td></tr></table></td></tr></table></body></html>`,
  'subscribed': `<html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="padding:32px"><h1 style="margin:0 0 8px;font-size:20px;color:#111">You're subscribed</h1><p style="margin:0 0 4px;font-size:14px;color:#666">You'll receive email alerts when a service goes down and when it's resolved.</p><p style="margin:0;font-size:14px;color:#666">No spam — only status changes.</p></td></tr><tr><td style="padding:16px 32px;border-top:1px solid #eee"><p style="margin:0;font-size:11px;color:#999">&copy; {{ year }} BulaLab</p></td></tr></table></td></tr></table></body></html>`,
  'service-down': `<html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="height:4px;background:#ef4444" colspan="2"></td></tr><tr><td style="padding:32px"><div style="width:40px;height:40px;border-radius:10px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><span style="font-size:20px">&#9888;</span></div><h1 style="margin:0 0 4px;font-size:20px;color:#111">{{ service_name }} is down</h1><p style="margin:0 0 20px;font-size:14px;color:#888">{{ started_at }}</p><div style="background:#fef2f2;border-radius:12px;padding:12px 16px;margin-bottom:20px"><p style="margin:0;font-size:13px;color:#dc2626;font-family:monospace">{{ error }}</p></div><p style="margin:0;font-size:13px;color:#666">We're investigating. You'll be notified when it's resolved.</p></td></tr><tr><td style="padding:16px 32px;border-top:1px solid #eee"><p style="margin:0;font-size:11px;color:#999">&copy; {{ year }} BulaLab</p></td></tr></table></td></tr></table></body></html>`,
  'service-resolved': `<html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="height:4px;background:#10b981" colspan="2"></td></tr><tr><td style="padding:32px"><div style="width:40px;height:40px;border-radius:10px;background:#ecfdf5;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><span style="font-size:20px">&#10003;</span></div><h1 style="margin:0 0 4px;font-size:20px;color:#111">{{ service_name }} is back online</h1><p style="margin:0 0 4px;font-size:14px;color:#666">The issue has been resolved.</p><p style="margin:0 0 20px;font-size:14px;color:#888">Duration: {{ duration }}</p><div style="background:#ecfdf5;border-radius:12px;padding:12px 16px;margin-bottom:20px"><p style="margin:0;font-size:13px;color:#059669;font-family:monospace">{{ error }}</p></div><p style="margin:0;font-size:13px;color:#666">All services are operating normally.</p></td></tr><tr><td style="padding:16px 32px;border-top:1px solid #eee"><p style="margin:0;font-size:11px;color:#999">&copy; {{ year }} BulaLab</p></td></tr></table></td></tr></table></body></html>`,
};

function renderTemplate(name: string, vars: Record<string, string>): string {
  let html = templates[name];
  if (!html) throw new Error(`Template not found: ${name}`);
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{ ${key} }}`, value);
  }
  return html;
}

export async function sendVerificationCode(email: string, code: string) {
  const html = renderTemplate('verify-code', {
    code,
    year: String(new Date().getFullYear()),
  });

  await sendEmail({
    to: email,
    subject: 'Verify your email — BulaLab Status',
    html,
    text: `Your verification code is: ${code}. It expires in 15 minutes.`,
  });
}

export async function sendSubscribed(email: string) {
  const html = renderTemplate('subscribed', {
    year: String(new Date().getFullYear()),
  });

  await sendEmail({
    to: email,
    subject: "You're subscribed — BulaLab Status",
    html,
    text: "You'll receive email alerts when a service goes down and when it's resolved.",
  });
}

export async function sendServiceDown(
  email: string,
  serviceName: string,
  startedAt: string,
  error: string,
) {
  const html = renderTemplate('service-down', {
    service_name: serviceName,
    started_at: startedAt,
    error,
    year: String(new Date().getFullYear()),
  });

  await sendEmail({
    to: email,
    subject: `[DOWN] ${serviceName} is experiencing issues`,
    html,
    text: `${serviceName} is down since ${startedAt}. Error: ${error}`,
  });
}

export async function sendServiceResolved(
  email: string,
  serviceName: string,
  duration: string,
  error: string,
) {
  const html = renderTemplate('service-resolved', {
    service_name: serviceName,
    duration,
    error,
    year: String(new Date().getFullYear()),
  });

  await sendEmail({
    to: email,
    subject: `[RESOLVED] ${serviceName} is back online`,
    html,
    text: `${serviceName} is back online after ${duration}. Error: ${error}`,
  });
}
