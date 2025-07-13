import { NextResponse, userAgent } from 'next/server';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendDiscordWebhook(message) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });
}

export async function middleware(req) {
  const url = new URL(req.url);
  const ua = userAgent(req)?.ua;
  const name = url.searchParams.get('name');

  if (name) {
    await sendDiscordWebhook(`API triggered: ${name}`);
  }

  if (!ua || ua.startsWith('vercel-')) {
    return NextResponse.rewrite(new URL('/vercel.html', req.url));
  }

  return NextResponse.rewrite('https://media.tenor.com/ORLWQWjdWhQAAAAi/discordskull081719-discord.gif');
}
