import type { APIRoute } from 'astro';
import { prisma } from '../../lib/prisma';
import { sendVerificationCode, sendSubscribed } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.emailSubscriber.upsert({
    where: { email },
    update: { code, codeExpires, verified: false },
    create: { email, code, codeExpires },
  });

  try {
    await sendVerificationCode(email, code);
  } catch (err) {
    console.log('Send email error:',err);
    return new Response(
      JSON.stringify({ error: 'Failed to send verification email' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
