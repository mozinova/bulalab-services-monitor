import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { sendSubscribed } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { email, code } = body;

  if (!email || !code) {
    return new Response(JSON.stringify({ error: 'Email and code are required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const subscriber = await prisma.emailSubscriber.findUnique({ where: { email } });

  if (!subscriber) {
    return new Response(JSON.stringify({ error: 'No subscription found for this email' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (subscriber.verified) {
    return new Response(JSON.stringify({ ok: true, message: 'Already verified' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (subscriber.code !== code) {
    return new Response(JSON.stringify({ error: 'Invalid code' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!subscriber.codeExpires || subscriber.codeExpires < new Date()) {
    return new Response(JSON.stringify({ error: 'Code expired. Request a new one.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  await prisma.emailSubscriber.update({
    where: { email },
    data: { verified: true, code: null, codeExpires: null },
  });

  try {
    await sendSubscribed(email);
  } catch {
    // non-fatal
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
