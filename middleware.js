import { NextResponse, userAgent } from 'next/server';

async function sendDiscordWebhook(message, url) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });
}

export async function middleware(req) {
  const url = new URL(req.url);
  const ua = userAgent(req)?.ua;
  const name = url.searchParams.get('name');
  const type = url.searchParams.get('type');

  if (name && type) {
    const envKey = `${type.toUpperCase()}_WEBHOOK_URL`;
    const webhookUrl = process.env[envKey];

    if (webhookUrl) {
      await sendDiscordWebhook(`View logger triggered, name ${name}`, webhookUrl);
    } else {
      console.warn(`Webhook URL not found for env key: ${envKey}`);
    }
  }

  if (!ua || ua.startsWith('vercel-')) {
    return NextResponse.rewrite(new URL('/vercel.html', req.url));
  }

  return NextResponse.rewrite('https://media.tenor.com/ORLWQWjdWhQAAAAi/discordskull081719-discord.gif');
}
